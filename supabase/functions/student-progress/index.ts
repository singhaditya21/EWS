// A signed-in student (token from student-session) saves their progress into their class row.
import { fail, handlePreflight, json, readJsonBody } from '../_shared/cors.ts';
import { studentTokenSecret, verifyStudentToken } from '../_shared/hmac.ts';
import { adminClient } from '../_shared/supabase.ts';

const MAX_DATA_BYTES = 200 * 1024; // contract: reject progress payloads over 200 KB
const MAX_BODY_BYTES = MAX_DATA_BYTES + 4 * 1024; // room for the token and JSON wrapper

Deno.serve(async (req) => {
  const early = handlePreflight(req);
  if (early) return early;

  try {
    const secret = studentTokenSecret();
    if (!secret) return fail(req, 503, 'Class sign-in is not set up yet');

    const body = await readJsonBody(req, MAX_BODY_BYTES);
    if (body instanceof Response) return body;

    if (typeof body.token !== 'string' || !body.token) return fail(req, 401, 'Please sign in to your class again');
    const data = body.data;
    if (!data || typeof data !== 'object' || Array.isArray(data)) return fail(req, 400, 'data must be an object');
    const serialized = JSON.stringify(data);
    if (new TextEncoder().encode(serialized).length > MAX_DATA_BYTES) return fail(req, 413, 'Progress is too large');

    const claims = await verifyStudentToken(body.token, secret);
    if (!claims) return fail(req, 401, 'Please sign in to your class again');

    const { data: rows, error } = await adminClient()
      .from('class_students')
      .update({ progress: data })
      .eq('id', claims.sid)
      .eq('class_id', claims.cid)
      .select('updated_at');
    if (error) throw new Error(`update: ${error.code}`);
    // The teacher may have removed the child or the class since the token was issued.
    if (!rows || rows.length === 0) return fail(req, 404, 'Student not found');

    return json(req, { ok: true, updated_at: rows[0].updated_at });
  } catch (e) {
    console.error('student-progress error:', (e as Error).message);
    return fail(req, 500, 'Could not save progress. It is still on this device.');
  }
});
