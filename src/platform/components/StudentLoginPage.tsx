import React, { useState } from 'react';
import { cloudConfigured } from '../config';
import { PICTURES, RosterEntry, loadRoster, studentSignIn } from '../student';
import { closePage } from '../nav';
import { Card, ErrorText, PageShell, inputCls, primaryBtn, secondaryBtn } from './PageShell';

/** Big, simple steps a 6-year-old can follow: code → my name → my 3 pictures. */
export const StudentLoginPage: React.FC<{ initialCode?: string | null }> = ({ initialCode }) => {
  const [code, setCode] = useState(initialCode ?? '');
  const [roster, setRoster] = useState<{ name: string; students: RosterEntry[] } | null>(null);
  const [me, setMe] = useState<RosterEntry | null>(null);
  const [picked, setPicked] = useState<string[]>([]);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const findClass = async () => {
    setBusy(true);
    setError(null);
    try {
      const r = await loadRoster(code);
      setRoster({ name: r.class_name, students: r.students });
    } catch {
      setError('We couldn’t find that class code. Check it with your teacher.');
    } finally {
      setBusy(false);
    }
  };

  const tryPictures = async (pics: string[]) => {
    if (!me) return;
    setBusy(true);
    setError(null);
    try {
      await studentSignIn(code, me.id, pics.join(''));
      closePage();
    } catch {
      setError('Those aren’t your pictures. Try again!');
      setPicked([]);
    } finally {
      setBusy(false);
    }
  };

  return (
    <PageShell title="I’m in school" subtitle="Sign in with your class code">
      {!cloudConfigured ? (
        <Card className="max-w-lg">
          <p className="text-sm text-slate-200">School sign-in isn’t open on this site yet.</p>
        </Card>
      ) : !roster ? (
        <Card className="max-w-md">
          <label className="text-base font-bold text-white" htmlFor="class-code">
            Class code
          </label>
          <input
            id="class-code"
            value={code}
            onChange={(e) => setCode(e.target.value.toUpperCase())}
            maxLength={6}
            className={`${inputCls} text-2xl font-mono tracking-[0.4em] text-center uppercase`}
            autoCapitalize="characters"
            autoComplete="off"
          />
          <button type="button" className={`${primaryBtn} w-full text-lg`} disabled={busy || code.trim().length !== 6} onClick={() => void findClass()}>
            {busy ? 'Looking…' : 'Next →'}
          </button>
          <ErrorText error={error} />
        </Card>
      ) : !me ? (
        <Card>
          <h2 className="text-lg font-extrabold text-white">{roster.name}: tap your name</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2">
            {roster.students.map((s) => (
              <button
                key={s.id}
                type="button"
                onClick={() => setMe(s)}
                className="min-h-[72px] p-3 rounded-2xl bg-[#090D16] border-2 border-slate-700 hover:border-cyan-400 text-lg font-extrabold text-white"
              >
                <span className="text-3xl block">{s.avatar}</span>
                {s.display_name}
              </button>
            ))}
          </div>
          <button type="button" className={secondaryBtn} onClick={() => setRoster(null)}>
            ← Different class
          </button>
        </Card>
      ) : (
        <Card className="max-w-xl">
          <h2 className="text-lg font-extrabold text-white">
            Hi {me.display_name}! Tap your 3 secret pictures in order
          </h2>
          <div className="flex gap-2 justify-center text-4xl min-h-[56px]" aria-live="polite">
            {[0, 1, 2].map((i) => (
              <span key={i} className="w-14 h-14 rounded-xl bg-[#090D16] border border-slate-700 flex items-center justify-center">
                {picked[i] ? '●' : ''}
              </span>
            ))}
          </div>
          <div className="grid grid-cols-4 gap-2">
            {PICTURES.map((p) => (
              <button
                key={p}
                type="button"
                disabled={busy || picked.length >= 3}
                onClick={() => {
                  const next = [...picked, p];
                  setPicked(next);
                  if (next.length === 3) void tryPictures(next);
                }}
                className="h-16 rounded-2xl bg-[#090D16] border-2 border-slate-700 hover:border-cyan-400 text-4xl"
                aria-label={`Picture ${p}`}
              >
                {p}
              </button>
            ))}
          </div>
          <div className="flex gap-2">
            <button type="button" className={secondaryBtn} onClick={() => setPicked([])}>
              Start again
            </button>
            <button
              type="button"
              className={secondaryBtn}
              onClick={() => {
                setMe(null);
                setPicked([]);
              }}
            >
              ← Not me
            </button>
          </div>
          <ErrorText error={error} />
        </Card>
      )}
    </PageShell>
  );
};
