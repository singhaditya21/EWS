// Public: class code -> class name, board and the children's display names/avatars, so a child
// can tap their own name. No progress, no picture hashes. The class code is the only secret, so
// failed lookups are rate-limited per (hashed) IP to stop code guessing.
import { fail, handlePreflight, json, normaliseClassCode, readJsonBody } from '../_shared/cors.ts';
import { adminClient, clientIpHash, maybePurgeRateLimits } from '../_shared/supabase.ts';

const MAX_FAILED_LOOKUPS = 30; // per IP per 15 minutes; a school shares one IP, so not too low
const WINDOW_MS = 15 * 60 * 1000;

Deno.serve(async (req) => {
  const early = handlePreflight(req);
  if (early) return early;

  try {
    const body = await readJsonBody(req, 1024);
    if (body instanceof Response) return body;
    const code = normaliseClassCode(body.class_code);
    if (!code) return fail(req, 400, 'Class codes are 6 letters and numbers');

    const db = adminClient();
    const ipHash = await clientIpHash(req, Deno.env.get('STUDENT_TOKEN_SECRET') ?? '');
    const since = new Date(Date.now() - WINDOW_MS).toISOString();
    const { count, error: countErr } = await db
      .from('class_code_attempts')
      .select('id', { count: 'exact', head: true })
      .eq('ip_hash', ipHash)
      .gte('attempted_at', since);
    if (countErr) throw new Error(`attempts count: ${countErr.code}`);
    if ((count ?? 0) >= MAX_FAILED_LOOKUPS) return fail(req, 429, 'Too many tries. Please wait 15 minutes.');

    const { data: cls, error } = await db
      .from('classes')
      .select('id, name, board, teacher_id, consent_confirmed')
      .eq('class_code', code)
      .maybeSingle();
    if (error) throw new Error(`class lookup: ${error.code}`);
    if (!cls) {
      await db.from('class_code_attempts').insert({ ip_hash: ipHash });
      await maybePurgeRateLimits();
      return fail(req, 404, 'No class with that code');
    }
    if (!cls.consent_confirmed) return fail(req, 403, 'This class is not open yet. Ask your teacher.');

    // A lapsed teacher plan pauses the class (data is kept; the teacher can renew or delete).
    const { data: plan, error: planErr } = await db.rpc('plan_for_user', { uid: cls.teacher_id });
    if (planErr) throw new Error(`plan: ${planErr.code}`);
    if (plan !== 'classroom' && plan !== 'school') return fail(req, 403, 'This class is paused. Ask your teacher.');

    const { data: students, error: stuErr } = await db
      .from('class_students')
      .select('id, display_name, avatar')
      .eq('class_id', cls.id)
      .order('display_name');
    if (stuErr) throw new Error(`students: ${stuErr.code}`);

    return json(req, { class_id: cls.id, class_name: cls.name, board: cls.board, students: students ?? [] });
  } catch (e) {
    console.error('class-roster error:', (e as Error).message);
    return fail(req, 500, 'Something went wrong. Please try again.');
  }
});
