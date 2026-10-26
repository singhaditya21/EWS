import React, { useState, useEffect } from 'react';
import {
  EducationTrack,
  SchoolBoard,
  CurriculumChapter,
} from '../../types/curriculum.types';
import {
  Atom,
  GraduationCap,
  Cpu,
  HeartPulse,
  Search,
  BookOpen,
  Sparkles,
  X,
  Menu,
} from 'lucide-react';

interface NavbarProps {
  activeTrack: EducationTrack;
  onSelectTrack: (track: EducationTrack) => void;
  activeBoard: SchoolBoard;
  onSelectBoard: (board: SchoolBoard) => void;
  activeClassLevel: number | 'ALL';
  onSelectClassLevel: (cls: number | 'ALL') => void;
  chapters: CurriculumChapter[];
  onSelectChapter: (chapter: CurriculumChapter) => void;
  onToggleMobileSidebar: () => void;
  kidFocusMode?: boolean;
  onToggleKidFocusMode?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTrack,
  onSelectTrack,
  activeBoard,
  onSelectBoard,
  activeClassLevel,
  onSelectClassLevel,
  chapters,
  onSelectChapter,
  onToggleMobileSidebar,
  kidFocusMode = false,
  onToggleKidFocusMode,
}) => {
  const [searchOpen, setSearchOpen] = useState(false);
  const [query, setQuery] = useState('');

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setSearchOpen((o) => !o);
      } else if (e.key === 'Escape') {
        setSearchOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const filteredChapters = chapters.filter((ch) => {
    const q = query.trim().toLowerCase();
    if (!q) return true;
    return (
      ch.title.toLowerCase().includes(q) ||
      ch.subject.toLowerCase().includes(q) ||
      ch.streamCategory.toLowerCase().includes(q) ||
      ch.syllabusAlignment.cbseChapter.toLowerCase().includes(q) ||
      ch.syllabusAlignment.icseChapter.toLowerCase().includes(q)
    );
  });

  return (
    <>
      <header className="sticky top-0 z-30 bg-[#090D16]/95 border-b border-[#1F2937] backdrop-blur-md">
        <div className="max-w-[1600px] mx-auto px-3 sm:px-5 h-16 flex items-center justify-between gap-3">
          {/* Brand Logo */}
          <div className="flex items-center gap-2.5">
            <button
              type="button"
              onClick={onToggleMobileSidebar}
              className="lg:hidden p-2 rounded-lg bg-[#111827] border border-slate-800 text-slate-300 hover:text-white"
              aria-label="Toggle Curriculum Sidebar"
            >
              <Menu className="w-4 h-4" />
            </button>

            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-cyan-500 via-blue-600 to-emerald-500 flex items-center justify-center shadow-md shadow-cyan-500/20">
              <Atom className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-sm sm:text-base tracking-tight text-white">
                  OmniLearn <span className="text-cyan-400">Labs</span>
                </span>
                <span className="hidden md:inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-mono font-semibold bg-cyan-500/10 text-cyan-300 border border-cyan-500/30">
                  <Sparkles className="w-2.5 h-2.5" /> 2D + 3D WebGL
                </span>
              </div>
              <p className="text-[10px] text-slate-400 hidden sm:block">
                CBSE & ICSE/ISC (Class 1–12) • Engineering • Medical Sciences
              </p>
            </div>
          </div>

          {/* Primary 3-Tier Track Switcher (Simplified in Kid Focus Mode) */}
          <div className="flex items-center gap-1 bg-[#111827] p-1 rounded-xl border border-[#1F2937]">
            <button
              type="button"
              onClick={() => onSelectTrack('school')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                activeTrack === 'school'
                  ? 'bg-cyan-500 text-slate-950 shadow-sm shadow-cyan-500/30'
                  : 'text-slate-300 hover:text-white'
              }`}
            >
              <GraduationCap className="w-4 h-4" />
              <span>{kidFocusMode ? '🎒 Primary Kids School (Class 1–5)' : 'School (Class 1–12)'}</span>
            </button>

            {!kidFocusMode && (
              <>
                <button
                  type="button"
                  onClick={() => onSelectTrack('engineering')}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                    activeTrack === 'engineering'
                      ? 'bg-amber-500 text-slate-950 shadow-sm shadow-amber-500/30'
                      : 'text-slate-300 hover:text-white'
                  }`}
                >
                  <Cpu className="w-4 h-4" />
                  <span>Engineering</span>
                </button>

                <button
                  type="button"
                  onClick={() => onSelectTrack('medical')}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                    activeTrack === 'medical'
                      ? 'bg-emerald-500 text-slate-950 shadow-sm shadow-emerald-500/30'
                      : 'text-slate-300 hover:text-white'
                  }`}
                >
                  <HeartPulse className="w-4 h-4" />
                  <span>Medical</span>
                </button>
              </>
            )}
          </div>

          {/* Right Controls: Kid Focus Mode + Dual-Board Switcher (CBSE vs ICSE) + Cmd+K Search */}
          <div className="flex items-center gap-2">
            {activeTrack === 'school' && onToggleKidFocusMode && (
              <button
                type="button"
                onClick={onToggleKidFocusMode}
                title="Lock navigation to Primary Class 1–5 for young children"
                className={`px-2.5 py-1.5 rounded-xl text-xs font-extrabold border transition-all ${
                  kidFocusMode
                    ? 'bg-amber-400 text-slate-950 border-white shadow-sm'
                    : 'bg-[#111827] text-amber-300 border-amber-500/40 hover:border-amber-400'
                }`}
              >
                {kidFocusMode ? '🌞 Kid Mode: ON' : '🧒 Kid Mode'}
              </button>
            )}

            {activeTrack === 'school' && (
              <div className="hidden sm:flex items-center bg-[#111827] p-1 rounded-xl border border-[#1F2937]">
                <button
                  type="button"
                  onClick={() => onSelectBoard('CBSE')}
                  className={`px-2.5 py-1 rounded-lg text-xs font-mono font-bold transition-all ${
                    activeBoard === 'CBSE'
                      ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-400/50'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  CBSE (NCERT)
                </button>
                <button
                  type="button"
                  onClick={() => onSelectBoard('ICSE')}
                  className={`px-2.5 py-1 rounded-lg text-xs font-mono font-bold transition-all ${
                    activeBoard === 'ICSE'
                      ? 'bg-violet-500/20 text-violet-300 border border-violet-400/50'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  ICSE / ISC
                </button>
              </div>
            )}

            <button
              type="button"
              onClick={() => setSearchOpen(true)}
              className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-[#111827] border border-[#1F2937] hover:border-slate-700 text-xs text-slate-300 transition-colors"
            >
              <Search className="w-3.5 h-3.5 text-cyan-400" />
              <span className="hidden md:inline">Search Syllabus...</span>
              <kbd className="hidden md:inline-block px-1.5 py-0.5 text-[10px] font-mono bg-[#090D16] text-slate-400 rounded border border-slate-800">
                ⌘K
              </kbd>
            </button>
          </div>
        </div>

        {/* Sub-Bar for School Track: Class 1 to Class 12 Quick Selector + Mobile Board Toggle */}
        {activeTrack === 'school' && (
          <div className="bg-[#0D1322] border-t border-[#1F2937]/80 px-3 sm:px-5 py-1.5">
            <div className="max-w-[1600px] mx-auto flex items-center justify-between gap-2 overflow-x-auto no-scrollbar">
              <div className="flex items-center gap-1 shrink-0">
                <BookOpen className="w-3.5 h-3.5 text-cyan-400 mr-1" />
                {!kidFocusMode && (
                  <button
                    type="button"
                    onClick={() => onSelectClassLevel('ALL')}
                    className={`px-2.5 py-0.5 rounded-md text-[11px] font-mono font-semibold transition-all ${
                      activeClassLevel === 'ALL'
                        ? 'bg-cyan-500 text-slate-950'
                        : 'bg-[#111827] text-slate-400 hover:text-white border border-slate-800'
                    }`}
                  >
                    All Classes (1–12)
                  </button>
                )}
                {Array.from({ length: kidFocusMode ? 5 : 12 }, (_, i) => i + 1).map((cls) => (
                  <button
                    key={cls}
                    type="button"
                    onClick={() => onSelectClassLevel(cls)}
                    className={`px-2 py-0.5 rounded-md text-[11px] font-mono font-semibold transition-all ${
                      activeClassLevel === cls
                        ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-400'
                        : 'bg-[#111827]/70 text-slate-400 hover:text-white border border-slate-800/70'
                    }`}
                  >
                    Class {cls}
                  </button>
                ))}
              </div>

              <div className="flex sm:hidden items-center gap-1 shrink-0">
                <button
                  type="button"
                  onClick={() => onSelectBoard('CBSE')}
                  className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold ${
                    activeBoard === 'CBSE'
                      ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-400'
                      : 'text-slate-400'
                  }`}
                >
                  CBSE
                </button>
                <button
                  type="button"
                  onClick={() => onSelectBoard('ICSE')}
                  className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold ${
                    activeBoard === 'ICSE'
                      ? 'bg-violet-500/20 text-violet-300 border border-violet-400'
                      : 'text-slate-400'
                  }`}
                >
                  ICSE
                </button>
              </div>
            </div>
          </div>
        )}
      </header>

      {/* Cmd+K Global Syllabus Search Modal */}
      {searchOpen && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-start justify-center pt-16 px-4">
          <div className="w-full max-w-2xl rounded-2xl bg-[#111827] border border-slate-700 shadow-2xl overflow-hidden">
            <div className="flex items-center gap-3 px-4 py-3 border-b border-slate-800">
              <Search className="w-4 h-4 text-cyan-400" />
              <input
                type="text"
                autoFocus
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search any Class (1-12), CBSE/ICSE chapter, Engineering or Medical simulation..."
                className="w-full bg-transparent text-sm text-white placeholder-slate-400 focus:outline-none"
              />
              <button
                type="button"
                onClick={() => setSearchOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="max-h-96 overflow-y-auto divide-y divide-slate-800/70">
              {filteredChapters.map((ch) => (
                <button
                  key={ch.id}
                  type="button"
                  onClick={() => {
                    onSelectChapter(ch);
                    setSearchOpen(false);
                  }}
                  className="w-full text-left px-4 py-3 hover:bg-slate-800/60 transition-colors flex items-center justify-between gap-3"
                >
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-mono font-bold uppercase px-2 py-0.5 rounded bg-cyan-500/10 text-cyan-300 border border-cyan-500/30">
                        {ch.streamCategory} • {ch.subject}
                      </span>
                      <span className="text-xs font-bold text-white">{ch.title}</span>
                    </div>
                    <p className="text-[11px] text-slate-400 mt-1 line-clamp-1">
                      {ch.syllabusAlignment.cbseChapter} | {ch.syllabusAlignment.icseChapter}
                    </p>
                  </div>
                  <span className="text-[10px] font-mono text-slate-400 shrink-0">
                    {ch.chapterNumber}
                  </span>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </>
  );
};
