import React, { useMemo } from 'react';
import katex from 'katex';
import { Calculator } from 'lucide-react';

interface FormulaCardProps {
  label: string;
  latex: string;
  description?: string;
  liveSubstitution?: string;
  accentColor?: 'cyan' | 'amber' | 'emerald';
}

export const FormulaCard: React.FC<FormulaCardProps> = ({
  label,
  latex,
  description,
  liveSubstitution,
  accentColor = 'cyan',
}) => {
  const renderedHtml = useMemo(() => {
    try {
      return katex.renderToString(latex, {
        throwOnError: false,
        displayMode: false,
      });
    } catch {
      return `<code>${latex}</code>`;
    }
  }, [latex]);

  const renderedLiveHtml = useMemo(() => {
    if (!liveSubstitution) return null;
    try {
      return katex.renderToString(liveSubstitution, {
        throwOnError: false,
        displayMode: false,
      });
    } catch {
      return `<code>${liveSubstitution}</code>`;
    }
  }, [liveSubstitution]);

  const borderMap = {
    cyan: 'border-cyan-500/30 hover:border-cyan-400/60',
    amber: 'border-amber-500/30 hover:border-amber-400/60',
    emerald: 'border-emerald-500/30 hover:border-emerald-400/60',
  };

  const badgeMap = {
    cyan: 'text-cyan-400 bg-cyan-500/10',
    amber: 'text-amber-400 bg-amber-500/10',
    emerald: 'text-emerald-400 bg-emerald-500/10',
  };

  return (
    <div
      className={`rounded-xl bg-[#0D1322] border ${borderMap[accentColor]} p-3.5 transition-all duration-200 shadow-sm`}
    >
      <div className="flex items-center justify-between gap-2 mb-2">
        <span className="text-xs font-semibold uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
          <Calculator className="w-3.5 h-3.5 text-cyan-400" />
          {label}
        </span>
        {liveSubstitution && (
          <span
            className={`text-[10px] font-mono px-2 py-0.5 rounded-full font-medium ${badgeMap[accentColor]}`}
          >
            LIVE TELEMETRY
          </span>
        )}
      </div>

      <div
        className="py-1.5 px-2.5 rounded-lg bg-[#090D16]/90 border border-slate-800/80 overflow-x-auto text-sm text-slate-100"
        dangerouslySetInnerHTML={{ __html: renderedHtml }}
      />

      {renderedLiveHtml && (
        <div
          className="mt-2 py-1.5 px-2.5 rounded-lg bg-cyan-950/20 border border-cyan-500/20 overflow-x-auto text-xs text-cyan-200 font-mono"
          dangerouslySetInnerHTML={{ __html: renderedLiveHtml }}
        />
      )}

      {description && (
        <p className="mt-2 text-xs text-slate-400 leading-relaxed">{description}</p>
      )}
    </div>
  );
};
