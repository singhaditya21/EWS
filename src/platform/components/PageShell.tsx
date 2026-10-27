import React from 'react';
import { closePage } from '../nav';

/** Full-width page for account screens, with a way back to the lessons. */
export const PageShell: React.FC<{ title: string; subtitle?: string; children: React.ReactNode }> = ({
  title,
  subtitle,
  children,
}) => (
  <main className="flex-1 min-w-0 p-3 sm:p-6 max-w-[1200px] mx-auto w-full space-y-4">
    <div className="flex flex-wrap items-start justify-between gap-2">
      <div>
        <h1 className="text-xl font-extrabold text-white">{title}</h1>
        {subtitle && <p className="text-sm text-slate-400">{subtitle}</p>}
      </div>
      <button
        type="button"
        onClick={closePage}
        className="px-3 py-2 rounded-xl bg-[#111827] border border-slate-700 text-sm font-bold text-slate-200"
      >
        ← Back to lessons
      </button>
    </div>
    {children}
  </main>
);

export const Card: React.FC<{ children: React.ReactNode; className?: string }> = ({ children, className = '' }) => (
  <div className={`rounded-2xl bg-[#111827] border border-[#1F2937] p-4 sm:p-5 space-y-3 ${className}`}>{children}</div>
);

export const ErrorText: React.FC<{ error: string | null }> = ({ error }) =>
  error ? <p className="text-sm text-rose-300">{error}</p> : null;

export const primaryBtn =
  'px-4 py-2.5 rounded-xl bg-cyan-500 text-slate-950 text-sm font-extrabold disabled:opacity-50 disabled:cursor-not-allowed';
export const secondaryBtn =
  'px-3 py-2 rounded-xl bg-[#090D16] border border-slate-700 text-sm font-bold text-slate-200 disabled:opacity-50';
export const inputCls = 'w-full px-3 py-2.5 rounded-xl bg-[#090D16] border border-slate-700 text-white text-sm';
