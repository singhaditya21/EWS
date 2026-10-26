import React, { useState } from 'react';
import { Canvas2DWrapper, CanvasRenderContext } from '../../components/engine/Canvas2DWrapper';
import { ParameterPanel } from '../../components/engine/ParameterPanel';
import { FormulaCard } from '../../components/engine/FormulaCard';

type CalcFuncId = 'parabola' | 'cubic' | 'sine' | 'exp';

interface CalcFuncSpec {
  id: CalcFuncId;
  label: string;
  latex: string;
  f: (x: number) => number;
  df: (x: number) => number;
  antideriv: (x: number) => number;
}

const FUNCTIONS: Record<CalcFuncId, CalcFuncSpec> = {
  parabola: {
    id: 'parabola',
    label: 'f(x) = 0.25x²',
    latex: 'f(x) = 0.25x^2, \\quad f\'(x) = 0.5x',
    f: (x) => 0.25 * x * x,
    df: (x) => 0.5 * x,
    antideriv: (x) => (0.25 * x * x * x) / 3,
  },
  cubic: {
    id: 'cubic',
    label: 'f(x) = 0.15(x³ - 4x) + 1.5',
    latex: 'f(x) = 0.15(x^3 - 4x) + 1.5, \\quad f\'(x) = 0.45x^2 - 0.6',
    f: (x) => 0.15 * (x * x * x - 4 * x) + 1.5,
    df: (x) => 0.45 * x * x - 0.6,
    antideriv: (x) => 0.15 * ((x ** 4) / 4 - 2 * x * x) + 1.5 * x,
  },
  sine: {
    id: 'sine',
    label: 'f(x) = 1.5 sin(x) + 1.8',
    latex: 'f(x) = 1.5\\sin(x) + 1.8, \\quad f\'(x) = 1.5\\cos(x)',
    f: (x) => 1.5 * Math.sin(x) + 1.8,
    df: (x) => 1.5 * Math.cos(x),
    antideriv: (x) => -1.5 * Math.cos(x) + 1.8 * x,
  },
  exp: {
    id: 'exp',
    label: 'f(x) = 0.6 e^(0.4x)',
    latex: 'f(x) = 0.6e^{0.4x}, \\quad f\'(x) = 0.24e^{0.4x}',
    f: (x) => 0.6 * Math.exp(0.4 * x),
    df: (x) => 0.24 * Math.exp(0.4 * x),
    antideriv: (x) => (0.6 / 0.4) * Math.exp(0.4 * x),
  },
};

export const CalculusVisualizer: React.FC = () => {
  const [funcId, setFuncId] = useState<CalcFuncId>('parabola');
  const [x0, setX0] = useState(1.6);
  const [deltaX, setDeltaX] = useState(0.8);
  const [partitions, setPartitions] = useState(14);
  const [boundA, setBoundA] = useState(-2.0);
  const [boundB, setBoundB] = useState(3.0);

  const fn = FUNCTIONS[funcId];
  const y0 = fn.f(x0);
  const exactDeriv = fn.df(x0);
  const secantSlope = (fn.f(x0 + deltaX) - y0) / Math.max(0.01, deltaX);

  // Compute Riemann Midpoint Sum & Exact Definite Integral on [a, b]
  const a = Math.min(boundA, boundB - 0.5);
  const b = Math.max(boundB, a + 0.5);
  const dx = (b - a) / partitions;
  let riemannSum = 0;
  for (let i = 0; i < partitions; i++) {
    const midX = a + (i + 0.5) * dx;
    riemannSum += fn.f(midX) * dx;
  }
  const exactIntegral = fn.antideriv(b) - fn.antideriv(a);

  const renderCalculus = ({ ctx, width, height }: CanvasRenderContext) => {
    const originX = width * 0.45;
    const originY = height * 0.72;
    const scaleX = Math.min(width / 9.5, 65);
    const scaleY = Math.min(height / 6.5, 58);

    const toScreenX = (x: number) => originX + x * scaleX;
    const toScreenY = (y: number) => originY - y * scaleY;

    // Coordinate Axes
    ctx.strokeStyle = '#475569';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(20, originY);
    ctx.lineTo(width - 20, originY);
    ctx.moveTo(originX, 20);
    ctx.lineTo(originX, height - 20);
    ctx.stroke();

    // 1. Draw Riemann Integral Partition Rectangles on [a, b]
    ctx.fillStyle = 'rgba(6, 182, 212, 0.22)';
    ctx.strokeStyle = 'rgba(6, 182, 212, 0.65)';
    ctx.lineWidth = 1;
    for (let i = 0; i < partitions; i++) {
      const rx = a + i * dx;
      const midY = fn.f(rx + 0.5 * dx);
      const sx = toScreenX(rx);
      const sw = dx * scaleX;
      const sy = toScreenY(Math.max(0, midY));
      const sh = Math.abs(midY) * scaleY;
      ctx.fillRect(sx, midY >= 0 ? sy : originY, sw, sh);
      ctx.strokeRect(sx, midY >= 0 ? sy : originY, sw, sh);
    }

    // 2. Plot Smooth Function Curve y = f(x)
    ctx.strokeStyle = '#38bdf8';
    ctx.lineWidth = 3;
    ctx.beginPath();
    for (let px = -4.5; px <= 4.8; px += 0.05) {
      const sx = toScreenX(px);
      const sy = toScreenY(fn.f(px));
      if (px === -4.5) ctx.moveTo(sx, sy);
      else ctx.lineTo(sx, sy);
    }
    ctx.stroke();

    // 3. Secant Line through (x0, f(x0)) and (x0 + Δx, f(x0 + Δx))
    ctx.strokeStyle = '#f59e0b';
    ctx.lineWidth = 1.8;
    ctx.setLineDash([5, 4]);
    ctx.beginPath();
    ctx.moveTo(toScreenX(x0 - 1.5), toScreenY(y0 - 1.5 * secantSlope));
    ctx.lineTo(toScreenX(x0 + 2.0), toScreenY(y0 + 2.0 * secantSlope));
    ctx.stroke();
    ctx.setLineDash([]);

    // 4. Exact Tangent Line at x0 with slope dy/dx = f'(x0)
    ctx.strokeStyle = '#10b981';
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.moveTo(toScreenX(x0 - 1.6), toScreenY(y0 - 1.6 * exactDeriv));
    ctx.lineTo(toScreenX(x0 + 1.6), toScreenY(y0 + 1.6 * exactDeriv));
    ctx.stroke();

    // Point P(x0, f(x0))
    ctx.fillStyle = '#10b981';
    ctx.beginPath();
    ctx.arc(toScreenX(x0), toScreenY(y0), 6, 0, Math.PI * 2);
    ctx.fill();

    // Point Q(x0 + Δx, f(x0 + Δx))
    ctx.fillStyle = '#f59e0b';
    ctx.beginPath();
    ctx.arc(
      toScreenX(x0 + deltaX),
      toScreenY(fn.f(x0 + deltaX)),
      5,
      0,
      Math.PI * 2
    );
    ctx.fill();

    // HUD Readout
    ctx.fillStyle = '#f8fafc';
    ctx.font = 'bold 12px JetBrains Mono, monospace';
    ctx.fillText(
      `x₀ = ${x0.toFixed(2)} | Tangent dy/dx = ${exactDeriv.toFixed(3)} | Secant Δy/Δx = ${secantSlope.toFixed(3)} | Riemann Area (N=${partitions}) = ${riemannSum.toFixed(3)}`,
      20,
      28
    );
  };

  return (
    <div className="space-y-4">
      <Canvas2DWrapper
        title="Differential & Integral Calculus Interactive Visualizer"
        subtitle="Green line: Instantaneous Tangent (dy/dx) • Amber dashed: Secant Line (Δy/Δx) • Cyan bars: Riemann Integral"
        height={390}
        onRender={renderCalculus}
      />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <FormulaCard
          label="First Principles Derivative (Limit of Secant)"
          latex="\frac{dy}{dx} = \lim_{\Delta x \to 0} \frac{f(x_0 + \Delta x) - f(x_0)}{\Delta x}"
          liveSubstitution={`f'(${x0.toFixed(2)}) = ${exactDeriv.toFixed(3)}, \\quad \\frac{\\Delta y}{\\Delta x} = ${secantSlope.toFixed(3)}`}
        />
        <FormulaCard
          label="Fundamental Theorem of Calculus & Riemann Sum"
          latex="\int_a^b f(x)\,dx = \lim_{N \to \infty} \sum_{i=1}^N f(x_i^*)\,\Delta x = F(b) - F(a)"
          liveSubstitution={`\\sum_{i=1}^{${partitions}} = ${riemannSum.toFixed(4)} \\approx \\int_{${a.toFixed(1)}}^{${b.toFixed(1)}} = ${exactIntegral.toFixed(4)}`}
        />
      </div>

      <ParameterPanel
        title="Calculus Function, Tangent & Riemann Controls"
        presets={(Object.keys(FUNCTIONS) as CalcFuncId[]).map((id) => ({
          id,
          label: FUNCTIONS[id].label,
          active: funcId === id,
          onSelect: () => setFuncId(id),
        }))}
        sliders={[
          {
            id: 'x0',
            label: 'Tangent Point (x₀)',
            value: x0,
            min: -3.0,
            max: 3.0,
            step: 0.1,
            onChange: setX0,
          },
          {
            id: 'dx',
            label: 'Secant Step (Δx → 0)',
            value: deltaX,
            min: 0.05,
            max: 2.0,
            step: 0.05,
            onChange: setDeltaX,
          },
          {
            id: 'n',
            label: 'Riemann Sub-Intervals (N)',
            value: partitions,
            min: 4,
            max: 80,
            step: 2,
            onChange: setPartitions,
          },
          {
            id: 'b',
            label: 'Upper Integral Bound (b)',
            value: boundB,
            min: 0.5,
            max: 3.8,
            step: 0.1,
            onChange: setBoundB,
          },
        ]}
        telemetry={[
          { label: 'Exact Slope f\'(x₀)', value: exactDeriv.toFixed(3), color: 'emerald' },
          { label: 'Secant Slope Δy/Δx', value: secantSlope.toFixed(3), color: 'amber' },
          { label: 'Riemann Sum Area', value: riemannSum.toFixed(4), color: 'cyan' },
          {
            label: 'Approximation Error',
            value: `${Math.abs(exactIntegral - riemannSum).toFixed(4)}`,
            color: 'rose',
          },
        ]}
      />
    </div>
  );
};
