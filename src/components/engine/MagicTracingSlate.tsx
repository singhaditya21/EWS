import React, { useRef, useState, useEffect, useCallback } from 'react';
import { Eraser, Volume2, Sparkles, CheckCircle2, Palette } from 'lucide-react';

type TraceCategory = 'numbers' | 'english' | 'hindi' | 'shapes';

interface TraceItem {
  char: string;
  title: string;
  word: string;
  lang?: string;
}

const TRACE_ITEMS: Record<TraceCategory, TraceItem[]> = {
  numbers: [
    { char: '1', title: 'Number 1 (One)', word: 'One Sun ☀️' },
    { char: '2', title: 'Number 2 (Two)', word: 'Two Eyes 👀' },
    { char: '3', title: 'Number 3 (Three)', word: 'Three Wheels 🛺' },
    { char: '4', title: 'Number 4 (Four)', word: 'Four Legs of a Chair 🪑' },
    { char: '5', title: 'Number 5 (Five)', word: 'Five Fingers on a Hand 🖐️' },
    { char: '6', title: 'Number 6 (Six)', word: 'Six Faces of a Dice 🎲' },
    { char: '7', title: 'Number 7 (Seven)', word: 'Seven Colors in a Rainbow 🌈' },
    { char: '8', title: 'Number 8 (Eight)', word: 'Eight Arms of an Octopus 🐙' },
    { char: '9', title: 'Number 9 (Nine)', word: 'Nine Planets / Beads 🪐' },
    { char: '10', title: 'Number 10 (Ten)', word: 'Ten Toes / Full Ten-Frame 🔟' },
  ],
  english: [
    { char: 'A a', title: 'Letter A', word: 'A for Apple 🍎' },
    { char: 'B b', title: 'Letter B', word: 'B for Ball ⚽' },
    { char: 'C c', title: 'Letter C', word: 'C for Cat 🐱' },
    { char: 'D d', title: 'Letter D', word: 'D for Dog 🐶' },
    { char: 'E e', title: 'Letter E', word: 'E for Elephant 🐘' },
    { char: 'F f', title: 'Letter F', word: 'F for Fish 🐟' },
    { char: 'G g', title: 'Letter G', word: 'G for Grapes 🍇' },
    { char: 'H h', title: 'Letter H', word: 'H for Hen 🐔' },
    { char: 'I i', title: 'Letter I', word: 'I for Ice-Cream 🍦' },
    { char: 'M m', title: 'Letter M', word: 'M for Mango 🥭' },
    { char: 'S s', title: 'Letter S', word: 'S for Sun ☀️' },
    { char: 'Z z', title: 'Letter Z', word: 'Z for Zebra 🦓' },
  ],
  hindi: [
    { char: 'अ', title: 'स्वर अ (a)', word: 'अ से अनार (Pomegranate) 🍎', lang: 'hi-IN' },
    { char: 'आ', title: 'स्वर आ (aa)', word: 'आ से आम (Mango) 🥭', lang: 'hi-IN' },
    { char: 'इ', title: 'स्वर इ (i)', word: 'इ से इमली (Tamarind) 🌱', lang: 'hi-IN' },
    { char: 'ई', title: 'स्वर ई (ee)', word: 'ई से ईख (Sugarcane) 🎋', lang: 'hi-IN' },
    { char: 'उ', title: 'स्वर उ (u)', word: 'उ से उल्लू (Owl) 🦉', lang: 'hi-IN' },
    { char: 'ऊ', title: 'स्वर ऊ (oo)', word: 'ऊ से ऊन (Wool) 🧶', lang: 'hi-IN' },
    { char: 'ए', title: 'स्वर ए (e)', word: 'ए से एड़ी (Heel) 🦶', lang: 'hi-IN' },
    { char: 'ओ', title: 'स्वर ओ (o)', word: 'ओ से ओखली (Mortar) 🥣', lang: 'hi-IN' },
    { char: 'क', title: 'व्यंजन क (ka)', word: 'क से कमल (Lotus) 🪷', lang: 'hi-IN' },
    { char: 'ख', title: 'व्यंजन ख (kha)', word: 'ख से खरगोश (Rabbit) 🐇', lang: 'hi-IN' },
    { char: 'ग', title: 'व्यंजन ग (ga)', word: 'ग से गमला (Flowerpot) 🪴', lang: 'hi-IN' },
    { char: 'घ', title: 'व्यंजन घ (gha)', word: 'घ से घर (House) 🏠', lang: 'hi-IN' },
  ],
  shapes: [
    { char: '◯', title: 'Circle (Round)', word: '0 Corners, 1 Curved Edge 🔴' },
    { char: '□', title: 'Square (4 Equal Sides)', word: '4 Equal Sides, 4 Corners 🟦' },
    { char: '△', title: 'Triangle (3 Sides)', word: '3 Straight Sides, 3 Corners 🔺' },
    { char: '☆', title: 'Star Shape', word: '5 Pointed Arms ⭐' },
  ],
};

const CRAYON_COLORS = [
  { name: 'Electric Cyan', hex: '#22d3ee' },
  { name: 'Sunny Yellow', hex: '#facc15' },
  { name: 'Emerald Green', hex: '#34d399' },
  { name: 'Coral Rose', hex: '#fb7185' },
  { name: 'Magic Violet', hex: '#c084fc' },
  { name: 'Chalk White', hex: '#f8fafc' },
];

export const MagicTracingSlate: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [category, setCategory] = useState<TraceCategory>('numbers');
  const [itemIdx, setItemIdx] = useState(0);
  const [crayonColor, setCrayonColor] = useState('#22d3ee');
  const [brushSize, setBrushSize] = useState(14);
  const [isDrawing, setIsDrawing] = useState(false);
  const [tracedSuccess, setTracedSuccess] = useState(false);

  const items = TRACE_ITEMS[category];
  const activeItem = items[itemIdx] || items[0];

  const speakItem = (item: TraceItem) => {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const u = new SpeechSynthesisUtterance(`${item.title}. ${item.word}`);
      if (item.lang) u.lang = item.lang;
      u.rate = 0.88;
      u.pitch = 1.08;
      window.speechSynthesis.speak(u);
    }
  };

  const drawGuideTemplate = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const w = canvas.width;
    const h = canvas.height;

    ctx.fillStyle = '#090D16';
    ctx.fillRect(0, 0, w, h);

    // Subtle handwriting 4-line notebook rulings
    const linesY = [h * 0.22, h * 0.42, h * 0.62, h * 0.82];
    linesY.forEach((ly, idx) => {
      ctx.strokeStyle =
        idx === 0 || idx === 3
          ? 'rgba(244, 63, 94, 0.28)'
          : 'rgba(56, 189, 248, 0.28)';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(24, ly);
      ctx.lineTo(w - 24, ly);
      ctx.stroke();
    });

    // Draw Large Dotted Guide Character in Center
    ctx.save();
    ctx.font = 'bold 175px Inter, sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.strokeStyle = 'rgba(148, 163, 184, 0.55)';
    ctx.fillStyle = 'rgba(30, 41, 59, 0.45)';
    ctx.lineWidth = 3;
    ctx.setLineDash([8, 8]);
    ctx.fillText(activeItem.char, w / 2, h / 2 + 8);
    ctx.strokeText(activeItem.char, w / 2, h / 2 + 8);
    ctx.restore();
  }, [activeItem]);

  useEffect(() => {
    drawGuideTemplate();
    setTracedSuccess(false);
  }, [drawGuideTemplate]);

  const getPointerPos = (
    e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>
  ) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;

    if ('touches' in e) {
      const t = e.touches[0];
      return {
        x: (t.clientX - rect.left) * scaleX,
        y: (t.clientY - rect.top) * scaleY,
      };
    }
    return {
      x: (e.clientX - rect.left) * scaleX,
      y: (e.clientY - rect.top) * scaleY,
    };
  };

  const startDraw = (
    e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>
  ) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const { x, y } = getPointerPos(e);
    setIsDrawing(true);
    ctx.beginPath();
    ctx.moveTo(x, y);
  };

  const moveDraw = (
    e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>
  ) => {
    if (!isDrawing) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const { x, y } = getPointerPos(e);
    ctx.strokeStyle = crayonColor;
    ctx.lineWidth = brushSize;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.lineTo(x, y);
    ctx.stroke();
  };

  const stopDraw = () => {
    setIsDrawing(false);
  };

  return (
    <div className="rounded-2xl bg-[#111827] border border-[#1F2937] p-4 space-y-4 shadow-lg">
      {/* Category Selector */}
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-800 pb-3">
        <div className="flex flex-wrap items-center gap-1.5">
          <Sparkles className="w-4 h-4 text-cyan-400 mr-1" />
          {(
            [
              { id: 'numbers', label: '🔢 Trace Numbers (1–10)' },
              { id: 'english', label: '🔤 Trace English (A–Z)' },
              { id: 'hindi', label: '🇮🇳 Trace Hindi (अ–अः, क–घ)' },
              { id: 'shapes', label: '🔺 Trace 2D Shapes' },
            ] as const
          ).map((cat) => (
            <button
              key={cat.id}
              type="button"
              onClick={() => {
                setCategory(cat.id);
                setItemIdx(0);
              }}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                category === cat.id
                  ? 'bg-cyan-500 text-slate-950 shadow-sm'
                  : 'bg-[#090D16] text-slate-300 border border-slate-800 hover:text-white'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        <button
          type="button"
          onClick={() => speakItem(activeItem)}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-500/20 border border-amber-400 text-xs font-extrabold text-amber-200"
        >
          <Volume2 className="w-3.5 h-3.5" />
          🔊 Speak &ldquo;{activeItem.word}&rdquo;
        </button>
      </div>

      {/* Character Strip */}
      <div className="flex flex-wrap gap-1.5">
        {items.map((it, idx) => (
          <button
            key={it.char}
            type="button"
            onClick={() => {
              setItemIdx(idx);
              speakItem(it);
            }}
            className={`px-3 py-1.5 rounded-xl font-mono text-sm font-extrabold border transition-all ${
              itemIdx === idx
                ? 'bg-cyan-500/25 border-cyan-400 text-white scale-105'
                : 'bg-[#090D16] border-slate-800 text-slate-400 hover:text-white'
            }`}
          >
            {it.char}
          </button>
        ))}
      </div>

      {/* Main Tracing Blackboard Canvas */}
      <div className="relative rounded-2xl overflow-hidden border-2 border-slate-700 bg-[#090D16]">
        <div className="flex items-center justify-between px-4 py-2 bg-[#0D1322] border-b border-slate-800">
          <div>
            <span className="text-sm font-extrabold text-white mr-2">
              {activeItem.title}
            </span>
            <span className="text-xs font-semibold text-cyan-300">
              — {activeItem.word}
            </span>
          </div>
          <span className="text-[11px] text-slate-400">
            Drag with your mouse or finger to trace over the dotted guide!
          </span>
        </div>

        <canvas
          ref={canvasRef}
          width={760}
          height={320}
          onMouseDown={startDraw}
          onMouseMove={moveDraw}
          onMouseUp={stopDraw}
          onMouseLeave={stopDraw}
          onTouchStart={startDraw}
          onTouchMove={moveDraw}
          onTouchEnd={stopDraw}
          className="w-full h-[300px] block cursor-crosshair touch-none"
        />
      </div>

      {/* Bottom Crayon Color Picker, Brush Size & Clear / Celebrate Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-3 rounded-xl bg-[#090D16] border border-slate-800">
        <div className="flex items-center gap-2">
          <Palette className="w-4 h-4 text-cyan-400" />
          <span className="text-xs font-bold text-slate-300">Crayon Color:</span>
          {CRAYON_COLORS.map((c) => (
            <button
              key={c.hex}
              type="button"
              onClick={() => setCrayonColor(c.hex)}
              title={c.name}
              style={{ backgroundColor: c.hex }}
              className={`w-7 h-7 rounded-full border-2 transition-transform ${
                crayonColor === c.hex ? 'border-white scale-125' : 'border-transparent'
              }`}
            />
          ))}
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-400">Thickness:</span>
          <input
            type="range"
            min={8}
            max={26}
            value={brushSize}
            onChange={(e) => setBrushSize(Number(e.target.value))}
            className="w-24"
          />
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={drawGuideTemplate}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-bold text-slate-200 border border-slate-700"
          >
            <Eraser className="w-3.5 h-3.5" /> Clear Slate
          </button>

          <button
            type="button"
            onClick={() => {
              setTracedSuccess(true);
              speakItem(activeItem);
            }}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-emerald-500 text-slate-950 text-xs font-extrabold hover:bg-emerald-400"
          >
            <CheckCircle2 className="w-3.5 h-3.5" />
            {tracedSuccess ? '🎉 Wonderful Tracing! ⭐' : 'I Traced It!'}
          </button>
        </div>
      </div>
    </div>
  );
};
