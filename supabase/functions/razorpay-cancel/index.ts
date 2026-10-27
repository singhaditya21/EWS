// Cancels a subscription the caller owns (or their school's). Active subscriptions are cancelled
// at the end of the paid cycle, so access continues until current_period_end; the webhook marks
// the row cancelled/completed when Razorpay does.
import { fail, handlePreflight, json, readJsonBody } from '../_shared/cors.ts';
import { adminClient, getCaller } from '../_shared/supabase.ts';
import {
  FINAL_STATUSES,
  KNOWN_STATUSES,
  razorpayKeys,
  razorpayPost,
  type RazorpaySubscription,
  unixToIso,
} from '../_shared/razorpay.ts';

Deno.serve(async (req) => {
  const early = handlePreflight(req);
  if (early) return early;

  try {
    const user = await getCaller(req);
    if (!user) return fail(req, 401, 'Please sign in first');

    const body = await readJsonBody(req, 2 * 1024);
    if (body instanceof Response) return body;
    const rzpId = body.subscription_id;
    if (typeof rzpId !== 'string' || !/^sub_[A-Za-z0-9]{1,40}$/.test(rzpId)) {
      return fail(req, 400, 'subscription_id is required');
    }
    if (!razorpayKeys()) return fail(req, 503, 'Payments are not set up yet');

    const db = adminClient();
    const { data: sub, error } = await db
      .from('subscriptions')
      .select('id, owner_user_id, school_id, status, current_period_end, cancel_at_period_end')
      .eq('razorpay_subscription_id', rzpId)
      .maybeSingle();
    if (error) throw new Error(`lookup: ${error.code}`);
    if (!sub) return fail(req, 404, 'Subscription not found');

    let allowed = sub.owner_user_id === user.id;
    if (!allowed && sub.school_id) {
      const [{ data: school }, { data: member }] = await Promise.all([
        db.from('schools').select('admin_user_id').eq('id', sub.school_id).maybeSingle(),
        db
          .from('school_members')
          .select('role')
          .eq('school_id', sub.school_id)
          .eq('user_id', user.id)
          .maybeSingle(),
      ]);
      allowed = school?.admin_user_id === user.id || member?.role === 'admin';
    }
    if (!allowed) return fail(req, 403, 'You can only cancel your own subscription');

    if (FINAL_STATUSES.includes(sub.status)) {
      return json(req, {
        status: sub.status,
        current_period_end: sub.current_period_end,
        cancel_at_period_end: sub.cancel_at_period_end,
      });
    }

    // Only an active subscription has a paid cycle to run out; anything else (never paid,
    // payment failing) is cancelled straight away.
    const atCycleEnd = sub.status === 'active';
    const rzp = await razorpayPost<RazorpaySubscription>(`/subscriptions/${rzpId}/cancel`, {
      cancel_at_cycle_end: atCycleEnd ? 1 : 0,
    });
    if (!rzp.ok || !rzp.data) return fail(req, 502, 'Could not cancel with Razorpay. Please try again.');

    const status = KNOWN_STATUSES.includes(rzp.data.status) ? rzp.data.status : sub.status;
    const periodEnd = unixToIso(rzp.data.current_end) ?? sub.current_period_end;
    const { error: updErr } = await db
      .from('subscriptions')
      .update({ status, current_period_end: periodEnd, cancel_at_period_end: atCycleEnd })
      .eq('id', sub.id);
    if (updErr) throw new Error(`update: ${updErr.code}`);

    return json(req, { status, current_period_end: periodEnd, cancel_at_period_end: atCycleEnd });
  } catch (e) {
    console.error('razorpay-cancel error:', (e as Error).message);
    return fail(req, 500, 'Something went wrong. Please try again.');
  }
});
