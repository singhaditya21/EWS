export type EducationTrack = 'school' | 'engineering' | 'medical';

export type SchoolBoard = 'CBSE' | 'ICSE';

export type SimulationId =
  | 'Class1InteractiveLab'
  | 'PrimaryMathSolarLab'
  | 'MiddleMachinesMatter'
  | 'OpticsRayBench'
  | 'ProjectileKinematics'
  | 'MolecularVSEPR3D'
  | 'CalculusVisualizer'
  | 'FourStrokeEngine'
  | 'RLCCircuitPhasor'
  | 'BeamStressDeflection'
  | 'CPUPipelinePathfinder'
  | 'CardiacECGSimulator'
  | 'DNAReplication3D'
  | 'ActionPotentialNerve'
  | 'AnatomyCADInspector';

export type CADPresetId =
  | 'heart-thorax'
  | 'brain-cranium'
  | 'turbofan-jet'
  | 'planetary-gearbox'
  | 'cell-ultrastructure';

export interface QuizQuestion {
  id: string;
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
  boardTag?: string;
}

export interface SyllabusAlignment {
  cbseChapter: string;
  icseChapter: string;
  examRelevance: string;
  differenceNote: string;
}

export interface FormulaDefinition {
  label: string;
  latex: string;
  description: string;
  liveSubstitution?: string;
}

export interface SandboxParameter {
  id: string;
  label: string;
  symbol: string;
  unit: string;
  min: number;
  max: number;
  step: number;
  defaultValue: number;
}

export interface CurriculumChapter {
  id: string;
  title: string;
  track: EducationTrack;
  board: SchoolBoard | 'BOTH';
  classLevel?: number; // 1 to 12 for school track
  wing?: 'Primary (Class 1–5)' | 'Middle (Class 6–8)' | 'Secondary (Class 9–10)' | 'Senior Secondary (Class 11–12)';
  streamCategory: string; // e.g., "Class 10" or "Mechanical Engineering" or "Human Physiology"
  subject: string;
  chapterNumber: string;
  simulationId: SimulationId;
  defaultSimulationMode?: string;
  cadPresetId?: CADPresetId;
  summary: string;
  syllabusAlignment: SyllabusAlignment;
  keyFormulas: FormulaDefinition[];
  conceptNotes: string[];
  quiz: QuizQuestion[];
}
