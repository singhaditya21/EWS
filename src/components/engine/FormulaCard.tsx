import React, { useMemo } from 'react';
import katex from 'katex';
import { Calculator, Sparkles, Volume2 } from 'lucide-react';
import { playPop } from '../../utils/soundEffects';

interface FormulaCardProps {
  label: string;
  latex: string;
  description?: string;
  liveSubstitution?: string;
  accentColor?: 'cyan' | 'amber' | 'emerald';
  kidFriendly?: boolean;
}

export const FormulaCard: React.FC<FormulaCardProps> = ({
  label,
  latex,
  description,
  liveSubstitution,
  accentColor = 'cyan',
  kidFriendly = false,
}) => {
  const speakRule = () => {
    playPop();
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;
    window.speechSynthesis.cancel();
    const u = new SpeechSynthesisUtterance(
      `${label}. ${description || ''}`
    );
    u.rate = 0.92;
    u.pitch = 1.1;
    window.speechSynthesis.speak(u);
  };
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
          {kidFriendly ? (
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
          ) : (
            <Calculator className="w-3.5 h-3.5 text-cyan-400" />
          )}
          {kidFriendly ? `🌟 Golden Rule: ${label}` : label}
        </span>
        {kidFriendly ? (
          <button
            type="button"
            onClick={speakRule}
            className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg bg-amber-500/20 border border-amber-400/50 text-[10px] font-bold text-amber-200 hover:bg-amber-500/30"
          >
            <Volume2 className="w-3 h-3" />
            🔊 Speak
          </button>
        ) : (
          liveSubstitution && (
            <span
              className={`text-[10px] font-mono px-2 py-0.5 rounded-full font-medium ${badgeMap[accentColor]}`}
            >
              LIVE TELEMETRY
            </span>
          )
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
