import React, { useState } from 'react';
import { Canvas2DWrapper, CanvasRenderContext } from '../../components/engine/Canvas2DWrapper';
import { ParameterPanel } from '../../components/engine/ParameterPanel';
import { FormulaCard } from '../../components/engine/FormulaCard';
import {
  Calculator,
  Shapes,
  Clock,
  IndianRupee,
  Sprout,
  Eye,
  Sun,
  Sparkles,
  Plus,
  Minus,
  CheckCircle2,
} from 'lucide-react';

export type Class1LabMode =
  | 'spatial-prenumber'
  | 'number-line-tenframe'
  | 'addition-subtraction'
  | 'tens-ones-abacus'
  | 'shapes-roll-slide'
  | 'measurement-balance'
  | 'clock-money'
  | 'patterns-pictograph'
  | 'spatial-ordinals-data'
  | 'evs-sense-organs'
  | 'evs-plants-living'
  | 'evs-animals-food-safety'
  | 'evs-seasons-sky';

const SENSE_ORGANS = [
  {
    id: 'eyes',
    organ: 'Eyes (Sense of Sight)',
    action: 'We SEE shapes, colors, big/small, and light with our eyes.',
    stimulus: 'Rainbow & Storybook',
    color: '#38bdf8',
    careTip: 'Read in good light and wash your eyes with clean cold water.',
  },
  {
    id: 'ears',
    organ: 'Ears (Sense of Hearing)',
    action: 'We HEAR loud, soft, pleasant music, and bird sounds with our ears.',
    stimulus: 'Ringing School Bell & Birds Chirping',
    color: '#f59e0b',
    careTip: 'Never put sharp objects inside your ears; avoid very loud noises.',
  },
  {
    id: 'nose',
    organ: 'Nose (Sense of Smell)',
    action: 'We SMELL pleasant fragrances and foul odors, and breathe through our nose.',
    stimulus: 'Fresh Rose & Hot Soup',
    color: '#10b981',
    careTip: 'Always use a clean handkerchief when sneezing or blowing your nose.',
  },
  {
    id: 'tongue',
    organ: 'Tongue (Sense of Taste)',
    action: 'Taste buds help us TASTE Sweet, Salty, Sour, and Bitter foods; helps us speak!',
    stimulus: 'Sweet Mango vs. Sour Lemon',
    color: '#f43f5e',
    careTip: 'Clean your tongue gently every morning while brushing your teeth.',
  },
  {
    id: 'skin',
    organ: 'Skin (Sense of Touch & Feel)',
    action: 'Skin covers our whole body and helps us FEEL Hot, Cold, Soft, Hard, Rough, and Smooth.',
    stimulus: 'Cold Ice Cube vs. Soft Cotton',
    color: '#a855f7',
    careTip: 'Take a bath daily with soap and clean water to keep skin healthy.',
  },
];

const SHAPES_3D = [
  {
    id: 'sphere',
    name: 'Sphere (Ball / Orange)',
    faces: '1 Curved Surface, 0 Flat Faces',
    edgesCorners: '0 Edges, 0 Corners (Vertices)',
    behavior: 'ROLLS ONLY',
    canRoll: true,
    canSlide: false,
    color: '#f43f5e',
  },
  {
    id: 'cube',
    name: 'Cube (Dice / Chalk Box)',
    faces: '6 Flat Square Faces',
    edgesCorners: '12 Straight Edges, 8 Corners',
    behavior: 'SLIDES & STACKS',
    canRoll: false,
    canSlide: true,
    color: '#38bdf8',
  },
  {
    id: 'cylinder',
    name: 'Cylinder (Pencil Cell / Drum)',
    faces: '2 Flat Circular Faces + 1 Curved Surface',
    edgesCorners: '2 Circular Edges, 0 Corners',
    behavior: 'BOTH ROLLS & SLIDES',
    canRoll: true,
    canSlide: true,
    color: '#10b981',
  },
  {
    id: 'cone',
    name: 'Cone (Birthday Cap / Ice-Cream Cone)',
    faces: '1 Flat Circular Base + 1 Curved Surface',
    edgesCorners: '1 Circular Edge, 1 Pointed Vertex',
    behavior: 'BOTH ROLLS & SLIDES',
    canRoll: true,
    canSlide: true,
    color: '#f59e0b',
  },
];

export const Class1InteractiveLab: React.FC<{ initialMode?: string }> = ({
  initialMode,
}) => {
  const [mode, setMode] = useState<Class1LabMode>(
    (initialMode as Class1LabMode) || 'number-line-tenframe'
  );

  // Mode 1: Numbers 1-20, Ten-Frames & Crocodile Comparison (<, >, =)
  const [leftCount, setLeftCount] = useState(14);
  const [rightCount, setRightCount] = useState(9);

  // Mode 2: Addition & Subtraction (Number Line Frog Hops)
  const [startNum, setStartNum] = useState(8);
  const [changeNum, setChangeNum] = useState(5);
  const [operation, setOperation] = useState<'add' | 'sub'>('add');

  // Mode 3: Tens & Ones Abacus (1 to 99) + Skip Counting
  const [twoDigitNum, setTwoDigitNum] = useState(46);
  const [skipStep, setSkipStep] = useState<2 | 5 | 10>(2);

  // Mode 4: Shapes Roll vs Slide Ramp
  const [selectedShapeIdx, setSelectedShapeIdx] = useState(0);
  const [rampAngle, setRampAngle] = useState(22);

  // Mode 5: Time (Analog Clock) & Indian Money (₹)
  const [clockHour, setClockHour] = useState(4);
  const [clockHalfHour, setClockHalfHour] = useState(false); // false = :00, true = :30
  const [walletCoins, setWalletCoins] = useState<number[]>([10, 5, 2, 1]);

  // Mode 6: EVS 5 Sense Organs
  const [selectedSenseIdx, setSelectedSenseIdx] = useState(0);

  // Mode 7: EVS Growing Plant & Living vs Non-Living
  const [waterLevel, setWaterLevel] = useState(80);
  const [sunlightLevel, setSunlightLevel] = useState(85);

  // Mode 8: EVS Seasons & Day/Night Sky
  const [season, setSeason] = useState<'summer' | 'monsoon' | 'winter' | 'spring'>('summer');
  const [isNightSky, setIsNightSky] = useState(false);

  // Mode 9: Spatial Sense, Ordinals (1st-10th), Repeated Addition & Data Pictograph
  const [groupsCount, setGroupsCount] = useState(4);
  const [itemsPerGroup, setItemsPerGroup] = useState(3);
  const [selectedOrdinal, setSelectedOrdinal] = useState(3); // 1st to 10th

  // Mode 10: Pre-Number Spatial Vocabulary (Finding the Furry Cat!)
  const [catPosition, setCatPosition] = useState<'inside' | 'outside' | 'on' | 'under' | 'near' | 'far'>('on');

  // Mode 11: Non-Standard Measurement (Handspans, Pan Balance, Capacity)
  const [objectHandspans, setObjectHandspans] = useState(5);
  const [leftPanBlocks, setLeftPanBlocks] = useState(6);
  const [rightPanBlocks, setRightPanBlocks] = useState(4);
  const [jugCups, setJugCups] = useState(4);

  // Mode 12: Patterns (Utsav) & Data Pictograph (So Many Toys)
  const [patternType, setPatternType] = useState<'ABAB' | 'AAB' | 'ABC' | 'NUM'>('ABAB');
  const [toyCounts, setToyCounts] = useState({ cars: 5, dolls: 3, balls: 7, blocks: 4 });

  // Mode 13: EVS Animals, Healthy Food & Traffic Safety Light
  const [trafficLight, setTrafficLight] = useState<'red' | 'yellow' | 'green'>('green');
  const [animalCategory, setAnimalCategory] = useState<'wild' | 'domestic' | 'pet' | 'water'>('wild');

  // Computed values
  const compSymbol = leftCount > rightCount ? '>' : leftCount < rightCount ? '<' : '=';
  const compWord =
    leftCount > rightCount
      ? 'is greater than'
      : leftCount < rightCount
      ? 'is less than'
      : 'is equal to';

  const resultNum =
    operation === 'add' ? startNum + changeNum : Math.max(0, startNum - changeNum);

  const tensDigit = Math.floor(twoDigitNum / 10);
  const onesDigit = twoDigitNum % 10;

  const totalMoney = walletCoins.reduce((a, b) => a + b, 0);

  // Canvas Renderers
  const renderFrogNumberLine = ({ ctx, width, height, elapsedTime }: CanvasRenderContext) => {
    const lineY = height * 0.68;
    const startX = 40;
    const endX = width - 40;
    const maxN = 20;
    const stepPx = (endX - startX) / maxN;

    // Draw Number Line 0 to 20
    ctx.strokeStyle = '#38bdf8';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(startX, lineY);
    ctx.lineTo(endX, lineY);
    ctx.stroke();

    ctx.font = 'bold 12px JetBrains Mono, monospace';
    ctx.textAlign = 'center';
    for (let i = 0; i <= maxN; i++) {
      const x = startX + i * stepPx;
      ctx.strokeStyle = i === startNum || i === resultNum ? '#fde047' : '#64748b';
      ctx.lineWidth = i % 5 === 0 ? 3 : 1.5;
      ctx.beginPath();
      ctx.moveTo(x, lineY - 8);
      ctx.lineTo(x, lineY + 8);
      ctx.stroke();

      ctx.fillStyle =
        i === resultNum ? '#10b981' : i === startNum ? '#fde047' : '#cbd5e1';
      ctx.fillText(`${i}`, x, lineY + 26);
    }

    // Draw Frog Hops from startNum to resultNum
    const steps = Math.abs(resultNum - startNum);
    const dir = operation === 'add' ? 1 : -1;
    ctx.strokeStyle = operation === 'add' ? '#10b981' : '#f43f5e';
    ctx.lineWidth = 2.5;
    for (let s = 0; s < steps; s++) {
      const n1 = startNum + s * dir;
      const n2 = n1 + dir;
      if (n2 < 0 || n2 > maxN) continue;
      const x1 = startX + n1 * stepPx;
      const x2 = startX + n2 * stepPx;
      const midX = (x1 + x2) / 2;
      ctx.beginPath();
      ctx.moveTo(x1, lineY - 6);
      ctx.quadraticCurveTo(midX, lineY - 58, x2, lineY - 6);
      ctx.stroke();
    }

    // Animated Frog at resultNum
    const frogX = startX + Math.min(maxN, resultNum) * stepPx;
    const bounce = Math.abs(Math.sin(elapsedTime * 4)) * 12;
    const frogY = lineY - 22 - bounce;

    ctx.fillStyle = '#22c55e';
    ctx.beginPath();
    ctx.arc(frogX, frogY, 15, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.arc(frogX - 5, frogY - 6, 4, 0, Math.PI * 2);
    ctx.arc(frogX + 5, frogY - 6, 4, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#090d16';
    ctx.beginPath();
    ctx.arc(frogX - 5, frogY - 6, 2, 0, Math.PI * 2);
    ctx.arc(frogX + 5, frogY - 6, 2, 0, Math.PI * 2);
    ctx.fill();

    // Top Equation Banner
    ctx.fillStyle = '#f8fafc';
    ctx.font = 'bold 16px JetBrains Mono, monospace';
    ctx.textAlign = 'left';
    ctx.fillText(
      `Frog Jumps: ${startNum} ${operation === 'add' ? '+' : '-'} ${changeNum} = ${resultNum} (${steps} ${
        operation === 'add' ? 'Forward' : 'Backward'
      } Hops)`,
      35,
      42
    );
  };

  const renderShapeRamp = ({ ctx, width, height, elapsedTime }: CanvasRenderContext) => {
    const activeShape = SHAPES_3D[selectedShapeIdx];
    const rad = (rampAngle * Math.PI) / 180;
    const rampStartX = 90;
    const rampStartY = 95;
    const rampLen = Math.min(width - 180, 380);

    ctx.save();
    ctx.translate(rampStartX, rampStartY);
    ctx.rotate(rad);

    // Draw Inclined Ramp Plank
    ctx.fillStyle = '#334155';
    ctx.fillRect(0, 0, rampLen, 14);

    // Shape position along the ramp
    const dist = ((elapsedTime * (45 + rampAngle * 2.5)) % (rampLen - 40)) + 20;
    const spin = activeShape.canRoll ? elapsedTime * 6 : 0;

    ctx.save();
    ctx.translate(dist, -22);
    ctx.rotate(spin);
    ctx.fillStyle = activeShape.color;
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 2;

    if (activeShape.id === 'sphere' || activeShape.id === 'cylinder') {
      ctx.beginPath();
      ctx.arc(0, 0, 20, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
      // Spokes to visualize rolling vs sliding
      ctx.beginPath();
      ctx.moveTo(-18, 0);
      ctx.lineTo(18, 0);
      ctx.moveTo(0, -18);
      ctx.lineTo(0, 18);
      ctx.stroke();
    } else if (activeShape.id === 'cube') {
      ctx.fillRect(-20, -20, 40, 40);
      ctx.strokeRect(-20, -20, 40, 40);
    } else {
      // Cone triangle profile
      ctx.beginPath();
      ctx.moveTo(0, -22);
      ctx.lineTo(-20, 18);
      ctx.lineTo(20, 18);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
    }
    ctx.restore();
    ctx.restore();

    ctx.fillStyle = '#38bdf8';
    ctx.font = 'bold 14px JetBrains Mono, monospace';
    ctx.fillText(
      `${activeShape.name} → ${activeShape.behavior} (${activeShape.faces})`,
      30,
      36
    );
  };

  const renderPlantGrowth = ({ ctx, width, height, elapsedTime }: CanvasRenderContext) => {
    const health = (waterLevel + sunlightLevel) / 200; // 0.1 to 1.0
    const groundY = height * 0.72;
    const cx = width * 0.5;

    // Sky & Soil
    ctx.fillStyle = '#0c192c';
    ctx.fillRect(0, 0, width, groundY);
    ctx.fillStyle = '#422006';
    ctx.fillRect(0, groundY, width, height - groundY);

    // Sun
    const sunR = 20 + (sunlightLevel / 100) * 22;
    ctx.fillStyle = '#fde047';
    ctx.beginPath();
    ctx.arc(85, 65, sunR, 0, Math.PI * 2);
    ctx.fill();

    // Roots underground
    ctx.strokeStyle = '#d97706';
    ctx.lineWidth = 3;
    for (let i = -2; i <= 2; i++) {
      ctx.beginPath();
      ctx.moveTo(cx, groundY);
      ctx.lineTo(cx + i * 26 * health, groundY + 45 * health);
      ctx.stroke();
    }

    // Stem height proportional to water & sunlight
    const stemH = 35 + health * 145;
    const sway = Math.sin(elapsedTime * 2) * 5;
    ctx.strokeStyle = '#22c55e';
    ctx.lineWidth = 7;
    ctx.beginPath();
    ctx.moveTo(cx, groundY);
    ctx.quadraticCurveTo(cx + sway, groundY - stemH * 0.5, cx + sway, groundY - stemH);
    ctx.stroke();

    // Leaves
    if (health > 0.3) {
      ctx.fillStyle = '#10b981';
      ctx.beginPath();
      ctx.ellipse(cx - 24, groundY - stemH * 0.45, 22, 10, -0.4, 0, Math.PI * 2);
      ctx.ellipse(cx + 24, groundY - stemH * 0.62, 22, 10, 0.4, 0, Math.PI * 2);
      ctx.fill();
    }

    // Flower & Fruit at high health
    if (health > 0.65) {
      const fx = cx + sway;
      const fy = groundY - stemH;
      ctx.fillStyle = '#f43f5e';
      for (let p = 0; p < 6; p++) {
        const a = (p / 6) * Math.PI * 2 + elapsedTime * 0.5;
        ctx.beginPath();
        ctx.arc(fx + Math.cos(a) * 16, fy + Math.sin(a) * 16, 9, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.fillStyle = '#fde047';
      ctx.beginPath();
      ctx.arc(fx, fy, 9, 0, Math.PI * 2);
      ctx.fill();
    }

    // Labels of Plant Parts
    ctx.fillStyle = '#f8fafc';
    ctx.font = 'bold 11px JetBrains Mono, monospace';
    ctx.fillText('1. ROOTS (Absorb Water & Minerals)', cx + 65, groundY + 35);
    ctx.fillText('2. STEM (Carries Water & Supports Plant)', cx + 45, groundY - stemH * 0.3);
    if (health > 0.3) {
      ctx.fillText('3. LEAVES (Kitchen of Plant — Make Food)', cx - 265, groundY - stemH * 0.5);
    }
    if (health > 0.65) {
      ctx.fillStyle = '#fde047';
      ctx.fillText('4. FLOWER & FRUIT (Produces Seeds)', cx + 35, groundY - stemH - 8);
    }
  };

  const renderSeasonsAndSky = ({ ctx, width, height, elapsedTime }: CanvasRenderContext) => {
    const groundY = height * 0.74;
    const skyColors = {
      summer: '#0284c7',
      monsoon: '#1e293b',
      winter: '#334155',
      spring: '#0369a1',
    };
    ctx.fillStyle = isNightSky ? '#030712' : skyColors[season];
    ctx.fillRect(0, 0, width, groundY);

    ctx.fillStyle = season === 'winter' ? '#e2e8f0' : '#15803d';
    ctx.fillRect(0, groundY, width, height - groundY);

    if (isNightSky) {
      // Moon & Twinkling Stars
      ctx.fillStyle = '#fef08a';
      ctx.beginPath();
      ctx.arc(width - 95, 75, 28, 0, Math.PI * 2);
      ctx.fill();

      for (let s = 0; s < 24; s++) {
        const sx = (s * 67) % (width - 40) + 20;
        const sy = (s * 43) % (groundY - 60) + 20;
        const r = 1.5 + Math.abs(Math.sin(elapsedTime * 3 + s)) * 2;
        ctx.beginPath();
        ctx.arc(sx, sy, r, 0, Math.PI * 2);
        ctx.fill();
      }
    } else {
      // Sun
      ctx.fillStyle = '#fde047';
      ctx.beginPath();
      ctx.arc(95, 75, season === 'summer' ? 36 : 24, 0, Math.PI * 2);
      ctx.fill();
    }

    // Monsoon Rain or Winter Snowflakes
    if (season === 'monsoon' || season === 'winter') {
      ctx.strokeStyle = '#bae6fd';
      ctx.fillStyle = '#f8fafc';
      for (let i = 0; i < 28; i++) {
        const rx = ((i * 53 + elapsedTime * 30) % (width - 20)) + 10;
        const ry = ((i * 41 + elapsedTime * 120) % (groundY - 20)) + 10;
        if (season === 'monsoon') {
          ctx.beginPath();
          ctx.moveTo(rx, ry);
          ctx.lineTo(rx - 4, ry + 12);
          ctx.stroke();
        } else {
          ctx.beginPath();
          ctx.arc(rx, ry, 3.5, 0, Math.PI * 2);
          ctx.fill();
        }
      }
    }

    const clothingNote = {
      summer: 'SUMMER: Hot & Sunny • Wear light Cotton clothes • Drink plenty of water',
      monsoon: 'MONSOON (RAINY): Dark clouds & Rain • Use Umbrella, Raincoat & Gumboots',
      winter: 'WINTER: Cold & Breezy • Wear warm Woolen Sweaters, Jackets & Mufflers',
      spring: 'SPRING: Pleasant weather • New leaves & colorful flowers bloom on trees',
    };

    ctx.fillStyle = '#f8fafc';
    ctx.font = 'bold 12px JetBrains Mono, monospace';
    ctx.fillText(
      `${isNightSky ? 'NIGHT SKY (Moon & Stars)' : 'DAY SKY (Bright Sun)'} | ${clothingNote[season]}`,
      20,
      30
    );
  };

  return (
    <div className="space-y-4">
      {/* 8-Mode Class 1 Interactive Selector Bar */}
      <div className="flex flex-wrap items-center gap-1.5 p-2.5 rounded-xl bg-[#111827] border border-[#1F2937]">
        {[
          { id: 'spatial-prenumber', label: '1. Spatial Sense (Furry Cat)', icon: Sparkles },
          { id: 'number-line-tenframe', label: '2. Numbers 1–20 & < > =', icon: Sparkles },
          { id: 'addition-subtraction', label: '3. Add & Subtract (Frog Hops)', icon: Calculator },
          { id: 'tens-ones-abacus', label: '4. Tens & Ones Abacus (1–99)', icon: Plus },
          { id: 'shapes-roll-slide', label: '5. Shapes: Roll vs Slide', icon: Shapes },
          { id: 'measurement-balance', label: '6. Measure: Handspan & Balance', icon: Calculator },
          { id: 'clock-money', label: '7. Clock & ₹ Money Shop', icon: Clock },
          { id: 'patterns-pictograph', label: '8. Patterns & Toy Pictograph', icon: Shapes },
          { id: 'spatial-ordinals-data', label: '9. Ordinals (1st–10th) & Groups', icon: Sparkles },
          { id: 'evs-sense-organs', label: '10. EVS: 5 Sense Organs', icon: Eye },
          { id: 'evs-plants-living', label: '11. EVS: Growing Plant', icon: Sprout },
          { id: 'evs-animals-food-safety', label: '12. EVS: Animals & Traffic Safety', icon: CheckCircle2 },
          { id: 'evs-seasons-sky', label: '13. EVS: Seasons & Sky', icon: Sun },
        ].map((m) => {
          const Icon = m.icon;
          const active = mode === m.id;
          return (
            <button
              key={m.id}
              type="button"
              onClick={() => setMode(m.id as Class1LabMode)}
              className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                active
                  ? 'bg-cyan-500 text-slate-950 shadow-sm'
                  : 'bg-[#090D16] text-slate-300 border border-slate-800 hover:text-white'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              {m.label}
            </button>
          );
        })}
      </div>

      {/* MODE 0: SPATIAL PRE-NUMBER CONCEPTS (FINDING THE FURRY CAT!) */}
      {mode === 'spatial-prenumber' && (
        <div className="p-4 rounded-xl bg-[#111827] border border-[#1F2937] space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-cyan-400">
                NCERT Ch 1: Finding the Furry Cat! — Pre-Number Spatial Vocabulary
              </h4>
              <p className="text-xs text-slate-400">
                Click any spatial position word below to move the Furry Cat 🐱
              </p>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {(
                [
                  { id: 'on', label: 'ON the Table' },
                  { id: 'under', label: 'UNDER the Table' },
                  { id: 'inside', label: 'INSIDE the Box' },
                  { id: 'outside', label: 'OUTSIDE the Box' },
                  { id: 'near', label: 'NEAR the Tree' },
                  { id: 'far', label: 'FAR from the Tree' },
                ] as const
              ).map((pos) => (
                <button
                  key={pos.id}
                  type="button"
                  onClick={() => setCatPosition(pos.id)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold border transition-all ${
                    catPosition === pos.id
                      ? 'bg-cyan-500 text-slate-950 border-white'
                      : 'bg-[#090D16] text-slate-300 border-slate-800'
                  }`}
                >
                  {pos.label}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 rounded-xl bg-[#090D16] border border-slate-800">
            {/* Scene 1: Table (ON vs UNDER) */}
            <div className="p-4 rounded-xl bg-[#111827] border border-slate-800 flex flex-col items-center justify-between h-48">
              <span className="text-xs font-mono text-cyan-300 font-bold">
                ON vs. UNDER the Table
              </span>
              <div className="relative w-40 h-28 flex flex-col items-center justify-center">
                {catPosition === 'on' && (
                  <div className="text-3xl animate-bounce mb-1">🐱</div>
                )}
                {/* Table Top & Legs */}
                <div className="w-36 h-3 bg-amber-600 rounded" />
                <div className="w-28 flex justify-between">
                  <div className="w-2.5 h-14 bg-amber-700" />
                  <div className="w-2.5 h-14 bg-amber-700" />
                </div>
                {catPosition === 'under' && (
                  <div className="absolute bottom-1 text-3xl animate-bounce">🐱</div>
                )}
              </div>
              <span className="text-[11px] text-slate-400">
                {catPosition === 'on'
                  ? 'The cat is sitting ON the table.'
                  : catPosition === 'under'
                  ? 'The cat is hiding UNDER the table.'
                  : 'Click ON or UNDER above'}
              </span>
            </div>

            {/* Scene 2: Box (INSIDE vs OUTSIDE) */}
            <div className="p-4 rounded-xl bg-[#111827] border border-slate-800 flex flex-col items-center justify-between h-48">
              <span className="text-xs font-mono text-emerald-300 font-bold">
                INSIDE vs. OUTSIDE the Box
              </span>
              <div className="flex items-center gap-4">
                <div className="w-24 h-20 rounded-b-xl border-4 border-t-0 border-emerald-500 bg-emerald-950/30 flex items-center justify-center text-3xl">
                  {catPosition === 'inside' ? '🐱' : '📦'}
                </div>
                {catPosition === 'outside' && (
                  <div className="text-3xl animate-bounce">🐱</div>
                )}
              </div>
              <span className="text-[11px] text-slate-400">
                {catPosition === 'inside'
                  ? 'The cat is INSIDE the box!'
                  : catPosition === 'outside'
                  ? 'The cat jumped OUTSIDE the box!'
                  : 'Click INSIDE or OUTSIDE above'}
              </span>
            </div>

            {/* Scene 3: Tree (NEAR vs FAR) */}
            <div className="p-4 rounded-xl bg-[#111827] border border-slate-800 flex flex-col items-center justify-between h-48">
              <span className="text-xs font-mono text-amber-300 font-bold">
                NEAR vs. FAR from the Tree
              </span>
              <div className="w-full flex items-center justify-between px-3">
                <div className="flex items-center gap-1">
                  <span className="text-4xl">🌳</span>
                  {catPosition === 'near' && (
                    <span className="text-3xl animate-bounce">🐱</span>
                  )}
                </div>
                {catPosition === 'far' && (
                  <span className="text-3xl animate-bounce">🐱</span>
                )}
              </div>
              <span className="text-[11px] text-slate-400">
                {catPosition === 'near'
                  ? 'The cat is NEAR the tree.'
                  : catPosition === 'far'
                  ? 'The cat is FAR away from the tree.'
                  : 'Click NEAR or FAR above'}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* MODE 1: NUMBERS 1-20, TEN-FRAMES & CROCODILE COMPARISON */}
      {mode === 'number-line-tenframe' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-11 gap-4 items-center p-4 rounded-xl bg-[#111827] border border-[#1F2937]">
            {/* Left Ten-Frames (Up to 20) */}
            <div className="lg:col-span-4 p-3.5 rounded-xl bg-[#090D16] border border-slate-800 space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-xs font-bold text-cyan-400 uppercase">
                  Left Group (Ten-Frames)
                </span>
                <span className="text-lg font-mono font-extrabold text-white">
                  {leftCount}
                </span>
              </div>
              <div className="grid grid-cols-5 gap-1.5">
                {Array.from({ length: 20 }).map((_, i) => (
                  <div
                    key={i}
                    className={`h-8 rounded-lg border flex items-center justify-center text-sm ${
                      i < leftCount
                        ? 'bg-cyan-500/25 border-cyan-400 text-cyan-200'
                        : 'bg-slate-900/60 border-slate-800 text-slate-700'
                    }`}
                  >
                    {i < leftCount ? '🍎' : ''}
                  </div>
                ))}
              </div>
              <div className="text-[11px] font-mono text-slate-400">
                Before {leftCount} is <strong className="text-white">{leftCount - 1}</strong> • After {leftCount} is{' '}
                <strong className="text-white">{leftCount + 1}</strong>
              </div>
            </div>

            {/* Center Crocodile Mouth (<, >, =) */}
            <div className="lg:col-span-3 flex flex-col items-center justify-center p-4 rounded-xl bg-[#090D16] border border-emerald-500/30 space-y-2">
              <span className="text-[11px] font-mono uppercase text-emerald-400">
                Hungry Crocodile Rule
              </span>
              <div className="text-5xl font-mono font-black text-emerald-400">
                {leftCount} {compSymbol} {rightCount}
              </div>
              <p className="text-xs text-center text-slate-300">
                <strong>{leftCount}</strong> {compWord} <strong>{rightCount}</strong>
              </p>
              <p className="text-[10px] text-slate-400 text-center">
                The crocodile mouth always opens toward the BIGGER number!
              </p>
            </div>

            {/* Right Ten-Frames (Up to 20) */}
            <div className="lg:col-span-4 p-3.5 rounded-xl bg-[#090D16] border border-slate-800 space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-xs font-bold text-amber-400 uppercase">
                  Right Group (Ten-Frames)
                </span>
                <span className="text-lg font-mono font-extrabold text-white">
                  {rightCount}
                </span>
              </div>
              <div className="grid grid-cols-5 gap-1.5">
                {Array.from({ length: 20 }).map((_, i) => (
                  <div
                    key={i}
                    className={`h-8 rounded-lg border flex items-center justify-center text-sm ${
                      i < rightCount
                        ? 'bg-amber-500/25 border-amber-400 text-amber-200'
                        : 'bg-slate-900/60 border-slate-800 text-slate-700'
                    }`}
                  >
                    {i < rightCount ? '🥭' : ''}
                  </div>
                ))}
              </div>
              <div className="text-[11px] font-mono text-slate-400">
                {Math.floor(rightCount / 10)} Ten and {rightCount % 10} Ones
              </div>
            </div>
          </div>

          <ParameterPanel
            title="Class 1 Number Comparison & Ten-Frame Controls"
            sliders={[
              {
                id: 'left',
                label: 'Left Basket Apples (1 to 20)',
                value: leftCount,
                min: 1,
                max: 20,
                step: 1,
                onChange: setLeftCount,
              },
              {
                id: 'right',
                label: 'Right Basket Mangoes (1 to 20)',
                value: rightCount,
                min: 1,
                max: 20,
                step: 1,
                onChange: setRightCount,
              },
            ]}
          />
        </div>
      )}

      {/* MODE 2: ADDITION & SUBTRACTION FROG NUMBER LINE */}
      {mode === 'addition-subtraction' && (
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setOperation('add')}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-bold ${
                operation === 'add'
                  ? 'bg-emerald-500 text-slate-950'
                  : 'bg-[#111827] text-slate-300 border border-slate-800'
              }`}
            >
              <Plus className="w-3.5 h-3.5" /> Addition (+ Putting Together / Forward Jumps)
            </button>
            <button
              type="button"
              onClick={() => setOperation('sub')}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-bold ${
                operation === 'sub'
                  ? 'bg-rose-500 text-white'
                  : 'bg-[#111827] text-slate-300 border border-slate-800'
              }`}
            >
              <Minus className="w-3.5 h-3.5" /> Subtraction (- Taking Away / Backward Jumps)
            </button>
          </div>

          <Canvas2DWrapper
            title="Class 1 Number Line Frog Hops (0 to 20)"
            subtitle="Watch the frog hop forward for Addition (+) and hop backward for Subtraction (-)"
            height={300}
            onRender={renderFrogNumberLine}
          />

          <FormulaCard
            label={operation === 'add' ? 'Class 1 Addition Sentence' : 'Class 1 Subtraction Sentence'}
            latex={`${startNum} ${operation === 'add' ? '+' : '-'} ${changeNum} = ${resultNum}`}
            description={
              operation === 'add'
                ? `Start at ${startNum} and jump ${changeNum} steps forward to land on ${resultNum}.`
                : `Start at ${startNum} and jump ${changeNum} steps backward to land on ${resultNum}.`
            }
          />

          <ParameterPanel
            title="Addition & Subtraction Controls"
            sliders={[
              {
                id: 's',
                label: 'Starting Number on Line',
                value: startNum,
                min: 1,
                max: 14,
                step: 1,
                onChange: setStartNum,
              },
              {
                id: 'c',
                label: 'Number of Frog Hops',
                value: changeNum,
                min: 0,
                max: operation === 'add' ? 20 - startNum : startNum,
                step: 1,
                onChange: setChangeNum,
              },
            ]}
          />
        </div>
      )}

      {/* MODE 3: TENS & ONES BUNDLES + ABACUS + 1-100 SKIP COUNTING */}
      {mode === 'tens-ones-abacus' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* Tens Bundles & Loose Ones + 2-Rod Abacus */}
            <div className="p-4 rounded-xl bg-[#111827] border border-[#1F2937] space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-bold uppercase tracking-wider text-cyan-400">
                  Tens Bundles & 2-Rod Spike Abacus
                </h4>
                <span className="px-2.5 py-1 rounded bg-cyan-500/20 border border-cyan-400 text-sm font-mono font-bold text-cyan-200">
                  {twoDigitNum} = {tensDigit} Tens + {onesDigit} Ones
                </span>
              </div>

              <div className="grid grid-cols-2 gap-4 p-4 rounded-xl bg-[#090D16] border border-slate-800">
                {/* Tens Rod */}
                <div className="flex flex-col items-center">
                  <span className="text-xs font-bold text-amber-400 mb-1">
                    TENS ROD (10s)
                  </span>
                  <div className="relative h-40 w-full flex flex-col justify-end items-center py-2">
                    <div className="absolute inset-y-0 w-1.5 bg-slate-700 rounded-full" />
                    {Array.from({ length: tensDigit }).map((_, i) => (
                      <div
                        key={i}
                        className="relative z-10 w-12 h-3.5 rounded-full bg-amber-500 my-0.5 border border-white/30"
                      />
                    ))}
                  </div>
                  <span className="text-sm font-mono font-bold text-amber-300 mt-1">
                    {tensDigit} Tens = {tensDigit * 10}
                  </span>
                </div>

                {/* Ones Rod */}
                <div className="flex flex-col items-center">
                  <span className="text-xs font-bold text-cyan-400 mb-1">
                    ONES ROD (1s)
                  </span>
                  <div className="relative h-40 w-full flex flex-col justify-end items-center py-2">
                    <div className="absolute inset-y-0 w-1.5 bg-slate-700 rounded-full" />
                    {Array.from({ length: onesDigit }).map((_, i) => (
                      <div
                        key={i}
                        className="relative z-10 w-12 h-3.5 rounded-full bg-cyan-500 my-0.5 border border-white/30"
                      />
                    ))}
                  </div>
                  <span className="text-sm font-mono font-bold text-cyan-300 mt-1">
                    {onesDigit} Ones = {onesDigit}
                  </span>
                </div>
              </div>
            </div>

            {/* Skip Counting by 2s, 5s, 10s Board (1 to 50) */}
            <div className="p-4 rounded-xl bg-[#111827] border border-[#1F2937] space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-bold uppercase tracking-wider text-emerald-400">
                  Skip Counting Grid (Count by {skipStep}s)
                </h4>
                <div className="flex gap-1">
                  {([2, 5, 10] as const).map((st) => (
                    <button
                      key={st}
                      type="button"
                      onClick={() => setSkipStep(st)}
                      className={`px-2.5 py-1 rounded text-xs font-mono font-bold ${
                        skipStep === st
                          ? 'bg-emerald-500 text-slate-950'
                          : 'bg-[#090D16] text-slate-300 border border-slate-800'
                      }`}
                    >
                      Skip by {st}s
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-10 gap-1 p-2.5 rounded-xl bg-[#090D16] border border-slate-800">
                {Array.from({ length: 50 }, (_, idx) => idx + 1).map((n) => {
                  const isSkipMatch = n % skipStep === 0;
                  return (
                    <button
                      key={n}
                      type="button"
                      onClick={() => setTwoDigitNum(n)}
                      className={`h-7 rounded text-[11px] font-mono font-bold transition-all ${
                        n === twoDigitNum
                          ? 'bg-cyan-400 text-slate-950 ring-2 ring-white'
                          : isSkipMatch
                          ? 'bg-emerald-500/25 border border-emerald-400 text-emerald-200'
                          : 'bg-slate-900 text-slate-500'
                      }`}
                    >
                      {n}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          <ParameterPanel
            title="Two-Digit Number Slider (1 to 99)"
            sliders={[
              {
                id: 'num2',
                label: 'Select Number (1 to 99)',
                value: twoDigitNum,
                min: 1,
                max: 99,
                step: 1,
                onChange: setTwoDigitNum,
              },
            ]}
          />
        </div>
      )}

      {/* MODE 4: 2D & 3D SHAPES — ROLLING VS SLIDING RAMP */}
      {mode === 'shapes-roll-slide' && (
        <div className="space-y-4">
          <div className="flex flex-wrap gap-2">
            {SHAPES_3D.map((sh, idx) => (
              <button
                key={sh.id}
                type="button"
                onClick={() => setSelectedShapeIdx(idx)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all ${
                  selectedShapeIdx === idx
                    ? 'bg-cyan-500/20 border-cyan-400 text-cyan-200'
                    : 'bg-[#111827] border-slate-800 text-slate-300'
                }`}
              >
                {sh.name}
              </button>
            ))}
          </div>

          <Canvas2DWrapper
            title="What is Long? What is Round? — Rolling vs. Sliding Inclined Plane"
            subtitle="Curved surfaces ROLL down the ramp; flat faces SLIDE down the ramp"
            height={300}
            onRender={renderShapeRamp}
          />

          <ParameterPanel
            title="Ramp Slope Control"
            sliders={[
              {
                id: 'ramp',
                label: 'Ramp Tilt Angle',
                value: rampAngle,
                min: 10,
                max: 35,
                step: 1,
                unit: '°',
                onChange: setRampAngle,
              },
            ]}
            telemetry={[
              { label: 'Selected Shape', value: SHAPES_3D[selectedShapeIdx].name.split(' ')[0], color: 'cyan' },
              { label: 'Motion Type', value: SHAPES_3D[selectedShapeIdx].behavior, color: 'emerald' },
              { label: 'Faces', value: SHAPES_3D[selectedShapeIdx].faces.split(',')[0], color: 'amber' },
              { label: 'Corners', value: SHAPES_3D[selectedShapeIdx].edgesCorners.split(',')[1] || '0', color: 'rose' },
            ]}
          />
        </div>
      )}

      {/* MODE 4B: NON-STANDARD MEASUREMENT (HANDSPANS, PAN BALANCE & CAPACITY) */}
      {mode === 'measurement-balance' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            {/* 1. Length in Handspans */}
            <div className="p-4 rounded-xl bg-[#111827] border border-[#1F2937] space-y-3">
              <div className="flex justify-between items-center">
                <h4 className="text-xs font-bold uppercase text-cyan-400">
                  1. Length in Handspans ✋
                </h4>
                <span className="text-xs font-mono font-bold text-white bg-[#090D16] px-2 py-0.5 rounded border border-slate-800">
                  {objectHandspans} Handspans Long
                </span>
              </div>
              <div className="p-3 rounded-xl bg-[#090D16] border border-slate-800 space-y-2">
                <div className="h-6 rounded bg-amber-600/80 border border-amber-400 flex items-center justify-center text-xs font-bold text-slate-950">
                  Wooden Study Table ({objectHandspans} Handspans)
                </div>
                <div className="flex justify-start gap-1 text-xl">
                  {Array.from({ length: objectHandspans }).map((_, i) => (
                    <span key={i} title={`Handspan ${i + 1}`}>
                      🖐️
                    </span>
                  ))}
                </div>
              </div>
              <input
                type="range"
                min={2}
                max={9}
                value={objectHandspans}
                onChange={(e) => setObjectHandspans(Number(e.target.value))}
                className="w-full"
              />
            </div>

            {/* 2. Weight on a 2-Pan Beam Balance */}
            <div className="p-4 rounded-xl bg-[#111827] border border-[#1F2937] space-y-3">
              <div className="flex justify-between items-center">
                <h4 className="text-xs font-bold uppercase text-emerald-400">
                  2. Heavier vs. Lighter Balance ⚖️
                </h4>
                <span className="text-xs font-mono font-bold text-emerald-300">
                  {leftPanBlocks > rightPanBlocks
                    ? 'Left is HEAVIER'
                    : leftPanBlocks < rightPanBlocks
                    ? 'Right is HEAVIER'
                    : 'EQUAL WEIGHT!'}
                </span>
              </div>
              <div className="p-3 rounded-xl bg-[#090D16] border border-slate-800 flex flex-col items-center justify-center h-28">
                <div
                  className="w-48 h-2 bg-slate-400 rounded flex justify-between items-center transition-transform duration-300"
                  style={{
                    transform: `rotate(${(rightPanBlocks - leftPanBlocks) * 4}deg)`,
                  }}
                >
                  <div className="px-2 py-1 rounded bg-rose-500 text-white text-xs font-mono font-bold -mt-6">
                    🍉 ({leftPanBlocks})
                  </div>
                  <div className="px-2 py-1 rounded bg-cyan-500 text-slate-950 text-xs font-mono font-bold -mt-6">
                    🧱 ({rightPanBlocks})
                  </div>
                </div>
                <div className="w-0 h-0 border-l-[12px] border-l-transparent border-r-[12px] border-r-transparent border-b-[20px] border-b-amber-500 mt-1" />
              </div>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <button
                  type="button"
                  onClick={() => setLeftPanBlocks((n) => (n >= 10 ? 1 : n + 1))}
                  className="py-1 rounded bg-slate-800 text-rose-300 font-mono"
                >
                  Left Pan: {leftPanBlocks} blocks
                </button>
                <button
                  type="button"
                  onClick={() => setRightPanBlocks((n) => (n >= 10 ? 1 : n + 1))}
                  className="py-1 rounded bg-slate-800 text-cyan-300 font-mono"
                >
                  Right Pan: {rightPanBlocks} blocks
                </button>
              </div>
            </div>

            {/* 3. Capacity (Jugs & Glasses) */}
            <div className="p-4 rounded-xl bg-[#111827] border border-[#1F2937] space-y-3">
              <div className="flex justify-between items-center">
                <h4 className="text-xs font-bold uppercase text-amber-400">
                  3. Capacity (Holds More / Less) 🫗
                </h4>
                <span className="text-xs font-mono font-bold text-amber-300">
                  1 Jug = {jugCups} Glasses
                </span>
              </div>
              <div className="p-3 rounded-xl bg-[#090D16] border border-slate-800 flex items-center justify-around h-28">
                <div className="text-center">
                  <div className="text-3xl">🏺</div>
                  <span className="text-[10px] font-mono text-slate-400">1 Big Jug</span>
                </div>
                <span className="text-lg font-bold text-cyan-400">=</span>
                <div className="flex flex-wrap gap-1 justify-center max-w-[130px]">
                  {Array.from({ length: jugCups }).map((_, i) => (
                    <span key={i} className="text-xl">
                      🥛
                    </span>
                  ))}
                </div>
              </div>
              <input
                type="range"
                min={2}
                max={8}
                value={jugCups}
                onChange={(e) => setJugCups(Number(e.target.value))}
                className="w-full"
              />
            </div>
          </div>
        </div>
      )}

      {/* MODE 5: ANALOG CLOCK & INDIAN CURRENCY (₹) SHOP */}
      {mode === 'clock-money' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {/* Interactive Analog Clock */}
          <div className="p-4 rounded-xl bg-[#111827] border border-[#1F2937] space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-bold uppercase tracking-wider text-cyan-400 flex items-center gap-1.5">
                <Clock className="w-4 h-4" />
                Tick-Tock Analog & Digital Clock
              </h4>
              <span className="px-2.5 py-1 rounded bg-cyan-500/20 border border-cyan-400 font-mono text-sm font-bold text-cyan-200">
                {clockHour}:{clockHalfHour ? '30' : '00'} ({clockHalfHour ? `Half past ${clockHour}` : `${clockHour} o'clock`})
              </span>
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-around gap-4 p-4 rounded-xl bg-[#090D16] border border-slate-800">
              <svg width="170" height="170" viewBox="-85 -85 170 170">
                <circle r="78" fill="#111827" stroke="#38bdf8" strokeWidth="4" />
                {Array.from({ length: 12 }, (_, i) => i + 1).map((hr) => {
                  const angle = ((hr * 30 - 90) * Math.PI) / 180;
                  const x = Math.cos(angle) * 62;
                  const y = Math.sin(angle) * 62 + 4;
                  return (
                    <text
                      key={hr}
                      x={x}
                      y={y}
                      textAnchor="middle"
                      fill="#f8fafc"
                      fontSize="12"
                      fontWeight="bold"
                      fontFamily="monospace"
                    >
                      {hr}
                    </text>
                  );
                })}
                {/* Short Hour Hand */}
                {(() => {
                  const hrDeg = (clockHour % 12) * 30 + (clockHalfHour ? 15 : 0) - 90;
                  const hrRad = (hrDeg * Math.PI) / 180;
                  return (
                    <line
                      x1="0"
                      y1="0"
                      x2={Math.cos(hrRad) * 40}
                      y2={Math.sin(hrRad) * 40}
                      stroke="#f43f5e"
                      strokeWidth="5"
                      strokeLinecap="round"
                    />
                  );
                })()}
                {/* Long Minute Hand */}
                {(() => {
                  const minDeg = (clockHalfHour ? 180 : 0) - 90;
                  const minRad = (minDeg * Math.PI) / 180;
                  return (
                    <line
                      x1="0"
                      y1="0"
                      x2={Math.cos(minRad) * 56}
                      y2={Math.sin(minRad) * 56}
                      stroke="#10b981"
                      strokeWidth="3.5"
                      strokeLinecap="round"
                    />
                  );
                })()}
                <circle r="5" fill="#fde047" />
              </svg>

              <div className="space-y-3 w-full sm:w-48">
                <div>
                  <label className="text-xs text-slate-300 font-semibold block mb-1">
                    Short Red Hand (Hour: {clockHour})
                  </label>
                  <input
                    type="range"
                    min={1}
                    max={12}
                    value={clockHour}
                    onChange={(e) => setClockHour(Number(e.target.value))}
                    className="w-full"
                  />
                </div>
                <button
                  type="button"
                  onClick={() => setClockHalfHour((h) => !h)}
                  className="w-full py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-emerald-300 border border-slate-700"
                >
                  Toggle Minute Hand (:00 vs :30)
                </button>
              </div>
            </div>
          </div>

          {/* Interactive Indian Coins & Notes Piggy Bank */}
          <div className="p-4 rounded-xl bg-[#111827] border border-[#1F2937] space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-bold uppercase tracking-wider text-amber-400 flex items-center gap-1.5">
                <IndianRupee className="w-4 h-4" />
                Indian Coins & Notes Piggy Bank
              </h4>
              <span className="px-2.5 py-1 rounded bg-amber-500/20 border border-amber-400 font-mono text-sm font-bold text-amber-200">
                Total = ₹{totalMoney}
              </span>
            </div>

            <div className="p-4 rounded-xl bg-[#090D16] border border-slate-800 space-y-3">
              <div className="text-xs text-slate-400">
                Click any Indian Coin or Note below to add it to your Piggy Bank:
              </div>
              <div className="flex flex-wrap gap-2">
                {[1, 2, 5, 10, 20, 50].map((denom) => (
                  <button
                    key={denom}
                    type="button"
                    onClick={() => setWalletCoins((prev) => [...prev, denom])}
                    className="px-3 py-1.5 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 border border-amber-400 text-xs font-mono font-bold text-amber-200"
                  >
                    + ₹{denom}
                  </button>
                ))}
                <button
                  type="button"
                  onClick={() => setWalletCoins([])}
                  className="px-3 py-1.5 rounded-lg bg-rose-500/20 border border-rose-500/40 text-xs font-mono text-rose-300"
                >
                  Clear Bank
                </button>
              </div>

              <div className="min-h-[68px] p-2.5 rounded-lg bg-[#111827] border border-slate-800 flex flex-wrap gap-1.5 items-center">
                {walletCoins.length === 0 ? (
                  <span className="text-xs text-slate-500">Piggy bank is empty (₹0)</span>
                ) : (
                  walletCoins.map((c, i) => (
                    <span
                      key={i}
                      className="px-2 py-1 rounded-full bg-amber-400 text-slate-950 font-mono text-xs font-bold"
                    >
                      ₹{c}
                    </span>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODE 5A: PATTERNS (UTSAV) & TOY PICTOGRAPH DATA HANDLING (SO MANY TOYS) */}
      {mode === 'patterns-pictograph' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {/* Interactive Pattern Sequencer */}
          <div className="p-4 rounded-xl bg-[#111827] border border-[#1F2937] space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-bold uppercase text-cyan-400">
                NCERT Ch 9 (Utsav): What Comes Next in the Pattern?
              </h4>
              <div className="flex gap-1">
                {(['ABAB', 'AAB', 'ABC', 'NUM'] as const).map((pt) => (
                  <button
                    key={pt}
                    type="button"
                    onClick={() => setPatternType(pt)}
                    className={`px-2 py-0.5 rounded text-[11px] font-mono font-bold ${
                      patternType === pt
                        ? 'bg-cyan-500 text-slate-950'
                        : 'bg-[#090D16] text-slate-400 border border-slate-800'
                    }`}
                  >
                    {pt}
                  </button>
                ))}
              </div>
            </div>

            <div className="p-4 rounded-xl bg-[#090D16] border border-slate-800 space-y-3">
              <div className="flex items-center justify-around text-2xl py-2">
                {(patternType === 'ABAB'
                  ? ['🔴', '🟦', '🔴', '🟦', '🔴', '🟦']
                  : patternType === 'AAB'
                  ? ['⭐', '⭐', '🌙', '⭐', '⭐', '🌙']
                  : patternType === 'ABC'
                  ? ['🍎', '🍌', '🍇', '🍎', '🍌', '🍇']
                  : ['2', '4', '6', '8', '10', '12']
                ).map((item, idx) => (
                  <span
                    key={idx}
                    className="w-11 h-11 rounded-lg bg-[#111827] border border-cyan-500/30 flex items-center justify-center font-mono font-bold text-base"
                  >
                    {item}
                  </span>
                ))}
              </div>
              <p className="text-xs text-slate-300 font-mono">
                Rule:{' '}
                {patternType === 'ABAB'
                  ? 'Alternating Circle and Square (A-B-A-B)'
                  : patternType === 'AAB'
                  ? 'Two Stars followed by One Moon (A-A-B)'
                  : patternType === 'ABC'
                  ? 'Three repeating fruits (A-B-C)'
                  : 'Growing Number Pattern (+2 each step)'}
              </p>
            </div>
          </div>

          {/* Interactive Toy Pictograph Chart (So Many Toys) */}
          <div className="p-4 rounded-xl bg-[#111827] border border-[#1F2937] space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-bold uppercase text-emerald-400">
                NCERT Ch 13 (So Many Toys): Interactive Pictograph
              </h4>
              <span className="text-xs font-mono text-emerald-300">
                Total Toys = {toyCounts.cars + toyCounts.dolls + toyCounts.balls + toyCounts.blocks}
              </span>
            </div>

            <div className="p-3 rounded-xl bg-[#090D16] border border-slate-800 space-y-2">
              {(
                [
                  { key: 'cars', label: 'Toy Cars', icon: '🚗', count: toyCounts.cars },
                  { key: 'dolls', label: 'Dolls', icon: '🪆', count: toyCounts.dolls },
                  { key: 'balls', label: 'Balls', icon: '⚽', count: toyCounts.balls },
                  { key: 'blocks', label: 'Blocks', icon: '🧱', count: toyCounts.blocks },
                ] as const
              ).map((row) => (
                <div
                  key={row.key}
                  className="flex items-center justify-between gap-2 p-2 rounded-lg bg-[#111827] border border-slate-800"
                >
                  <span className="text-xs font-semibold w-24 text-slate-200">
                    {row.label} ({row.count})
                  </span>
                  <div className="flex-1 flex gap-1 text-base overflow-x-auto">
                    {Array.from({ length: row.count }).map((_, i) => (
                      <span key={i}>{row.icon}</span>
                    ))}
                  </div>
                  <div className="flex gap-1">
                    <button
                      type="button"
                      onClick={() =>
                        setToyCounts((prev) => ({
                          ...prev,
                          [row.key]: Math.max(1, prev[row.key] - 1),
                        }))
                      }
                      className="px-2 py-0.5 rounded bg-slate-800 text-xs font-bold"
                    >
                      -
                    </button>
                    <button
                      type="button"
                      onClick={() =>
                        setToyCounts((prev) => ({
                          ...prev,
                          [row.key]: Math.min(9, prev[row.key] + 1),
                        }))
                      }
                      className="px-2 py-0.5 rounded bg-slate-800 text-xs font-bold"
                    >
                      +
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* MODE 5B: ORDINALS (1st-10th), REPEATED ADDITION GROUPS & DATA PICTOGRAPH */}
      {mode === 'spatial-ordinals-data' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* Ordinal Numbers 1st to 10th Race Track */}
            <div className="p-4 rounded-xl bg-[#111827] border border-[#1F2937] space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-bold uppercase tracking-wider text-cyan-400">
                  Ordinal Numbers (1st to 10th Position in a Line)
                </h4>
                <span className="px-2.5 py-1 rounded bg-cyan-500/20 border border-cyan-400 text-xs font-mono font-bold text-cyan-200">
                  Selected: Position #{selectedOrdinal}
                </span>
              </div>

              <div className="grid grid-cols-5 gap-2 p-3 rounded-xl bg-[#090D16] border border-slate-800">
                {[
                  { pos: 1, ord: '1st', word: 'First', icon: '🥇' },
                  { pos: 2, ord: '2nd', word: 'Second', icon: '🥈' },
                  { pos: 3, ord: '3rd', word: 'Third', icon: '🥉' },
                  { pos: 4, ord: '4th', word: 'Fourth', icon: '🏃' },
                  { pos: 5, ord: '5th', word: 'Fifth', icon: '🏃' },
                  { pos: 6, ord: '6th', word: 'Sixth', icon: '🏃' },
                  { pos: 7, ord: '7th', word: 'Seventh', icon: '🏃' },
                  { pos: 8, ord: '8th', word: 'Eighth', icon: '🏃' },
                  { pos: 9, ord: '9th', word: 'Ninth', icon: '🏃' },
                  { pos: 10, ord: '10th', word: 'Tenth', icon: '🏁' },
                ].map((item) => (
                  <button
                    key={item.pos}
                    type="button"
                    onClick={() => setSelectedOrdinal(item.pos)}
                    className={`p-2 rounded-lg border text-center transition-all ${
                      selectedOrdinal === item.pos
                        ? 'bg-cyan-500/25 border-cyan-400 text-white scale-105'
                        : 'bg-slate-900 border-slate-800 text-slate-400'
                    }`}
                  >
                    <div className="text-base">{item.icon}</div>
                    <div className="text-xs font-mono font-bold text-cyan-300">
                      {item.ord}
                    </div>
                    <div className="text-[10px]">{item.word}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Equal Groups & Repeated Addition (How Many Times?) */}
            <div className="p-4 rounded-xl bg-[#111827] border border-[#1F2937] space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-bold uppercase tracking-wider text-amber-400">
                  Equal Groups (Repeated Addition: {groupsCount} groups of {itemsPerGroup})
                </h4>
                <span className="px-2.5 py-1 rounded bg-amber-500/20 border border-amber-400 text-xs font-mono font-bold text-amber-200">
                  Total = {groupsCount * itemsPerGroup} Stars
                </span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 p-3 rounded-xl bg-[#090D16] border border-slate-800">
                {Array.from({ length: groupsCount }).map((_, gIdx) => (
                  <div
                    key={gIdx}
                    className="p-2.5 rounded-lg bg-[#111827] border border-amber-500/30 flex flex-col items-center gap-1"
                  >
                    <span className="text-[10px] font-mono text-slate-400">
                      Group {gIdx + 1}
                    </span>
                    <div className="flex flex-wrap justify-center gap-1 text-base">
                      {Array.from({ length: itemsPerGroup }).map((__, sIdx) => (
                        <span key={sIdx}>⭐</span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>

              <p className="text-xs font-mono text-slate-300 bg-[#090D16] p-2.5 rounded-lg border border-slate-800">
                Repeated Addition:{' '}
                {Array.from({ length: groupsCount })
                  .map(() => itemsPerGroup)
                  .join(' + ')}{' '}
                = <strong className="text-amber-300">{groupsCount * itemsPerGroup}</strong>{' '}
                ({groupsCount} × {itemsPerGroup} = {groupsCount * itemsPerGroup})
              </p>
            </div>
          </div>

          <ParameterPanel
            title="Equal Groups & Ordinal Controls"
            sliders={[
              {
                id: 'grp',
                label: 'Number of Equal Baskets / Groups',
                value: groupsCount,
                min: 1,
                max: 6,
                step: 1,
                onChange: setGroupsCount,
              },
              {
                id: 'itm',
                label: 'Stars Inside Each Group',
                value: itemsPerGroup,
                min: 1,
                max: 5,
                step: 1,
                onChange: setItemsPerGroup,
              },
            ]}
          />
        </div>
      )}

      {/* MODE 6: EVS 5 SENSE ORGANS */}
      {mode === 'evs-sense-organs' && (
        <div className="p-4 rounded-xl bg-[#111827] border border-[#1F2937] space-y-4">
          <div className="flex flex-wrap gap-2">
            {SENSE_ORGANS.map((s, idx) => (
              <button
                key={s.id}
                type="button"
                onClick={() => setSelectedSenseIdx(idx)}
                className={`px-3.5 py-2 rounded-xl text-xs font-bold border transition-all ${
                  selectedSenseIdx === idx
                    ? 'bg-cyan-500 text-slate-950 border-white'
                    : 'bg-[#090D16] text-slate-300 border-slate-800 hover:text-white'
                }`}
              >
                {s.organ}
              </button>
            ))}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 rounded-xl bg-[#090D16] border border-slate-800">
            <div className="space-y-1">
              <span className="text-[10px] font-mono uppercase text-cyan-400">
                What this Sense Organ Does
              </span>
              <h4 className="text-base font-bold text-white">
                {SENSE_ORGANS[selectedSenseIdx].organ}
              </h4>
              <p className="text-xs text-slate-300 leading-relaxed">
                {SENSE_ORGANS[selectedSenseIdx].action}
              </p>
            </div>

            <div className="space-y-1">
              <span className="text-[10px] font-mono uppercase text-amber-400">
                Real-World Stimulus Example
              </span>
              <div className="p-3 rounded-lg bg-[#111827] border border-amber-500/30 text-xs font-semibold text-amber-200">
                {SENSE_ORGANS[selectedSenseIdx].stimulus}
              </div>
            </div>

            <div className="space-y-1">
              <span className="text-[10px] font-mono uppercase text-emerald-400">
                Healthy Hygiene & Care Habit
              </span>
              <div className="p-3 rounded-lg bg-[#111827] border border-emerald-500/30 text-xs text-emerald-200 flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5 text-emerald-400" />
                <span>{SENSE_ORGANS[selectedSenseIdx].careTip}</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODE 7: EVS GROWING PLANT & LIVING VS NON-LIVING */}
      {mode === 'evs-plants-living' && (
        <div className="space-y-4">
          <Canvas2DWrapper
            title="Class 1 EVS — Parts of a Plant & What Plants Need to Grow"
            subtitle="Adjust Sunlight and Water to help the seed grow Roots, Stem, Leaves, and Flowers"
            height={330}
            onRender={renderPlantGrowth}
          />
          <ParameterPanel
            title="Plant Growth Care Controls"
            sliders={[
              {
                id: 'water',
                label: 'Watering Level (Roots Absorb Water)',
                value: waterLevel,
                min: 10,
                max: 100,
                step: 5,
                unit: '%',
                onChange: setWaterLevel,
              },
              {
                id: 'sun',
                label: 'Warm Sunlight (Leaves Make Food)',
                value: sunlightLevel,
                min: 10,
                max: 100,
                step: 5,
                unit: '%',
                onChange: setSunlightLevel,
              },
            ]}
          />
        </div>
      )}

      {/* MODE 7B: EVS ANIMALS, HEALTHY FOOD & TRAFFIC SAFETY RULES */}
      {mode === 'evs-animals-food-safety' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {/* Animal World Classification */}
          <div className="p-4 rounded-xl bg-[#111827] border border-[#1F2937] space-y-3">
            <h4 className="text-xs font-bold uppercase text-emerald-400">
              Class 1 EVS — Animals Around Us (Wild, Domestic, Pet & Water)
            </h4>
            <div className="flex flex-wrap gap-1.5">
              {(
                [
                  { id: 'wild', label: 'Wild Animals (Jungle)' },
                  { id: 'domestic', label: 'Domestic / Farm Helpers' },
                  { id: 'pet', label: 'Pet Animals (Home)' },
                  { id: 'water', label: 'Aquatic (Water) Animals' },
                ] as const
              ).map((cat) => (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => setAnimalCategory(cat.id)}
                  className={`px-2.5 py-1 rounded-lg text-xs font-bold ${
                    animalCategory === cat.id
                      ? 'bg-emerald-500 text-slate-950'
                      : 'bg-[#090D16] text-slate-300 border border-slate-800'
                  }`}
                >
                  {cat.label}
                </button>
              ))}
            </div>

            <div className="p-4 rounded-xl bg-[#090D16] border border-slate-800 space-y-2">
              <div className="text-3xl flex justify-around py-2">
                {animalCategory === 'wild' && (
                  <>
                    <span>🦁 Lion</span>
                    <span>🐘 Elephant</span>
                    <span>🐯 Tiger</span>
                  </>
                )}
                {animalCategory === 'domestic' && (
                  <>
                    <span>🐄 Cow</span>
                    <span>🐑 Sheep</span>
                    <span>🐎 Horse</span>
                  </>
                )}
                {animalCategory === 'pet' && (
                  <>
                    <span>🐶 Dog</span>
                    <span>🐱 Cat</span>
                    <span>🦜 Parrot</span>
                  </>
                )}
                {animalCategory === 'water' && (
                  <>
                    <span>🐟 Fish</span>
                    <span>🐬 Dolphin</span>
                    <span>🐙 Octopus</span>
                  </>
                )}
              </div>
              <p className="text-xs text-slate-300">
                {animalCategory === 'wild'
                  ? 'Wild animals live naturally in forests and jungles. The Lion is called the King of the Jungle (lives in a Den).'
                  : animalCategory === 'domestic'
                  ? 'Domestic farm animals help us: Cows give milk (live in a Shed), Sheep give wool, Horses pull carts (live in a Stable).'
                  : animalCategory === 'pet'
                  ? 'Pet animals live with us at home as our friends. A dog guards our house and lives in a Kennel.'
                  : 'Water (aquatic) animals live in rivers, lakes, and oceans and breathe in water using gills or blowholes.'}
              </p>
            </div>
          </div>

          {/* Interactive Traffic Signal & Safety Habits */}
          <div className="p-4 rounded-xl bg-[#111827] border border-[#1F2937] space-y-3">
            <h4 className="text-xs font-bold uppercase text-amber-400">
              Class 1 EVS — Road Safety & Traffic Signal Rules 🚦
            </h4>
            <div className="flex items-center justify-around p-4 rounded-xl bg-[#090D16] border border-slate-800">
              <div className="p-3 rounded-2xl bg-slate-900 border-2 border-slate-700 flex flex-col gap-2.5">
                <button
                  type="button"
                  onClick={() => setTrafficLight('red')}
                  className={`w-10 h-10 rounded-full transition-all ${
                    trafficLight === 'red'
                      ? 'bg-rose-500 shadow-lg shadow-rose-500/60 scale-110'
                      : 'bg-rose-950/50'
                  }`}
                />
                <button
                  type="button"
                  onClick={() => setTrafficLight('yellow')}
                  className={`w-10 h-10 rounded-full transition-all ${
                    trafficLight === 'yellow'
                      ? 'bg-amber-400 shadow-lg shadow-amber-400/60 scale-110'
                      : 'bg-amber-950/50'
                  }`}
                />
                <button
                  type="button"
                  onClick={() => setTrafficLight('green')}
                  className={`w-10 h-10 rounded-full transition-all ${
                    trafficLight === 'green'
                      ? 'bg-emerald-500 shadow-lg shadow-emerald-500/60 scale-110'
                      : 'bg-emerald-950/50'
                  }`}
                />
              </div>

              <div className="max-w-xs space-y-2">
                <div className="text-sm font-mono font-bold text-white">
                  {trafficLight === 'red'
                    ? '🔴 RED LIGHT SAYS: STOP!'
                    : trafficLight === 'yellow'
                    ? '🟡 YELLOW LIGHT SAYS: WAIT / GET READY!'
                    : '🟢 GREEN LIGHT SAYS: GO SAFELY!'}
                </div>
                <p className="text-xs text-slate-300 leading-relaxed">
                  Always cross the road at the black-and-white{' '}
                  <strong className="text-cyan-300">Zebra Crossing</strong> with an elder, and never play on the road!
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODE 8: EVS SEASONS, WEATHER & DAY/NIGHT SKY */}
      {mode === 'evs-seasons-sky' && (
        <div className="space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-2 p-2.5 rounded-xl bg-[#111827] border border-[#1F2937]">
            <div className="flex flex-wrap gap-1.5">
              {(['summer', 'monsoon', 'winter', 'spring'] as const).map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => setSeason(s)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold uppercase ${
                    season === s
                      ? 'bg-cyan-500 text-slate-950'
                      : 'bg-[#090D16] text-slate-300 border border-slate-800'
                  }`}
                >
                  {s} Season
                </button>
              ))}
            </div>
            <button
              type="button"
              onClick={() => setIsNightSky((n) => !n)}
              className="px-3 py-1.5 rounded-lg bg-indigo-500/20 border border-indigo-400 text-xs font-bold text-indigo-200"
            >
              {isNightSky ? 'Switch to Day Sky ☀️' : 'Switch to Night Sky 🌙'}
            </button>
          </div>

          <Canvas2DWrapper
            title="Class 1 EVS — Seasons, Clothes We Wear & The Sky Above Us"
            subtitle="Observe Summer, Monsoon Rain, Winter Snow, Spring Flowers, and Day vs. Night Sky"
            height={330}
            onRender={renderSeasonsAndSky}
          />
        </div>
      )}
    </div>
  );
};
