import React, { useMemo } from 'react';
import {
  CurriculumChapter,
  EducationTrack,
  SchoolBoard,
} from '../../types/curriculum.types';
import {
  FolderTree,
  ChevronRight,
  Sparkles,
  CheckCircle2,
  Layers,
} from 'lucide-react';

interface CurriculumSidebarProps {
  chapters: CurriculumChapter[];
  activeTrack: EducationTrack;
  activeBoard: SchoolBoard;
  activeClassLevel: number | 'ALL';
  selectedChapter: CurriculumChapter;
  onSelectChapter: (chapter: CurriculumChapter) => void;
  completedChapterIds?: string[];
  mobileOpen: boolean;
  onCloseMobile: () => void;
}

export const CurriculumSidebar: React.FC<CurriculumSidebarProps> = ({
  chapters,
  activeTrack,
  activeBoard,
  activeClassLevel,
  selectedChapter,
  onSelectChapter,
  completedChapterIds = [],
  mobileOpen,
  onCloseMobile,
}) => {
  const trackChapters = useMemo(() => {
    return chapters.filter((ch) => {
      if (ch.track !== activeTrack) return false;
      if (activeTrack === 'school') {
        if (ch.board !== 'BOTH' && ch.board !== activeBoard) return false;
        if (activeClassLevel !== 'ALL' && ch.classLevel !== activeClassLevel) {
          return false;
        }
      }
      return true;
    });
  }, [chapters, activeTrack, activeBoard, activeClassLevel]);

  // Group chapters by Subject when a single Class is active, or by streamCategory when 'ALL' is active
  const grouped = useMemo(() => {
    const map = new Map<string, CurriculumChapter[]>();
    trackChapters.forEach((ch) => {
      const groupKey =
        activeTrack === 'school' && activeClassLevel !== 'ALL'
          ? `Class ${ch.classLevel} • ${ch.subject}`
          : ch.streamCategory;
      const list = map.get(groupKey) || [];
      list.push(ch);
      map.set(groupKey, list);
    });
    return Array.from(map.entries());
  }, [trackChapters, activeTrack, activeClassLevel]);

  const completedInTrackCount = useMemo(
    () => trackChapters.filter((ch) => completedChapterIds.includes(ch.id)).length,
    [trackChapters, completedChapterIds]
  );

  const accentBorder =
    activeTrack === 'school'
      ? 'border-cyan-500/50 bg-cyan-500/10 text-cyan-200'
      : activeTrack === 'engineering'
      ? 'border-amber-500/50 bg-amber-500/10 text-amber-200'
      : 'border-emerald-500/50 bg-emerald-500/10 text-emerald-200';

  const sidebarContent = (
    <div className="flex flex-col h-full bg-[#111827] border-r border-[#1F2937] w-72 shrink-0 select-none">
      {/* Sidebar Header */}
      <div className="p-3.5 border-b border-[#1F2937] flex items-center justify-between">
        <div className="flex items-center gap-2">
          <FolderTree className="w-4 h-4 text-cyan-400" />
          <div>
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-200">
              {activeTrack === 'school'
                ? `${activeBoard} Syllabus Explorer`
                : activeTrack === 'engineering'
                ? 'Engineering Streams'
                : 'Medical & Life Sciences'}
            </h2>
            <p className="text-[10px] text-slate-400">
              {trackChapters.length} Interactive Laboratory Modules
            </p>
          </div>
        </div>
        <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-[#090D16] text-cyan-300 border border-slate-800">
          {activeTrack === 'school' ? activeBoard : activeTrack.toUpperCase()}
        </span>
      </div>

      {/* Lesson Completion Progress Bar */}
      <div className="px-3.5 py-2 border-b border-[#1F2937] bg-[#0D1322] space-y-1">
        <div className="flex items-center justify-between text-[10px] font-mono">
          <span className="text-slate-300 font-semibold">
            🌟 Progress ({completedInTrackCount}/{trackChapters.length} Done)
          </span>
          <span className="text-emerald-400 font-bold">
            {trackChapters.length > 0
              ? Math.round((completedInTrackCount / trackChapters.length) * 100)
              : 0}
            %
          </span>
        </div>
        <div className="w-full h-1.5 rounded-full bg-slate-800 overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-cyan-400 to-emerald-400 transition-all duration-300"
            style={{
              width: `${
                trackChapters.length > 0
                  ? (completedInTrackCount / trackChapters.length) * 100
                  : 0
              }%`,
            }}
          />
        </div>
      </div>

      {/* Scrollable Curriculum Tree */}
      <div className="flex-1 overflow-y-auto p-2.5 space-y-3">
        {grouped.map(([category, items]) => (
          <div key={category} className="space-y-1">
            <div className="flex items-center justify-between px-2 py-1 text-[11px] font-bold uppercase tracking-wider text-slate-300 bg-[#090D16]/80 rounded-lg border border-slate-800/60">
              <span className="flex items-center gap-1.5">
                <Layers className="w-3 h-3 text-cyan-400" />
                {category}
              </span>
              <span className="font-mono text-[10px] text-cyan-300">
                {items.length}
              </span>
            </div>

            <div className="space-y-1 pl-1">
              {items.map((ch) => {
                const isSelected = selectedChapter.id === ch.id;
                const isDone = completedChapterIds.includes(ch.id);
                return (
                  <button
                    key={ch.id}
                    type="button"
                    onClick={() => {
                      onSelectChapter(ch);
                      onCloseMobile();
                    }}
                    className={`w-full text-left p-2.5 rounded-xl border transition-all flex items-start justify-between gap-2 ${
                      isSelected
                        ? accentBorder
                        : 'bg-[#090D16]/50 border-slate-800/80 text-slate-300 hover:border-slate-700 hover:text-white'
                    }`}
                  >
                    <div className="space-y-1 min-w-0">
                      <div className="flex items-center gap-1.5">
                        <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-slate-900 text-slate-300 border border-slate-800">
                          {ch.chapterNumber}
                        </span>
                        {isDone && (
                          <span className="text-[9px] font-mono px-1.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                            ✓ Done
                          </span>
                        )}
                        {ch.board === 'ICSE' && (
                          <span className="text-[9px] font-mono px-1.5 rounded bg-violet-500/20 text-violet-300 border border-violet-500/40">
                            ICSE Special
                          </span>
                        )}
                      </div>
                      <p className="text-xs font-semibold leading-snug line-clamp-2">
                        {ch.title}
                      </p>
                    </div>

                    {isDone ? (
                      <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5 text-emerald-400" />
                    ) : isSelected ? (
                      <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5 text-cyan-400" />
                    ) : (
                      <ChevronRight className="w-3.5 h-3.5 shrink-0 mt-0.5 text-slate-500" />
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      {/* Bottom Syllabus Alignment Info Footer */}
      <div className="p-3 border-t border-[#1F2937] bg-[#0D1322] text-[11px] text-slate-400 flex items-center gap-2">
        <Sparkles className="w-4 h-4 text-cyan-400 shrink-0" />
        <span>
          Dual-Board aligned with NCERT (CBSE) & CISCE (ICSE/ISC) Class 1–12
        </span>
      </div>
    </div>
  );

  return (
    <>
      <aside className="hidden lg:block">{sidebarContent}</aside>
      {mobileOpen && (
        <div className="fixed inset-0 z-40 lg:hidden flex">
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-xs"
            onClick={onCloseMobile}
          />
          <div className="relative z-50 h-full">{sidebarContent}</div>
        </div>
      )}
    </>
  );
};
