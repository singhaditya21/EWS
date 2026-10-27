// Content checks for Class 1. Run with `npm run check:content` (also runs before `npm run build`).
// Fails on data mistakes a child would notice: wrong answer indexes, answers given away by a
// marker only the correct option has, duplicate ids, unknown skills, broken chapter numbering.
import { build } from 'esbuild';
import { mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { pathToFileURL } from 'node:url';

const entry = `
export { CURRICULUM_DATA } from './src/data/curriculum';
export { CURATED_QUESTIONS, MATH_GENERATORS } from './src/class1/questionBank';
export { CLASS1_SKILLS } from './src/class1/skills';
export { CLASS1_BOARD_MAP } from './src/class1/boardMap';
`;
const dir = mkdtempSync(join(tmpdir(), 'omnilearn-check-'));
const out = join(dir, 'bundle.mjs');
await build({
  stdin: { contents: entry, resolveDir: process.cwd(), loader: 'ts' },
  bundle: true,
  format: 'esm',
  platform: 'node',
  outfile: out,
  logLevel: 'error',
  external: ['react'],
});
const m = await import(pathToFileURL(out).href);
rmSync(dir, { recursive: true, force: true });

const errors = [];
const fail = (msg) => errors.push(msg);
const MARKER = /\p{Extended_Pictographic}|✅|✓|🎯|!\)/u;

const checkOptions = (where, options, answer) => {
  if (!Array.isArray(options) || options.length < 2 || options.length > 4) fail(`${where}: needs 2–4 options`);
  if (!(answer >= 0 && answer < options.length)) fail(`${where}: answer index ${answer} out of range`);
  if (options.some((o) => !String(o).trim())) fail(`${where}: empty option`);
  if (new Set(options).size !== options.length) fail(`${where}: duplicate options`);
  const marked = options.map((o) => MARKER.test(o));
  const n = marked.filter(Boolean).length;
  if (n === 1 && marked[answer]) fail(`${where}: only the correct option has a marker (gives the answer away)`);
};

// Curriculum (Class 1)
const class1 = m.CURRICULUM_DATA.filter((c) => c.classLevel === 1);
const ids = m.CURRICULUM_DATA.map((c) => c.id);
ids.filter((x, i) => ids.indexOf(x) !== i).forEach((x) => fail(`curriculum: duplicate chapter id ${x}`));
const numbers = class1.map((c) => c.chapterNumber);
numbers.filter((x, i) => numbers.indexOf(x) !== i).forEach((x) => fail(`curriculum: duplicate chapterNumber ${x}`));
for (const c of class1) {
  for (const q of c.quiz) checkOptions(`quiz ${c.id}/${q.id}`, q.options, q.correctIndex);
}

// Skills and board map
const skillIds = new Set(m.CLASS1_SKILLS.map((s) => s.id));
if (skillIds.size !== m.CLASS1_SKILLS.length) fail('skills: duplicate skill ids');
for (const c of class1) {
  const entry = m.CLASS1_BOARD_MAP[c.id];
  if (!entry) {
    fail(`boardMap: missing entry for ${c.id}`);
    continue;
  }
  entry.skills.forEach((s) => skillIds.has(s) || fail(`boardMap ${c.id}: unknown skill ${s}`));
  for (const b of ['CBSE', 'ICSE']) {
    if (!entry[b]?.status) fail(`boardMap ${c.id}: missing ${b} status`);
  }
}
Object.keys(m.CLASS1_BOARD_MAP).forEach((id) => class1.some((c) => c.id === id) || fail(`boardMap: ${id} is not a Class 1 chapter`));

// Curated question bank
const qIds = m.CURATED_QUESTIONS.map((q) => q.id);
qIds.filter((x, i) => qIds.indexOf(x) !== i).forEach((x) => fail(`bank: duplicate question id ${x}`));
for (const q of m.CURATED_QUESTIONS) {
  const where = `bank ${q.id}`;
  if (!skillIds.has(q.skillId)) fail(`${where}: unknown skill ${q.skillId}`);
  if (!q.prompt?.trim() || !q.explain?.trim()) fail(`${where}: empty prompt or explanation`);
  checkOptions(where, q.options, q.answer);
}
// Answer position should not always be the same within a skill.
const bySkill = {};
for (const q of m.CURATED_QUESTIONS) (bySkill[q.skillId] ??= []).push(q.answer);
for (const [s, answers] of Object.entries(bySkill)) {
  if (answers.length >= 4 && new Set(answers).size === 1) fail(`bank ${s}: correct answer is always option ${answers[0] + 1}`);
}

// Math generators: run many seeds per generator.
for (const [skill, gen] of Object.entries(m.MATH_GENERATORS)) {
  if (!skillIds.has(skill)) fail(`math: generator for unknown skill ${skill}`);
  for (let seed = 1; seed <= 300; seed++) {
    let q;
    try {
      q = gen(seed);
    } catch (e) {
      fail(`math ${skill} seed ${seed}: threw ${e.message}`);
      break;
    }
    checkOptions(`math ${skill} seed ${seed}`, q.options, q.answer);
    if (q.skillId !== skill) fail(`math ${skill}: wrong skillId ${q.skillId}`);
  }
}

// Coverage: every skill taught by a chapter should have practice questions.
const practiced = new Set([...Object.keys(m.MATH_GENERATORS), ...m.CURATED_QUESTIONS.map((q) => q.skillId)]);
const thin = [...skillIds].filter((s) => !practiced.has(s));

if (errors.length) {
  console.error(`✗ Content check failed (${errors.length}):\n  ${errors.join('\n  ')}`);
  process.exit(1);
}
const counts = Object.entries(bySkill).map(([, a]) => a.length);
console.log(
  `✓ Content OK: ${class1.length} Class 1 chapters, ${m.CLASS1_SKILLS.length} skills, ` +
    `${Object.keys(m.MATH_GENERATORS).length} math generators, ${m.CURATED_QUESTIONS.length} curated questions` +
    (counts.length ? ` (min ${Math.min(...counts)} per skill)` : '') +
    (thin.length ? `\n  ⚠ No practice questions yet for: ${thin.join(', ')}` : '')
);
