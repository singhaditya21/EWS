import React, { useState, useEffect } from 'react';
import {
  CurriculumChapter,
  SchoolBoard,
} from '../../types/curriculum.types';
import { FormulaCard } from '../engine/FormulaCard';
import { InteractiveQuiz } from '../assessment/InteractiveQuiz';
import { AnatomyCADInspector } from '../engine/AnatomyCADInspector';

// Import all 13 Flagship Simulations
import { PrimaryMathSolarLab } from '../../simulations/school/PrimaryMathSolarLab';
import { MiddleMachinesMatter } from '../../simulations/school/MiddleMachinesMatter';
import { OpticsRayBench } from '../../simulations/school/OpticsRayBench';
import { ProjectileKinematics } from '../../simulations/school/ProjectileKinematics';
import { MolecularVSEPR3D } from '../../simulations/school/MolecularVSEPR3D';
import { CalculusVisualizer } from '../../simulations/school/CalculusVisualizer';
import { FourStrokeEngine } from '../../simulations/engineering/FourStrokeEngine';
import { RLCCircuitPhasor } from '../../simulations/engineering/RLCCircuitPhasor';
import { BeamStressDeflection } from '../../simulations/engineering/BeamStressDeflection';
import { CPUPipelinePathfinder } from '../../simulations/engineering/CPUPipelinePathfinder';
import { CardiacECGSimulator } from '../../simulations/medical/CardiacECGSimulator';
import { DNAReplication3D } from '../../simulations/medical/DNAReplication3D';
import { ActionPotentialNerve } from '../../simulations/medical/ActionPotentialNerve';

import {
  BookOpen,
  Box,
  Calculator,
  CheckCircle2,
  FlaskConical,
  Award,
  Layers,
} from 'lucide-react';

interface LabWorkspaceProps {
  chapter: CurriculumChapter;
  activeBoard: SchoolBoard;
}

type ViewportTab = 'simulation' | 'cad3d' | 'sandbox';
type DockTab = 'theory' | 'quiz' | 'syllabus';

export const LabWorkspace: React.FC<LabWorkspaceProps> = ({
  chapter,
  activeBoard,
}) => {
  const [viewportTab, setViewportTab] = useState<ViewportTab>('simulation');
  const [dockTab, setDockTab] = useState<DockTab>('theory');

  // Interactive Formula Sandbox Calculator state
  const [sandboxA, setSandboxA] = useState(12);
  const [sandboxB, setSandboxB] = useState(5);
  const [sandboxC, setSandboxC] = useState(9.8);

  useEffect(() => {
    setViewportTab('simulation');
  }, [chapter.id]);

  const renderActiveSimulation = () => {
    switch (chapter.simulationId) {
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
                {chapter.chapterNumber}
              </span>
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

          {/* Viewport Mode Switcher */}
          <div className="flex items-center gap-1.5 bg-[#090D16] p-1.5 rounded-xl border border-slate-800">
            <button
              type="button"
              onClick={() => setViewportTab('simulation')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                viewportTab === 'simulation'
                  ? 'bg-cyan-500 text-slate-950 shadow-sm'
                  : 'text-slate-300 hover:text-white'
              }`}
            >
              <FlaskConical className="w-3.5 h-3.5" />
              Interactive Lab
            </button>

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
          </div>
        </div>

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
        <div className="xl:col-span-8 space-y-4">
          {viewportTab === 'simulation' && renderActiveSimulation()}

          {viewportTab === 'cad3d' && (
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
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-300">
                  Core Scientific Takeaways
                </h4>
                <ul className="space-y-2">
                  {chapter.conceptNotes.map((note, idx) => (
                    <li
                      key={idx}
                      className="p-2.5 rounded-xl bg-[#090D16] border border-slate-800/90 text-xs text-slate-300 leading-relaxed flex items-start gap-2"
                    >
                      <CheckCircle2 className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
                      <span>{note}</span>
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
            />
          )}
        </div>
      </div>
    </main>
  );
};
