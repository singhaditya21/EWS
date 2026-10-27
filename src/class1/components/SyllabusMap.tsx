import React from 'react';
import { CurriculumChapter, SchoolBoard } from '../../types/curriculum.types';
import { Coverage, syllabusFor } from '../syllabus';
import { useActiveProfile } from '../progressStore';

const COVERAGE_STYLE: Record<Coverage, string> = {
  full: 'bg-emerald-500/15 text-emerald-200 border-emerald-500/40',
  partial: 'bg-amber-500/15 text-amber-200 border-amber-500/40',
  gap: 'bg-rose-500/15 text-rose-200 border-rose-500/40',
};
const COVERAGE_LABEL: Record<Coverage, string> = { full: 'Covered', partial: 'Partly covered', gap: 'Not yet' };

/** The board's Class 1 syllabus, with where the app covers each part and what is still missing. */
export const SyllabusMap: React.FC<{
  board: SchoolBoard;
  chapters: CurriculumChapter[];
  onSelectChapter?: (c: CurriculumChapter) => void;
}> = ({ board, chapters, onSelectChapter }) => {
  const books = syllabusFor(board);
  const done = useActiveProfile().completedChapterIds;
  const units = books.flatMap((b) => b.units);
  const full = units.filter((x) => x.coverage === 'full').length;

  return (
    <div className="space-y-3">
      <div>
        <h3 className="text-base font-extrabold text-white">
          🗺️ {board} Class 1 syllabus map
        </h3>
        <p className="text-xs text-slate-400">
          {board === 'CBSE'
            ? 'NCERT textbook chapters and where the app teaches each one.'
            : 'Typical ICSE-school Class 1 topics. CISCE does not prescribe Class 1 textbooks, so your school’s books may order these differently.'}{' '}
          {full} of {units.length} fully covered.
        </p>
      </div>
      {books.map((book) => (
        <div key={book.title} className="p-3 rounded-xl bg-[#090D16] border border-slate-800 space-y-1.5">
          <div className="flex items-center justify-between gap-2">
            <div className="text-xs font-extrabold text-cyan-200">{book.title}</div>
            {book.source && (
              <a href={book.source} target="_blank" rel="noreferrer" className="text-[10px] text-slate-400 underline">
                source
              </a>
            )}
          </div>
          {book.units.map((unit) => (
            <div key={unit.name} className="flex flex-wrap items-start justify-between gap-2 py-1 border-t border-slate-800/60 text-xs">
              <div className="min-w-0">
                <div className="text-slate-100 font-semibold">{unit.name}</div>
                {unit.note && <div className="text-[11px] text-slate-400">{unit.note}</div>}
                <div className="flex flex-wrap gap-1 mt-1">
                  {unit.chapterIds.map((id) => {
                    const ch = chapters.find((c) => c.id === id);
                    if (!ch) return null;
                    return (
                      <button
                        key={id}
                        type="button"
                        onClick={() => onSelectChapter?.(ch)}
                        className="px-1.5 py-0.5 rounded-md bg-slate-800 text-[10px] text-slate-200 hover:bg-slate-700"
                      >
                        {done.includes(id) ? '✓ ' : ''}
                        {ch.title.length > 48 ? `${ch.title.slice(0, 46)}…` : ch.title}
                      </button>
                    );
                  })}
                </div>
              </div>
              <span className={`shrink-0 px-1.5 py-0.5 rounded-md border text-[10px] font-bold ${COVERAGE_STYLE[unit.coverage]}`}>
                {COVERAGE_LABEL[unit.coverage]}
              </span>
            </div>
          ))}
        </div>
      ))}
    </div>
  );
};
