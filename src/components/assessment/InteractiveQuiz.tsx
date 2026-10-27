import React, { useState, useEffect } from 'react';
import { QuizQuestion } from '../../types/curriculum.types';
import { CheckCircle2, XCircle, HelpCircle, Award, RotateCcw, Volume2, Trophy } from 'lucide-react';
import { playPop, playSuccessChime, playFanfare } from '../../utils/soundEffects';
import { speakText } from '../../utils/speech';
import { progress } from '../../class1/progressStore';

interface InteractiveQuizProps {
  questions: QuizQuestion[];
  chapterTitle: string;
  isCompleted?: boolean;
  onMarkComplete?: () => void;
  /** When set, each question's first attempt is saved to the child's progress. */
  chapterId?: string;
  /** Skill the first attempt counts toward (only when the chapter teaches a single skill). */
  skillId?: string;
}

export const InteractiveQuiz: React.FC<InteractiveQuizProps> = ({
  questions,
  chapterTitle,
  isCompleted = false,
  onMarkComplete,
  chapterId,
  skillId,
}) => {
  const [selectedAnswers, setSelectedAnswers] = useState<Record<string, number>>({});
  const [submitted, setSubmitted] = useState<Record<string, boolean>>({});

  useEffect(() => {
    setSelectedAnswers({});
    setSubmitted({});
  }, [chapterTitle, questions]);

  // Read-aloud taps are explicit, so they speak even when automatic voice is off.
  // Hindi questions are detected and read with a Hindi voice.
  const readAloud = (text: string) => speakText(text, { force: true });

  const handleSelect = (q: QuizQuestion, optionIdx: number) => {
    // Only the first attempt counts; use Reset to try the quiz again.
    if (submitted[q.id]) return;
    setSelectedAnswers((prev) => ({ ...prev, [q.id]: optionIdx }));
    setSubmitted((prev) => ({ ...prev, [q.id]: true }));
    if (chapterId) progress.recordQuizAttempt(q.id, chapterId, optionIdx === q.correctIndex, skillId);
    if (optionIdx === q.correctIndex) {
      playSuccessChime();
    } else {
      playPop();
    }
  };

  const handleReset = () => {
    setSelectedAnswers({});
    setSubmitted({});
  };

  const correctCount = questions.reduce((acc, q) => {
    if (submitted[q.id] && selectedAnswers[q.id] === q.correctIndex) {
      return acc + 1;
    }
    return acc;
  }, 0);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between p-3 rounded-xl bg-[#0D1322] border border-slate-800">
        <div className="flex items-center gap-2">
          <Award className="w-5 h-5 text-cyan-400" />
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-200">
              Board & Concept Mastery Check
            </h4>
            <p className="text-[11px] text-slate-400">
              Tap 🔊 to hear any question read aloud
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className="px-2.5 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-xs font-mono font-bold text-cyan-300">
            ⭐ {correctCount} / {questions.length}
          </span>
          <button
            type="button"
            onClick={handleReset}
            className="p-1.5 rounded-lg bg-slate-800 text-slate-300 hover:text-white hover:bg-slate-700 transition-colors"
            title="Reset Quiz"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {questions.length > 0 && correctCount === questions.length && (
        <div className="p-3.5 rounded-xl bg-gradient-to-r from-amber-500/20 via-emerald-500/20 to-cyan-500/20 border-2 border-amber-400 flex flex-wrap items-center justify-between gap-2 animate-pulse">
          <div className="flex items-center gap-2">
            <Trophy className="w-5 h-5 text-amber-400 shrink-0" />
            <div>
              <div className="text-xs font-black text-white">
                🏆 Perfect {correctCount}/{questions.length} Champion!
              </div>
              <div className="text-[11px] text-amber-200">
                You mastered every question in this lesson!
              </div>
            </div>
          </div>
          {onMarkComplete && !isCompleted && (
            <button
              type="button"
              onClick={() => {
                playFanfare();
                onMarkComplete();
              }}
              className="px-3 py-1.5 rounded-lg bg-emerald-400 text-slate-950 text-xs font-extrabold shadow-sm"
            >
              🌟 Mark Lesson Done!
            </button>
          )}
        </div>
      )}

      {questions.map((q, qIdx) => {
        const isAnswered = submitted[q.id];
        const chosen = selectedAnswers[q.id];
        const isCorrect = chosen === q.correctIndex;

        return (
          <div
            key={q.id}
            className="rounded-xl bg-[#090D16] border border-slate-800/90 p-3.5 space-y-3"
          >
            <div className="flex items-start justify-between gap-2">
              <div className="flex items-start gap-2">
                <span className="mt-0.5 w-5 h-5 rounded-full bg-slate-800 text-cyan-400 font-mono text-xs flex items-center justify-center shrink-0 font-bold">
                  {qIdx + 1}
                </span>
                <p className="text-xs sm:text-sm font-medium text-slate-100 leading-snug">
                  {q.question}
                </p>
              </div>
              <div className="flex items-center gap-1 shrink-0">
                <button
                  type="button"
                  onClick={() =>
                    readAloud(
                      `${q.question}. ${q.options
                        .map((o, i) => `Option ${String.fromCharCode(65 + i)}: ${o}.`)
                        .join(' ')}`
                    )
                  }
                  title="Read question aloud"
                  className="p-1.5 rounded-lg bg-cyan-500/15 border border-cyan-500/40 text-cyan-300 hover:bg-cyan-500/25 transition-colors"
                >
                  <Volume2 className="w-3.5 h-3.5" />
                </button>
                {q.boardTag && (
                  <span className="px-2 py-0.5 rounded text-[10px] font-mono font-semibold bg-slate-800 text-cyan-300 border border-slate-700">
                    {q.boardTag}
                  </span>
                )}
              </div>
            </div>

            <div className="space-y-1.5 pl-7">
              {q.options.map((opt, optIdx) => {
                const isThisSelected = chosen === optIdx;
                const isThisCorrect = q.correctIndex === optIdx;

                let btnStyle =
                  'bg-[#111827] border-slate-800 text-slate-300 hover:border-slate-600 hover:text-white';
                if (isAnswered) {
                  if (isThisCorrect) {
                    btnStyle =
                      'bg-emerald-950/40 border-emerald-500/60 text-emerald-200 font-medium';
                  } else if (isThisSelected && !isThisCorrect) {
                    btnStyle =
                      'bg-rose-950/40 border-rose-500/60 text-rose-200';
                  } else {
                    btnStyle = 'bg-[#111827]/50 border-slate-800/50 text-slate-500';
                  }
                }

                return (
                  <button
                    key={optIdx}
                    type="button"
                    onClick={() => handleSelect(q, optIdx)}
                    disabled={isAnswered}
                    className={`w-full text-left px-3 py-2 rounded-lg border text-xs transition-all flex items-center justify-between gap-2 disabled:cursor-default ${btnStyle}`}
                  >
                    <span>
                      <strong className="font-mono mr-2 opacity-75">
                        {String.fromCharCode(65 + optIdx)}.
                      </strong>
                      {opt}
                    </span>
                    {isAnswered && isThisCorrect && (
                      <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                    )}
                    {isAnswered && isThisSelected && !isThisCorrect && (
                      <XCircle className="w-4 h-4 text-rose-400 shrink-0" />
                    )}
                  </button>
                );
              })}
            </div>

            {isAnswered && (
              <div
                className={`ml-7 p-2.5 rounded-lg border text-xs leading-relaxed flex items-start justify-between gap-2 ${
                  isCorrect
                    ? 'bg-emerald-950/20 border-emerald-500/30 text-emerald-200'
                    : 'bg-amber-950/20 border-amber-500/30 text-amber-200'
                }`}
              >
                <div className="flex items-start gap-2">
                  <HelpCircle className="w-4 h-4 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold mr-1">
                      {isCorrect ? '🎉 Correct!' : '💡 Concept Insight:'}
                    </span>
                    {q.explanation}
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() =>
                    readAloud(`${isCorrect ? 'Correct!' : 'Let us learn:'} ${q.explanation}`)
                  }
                  className="p-1 rounded bg-slate-800/80 text-cyan-300 hover:text-white shrink-0"
                  title="Listen to explanation"
                >
                  <Volume2 className="w-3.5 h-3.5" />
                </button>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};
