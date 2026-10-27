// Service-role client and caller lookup. The service role bypasses RLS, so every function must
// do its own authorisation before touching data.
import { createClient, type SupabaseClient, type User } from 'npm:@supabase/supabase-js@2';

let admin: SupabaseClient | null = null;

/** Service-role client. SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are injected by Supabase. */
export function adminClient(): SupabaseClient {
  if (admin) return admin;
  const url = Deno.env.get('SUPABASE_URL');
  const key = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
  if (!url || !key) throw new Error('SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY are not set');
  admin = createClient(url, key, { auth: { persistSession: false, autoRefreshToken: false } });
  return admin;
}

/** The signed-in user behind the request's `Authorization: Bearer <jwt>`, or null. */
export async function getCaller(req: Request): Promise<User | null> {
  const header = req.headers.get('Authorization') ?? '';
  const match = /^Bearer\s+(.+)$/i.exec(header);
  if (!match) return null;
  const { data, error } = await adminClient().auth.getUser(match[1]);
  if (error || !data.user) return null;
  return data.user;
}

/** Client IP (first X-Forwarded-For hop), salted and hashed so no raw IPs are stored. */
export async function clientIpHash(req: Request, salt: string): Promise<string> {
  const ip = (req.headers.get('x-forwarded-for') ?? '').split(',')[0].trim() || req.headers.get('x-real-ip') || 'unknown';
  const data = new TextEncoder().encode(`${salt}:${ip}`);
  const digest = new Uint8Array(await crypto.subtle.digest('SHA-256', data));
  return Array.from(digest.slice(0, 16), (b) => b.toString(16).padStart(2, '0')).join('');
}

/** Occasionally clears old rate-limit rows so the tables stay small without a cron job. */
export async function maybePurgeRateLimits(): Promise<void> {
  if (Math.random() >= 0.05) return;
  const { error } = await adminClient().rpc('purge_rate_limit_attempts');
  if (error) console.error('purge_rate_limit_attempts failed:', error.code);
}
