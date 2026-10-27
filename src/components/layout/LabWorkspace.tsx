import React, { Suspense, lazy, useState, useEffect } from 'react';
import {
  CurriculumChapter,
  SchoolBoard,
} from '../../types/curriculum.types';
import { FormulaCard } from '../engine/FormulaCard';
import { InteractiveQuiz } from '../assessment/InteractiveQuiz';
import { MagicTracingSlate } from '../engine/MagicTracingSlate';
import { playFanfare, playPop } from '../../utils/soundEffects';
import { speakText } from '../../utils/speech';
import {
  BOARD_STATUS_LABEL,
  CLASS1_BOARD_MAP,
  STATUS_BADGE_STYLE,
  class1Label,
  sortForBoard,
} from '../../class1/boardMap';
import { useProgress } from '../../class1/progressStore';
import { Class1Toolbar } from '../../class1/components/Class1Toolbar';
import { PracticeSession } from '../../class1/components/PracticeSession';
import { ProgressReport } from '../../class1/components/ProgressReport';
import { ParentPanel } from '../../class1/components/ParentPanel';
import { TeacherPanel } from '../../class1/components/TeacherPanel';
import { SyllabusMap } from '../../class1/components/SyllabusMap';

import {
  BookOpen,
  Box,
  Calculator,
  CheckCircle2,
  FlaskConical,
  Award,
  Layers,
  Pencil,
  Users,
  ChevronLeft,
  ChevronRight,
  Volume2,
  Sparkles,
  Printer,
} from 'lucide-react';

// Simulations load on demand: a Class 1 child should not download the 3D engineering and medical labs.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type AnyComponent = React.ComponentType<any>;
const named = <K extends string>(load: () => Promise<Record<K, AnyComponent>>, name: K) =>
  lazy(() => load().then((m) => ({ default: m[name] })));
const Class1InteractiveLab = named(() => import('../../simulations/school/Class1InteractiveLab'), 'Class1InteractiveLab');
const PrimaryMathSolarLab = named(() => import('../../simulations/school/PrimaryMathSolarLab'), 'PrimaryMathSolarLab');
const MiddleMachinesMatter = named(() => import('../../simulations/school/MiddleMachinesMatter'), 'MiddleMachinesMatter');
const OpticsRayBench = named(() => import('../../simulations/school/OpticsRayBench'), 'OpticsRayBench');
const ProjectileKinematics = named(() => import('../../simulations/school/ProjectileKinematics'), 'ProjectileKinematics');
const MolecularVSEPR3D = named(() => import('../../simulations/school/MolecularVSEPR3D'), 'MolecularVSEPR3D');
const CalculusVisualizer = named(() => import('../../simulations/school/CalculusVisualizer'), 'CalculusVisualizer');
const FourStrokeEngine = named(() => import('../../simulations/engineering/FourStrokeEngine'), 'FourStrokeEngine');
const RLCCircuitPhasor = named(() => import('../../simulations/engineering/RLCCircuitPhasor'), 'RLCCircuitPhasor');
const BeamStressDeflection = named(() => import('../../simulations/engineering/BeamStressDeflection'), 'BeamStressDeflection');
const CPUPipelinePathfinder = named(() => import('../../simulations/engineering/CPUPipelinePathfinder'), 'CPUPipelinePathfinder');
const CardiacECGSimulator = named(() => import('../../simulations/medical/CardiacECGSimulator'), 'CardiacECGSimulator');
const DNAReplication3D = named(() => import('../../simulations/medical/DNAReplication3D'), 'DNAReplication3D');
const ActionPotentialNerve = named(() => import('../../simulations/medical/ActionPotentialNerve'), 'ActionPotentialNerve');
const AnatomyCADInspector = named(() => import('../engine/AnatomyCADInspector'), 'AnatomyCADInspector');


interface LabWorkspaceProps {
  chapter: CurriculumChapter;
  activeBoard: SchoolBoard;
  chapters?: CurriculumChapter[];
  onSelectChapter?: (chapter: CurriculumChapter) => void;
  completedChapterIds?: string[];
  onToggleComplete?: (chapterId: string) => void;
}

type ViewportTab =
  | 'simulation'
  | 'cad3d'
  | 'sandbox'
  | 'tracing'
  | 'guide'
  | 'practice'
  | 'progress'
  | 'parent'
  | 'teacher';
type DockTab = 'theory' | 'quiz' | 'syllabus';

export const LabWorkspace: React.FC<LabWorkspaceProps> = ({
  chapter,
  activeBoard,
  chapters = [],
  onSelectChapter,
  completedChapterIds = [],
  onToggleComplete,
}) => {
  const [viewportTab, setViewportTab] = useState<ViewportTab>('simulation');
  const [dockTab, setDockTab] = useState<DockTab>('theory');

  // Interactive Formula Sandbox Calculator state
  const [sandboxA, setSandboxA] = useState(12);
  const [sandboxB, setSandboxB] = useState(5);
  const [sandboxC, setSandboxC] = useState(9.8);

  const role = useProgress().prefs.role;
  const viewportRef = React.useRef<HTMLDivElement>(null);
  const enterProjector = () => {
    setViewportTab('simulation');
    viewportRef.current?.requestFullscreen?.().catch(() => undefined);
  };
  const isPrimaryWing =
    chapter.track === 'school' && Boolean(chapter.classLevel && chapter.classLevel <= 5);
  const isCompleted = completedChapterIds.includes(chapter.id);

  // Compute Previous / Next Lesson within the same Class or Track
  const peerChapters = sortForBoard(chapters, activeBoard).filter((ch) => {
    if (ch.track !== chapter.track) return false;
    if (chapter.track === 'school') {
      if (ch.board !== 'BOTH' && ch.board !== activeBoard) return false;
      return ch.classLevel === chapter.classLevel;
    }
    return true;
  });
  const currentIdx = peerChapters.findIndex((c) => c.id === chapter.id);
  const prevChapter = currentIdx > 0 ? peerChapters[currentIdx - 1] : null;
  const nextChapter =
    currentIdx >= 0 && currentIdx < peerChapters.length - 1
      ? peerChapters[currentIdx + 1]
      : null;

  const speakNote = (text: string) => speakText(text, { force: true });

  // Inside the Class 1 lab, picking another activity opens that activity's chapter,
  // so the theory, quiz and "Mark Done" always match what the child is playing.
  const handleClass1ModeChange = (mode: string) => {
    const target = chapters.find(
      (c) => c.simulationId === 'Class1InteractiveLab' && c.defaultSimulationMode === mode
    );
    if (target && onSelectChapter) onSelectChapter(target);
  };
  const class1Meta = CLASS1_BOARD_MAP[chapter.id];

  useEffect(() => {
    setViewportTab('simulation');
  }, [chapter.id]);

  const renderActiveSimulation = () => {
    switch (chapter.simulationId) {
      case 'Class1InteractiveLab':
        return (
          <Class1InteractiveLab
            key={chapter.id}
            initialMode={chapter.defaultSimulationMode}
            board={activeBoard}
            onModeChange={handleClass1ModeChange}
          />
        );
      case 'PrimaryMathSolarLab':
        return (
          <PrimaryMathSolarLab
            key={chapter.id}
            initialMode={chapter.defaultSimulationMode}
          />
        );
      case 'MiddleMachinesMatter':
        return (
          <MiddleMachinesMatter
            key={chapter.id}
            initialMode={chapter.defaultSimulationMode}
          />
        );
      case 'OpticsRayBench':
        return <OpticsRayBench key={chapter.id} />;
      case 'ProjectileKinematics':
        return <ProjectileKinematics key={chapter.id} />;
      case 'MolecularVSEPR3D':
        return (
          <MolecularVSEPR3D
            key={chapter.id}
            initialMode={chapter.defaultSimulationMode}
          />
        );
      case 'CalculusVisualizer':
        return <CalculusVisualizer key={chapter.id} />;
      case 'FourStrokeEngine':
        return <FourStrokeEngine key={chapter.id} />;
      case 'RLCCircuitPhasor':
        return <RLCCircuitPhasor key={chapter.id} />;
      case 'BeamStressDeflection':
        return <BeamStressDeflection key={chapter.id} />;
      case 'CPUPipelinePathfinder':
        return (
          <CPUPipelinePathfinder
            key={chapter.id}
            initialMode={chapter.defaultSimulationMode}
          />
        );
      case 'CardiacECGSimulator':
        return <CardiacECGSimulator key={chapter.id} />;
      case 'DNAReplication3D':
        return <DNAReplication3D key={chapter.id} />;
      case 'ActionPotentialNerve':
        return <ActionPotentialNerve key={chapter.id} />;
      case 'AnatomyCADInspector':
        return (
          <AnatomyCADInspector
            key={chapter.id}
            initialPreset={chapter.cadPresetId || 'heart-thorax'}
          />
        );
      default:
        return <ProjectileKinematics />;
    }
  };

  const accentBadge =
    chapter.track === 'school'
      ? 'bg-cyan-500/15 text-cyan-300 border-cyan-500/30'
      : chapter.track === 'engineering'
      ? 'bg-amber-500/15 text-amber-300 border-amber-500/30'
      : 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30';

  return (
    <main className="flex-1 min-w-0 p-3 sm:p-5 max-w-[1550px] mx-auto w-full space-y-4">
      {/* Chapter Header & Dual-Board Syllabus Alignment Banner */}
      <div className="rounded-2xl bg-[#111827] border border-[#1F2937] p-4 shadow-md space-y-3">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="space-y-1.5">
            <div className="flex flex-wrap items-center gap-2">
              <span
                className={`px-2.5 py-0.5 rounded-full text-xs font-mono font-bold border ${accentBadge}`}
              >
                {chapter.streamCategory} • {chapter.subject}
              </span>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-mono bg-[#090D16] text-slate-300 border border-slate-800">
                {class1Label(chapter.id, activeBoard) ?? chapter.chapterNumber}
              </span>
              {class1Meta && (
                <span
                  className={`px-2.5 py-0.5 rounded-full text-[11px] font-mono font-bold border ${STATUS_BADGE_STYLE[class1Meta[activeBoard].status]}`}
                  title="How this chapter fits the selected board's Class 1 syllabus"
                >
                  {activeBoard}: {BOARD_STATUS_LABEL[class1Meta[activeBoard].status]}
                </span>
              )}
              {class1Meta && (
                <span
                  className="px-2.5 py-0.5 rounded-full text-[11px] font-mono bg-slate-900 text-slate-400 border border-slate-800"
                  title="Content is checked by a practising Class 1 teacher before it is marked reviewed"
                >
                  {class1Meta.review.status === 'reviewed' ? '✓ Teacher reviewed' : 'Teacher review pending'}
                </span>
              )}
              {chapter.wing && (
                <span className="px-2.5 py-0.5 rounded-full text-[11px] font-mono bg-slate-900 text-slate-400 border border-slate-800">
                  {chapter.wing}
                </span>
              )}
            </div>

            <h1 className="text-lg sm:text-xl font-extrabold text-white tracking-tight">
              {chapter.title}
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 max-w-4xl leading-relaxed">
              {chapter.summary}
            </p>
          </div>

          {/* Viewport Mode Switcher (Child-Friendly Tabs for Class 1–5 vs. CAD/Formula for Class 6–12/Eng/Med) */}
          <div className="flex flex-col sm:items-end gap-2">
            <div className="flex flex-wrap items-center gap-1.5 bg-[#090D16] p-1.5 rounded-xl border border-slate-800">
              <button
                type="button"
                onClick={() => setViewportTab('simulation')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-extrabold transition-all ${
                  viewportTab === 'simulation'
                    ? 'bg-cyan-500 text-slate-950 shadow-sm'
                    : 'text-slate-300 hover:text-white'
                }`}
              >
                <FlaskConical className="w-3.5 h-3.5" />
                {isPrimaryWing ? '🎮 Play & Learn Lab' : 'Interactive Lab'}
              </button>

              {isPrimaryWing ? (
                <>
                  <button
                    type="button"
                    onClick={() => setViewportTab('tracing')}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-extrabold transition-all ${
                      viewportTab === 'tracing'
                        ? 'bg-amber-400 text-slate-950 shadow-sm'
                        : 'text-slate-300 hover:text-white'
                    }`}
                  >
                    <Pencil className="w-3.5 h-3.5" />
                    ✏️ Magic Tracing Slate
                  </button>

                  {class1Meta ? (
                    <>
                      <button
                        type="button"
                        onClick={() => setViewportTab('practice')}
                        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-extrabold transition-all ${
                          viewportTab === 'practice' ? 'bg-emerald-400 text-slate-950 shadow-sm' : 'text-slate-300 hover:text-white'
                        }`}
                      >
                        ⭐ Practice
                      </button>
                      <button
                        type="button"
                        onClick={() => setViewportTab('progress')}
                        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-extrabold transition-all ${
                          viewportTab === 'progress' ? 'bg-violet-400 text-slate-950 shadow-sm' : 'text-slate-300 hover:text-white'
                        }`}
                      >
                        📊 Progress
                      </button>
                      {role !== 'teacher' && (
                      <button
                        type="button"
                        onClick={() => setViewportTab('parent')}
                        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-extrabold transition-all ${
                          viewportTab === 'parent' ? 'bg-emerald-400 text-slate-950 shadow-sm' : 'text-slate-300 hover:text-white'
                        }`}
                      >
                        👨‍👩‍👧 Parents
                      </button>
                      )}
                      {role !== 'parent' && (
                      <button
                        type="button"
                        onClick={() => setViewportTab('teacher')}
                        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-extrabold transition-all ${
                          viewportTab === 'teacher' ? 'bg-amber-400 text-slate-950 shadow-sm' : 'text-slate-300 hover:text-white'
                        }`}
                      >
                        🏫 Teachers
                      </button>
                      )}
                    </>
                  ) : (
                  <button
                    type="button"
                    onClick={() => setViewportTab('guide')}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-extrabold transition-all ${
                      viewportTab === 'guide'
                        ? 'bg-emerald-400 text-slate-950 shadow-sm'
                        : 'text-slate-300 hover:text-white'
                    }`}
                  >
                    <Users className="w-3.5 h-3.5" />
                    👨‍👩‍👧 Parent & Teacher Guide
                  </button>
                  )}
                </>
              ) : (
                <>
                  <button
                    type="button"
                    onClick={() => setViewportTab('cad3d')}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                      viewportTab === 'cad3d'
                        ? 'bg-cyan-500 text-slate-950 shadow-sm'
                        : 'text-slate-300 hover:text-white'
                    }`}
                  >
                    <Box className="w-3.5 h-3.5" />
                    3D CAD / Anatomy Slice
                  </button>

                  <button
                    type="button"
                    onClick={() => setViewportTab('sandbox')}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                      viewportTab === 'sandbox'
                        ? 'bg-cyan-500 text-slate-950 shadow-sm'
                        : 'text-slate-300 hover:text-white'
                    }`}
                  >
                    <Calculator className="w-3.5 h-3.5" />
                    Formula Sandbox
                  </button>
                </>
              )}
            </div>

            {/* Sequential Lesson Navigation & Completion Toggle */}
            <div className="flex flex-wrap items-center gap-1.5">
              {prevChapter && onSelectChapter && (
                <button
                  type="button"
                  onClick={() => onSelectChapter(prevChapter)}
                  className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-[#090D16] border border-slate-800 hover:border-cyan-500/50 text-[11px] font-bold text-slate-300 hover:text-white"
                  title={prevChapter.title}
                >
                  <ChevronLeft className="w-3.5 h-3.5 text-cyan-400" />
                  Prev Lesson
                </button>
              )}

              {onToggleComplete && (
                <button
                  type="button"
                  onClick={() => {
                    if (!isCompleted) playFanfare();
                    else playPop();
                    onToggleComplete(chapter.id);
                  }}
                  className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-[11px] font-extrabold border transition-all ${
                    isCompleted
                      ? 'bg-emerald-500/20 border-emerald-400 text-emerald-200'
                      : 'bg-[#090D16] border-slate-700 text-slate-300 hover:border-emerald-400'
                  }`}
                >
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                  {isCompleted ? '🌟 Lesson Completed!' : 'Mark Lesson Done'}
                </button>
              )}

              {nextChapter && onSelectChapter && (
                <button
                  type="button"
                  onClick={() => onSelectChapter(nextChapter)}
                  className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-cyan-500/15 border border-cyan-500/40 hover:bg-cyan-500/25 text-[11px] font-extrabold text-cyan-200"
                  title={nextChapter.title}
                >
                  Next Lesson
                  <ChevronRight className="w-3.5 h-3.5 text-cyan-300" />
                </button>
              )}
            </div>
          </div>
        </div>

        {class1Meta && (
          <div className="pt-2 border-t border-slate-800/80">
            <Class1Toolbar chapters={chapters} onSelectChapter={onSelectChapter} />
          </div>
        )}

        {/* Dual-Board Syllabus Alignment Bar */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5 pt-2 border-t border-slate-800/80 text-xs">
          <div
            className={`p-2.5 rounded-xl border flex items-start gap-2 ${
              activeBoard === 'CBSE'
                ? 'bg-cyan-950/25 border-cyan-500/40 text-cyan-100'
                : 'bg-[#090D16]/70 border-slate-800 text-slate-300'
            }`}
          >
            <span className="px-2 py-0.5 rounded bg-cyan-500/20 text-cyan-300 font-mono text-[10px] font-bold shrink-0">
              CBSE NCERT
            </span>
            <span className="text-[11px] leading-snug">
              {chapter.syllabusAlignment.cbseChapter}
            </span>
          </div>

          <div
            className={`p-2.5 rounded-xl border flex items-start gap-2 ${
              activeBoard === 'ICSE'
                ? 'bg-violet-950/25 border-violet-500/40 text-violet-100'
                : 'bg-[#090D16]/70 border-slate-800 text-slate-300'
            }`}
          >
            <span className="px-2 py-0.5 rounded bg-violet-500/20 text-violet-300 font-mono text-[10px] font-bold shrink-0">
              ICSE / ISC
            </span>
            <span className="text-[11px] leading-snug">
              {chapter.syllabusAlignment.icseChapter}
            </span>
          </div>
        </div>
      </div>

      {/* 70% / 30% Split-Screen Interactive Laboratory Grid */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-4 items-start">
        {/* Left 70% (8 of 12 cols on xl): Real-Time 2D / 3D Simulation Viewport */}
        <div className="xl:col-span-8 space-y-4" ref={viewportRef} data-projector>
          {viewportTab === 'simulation' && (
            <Suspense fallback={<LabLoading />}>{renderActiveSimulation()}</Suspense>
          )}

          {viewportTab === 'tracing' && <MagicTracingSlate />}

          {class1Meta && viewportTab === 'practice' && <PracticeSession chapterId={chapter.id} />}
          {class1Meta && viewportTab === 'progress' && (
            <div className="rounded-2xl bg-[#111827] border border-[#1F2937] p-4 sm:p-5 space-y-5">
              <ProgressReport board={activeBoard} />
              <SyllabusMap board={activeBoard} chapters={chapters} onSelectChapter={onSelectChapter} />
            </div>
          )}
          {class1Meta && viewportTab === 'parent' && (
            <ParentPanel chapter={chapter} chapters={chapters} board={activeBoard} onSelectChapter={onSelectChapter} />
          )}
          {class1Meta && viewportTab === 'teacher' && (
            <TeacherPanel chapter={chapter} board={activeBoard} onProjector={enterProjector} />
          )}

          {viewportTab === 'guide' && (
            <div className="rounded-2xl bg-[#111827] border border-[#1F2937] p-5 space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-800 pb-3">
                <div>
                  <h3 className="text-base font-extrabold text-white flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-emerald-400" />
                    👨‍👩‍👧 Parent & Teacher Hands-On Activity Guide ({chapter.streamCategory})
                  </h3>
                  <p className="text-xs text-slate-300">
                    Real-world home & classroom activities aligned with NEP 2020 (CBSE NCERT) & CISCE (ICSE)
                  </p>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  <button
                    type="button"
                    onClick={() => window.print()}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 text-xs font-extrabold shadow-sm transition-all"
                  >
                    <Printer className="w-3.5 h-3.5" />
                    🖨️ Print Practice Worksheet
                  </button>
                  <span className="px-2.5 py-1 rounded-lg bg-emerald-500/15 text-emerald-300 text-xs font-mono font-bold border border-emerald-500/30">
                    Age 5–10 Experiential Pedagogy
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                <div className="p-4 rounded-xl bg-[#090D16] border border-cyan-500/30 space-y-2">
                  <div className="font-bold text-cyan-300 uppercase">
                    🏠 5-Minute Home Activity for Parents
                  </div>
                  <p className="text-slate-200 leading-relaxed">
                    Use everyday household items (spoons, bowls, fruits, coins, or crayons) to act out{' '}
                    <strong className="text-white">{chapter.title}</strong> before or after playing the digital lab. Ask your child to explain what happened in their own words!
                  </p>
                </div>

                <div className="p-4 rounded-xl bg-[#090D16] border border-amber-500/30 space-y-2">
                  <div className="font-bold text-amber-300 uppercase">
                    🏫 Classroom Tip for Teachers
                  </div>
                  <p className="text-slate-200 leading-relaxed">
                    {chapter.syllabusAlignment.differenceNote}
                  </p>
                </div>
              </div>

              <div className="space-y-2">
                <div className="text-xs font-bold uppercase text-slate-300">
                  Key Learning Outcomes & Talking Points (Click 🔊 to Read Aloud)
                </div>
                {chapter.conceptNotes.map((note, idx) => (
                  <div
                    key={idx}
                    className="p-3 rounded-xl bg-[#090D16] border border-slate-800 flex items-center justify-between gap-3 text-xs text-slate-200"
                  >
                    <span>
                      <strong className="text-emerald-400 mr-1.5">Step {idx + 1}:</strong>
                      {note}
                    </span>
                    <button
                      type="button"
                      onClick={() => speakNote(note)}
                      className="px-2.5 py-1 rounded-lg bg-cyan-500/20 border border-cyan-500/40 text-cyan-200 font-bold shrink-0"
                    >
                      🔊 Speak
                    </button>
                  </div>
                ))}
              </div>

              {/* Printable Class 1–5 Offline Practice Worksheet Card */}
              <div className="p-4 rounded-2xl bg-white text-slate-900 border-2 border-amber-400 shadow-md space-y-3 print:border-black">
                <div className="flex flex-wrap items-center justify-between gap-2 border-b-2 border-slate-200 pb-2">
                  <div>
                    <div className="text-[10px] font-mono font-bold uppercase text-slate-500">
                      OmniLearn Labs • Printable Homework & Classwork Sheet ({chapter.streamCategory} • {chapter.subject})
                    </div>
                    <h4 className="text-sm font-black text-slate-900">
                      📝 {chapter.title} ({chapter.chapterNumber})
                    </h4>
                  </div>
                  <button
                    type="button"
                    onClick={() => window.print()}
                    className="px-3 py-1 rounded-lg bg-slate-900 text-amber-300 text-xs font-extrabold print:hidden"
                  >
                    🖨️ Print Sheet Now
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs font-bold text-slate-700 border-b border-dashed border-slate-300 pb-2">
                  <div>Student Name: ______________________</div>
                  <div>Class & Section: _______</div>
                  <div>Date: ____ / ____ / 202__</div>
                </div>

                {chapter.keyFormulas[0] && (
                  <div className="p-2.5 rounded-xl bg-amber-50 border border-amber-300 text-xs">
                    <span className="font-extrabold text-amber-900">🌟 Golden Rule: </span>
                    <span className="font-mono font-bold text-slate-900">{chapter.keyFormulas[0].latex}</span>
                    <div className="text-[11px] text-slate-600 mt-0.5">{chapter.keyFormulas[0].description}</div>
                  </div>
                )}

                <div className="space-y-2 text-xs">
                  <div className="font-extrabold uppercase text-slate-700">
                    Part A: Tick (✓) and Practice Questions
                  </div>
                  {chapter.quiz.map((q, qIdx) => (
                    <div key={q.id} className="p-2 rounded-lg bg-slate-50 border border-slate-200 space-y-1">
                      <div className="font-bold text-slate-900">
                        Q{qIdx + 1}. {q.question}
                      </div>
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5 text-[11px] text-slate-700">
                        {q.options.map((opt, oIdx) => (
                          <div key={oIdx} className="flex items-center gap-1">
                            <span className="inline-block w-3.5 h-3.5 border border-slate-400 rounded-sm shrink-0" />
                            <span>{opt}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>

                <div className="p-3 rounded-xl border-2 border-dashed border-slate-300 text-xs text-slate-500 h-20 flex items-center justify-center">
                  ✏️ Draw, Color, or Write 3 Examples from Today&apos;s Lesson Here!
                </div>
              </div>
            </div>
          )}

          {viewportTab === 'cad3d' && (
            <Suspense fallback={<LabLoading />}>
            <AnatomyCADInspector
              initialPreset={
                chapter.cadPresetId ||
                (chapter.track === 'engineering'
                  ? 'turbofan-jet'
                  : chapter.track === 'medical'
                  ? 'heart-thorax'
                  : 'cell-ultrastructure')
              }
            />
            </Suspense>
          )}

          {viewportTab === 'sandbox' && (
            <div className="rounded-2xl bg-[#111827] border border-[#1F2937] p-5 space-y-4">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <div>
                  <h3 className="text-sm font-bold text-white flex items-center gap-2">
                    <Calculator className="w-4 h-4 text-cyan-400" />
                    Interactive Formula & Numerical Problem Sandbox
                  </h3>
                  <p className="text-xs text-slate-400">
                    Experiment with numerical parameters and compare CBSE vs. ICSE/ISC exam requirements
                  </p>
                </div>
                <span className="px-2.5 py-1 rounded bg-cyan-500/10 text-cyan-300 text-xs font-mono">
                  {chapter.syllabusAlignment.examRelevance}
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="p-3 rounded-xl bg-[#090D16] border border-slate-800 space-y-1.5">
                  <div className="flex justify-between text-xs">
                    <span className="text-slate-400">Input Variable X₁</span>
                    <span className="font-mono font-bold text-cyan-300">{sandboxA}</span>
                  </div>
                  <input
                    type="range"
                    min={1}
                    max={100}
                    value={sandboxA}
                    onChange={(e) => setSandboxA(Number(e.target.value))}
                    className="w-full h-1.5 bg-slate-800 rounded-lg cursor-pointer"
                  />
                </div>

                <div className="p-3 rounded-xl bg-[#090D16] border border-slate-800 space-y-1.5">
                  <div className="flex justify-between text-xs">
                    <span className="text-slate-400">Input Variable X₂</span>
                    <span className="font-mono font-bold text-emerald-300">{sandboxB}</span>
                  </div>
                  <input
                    type="range"
                    min={1}
                    max={50}
                    value={sandboxB}
                    onChange={(e) => setSandboxB(Number(e.target.value))}
                    className="w-full h-1.5 bg-slate-800 rounded-lg cursor-pointer"
                  />
                </div>

                <div className="p-3 rounded-xl bg-[#090D16] border border-slate-800 space-y-1.5">
                  <div className="flex justify-between text-xs">
                    <span className="text-slate-400">Field Constant k</span>
                    <span className="font-mono font-bold text-amber-300">{sandboxC}</span>
                  </div>
                  <input
                    type="range"
                    min={1}
                    max={25}
                    step={0.2}
                    value={sandboxC}
                    onChange={(e) => setSandboxC(Number(e.target.value))}
                    className="w-full h-1.5 bg-slate-800 rounded-lg cursor-pointer"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                <div className="p-3 rounded-xl bg-[#090D16] border border-cyan-500/30">
                  <div className="text-[10px] font-mono uppercase text-slate-400">
                    Product (X₁ · X₂)
                  </div>
                  <div className="text-base font-mono font-bold text-cyan-300 mt-0.5">
                    {(sandboxA * sandboxB).toFixed(1)}
                  </div>
                </div>
                <div className="p-3 rounded-xl bg-[#090D16] border border-emerald-500/30">
                  <div className="text-[10px] font-mono uppercase text-slate-400">
                    Ratio (X₁ / X₂)
                  </div>
                  <div className="text-base font-mono font-bold text-emerald-300 mt-0.5">
                    {(sandboxA / sandboxB).toFixed(3)}
                  </div>
                </div>
                <div className="p-3 rounded-xl bg-[#090D16] border border-amber-500/30">
                  <div className="text-[10px] font-mono uppercase text-slate-400">
                    Quadratic (½ k X₂²)
                  </div>
                  <div className="text-base font-mono font-bold text-amber-300 mt-0.5">
                    {(0.5 * sandboxC * sandboxB * sandboxB).toFixed(1)}
                  </div>
                </div>
                <div className="p-3 rounded-xl bg-[#090D16] border border-violet-500/30">
                  <div className="text-[10px] font-mono uppercase text-slate-400">
                    Euclidean √(X₁² + X₂²)
                  </div>
                  <div className="text-base font-mono font-bold text-violet-300 mt-0.5">
                    {Math.sqrt(sandboxA * sandboxA + sandboxB * sandboxB).toFixed(2)}
                  </div>
                </div>
              </div>

              <div className="space-y-2.5">
                {chapter.keyFormulas.map((kf, idx) => (
                  <FormulaCard
                    key={idx}
                    label={kf.label}
                    latex={kf.latex}
                    description={kf.description}
                  />
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Right 30% (4 of 12 cols on xl): Theory, Formulas, Syllabus Comparison & Quiz Dock */}
        <div className="xl:col-span-4 rounded-2xl bg-[#111827] border border-[#1F2937] p-4 space-y-4 sticky top-24">
          {/* Dock Navigation Tabs */}
          <div className="grid grid-cols-3 gap-1 bg-[#090D16] p-1 rounded-xl border border-slate-800">
            <button
              type="button"
              onClick={() => setDockTab('theory')}
              className={`flex items-center justify-center gap-1.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                dockTab === 'theory'
                  ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <BookOpen className="w-3.5 h-3.5" />
              Theory
            </button>

            <button
              type="button"
              onClick={() => setDockTab('syllabus')}
              className={`flex items-center justify-center gap-1.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                dockTab === 'syllabus'
                  ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              CBSE/ICSE
            </button>

            <button
              type="button"
              onClick={() => setDockTab('quiz')}
              className={`flex items-center justify-center gap-1.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                dockTab === 'quiz'
                  ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Award className="w-3.5 h-3.5" />
              Quiz ({chapter.quiz.length})
            </button>
          </div>

          {/* Tab 1: Theory & Live Equations */}
          {dockTab === 'theory' && (
            <div className="space-y-4">
              <div className="space-y-2.5">
                {chapter.keyFormulas.map((f, idx) => (
                  <FormulaCard
                    key={idx}
                    label={f.label}
                    latex={f.latex}
                    description={f.description}
                    kidFriendly={isPrimaryWing}
                    accentColor={
                      chapter.track === 'engineering'
                        ? 'amber'
                        : chapter.track === 'medical'
                        ? 'emerald'
                        : 'cyan'
                    }
                  />
                ))}
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-300">
                    {isPrimaryWing ? '🌟 Key Learning Points' : 'Core Scientific Takeaways'}
                  </h4>
                  <button
                    type="button"
                    onClick={() => speakNote(chapter.conceptNotes.join('. '))}
                    className="flex items-center gap-1 px-2 py-0.5 rounded bg-cyan-500/15 border border-cyan-500/40 text-[10px] font-bold text-cyan-200 hover:bg-cyan-500/25"
                  >
                    <Volume2 className="w-3 h-3" />
                    🔊 Read All
                  </button>
                </div>
                <ul className="space-y-2">
                  {chapter.conceptNotes.map((note, idx) => (
                    <li
                      key={idx}
                      className="p-2.5 rounded-xl bg-[#090D16] border border-slate-800/90 text-xs text-slate-300 leading-relaxed flex items-start justify-between gap-2"
                    >
                      <div className="flex items-start gap-2">
                        <CheckCircle2 className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
                        <span>{note}</span>
                      </div>
                      <button
                        type="button"
                        onClick={() => speakNote(note)}
                        title="Read note aloud"
                        className="p-1 rounded-lg bg-slate-800/80 hover:bg-cyan-500/20 text-cyan-300 shrink-0"
                      >
                        <Volume2 className="w-3.5 h-3.5" />
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          )}

          {/* Tab 2: CBSE vs. ICSE/ISC Syllabus Comparison */}
          {dockTab === 'syllabus' && (
            <div className="space-y-3 text-xs">
              <div className="p-3 rounded-xl bg-[#090D16] border border-cyan-500/30 space-y-1">
                <div className="font-mono font-bold text-cyan-400 uppercase">
                  CBSE (NCERT Syllabus Mapping)
                </div>
                <p className="text-slate-200 leading-relaxed">
                  {chapter.syllabusAlignment.cbseChapter}
                </p>
              </div>

              <div className="p-3 rounded-xl bg-[#090D16] border border-violet-500/30 space-y-1">
                <div className="font-mono font-bold text-violet-400 uppercase">
                  ICSE / ISC (CISCE Syllabus Mapping)
                </div>
                <p className="text-slate-200 leading-relaxed">
                  {chapter.syllabusAlignment.icseChapter}
                </p>
              </div>

              <div className="p-3 rounded-xl bg-[#090D16] border border-amber-500/30 space-y-1">
                <div className="font-mono font-bold text-amber-400 uppercase">
                  Pedagogical & Board Difference Note
                </div>
                <p className="text-slate-300 leading-relaxed">
                  {chapter.syllabusAlignment.differenceNote}
                </p>
              </div>

              <div className="p-3 rounded-xl bg-[#090D16] border border-emerald-500/30 space-y-1">
                <div className="font-mono font-bold text-emerald-400 uppercase">
                  Competitive & Examination Weightage
                </div>
                <p className="text-slate-300 leading-relaxed">
                  {chapter.syllabusAlignment.examRelevance}
                </p>
              </div>
            </div>
          )}

          {/* Tab 3: Interactive Concept Mastery Quiz */}
          {dockTab === 'quiz' && (
            <InteractiveQuiz
              questions={chapter.quiz}
              chapterTitle={chapter.title}
              isCompleted={isCompleted}
              onMarkComplete={
                onToggleComplete ? () => onToggleComplete(chapter.id) : undefined
              }
              chapterId={chapter.id}
              skillId={class1Meta?.skills.length === 1 ? class1Meta.skills[0] : undefined}
            />
          )}
        </div>
      </div>
    </main>
  );
};

const LabLoading: React.FC = () => (
  <div className="rounded-2xl bg-[#111827] border border-[#1F2937] p-10 text-center text-sm text-slate-300">
    Loading the lab…
  </div>
);
