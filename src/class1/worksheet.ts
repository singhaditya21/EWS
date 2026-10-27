// Printable worksheets. They are printed from a hidden frame with plain print styles, so only
// the sheet is printed (the app's dark UI never reaches the printer).
import { SchoolBoard } from '../types/curriculum.types';
import { drawQuestions } from './questionBank';
import { CLASS1_BOARD_MAP } from './boardMap';
import { CLASS1_LESSON_PLANS } from './lessonPlans';

interface SheetQuestion {
  prompt: string;
  options: string[];
  answer: number;
}

const esc = (t: string) =>
  t.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

const STYLE = `
  * { box-sizing: border-box; }
  body { font-family: 'Noto Sans', 'Noto Sans Devanagari', Arial, sans-serif; color: #111; margin: 24px; font-size: 15px; }
  h1 { font-size: 20px; margin: 0 0 4px; }
  .meta { color: #555; font-size: 12px; margin-bottom: 12px; }
  .fields { display: flex; gap: 24px; border-bottom: 1px dashed #999; padding-bottom: 10px; margin-bottom: 14px; font-weight: 600; }
  .q { border: 1px solid #ccc; border-radius: 8px; padding: 10px 12px; margin-bottom: 10px; page-break-inside: avoid; }
  .q b { display: block; margin-bottom: 6px; }
  .opts { display: flex; flex-wrap: wrap; gap: 8px 22px; }
  .box { display: inline-block; width: 14px; height: 14px; border: 1.5px solid #333; border-radius: 3px; margin-right: 6px; vertical-align: -2px; }
  .marks { float: right; font-weight: 600; color: #333; }
  .draw { border: 2px dashed #aaa; border-radius: 10px; height: 140px; display: flex; align-items: center; justify-content: center; color: #777; margin-top: 12px; }
  .self { display: flex; gap: 18px; margin-top: 12px; font-size: 22px; }
  .key { page-break-before: always; }
  .key li { margin-bottom: 4px; }
  @media print { body { margin: 12mm; } button { display: none; } }
`;

/** Prints through a hidden frame, so pop-up blockers can't stop it. */
const printInFrame = (title: string, body: string) => {
  document.getElementById('worksheet-print-frame')?.remove();
  const frame = document.createElement('iframe');
  frame.id = 'worksheet-print-frame';
  frame.setAttribute('aria-hidden', 'true');
  frame.style.cssText = 'position:fixed;right:0;bottom:0;width:0;height:0;border:0;';
  document.body.appendChild(frame);
  const doc = frame.contentDocument;
  if (!doc || !frame.contentWindow) return;
  doc.open();
  doc.write(
    `<!doctype html><html><head><meta charset="utf-8"><title>${esc(title)}</title><style>${STYLE}</style></head><body>${body}</body></html>`
  );
  doc.close();
  // Give fonts a moment to load before the print dialog opens.
  setTimeout(() => frame.contentWindow?.print(), 250);
};

const collectQuestions = (chapterId: string, quiz: SheetQuestion[], count: number): SheetQuestion[] => {
  const skills = CLASS1_BOARD_MAP[chapterId]?.skills ?? [];
  const per = Math.max(1, Math.ceil(count / Math.max(1, skills.length)));
  const fromBank = skills.flatMap((s) => drawQuestions(s, per)).map((q) => ({ prompt: q.prompt, options: q.options, answer: q.answer }));
  const seen = new Set<string>();
  return [...quiz, ...fromBank].filter((q) => !seen.has(q.prompt) && seen.add(q.prompt)).slice(0, count);
};

/**
 * CBSE sheet: an activity sheet with no marks, a drawing box and an "I can…" smiley self-check
 * (NCF-FS discourages formal tests in Classes 1–2).
 * ICSE sheet: a short marked practice test with a separate answer key page.
 */
export const printWorksheet = (
  board: SchoolBoard,
  chapter: { id: string; title: string; quiz: { question: string; options: string[]; correctIndex: number }[] }
) => {
  const quiz = chapter.quiz.map((q) => ({ prompt: q.question, options: q.options, answer: q.correctIndex }));
  const isIcse = board === 'ICSE';
  const qs = collectQuestions(chapter.id, quiz, isIcse ? 10 : 6);
  const plan = CLASS1_LESSON_PLANS[chapter.id];

  const items = qs
    .map(
      (q, i) =>
        `<div class="q"><b>${i + 1}. ${esc(q.prompt)}${isIcse ? '<span class="marks">[1]</span>' : ''}</b>` +
        `<div class="opts">${q.options.map((o) => `<span><span class="box"></span>${esc(o)}</span>`).join('')}</div></div>`
    )
    .join('');

  const header =
    `<h1>${esc(chapter.title)}</h1>` +
    `<div class="meta">Class 1 • ${isIcse ? 'ICSE practice test' : 'CBSE activity sheet'} • OmniLearn Labs</div>` +
    `<div class="fields"><span>Name: ____________________</span><span>Date: ___________</span>` +
    `${isIcse ? `<span>Marks: ____ / ${qs.length}</span>` : ''}</div>`;

  const tail = isIcse
    ? `<div class="key"><h1>Answer key</h1><ol>${qs.map((q) => `<li>${esc(q.options[q.answer])}</li>`).join('')}</ol></div>`
    : `<div class="draw">Draw or paste something from today’s lesson here</div>` +
      (plan ? `<p><b>I can…</b></p><ul>${plan.objectives.map((o) => `<li>${esc(o)}</li>`).join('')}</ul>` : '') +
      `<div class="self">Colour how you feel: 😊 I can do it &nbsp; 🙂 Almost &nbsp; 😐 I need help</div>`;

  printInFrame(`${chapter.title} – Class 1 ${board}`, header + items + tail);
};
