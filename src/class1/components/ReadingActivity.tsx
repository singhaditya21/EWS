import React, { useEffect, useMemo, useRef, useState } from 'react';
import { PictureScene, ReadingPiece, ReadingSet, cleanWord } from '../readingSets';
import { progress } from '../progressStore';
import { cancelSpeech, speakText } from '../../utils/speech';
import { playPop, playSuccessChime } from '../../utils/soundEffects';

export type StarFn = (msg: string, lang: 'en-IN' | 'hi-IN', key: string) => void;
/** The parts of a reading set the order and question panels need; topic activities pass these too. */
type PanelSet = Pick<ReadingSet, 'lang' | 'skillId' | 'chapterId'>;
type Tab = 'read' | 'find' | 'order' | 'answer';

const shuffle = <T,>(xs: T[]) => {
  const a = [...xs];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
};

export const pillCls = (active: boolean) =>
  `min-h-[44px] px-3.5 py-2 rounded-xl text-sm font-extrabold border-2 transition-all ${
    active ? 'bg-cyan-500 text-slate-950 border-white' : 'bg-[#090D16] text-slate-200 border-slate-700 hover:border-cyan-400'
  }`;

/** One line of tappable words. In "find" mode a tap answers; otherwise it reads the word aloud. */
const TappableLine: React.FC<{
  text: string;
  lang: ReadingSet['lang'];
  active?: boolean;
  onWord?: (word: string) => void;
}> = ({ text, lang, active, onWord }) => (
  <p className={`flex flex-wrap gap-x-1.5 gap-y-1 ${lang === 'hi-IN' ? 'text-2xl sm:text-3xl' : 'text-xl sm:text-2xl'} font-bold leading-relaxed`}>
    {text.split(/\s+/).map((word, i) => (
      <button
        key={`${word}-${i}`}
        type="button"
        onClick={() => {
          if (onWord) onWord(word);
          else speakText(cleanWord(word), { lang, force: true, rate: 0.8 });
        }}
        className={`min-h-[44px] px-1 rounded-lg ${active ? 'bg-amber-400 text-slate-950' : 'text-white hover:bg-cyan-500/20'}`}
      >
        {word}
      </button>
    ))}
  </p>
);

const ReadPanel: React.FC<{ piece: ReadingPiece; set: ReadingSet; onStar: StarFn }> = ({ piece, set, onStar }) => {
  const [activeLine, setActiveLine] = useState<number | null>(null);
  const run = useRef(0);

  useEffect(
    () => () => {
      run.current += 1;
      cancelSpeech();
    },
    []
  );

  const readAll = () => {
    run.current += 1;
    const id = run.current;
    const step = (i: number) => {
      if (id !== run.current) return;
      if (i >= piece.lines.length) {
        setActiveLine(null);
        progress.recordSkillPlay(set.skillId, set.chapterId);
        onStar(set.lang === 'hi-IN' ? 'बहुत अच्छे! आपने पूरा पाठ सुना।' : 'Well done! You read along.', set.lang, `${piece.id}:read`);
        return;
      }
      setActiveLine(i);
      speakText(piece.lines[i].text, { lang: set.lang, force: true, rate: 0.8, onEnd: () => step(i + 1) });
    };
    step(0);
  };

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center gap-2">
        <button type="button" onClick={readAll} className={pillCls(true)}>
          🔊 {set.lang === 'hi-IN' ? 'पढ़कर सुनाओ' : 'Read it to me'}
        </button>
        <span className="text-xs text-slate-400">
          {set.lang === 'hi-IN' ? 'किसी भी शब्द को छूकर सुनो।' : 'Tap any word to hear it.'}
        </span>
      </div>
      {piece.lines.map((line, i) => (
        <div key={line.text} className="flex items-center gap-3 p-3 rounded-2xl bg-[#090D16] border border-slate-800">
          <span className="text-4xl shrink-0 w-14 text-center" aria-hidden="true">
            {line.picture}
          </span>
          <TappableLine text={line.text} lang={set.lang} active={activeLine === i} />
        </div>
      ))}
    </div>
  );
};

const FindPanel: React.FC<{ piece: ReadingPiece; set: ReadingSet; onStar: StarFn }> = ({ piece, set, onStar }) => {
  const words = useMemo(() => shuffle(piece.findWords), [piece]);
  const [idx, setIdx] = useState(0);
  const [missed, setMissed] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);
  const target = words[idx];
  const hi = set.lang === 'hi-IN';

  useEffect(() => {
    if (target) speakText(target, { lang: set.lang, force: true, rate: 0.8 });
  }, [target, set.lang]);

  const tap = (word: string) => {
    if (cleanWord(word) === cleanWord(target)) {
      playSuccessChime();
      progress.recordSkillResult(set.skillId, !missed, set.chapterId);
      setFeedback(null);
      setMissed(false);
      if (idx + 1 >= words.length) {
        onStar(hi ? 'शाबाश! आपने सारे शब्द ढूँढ लिए।' : 'Great! You found all the words.', set.lang, `${piece.id}:find`);
      }
      setIdx(idx + 1);
    } else {
      playPop();
      setMissed(true);
      setFeedback(hi ? `यह “${cleanWord(word)}” है। फिर ढूँढो!` : `That says “${cleanWord(word)}”. Look again!`);
    }
  };

  if (!target) {
    return (
      <div className="p-5 rounded-2xl bg-emerald-950/40 border border-emerald-400/50 text-center space-y-3">
        <p className="text-lg font-extrabold text-white">🎉 {hi ? 'सारे शब्द मिल गए!' : 'You found them all!'}</p>
        <button type="button" onClick={() => setIdx(0)} className={pillCls(false)}>
          {hi ? 'फिर से खेलो' : 'Play again'}
        </button>
      </div>
    );
  }
  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center gap-2 p-3 rounded-2xl bg-amber-500/15 border border-amber-400/50">
        <span className="text-sm font-bold text-amber-100">{hi ? 'यह शब्द ढूँढो:' : 'Find this word:'}</span>
        <button
          type="button"
          onClick={() => speakText(target, { lang: set.lang, force: true, rate: 0.8 })}
          className="min-h-[44px] px-3 rounded-xl bg-amber-400 text-slate-950 text-2xl font-black"
        >
          🔊 {target}
        </button>
        <span className="text-xs text-amber-200">
          {idx + 1} / {words.length}
        </span>
      </div>
      {piece.lines.map((line) => (
        <div key={line.text} className="p-3 rounded-2xl bg-[#090D16] border border-slate-800">
          <TappableLine text={line.text} lang={set.lang} onWord={tap} />
        </div>
      ))}
      {feedback && <p className="text-sm font-bold text-amber-200">{feedback}</p>}
    </div>
  );
};

export const OrderPanel: React.FC<{ piece: ReadingPiece; set: PanelSet; onStar: StarFn }> = ({ piece, set, onStar }) => {
  const [round, setRound] = useState(0);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const cards = useMemo(() => shuffle(piece.lines.map((_, i) => i)), [piece, round]);
  const [placed, setPlaced] = useState<number[]>([]);
  const [slipped, setSlipped] = useState(false);
  const [wrongCard, setWrongCard] = useState<number | null>(null);
  const hi = set.lang === 'hi-IN';
  const done = placed.length === piece.lines.length;

  const tap = (lineIdx: number) => {
    if (lineIdx === placed.length) {
      playPop();
      speakText(piece.lines[lineIdx].text, { lang: set.lang, rate: 0.85 });
      const next = [...placed, lineIdx];
      setPlaced(next);
      setWrongCard(null);
      if (next.length === piece.lines.length) {
        progress.recordSkillResult(set.skillId, !slipped, set.chapterId);
        onStar(hi ? 'वाह! कहानी सही क्रम में है।' : 'Well done! The story is in order.', set.lang, `${piece.id}:order`);
      }
    } else {
      playPop();
      setSlipped(true);
      setWrongCard(lineIdx);
    }
  };

  return (
    <div className="space-y-3">
      <p className="text-sm font-bold text-slate-200">
        {hi ? 'पहले क्या हुआ? तस्वीरों को सही क्रम में छुओ।' : 'What happened first? Tap the cards in the right order.'}
      </p>
      <ol className="space-y-1.5">
        {placed.map((lineIdx, i) => (
          <li key={lineIdx} className="flex items-center gap-2 p-2 rounded-xl bg-emerald-950/40 border border-emerald-500/50 text-white">
            <span className="font-mono font-black text-emerald-300">{i + 1}</span>
            <span className="text-2xl" aria-hidden="true">
              {piece.lines[lineIdx].picture}
            </span>
            <span className="text-base font-bold">{piece.lines[lineIdx].text}</span>
          </li>
        ))}
      </ol>
      {!done && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {cards
            .filter((i) => !placed.includes(i))
            .map((i) => (
              <button
                key={i}
                type="button"
                onClick={() => tap(i)}
                className={`min-h-[64px] p-3 rounded-2xl border-2 text-left flex items-center gap-3 ${
                  wrongCard === i ? 'border-rose-400 bg-rose-950/40' : 'border-slate-700 bg-[#090D16] hover:border-cyan-400'
                }`}
              >
                <span className="text-3xl" aria-hidden="true">
                  {piece.lines[i].picture}
                </span>
                <span className="text-base font-bold text-white">{piece.lines[i].text}</span>
              </button>
            ))}
        </div>
      )}
      {wrongCard !== null && !done && (
        <p className="text-sm font-bold text-amber-200">{hi ? 'अभी नहीं। सोचो, आगे क्या हुआ?' : 'Not yet. What happened next?'}</p>
      )}
      {done && (
        <button
          type="button"
          onClick={() => {
            setPlaced([]);
            setSlipped(false);
            setRound((r) => r + 1);
          }}
          className={pillCls(false)}
        >
          {hi ? 'फिर से खेलो' : 'Play again'}
        </button>
      )}
    </div>
  );
};

export const AnswerPanel: React.FC<{
  piece: ReadingPiece;
  set: PanelSet;
  onStar: StarFn;
  /** Replaces "try again" on the same questions, for rounds that draw new ones. */
  onRestart?: () => void;
}> = ({ piece, set, onStar, onRestart }) => {
  const [idx, setIdx] = useState(0);
  // Only the first time through counts: repeating known answers shouldn't raise a skill.
  const [firstPass, setFirstPass] = useState(true);
  const [picked, setPicked] = useState<number | null>(null);
  const [score, setScore] = useState(0);
  const hi = set.lang === 'hi-IN';
  const q = piece.questions[idx];

  if (!q) {
    return (
      <div className="p-5 rounded-2xl bg-emerald-950/40 border border-emerald-400/50 text-center space-y-3">
        <p className="text-lg font-extrabold text-white">
          {hi ? `${piece.questions.length} में से ${score} सही!` : `${score} out of ${piece.questions.length} right!`}
        </p>
        <button
          type="button"
          onClick={() => {
            if (onRestart) {
              onRestart();
              return;
            }
            setIdx(0);
            setScore(0);
            setPicked(null);
            setFirstPass(false);
          }}
          className={pillCls(false)}
        >
          {hi ? 'फिर से करो' : 'Try again'}
        </button>
      </div>
    );
  }
  return (
    <div className="space-y-3">
      <div className="flex items-start justify-between gap-2 p-3 rounded-2xl bg-[#090D16] border border-cyan-500/40">
        <p className={`${hi ? 'text-xl sm:text-2xl' : 'text-lg sm:text-xl'} font-bold text-white`}>{q.prompt}</p>
        <button
          type="button"
          aria-label="Read the question aloud"
          onClick={() => speakText(q.prompt, { lang: set.lang, force: true })}
          className="shrink-0 min-h-[44px] px-3 rounded-xl bg-cyan-500/20 border border-cyan-500/40 text-cyan-200"
        >
          🔊
        </button>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
        {q.options.map((opt, i) => {
          const state =
            picked === null
              ? 'border-slate-700 bg-[#111827] text-white hover:border-cyan-400'
              : i === q.answer
              ? 'border-emerald-400 bg-emerald-500/20 text-emerald-100'
              : i === picked
              ? 'border-rose-400 bg-rose-500/20 text-rose-100'
              : 'border-slate-800 bg-[#111827]/50 text-slate-500';
          return (
            <button
              key={opt}
              type="button"
              disabled={picked !== null}
              onClick={() => {
                setPicked(i);
                const ok = i === q.answer;
                if (firstPass) progress.recordSkillResult(q.skillId ?? set.skillId, ok, set.chapterId);
                if (ok) {
                  setScore((s) => s + 1);
                  playSuccessChime();
                } else {
                  playPop();
                }
              }}
              className={`min-h-[56px] p-3 rounded-2xl border-2 text-lg font-extrabold text-left ${state}`}
            >
              {opt}
            </button>
          );
        })}
      </div>
      {picked !== null && (
        <div className="flex flex-wrap items-center justify-between gap-2 p-3 rounded-xl bg-[#090D16] border border-slate-800">
          <p className="text-base text-slate-200">{q.explain}</p>
          <button
            type="button"
            onClick={() => {
              const last = idx + 1 >= piece.questions.length;
              if (last && score >= Math.ceil(piece.questions.length / 2)) {
                onStar(hi ? 'बहुत बढ़िया!' : 'Very good!', set.lang, `${piece.id}:answer`);
              }
              setPicked(null);
              setIdx(idx + 1);
            }}
            className={pillCls(true)}
          >
            {hi ? 'आगे →' : 'Next →'}
          </button>
        </div>
      )}
    </div>
  );
};

const PieceView: React.FC<{ piece: ReadingPiece; set: ReadingSet; onStar: StarFn }> = ({ piece, set, onStar }) => {
  const [tab, setTab] = useState<Tab>('read');
  const hi = set.lang === 'hi-IN';
  const tabs: { id: Tab; label: string }[] = [
    { id: 'read', label: hi ? '📖 पढ़ो' : '📖 Read' },
    { id: 'find', label: hi ? '🔎 शब्द ढूँढो' : '🔎 Find words' },
    ...(piece.kind === 'story' ? [{ id: 'order' as Tab, label: hi ? '🔢 क्रम लगाओ' : '🔢 Put in order' }] : []),
    { id: 'answer', label: hi ? '❓ उत्तर दो' : '❓ Answer' },
  ];
  return (
    <div className="space-y-3">
      <div className="flex flex-wrap gap-1.5" role="tablist">
        {tabs.map((t) => (
          <button key={t.id} type="button" role="tab" aria-selected={tab === t.id} onClick={() => setTab(t.id)} className={pillCls(tab === t.id)}>
            {t.label}
          </button>
        ))}
      </div>
      {tab === 'read' && <ReadPanel piece={piece} set={set} onStar={onStar} />}
      {tab === 'find' && <FindPanel piece={piece} set={set} onStar={onStar} />}
      {tab === 'order' && <OrderPanel piece={piece} set={set} onStar={onStar} />}
      {tab === 'answer' && <AnswerPanel piece={piece} set={set} onStar={onStar} />}
    </div>
  );
};

const NUMBER_WORDS = ['zero', 'one', 'two', 'three', 'four', 'five', 'six'];

/** Talk about a picture: look and say, find an object, count objects. */
const SceneView: React.FC<{ scene: PictureScene; set: ReadingSet; onStar: StarFn }> = ({ scene, set, onStar }) => {
  const [activity, setActivity] = useState<'look' | 'find' | 'count'>('look');
  const [said, setSaid] = useState<string | null>(null);
  const [turn, setTurn] = useState(0);
  const [missed, setMissed] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);

  const tiles = useMemo(
    () => shuffle(scene.objects.flatMap((o) => Array.from({ length: o.count }, (_, i) => ({ o, key: `${o.name}-${i}` })))),
    [scene]
  );
  const order = useMemo(() => shuffle(scene.objects), [scene, activity]); // eslint-disable-line react-hooks/exhaustive-deps
  const target = order[turn];

  const sentence = (o: PictureScene['objects'][number]) =>
    o.count === 1
      ? `I can see ${/^[aeiou]/.test(o.name) ? 'an' : 'a'} ${o.name}.`
      : `I can see ${NUMBER_WORDS[o.count]} ${o.plural}.`;

  useEffect(() => {
    setTurn(0);
    setFeedback(null);
    setMissed(false);
    setSaid(null);
  }, [activity, scene]);

  useEffect(() => {
    if (activity === 'find' && target) speakText(`Tap the ${target.name}.`, { lang: 'en-IN', force: true });
    if (activity === 'count' && target) speakText(`How many ${target.plural}?`, { lang: 'en-IN', force: true });
  }, [activity, target]);

  const finishTurn = (ok: boolean) => {
    playSuccessChime();
    progress.recordSkillResult(set.skillId, ok, set.chapterId);
    setMissed(false);
    setFeedback(null);
    if (turn + 1 >= order.length) onStar('Super talking about the picture!', 'en-IN', `${scene.id}:${activity}`);
    setTurn(turn + 1);
  };

  const tapTile = (o: PictureScene['objects'][number]) => {
    if (activity === 'look') {
      const text = sentence(o);
      setSaid(text);
      speakText(text, { lang: 'en-IN', force: true });
    } else if (activity === 'find' && target) {
      if (o.name === target.name) finishTurn(!missed);
      else {
        playPop();
        setMissed(true);
        setFeedback(`That is ${/^[aeiou]/.test(o.name) ? 'an' : 'a'} ${o.name}. Look again!`);
      }
    }
  };

  const allDone = activity !== 'look' && !target;

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap gap-1.5" role="tablist">
        {(
          [
            ['look', '👀 Look and say'],
            ['find', '🔎 Find it'],
            ['count', '🔢 How many?'],
          ] as const
        ).map(([id, label]) => (
          <button key={id} type="button" role="tab" aria-selected={activity === id} onClick={() => setActivity(id)} className={pillCls(activity === id)}>
            {label}
          </button>
        ))}
      </div>

      <div className="p-3 rounded-2xl bg-gradient-to-b from-sky-900/50 to-emerald-900/50 border border-slate-700">
        <div className="grid grid-cols-5 sm:grid-cols-7 gap-1.5">
          {tiles.map(({ o, key }) => (
            <button
              key={key}
              type="button"
              onClick={() => tapTile(o)}
              aria-label={o.name}
              className="aspect-square min-h-[44px] rounded-xl text-3xl sm:text-4xl hover:bg-white/10"
            >
              {o.picture}
            </button>
          ))}
        </div>
      </div>

      {activity === 'look' && (
        <p className="min-h-[3rem] p-3 rounded-xl bg-[#090D16] border border-slate-800 text-xl font-bold text-white">
          {said ?? 'Tap a picture and say what you see!'}
        </p>
      )}
      {activity === 'find' && target && (
        <div className="p-3 rounded-xl bg-amber-500/15 border border-amber-400/50 text-xl font-bold text-amber-100">
          Tap the {target.name}. {feedback && <span className="block text-sm">{feedback}</span>}
        </div>
      )}
      {activity === 'count' && target && (
        <div className="p-3 rounded-xl bg-amber-500/15 border border-amber-400/50 space-y-2">
          <p className="text-xl font-bold text-amber-100">How many {target.plural}?</p>
          <div className="flex flex-wrap gap-2">
            {[1, 2, 3, 4, 5].map((n) => (
              <button
                key={n}
                type="button"
                onClick={() => {
                  if (n === target.count) {
                    speakText(sentence(target), { lang: 'en-IN', force: true });
                    finishTurn(!missed);
                  } else {
                    playPop();
                    setMissed(true);
                    setFeedback('Count them one by one!');
                  }
                }}
                className="w-14 h-14 rounded-xl bg-[#090D16] border-2 border-slate-700 hover:border-cyan-400 text-2xl font-black text-white"
              >
                {n}
              </button>
            ))}
          </div>
          {feedback && <p className="text-sm font-bold text-amber-200">{feedback}</p>}
        </div>
      )}
      {allDone && (
        <div className="p-4 rounded-2xl bg-emerald-950/40 border border-emerald-400/50 text-center">
          <p className="text-lg font-extrabold text-white">🎉 All done! Try another activity.</p>
        </div>
      )}
    </div>
  );
};

/** Stories, poems and picture talk for one chapter. */
export const ReadingActivity: React.FC<{ set: ReadingSet; onStar: StarFn }> = ({ set, onStar }) => {
  const items = [
    ...(set.scenes ?? []).map((s) => ({ id: s.id, title: `🖼️ ${s.title}` })),
    ...set.pieces.map((p) => ({ id: p.id, title: `${p.kind === 'poem' ? '🎵' : '📖'} ${p.title}` })),
  ];
  const [activeId, setActiveId] = useState(items[0]?.id);
  const scene = set.scenes?.find((s) => s.id === activeId);
  const piece = set.pieces.find((p) => p.id === activeId);

  return (
    <div className="p-4 rounded-2xl bg-[#111827] border border-[#1F2937] space-y-4">
      <div className="flex flex-wrap gap-1.5">
        {items.map((item) => (
          <button key={item.id} type="button" onClick={() => setActiveId(item.id)} className={pillCls(item.id === activeId)}>
            {item.title}
          </button>
        ))}
      </div>
      {scene && <SceneView key={scene.id} scene={scene} set={set} onStar={onStar} />}
      {piece && <PieceView key={piece.id} piece={piece} set={set} onStar={onStar} />}
    </div>
  );
};
