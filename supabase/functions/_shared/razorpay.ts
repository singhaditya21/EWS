// Minimal Razorpay REST client (basic auth with key id + secret). Never log the credentials or
// full responses; Razorpay error codes are enough to debug.

const API = 'https://api.razorpay.com/v1';

export interface RazorpaySubscription {
  id: string;
  status: string;
  current_end?: number | null;
  quantity?: number;
}

export interface RazorpayResult<T> {
  ok: boolean;
  status: number;
  data: T | null;
}

export const razorpayKeys = (): { keyId: string; keySecret: string } | null => {
  const keyId = Deno.env.get('RAZORPAY_KEY_ID');
  const keySecret = Deno.env.get('RAZORPAY_KEY_SECRET');
  return keyId && keySecret ? { keyId, keySecret } : null;
};

export async function razorpayPost<T>(path: string, body: unknown): Promise<RazorpayResult<T>> {
  const keys = razorpayKeys();
  if (!keys) return { ok: false, status: 0, data: null };
  const res = await fetch(`${API}${path}`, {
    method: 'POST',
    headers: {
      Authorization: `Basic ${btoa(`${keys.keyId}:${keys.keySecret}`)}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  });
  let data: unknown = null;
  try {
    data = await res.json();
  } catch {
    data = null;
  }
  if (!res.ok) {
    const code = (data as { error?: { code?: string } } | null)?.error?.code ?? 'unknown';
    // Path is safe to log; ids in it are not secrets.
    console.error(`Razorpay POST ${path} failed: HTTP ${res.status} ${code}`);
    return { ok: false, status: res.status, data: null };
  }
  return { ok: true, status: res.status, data: data as T };
}

/** Statuses after which a subscription can't be cancelled or charged again. */
export const FINAL_STATUSES = ['cancelled', 'completed', 'expired'];

export const KNOWN_STATUSES = [
  'created',
  'authenticated',
  'active',
  'pending',
  'halted',
  'cancelled',
  'completed',
  'expired',
  'paused',
];

export const unixToIso = (v: unknown): string | null =>
  typeof v === 'number' && Number.isFinite(v) && v > 0 ? new Date(v * 1000).toISOString() : null;
