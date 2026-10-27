// Erases the caller's account and everything hanging off it (DPDP right to erasure):
// children, consents, synced progress, classes, students, assignments, subscriptions, and a school
// they run alone. Cascading foreign keys do the actual deleting.
import { fail, handlePreflight, json } from '../_shared/cors.ts';
import { adminClient, getCaller } from '../_shared/supabase.ts';
import { razorpayKeys, razorpayPost } from '../_shared/razorpay.ts';

// Subscriptions Razorpay could still charge.
const CHARGEABLE = ['created', 'authenticated', 'active', 'pending', 'halted', 'paused'];

Deno.serve(async (req) => {
  const early = handlePreflight(req);
  if (early) return early;

  try {
    const user = await getCaller(req);
    if (!user) return fail(req, 401, 'Please sign in first');
    const db = adminClient();

    // A school admin can't take the school (and its teachers' plan) down with them.
    const { data: schools, error: schoolErr } = await db.from('schools').select('id').eq('admin_user_id', user.id);
    if (schoolErr) throw new Error(`schools: ${schoolErr.code}`);
    for (const school of schools ?? []) {
      const { count, error } = await db
        .from('school_members')
        .select('user_id', { count: 'exact', head: true })
        .eq('school_id', school.id)
        .neq('user_id', user.id);
      if (error) throw new Error(`members: ${error.code}`);
      if ((count ?? 0) > 0) {
        return fail(
          req,
          409,
          'You run a school that still has teachers. Remove them (or hand the school over) before deleting your account.'
        );
      }
    }

    // Stop billing first: never leave someone paying for an account that no longer exists.
    const { data: subs, error: subErr } = await db
      .from('subscriptions')
      .select('razorpay_subscription_id, status')
      .eq('owner_user_id', user.id)
      .in('status', CHARGEABLE);
    if (subErr) throw new Error(`subscriptions: ${subErr.code}`);
    for (const sub of subs ?? []) {
      if (!sub.razorpay_subscription_id) continue;
      if (!razorpayKeys()) return fail(req, 503, 'Payments are not set up, so your subscription could not be cancelled');
      const res = await razorpayPost(`/subscriptions/${sub.razorpay_subscription_id}/cancel`, { cancel_at_cycle_end: 0 });
      // A never-paid ('created') subscription can't be charged anyway, so ignore failures there.
      if (!res.ok && sub.status !== 'created') {
        return fail(req, 502, 'Could not cancel your subscription with Razorpay. Nothing was deleted; please try again.');
      }
    }

    // Deleting app_users cascades to all owned data; then remove the login itself.
    const { error: delErr } = await db.from('app_users').delete().eq('id', user.id);
    if (delErr) throw new Error(`app_users delete: ${delErr.code}`);
    const { error: authErr } = await db.auth.admin.deleteUser(user.id);
    if (authErr) throw new Error(`auth delete: ${authErr.status ?? ''}`);

    return json(req, { deleted: true });
  } catch (e) {
    console.error('delete-account error:', (e as Error).message);
    return fail(req, 500, 'Could not delete the account. Please try again.');
  }
});
