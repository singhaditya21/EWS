import React, { useMemo, useState } from 'react';
import { drawQuestions } from '../questionBank';
import { CLASS1_BOARD_MAP } from '../boardMap';
import { AnswerPanel, StarFn } from './ReadingActivity';

const QUESTIONS = 3;

const draw = (skills: string[]) => {
  const per = Math.max(1, Math.ceil(QUESTIONS / skills.length));
  return skills
    .flatMap((s) => drawQuestions(s, per))
    .sort(() => Math.random() - 0.5)
    .slice(0, QUESTIONS);
};

/**
 * Tapping around a lab shows a child has explored, not that they have learnt it. This short check
 * turns play into evidence: it appears once they have explored, and its answers update their skills.
 */
export const QuickCheck: React.FC<{ chapterId: string; onStar: StarFn }> = ({ chapterId, onStar }) => {
  const skills = CLASS1_BOARD_MAP[chapterId]?.skills ?? [];
  const lang = skills[0]?.startsWith('h.') ? ('hi-IN' as const) : ('en-IN' as const);
  const hi = lang === 'hi-IN';
  const [open, setOpen] = useState(false);
  const [round, setRound] = useState(0);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const questions = useMemo(() => draw(skills), [chapterId, round]);

  if (questions.length === 0) return null;

  if (!open) {
    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="w-full min-h-[56px] p-3 rounded-2xl bg-emerald-500/15 border-2 border-emerald-400 text-left text-base font-extrabold text-emerald-100 hover:bg-emerald-500/25"
      >
        🌟 {hi ? 'बहुत बढ़िया खेला! अब दिखाओ: 3 छोटे सवाल' : 'Great exploring! Now show what you know: 3 quick questions'}
      </button>
    );
  }
  return (
    <div className="p-4 rounded-2xl bg-[#111827] border-2 border-emerald-400 space-y-3">
      <div className="flex items-center justify-between gap-2">
        <h4 className="text-base font-extrabold text-white">🌟 {hi ? 'दिखाओ तुमने क्या सीखा' : 'Show what you know'}</h4>
        <button type="button" onClick={() => setOpen(false)} className="min-h-[44px] px-3 rounded-xl bg-slate-800 text-sm font-bold text-slate-200">
          {hi ? 'बाद में' : 'Later'}
        </button>
      </div>
      <AnswerPanel
        key={round}
        piece={{ id: `check-${chapterId}`, kind: 'story', title: '', lines: [], findWords: [], questions }}
        set={{ lang, skillId: skills[0], chapterId }}
        onStar={onStar}
        onRestart={() => setRound((r) => r + 1)}
      />
    </div>
  );
};
