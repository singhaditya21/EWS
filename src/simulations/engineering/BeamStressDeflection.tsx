import React, { useState } from 'react';
import { Canvas2DWrapper, CanvasRenderContext } from '../../components/engine/Canvas2DWrapper';
import { ParameterPanel } from '../../components/engine/ParameterPanel';
import { FormulaCard } from '../../components/engine/FormulaCard';

type BeamSupportType = 'simply-supported' | 'cantilever';

export const BeamStressDeflection: React.FC = () => {
  const [supportType, setSupportType] = useState<BeamSupportType>('simply-supported');
  const [loadP, setLoadP] = useState(40); // kN
  const [beamLength, setBeamLength] = useState(8.0); // m
  const [loadPosRatio, setLoadPosRatio] = useState(0.5); // a/L in [0.15, 0.95]
  const [youngsModulus, setYoungsModulus] = useState(200); // GPa (Structural Steel = 200 GPa)

  const a = +(beamLength * loadPosRatio).toFixed(2);
  const b = +(beamLength - a).toFixed(2);

  // Moment of inertia I = 8.0e-5 m^4 for standard I-beam section
  const I = 8.0e-5;
  const EI_kNm2 = youngsModulus * 1e6 * I; // kN * m^2

  // Reactions, Max Bending Moment, and Max Deflection
  const rA =
    supportType === 'simply-supported' ? (loadP * b) / beamLength : loadP;
  const rB =
    supportType === 'simply-supported' ? (loadP * a) / beamLength : 0;

  const maxMoment =
    supportType === 'simply-supported'
      ? (loadP * a * b) / beamLength
      : loadP * a;

  // Approximate maximum deflection in mm
  const maxDeflectionMm =
    supportType === 'simply-supported'
      ? ((loadP * a * b * (beamLength * beamLength - a * a - b * b)) /
          (6 * EI_kNm2 * beamLength)) *
        1000
      : ((loadP * a * a * (3 * beamLength - a)) / (6 * EI_kNm2)) * 1000;

  const renderBeamSFDAndBMD = ({ ctx, width, height }: CanvasRenderContext) => {
    const leftX = 75;
    const rightX = width - 65;
    const spanPx = rightX - leftX;
    const loadX = leftX + loadPosRatio * spanPx;

    // 1. Top Section: Elastic Deflected Beam with Stress Heatmap
    const beamY = 85;
    ctx.strokeStyle = '#334155';
    ctx.setLineDash([4, 4]);
    ctx.beginPath();
    ctx.moveTo(leftX, beamY);
    ctx.lineTo(rightX, beamY);
    ctx.stroke();
    ctx.setLineDash([]);

    // Draw Deflected Beam Curve in segments with Von Mises Stress Heatmap
    const segs = 48;
    ctx.lineWidth = 10;
    for (let i = 0; i < segs; i++) {
      const s0 = i / segs;
      const s1 = (i + 1) / segs;
      const getDeflectPx = (s: number) => {
        const visualAmp = Math.min(38, maxDeflectionMm * 1.4);
        if (supportType === 'simply-supported') {
          return Math.sin(s * Math.PI) * visualAmp;
        }
        return Math.pow(s, 1.8) * visualAmp;
      };
      const getStressRatio = (s: number) => {
        if (supportType === 'simply-supported') {
          return s <= loadPosRatio
            ? s / Math.max(0.05, loadPosRatio)
            : (1 - s) / Math.max(0.05, 1 - loadPosRatio);
        }
        return s <= loadPosRatio ? 1 - s / Math.max(0.05, loadPosRatio) : 0;
      };

      const stress = Math.max(0, Math.min(1, getStressRatio(s0)));
      const r = Math.round(56 + stress * 195);
      const g = Math.round(189 - stress * 120);
      const bl = Math.round(248 - stress * 190);
      ctx.strokeStyle = `rgb(${r}, ${g}, ${bl})`;

      ctx.beginPath();
      ctx.moveTo(leftX + s0 * spanPx, beamY + getDeflectPx(s0));
      ctx.lineTo(leftX + s1 * spanPx, beamY + getDeflectPx(s1));
      ctx.stroke();
    }

    // Supports
    ctx.fillStyle = '#94a3b8';
    if (supportType === 'simply-supported') {
      // Pin at Left, Roller at Right
      ctx.beginPath();
      ctx.moveTo(leftX, beamY + 6);
      ctx.lineTo(leftX - 12, beamY + 24);
      ctx.lineTo(leftX + 12, beamY + 24);
      ctx.closePath();
      ctx.fill();

      ctx.beginPath();
      ctx.moveTo(rightX, beamY + 6);
      ctx.lineTo(rightX - 12, beamY + 24);
      ctx.lineTo(rightX + 12, beamY + 24);
      ctx.closePath();
      ctx.fill();
    } else {
      // Fixed Cantilever Wall at Left
      ctx.fillStyle = '#475569';
      ctx.fillRect(leftX - 14, beamY - 32, 14, 64);
    }

    // Point Load Vector Arrow P
    ctx.strokeStyle = '#f43f5e';
    ctx.fillStyle = '#f43f5e';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(loadX, beamY - 48);
    ctx.lineTo(loadX, beamY - 8);
    ctx.stroke();
    ctx.font = 'bold 11px JetBrains Mono, monospace';
    ctx.textAlign = 'center';
    ctx.fillText(`P = ${loadP} kN (a=${a}m)`, loadX, beamY - 54);

    // 2. Middle Section: Shear Force Diagram (SFD)
    const sfdY = 215;
    ctx.strokeStyle = '#475569';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(leftX, sfdY);
    ctx.lineTo(rightX, sfdY);
    ctx.stroke();

    const sfdScale = 0.7;
    ctx.fillStyle = 'rgba(6, 182, 212, 0.25)';
    ctx.strokeStyle = '#06b6d4';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(leftX, sfdY);
    ctx.lineTo(leftX, sfdY - rA * sfdScale);
    ctx.lineTo(loadX, sfdY - rA * sfdScale);
    if (supportType === 'simply-supported') {
      ctx.lineTo(loadX, sfdY + rB * sfdScale);
      ctx.lineTo(rightX, sfdY + rB * sfdScale);
    } else {
      ctx.lineTo(loadX, sfdY);
    }
    ctx.lineTo(rightX, sfdY);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = '#06b6d4';
    ctx.textAlign = 'left';
    ctx.fillText(`SFD (+${rA.toFixed(1)} kN / -${rB.toFixed(1)} kN)`, leftX, sfdY - 42);

    // 3. Bottom Section: Bending Moment Diagram (BMD)
    const bmdY = 335;
    ctx.strokeStyle = '#475569';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(leftX, bmdY);
    ctx.lineTo(rightX, bmdY);
    ctx.stroke();

    const mPeakPx = Math.min(55, maxMoment * 0.45);
    ctx.fillStyle = 'rgba(245, 158, 11, 0.25)';
    ctx.strokeStyle = '#f59e0b';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(leftX, bmdY);
    if (supportType === 'simply-supported') {
      ctx.lineTo(loadX, bmdY - mPeakPx);
      ctx.lineTo(rightX, bmdY);
    } else {
      ctx.lineTo(leftX, bmdY + mPeakPx);
      ctx.lineTo(loadX, bmdY);
    }
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = '#f59e0b';
    ctx.fillText(
      `BMD (|M_max| = ${maxMoment.toFixed(1)} kN·m)`,
      leftX,
      bmdY - 38
    );

    // Top HUD
    ctx.fillStyle = '#e2e8f0';
    ctx.font = 'bold 12px JetBrains Mono, monospace';
    ctx.fillText(
      `R_A = ${rA.toFixed(1)} kN | R_B = ${rB.toFixed(1)} kN | |M_max| = ${maxMoment.toFixed(1)} kN·m | δ_max = ${maxDeflectionMm.toFixed(2)} mm`,
      20,
      26
    );
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-2 p-2.5 rounded-xl bg-[#111827] border border-[#1F2937]">
        <button
          type="button"
          onClick={() => setSupportType('simply-supported')}
          className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
            supportType === 'simply-supported'
              ? 'bg-amber-500 text-slate-950'
              : 'bg-[#090D16] text-slate-300 border border-slate-800'
          }`}
        >
          Simply Supported Beam (Pin + Roller)
        </button>
        <button
          type="button"
          onClick={() => setSupportType('cantilever')}
          className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
            supportType === 'cantilever'
              ? 'bg-amber-500 text-slate-950'
              : 'bg-[#090D16] text-slate-300 border border-slate-800'
          }`}
        >
          Fixed-Free Cantilever Beam
        </button>
      </div>

      <Canvas2DWrapper
        title="Structural Beam Deflection, Stress Heatmap, SFD & BMD Analyzer"
        subtitle="Euler-Bernoulli beam theory: d²y/dx² = M(x)/(EI)"
        height={395}
        onRender={renderBeamSFDAndBMD}
      />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <FormulaCard
          label="Euler-Bernoulli Flexure & Bending Stress Formula"
          latex="\frac{\sigma}{y} = \frac{M}{I} = \frac{E}{R}, \quad EI\frac{d^2v}{dx^2} = M(x)"
          liveSubstitution={`|M_{\\max}| = ${maxMoment.toFixed(2)}\\text{ kN}\\cdot\\text{m}, \\quad \\delta_{\\max} = ${maxDeflectionMm.toFixed(2)}\\text{ mm}`}
          accentColor="amber"
        />
        <FormulaCard
          label="Differential Shear-Moment Relation"
          latex="V(x) = \frac{dM(x)}{dx}, \quad \Delta M = \int_{x_1}^{x_2} V(x)\,dx"
          liveSubstitution={`R_A = ${rA.toFixed(1)}\\text{ kN}, \\quad R_B = ${rB.toFixed(1)}\\text{ kN}`}
          accentColor="amber"
        />
      </div>

      <ParameterPanel
        title="Structural Load & Material Stiffness Controls"
        presets={[
          {
            id: 'steel',
            label: 'Structural Steel (E = 200 GPa)',
            active: youngsModulus === 200,
            onSelect: () => setYoungsModulus(200),
          },
          {
            id: 'aluminium',
            label: '6061 Aluminium (E = 69 GPa)',
            active: youngsModulus === 69,
            onSelect: () => setYoungsModulus(69),
          },
          {
            id: 'titanium',
            label: 'Ti-6Al-4V Alloy (E = 114 GPa)',
            active: youngsModulus === 114,
            onSelect: () => setYoungsModulus(114),
          },
        ]}
        sliders={[
          {
            id: 'load',
            label: 'Applied Point Load (P)',
            value: loadP,
            min: 10,
            max: 120,
            step: 5,
            unit: 'kN',
            onChange: setLoadP,
          },
          {
            id: 'pos',
            label: 'Normalized Load Position (a / L)',
            value: loadPosRatio,
            min: 0.15,
            max: 0.9,
            step: 0.05,
            onChange: setLoadPosRatio,
          },
          {
            id: 'len',
            label: 'Beam Span Length (L)',
            value: beamLength,
            min: 4.0,
            max: 12.0,
            step: 0.5,
            unit: 'm',
            onChange: setBeamLength,
          },
          {
            id: 'e',
            label: "Young's Modulus (E)",
            value: youngsModulus,
            min: 50,
            max: 250,
            step: 5,
            unit: 'GPa',
            onChange: setYoungsModulus,
          },
        ]}
        telemetry={[
          { label: 'Max Bending Moment', value: maxMoment.toFixed(1), unit: 'kN·m', color: 'amber' },
          { label: 'Peak Deflection (δ)', value: maxDeflectionMm.toFixed(2), unit: 'mm', color: 'rose' },
          { label: 'Left Reaction (R_A)', value: rA.toFixed(1), unit: 'kN', color: 'cyan' },
          { label: 'Right Reaction (R_B)', value: rB.toFixed(1), unit: 'kN', color: 'emerald' },
        ]}
      />
    </div>
  );
};
