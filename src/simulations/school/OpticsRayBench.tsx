import React, { useState } from 'react';
import { Canvas2DWrapper, CanvasRenderContext } from '../../components/engine/Canvas2DWrapper';
import { ParameterPanel } from '../../components/engine/ParameterPanel';
import { FormulaCard } from '../../components/engine/FormulaCard';
import { Eye } from 'lucide-react';

type OpticElement = 'convex-lens' | 'concave-lens' | 'concave-mirror' | 'convex-mirror';

export const OpticsRayBench: React.FC = () => {
  const [element, setElement] = useState<OpticElement>('convex-lens');
  const [objectDistMag, setObjectDistMag] = useState(180); // |u| in cm (u is negative by Cartesian sign convention)
  const [focalLengthMag, setFocalLengthMag] = useState(90); // |f| in cm
  const [objectHeight, setObjectHeight] = useState(65); // h_o in cm
  const [refractiveIndex, setRefractiveIndex] = useState(1.52);

  // Cartesian Sign Convention: Object is placed on the left, so u = -objectDistMag
  const u = -objectDistMag;
  const isLens = element === 'convex-lens' || element === 'concave-lens';
  const f =
    element === 'convex-lens' || element === 'convex-mirror'
      ? focalLengthMag
      : -focalLengthMag;

  // Lens formula: 1/v - 1/u = 1/f => 1/v = 1/f + 1/u
  // Mirror formula: 1/v + 1/u = 1/f => 1/v = 1/f - 1/u
  const invV = isLens ? 1 / f + 1 / u : 1 / f - 1 / u;
  const v = Math.abs(invV) < 1e-5 ? 9999 : 1 / invV;
  const magnification = isLens ? v / u : -v / u;
  const imageHeight = objectHeight * magnification;
  const powerDioptres = +((100 / f)).toFixed(2);

  const isReal = isLens ? v > 0 : v < 0;

  const renderOptics = ({ ctx, width, height }: CanvasRenderContext) => {
    const cx = width * 0.5;
    const cy = height * 0.52;
    const scale = Math.min(width / 560, 1.15);

    // Principal Axis
    ctx.strokeStyle = '#475569';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(15, cy);
    ctx.lineTo(width - 15, cy);
    ctx.stroke();

    // Draw Optical Element at (cx, cy)
    ctx.save();
    ctx.strokeStyle = '#38bdf8';
    ctx.fillStyle = 'rgba(56, 189, 248, 0.16)';
    ctx.lineWidth = 2.5;

    if (element === 'convex-lens') {
      ctx.beginPath();
      ctx.ellipse(cx, cy, 14, 115, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
    } else if (element === 'concave-lens') {
      ctx.beginPath();
      ctx.moveTo(cx - 16, cy - 115);
      ctx.quadraticCurveTo(cx - 4, cy, cx - 16, cy + 115);
      ctx.lineTo(cx + 16, cy + 115);
      ctx.quadraticCurveTo(cx + 4, cy, cx + 16, cy - 115);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
    } else if (element === 'concave-mirror') {
      ctx.beginPath();
      ctx.arc(cx - 180, cy, 180, -0.58, 0.58);
      ctx.stroke();
    } else {
      ctx.beginPath();
      ctx.arc(cx + 180, cy, 180, Math.PI - 0.58, Math.PI + 0.58);
      ctx.stroke();
    }
    ctx.restore();

    // Mark F, 2F on both sides
    const fPx = focalLengthMag * scale;
    const marks = [
      { label: '2F₁', x: cx - 2 * fPx },
      { label: 'F₁', x: cx - fPx },
      { label: 'O', x: cx },
      { label: 'F₂', x: cx + fPx },
      { label: '2F₂', x: cx + 2 * fPx },
    ];
    ctx.fillStyle = '#94a3b8';
    ctx.font = 'bold 11px JetBrains Mono, monospace';
    ctx.textAlign = 'center';
    marks.forEach((m) => {
      ctx.beginPath();
      ctx.arc(m.x, cy, 3.5, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillText(m.label, m.x, cy + 18);
    });

    // Object Arrow at u
    const objX = cx + u * scale;
    const objTopY = cy - objectHeight * scale;

    ctx.strokeStyle = '#10b981';
    ctx.fillStyle = '#10b981';
    ctx.lineWidth = 3.5;
    ctx.beginPath();
    ctx.moveTo(objX, cy);
    ctx.lineTo(objX, objTopY);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(objX, objTopY);
    ctx.lineTo(objX - 6, objTopY + 10);
    ctx.lineTo(objX + 6, objTopY + 10);
    ctx.closePath();
    ctx.fill();
    ctx.fillText('Object (AB)', objX, objTopY - 10);

    // Image position & Principal Rays
    if (Math.abs(v) < 2500) {
      const imgX = cx + v * scale;
      const imgTopY = cy - imageHeight * scale;

      // Ray 1: Parallel to principal axis -> through focus
      ctx.strokeStyle = '#f59e0b';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(objX, objTopY);
      ctx.lineTo(cx, objTopY);
      ctx.lineTo(imgX, imgTopY);
      ctx.stroke();

      // Ray 2: Through Optical Center O / Pole P
      ctx.strokeStyle = '#ec4899';
      ctx.beginPath();
      ctx.moveTo(objX, objTopY);
      ctx.lineTo(cx, cy);
      ctx.lineTo(imgX, imgTopY);
      ctx.stroke();

      // Draw Image Arrow (Solid for Real, Dashed for Virtual)
      ctx.save();
      if (!isReal) {
        ctx.setLineDash([5, 4]);
      }
      ctx.strokeStyle = '#38bdf8';
      ctx.fillStyle = '#38bdf8';
      ctx.lineWidth = 3.5;
      ctx.beginPath();
      ctx.moveTo(imgX, cy);
      ctx.lineTo(imgX, imgTopY);
      ctx.stroke();
      ctx.restore();

      ctx.fillStyle = '#38bdf8';
      ctx.fillText(
        `${isReal ? 'Real' : 'Virtual'} Image (A'B')`,
        imgX,
        imgTopY + (imageHeight >= 0 ? -10 : 18)
      );
    }

    // HUD Summary
    ctx.fillStyle = '#e2e8f0';
    ctx.font = 'bold 12px JetBrains Mono, monospace';
    ctx.textAlign = 'left';
    ctx.fillText(
      `u = ${u} cm | f = ${f} cm | v = ${v.toFixed(1)} cm | m = ${magnification.toFixed(2)}x | n = ${refractiveIndex}`,
      18,
      28
    );
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-2 p-2.5 rounded-xl bg-[#111827] border border-[#1F2937]">
        <span className="text-xs font-bold uppercase tracking-wider text-cyan-400 flex items-center gap-1.5 mr-1">
          <Eye className="w-4 h-4" />
          Optical Bench Mode:
        </span>
        {(
          [
            { id: 'convex-lens', label: 'Convex (Converging) Lens' },
            { id: 'concave-lens', label: 'Concave (Diverging) Lens' },
            { id: 'concave-mirror', label: 'Concave Mirror' },
            { id: 'convex-mirror', label: 'Convex Mirror' },
          ] as { id: OpticElement; label: string }[]
        ).map((item) => (
          <button
            key={item.id}
            type="button"
            onClick={() => setElement(item.id)}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              element === item.id
                ? 'bg-cyan-500 text-slate-950'
                : 'bg-[#090D16] text-slate-300 border border-slate-800 hover:text-white'
            }`}
          >
            {item.label}
          </button>
        ))}
      </div>

      <Canvas2DWrapper
        title="Geometric Optics Ray-Tracing Bench"
        subtitle="Real-time Gaussian lens/mirror equation solver with principal ray paths"
        height={390}
        onRender={renderOptics}
      />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <FormulaCard
          label={isLens ? 'Gaussian Thin Lens Equation' : 'Spherical Mirror Equation'}
          latex={
            isLens
              ? '\\frac{1}{f} = \\frac{1}{v} - \\frac{1}{u}'
              : '\\frac{1}{f} = \\frac{1}{v} + \\frac{1}{u}'
          }
          liveSubstitution={`v = ${v.toFixed(1)}\\text{ cm},\\quad P = \\frac{100}{f} = ${powerDioptres}\\text{ D}`}
        />
        <FormulaCard
          label="Lateral Magnification (m)"
          latex={
            isLens
              ? 'm = \\frac{h_i}{h_o} = \\frac{v}{u}'
              : 'm = \\frac{h_i}{h_o} = -\\frac{v}{u}'
          }
          liveSubstitution={`m = ${magnification.toFixed(2)}\\times \\implies h_i = ${imageHeight.toFixed(1)}\\text{ cm}`}
        />
      </div>

      <ParameterPanel
        title="Optical Bench Parameters"
        sliders={[
          {
            id: 'u',
            label: 'Object Distance |u|',
            value: objectDistMag,
            min: 40,
            max: 260,
            step: 5,
            unit: 'cm',
            onChange: setObjectDistMag,
          },
          {
            id: 'f',
            label: 'Focal Length Magnitude |f|',
            value: focalLengthMag,
            min: 45,
            max: 140,
            step: 5,
            unit: 'cm',
            onChange: setFocalLengthMag,
          },
          {
            id: 'ho',
            label: 'Object Height (h_o)',
            value: objectHeight,
            min: 25,
            max: 95,
            step: 5,
            unit: 'cm',
            onChange: setObjectHeight,
          },
          {
            id: 'n',
            label: 'Glass Refractive Index (n)',
            value: refractiveIndex,
            min: 1.33,
            max: 1.9,
            step: 0.01,
            onChange: setRefractiveIndex,
          },
        ]}
        telemetry={[
          { label: 'Image Distance (v)', value: v.toFixed(1), unit: 'cm', color: 'cyan' },
          { label: 'Magnification (m)', value: `${magnification.toFixed(2)}x`, color: 'emerald' },
          { label: 'Optical Power (P)', value: `${powerDioptres}`, unit: 'D', color: 'amber' },
          {
            label: 'Image Nature',
            value: `${isReal ? 'Real & Inverted' : 'Virtual & Erect'}`,
            color: 'violet',
          },
        ]}
      />
    </div>
  );
};
