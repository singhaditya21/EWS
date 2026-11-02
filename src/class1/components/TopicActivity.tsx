import React, { useMemo, useState } from 'react';
import { CardsSection, SortSection, TopicSection, TopicSet } from '../topicSets';
import { AnswerPanel, OrderPanel, StarFn, pillCls } from './ReadingActivity';
import { progress } from '../progressStore';
import { CLASS1_BOARD_MAP } from '../boardMap';
import { speakText } from '../../utils/speech';
import { playPop, playSuccessChime } from '../../utils/soundEffects';

const LANG = 'en-IN' as const;

/** Tap a card to hear it. Seeing every card earns the star. */
const CardsPanel: React.FC<{ section: CardsSection; chapterId: string; onStar: StarFn }> = ({ section, chapterId, onStar }) => {
  const [seen, setSeen] = useState<string[]>([]);
  const [active, setActive] = useState<string | null>(null);

  const tap = (name: string, fact: string) => {
    setActive(name);
    speakText(`${name}. ${fact}`, { lang: LANG, force: true });
    if (seen.includes(name)) return;
    const next = [...seen, name];
    setSeen(next);
    if (next.length === section.cards.length) {
      (CLASS1_BOARD_MAP[chapterId]?.skills ?? []).forEach((skill) => progress.recordSkillPlay(skill, chapterId));
      onStar('You looked at every card!', LANG, `${section.id}:cards`);
    }
  };

  return (
    <div className="space-y-2">
      <p className="text-sm text-slate-300">Tap each card to hear about it.</p>
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2">
        {section.cards.map((c) => (
          <button
            key={c.name}
            type="button"
            aria-pressed={active === c.name}
            onClick={() => tap(c.name, c.fact)}
            className={`min-h-[96px] p-3 rounded-2xl border-2 text-left ${
              active === c.name ? 'border-amber-300 bg-amber-500/15' : 'border-slate-700 bg-[#090D16] hover:border-cyan-400'
            }`}
          >
            <span className="text-4xl block" aria-hidden="true">
              {c.picture}
            </span>
            <span className="text-base font-extrabold text-white">
              {seen.includes(c.name) ? '✓ ' : ''}
              {c.name}
            </span>
            {active === c.name && <span className="block text-sm text-slate-200 mt-1">{c.fact}</span>}
          </button>
        ))}
      </div>
    </div>
  );
};

const shuffle = <T,>(xs: T[]) => [...xs].sort(() => Math.random() - 0.5);

/** One item at a time: tap the basket it belongs in. Only the first try counts. */
const SortPanel: React.FC<{ section: SortSection; chapterId: string; onStar: StarFn }> = ({ section, chapterId, onStar }) => {
  const [round, setRound] = useState(0);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const items = useMemo(() => shuffle(section.items), [section, round]);
  const [idx, setIdx] = useState(0);
  const [missed, setMissed] = useState(false);
  const [right, setRight] = useState(0);
  const [hint, setHint] = useState(false);
  const item = items[idx];

  const pick = (bucket: string) => {
    if (!item) return;
    if (bucket !== item.bucket) {
      playPop();
      setMissed(true);
      setHint(true);
      return;
    }
    playSuccessChime();
    speakText(item.text, { lang: LANG });
    progress.recordSkillResult(section.skillId, !missed, chapterId);
    const firstTry = missed ? 0 : 1;
    setRight((r) => r + firstTry);
    setMissed(false);
    setHint(false);
    if (idx + 1 >= items.length && right + firstTry >= Math.ceil(items.length / 2)) {
      onStar('Great sorting!', LANG, `${section.id}:sort`);
    }
    setIdx(idx + 1);
  };

  if (!item) {
    return (
      <div className="p-5 rounded-2xl bg-emerald-950/40 border border-emerald-400/50 text-center space-y-3">
        <p className="text-lg font-extrabold text-white">
          {right} out of {items.length} right the first time!
        </p>
        <button
          type="button"
          className={pillCls(false)}
          onClick={() => {
            setIdx(0);
            setRight(0);
            setRound((r) => r + 1);
          }}
        >
          Play again
        </button>
      </div>
    );
  }
  return (
    <div className="space-y-3">
      <div className="p-4 rounded-2xl bg-[#090D16] border border-cyan-500/40 flex items-center gap-3">
        <span className="text-5xl" aria-hidden="true">
          {item.picture}
        </span>
        <p className="flex-1 text-xl font-bold text-white">{item.text}</p>
        <button
          type="button"
          aria-label="Read aloud"
          onClick={() => speakText(item.text, { lang: LANG, force: true })}
          className="shrink-0 min-h-[44px] px-3 rounded-xl bg-cyan-500/20 border border-cyan-500/40 text-cyan-200"
        >
          🔊
        </button>
      </div>
      <div className={`grid gap-2 ${section.buckets.length === 3 ? 'grid-cols-3' : 'grid-cols-2'}`}>
        {section.buckets.map((b) => (
          <button
            key={b.id}
            type="button"
            onClick={() => pick(b.id)}
            className="min-h-[88px] p-3 rounded-2xl border-2 border-slate-700 bg-[#111827] hover:border-cyan-400 text-white"
          >
            <span className="text-3xl block" aria-hidden="true">
              {b.picture}
            </span>
            <span className="text-base font-extrabold">{b.label}</span>
          </button>
        ))}
      </div>
      <div className="flex items-center justify-between text-xs text-slate-400">
        <span>
          {idx + 1} of {items.length}
        </span>
        {hint && <span className="text-sm font-bold text-amber-200">Not that one. Try again!</span>}
      </div>
    </div>
  );
};

const SectionView: React.FC<{ section: TopicSection; chapterId: string; onStar: StarFn }> = ({ section, chapterId, onStar }) => {
  switch (section.kind) {
    case 'cards':
      return <CardsPanel section={section} chapterId={chapterId} onStar={onStar} />;
    case 'sort':
      return <SortPanel section={section} chapterId={chapterId} onStar={onStar} />;
    case 'order':
      return (
        <OrderPanel
          piece={{ id: section.id, kind: 'story', title: section.title, lines: section.steps, findWords: [], questions: [] }}
          set={{ lang: LANG, skillId: section.skillId, chapterId }}
          onStar={onStar}
        />
      );
    case 'choose':
      return (
        <AnswerPanel
          piece={{ id: section.id, kind: 'story', title: section.title, lines: [], findWords: [], questions: section.questions }}
          set={{ lang: LANG, skillId: section.skillId, chapterId }}
          onStar={onStar}
        />
      );
  }
};

/** Learn with cards, then sort, order or choose. */
export const TopicActivity: React.FC<{ set: TopicSet; onStar: StarFn }> = ({ set, onStar }) => {
  const [activeId, setActiveId] = useState(set.sections[0]?.id);
  const section = set.sections.find((s) => s.id === activeId) ?? set.sections[0];

  return (
    <div className="p-4 rounded-2xl bg-[#111827] border border-[#1F2937] space-y-4">
      <div className="phone-scroll-row flex flex-wrap gap-1.5" role="tablist">
        {set.sections.map((s) => (
          <button key={s.id} type="button" role="tab" aria-selected={s.id === section.id} onClick={() => setActiveId(s.id)} className={pillCls(s.id === section.id)}>
            {s.title}
          </button>
        ))}
      </div>
      <SectionView key={section.id} section={section} chapterId={set.chapterId} onStar={onStar} />
    </div>
  );
};
