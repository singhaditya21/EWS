// Starts a Razorpay subscription for the signed-in user and records it as `created`.
// The webhook later moves it to authenticated/active once the user completes checkout.
import { fail, handlePreflight, json, readJsonBody } from '../_shared/cors.ts';
import { adminClient, getCaller } from '../_shared/supabase.ts';
import { razorpayKeys, razorpayPost, type RazorpaySubscription } from '../_shared/razorpay.ts';

type PaidPlan = 'family' | 'family_plus' | 'classroom' | 'school';
type Period = 'monthly' | 'yearly';

const PLANS: PaidPlan[] = ['family', 'family_plus', 'classroom', 'school'];
const PERIODS: Period[] = ['monthly', 'yearly'];
const ROLE_FOR_PLAN: Record<PaidPlan, 'parent' | 'teacher' | 'school_admin'> = {
  family: 'parent',
  family_plus: 'parent',
  classroom: 'teacher',
  school: 'school_admin',
};
// Razorpay needs a finite cycle count: 10 years either way.
const TOTAL_COUNT: Record<Period, number> = { monthly: 120, yearly: 10 };
const MAX_SEATS = 10000;

Deno.serve(async (req) => {
  const early = handlePreflight(req);
  if (early) return early;

  try {
    const user = await getCaller(req);
    if (!user) return fail(req, 401, 'Please sign in first');

    const body = await readJsonBody(req, 4 * 1024);
    if (body instanceof Response) return body;

    const plan = body.plan as PaidPlan;
    const period = body.period as Period;
    if (!PLANS.includes(plan)) return fail(req, 400, 'Unknown plan');
    if (!PERIODS.includes(period)) return fail(req, 400, 'Unknown billing period');
    if (plan === 'school' && period !== 'yearly') return fail(req, 400, 'The School plan is billed yearly');

    let seats = 1;
    if (plan === 'school') {
      const s = body.seats;
      if (typeof s !== 'number' || !Number.isInteger(s) || s < 1 || s > MAX_SEATS) {
        return fail(req, 400, `Seats must be a whole number from 1 to ${MAX_SEATS}`);
      }
      seats = s;
    }

    const keys = razorpayKeys();
    const planId = Deno.env.get(`RAZORPAY_PLAN_${plan.toUpperCase()}_${period.toUpperCase()}`);
    if (!keys || !planId) return fail(req, 503, 'Payments are not set up yet');

    const db = adminClient();

    // Make sure the account row exists (subscriptions/schools reference it).
    const { error: userErr } = await db
      .from('app_users')
      .upsert({ id: user.id, role: ROLE_FOR_PLAN[plan] }, { onConflict: 'id', ignoreDuplicates: true });
    if (userErr) throw new Error(`app_users upsert: ${userErr.code}`);

    // Don't start a second live subscription for the same plan.
    const { data: live, error: liveErr } = await db
      .from('subscriptions')
      .select('id, status, current_period_end')
      .eq('owner_user_id', user.id)
      .eq('plan', plan)
      .in('status', ['authenticated', 'active']);
    if (liveErr) throw new Error(`subscriptions lookup: ${liveErr.code}`);
    const now = Date.now();
    if ((live ?? []).some((s) => !s.current_period_end || Date.parse(s.current_period_end) > now)) {
      return fail(req, 409, 'You already have this plan');
    }

    // School plan: reuse the school this user already runs, or create one with them as admin.
    let schoolId: string | null = null;
    let createdSchool = false;
    if (plan === 'school') {
      const { data: existing, error: schoolErr } = await db
        .from('schools')
        .select('id')
        .eq('admin_user_id', user.id)
        .order('created_at')
        .limit(1)
        .maybeSingle();
      if (schoolErr) throw new Error(`schools lookup: ${schoolErr.code}`);
      if (existing) {
        schoolId = existing.id;
      } else {
        const name = typeof body.school_name === 'string' ? body.school_name.trim() : '';
        if (name.length < 2 || name.length > 120) return fail(req, 400, 'Please enter the school name (2–120 characters)');
        const { data: school, error: insErr } = await db
          .from('schools')
          .insert({ name, admin_user_id: user.id })
          .select('id')
          .single();
        if (insErr || !school) throw new Error(`schools insert: ${insErr?.code}`);
        schoolId = school.id;
        createdSchool = true;
        const { error: memErr } = await db
          .from('school_members')
          .insert({ school_id: schoolId, user_id: user.id, role: 'admin' });
        if (memErr) {
          await db.from('schools').delete().eq('id', schoolId);
          throw new Error(`school_members insert: ${memErr.code}`);
        }
      }
    }

    const notes: Record<string, string> = { user_id: user.id, plan, period };
    if (schoolId) notes.school_id = schoolId;

    const rzp = await razorpayPost<RazorpaySubscription>('/subscriptions', {
      plan_id: planId,
      total_count: TOTAL_COUNT[period],
      quantity: seats,
      customer_notify: 1,
      notes,
    });
    if (!rzp.ok || !rzp.data?.id) {
      if (createdSchool) await db.from('schools').delete().eq('id', schoolId);
      return fail(req, 502, 'Could not start the payment. Please try again.');
    }

    const { error: subErr } = await db.from('subscriptions').insert({
      owner_user_id: user.id,
      school_id: schoolId,
      plan,
      period,
      status: 'created',
      razorpay_subscription_id: rzp.data.id,
      seats,
    });
    if (subErr) {
      // Undo so the user isn't left with an orphan subscription they could pay for.
      await razorpayPost(`/subscriptions/${rzp.data.id}/cancel`, { cancel_at_cycle_end: 0 });
      if (createdSchool) await db.from('schools').delete().eq('id', schoolId);
      throw new Error(`subscriptions insert: ${subErr.code}`);
    }

    return json(req, { subscription_id: rzp.data.id, key_id: keys.keyId });
  } catch (e) {
    console.error('razorpay-subscribe error:', (e as Error).message);
    return fail(req, 500, 'Something went wrong. Please try again.');
  }
});
