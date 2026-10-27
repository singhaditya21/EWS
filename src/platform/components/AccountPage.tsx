import React, { useEffect, useState } from 'react';
import { cloudConfigured } from '../config';
import {
  AccountRole,
  addChild,
  deleteAccount,
  removeChild,
  sendCode,
  setAccountRole,
  signOut,
  useSession,
  verifyCode,
  refreshSession,
} from '../session';
import { PLANS } from '../plans';
import { PARENTAL_CONSENT_TEXT } from '../legal';
import { callFunction, getClient } from '../supabase';
import { closePage, openPage } from '../nav';
import { progress } from '../../class1/progressStore';
import { Card, ErrorText, PageShell, inputCls, primaryBtn, secondaryBtn } from './PageShell';
import { GrownUpGate } from './GrownUpGate';

const AVATARS = ['🦁', '🐼', '🦊', '🐯', '🐨', '🐸', '🦄', '🐬'];

interface SubscriptionRow {
  id: string;
  plan: string;
  period: string;
  status: string;
  razorpay_subscription_id: string;
  seats: number;
  current_period_end: string | null;
}

const SignIn: React.FC = () => {
  const [contact, setContact] = useState('');
  const [code, setCode] = useState('');
  const [sent, setSent] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const run = async (fn: () => Promise<void>) => {
    setBusy(true);
    setError(null);
    try {
      await fn();
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <Card className="max-w-md">
      <h2 className="text-base font-extrabold text-white">Sign in or create an account</h2>
      <p className="text-sm text-slate-300">For parents and teachers. We’ll send a one-time code — no password needed.</p>
      <input
        value={contact}
        onChange={(e) => setContact(e.target.value)}
        placeholder="Mobile number or email"
        inputMode="email"
        autoComplete="username"
        className={inputCls}
        disabled={sent}
      />
      {sent && (
        <input
          value={code}
          onChange={(e) => setCode(e.target.value)}
          placeholder="6-digit code"
          inputMode="numeric"
          autoComplete="one-time-code"
          className={inputCls}
        />
      )}
      <div className="flex gap-2">
        {!sent ? (
          <button
            type="button"
            className={primaryBtn}
            disabled={busy || contact.trim().length < 6}
            onClick={() => run(async () => {
              await sendCode(contact);
              setSent(true);
            })}
          >
            {busy ? 'Sending…' : 'Send code'}
          </button>
        ) : (
          <>
            <button type="button" className={primaryBtn} disabled={busy || code.trim().length < 4} onClick={() => run(() => verifyCode(contact, code))}>
              {busy ? 'Checking…' : 'Sign in'}
            </button>
            <button type="button" className={secondaryBtn} onClick={() => setSent(false)}>
              Change number/email
            </button>
          </>
        )}
      </div>
      <ErrorText error={error} />
      <p className="text-xs text-slate-400">
        Accounts are for adults (18+). By continuing you agree to the{' '}
        <button type="button" className="underline" onClick={() => openPage('terms')}>Terms</button> and{' '}
        <button type="button" className="underline" onClick={() => openPage('privacy')}>Privacy Policy</button>.
      </p>
    </Card>
  );
};

const ChooseRole: React.FC = () => {
  const [name, setName] = useState('');
  const [error, setError] = useState<string | null>(null);
  const pick = async (role: AccountRole) => {
    try {
      await setAccountRole(role, name);
    } catch (e) {
      setError((e as Error).message);
    }
  };
  return (
    <Card className="max-w-lg">
      <h2 className="text-base font-extrabold text-white">Welcome! Who are you?</h2>
      <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Your name" className={inputCls} />
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
        <button type="button" className={secondaryBtn} onClick={() => void pick('parent')}>
          👨‍👩‍👧 I’m a parent
        </button>
        <button type="button" className={secondaryBtn} onClick={() => void pick('teacher')}>
          🏫 I’m a teacher
        </button>
      </div>
      <ErrorText error={error} />
    </Card>
  );
};

const AddChildForm: React.FC<{ max: number; count: number }> = ({ max, count }) => {
  const [name, setName] = useState('');
  const [avatar, setAvatar] = useState(AVATARS[0]);
  const [ticks, setTicks] = useState<boolean[]>(PARENTAL_CONSENT_TEXT.map(() => false));
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (count >= max) {
    return (
      <div className="flex flex-wrap items-center gap-2 text-sm text-slate-300">
        Your plan allows {max} {max === 1 ? 'child' : 'children'}.
        <button type="button" className={secondaryBtn} onClick={() => openPage('plans')}>
          See plans
        </button>
      </div>
    );
  }
  const allTicked = ticks.every(Boolean);
  return (
    <div className="space-y-3 p-3 rounded-xl bg-[#090D16] border border-slate-800">
      <div className="text-sm font-bold text-white">Add a child</div>
      <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Child’s first name only" className={inputCls} maxLength={30} />
      <div className="flex flex-wrap gap-1.5" role="radiogroup" aria-label="Avatar">
        {AVATARS.map((a) => (
          <button
            key={a}
            type="button"
            aria-pressed={avatar === a}
            onClick={() => setAvatar(a)}
            className={`w-11 h-11 rounded-xl text-2xl border ${avatar === a ? 'border-cyan-400 bg-cyan-500/20' : 'border-slate-700'}`}
          >
            {a}
          </button>
        ))}
      </div>
      <fieldset className="space-y-1.5">
        <legend className="text-xs font-bold uppercase text-slate-400 mb-1">Parent / guardian consent</legend>
        {PARENTAL_CONSENT_TEXT.map((t, i) => (
          <label key={t} className="flex items-start gap-2 text-sm text-slate-200">
            <input
              type="checkbox"
              checked={ticks[i]}
              onChange={(e) => setTicks((prev) => prev.map((v, j) => (j === i ? e.target.checked : v)))}
              className="mt-1"
            />
            <span>{t}</span>
          </label>
        ))}
      </fieldset>
      <button
        type="button"
        className={primaryBtn}
        disabled={busy || !name.trim() || !allTicked}
        onClick={async () => {
          setBusy(true);
          setError(null);
          try {
            await addChild(name, avatar, 'in_app_checkbox_after_otp');
            setName('');
            setTicks(PARENTAL_CONSENT_TEXT.map(() => false));
          } catch (e) {
            setError((e as Error).message);
          } finally {
            setBusy(false);
          }
        }}
      >
        {busy ? 'Adding…' : 'Add child'}
      </button>
      <ErrorText error={error} />
    </div>
  );
};

const SubscriptionCard: React.FC = () => {
  const session = useSession();
  const [subs, setSubs] = useState<SubscriptionRow[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    void (async () => {
      const client = await getClient();
      const { data } = await client
        .from('subscriptions')
        .select('id, plan, period, status, razorpay_subscription_id, seats, current_period_end')
        .order('created_at', { ascending: false });
      setSubs((data ?? []) as SubscriptionRow[]);
    })();
  }, [session.plan]);

  const live = subs.filter((s) => ['active', 'authenticated', 'pending'].includes(s.status));
  return (
    <Card>
      <h2 className="text-base font-extrabold text-white">Plan</h2>
      <p className="text-sm text-slate-200">
        You’re on <strong>{PLANS[session.plan].name}</strong>
        {session.school ? ` through ${session.school.name}` : ''}.
      </p>
      {live.map((s) => (
        <div key={s.id} className="flex flex-wrap items-center justify-between gap-2 p-3 rounded-xl bg-[#090D16] border border-slate-800 text-sm">
          <span className="text-slate-200">
            {PLANS[s.plan as keyof typeof PLANS]?.name ?? s.plan} • {s.period}
            {s.seats > 1 ? ` • ${s.seats} seats` : ''} • {s.status}
            {s.current_period_end ? ` • renews/ends ${new Date(s.current_period_end).toLocaleDateString('en-IN')}` : ''}
          </span>
          <button
            type="button"
            className={secondaryBtn}
            disabled={busy}
            onClick={async () => {
              if (!confirm('Cancel this plan? You keep it until the end of the period you paid for.')) return;
              setBusy(true);
              setError(null);
              try {
                await callFunction('razorpay-cancel', { subscription_id: s.razorpay_subscription_id });
                await refreshSession();
                setSubs((prev) => prev.map((x) => (x.id === s.id ? { ...x, status: 'cancelling' } : x)));
              } catch (e) {
                setError((e as Error).message);
              } finally {
                setBusy(false);
              }
            }}
          >
            Cancel plan
          </button>
        </div>
      ))}
      <div className="flex flex-wrap gap-2">
        <button type="button" className={primaryBtn} onClick={() => openPage('plans')}>
          {session.plan === 'free' ? 'See paid plans' : 'Change plan'}
        </button>
      </div>
      <p className="text-xs text-slate-400">GST invoices are emailed by Razorpay after each payment.</p>
      <ErrorText error={error} />
    </Card>
  );
};

const AccountHome: React.FC = () => {
  const session = useSession();
  const [error, setError] = useState<string | null>(null);
  const limits = PLANS[session.plan].limits;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 items-start">
      <div className="space-y-4">
        <Card>
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div>
              <h2 className="text-base font-extrabold text-white">{session.displayName ?? 'Your account'}</h2>
              <p className="text-sm text-slate-400">
                {session.email ?? session.phone} • {session.role === 'teacher' ? 'Teacher' : session.role === 'school_admin' ? 'School admin' : 'Parent'}
              </p>
            </div>
            <button type="button" className={secondaryBtn} onClick={() => void signOut()}>
              Sign out
            </button>
          </div>
          {(session.role === 'teacher' || session.role === 'school_admin' || session.school) && (
            <div className="flex flex-wrap gap-2">
              <button type="button" className={primaryBtn} onClick={() => openPage('classroom')}>
                🏫 Open Classroom
              </button>
              {session.school?.isAdmin && (
                <button type="button" className={secondaryBtn} onClick={() => openPage('school')}>
                  School admin
                </button>
              )}
            </div>
          )}
        </Card>
        <SubscriptionCard />
      </div>

      <div className="space-y-4">
        {session.role !== 'teacher' && (
          <Card>
            <h2 className="text-base font-extrabold text-white">Children</h2>
            <p className="text-sm text-slate-400">
              {limits.cloudSync
                ? 'Progress syncs across your devices.'
                : 'On Free, progress stays on each device. Paid plans sync it across phones and tablets.'}
            </p>
            {session.children.map((c) => (
              <div key={c.id} className="flex items-center justify-between gap-2 p-3 rounded-xl bg-[#090D16] border border-slate-800">
                <span className="text-base text-white">
                  {c.avatar} {c.name}
                </span>
                <div className="flex gap-2">
                  <button
                    type="button"
                    className={secondaryBtn}
                    onClick={() => {
                      progress.switchProfile(c.id);
                      closePage();
                    }}
                  >
                    Learn as {c.name}
                  </button>
                  <button
                    type="button"
                    className={secondaryBtn}
                    onClick={async () => {
                      if (!confirm(`Delete ${c.name} and all of their progress? This can’t be undone.`)) return;
                      try {
                        await removeChild(c.id);
                        progress.removeProfile(c.id);
                      } catch (e) {
                        setError((e as Error).message);
                      }
                    }}
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
            <AddChildForm max={limits.maxChildren} count={session.children.length} />
            <ErrorText error={error} />
          </Card>
        )}

        <Card>
          <h2 className="text-base font-extrabold text-white">Your data</h2>
          <p className="text-sm text-slate-300">
            You can delete your account at any time. This removes your children, their progress, your classes and consents.
          </p>
          <div className="flex flex-wrap gap-2">
            <button type="button" className={secondaryBtn} onClick={() => openPage('privacy')}>
              Privacy policy
            </button>
            <button
              type="button"
              className="px-3 py-2 rounded-xl bg-rose-600 text-white text-sm font-bold"
              onClick={async () => {
                if (!confirm('Delete your account and all data? Any paid plan should be cancelled first. This can’t be undone.')) return;
                try {
                  await deleteAccount();
                } catch (e) {
                  setError((e as Error).message);
                }
              }}
            >
              Delete account
            </button>
          </div>
        </Card>
      </div>
    </div>
  );
};

export const AccountPage: React.FC = () => {
  const session = useSession();
  return (
    <PageShell title="Account" subtitle="For parents and teachers">
      <GrownUpGate reason="Accounts are for parents and teachers.">
        {!cloudConfigured || session.status === 'off' ? (
          <Card className="max-w-lg">
            <p className="text-sm text-slate-200">
              Accounts aren’t open on this site yet. Everything in the Free plan works without one — progress is saved on this device.
            </p>
          </Card>
        ) : session.status === 'loading' ? (
          <Card className="max-w-lg">
            <p className="text-sm text-slate-300">Loading…</p>
          </Card>
        ) : session.status === 'signed-out' ? (
          <SignIn />
        ) : !session.role ? (
          <ChooseRole />
        ) : (
          <AccountHome />
        )}
      </GrownUpGate>
    </PageShell>
  );
};
