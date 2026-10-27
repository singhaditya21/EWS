import React, { useCallback, useEffect, useState } from 'react';
import { getClient } from '../supabase';
import { refreshSession, useSession } from '../session';
import { openPage, closePage } from '../nav';
import { Card, ErrorText, PageShell, inputCls, primaryBtn, secondaryBtn } from './PageShell';
import { GrownUpGate } from './GrownUpGate';

interface Member {
  user_id: string;
  role: string;
  app_users: { display_name: string | null } | { display_name: string | null }[] | null;
}
interface Invite {
  id: string;
  email: string;
  token: string;
  accepted_at: string | null;
}
interface SchoolSub {
  seats: number;
  status: string;
  current_period_end: string | null;
}

const memberName = (m: Member) => {
  const u = Array.isArray(m.app_users) ? m.app_users[0] : m.app_users;
  return u?.display_name ?? 'Teacher';
};

export const SchoolPage: React.FC = () => {
  const session = useSession();
  const [members, setMembers] = useState<Member[]>([]);
  const [invites, setInvites] = useState<Invite[]>([]);
  const [sub, setSub] = useState<SchoolSub | null>(null);
  const [email, setEmail] = useState('');
  const [error, setError] = useState<string | null>(null);
  const school = session.school;

  const load = useCallback(async () => {
    if (!school?.isAdmin) return;
    const client = await getClient();
    const [{ data: m }, { data: i }, { data: s }] = await Promise.all([
      client.from('school_members').select('user_id, role, app_users(display_name)').eq('school_id', school.id),
      client.from('school_invites').select('id, email, token, accepted_at').eq('school_id', school.id).order('id'),
      client.from('subscriptions').select('seats, status, current_period_end').eq('school_id', school.id).order('created_at', { ascending: false }).limit(1),
    ]);
    setMembers((m ?? []) as Member[]);
    setInvites((i ?? []) as Invite[]);
    setSub(((s ?? [])[0] as SchoolSub) ?? null);
  }, [school?.id, school?.isAdmin]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    void load();
  }, [load]);

  const inviteLink = (token: string) => `${window.location.origin}${window.location.pathname}#/invite/${token}`;

  return (
    <PageShell title="School admin" subtitle={school?.name}>
      <GrownUpGate reason="School admin is for school staff.">
        {!school?.isAdmin ? (
          <Card className="max-w-lg">
            <p className="text-sm text-slate-200">This page is for the admin of a school on the School plan.</p>
            <button type="button" className={primaryBtn} onClick={() => openPage('plans')}>
              See the School plan
            </button>
          </Card>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 items-start">
            <Card>
              <h2 className="text-base font-extrabold text-white">Licence</h2>
              {sub ? (
                <p className="text-sm text-slate-200">
                  {sub.seats} student seats • {sub.status}
                  {sub.current_period_end ? ` • renews ${new Date(sub.current_period_end).toLocaleDateString('en-IN')}` : ''}
                </p>
              ) : (
                <p className="text-sm text-slate-400">No active licence found.</p>
              )}
              <p className="text-xs text-slate-400">
                Need more seats? Choose the School plan again with the new number of students, then cancel the old one from Account.
              </p>
            </Card>
            <Card>
              <h2 className="text-base font-extrabold text-white">Teachers ({members.length})</h2>
              {members.map((m) => (
                <div key={m.user_id} className="flex items-center justify-between gap-2 p-2.5 rounded-xl bg-[#090D16] border border-slate-800 text-sm">
                  <span className="text-white">
                    {memberName(m)} <span className="text-slate-400">• {m.role}</span>
                  </span>
                  {m.role !== 'admin' && (
                    <button
                      type="button"
                      className={secondaryBtn}
                      onClick={async () => {
                        if (!confirm(`Remove ${memberName(m)} from ${school.name}?`)) return;
                        const client = await getClient();
                        const { error: err } = await client.from('school_members').delete().eq('school_id', school.id).eq('user_id', m.user_id);
                        if (err) setError(err.message);
                        else void load();
                      }}
                    >
                      Remove
                    </button>
                  )}
                </div>
              ))}
              <div className="flex gap-2">
                <input value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Teacher’s email" className={inputCls} type="email" />
                <button
                  type="button"
                  className={primaryBtn}
                  disabled={!email.includes('@')}
                  onClick={async () => {
                    setError(null);
                    const client = await getClient();
                    const { error: err } = await client.from('school_invites').insert({ school_id: school.id, email: email.trim().toLowerCase() });
                    if (err) setError(err.message);
                    else {
                      setEmail('');
                      void load();
                    }
                  }}
                >
                  Invite
                </button>
              </div>
              {invites
                .filter((i) => !i.accepted_at)
                .map((i) => (
                  <div key={i.id} className="p-2.5 rounded-xl bg-[#090D16] border border-slate-800 text-xs text-slate-300 space-y-1">
                    <div>
                      Pending: <strong className="text-white">{i.email}</strong>
                    </div>
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="break-all">{inviteLink(i.token)}</span>
                      <button type="button" className={secondaryBtn} onClick={() => void navigator.clipboard?.writeText(inviteLink(i.token))}>
                        Copy link
                      </button>
                    </div>
                  </div>
                ))}
              <p className="text-xs text-slate-400">Send the link to the teacher. They sign in with the same email and are added to the school.</p>
              <ErrorText error={error} />
            </Card>
          </div>
        )}
      </GrownUpGate>
    </PageShell>
  );
};

/** Opened from an invite link: the signed-in teacher joins the school. */
export const InvitePage: React.FC<{ token: string | null }> = ({ token }) => {
  const session = useSession();
  const [state, setState] = useState<'idle' | 'joining' | 'done' | 'error'>('idle');
  const [error, setError] = useState<string | null>(null);

  return (
    <PageShell title="Join your school">
      <Card className="max-w-lg">
        {session.status !== 'signed-in' ? (
          <>
            <p className="text-sm text-slate-200">Sign in with the email address the invite was sent to, then open the link again.</p>
            <button type="button" className={primaryBtn} onClick={() => openPage('account')}>
              Sign in
            </button>
          </>
        ) : state === 'done' ? (
          <>
            <p className="text-sm text-emerald-300">You’ve joined {session.school?.name ?? 'the school'}.</p>
            <button type="button" className={primaryBtn} onClick={() => openPage('classroom')}>
              Open Classroom
            </button>
          </>
        ) : (
          <>
            <p className="text-sm text-slate-200">Join the school as a teacher? You’ll get the Classroom tools on the school’s licence.</p>
            <div className="flex gap-2">
              <button
                type="button"
                className={primaryBtn}
                disabled={!token || state === 'joining'}
                onClick={async () => {
                  setState('joining');
                  setError(null);
                  try {
                    const client = await getClient();
                    const { error: err } = await client.rpc('accept_school_invite', { token });
                    if (err) throw new Error(err.message);
                    if (!session.role) {
                      await client.from('app_users').upsert({ id: session.userId, role: 'teacher' });
                    }
                    await refreshSession();
                    setState('done');
                  } catch (e) {
                    setError((e as Error).message);
                    setState('error');
                  }
                }}
              >
                {state === 'joining' ? 'Joining…' : 'Join school'}
              </button>
              <button type="button" className={secondaryBtn} onClick={closePage}>
                Not now
              </button>
            </div>
          </>
        )}
        <ErrorText error={error} />
      </Card>
    </PageShell>
  );
};
