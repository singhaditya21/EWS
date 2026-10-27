// CORS + small JSON helpers shared by every function.
//
// APP_ORIGIN may be one origin or a comma-separated list (e.g. production + preview). When it
// is unset (local development) any origin is allowed.

const allowedOrigins = (Deno.env.get('APP_ORIGIN') ?? '')
  .split(',')
  .map((o) => o.trim().replace(/\/$/, ''))
  .filter(Boolean);

export function corsHeaders(req: Request): Record<string, string> {
  const origin = req.headers.get('origin') ?? '';
  let allow = '*';
  if (allowedOrigins.length) allow = allowedOrigins.includes(origin) ? origin : allowedOrigins[0];
  return {
    'Access-Control-Allow-Origin': allow,
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Max-Age': '86400',
    Vary: 'Origin',
  };
}

export function json(req: Request, body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders(req), 'Content-Type': 'application/json; charset=utf-8' },
  });
}

export const fail = (req: Request, status: number, error: string): Response => json(req, { error }, status);

/** Answers CORS preflight and rejects anything that isn't POST. Returns null to continue. */
export function handlePreflight(req: Request): Response | null {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders(req) });
  if (req.method !== 'POST') return fail(req, 405, 'Method not allowed');
  return null;
}

export type Body = Record<string, unknown>;

/**
 * Reads a JSON object body, refusing anything larger than maxBytes. Returns a Response on
 * failure so callers can `if (body instanceof Response) return body;`.
 */
export async function readJsonBody(req: Request, maxBytes: number): Promise<Body | Response> {
  const declared = Number(req.headers.get('content-length') ?? '0');
  if (declared > maxBytes) return fail(req, 413, 'Request is too large');
  const raw = await req.text();
  if (new TextEncoder().encode(raw).length > maxBytes) return fail(req, 413, 'Request is too large');
  if (!raw.trim()) return {};
  try {
    const parsed = JSON.parse(raw);
    if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) return fail(req, 400, 'Body must be a JSON object');
    return parsed as Body;
  } catch {
    return fail(req, 400, 'Body must be valid JSON');
  }
}

/** Class codes: 6 characters, no 0/O/1/I. */
export const CLASS_CODE_RE = /^[A-HJ-NP-Z2-9]{6}$/;
export const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export const normaliseClassCode = (v: unknown): string | null => {
  if (typeof v !== 'string') return null;
  const code = v.trim().toUpperCase();
  return CLASS_CODE_RE.test(code) ? code : null;
};
