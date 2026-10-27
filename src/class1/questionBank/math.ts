// Math practice is generated, not hand-written: every question is computed, so the
// answer is always right and a child never sees the same sum twice in a row.
import { BankQuestion, QuestionGenerator } from './types';

const rng = (seed: number) => {
  let t = seed >>> 0;
  return () => {
    t += 0x6d2b79f5;
    let x = Math.imul(t ^ (t >>> 15), 1 | t);
    x ^= x + Math.imul(x ^ (x >>> 7), 61 | x);
    return ((x ^ (x >>> 14)) >>> 0) / 4294967296;
  };
};
type Rand = () => number;
const int = (r: Rand, lo: number, hi: number) => lo + Math.floor(r() * (hi - lo + 1));
const pick = <T,>(r: Rand, xs: readonly T[]) => xs[Math.floor(r() * xs.length)];

/** Shuffles the correct option in among the distractors and returns its index. */
const arrange = (r: Rand, correct: string, distractors: string[]) => {
  const opts = [correct, ...distractors.filter((d, i, a) => d !== correct && a.indexOf(d) === i)];
  for (let i = opts.length - 1; i > 0; i--) {
    const j = Math.floor(r() * (i + 1));
    [opts[i], opts[j]] = [opts[j], opts[i]];
  }
  return { options: opts, answer: opts.indexOf(correct) };
};

/** Three nearby wrong numbers inside [lo, hi]. */
const nearNumbers = (r: Rand, ans: number, lo: number, hi: number) => {
  const out = new Set<number>();
  const deltas = [1, -1, 2, -2, 3, -3, 10, -10];
  while (out.size < 3) {
    const d = pick(r, deltas);
    const v = ans + d;
    if (v >= lo && v <= hi && v !== ans) out.add(v);
    if (out.size < 3 && deltas.every((dd) => ans + dd < lo || ans + dd > hi || out.has(ans + dd))) break;
  }
  return [...out].map(String);
};

const q = (
  skillId: string,
  seed: number,
  prompt: string,
  r: Rand,
  correct: string,
  distractors: string[],
  explain: string
): BankQuestion => ({ id: `${skillId}#${seed}`, skillId, prompt, ...arrange(r, correct, distractors), explain });

const COUNT_ICONS = ['⭐', '🍎', '🐟', '🎈', '🌼', '🚗'];
const PATTERN_SETS = [
  ['🔴', '🔵', '🟡'],
  ['⭐', '🌙', '☀️'],
  ['🍎', '🍌', '🍇'],
  ['🔺', '🟦', '⚪'],
];
const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
const ORDINALS = ['1st', '2nd', '3rd', '4th', '5th', '6th', '7th', '8th', '9th', '10th'];
const LINE_ANIMALS = ['Dog', 'Cat', 'Rabbit', 'Frog', 'Monkey', 'Duck', 'Cow', 'Horse'];

const POSITION_FACTS: [string, string, string[]][] = [
  ['Your pencils are kept in the pencil box. Where are the pencils?', 'Inside the box', ['Outside the box', 'Under the box']],
  ['A cat is sleeping below the table. Where is the cat?', 'Under the table', ['On the table', 'Inside the table']],
  ['A cup is kept on top of the table. Where is the cup?', 'On the table', ['Under the table', 'Far from the table']],
  ['You can touch the tree from where you stand. Are you near or far?', 'Near the tree', ['Far from the tree', 'Under the tree']],
  ['The bird flew high above the house. Where is the bird?', 'Above the house', ['Below the house', 'Inside the house']],
  ['The dog is waiting outside the door, not in the room. Where is the dog?', 'Outside the room', ['Inside the room', 'On the room']],
];
const SHAPE_FACTS: [string, string, string[]][] = [
  ['Which of these can only ROLL?', 'Ball', ['Box', 'Book']],
  ['Which of these can only SLIDE?', 'Box', ['Ball', 'Marble']],
  ['Which of these can both ROLL and SLIDE?', 'Tin can', ['Ball', 'Book']],
  ['How many corners does a triangle have?', '3', ['4', '0', '5']],
  ['How many corners does a square have?', '4', ['3', '0', '6']],
  ['Which shape has no corners?', 'Circle', ['Square', 'Triangle', 'Rectangle']],
  ['A birthday cap looks like which solid shape?', 'Cone', ['Cube', 'Sphere', 'Cylinder']],
  ['A dice looks like which solid shape?', 'Cube', ['Cone', 'Sphere', 'Cylinder']],
];
const MEASURE_FACTS: [string, string, string[]][] = [
  ['Which is HEAVIER?', 'Elephant', ['Ant', 'Feather']],
  ['Which is LIGHTER?', 'Feather', ['Brick', 'Watermelon']],
  ['Which is TALLER?', 'Tree', ['Grass', 'Flower']],
  ['Which is LONGER?', 'Train', ['Pencil', 'Spoon']],
  ['Which can hold MORE water?', 'Bucket', ['Cup', 'Spoon']],
  ['Which is SHORTER?', 'Crayon', ['Door', 'Bus']],
  ['On a pan balance, the side that goes DOWN is…', 'Heavier', ['Lighter', 'Equal']],
];

export const MATH_GENERATORS: Record<string, QuestionGenerator> = {
  'm.position': (seed) => {
    const r = rng(seed);
    const [p, c, d] = pick(r, POSITION_FACTS);
    return q('m.position', seed, p, r, c, d, `The answer is "${c}".`);
  },
  'm.count20': (seed) => {
    const r = rng(seed);
    const n = int(r, 3, 20);
    const icon = pick(r, COUNT_ICONS);
    return q('m.count20', seed, `How many? ${icon.repeat(n)}`, r, String(n), nearNumbers(r, n, 1, 20), `Count one by one: there are ${n}.`);
  },
  'm.compare': (seed) => {
    const r = rng(seed);
    const a = int(r, 1, 50);
    let b = int(r, 1, 50);
    if (r() < 0.15) b = a;
    const sign = a > b ? '>' : a < b ? '<' : '=';
    const word = sign === '>' ? 'greater than' : sign === '<' ? 'less than' : 'equal to';
    return q('m.compare', seed, `Choose the sign: ${a} __ ${b}`, r, sign, ['>', '<', '='], `${a} is ${word} ${b}, so we write ${a} ${sign} ${b}.`);
  },
  'm.make10': (seed) => {
    const r = rng(seed);
    const a = int(r, 0, 10);
    return q('m.make10', seed, `${a} + ? = 10`, r, String(10 - a), nearNumbers(r, 10 - a, 0, 10), `${a} and ${10 - a} make 10.`);
  },
  'm.add20': (seed) => {
    const r = rng(seed);
    const a = int(r, 1, 15);
    const b = int(r, 0, 20 - a);
    return q('m.add20', seed, `${a} + ${b} = ?`, r, String(a + b), nearNumbers(r, a + b, 0, 20), `Start at ${a} and hop forward ${b}: ${a + b}.`);
  },
  'm.sub20': (seed) => {
    const r = rng(seed);
    const a = int(r, 2, 20);
    const b = int(r, 0, a);
    return q('m.sub20', seed, `${a} − ${b} = ?`, r, String(a - b), nearNumbers(r, a - b, 0, 20), `Start at ${a} and hop back ${b}: ${a - b}.`);
  },
  'm.placevalue': (seed) => {
    const r = rng(seed);
    const n = int(r, 11, 99);
    const t = Math.floor(n / 10);
    const o = n % 10;
    if (r() < 0.5) {
      return q('m.placevalue', seed, `${t} tens and ${o} ones make which number?`, r, String(n), [String(o * 10 + t), String(n + 10 <= 99 ? n + 10 : n - 10), String(t + o)], `${t} tens = ${t * 10}, plus ${o} ones = ${n}.`);
    }
    return q('m.placevalue', seed, `How many TENS are in ${n}?`, r, String(t), nearNumbers(r, t, 0, 9), `${n} = ${t} tens and ${o} ones.`);
  },
  'm.skipcount': (seed) => {
    const r = rng(seed);
    const step = pick(r, [2, 5, 10] as const);
    const start = step * int(r, 0, 4);
    const seq = [0, 1, 2, 3, 4].map((i) => start + i * step);
    const hole = int(r, 1, 3);
    const shown = seq.map((v, i) => (i === hole ? '__' : String(v))).join(', ');
    const ans = seq[hole];
    return q('m.skipcount', seed, `Count by ${step}s: ${shown}`, r, String(ans), [String(ans + 1), String(ans - 1), String(ans + step)].filter((x) => Number(x) >= 0), `We add ${step} each time, so the missing number is ${ans}.`);
  },
  'm.order': (seed) => {
    const r = rng(seed);
    const n = int(r, 2, 98);
    const kind = pick(r, ['after', 'before', 'between'] as const);
    if (kind === 'after') return q('m.order', seed, `Which number comes just AFTER ${n}?`, r, String(n + 1), [String(n - 1), String(n + 2), String(n + 10 <= 99 ? n + 10 : n - 10)], `Just after ${n} comes ${n + 1}.`);
    if (kind === 'before') return q('m.order', seed, `Which number comes just BEFORE ${n}?`, r, String(n - 1), [String(n + 1), String(n - 2), String(n - 10 >= 1 ? n - 10 : n + 10)], `Just before ${n} comes ${n - 1}.`);
    return q('m.order', seed, `Which number comes BETWEEN ${n - 1} and ${n + 1}?`, r, String(n), [String(n + 2), String(n - 2), String(n + 10 <= 99 ? n + 10 : n - 10)], `${n - 1}, ${n}, ${n + 1}.`);
  },
  'm.evenodd': (seed) => {
    const r = rng(seed);
    const n = int(r, 1, 20);
    const even = n % 2 === 0;
    return q('m.evenodd', seed, `Make pairs with ${n} socks. Is ${n} EVEN or ODD?`, r, even ? 'Even' : 'Odd', [even ? 'Odd' : 'Even'], even ? `Every sock has a partner, so ${n} is even.` : `One sock is left without a partner, so ${n} is odd.`);
  },
  'm.shapes': (seed) => {
    const r = rng(seed);
    const [p, c, d] = pick(r, SHAPE_FACTS);
    return q('m.shapes', seed, p, r, c, d, `The answer is ${c}.`);
  },
  'm.patterns': (seed) => {
    const r = rng(seed);
    const set = pick(r, PATTERN_SETS);
    const unit = pick(r, [[0, 1], [0, 0, 1], [0, 1, 2], [0, 1, 1]]);
    const len = unit.length * 2 + int(r, 0, unit.length - 1);
    const seq = Array.from({ length: len + 1 }, (_, i) => set[unit[i % unit.length]]);
    const ans = seq[len];
    return q('m.patterns', seed, `What comes next? ${seq.slice(0, len).join(' ')} __`, r, ans, set.filter((s) => s !== ans), `The pattern repeats ${unit.map((u) => set[u]).join(' ')}, so next is ${ans}.`);
  },
  'm.measure': (seed) => {
    const r = rng(seed);
    const [p, c, d] = pick(r, MEASURE_FACTS);
    return q('m.measure', seed, p, r, c, d, `The answer is ${c}.`);
  },
  'm.time': (seed) => {
    const r = rng(seed);
    const h = int(r, 1, 12);
    const kind = pick(r, ['oclock', 'half', 'day'] as const);
    if (kind === 'oclock') {
      return q('m.time', seed, `The long hand is at 12 and the short hand is at ${h}. What time is it?`, r, `${h} o’clock`, [`Half past ${h}`, `12 o’clock`, `${(h % 12) + 1} o’clock`], `When the long hand is at 12, it is ${h} o’clock.`);
    }
    if (kind === 'half') {
      const next = (h % 12) + 1;
      return q('m.time', seed, `The long hand is at 6 and the short hand is between ${h} and ${next}. What time is it?`, r, `Half past ${h}`, [`${h} o’clock`, `Half past ${next}`, `${next} o’clock`], `Long hand at 6 means half past; the short hand has just passed ${h}.`);
    }
    const d = int(r, 0, 6);
    const after = DAYS[(d + 1) % 7];
    return q('m.time', seed, `Which day comes after ${DAYS[d]}?`, r, after, DAYS.filter((x) => x !== after && x !== DAYS[d]).slice(0, 3), `After ${DAYS[d]} comes ${after}.`);
  },
  'm.money': (seed) => {
    const r = rng(seed);
    if (r() < 0.5) {
      const coins = Array.from({ length: int(r, 2, 4) }, () => pick(r, [1, 2, 5, 10]));
      const total = coins.reduce((a, b) => a + b, 0);
      return q('m.money', seed, `How much money? ${coins.map((c) => `₹${c}`).join(' + ')}`, r, `₹${total}`, nearNumbers(r, total, 1, 40).map((x) => `₹${x}`), `${coins.join(' + ')} = ${total} rupees.`);
    }
    const [coin, target] = pick(r, [[2, 10], [5, 10], [5, 20], [10, 20], [2, 6], [1, 5], [2, 8], [10, 50]] as const);
    const n = target / coin;
    return q('m.money', seed, `How many ₹${coin} coins make ₹${target}?`, r, String(n), nearNumbers(r, n, 1, 10), `${Array(n).fill(coin).join(' + ')} = ${target}.`);
  },
  'm.data': (seed) => {
    const r = rng(seed);
    const toys = ['Cars', 'Dolls', 'Balls', 'Kites'];
    const icons = ['🚗', '🧸', '⚽', '🪁'];
    const counts = toys.map(() => int(r, 1, 8));
    // Make the most/least unique so there is exactly one right answer.
    const max = Math.max(...counts);
    const min = Math.min(...counts);
    const graph = toys.map((t, i) => `${t}: ${icons[i].repeat(counts[i])}`).join('   ');
    const kind = pick(r, ['most', 'least', 'howmany'] as const);
    if (kind === 'howmany' || counts.filter((c) => c === (kind === 'most' ? max : min)).length > 1) {
      const i = int(r, 0, 3);
      return q('m.data', seed, `${graph} — How many ${toys[i]}?`, r, String(counts[i]), nearNumbers(r, counts[i], 0, 10), `Count the ${toys[i]} row: ${counts[i]}.`);
    }
    const i = counts.indexOf(kind === 'most' ? max : min);
    return q('m.data', seed, `${graph} — Which toy is there the ${kind.toUpperCase()}?`, r, toys[i], toys.filter((t) => t !== toys[i]), `${toys[i]} has the ${kind === 'most' ? 'longest' : 'shortest'} row.`);
  },
  'm.ordinal': (seed) => {
    const r = rng(seed);
    const line = [...LINE_ANIMALS].sort(() => r() - 0.5).slice(0, 5);
    const pos = int(r, 0, 4);
    return q('m.ordinal', seed, `In the line ${line.join(', ')} (from the front), who is ${ORDINALS[pos]}?`, r, line[pos], line.filter((_, i) => i !== pos).slice(0, 3), `Count from the front: ${line[pos]} is ${ORDINALS[pos]}.`);
  },
  'm.groups': (seed) => {
    const r = rng(seed);
    const g = int(r, 2, 5);
    const k = int(r, 2, 5);
    return q('m.groups', seed, `${g} plates have ${k} laddoos each. How many laddoos in all?`, r, String(g * k), nearNumbers(r, g * k, 1, 30), `${Array(g).fill(k).join(' + ')} = ${g * k}.`);
  },
  'm.halves': (seed) => {
    const r = rng(seed);
    const n = 2 * int(r, 1, 10);
    return q('m.halves', seed, `Share ${n} sweets equally between 2 friends. How many does each get?`, r, String(n / 2), nearNumbers(r, n / 2, 0, 20), `Half of ${n} is ${n / 2}.`);
  },
  'm.wordproblem': (seed) => {
    const r = rng(seed);
    const name = pick(r, ['Riya', 'Aarav', 'Meera', 'Kabir', 'Zoya', 'Arjun']);
    const thing = pick(r, ['apples', 'balloons', 'pencils', 'marbles', 'stickers']);
    if (r() < 0.5) {
      const a = int(r, 2, 12);
      const b = int(r, 1, 20 - a);
      return q('m.wordproblem', seed, `${name} has ${a} ${thing}. Mother gives ${b} more. How many ${thing} ALTOGETHER?`, r, String(a + b), nearNumbers(r, a + b, 0, 20), `"Altogether" means add: ${a} + ${b} = ${a + b}.`);
    }
    const a = int(r, 5, 20);
    const b = int(r, 1, a - 1);
    return q('m.wordproblem', seed, `${name} had ${a} ${thing}. ${b} were given away. How many are LEFT?`, r, String(a - b), nearNumbers(r, a - b, 0, 20), `"Left" means take away: ${a} − ${b} = ${a - b}.`);
  },
  'm.tables': (seed) => {
    const r = rng(seed);
    const t = pick(r, [2, 5, 10] as const);
    const n = int(r, 1, 10);
    return q('m.tables', seed, `${t} × ${n} = ?`, r, String(t * n), nearNumbers(r, t * n, 0, 100), `${n} groups of ${t} make ${t * n}.`);
  },
};
