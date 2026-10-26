import React, { useState } from 'react';
import { Canvas2DWrapper, CanvasRenderContext } from '../../components/engine/Canvas2DWrapper';
import { ParameterPanel } from '../../components/engine/ParameterPanel';
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
  Volume2,
  VolumeX,
  Trophy,
  Target,
  BookOpen,
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
  | 'eng-phonics-vowels'
  | 'eng-grammar-opposites'
  | 'evs-sense-organs'
  | 'evs-plants-living'
  | 'evs-animals-food-safety'
  | 'evs-seasons-sky';

const ONES_WORDS = [
  'Zero', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine',
  'Ten', 'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen',
  'Seventeen', 'Eighteen', 'Nineteen',
];
const TENS_WORDS = [
  '', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety',
];

export function numberToWords(n: number): string {
  if (n < 0) return 'Zero';
  if (n < 20) return ONES_WORDS[n];
  if (n === 100) return 'One Hundred';
  const t = Math.floor(n / 10);
  const o = n % 10;
  return o === 0 ? TENS_WORDS[t] : `${TENS_WORDS[t]}-${ONES_WORDS[o]}`;
}

const CVC_WORDS = [
  { word: 'CAT', c1: 'C', vowel: 'A', c2: 'T', icon: '🐱', hint: 'A furry pet that says Meow!' },
  { word: 'HEN', c1: 'H', vowel: 'E', c2: 'N', icon: '🐔', hint: 'A farm bird that gives us eggs!' },
  { word: 'PIG', c1: 'P', vowel: 'I', c2: 'G', icon: '🐷', hint: 'A pink farm animal that says Oink!' },
  { word: 'DOG', c1: 'D', vowel: 'O', c2: 'G', icon: '🐶', hint: 'A loyal pet that barks and guards our home!' },
  { word: 'SUN', c1: 'S', vowel: 'U', c2: 'N', icon: '☀️', hint: 'Shines brightly in the day sky!' },
  { word: 'BUS', c1: 'B', vowel: 'U', c2: 'S', icon: '🚌', hint: 'Takes children to school!' },
];

const TOY_SHOP_ITEMS = [
  { id: 'ball', name: 'Colorful Ball', icon: '⚽', price: 12 },
  { id: 'car', name: 'Red Toy Car', icon: '🚗', price: 18 },
  { id: 'teddy', name: 'Teddy Bear', icon: '🧸', price: 27 },
  { id: 'crayons', name: 'Crayon Box', icon: '🖍️', price: 35 },
];

const SENSE_ORGANS = [
  {
    id: 'eyes',
    organ: 'Eyes (Sense of Sight) 👀',
    action: 'We SEE shapes, colors, big/small, and light with our eyes.',
    stimulus: '🌈 Rainbow & Storybook',
    careTip: 'Read in good light and wash your eyes with clean cold water.',
  },
  {
    id: 'ears',
    organ: 'Ears (Sense of Hearing) 👂',
    action: 'We HEAR loud, soft, pleasant music, and bird sounds with our ears.',
    stimulus: '🔔 Ringing School Bell & Birds Chirping',
    careTip: 'Never put sharp objects inside your ears; avoid very loud noises.',
  },
  {
    id: 'nose',
    organ: 'Nose (Sense of Smell) 👃',
    action: 'We SMELL pleasant fragrances and foul odors, and breathe through our nose.',
    stimulus: '🌹 Fresh Rose & Hot Soup',
    careTip: 'Always use a clean handkerchief when sneezing or blowing your nose.',
  },
  {
    id: 'tongue',
    organ: 'Tongue (Sense of Taste) 👅',
    action: 'Taste buds help us TASTE Sweet, Salty, Sour, and Bitter foods; helps us speak!',
    stimulus: '🥭 Sweet Mango vs. 🍋 Sour Lemon',
    careTip: 'Clean your tongue gently every morning while brushing your teeth.',
  },
  {
    id: 'skin',
    organ: 'Skin (Sense of Touch & Feel) 🖐️',
    action: 'Skin covers our whole body and helps us FEEL Hot, Cold, Soft, Hard, Rough, and Smooth.',
    stimulus: '🧊 Cold Ice Cube vs. ☁️ Soft Cotton',
    careTip: 'Take a bath daily with soap and clean water to keep skin healthy.',
  },
];

const SHAPES_3D = [
  {
    id: 'sphere',
    name: 'Sphere (Ball / Orange)',
    faces: '1 Curved Surface, 0 Flat Faces',
    edgesCorners: '0 Edges, 0 Corners',
    behavior: 'ROLLS ONLY',
    canRoll: true,
    color: '#f43f5e',
  },
  {
    id: 'cube',
    name: 'Cube (Dice / Chalk Box)',
    faces: '6 Flat Square Faces',
    edgesCorners: '12 Straight Edges, 8 Corners',
    behavior: 'SLIDES & STACKS',
    canRoll: false,
    color: '#38bdf8',
  },
  {
    id: 'cylinder',
    name: 'Cylinder (Pencil Cell / Drum)',
    faces: '2 Flat Circular Faces + 1 Curved Surface',
    edgesCorners: '2 Circular Edges, 0 Corners',
    behavior: 'BOTH ROLLS & SLIDES',
    canRoll: true,
    color: '#10b981',
  },
  {
    id: 'cone',
    name: 'Cone (Birthday Cap / Ice-Cream)',
    faces: '1 Flat Circular Base + 1 Curved Surface',
    edgesCorners: '1 Circular Edge, 1 Pointed Corner',
    behavior: 'BOTH ROLLS & SLIDES',
    canRoll: true,
    color: '#f59e0b',
  },
];

export const Class1InteractiveLab: React.FC<{ initialMode?: string }> = ({
  initialMode,
}) => {
  const [mode, setMode] = useState<Class1LabMode>(
    (initialMode as Class1LabMode) || 'spatial-prenumber'
  );
  const [voiceEnabled, setVoiceEnabled] = useState(true);
  const [stars, setStars] = useState(3);
  const [missionBanner, setMissionBanner] = useState<string | null>(null);

  // Mode states
  const [catPosition, setCatPosition] = useState<'inside' | 'outside' | 'on' | 'under' | 'near' | 'far'>('on');
  const [leftCount, setLeftCount] = useState(14);
  const [rightCount, setRightCount] = useState(9);

  const [startNum, setStartNum] = useState(8);
  const [changeNum, setChangeNum] = useState(5);
  const [operation, setOperation] = useState<'add' | 'sub'>('add');

  const [twoDigitNum, setTwoDigitNum] = useState(46);
  const [targetAbacusMission, setTargetAbacusMission] = useState(37);
  const [skipStep, setSkipStep] = useState<2 | 5 | 10>(2);

  const [selectedShapeIdx, setSelectedShapeIdx] = useState(0);
  const [rampAngle, setRampAngle] = useState(22);

  const [objectHandspans, setObjectHandspans] = useState(5);
  const [leftPanBlocks, setLeftPanBlocks] = useState(6);
  const [rightPanBlocks, setRightPanBlocks] = useState(4);
  const [jugCups, setJugCups] = useState(4);

  const [clockHour, setClockHour] = useState(4);
  const [clockHalfHour, setClockHalfHour] = useState(false);
  const [selectedToyIdx, setSelectedToyIdx] = useState(1); // ₹18 Car
  const [walletCoins, setWalletCoins] = useState<number[]>([10, 5, 2, 1]);

  const [patternType, setPatternType] = useState<'ABAB' | 'AAB' | 'ABC' | 'NUM'>('ABAB');
  const [toyCounts, setToyCounts] = useState({ cars: 5, dolls: 3, balls: 7, blocks: 4 });

  const [groupsCount, setGroupsCount] = useState(4);
  const [itemsPerGroup, setItemsPerGroup] = useState(3);
  const [selectedOrdinal, setSelectedOrdinal] = useState(3);

  // English Phonics & Grammar states
  const [cvcIdx, setCvcIdx] = useState(0);
  const [chosenVowel, setChosenVowel] = useState<string>('A');
  const [articleWordIdx, setArticleWordIdx] = useState(0);
  const [oppositeIdx, setOppositeIdx] = useState(0);

  // EVS states
  const [selectedSenseIdx, setSelectedSenseIdx] = useState(0);
  const [waterLevel, setWaterLevel] = useState(80);
  const [sunlightLevel, setSunlightLevel] = useState(85);
  const [trafficLight, setTrafficLight] = useState<'red' | 'yellow' | 'green'>('green');
  const [animalCategory, setAnimalCategory] = useState<'wild' | 'domestic' | 'pet' | 'water'>('wild');
  const [season, setSeason] = useState<'summer' | 'monsoon' | 'winter' | 'spring'>('summer');
  const [isNightSky, setIsNightSky] = useState(false);

  const speak = (text: string, force = false) => {
    if ((!voiceEnabled && !force) || typeof window === 'undefined' || !('speechSynthesis' in window)) {
      return;
    }
    window.speechSynthesis.cancel();
    const u = new SpeechSynthesisUtterance(text);
    u.rate = 0.92;
    u.pitch = 1.1;
    window.speechSynthesis.speak(u);
  };

  const awardStar = (msg: string) => {
    setStars((s) => s + 1);
    setMissionBanner(`🎉 ${msg} (+1 ⭐ Star!)`);
    speak(msg, true);
  };

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
  const activeToy = TOY_SHOP_ITEMS[selectedToyIdx];

  const renderFrogNumberLine = ({ ctx, width, height, elapsedTime }: CanvasRenderContext) => {
    const lineY = height * 0.68;
    const startX = 40;
    const endX = width - 40;
    const maxN = 20;
    const stepPx = (endX - startX) / maxN;

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

    ctx.fillStyle = '#f8fafc';
    ctx.font = 'bold 16px JetBrains Mono, monospace';
    ctx.textAlign = 'left';
    ctx.fillText(
      `Frog Jumps: ${startNum} ${operation === 'add' ? '+' : '-'} ${changeNum} = ${resultNum} (${numberToWords(resultNum)})`,
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

    ctx.fillStyle = '#334155';
    ctx.fillRect(0, 0, rampLen, 14);

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
    const health = (waterLevel + sunlightLevel) / 200;
    const groundY = height * 0.72;
    const cx = width * 0.5;

    ctx.fillStyle = '#0c192c';
    ctx.fillRect(0, 0, width, groundY);
    ctx.fillStyle = '#422006';
    ctx.fillRect(0, groundY, width, height - groundY);

    const sunR = 20 + (sunlightLevel / 100) * 22;
    ctx.fillStyle = '#fde047';
    ctx.beginPath();
    ctx.arc(85, 65, sunR, 0, Math.PI * 2);
    ctx.fill();

    ctx.strokeStyle = '#d97706';
    ctx.lineWidth = 3;
    for (let i = -2; i <= 2; i++) {
      ctx.beginPath();
      ctx.moveTo(cx, groundY);
      ctx.lineTo(cx + i * 26 * health, groundY + 45 * health);
      ctx.stroke();
    }

    const stemH = 35 + health * 145;
    const sway = Math.sin(elapsedTime * 2) * 5;
    ctx.strokeStyle = '#22c55e';
    ctx.lineWidth = 7;
    ctx.beginPath();
    ctx.moveTo(cx, groundY);
    ctx.quadraticCurveTo(cx + sway, groundY - stemH * 0.5, cx + sway, groundY - stemH);
    ctx.stroke();

    if (health > 0.3) {
      ctx.fillStyle = '#10b981';
      ctx.beginPath();
      ctx.ellipse(cx - 24, groundY - stemH * 0.45, 22, 10, -0.4, 0, Math.PI * 2);
      ctx.ellipse(cx + 24, groundY - stemH * 0.62, 22, 10, 0.4, 0, Math.PI * 2);
      ctx.fill();
    }

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
      ctx.fillStyle = '#fde047';
      ctx.beginPath();
      ctx.arc(95, 75, season === 'summer' ? 36 : 24, 0, Math.PI * 2);
      ctx.fill();
    }

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
      {/* Top Kid-Friendly Voice Narration & Star Reward Header */}
      <div className="flex flex-wrap items-center justify-between gap-2 p-3 rounded-2xl bg-gradient-to-r from-cyan-950/60 via-slate-900 to-emerald-950/60 border border-cyan-500/30 shadow-md">
        <div className="flex items-center gap-3">
          <div className="px-3 py-1.5 rounded-xl bg-amber-500/20 border border-amber-400 flex items-center gap-1.5">
            <Trophy className="w-4 h-4 text-amber-400" />
            <span className="text-xs font-extrabold text-amber-200">
              ⭐ {stars} Stars Earned!
            </span>
          </div>

          {missionBanner ? (
            <span className="text-xs font-bold text-emerald-300 bg-emerald-500/15 border border-emerald-500/40 px-3 py-1 rounded-xl animate-pulse">
              {missionBanner}
            </span>
          ) : (
            <span className="text-xs text-slate-300 hidden sm:inline">
              Tap objects directly or click 🔊 to hear voice narration!
            </span>
          )}
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() =>
              speak(
                'Welcome to Class 1 Interactive Learning Lab! Click any activity to play and earn stars!',
                true
              )
            }
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-cyan-500 text-slate-950 text-xs font-extrabold hover:bg-cyan-400 transition-colors"
          >
            <Volume2 className="w-3.5 h-3.5" />
            🔊 Speak Aloud
          </button>

          <button
            type="button"
            onClick={() => setVoiceEnabled((v) => !v)}
            className={`flex items-center gap-1 px-2.5 py-1.5 rounded-xl text-xs font-bold border ${
              voiceEnabled
                ? 'bg-emerald-500/20 border-emerald-400 text-emerald-200'
                : 'bg-slate-800 border-slate-700 text-slate-400'
            }`}
          >
            {voiceEnabled ? <Volume2 className="w-3.5 h-3.5" /> : <VolumeX className="w-3.5 h-3.5" />}
            Voice: {voiceEnabled ? 'ON' : 'OFF'}
          </button>
        </div>
      </div>

      {/* 15-Mode Class 1 Interactive Selector Bar (Math + English + EVS) */}
      <div className="flex flex-wrap items-center gap-1.5 p-2.5 rounded-xl bg-[#111827] border border-[#1F2937]">
        {[
          { id: 'spatial-prenumber', label: '1. Spatial (Furry Cat)', icon: Sparkles },
          { id: 'number-line-tenframe', label: '2. Numbers 1–20 & < > =', icon: Sparkles },
          { id: 'addition-subtraction', label: '3. Add & Subtract Frog', icon: Calculator },
          { id: 'tens-ones-abacus', label: '4. Tens & Ones Abacus', icon: Plus },
          { id: 'shapes-roll-slide', label: '5. Shapes: Roll/Slide', icon: Shapes },
          { id: 'measurement-balance', label: '6. Handspan & Balance', icon: Calculator },
          { id: 'clock-money', label: '7. Clock & ₹ Toy Shop', icon: Clock },
          { id: 'patterns-pictograph', label: '8. Patterns & Pictograph', icon: Shapes },
          { id: 'spatial-ordinals-data', label: '9. Ordinals (1st–10th)', icon: Sparkles },
          { id: 'eng-phonics-vowels', label: '10. English: Vowels & CVC', icon: BookOpen },
          { id: 'eng-grammar-opposites', label: '11. English: Opposites/Verbs', icon: BookOpen },
          { id: 'evs-sense-organs', label: '12. EVS: 5 Sense Organs', icon: Eye },
          { id: 'evs-plants-living', label: '13. EVS: Growing Plant', icon: Sprout },
          { id: 'evs-animals-food-safety', label: '14. EVS: Animals & Safety', icon: CheckCircle2 },
          { id: 'evs-seasons-sky', label: '15. EVS: Seasons & Sky', icon: Sun },
        ].map((m) => {
          const Icon = m.icon;
          const active = mode === m.id;
          return (
            <button
              key={m.id}
              type="button"
              onClick={() => {
                setMode(m.id as Class1LabMode);
                setMissionBanner(null);
              }}
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

      {/* MODE 1: SPATIAL PRE-NUMBER CONCEPTS (FINDING THE FURRY CAT!) */}
      {mode === 'spatial-prenumber' && (
        <div className="p-4 rounded-xl bg-[#111827] border border-[#1F2937] space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-cyan-400">
                NCERT Ch 1: Finding the Furry Cat! — Pre-Number Spatial Vocabulary
              </h4>
              <p className="text-xs text-slate-400">
                Tap any position button below to move the Furry Cat 🐱 and hear the sentence!
              </p>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {(
                [
                  { id: 'on', label: 'ON the Table', speech: 'The furry cat is sitting ON the table!' },
                  { id: 'under', label: 'UNDER the Table', speech: 'The furry cat is hiding UNDER the table!' },
                  { id: 'inside', label: 'INSIDE the Box', speech: 'The furry cat is INSIDE the box!' },
                  { id: 'outside', label: 'OUTSIDE the Box', speech: 'The furry cat jumped OUTSIDE the box!' },
                  { id: 'near', label: 'NEAR the Tree', speech: 'The furry cat is standing NEAR the tree!' },
                  { id: 'far', label: 'FAR from the Tree', speech: 'The furry cat is FAR away from the tree!' },
                ] as const
              ).map((pos) => (
                <button
                  key={pos.id}
                  type="button"
                  onClick={() => {
                    setCatPosition(pos.id);
                    awardStar(pos.speech);
                  }}
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
            <div className="p-4 rounded-xl bg-[#111827] border border-slate-800 flex flex-col items-center justify-between h-48">
              <span className="text-xs font-mono text-cyan-300 font-bold">
                ON vs. UNDER the Table
              </span>
              <div className="relative w-40 h-28 flex flex-col items-center justify-center">
                {catPosition === 'on' && (
                  <div className="text-3xl animate-bounce mb-1">🐱</div>
                )}
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
                  ? 'The cat is ON the table.'
                  : catPosition === 'under'
                  ? 'The cat is UNDER the table.'
                  : 'Tap ON or UNDER'}
              </span>
            </div>

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
                  ? 'The cat is OUTSIDE the box!'
                  : 'Tap INSIDE or OUTSIDE'}
              </span>
            </div>

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
                  ? 'The cat is FAR from the tree.'
                  : 'Tap NEAR or FAR'}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* MODE 2: NUMBERS 1-20, TEN-FRAMES & CROCODILE COMPARISON */}
      {mode === 'number-line-tenframe' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-11 gap-4 items-center p-4 rounded-xl bg-[#111827] border border-[#1F2937]">
            {/* Left Ten-Frames (Tap any cell!) */}
            <div className="lg:col-span-4 p-3.5 rounded-xl bg-[#090D16] border border-slate-800 space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-xs font-bold text-cyan-400 uppercase">
                  Tap Apples ({numberToWords(leftCount)})
                </span>
                <button
                  type="button"
                  onClick={() => speak(`${leftCount}, ${numberToWords(leftCount)} apples!`, true)}
                  className="text-base font-mono font-extrabold text-white bg-cyan-500/20 px-2.5 py-0.5 rounded border border-cyan-400"
                >
                  {leftCount} ({numberToWords(leftCount)}) 🔊
                </button>
              </div>
              <div className="grid grid-cols-5 gap-1.5">
                {Array.from({ length: 20 }).map((_, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => {
                      const next = i + 1;
                      setLeftCount(next);
                      speak(`${next}, ${numberToWords(next)} apples`);
                    }}
                    className={`h-8 rounded-lg border flex items-center justify-center text-sm transition-transform hover:scale-105 ${
                      i < leftCount
                        ? 'bg-cyan-500/25 border-cyan-400 text-cyan-200'
                        : 'bg-slate-900/60 border-slate-800 text-slate-700'
                    }`}
                  >
                    {i < leftCount ? '🍎' : i + 1}
                  </button>
                ))}
              </div>
              <div className="text-[11px] font-mono text-slate-400">
                Before {leftCount} is <strong className="text-white">{leftCount - 1}</strong> • After {leftCount} is{' '}
                <strong className="text-white">{leftCount + 1}</strong>
              </div>
            </div>

            {/* Center Crocodile Mouth */}
            <div className="lg:col-span-3 flex flex-col items-center justify-center p-4 rounded-xl bg-[#090D16] border border-emerald-500/30 space-y-2">
              <span className="text-[11px] font-mono uppercase text-emerald-400">
                Hungry Crocodile Mouth 🐊
              </span>
              <div className="text-4xl font-mono font-black text-emerald-400">
                {leftCount} {compSymbol} {rightCount}
              </div>
              <p className="text-xs text-center text-slate-200 font-semibold">
                {numberToWords(leftCount)} {compWord} {numberToWords(rightCount)}
              </p>
              <button
                type="button"
                onClick={() =>
                  awardStar(`${leftCount} ${compWord} ${rightCount}!`)
                }
                className="px-3 py-1 rounded-lg bg-emerald-500 text-slate-950 text-xs font-extrabold"
              >
                🔊 Speak Comparison
              </button>
            </div>

            {/* Right Ten-Frames */}
            <div className="lg:col-span-4 p-3.5 rounded-xl bg-[#090D16] border border-slate-800 space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-xs font-bold text-amber-400 uppercase">
                  Tap Mangoes ({numberToWords(rightCount)})
                </span>
                <button
                  type="button"
                  onClick={() => speak(`${rightCount}, ${numberToWords(rightCount)} mangoes!`, true)}
                  className="text-base font-mono font-extrabold text-white bg-amber-500/20 px-2.5 py-0.5 rounded border border-amber-400"
                >
                  {rightCount} ({numberToWords(rightCount)}) 🔊
                </button>
              </div>
              <div className="grid grid-cols-5 gap-1.5">
                {Array.from({ length: 20 }).map((_, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => {
                      const next = i + 1;
                      setRightCount(next);
                      speak(`${next}, ${numberToWords(next)} mangoes`);
                    }}
                    className={`h-8 rounded-lg border flex items-center justify-center text-sm transition-transform hover:scale-105 ${
                      i < rightCount
                        ? 'bg-amber-500/25 border-amber-400 text-amber-200'
                        : 'bg-slate-900/60 border-slate-800 text-slate-700'
                    }`}
                  >
                    {i < rightCount ? '🥭' : i + 1}
                  </button>
                ))}
              </div>
              <div className="text-[11px] font-mono text-slate-400">
                {Math.floor(rightCount / 10)} Ten and {rightCount % 10} Ones
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODE 3: ADDITION & SUBTRACTION FROG NUMBER LINE */}
      {mode === 'addition-subtraction' && (
        <div className="space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => {
                  setOperation('add');
                  speak(`${startNum} plus ${changeNum} equals ${startNum + changeNum}`);
                }}
                className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-bold ${
                  operation === 'add'
                    ? 'bg-emerald-500 text-slate-950'
                    : 'bg-[#111827] text-slate-300 border border-slate-800'
                }`}
              >
                <Plus className="w-3.5 h-3.5" /> Addition (+ Forward Jumps)
              </button>
              <button
                type="button"
                onClick={() => {
                  setOperation('sub');
                  speak(`${startNum} minus ${changeNum} equals ${Math.max(0, startNum - changeNum)}`);
                }}
                className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-bold ${
                  operation === 'sub'
                    ? 'bg-rose-500 text-white'
                    : 'bg-[#111827] text-slate-300 border border-slate-800'
                }`}
              >
                <Minus className="w-3.5 h-3.5" /> Subtraction (- Backward Jumps)
              </button>
            </div>

            <button
              type="button"
              onClick={() =>
                awardStar(
                  `${startNum} ${operation === 'add' ? 'plus' : 'minus'} ${changeNum} equals ${resultNum}!`
                )
              }
              className="px-3 py-1.5 rounded-lg bg-cyan-500/20 border border-cyan-400 text-xs font-bold text-cyan-200"
            >
              🔊 Speak Number Sentence ({startNum} {operation === 'add' ? '+' : '-'} {changeNum} = {resultNum})
            </button>
          </div>

          <Canvas2DWrapper
            title="Class 1 Number Line Frog Hops (0 to 20)"
            subtitle="Watch the green frog hop forward for Addition (+) and hop backward for Subtraction (-)"
            height={290}
            onRender={renderFrogNumberLine}
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

      {/* MODE 4: TENS & ONES ABACUS + MISSION CHALLENGE + SKIP COUNTING */}
      {mode === 'tens-ones-abacus' && (
        <div className="space-y-4">
          {/* Interactive Abacus Challenge Bar */}
          <div className="flex flex-wrap items-center justify-between gap-2 p-3 rounded-xl bg-[#111827] border border-amber-500/40">
            <div className="flex items-center gap-2">
              <Target className="w-4 h-4 text-amber-400" />
              <span className="text-xs font-bold text-white">
                🎯 Abacus Mission: Can you make{' '}
                <strong className="text-amber-300 text-sm">
                  {targetAbacusMission} ({numberToWords(targetAbacusMission)})
                </strong>{' '}
                using the + / - rod buttons?
              </span>
            </div>
            <div className="flex items-center gap-2">
              {twoDigitNum === targetAbacusMission ? (
                <button
                  type="button"
                  onClick={() => {
                    const nextTarget = Math.floor(Math.random() * 88) + 11;
                    awardStar(`You made ${targetAbacusMission}, ${numberToWords(targetAbacusMission)}!`);
                    setTargetAbacusMission(nextTarget);
                  }}
                  className="px-3 py-1 rounded-lg bg-emerald-500 text-slate-950 text-xs font-extrabold animate-bounce"
                >
                  🎉 Matched {targetAbacusMission}! Claim +1 ⭐ & Next Mission
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => {
                    const nextTarget = Math.floor(Math.random() * 88) + 11;
                    setTargetAbacusMission(nextTarget);
                    speak(`New mission! Can you make ${nextTarget}, ${numberToWords(nextTarget)}?`, true);
                  }}
                  className="px-2.5 py-1 rounded-lg bg-slate-800 text-xs text-amber-300 border border-slate-700"
                >
                  New Target Number
                </button>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* Direct-Tap 2-Rod Spike Abacus with Number Word Spelling */}
            <div className="p-4 rounded-xl bg-[#111827] border border-[#1F2937] space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-xs font-bold uppercase tracking-wider text-cyan-400">
                    Tens & Ones Spike Abacus
                  </h4>
                  <p className="text-sm font-extrabold text-white mt-0.5">
                    {twoDigitNum} = &ldquo;{numberToWords(twoDigitNum)}&rdquo;
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() =>
                    speak(
                      `${twoDigitNum}, ${numberToWords(twoDigitNum)}, has ${tensDigit} Tens and ${onesDigit} Ones`,
                      true
                    )
                  }
                  className="px-3 py-1.5 rounded-lg bg-cyan-500/20 border border-cyan-400 text-xs font-mono font-bold text-cyan-200"
                >
                  🔊 {tensDigit} Tens + {onesDigit} Ones
                </button>
              </div>

              <div className="grid grid-cols-2 gap-4 p-4 rounded-xl bg-[#090D16] border border-slate-800">
                {/* Tens Rod */}
                <div className="flex flex-col items-center">
                  <span className="text-xs font-bold text-amber-400 mb-1">
                    TENS ROD (10s)
                  </span>
                  <div className="relative h-36 w-full flex flex-col justify-end items-center py-2">
                    <div className="absolute inset-y-0 w-1.5 bg-slate-700 rounded-full" />
                    {Array.from({ length: tensDigit }).map((_, i) => (
                      <div
                        key={i}
                        className="relative z-10 w-12 h-3 rounded-full bg-amber-500 my-0.5 border border-white/30"
                      />
                    ))}
                  </div>
                  <div className="flex items-center gap-2 mt-2">
                    <button
                      type="button"
                      onClick={() => setTwoDigitNum((n) => Math.max(0, n - 10))}
                      className="px-3 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-bold text-amber-300 border border-slate-700"
                    >
                      -1 Ten
                    </button>
                    <span className="font-mono text-sm font-bold text-white">{tensDigit}</span>
                    <button
                      type="button"
                      onClick={() => setTwoDigitNum((n) => Math.min(99, n + 10))}
                      className="px-3 py-1 rounded-lg bg-amber-500 text-slate-950 text-xs font-extrabold"
                    >
                      +1 Ten
                    </button>
                  </div>
                </div>

                {/* Ones Rod */}
                <div className="flex flex-col items-center">
                  <span className="text-xs font-bold text-cyan-400 mb-1">
                    ONES ROD (1s)
                  </span>
                  <div className="relative h-36 w-full flex flex-col justify-end items-center py-2">
                    <div className="absolute inset-y-0 w-1.5 bg-slate-700 rounded-full" />
                    {Array.from({ length: onesDigit }).map((_, i) => (
                      <div
                        key={i}
                        className="relative z-10 w-12 h-3 rounded-full bg-cyan-500 my-0.5 border border-white/30"
                      />
                    ))}
                  </div>
                  <div className="flex items-center gap-2 mt-2">
                    <button
                      type="button"
                      onClick={() => setTwoDigitNum((n) => Math.max(0, n - 1))}
                      className="px-3 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-bold text-cyan-300 border border-slate-700"
                    >
                      -1 One
                    </button>
                    <span className="font-mono text-sm font-bold text-white">{onesDigit}</span>
                    <button
                      type="button"
                      onClick={() => setTwoDigitNum((n) => Math.min(99, n + 1))}
                      className="px-3 py-1 rounded-lg bg-cyan-500 text-slate-950 text-xs font-extrabold"
                    >
                      +1 One
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Skip Counting by 2s, 5s, 10s Board */}
            <div className="p-4 rounded-xl bg-[#111827] border border-[#1F2937] space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-bold uppercase tracking-wider text-emerald-400">
                  Tap Any Number (Skip Counting by {skipStep}s)
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
                      onClick={() => {
                        setTwoDigitNum(n);
                        speak(`${n}, ${numberToWords(n)}`);
                      }}
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
        </div>
      )}

      {/* MODE 5: 2D & 3D SHAPES — ROLLING VS SLIDING RAMP */}
      {mode === 'shapes-roll-slide' && (
        <div className="space-y-4">
          <div className="flex flex-wrap gap-2">
            {SHAPES_3D.map((sh, idx) => (
              <button
                key={sh.id}
                type="button"
                onClick={() => {
                  setSelectedShapeIdx(idx);
                  speak(`${sh.name}, ${sh.behavior}`);
                }}
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
            height={290}
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
          />
        </div>
      )}

      {/* MODE 6: NON-STANDARD MEASUREMENT (HANDSPANS, PAN BALANCE & CAPACITY) */}
      {mode === 'measurement-balance' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <div className="p-4 rounded-xl bg-[#111827] border border-[#1F2937] space-y-3">
            <div className="flex justify-between items-center">
              <h4 className="text-xs font-bold uppercase text-cyan-400">
                1. Length in Handspans ✋
              </h4>
              <span className="text-xs font-mono font-bold text-white bg-[#090D16] px-2 py-0.5 rounded border border-slate-800">
                {objectHandspans} Handspans
              </span>
            </div>
            <div className="p-3 rounded-xl bg-[#090D16] border border-slate-800 space-y-2">
              <div className="h-6 rounded bg-amber-600/80 border border-amber-400 flex items-center justify-center text-xs font-bold text-slate-950">
                Study Table ({objectHandspans} Handspans)
              </div>
              <div className="flex justify-start gap-1 text-xl">
                {Array.from({ length: objectHandspans }).map((_, i) => (
                  <span key={i}>🖐️</span>
                ))}
              </div>
            </div>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setObjectHandspans((h) => Math.max(2, h - 1))}
                className="flex-1 py-1 rounded bg-slate-800 text-xs font-bold"
              >
                -1 Handspan
              </button>
              <button
                type="button"
                onClick={() => setObjectHandspans((h) => Math.min(9, h + 1))}
                className="flex-1 py-1 rounded bg-cyan-500 text-slate-950 text-xs font-bold"
              >
                +1 Handspan
              </button>
            </div>
          </div>

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
                  : 'BALANCED!'}
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
                className="py-1 rounded bg-slate-800 text-rose-300 font-mono font-bold"
              >
                Left: {leftPanBlocks} (Tap +)
              </button>
              <button
                type="button"
                onClick={() => setRightPanBlocks((n) => (n >= 10 ? 1 : n + 1))}
                className="py-1 rounded bg-slate-800 text-cyan-300 font-mono font-bold"
              >
                Right: {rightPanBlocks} (Tap +)
              </button>
            </div>
          </div>

          <div className="p-4 rounded-xl bg-[#111827] border border-[#1F2937] space-y-3">
            <div className="flex justify-between items-center">
              <h4 className="text-xs font-bold uppercase text-amber-400">
                3. Jug & Glasses Capacity 🫗
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
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setJugCups((c) => Math.max(2, c - 1))}
                className="flex-1 py-1 rounded bg-slate-800 text-xs font-bold"
              >
                -1 Glass
              </button>
              <button
                type="button"
                onClick={() => setJugCups((c) => Math.min(8, c + 1))}
                className="flex-1 py-1 rounded bg-amber-500 text-slate-950 text-xs font-bold"
              >
                +1 Glass
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODE 7: INTERACTIVE TAP-ON-DIAL CLOCK & TOY SHOP CASHIER GAME */}
      {mode === 'clock-money' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {/* Tap-on-Numbers Analog Clock */}
          <div className="p-4 rounded-xl bg-[#111827] border border-[#1F2937] space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-bold uppercase tracking-wider text-cyan-400 flex items-center gap-1.5">
                <Clock className="w-4 h-4" />
                Tap Any Number (1–12) on the Clock Face!
              </h4>
              <button
                type="button"
                onClick={() =>
                  speak(
                    clockHalfHour
                      ? `It is half past ${clockHour}`
                      : `It is ${clockHour} o'clock`,
                    true
                  )
                }
                className="px-2.5 py-1 rounded bg-cyan-500/20 border border-cyan-400 font-mono text-xs font-bold text-cyan-200"
              >
                🔊 {clockHour}:{clockHalfHour ? '30' : '00'} ({clockHalfHour ? `Half past ${clockHour}` : `${clockHour} o'clock`})
              </button>
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-around gap-4 p-4 rounded-xl bg-[#090D16] border border-slate-800">
              <svg width="185" height="185" viewBox="-92 -92 184 184">
                <circle r="84" fill="#111827" stroke="#38bdf8" strokeWidth="4" />
                {Array.from({ length: 12 }, (_, i) => i + 1).map((hr) => {
                  const angle = ((hr * 30 - 90) * Math.PI) / 180;
                  const x = Math.cos(angle) * 66;
                  const y = Math.sin(angle) * 66;
                  const isSelected = clockHour === hr;
                  return (
                    <g
                      key={hr}
                      onClick={() => {
                        setClockHour(hr);
                        speak(`${hr} o'clock`);
                      }}
                      className="cursor-pointer"
                    >
                      <circle
                        cx={x}
                        cy={y}
                        r="13"
                        fill={isSelected ? '#06b6d4' : '#1e293b'}
                      />
                      <text
                        x={x}
                        y={y + 4}
                        textAnchor="middle"
                        fill={isSelected ? '#090d16' : '#f8fafc'}
                        fontSize="12"
                        fontWeight="bold"
                        fontFamily="monospace"
                      >
                        {hr}
                      </text>
                    </g>
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
                      x2={Math.cos(minRad) * 54}
                      y2={Math.sin(minRad) * 54}
                      stroke="#10b981"
                      strokeWidth="3.5"
                      strokeLinecap="round"
                    />
                  );
                })()}
                <circle r="5" fill="#fde047" />
              </svg>

              <div className="space-y-2.5 w-full sm:w-44">
                <p className="text-xs text-slate-300">
                  🔴 <strong>Short Red Hand</strong> = Hour ({clockHour})
                  <br />
                  🟢 <strong>Long Green Hand</strong> = Minutes
                </p>
                <button
                  type="button"
                  onClick={() => setClockHalfHour((h) => !h)}
                  className="w-full py-2 rounded-lg bg-emerald-500/20 border border-emerald-400 text-xs font-bold text-emerald-200"
                >
                  Switch to {clockHalfHour ? "O'Clock (:00)" : 'Half-Past (:30)'}
                </button>
              </div>
            </div>
          </div>

          {/* Interactive Toy Shop Cashier Game */}
          <div className="p-4 rounded-xl bg-[#111827] border border-[#1F2937] space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-bold uppercase tracking-wider text-amber-400 flex items-center gap-1.5">
                <IndianRupee className="w-4 h-4" />
                Class 1 Toy Shop Cashier Game
              </h4>
              <span
                className={`px-2.5 py-1 rounded font-mono text-xs font-bold border ${
                  totalMoney === activeToy.price
                    ? 'bg-emerald-500 text-slate-950 border-white'
                    : 'bg-amber-500/20 border-amber-400 text-amber-200'
                }`}
              >
                Your Coins: ₹{totalMoney} / Price: ₹{activeToy.price}
              </span>
            </div>

            <div className="p-3.5 rounded-xl bg-[#090D16] border border-slate-800 space-y-3">
              {/* Pick a Toy to Buy */}
              <div className="grid grid-cols-4 gap-1.5">
                {TOY_SHOP_ITEMS.map((toy, idx) => (
                  <button
                    key={toy.id}
                    type="button"
                    onClick={() => {
                      setSelectedToyIdx(idx);
                      setWalletCoins([]);
                      speak(`Can you pay ${toy.price} rupees for the ${toy.name}?`);
                    }}
                    className={`p-2 rounded-lg border text-center transition-all ${
                      selectedToyIdx === idx
                        ? 'bg-amber-500/25 border-amber-400 text-white'
                        : 'bg-[#111827] border-slate-800 text-slate-400'
                    }`}
                  >
                    <div className="text-xl">{toy.icon}</div>
                    <div className="text-[10px] truncate">{toy.name}</div>
                    <div className="text-xs font-mono font-bold text-amber-300">
                      ₹{toy.price}
                    </div>
                  </button>
                ))}
              </div>

              {/* Add Coins & Notes */}
              <div className="flex flex-wrap items-center gap-1.5">
                {[1, 2, 5, 10, 20].map((denom) => (
                  <button
                    key={denom}
                    type="button"
                    onClick={() => setWalletCoins((prev) => [...prev, denom])}
                    className="px-2.5 py-1 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 border border-amber-400 text-xs font-mono font-bold text-amber-200"
                  >
                    + ₹{denom}
                  </button>
                ))}
                <button
                  type="button"
                  onClick={() => setWalletCoins([])}
                  className="px-2.5 py-1 rounded-lg bg-rose-500/20 border border-rose-500/40 text-xs font-mono text-rose-300"
                >
                  Reset ₹0
                </button>
              </div>

              <div className="flex items-center justify-between p-2.5 rounded-lg bg-[#111827] border border-slate-800">
                <div className="flex flex-wrap gap-1">
                  {walletCoins.length === 0 ? (
                    <span className="text-xs text-slate-500">
                      Tap coins above to make ₹{activeToy.price}
                    </span>
                  ) : (
                    walletCoins.map((c, i) => (
                      <span
                        key={i}
                        className="px-2 py-0.5 rounded-full bg-amber-400 text-slate-950 font-mono text-xs font-bold"
                      >
                        ₹{c}
                      </span>
                    ))
                  )}
                </div>

                {totalMoney === activeToy.price && (
                  <button
                    type="button"
                    onClick={() =>
                      awardStar(`Exact change! You bought the ${activeToy.name} for ${activeToy.price} rupees!`)
                    }
                    className="px-3 py-1 rounded-lg bg-emerald-500 text-slate-950 text-xs font-extrabold shrink-0"
                  >
                    🎉 Buy Toy (+1 ⭐)
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODE 8: PATTERNS (UTSAV) & TOY PICTOGRAPH DATA HANDLING */}
      {mode === 'patterns-pictograph' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
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

      {/* MODE 9: ORDINALS (1st-10th) & REPEATED ADDITION GROUPS */}
      {mode === 'spatial-ordinals-data' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <div className="p-4 rounded-xl bg-[#111827] border border-[#1F2937] space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-bold uppercase tracking-wider text-cyan-400">
                Ordinal Numbers (1st First to 10th Tenth)
              </h4>
              <span className="px-2.5 py-1 rounded bg-cyan-500/20 border border-cyan-400 text-xs font-mono font-bold text-cyan-200">
                Position #{selectedOrdinal}
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
                  onClick={() => {
                    setSelectedOrdinal(item.pos);
                    speak(`${item.ord}, ${item.word} position!`);
                  }}
                  className={`p-2 rounded-lg border text-center transition-all ${
                    selectedOrdinal === item.pos
                      ? 'bg-cyan-500/25 border-cyan-400 text-white scale-105'
                      : 'bg-slate-900 border-slate-800 text-slate-400'
                  }`}
                >
                  <div className="text-base">{item.icon}</div>
                  <div className="text-xs font-mono font-bold text-cyan-300">{item.ord}</div>
                  <div className="text-[10px]">{item.word}</div>
                </button>
              ))}
            </div>
          </div>

          <div className="p-4 rounded-xl bg-[#111827] border border-[#1F2937] space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-bold uppercase tracking-wider text-amber-400">
                Equal Groups ({groupsCount} groups of {itemsPerGroup})
              </h4>
              <div className="flex gap-1.5">
                <button
                  type="button"
                  onClick={() => setGroupsCount((g) => (g >= 6 ? 2 : g + 1))}
                  className="px-2 py-0.5 rounded bg-slate-800 text-xs font-mono text-amber-300"
                >
                  Groups: {groupsCount}
                </button>
                <button
                  type="button"
                  onClick={() => setItemsPerGroup((i) => (i >= 5 ? 2 : i + 1))}
                  className="px-2 py-0.5 rounded bg-slate-800 text-xs font-mono text-cyan-300"
                >
                  Each: {itemsPerGroup}
                </button>
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 p-3 rounded-xl bg-[#090D16] border border-slate-800">
              {Array.from({ length: groupsCount }).map((_, gIdx) => (
                <div
                  key={gIdx}
                  className="p-2.5 rounded-lg bg-[#111827] border border-amber-500/30 flex flex-col items-center gap-1"
                >
                  <span className="text-[10px] font-mono text-slate-400">Group {gIdx + 1}</span>
                  <div className="flex flex-wrap justify-center gap-1 text-base">
                    {Array.from({ length: itemsPerGroup }).map((__, sIdx) => (
                      <span key={sIdx}>⭐</span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
            <p className="text-xs font-mono text-slate-300 bg-[#090D16] p-2.5 rounded-lg border border-slate-800">
              {Array.from({ length: groupsCount })
                .map(() => itemsPerGroup)
                .join(' + ')}{' '}
              = <strong className="text-amber-300">{groupsCount * itemsPerGroup}</strong> (
              {numberToWords(groupsCount * itemsPerGroup)} Stars)
            </p>
          </div>
        </div>
      )}

      {/* MODE 10: CLASS 1 ENGLISH — VOWELS (A, E, I, O, U), PHONICS CVC BUILDER & A/AN */}
      {mode === 'eng-phonics-vowels' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {/* CVC 3-Letter Vowel Word Builder */}
          <div className="p-4 rounded-xl bg-[#111827] border border-[#1F2937] space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-bold uppercase text-cyan-400">
                NCERT Mridang & ICSE English: 5 Vowels (A, E, I, O, U) Word Builder
              </h4>
              <span className="text-xs font-mono text-emerald-300">
                Tap a Vowel to Complete the Word!
              </span>
            </div>

            <div className="p-4 rounded-xl bg-[#090D16] border border-slate-800 flex flex-col items-center space-y-3">
              <div className="flex gap-1.5">
                {CVC_WORDS.map((item, idx) => (
                  <button
                    key={item.word}
                    type="button"
                    onClick={() => {
                      setCvcIdx(idx);
                      setChosenVowel(item.vowel);
                      speak(`${item.word}! ${item.hint}`);
                    }}
                    className={`px-2.5 py-1 rounded-lg text-sm border ${
                      cvcIdx === idx
                        ? 'bg-cyan-500/25 border-cyan-400 text-white'
                        : 'bg-[#111827] border-slate-800'
                    }`}
                  >
                    {item.icon}
                  </button>
                ))}
              </div>

              <div className="text-5xl">{CVC_WORDS[cvcIdx].icon}</div>
              <p className="text-xs text-slate-300">{CVC_WORDS[cvcIdx].hint}</p>

              {/* 3 Letter Tiles */}
              <div className="flex items-center gap-2 text-2xl font-mono font-black">
                <span className="w-12 h-12 rounded-xl bg-[#111827] border border-slate-700 flex items-center justify-center text-white">
                  {CVC_WORDS[cvcIdx].c1}
                </span>
                <span
                  className={`w-12 h-12 rounded-xl border-2 flex items-center justify-center ${
                    chosenVowel === CVC_WORDS[cvcIdx].vowel
                      ? 'bg-emerald-500/30 border-emerald-400 text-emerald-200'
                      : 'bg-rose-500/30 border-rose-400 text-rose-200'
                  }`}
                >
                  {chosenVowel}
                </span>
                <span className="w-12 h-12 rounded-xl bg-[#111827] border border-slate-700 flex items-center justify-center text-white">
                  {CVC_WORDS[cvcIdx].c2}
                </span>
              </div>

              {/* 5 Vowel Buttons */}
              <div className="flex gap-2">
                {['A', 'E', 'I', 'O', 'U'].map((v) => (
                  <button
                    key={v}
                    type="button"
                    onClick={() => {
                      setChosenVowel(v);
                      if (v === CVC_WORDS[cvcIdx].vowel) {
                        awardStar(
                          `Correct! ${CVC_WORDS[cvcIdx].c1}, ${v}, ${CVC_WORDS[cvcIdx].c2} spells ${CVC_WORDS[cvcIdx].word}!`
                        );
                      } else {
                        speak(`Try another vowel for ${CVC_WORDS[cvcIdx].word}`);
                      }
                    }}
                    className={`w-10 h-10 rounded-xl font-mono font-extrabold text-sm border transition-all ${
                      chosenVowel === v
                        ? 'bg-cyan-500 text-slate-950 border-white scale-110'
                        : 'bg-[#111827] text-cyan-300 border-cyan-500/40 hover:bg-cyan-500/20'
                    }`}
                  >
                    {v}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Use of 'A' vs 'An' Article Explorer */}
          <div className="p-4 rounded-xl bg-[#111827] border border-[#1F2937] space-y-3">
            <h4 className="text-xs font-bold uppercase text-amber-400">
              Use of &ldquo;An&rdquo; (Before Vowel Sounds A, E, I, O, U) vs. &ldquo;A&rdquo;
            </h4>

            <div className="p-4 rounded-xl bg-[#090D16] border border-slate-800 space-y-3">
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {[
                  { word: 'Apple', article: 'An', icon: '🍎', isVowel: true },
                  { word: 'Elephant', article: 'An', icon: '🐘', isVowel: true },
                  { word: 'Ice-Cream', article: 'An', icon: '🍦', isVowel: true },
                  { word: 'Orange', article: 'An', icon: '🍊', isVowel: true },
                  { word: 'Umbrella', article: 'An', icon: '☂️', isVowel: true },
                  { word: 'Ball', article: 'A', icon: '⚽', isVowel: false },
                ].map((item, idx) => (
                  <button
                    key={item.word}
                    type="button"
                    onClick={() => {
                      setArticleWordIdx(idx);
                      speak(`${item.article} ${item.word}!`);
                    }}
                    className={`p-2.5 rounded-xl border text-left transition-all ${
                      articleWordIdx === idx
                        ? 'bg-amber-500/20 border-amber-400 text-white'
                        : 'bg-[#111827] border-slate-800 text-slate-300'
                    }`}
                  >
                    <div className="text-2xl">{item.icon}</div>
                    <div className="text-xs font-bold mt-1">
                      <span className="text-amber-300 underline mr-1">{item.article}</span>
                      {item.word}
                    </div>
                    <div className="text-[10px] text-slate-400">
                      {item.isVowel ? 'Starts with Vowel' : 'Starts with Consonant'}
                    </div>
                  </button>
                ))}
              </div>
              <p className="text-xs text-slate-300">
                Rule: Use <strong className="text-amber-300">An</strong> before words starting with a vowel sound (<strong>A, E, I, O, U</strong>) and <strong className="text-cyan-300">A</strong> before consonant sounds!
              </p>
            </div>
          </div>
        </div>
      )}

      {/* MODE 11: CLASS 1 ENGLISH — OPPOSITES, ACTION WORDS (VERBS) & ONE/MANY */}
      {mode === 'eng-grammar-opposites' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {/* Opposites (Antonyms) Explorer */}
          <div className="p-4 rounded-xl bg-[#111827] border border-[#1F2937] space-y-3">
            <h4 className="text-xs font-bold uppercase text-cyan-400">
              Class 1 English — Opposites (Antonyms) Explorer
            </h4>
            <div className="grid grid-cols-2 gap-2 p-3 rounded-xl bg-[#090D16] border border-slate-800">
              {[
                { w1: '🔥 Hot Tea', w2: '🧊 Cold Ice', speech: 'The opposite of Hot is Cold!' },
                { w1: '🐘 Big Elephant', w2: '🐭 Small Mouse', speech: 'The opposite of Big is Small!' },
                { w1: '☀️ Day', w2: '🌙 Night', speech: 'The opposite of Day is Night!' },
                { w1: '😊 Happy', w2: '😢 Sad', speech: 'The opposite of Happy is Sad!' },
                { w1: '🐇 Fast Rabbit', w2: '🐢 Slow Tortoise', speech: 'The opposite of Fast is Slow!' },
                { w1: '⬆️ Up', w2: '⬇️ Down', speech: 'The opposite of Up is Down!' },
              ].map((pair, idx) => (
                <button
                  key={pair.w1}
                  type="button"
                  onClick={() => {
                    setOppositeIdx(idx);
                    awardStar(pair.speech);
                  }}
                  className={`p-2.5 rounded-xl border text-xs font-bold flex items-center justify-between ${
                    oppositeIdx === idx
                      ? 'bg-cyan-500/20 border-cyan-400 text-white'
                      : 'bg-[#111827] border-slate-800 text-slate-300'
                  }`}
                >
                  <span>{pair.w1}</span>
                  <span className="text-cyan-400">↔</span>
                  <span>{pair.w2}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Action Words (Verbs) & One/Many (Singular/Plural) */}
          <div className="p-4 rounded-xl bg-[#111827] border border-[#1F2937] space-y-3">
            <h4 className="text-xs font-bold uppercase text-emerald-400">
              Action Words (Doing Words) & One vs. Many (Plurals)
            </h4>
            <div className="p-3.5 rounded-xl bg-[#090D16] border border-slate-800 space-y-3">
              <div className="grid grid-cols-2 gap-2 text-xs">
                {[
                  { verb: '📖 Reading a book', speech: 'Reading is an action word!' },
                  { verb: '🏃 Running fast', speech: 'Running is an action word!' },
                  { verb: '🏊 Swimming in water', speech: 'Swimming is an action word!' },
                  { verb: '🎤 Singing a song', speech: 'Singing is an action word!' },
                ].map((v) => (
                  <button
                    key={v.verb}
                    type="button"
                    onClick={() => speak(v.speech, true)}
                    className="p-2 rounded-lg bg-[#111827] border border-emerald-500/30 text-emerald-200 font-semibold text-left hover:border-emerald-400"
                  >
                    {v.verb} 🔊
                  </button>
                ))}
              </div>

              <div className="p-2.5 rounded-lg bg-[#111827] border border-slate-800 text-xs text-slate-300 space-y-1">
                <div className="font-bold text-amber-300">One and Many (Add -s or -es):</div>
                <div>• One Cat 🐱 → Many <strong>Cats</strong> 🐱🐱🐱</div>
                <div>• One Star ⭐ → Many <strong>Stars</strong> ⭐⭐⭐</div>
                <div>• One Mango 🥭 → Many <strong>Mangoes</strong> 🥭🥭🥭</div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODE 12: EVS 5 SENSE ORGANS */}
      {mode === 'evs-sense-organs' && (
        <div className="p-4 rounded-xl bg-[#111827] border border-[#1F2937] space-y-4">
          <div className="flex flex-wrap gap-2">
            {SENSE_ORGANS.map((s, idx) => (
              <button
                key={s.id}
                type="button"
                onClick={() => {
                  setSelectedSenseIdx(idx);
                  speak(`${s.organ}. ${s.action}`);
                }}
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

      {/* MODE 13: EVS GROWING PLANT & LIVING VS NON-LIVING */}
      {mode === 'evs-plants-living' && (
        <div className="space-y-4">
          <Canvas2DWrapper
            title="Class 1 EVS — Parts of a Plant & What Plants Need to Grow"
            subtitle="Adjust Sunlight and Water to help the seed grow Roots, Stem, Leaves, and Flowers"
            height={320}
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

      {/* MODE 14: EVS ANIMALS & TRAFFIC SAFETY */}
      {mode === 'evs-animals-food-safety' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
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
              <div className="text-2xl flex justify-around py-2">
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
                  ? 'Wild animals live in forests and jungles. The Lion lives in a Den.'
                  : animalCategory === 'domestic'
                  ? 'Domestic farm animals help us: Cows give milk (Shed), Sheep give wool, Horses pull carts (Stable).'
                  : animalCategory === 'pet'
                  ? 'Pet animals live with us at home as our friends. A dog guards our house (Kennel).'
                  : 'Water (aquatic) animals live in rivers, lakes, and oceans.'}
              </p>
            </div>
          </div>

          <div className="p-4 rounded-xl bg-[#111827] border border-[#1F2937] space-y-3">
            <h4 className="text-xs font-bold uppercase text-amber-400">
              Class 1 EVS — Tap the Traffic Signal Lights! 🚦
            </h4>
            <div className="flex items-center justify-around p-4 rounded-xl bg-[#090D16] border border-slate-800">
              <div className="p-3 rounded-2xl bg-slate-900 border-2 border-slate-700 flex flex-col gap-2.5">
                <button
                  type="button"
                  onClick={() => {
                    setTrafficLight('red');
                    speak('Red light says STOP!');
                  }}
                  className={`w-10 h-10 rounded-full transition-all ${
                    trafficLight === 'red'
                      ? 'bg-rose-500 shadow-lg shadow-rose-500/60 scale-110'
                      : 'bg-rose-950/50'
                  }`}
                />
                <button
                  type="button"
                  onClick={() => {
                    setTrafficLight('yellow');
                    speak('Yellow light says WAIT and get ready!');
                  }}
                  className={`w-10 h-10 rounded-full transition-all ${
                    trafficLight === 'yellow'
                      ? 'bg-amber-400 shadow-lg shadow-amber-400/60 scale-110'
                      : 'bg-amber-950/50'
                  }`}
                />
                <button
                  type="button"
                  onClick={() => {
                    setTrafficLight('green');
                    speak('Green light says GO safely!');
                  }}
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
                    ? '🟡 YELLOW LIGHT SAYS: WAIT!'
                    : '🟢 GREEN LIGHT SAYS: GO!'}
                </div>
                <p className="text-xs text-slate-300 leading-relaxed">
                  Always cross the road at the black-and-white{' '}
                  <strong className="text-cyan-300">Zebra Crossing</strong> with an elder!
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODE 15: EVS SEASONS, WEATHER & DAY/NIGHT SKY */}
      {mode === 'evs-seasons-sky' && (
        <div className="space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-2 p-2.5 rounded-xl bg-[#111827] border border-[#1F2937]">
            <div className="flex flex-wrap gap-1.5">
              {(['summer', 'monsoon', 'winter', 'spring'] as const).map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => {
                    setSeason(s);
                    speak(`${s} season`);
                  }}
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
            height={320}
            onRender={renderSeasonsAndSky}
          />
        </div>
      )}
    </div>
  );
};
