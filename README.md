# OmniLearn Labs — Interactive 2D & 3D Visual Education Platform

**OmniLearn Labs** is a production-grade, interactive 2D Canvas and 3D WebGL visual education platform covering **School Curriculum (Class 1 to Class 12 across both CBSE & ICSE/ISC)**, **Engineering (Mechanical, Electrical, Civil, Computer Science)**, and **Medical & Life Sciences (Anatomy, Physiology, Molecular Biology, Biochemistry, Neurobiology)**.

🔗 **Live GitHub Pages Deployment:** [https://singhaditya21.github.io/EWS/](https://singhaditya21.github.io/EWS/)

---

## 🌟 Core Highlights

1. **Complete Dual-Board School Coverage (Class 1 to Class 12 — CBSE NCERT & ICSE/ISC CISCE)**:
   - **Primary Wing (Class 1–5)**: Interactive 5-Rod Place-Value Bead Abacus, Visual Fraction & Equivalence Builder, 3D Heliocentric Solar System, and Animated Hydrological (Water) Cycle.
   - **Middle Wing (Class 6–8)**: Separate ICSE Physics, Chemistry & Biology tracks starting from Class 6 alongside CBSE NCERT Integrated Science & Mathematics (Class I/II/III Levers, Mechanical Advantage, Kinetic Theory of Matter, Spherical Mirrors & Bohr Atomic Shells).
   - **Secondary & Senior Secondary Wing (Class 9–12)**: Full CBSE NCERT & CISCE (ICSE Class 9–10 / ISC Class 11–12) alignment for Physics, Chemistry, Mathematics, Biology, and Computer Science—complete with JEE/NEET and Board exam concept checks.
2. **Engineering Simulation Suite**:
   - **Mechanical Engineering**: 4-Stroke Internal Combustion Engine with synchronized slider-crank kinematics, valve timing, spark ignition, and live **Pressure–Volume ($P$-$V$) Otto Cycle** loop + 3D Axial Turbofan & Epicyclic Gearbox CAD Inspector.
   - **Electrical & Electronics Engineering**: Series RLC AC Network Analyzer with rotating complex phasor vectors ($V_R, V_L, V_C, V_{\text{total}}, I$) and a dual-channel scrolling oscilloscope.
   - **Civil & Structural Engineering**: Simply Supported & Cantilever Beam Deflection, Von Mises stress heatmap, and live **Shear Force (SFD)** & **Bending Moment (BMD)** diagrams.
   - **Computer Science & Engineering**: Interactive A*, Dijkstra, and BFS Grid Pathfinder + cycle-accurate **5-Stage RISC CPU Pipeline (`IF → ID → EX → MEM → WB`)** with RAW hazard detection and ALU forwarding.
3. **Medical & Life Sciences Suite**:
   - **Cardiovascular Physiology**: 4-Chamber Human Heart electrical conduction (`SA Node → AV Node → Bundle of His → Purkinje Fibers`), **Wiggers Hemodynamic Pressure Curves**, and live scrolling **Lead-II ECG** with arrhythmia presets.
   - **Molecular Biology & Genetics**: 3D Watson-Crick B-DNA Double Helix with Chargaff base-pairing (`A=T`, `G≡C`) and interactive **Helicase Replication Fork Unzipping**.
   - **Neurobiology**: Axonal phospholipid bilayer with voltage-gated $\text{Na}^+/\text{K}^+$ channels, $\text{Na}^+/\text{K}^+$ ATPase pump, Nernst equilibrium calculator, and live **Hodgkin-Huxley Action Potential ($\text{mV}$ vs. $\text{ms}$)** trace.
   - **3D Gross Anatomy & CAD Cross-Section Dissector**: Real-time **X/Y/Z Cross-Section Clipping Planes**, **Radial/Axial Exploded View Slider**, clickable 3D spatial pins, and drag-and-drop custom `.glb`/`.gltf` asset support.

---

## 🧒 Class 1 (CBSE & ICSE)

Class 1 is the most complete part of the app: 34 play-based chapters across Maths, English, Hindi, EVS, Computer Studies and Arts.

- **One shared core, two board views.** `src/class1/boardMap.ts` places every chapter in each board's sequence and marks it *Core*, *Integrated theme* (CBSE has no Class 1 EVS book), *Extension* or *Enrichment*. The sidebar, chapter labels and Prev/Next follow the selected board.
- **Syllabus map.** `src/class1/syllabus.ts` lists NCERT Joyful Mathematics 1, Mridang 1 and Sarangi 1 chapters (CBSE) and typical ICSE topics (CISCE prescribes no Class 1 textbooks), showing what is covered, partly covered or still missing.
- **Practice and review.** 65 skills (`src/class1/skills.ts`); maths questions are generated (`questionBank/math.ts`), other subjects use 459 reviewed questions. Only the first attempt counts, and skills come back for review on a spaced schedule.
- **Progress on the device only.** Child profiles, stars (once per activity per day), quiz first attempts, skill levels and teacher observations live in `localStorage` (`src/class1/progressStore.ts`) — no accounts, no network.
- **Board-appropriate reports and worksheets.** CBSE: descriptors with no marks (supports the teacher's Holistic Progress Card) and activity sheets with an "I can…" self-check. ICSE: first-attempt percentages and marked practice tests with an answer key.
- **Parent and teacher views.** Lesson plans for every chapter (`src/class1/lessonPlans.ts`), projector mode, observations, a weekly parent summary and 10-minute home activities.
- **Works offline** once opened (service worker in `public/sw.js`), and Hindi is read with a Hindi voice when the device has one.

Content checks run before every build (`npm run check:content`): they fail on wrong answer indexes, answers given away by markers, duplicate ids, empty options or unknown skills. All Class 1 content is marked *Teacher review pending* until a practising Class 1 teacher signs it off.

---

## 🏗️ Repository Architecture

```text
src/
├── components/
│   ├── layout/
│   │   ├── Navbar.tsx                # Track Switcher (School / Engineering / Medical), Board Toggle (CBSE / ICSE), Cmd+K search
│   │   ├── CurriculumSidebar.tsx     # Collapsible tree: Board -> Class (1-12) / Stream -> Subject -> Chapter -> Lab
│   │   └── LabWorkspace.tsx          # Split-screen layout: 70% Interactive Viewport + 30% Control/Theory Dock
│   ├── engine/
│   │   ├── Canvas2DWrapper.tsx       # 60FPS HTML5 Canvas container with pan, zoom, grid, and FPS readout
│   │   ├── Scene3DWrapper.tsx        # Three.js wrapper with OrbitControls, lighting, X/Y/Z clipping planes
│   │   ├── AnatomyCADInspector.tsx   # Reusable 3D .glb loader with exploded view slider & 3D annotation pins
│   │   ├── ParameterPanel.tsx        # Standardized sliders, toggles, presets, and live telemetry badges
│   │   ├── TimelineBar.tsx           # Play, Pause, Step Forward, Speed (0.25x, 0.5x, 1x, 2x), and Reset
│   │   └── FormulaCard.tsx           # Live KaTeX equations that dynamically substitute user slider values
│   └── assessment/
│       └── InteractiveQuiz.tsx       # 3 board-aligned concept-check questions per module with instant feedback
├── data/
│   └── curriculum.ts                 # Complete registry for CBSE (Class 1-12), ICSE/ISC (Class 1-12), Engineering, and Medical
├── simulations/
│   ├── school/
│   │   ├── PrimaryMathSolarLab.tsx   # Class 1-5 (CBSE/ICSE): Visual Abacus/Fractions + 3D Solar System & Water Cycle
│   │   ├── MiddleMachinesMatter.tsx  # Class 6-8 (CBSE/ICSE): Levers/Pulleys (Class I/II/III) & States of Matter Particle Lab
│   │   ├── OpticsRayBench.tsx        # Class 8-12 Physics: Concave/Convex lenses, mirrors & ray-tracing
│   │   ├── ProjectileKinematics.tsx  # Class 9-11 Physics: Vectors, trajectory, gravity presets, KE/PE bars
│   │   ├── MolecularVSEPR3D.tsx      # Class 8-12 Chemistry: 3D VSEPR molecular geometry & Bohr atomic shells
│   │   └── CalculusVisualizer.tsx    # Class 11-12 Math: Tangent derivatives (dy/dx) & Riemann integral sums
│   ├── engineering/
│   │   ├── FourStrokeEngine.tsx      # Mechanical: Piston-crankshaft-valve kinematics + live PV thermodynamic loop
│   │   ├── RLCCircuitPhasor.tsx      # Electrical: Live dual-channel oscilloscope + rotating phasor vectors
│   │   ├── BeamStressDeflection.tsx  # Civil/Mech: Point loads, bending heatmap, live SFD & BMD graphs
│   │   └── CPUPipelinePathfinder.tsx # Computer Science: A* / Dijkstra visualizer + 5-stage RISC CPU pipeline
│   └── medical/
│       ├── CardiacECGSimulator.tsx   # Physiology: Heart electrical conduction + live scrolling ECG & Wiggers loop
│       ├── DNAReplication3D.tsx      # Molecular Bio: 3D rotating double helix, base-pairing & unzipping mode
│       └── ActionPotentialNerve.tsx  # Neurobiology: Lipid bilayer Na+/K+ channels + live mV depolarization graph
├── types/
│   └── curriculum.types.ts
├── App.tsx
└── main.tsx
```

---

## 🚀 Quick Start & Local Development

```bash
# 1. Install dependencies
npm install

# 2. Start Vite hot-reload development server
npm run dev

# 3. Content checks, type-check and build production static bundle
npm run build

# 4. Preview production build locally
npm run preview
```

---

## 📦 Adding Custom `.glb` / `.gltf` 3D Models or New Curriculum Chapters

1. **Uploading or Adding 3D `.glb` / `.gltf` Models**:
   - Click **"3D CAD / Anatomy Slice"** in any laboratory workspace and use the **"Load .GLB / .GLTF"** button in the top-right toolbar to inspect any local 3D organ scan or CAD assembly with real-time X/Y/Z cross-section clipping planes.
   - You can also place static `.glb` assets inside `public/models/` for permanent hosting.
2. **Adding New Curriculum Modules**:
   - Append a new `CurriculumChapter` entry to `src/data/curriculum.ts` specifying `track` (`'school' | 'engineering' | 'medical'`), `board` (`'CBSE' | 'ICSE' | 'BOTH'`), `classLevel` (`1` to `12`), `simulationId`, `syllabusAlignment`, `keyFormulas`, and `quiz`.
