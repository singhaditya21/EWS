// HMAC-SHA256, SHA-256 and the student session token, all on Web Crypto (crypto.subtle).

const enc = new TextEncoder();
const dec = new TextDecoder();

export async function hmacSha256(secret: string, message: string): Promise<Uint8Array> {
  const key = await crypto.subtle.importKey('raw', enc.encode(secret), { name: 'HMAC', hash: 'SHA-256' }, false, [
    'sign',
  ]);
  return new Uint8Array(await crypto.subtle.sign('HMAC', key, enc.encode(message)));
}

export async function sha256Hex(text: string): Promise<string> {
  return toHex(new Uint8Array(await crypto.subtle.digest('SHA-256', enc.encode(text))));
}

export const toHex = (bytes: Uint8Array): string => Array.from(bytes, (b) => b.toString(16).padStart(2, '0')).join('');

/** Constant-time comparison: the loop always runs over the full length. */
export function timingSafeEqual(a: Uint8Array, b: Uint8Array): boolean {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= a[i] ^ b[i];
  return diff === 0;
}

export const timingSafeEqualStr = (a: string, b: string): boolean => timingSafeEqual(enc.encode(a), enc.encode(b));

export function base64UrlEncode(bytes: Uint8Array): string {
  let bin = '';
  for (const b of bytes) bin += String.fromCharCode(b);
  return btoa(bin).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

export function base64UrlDecode(text: string): Uint8Array | null {
  if (!/^[A-Za-z0-9_-]*$/.test(text)) return null;
  try {
    const b64 = text.replace(/-/g, '+').replace(/_/g, '/') + '='.repeat((4 - (text.length % 4)) % 4);
    return Uint8Array.from(atob(b64), (c) => c.charCodeAt(0));
  } catch {
    return null;
  }
}

// --- Student session token -------------------------------------------------------------------
// token = base64url(JSON{sid, cid, exp}) + '.' + base64url(HMAC-SHA256(payloadPart, secret))

export interface StudentClaims {
  sid: string; // class_students.id
  cid: string; // classes.id
  exp: number; // unix seconds
}

export const STUDENT_TOKEN_TTL_SECONDS = 12 * 60 * 60;

/** STUDENT_TOKEN_SECRET, or null when missing/too short to be safe. */
export function studentTokenSecret(): string | null {
  const s = Deno.env.get('STUDENT_TOKEN_SECRET') ?? '';
  return s.length >= 32 ? s : null;
}

export async function signStudentToken(claims: StudentClaims, secret: string): Promise<string> {
  const payload = base64UrlEncode(enc.encode(JSON.stringify(claims)));
  const sig = base64UrlEncode(await hmacSha256(secret, payload));
  return `${payload}.${sig}`;
}

export async function verifyStudentToken(token: string, secret: string): Promise<StudentClaims | null> {
  if (token.length > 1024) return null;
  const parts = token.split('.');
  if (parts.length !== 2) return null;
  const [payload, sigPart] = parts;
  const sig = base64UrlDecode(sigPart);
  if (!sig) return null;
  const expected = await hmacSha256(secret, payload);
  if (!timingSafeEqual(sig, expected)) return null;
  const raw = base64UrlDecode(payload);
  if (!raw) return null;
  try {
    const c = JSON.parse(dec.decode(raw)) as Partial<StudentClaims>;
    if (typeof c.sid !== 'string' || typeof c.cid !== 'string' || typeof c.exp !== 'number') return null;
    if (c.exp * 1000 <= Date.now()) return null;
    return { sid: c.sid, cid: c.cid, exp: c.exp };
  } catch {
    return null;
  }
}
