// Razorpay subscription webhooks. Verifies X-Razorpay-Signature (HMAC-SHA256 of the RAW body)
// before trusting anything, then updates the matching subscriptions row.
//
// Idempotent: replaying an event writes the same values. Out-of-order deliveries are ignored
// using the event's own `created_at` (stored in subscriptions.last_event_at).
import { fail, handlePreflight, json } from '../_shared/cors.ts';
import { hmacSha256, timingSafeEqualStr, toHex } from '../_shared/hmac.ts';
import { adminClient } from '../_shared/supabase.ts';
import { unixToIso } from '../_shared/razorpay.ts';

const STATUS_FOR_EVENT: Record<string, string> = {
  'subscription.authenticated': 'authenticated',
  'subscription.activated': 'active',
  'subscription.charged': 'active',
  'subscription.pending': 'pending',
  'subscription.halted': 'halted',
  'subscription.cancelled': 'cancelled',
  'subscription.completed': 'completed',
};

const MAX_BODY = 1024 * 1024;

Deno.serve(async (req) => {
  const early = handlePreflight(req);
  if (early) return early;

  const secret = Deno.env.get('RAZORPAY_WEBHOOK_SECRET');
  if (!secret) {
    console.error('razorpay-webhook: RAZORPAY_WEBHOOK_SECRET is not set');
    return fail(req, 500, 'Webhook not configured');
  }

  // Signature must be computed over the exact bytes Razorpay sent, so read text, not json().
  const raw = await req.text();
  if (raw.length > MAX_BODY) return fail(req, 413, 'Payload too large');
  const signature = (req.headers.get('x-razorpay-signature') ?? '').trim().toLowerCase();
  const expected = toHex(await hmacSha256(secret, raw));
  if (!signature || !timingSafeEqualStr(signature, expected)) return fail(req, 401, 'Invalid signature');

  let event: {
    event?: string;
    created_at?: number;
    payload?: { subscription?: { entity?: { id?: string; current_end?: number | null; quantity?: number } } };
  };
  try {
    event = JSON.parse(raw);
  } catch {
    return fail(req, 400, 'Invalid JSON');
  }

  const name = typeof event.event === 'string' ? event.event : '';
  const status = STATUS_FOR_EVENT[name];
  if (!status) return json(req, { ignored: true }); // Not a subscription event we track.

  const entity = event.payload?.subscription?.entity;
  const rzpId = entity?.id;
  if (typeof rzpId !== 'string' || !/^sub_[A-Za-z0-9]+$/.test(rzpId)) return fail(req, 400, 'Missing subscription id');

  const eventAt = unixToIso(event.created_at) ?? new Date().toISOString();

  try {
    const db = adminClient();
    const { data: row, error } = await db
      .from('subscriptions')
      .select('id, status, last_event_at')
      .eq('razorpay_subscription_id', rzpId)
      .maybeSingle();
    if (error) throw new Error(`lookup: ${error.code}`);
    // Created elsewhere (e.g. in the dashboard): acknowledge so Razorpay stops retrying.
    if (!row) return json(req, { ignored: true });
    if (row.last_event_at && Date.parse(eventAt) < Date.parse(row.last_event_at)) {
      return json(req, { ignored: true, reason: 'stale' });
    }

    const patch: Record<string, unknown> = { last_event_at: eventAt };
    // `authenticated` and `activated` can share a timestamp; never step back from a later state.
    patch.status = status === 'authenticated' && !['created', 'authenticated'].includes(row.status) ? row.status : status;
    const periodEnd = unixToIso(entity?.current_end);
    if (periodEnd) patch.current_period_end = periodEnd;
    if (typeof entity?.quantity === 'number' && Number.isInteger(entity.quantity) && entity.quantity >= 1) {
      patch.seats = entity.quantity;
    }

    // Conditional on last_event_at so two concurrent deliveries can't apply an older one last.
    const { error: updErr } = await db
      .from('subscriptions')
      .update(patch)
      .eq('id', row.id)
      .or(`last_event_at.is.null,last_event_at.lte."${eventAt}"`);
    if (updErr) throw new Error(`update: ${updErr.code}`);

    return json(req, { ok: true });
  } catch (e) {
    // 500 makes Razorpay retry later.
    console.error('razorpay-webhook error:', (e as Error).message);
    return fail(req, 500, 'Could not process event');
  }
});
