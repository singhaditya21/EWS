import React, { useState } from 'react';
import { BillingPeriod, PLANS, PlanId, formatPrice } from '../plans';
import { cloudConfigured, RAZORPAY_KEY_ID } from '../config';
import { callFunction, getClient } from '../supabase';
import { refreshSession, useSession, getSession } from '../session';
import { openPage } from '../nav';
import { Card, ErrorText, PageShell, inputCls, primaryBtn } from './PageShell';
import { GrownUpGate } from './GrownUpGate';

type PaidPlan = Exclude<PlanId, 'free'>;

declare global {
  interface Window {
    Razorpay?: new (opts: Record<string, unknown>) => { open: () => void };
  }
}

const loadCheckout = () =>
  new Promise<void>((resolve, reject) => {
    if (window.Razorpay) return resolve();
    const s = document.createElement('script');
    s.src = 'https://checkout.razorpay.com/v1/checkout.js';
    s.onload = () => resolve();
    s.onerror = () => reject(new Error('Could not load the payment window. Check your connection and try again.'));
    document.body.appendChild(s);
  });

/** The caller's own subscriptions that can still charge (school licences are managed separately). */
const liveOwnSubscriptions = async (userId: string) => {
  const client = await getClient();
  const { data } = await client
    .from('subscriptions')
    .select('razorpay_subscription_id, plan, status')
    .eq('owner_user_id', userId)
    .in('status', ['active', 'authenticated', 'pending']);
  return (data ?? []) as { razorpay_subscription_id: string; plan: string; status: string }[];
};

/** After payment, Razorpay tells our webhook; wait for the plan to update. */
const waitForPlan = async (want: PlanId) => {
  for (let i = 0; i < 15; i++) {
    await refreshSession();
    if (getSession().plan === want) return true;
    await new Promise((r) => setTimeout(r, 2000));
  }
  return false;
};

export const PlansPage: React.FC = () => {
  const session = useSession();
  const [period, setPeriod] = useState<BillingPeriod>('yearly');
  const [busy, setBusy] = useState<PlanId | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [seats, setSeats] = useState(100);
  const [schoolName, setSchoolName] = useState('');

  const subscribe = async (plan: PaidPlan) => {
    setError(null);
    setNotice(null);
    if (session.status !== 'signed-in') {
      openPage('account');
      return;
    }
    if (plan === 'school' && !schoolName.trim()) {
      setError('Please enter the school’s name.');
      return;
    }
    setBusy(plan);
    try {
      const chosen: BillingPeriod = plan === 'school' ? 'yearly' : period;
      const { subscription_id, key_id } = await callFunction<{ subscription_id: string; key_id: string }>(
        'razorpay-subscribe',
        { plan, period: chosen, seats: plan === 'school' ? seats : undefined, school_name: plan === 'school' ? schoolName : undefined }
      );
      await loadCheckout();
      const rz = new window.Razorpay!({
        key: key_id || RAZORPAY_KEY_ID,
        subscription_id,
        name: 'OmniLearn Labs',
        description: `${PLANS[plan].name} plan (${chosen})`,
        prefill: { email: session.email ?? undefined, contact: session.phone ?? undefined },
        theme: { color: '#06B6D4' },
        handler: async () => {
          setNotice('Payment received — switching on your plan…');
          const ok = await waitForPlan(plan);
          // Switching plans: stop the old one renewing so nobody is charged twice.
          if (ok && plan !== 'school' && session.userId) {
            const old = (await liveOwnSubscriptions(session.userId)).filter((x) => x.razorpay_subscription_id !== subscription_id);
            await Promise.all(old.map((x) => callFunction('razorpay-cancel', { subscription_id: x.razorpay_subscription_id }).catch(() => undefined)));
          }
          setNotice(ok ? `You’re on ${PLANS[plan].name}. Thank you!` : 'Payment received. Your plan will switch on within a few minutes.');
          setBusy(null);
        },
        modal: { ondismiss: () => setBusy(null) },
      });
      rz.open();
    } catch (e) {
      setError((e as Error).message);
      setBusy(null);
    }
  };

  const order: PlanId[] = ['free', 'family', 'family_plus', 'classroom', 'school'];

  return (
    <PageShell
      title="Plans"
      subtitle="Every Class 1 chapter, lab and quiz stays free for every child. Paid plans add more children, sync, deeper practice and teacher tools. Prices include GST."
    >
      <GrownUpGate reason="Plans and payments are for parents and teachers.">
        {!cloudConfigured && (
          <Card>
            <p className="text-sm text-amber-200">
              Paid plans aren’t open on this site yet. Everything below marked Free is available now.
            </p>
          </Card>
        )}
        <div className="flex items-center gap-1 bg-[#090D16] p-1 rounded-xl border border-slate-800 w-fit" role="group" aria-label="Billing period">
          {(['monthly', 'yearly'] as BillingPeriod[]).map((p) => (
            <button
              key={p}
              type="button"
              onClick={() => setPeriod(p)}
              aria-pressed={period === p}
              className={`px-3 py-1.5 rounded-lg text-sm font-extrabold ${period === p ? 'bg-cyan-500 text-slate-950' : 'text-slate-300'}`}
            >
              {p === 'monthly' ? 'Monthly' : 'Yearly (save ~33%)'}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-5 gap-3">
          {order.map((id) => {
            const plan = PLANS[id];
            const current = session.status === 'signed-in' ? session.plan === id : id === 'free';
            const price = id === 'school' ? plan.price.yearly : plan.price[period];
            return (
              <Card key={id} className={current ? 'border-cyan-400' : ''}>
                <div className="text-xs font-bold uppercase text-slate-400">{plan.audience}</div>
                <div className="text-lg font-extrabold text-white">{plan.name}</div>
                <div className="text-2xl font-black text-white">
                  {formatPrice(price)}
                  <span className="text-xs font-semibold text-slate-400">
                    {id === 'free' ? '' : id === 'school' ? ` ${plan.price.unit}` : ` / ${period === 'monthly' ? 'month' : 'year'}${plan.price.unit ? ` ${plan.price.unit}` : ''}`}
                  </span>
                </div>
                <ul className="text-sm text-slate-200 space-y-1 list-disc pl-4">
                  {plan.highlights.map((h) => (
                    <li key={h}>{h}</li>
                  ))}
                </ul>
                {id === 'school' && !current && (
                  <div className="space-y-2">
                    <input value={schoolName} onChange={(e) => setSchoolName(e.target.value)} placeholder="School name" className={inputCls} />
                    <label className="text-xs text-slate-300 flex items-center gap-2">
                      Students
                      <input
                        type="number"
                        min={20}
                        max={5000}
                        value={seats}
                        onChange={(e) => setSeats(Math.max(20, Number(e.target.value) || 20))}
                        className={`${inputCls} w-28`}
                      />
                      = {formatPrice(seats * (plan.price.yearly ?? 0))}/year
                    </label>
                  </div>
                )}
                {current ? (
                  <div className="text-sm font-bold text-cyan-300">Your current plan</div>
                ) : id === 'free' ? null : (
                  <button
                    type="button"
                    disabled={!cloudConfigured || busy !== null}
                    onClick={() => void subscribe(id as PaidPlan)}
                    className={primaryBtn}
                  >
                    {busy === id ? 'Opening payment…' : session.status === 'signed-in' ? `Choose ${plan.name}` : 'Sign in to choose'}
                  </button>
                )}
              </Card>
            );
          })}
        </div>
        <ErrorText error={error} />
        {notice && <p className="text-sm text-emerald-300">{notice}</p>}
        <p className="text-xs text-slate-400">
          Payments are handled by Razorpay (UPI AutoPay, cards, net banking). We never see your card or UPI details. Plans renew
          automatically; cancel any time from your account and you keep access until the end of the period you paid for.{' '}
          <button type="button" className="underline" onClick={() => openPage('terms')}>
            Terms
          </button>{' '}
          ·{' '}
          <button type="button" className="underline" onClick={() => openPage('privacy')}>
            Privacy
          </button>
        </p>
      </GrownUpGate>
    </PageShell>
  );
};
