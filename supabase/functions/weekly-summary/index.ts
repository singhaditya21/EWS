// Weekly email to parents on a plan with weeklySummary (Family, Family Plus). Called by pg_cron
// with `Authorization: Bearer <CRON_SECRET>`. Stats come from child_progress.data.activity.
// Children whose consent was revoked (or never recorded) are left out.
import { fail, handlePreflight, json } from '../_shared/cors.ts';
import { timingSafeEqualStr } from '../_shared/hmac.ts';
import { adminClient } from '../_shared/supabase.ts';

const WEEK_MS = 7 * 24 * 60 * 60 * 1000;
const CONCURRENCY = 4;

interface ActivityEntry {
  at?: unknown;
  kind?: unknown;
  correct?: unknown;
}

interface ChildStats {
  name: string;
  questions: number;
  right: number;
  stars: number;
  lessons: number;
}

const escapeHtml = (s: string) =>
  s.replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]!);

function weekStats(name: string, data: unknown, since: number): ChildStats {
  const stats: ChildStats = { name, questions: 0, right: 0, stars: 0, lessons: 0 };
  const activity = (data as { activity?: unknown } | null)?.activity;
  if (!Array.isArray(activity)) return stats;
  for (const raw of activity as ActivityEntry[]) {
    if (!raw || typeof raw !== 'object' || typeof raw.at !== 'string') continue;
    const at = Date.parse(raw.at);
    if (!Number.isFinite(at) || at < since) continue;
    if ((raw.kind === 'quiz' || raw.kind === 'practice') && typeof raw.correct === 'boolean') {
      stats.questions++;
      if (raw.correct) stats.right++;
    } else if (raw.kind === 'star') stats.stars++;
    else if (raw.kind === 'complete') stats.lessons++;
  }
  return stats;
}

const hasActivity = (s: ChildStats) => s.questions + s.stars + s.lessons > 0;
const percent = (s: ChildStats) => (s.questions ? `${Math.round((s.right / s.questions) * 100)}%` : '–');

function renderEmail(children: ChildStats[]): { html: string; text: string } {
  const rows = children
    .map(
      (c) =>
        `<tr><td style="padding:6px 10px">${escapeHtml(c.name)}</td>` +
        `<td style="padding:6px 10px;text-align:right">${c.questions}</td>` +
        `<td style="padding:6px 10px;text-align:right">${percent(c)}</td>` +
        `<td style="padding:6px 10px;text-align:right">${c.stars}</td>` +
        `<td style="padding:6px 10px;text-align:right">${c.lessons}</td></tr>`
    )
    .join('');
  const html =
    `<div style="font-family:system-ui,sans-serif;color:#1f2937">` +
    `<h2 style="margin:0 0 12px">This week's learning</h2>` +
    `<p>Here is what happened in the last 7 days.</p>` +
    `<table style="border-collapse:collapse;border:1px solid #e5e7eb">` +
    `<thead><tr style="background:#f3f4f6"><th style="padding:6px 10px;text-align:left">Child</th>` +
    `<th style="padding:6px 10px">Questions</th><th style="padding:6px 10px">Right</th>` +
    `<th style="padding:6px 10px">Stars</th><th style="padding:6px 10px">Lessons finished</th></tr></thead>` +
    `<tbody>${rows}</tbody></table>` +
    `<p style="color:#6b7280;font-size:12px;margin-top:16px">You get this because weekly summaries are part of your plan. ` +
    `Open the app's account page to manage your children's data.</p></div>`;
  const text =
    "This week's learning (last 7 days)\n\n" +
    children
      .map((c) => `${c.name}: ${c.questions} questions, ${percent(c)} right, ${c.stars} stars, ${c.lessons} lessons finished`)
      .join('\n');
  return { html, text };
}

Deno.serve(async (req) => {
  const early = handlePreflight(req);
  if (early) return early;

  const cronSecret = Deno.env.get('CRON_SECRET');
  if (!cronSecret) return fail(req, 503, 'CRON_SECRET is not set');
  const auth = req.headers.get('Authorization') ?? '';
  if (!timingSafeEqualStr(auth, `Bearer ${cronSecret}`)) return fail(req, 401, 'Unauthorized');

  const resendKey = Deno.env.get('RESEND_API_KEY');
  const from = Deno.env.get('SUMMARY_FROM_EMAIL');
  if (!resendKey || !from) return json(req, { skipped: true, reason: 'email not configured' });

  try {
    const db = adminClient();
    const { data: recipients, error } = await db.rpc('weekly_summary_recipients');
    if (error) throw new Error(`recipients: ${error.code}`);
    const list = (recipients ?? []) as { user_id: string; email: string }[];
    const since = Date.now() - WEEK_MS;
    let sent = 0;
    let skipped = 0;
    let failed = 0;

    const processOne = async (r: { user_id: string; email: string }) => {
      const { data: kids, error: kidsErr } = await db
        .from('children')
        .select('id, name, child_progress(data), consents(revoked_at)')
        .eq('parent_id', r.user_id)
        .order('created_at');
      if (kidsErr) throw new Error(`children: ${kidsErr.code}`);

      const stats = (kids ?? [])
        .filter((k) => Array.isArray(k.consents) && k.consents.some((c: { revoked_at: string | null }) => !c.revoked_at))
        .map((k) => {
          // child_progress is one-to-one (child_id is its primary key); PostgREST may return an object or array.
          const cp = k.child_progress as unknown;
          const data = Array.isArray(cp) ? cp[0]?.data : (cp as { data?: unknown } | null)?.data;
          return weekStats(k.name, data ?? null, since);
        });
      // Don't email about a quiet week.
      if (!stats.some(hasActivity)) {
        skipped++;
        return;
      }

      const { html, text } = renderEmail(stats);
      const res = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: { Authorization: `Bearer ${resendKey}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ from, to: [r.email], subject: "This week's learning summary", html, text }),
      });
      if (res.ok) sent++;
      else {
        failed++;
        console.error(`weekly-summary: Resend HTTP ${res.status}`); // no addresses in logs
      }
      await res.body?.cancel();
    };

    for (let i = 0; i < list.length; i += CONCURRENCY) {
      const batch = list.slice(i, i + CONCURRENCY);
      const results = await Promise.allSettled(batch.map(processOne));
      for (const r of results) {
        if (r.status === 'rejected') {
          failed++;
          console.error('weekly-summary parent failed:', (r.reason as Error)?.message);
        }
      }
    }

    return json(req, { recipients: list.length, sent, skipped, failed });
  } catch (e) {
    console.error('weekly-summary error:', (e as Error).message);
    return fail(req, 500, 'Weekly summary failed');
  }
});
