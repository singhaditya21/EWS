import React, { useMemo, useState } from 'react';

const KEY = 'omnilearn_grownup_until';
const UNLOCK_MINUTES = 10;

const unlocked = () => {
  try {
    return Number(sessionStorage.getItem(KEY) ?? 0) > Date.now();
  } catch {
    return false;
  }
};

/**
 * Keeps children out of accounts, payments and teacher tools: a grown-up answers a
 * multiplication question a 6-year-old can't, and the unlock lasts 10 minutes in this tab.
 */
export const GrownUpGate: React.FC<{ children: React.ReactNode; reason?: string }> = ({ children, reason }) => {
  const [ok, setOk] = useState(unlocked);
  const [wrong, setWrong] = useState(false);
  const q = useMemo(() => {
    const a = 6 + Math.floor(Math.random() * 4);
    const b = 6 + Math.floor(Math.random() * 4);
    const ans = a * b;
    const opts = [ans, ans + a, ans - b, ans + 10].sort(() => Math.random() - 0.5);
    return { a, b, ans, opts };
  }, [wrong]); // eslint-disable-line react-hooks/exhaustive-deps

  if (ok) return <>{children}</>;
  return (
    <div className="max-w-md mx-auto rounded-2xl bg-[#111827] border border-[#1F2937] p-6 space-y-4 text-center">
      <div className="text-3xl">🔒</div>
      <h2 className="text-lg font-extrabold text-white">Grown-ups only</h2>
      <p className="text-sm text-slate-300">{reason ?? 'Ask a parent or teacher to continue.'}</p>
      <p className="text-base font-bold text-white">
        What is {q.a} × {q.b}?
      </p>
      <div className="grid grid-cols-2 gap-2">
        {q.opts.map((o) => (
          <button
            key={o}
            type="button"
            onClick={() => {
              if (o === q.ans) {
                try {
                  sessionStorage.setItem(KEY, String(Date.now() + UNLOCK_MINUTES * 60_000));
                } catch {
                  // Unlock for this render only.
                }
                setOk(true);
              } else {
                setWrong((w) => !w);
              }
            }}
            className="py-3 rounded-xl bg-[#090D16] border border-slate-700 text-lg font-extrabold text-white hover:border-cyan-400"
          >
            {o}
          </button>
        ))}
      </div>
    </div>
  );
};
