// Public: a child signs in with class code + their name + their secret pictures.
// Returns a 12-hour signed token (no account, no JWT) plus their saved progress and assignments.
import { UUID_RE, fail, handlePreflight, json, normaliseClassCode, readJsonBody } from '../_shared/cors.ts';
import {
  STUDENT_TOKEN_TTL_SECONDS,
  sha256Hex,
  signStudentToken,
  studentTokenSecret,
  timingSafeEqualStr,
} from '../_shared/hmac.ts';
import { adminClient, clientIpHash, maybePurgeRateLimits } from '../_shared/supabase.ts';

const MAX_FAILED_TRIES = 10; // per student per 15 minutes (contract)
const MAX_FAILED_CODES = 30; // per IP per 15 minutes, same as class-roster
const WINDOW_MS = 15 * 60 * 1000;

Deno.serve(async (req) => {
  const early = handlePreflight(req);
  if (early) return early;

  try {
    const secret = studentTokenSecret();
    if (!secret) {
      console.error('student-session: STUDENT_TOKEN_SECRET missing or shorter than 32 characters');
      return fail(req, 503, 'Class sign-in is not set up yet');
    }

    const body = await readJsonBody(req, 2 * 1024);
    if (body instanceof Response) return body;
    const code = normaliseClassCode(body.class_code);
    if (!code) return fail(req, 400, 'Class codes are 6 letters and numbers');
    const studentId = body.student_id;
    if (typeof studentId !== 'string' || !UUID_RE.test(studentId)) return fail(req, 400, 'student_id is required');
    const picture = body.picture;
    if (typeof picture !== 'string' || picture.length < 1 || picture.length > 64) {
      return fail(req, 400, 'picture is required');
    }

    const db = adminClient();
    const since = new Date(Date.now() - WINDOW_MS).toISOString();

    const ipHash = await clientIpHash(req, secret);
    const { count: ipFails, error: ipErr } = await db
      .from('class_code_attempts')
      .select('id', { count: 'exact', head: true })
      .eq('ip_hash', ipHash)
      .gte('attempted_at', since);
    if (ipErr) throw new Error(`ip attempts: ${ipErr.code}`);
    if ((ipFails ?? 0) >= MAX_FAILED_CODES) return fail(req, 429, 'Too many tries. Please wait 15 minutes.');

    const { data: cls, error: clsErr } = await db
      .from('classes')
      .select('id, board, teacher_id, consent_confirmed')
      .eq('class_code', code)
      .maybeSingle();
    if (clsErr) throw new Error(`class lookup: ${clsErr.code}`);
    if (!cls) {
      await db.from('class_code_attempts').insert({ ip_hash: ipHash });
      return fail(req, 404, 'No class with that code');
    }
    if (!cls.consent_confirmed) return fail(req, 403, 'This class is not open yet. Ask your teacher.');
    const { data: plan, error: planErr } = await db.rpc('plan_for_user', { uid: cls.teacher_id });
    if (planErr) throw new Error(`plan: ${planErr.code}`);
    if (plan !== 'classroom' && plan !== 'school') return fail(req, 403, 'This class is paused. Ask your teacher.');

    const { data: student, error: stuErr } = await db
      .from('class_students')
      .select('id, display_name, avatar, picture_hash, progress')
      .eq('id', studentId)
      .eq('class_id', cls.id)
      .maybeSingle();
    if (stuErr) throw new Error(`student lookup: ${stuErr.code}`);
    if (!student) return fail(req, 404, 'Student not found in this class');

    const { count: fails, error: failErr } = await db
      .from('student_login_attempts')
      .select('id', { count: 'exact', head: true })
      .eq('student_id', student.id)
      .gte('attempted_at', since);
    if (failErr) throw new Error(`attempts count: ${failErr.code}`);
    if ((fails ?? 0) >= MAX_FAILED_TRIES) {
      return fail(req, 429, 'Too many tries. Ask your teacher, or wait 15 minutes.');
    }

    if (!student.picture_hash) return fail(req, 403, 'Ask your teacher to set your secret pictures.');

    // Same formula as SQL picture_hash(): sha256(class_id || ':' || picture), hex.
    const hash = await sha256Hex(`${cls.id}:${picture}`);
    if (!timingSafeEqualStr(hash, student.picture_hash)) {
      await db.from('student_login_attempts').insert({ student_id: student.id });
      await maybePurgeRateLimits();
      return fail(req, 401, "Those pictures don't match. Try again.");
    }

    // Success: clear this child's failed tries.
    await db.from('student_login_attempts').delete().eq('student_id', student.id);

    const { data: assignments, error: asgErr } = await db
      .from('assignments')
      .select('chapter_id, due_on')
      .eq('class_id', cls.id)
      .order('due_on', { ascending: true, nullsFirst: false })
      .order('created_at', { ascending: true });
    if (asgErr) throw new Error(`assignments: ${asgErr.code}`);

    const token = await signStudentToken(
      { sid: student.id, cid: cls.id, exp: Math.floor(Date.now() / 1000) + STUDENT_TOKEN_TTL_SECONDS },
      secret
    );

    return json(req, {
      token,
      student: {
        id: student.id,
        display_name: student.display_name,
        avatar: student.avatar,
        progress: student.progress ?? {},
      },
      assignments: assignments ?? [],
      board: cls.board,
    });
  } catch (e) {
    console.error('student-session error:', (e as Error).message);
    return fail(req, 500, 'Something went wrong. Please try again.');
  }
});
