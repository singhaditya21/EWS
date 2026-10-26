import React, { useState, useRef } from 'react';
import { Canvas2DWrapper, CanvasRenderContext } from '../../components/engine/Canvas2DWrapper';
import { ParameterPanel } from '../../components/engine/ParameterPanel';
import { FormulaCard } from '../../components/engine/FormulaCard';
import { Scale, Flame } from 'lucide-react';

type MiddleMode = 'levers' | 'matter-states';
type LeverClass = 'Class I' | 'Class II' | 'Class III';

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  homeX: number;
  homeY: number;
}

export const MiddleMachinesMatter: React.FC<{ initialMode?: string }> = ({
  initialMode,
}) => {
  const [mode, setMode] = useState<MiddleMode>(
    (initialMode as MiddleMode) || 'levers'
  );

  // Mode 1: Lever states
  const [leverClass, setLeverClass] = useState<LeverClass>('Class I');
  const [loadForce, setLoadForce] = useState(120); // N
  const [loadArm, setLoadArm] = useState(1.2); // m
  const [effortArm, setEffortArm] = useState(2.4); // m
  const [appliedEffort, setAppliedEffort] = useState(60); // N

  // Mode 2: Kinetic Theory of Matter states
  const [temperature, setTemperature] = useState(25); // -40°C to 140°C

  const particlesRef = useRef<Particle[]>([]);
  if (particlesRef.current.length === 0) {
    const cols = 8;
    const rows = 5;
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        const hx = 75 + c * 32;
        const hy = 195 + r * 28;
        particlesRef.current.push({
          x: hx,
          y: hy,
          vx: (Math.random() - 0.5) * 40,
          vy: (Math.random() - 0.5) * 40,
          homeX: hx,
          homeY: hy,
        });
      }
    }
  }

  // Physics calculations for Lever
  const mechanicalAdvantage = +(effortArm / loadArm).toFixed(2);
  const idealEffort = +(loadForce / mechanicalAdvantage).toFixed(1);
  const loadTorque = +(loadForce * loadArm).toFixed(1);
  const effortTorque = +(appliedEffort * effortArm).toFixed(1);
  const netTorque = effortTorque - loadTorque;
  const tiltAngleRad = Math.max(-0.28, Math.min(0.28, netTorque / 350));

  const renderLevers = ({ ctx, width, height }: CanvasRenderContext) => {
    const cx = width * 0.5;
    const cy = height * 0.56;
    const scaleM = Math.min(width * 0.12, 85); // pixels per meter

    let fulcrumX = cx;
    let loadX = cx - loadArm * scaleM;
    let effortX = cx + effortArm * scaleM;

    if (leverClass === 'Class II') {
      // Fulcrum at left end, Load in middle, Effort at right
      fulcrumX = cx - 150;
      loadX = fulcrumX + loadArm * scaleM;
      effortX = fulcrumX + Math.max(effortArm, loadArm + 0.3) * scaleM;
    } else if (leverClass === 'Class III') {
      // Fulcrum at left end, Effort in middle, Load at right
      fulcrumX = cx - 150;
      effortX = fulcrumX + effortArm * scaleM;
      loadX = fulcrumX + Math.max(loadArm, effortArm + 0.3) * scaleM;
    }

    ctx.save();
    ctx.translate(fulcrumX, cy);
    ctx.rotate(leverClass === 'Class I' ? tiltAngleRad : -tiltAngleRad * 0.6);

    // Draw Rigid Lever Beam
    const leftExtent = leverClass === 'Class I' ? -effortArm * scaleM - 70 : -20;
    const rightExtent =
      leverClass === 'Class I'
        ? effortArm * scaleM + 70
        : Math.max(loadArm, effortArm) * scaleM + 45;

    ctx.fillStyle = '#334155';
    ctx.strokeStyle = '#94a3b8';
    ctx.lineWidth = 2;
    ctx.fillRect(leftExtent, -8, rightExtent - leftExtent, 16);
    ctx.strokeRect(leftExtent, -8, rightExtent - leftExtent, 16);

    // Relative positions from fulcrum
    const relLoadX = loadX - fulcrumX;
    const relEffortX = effortX - fulcrumX;

    // Load Block & Downward Vector
    ctx.fillStyle = '#f43f5e';
    ctx.fillRect(relLoadX - 24, -52, 48, 44);
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 11px JetBrains Mono, monospace';
    ctx.textAlign = 'center';
    ctx.fillText(`L=${loadForce}N`, relLoadX, -26);

    // Effort Vector Arrow
    const effortUp = leverClass !== 'Class I';
    ctx.strokeStyle = '#06b6d4';
    ctx.fillStyle = '#06b6d4';
    ctx.lineWidth = 3.5;
    ctx.beginPath();
    if (effortUp) {
      ctx.moveTo(relEffortX, 55);
      ctx.lineTo(relEffortX, 12);
    } else {
      ctx.moveTo(relEffortX, -65);
      ctx.lineTo(relEffortX, -12);
    }
    ctx.stroke();
    ctx.fillText(
      `E=${appliedEffort}N`,
      relEffortX,
      effortUp ? 72 : -72
    );

    ctx.restore();

    // Draw Fulcrum Triangle
    ctx.fillStyle = '#f59e0b';
    ctx.beginPath();
    ctx.moveTo(fulcrumX, cy + 8);
    ctx.lineTo(fulcrumX - 24, cy + 48);
    ctx.lineTo(fulcrumX + 24, cy + 48);
    ctx.closePath();
    ctx.fill();
    ctx.fillStyle = '#fde047';
    ctx.font = 'bold 11px Inter, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('FULCRUM (F)', fulcrumX, cy + 64);

    // Status Banner
    const isBalanced = Math.abs(netTorque) < 5;
    ctx.fillStyle = isBalanced ? '#10b981' : '#38bdf8';
    ctx.font = 'bold 13px JetBrains Mono, monospace';
    ctx.textAlign = 'left';
    ctx.fillText(
      `${leverClass} Lever | MA = ${mechanicalAdvantage} | ${
        isBalanced
          ? 'ROTATIONAL EQUILIBRIUM (τ_net ≈ 0)'
          : `Net Torque = ${netTorque.toFixed(1)} N·m`
      }`,
      20,
      32
    );
  };

  const renderMatterStates = ({
    ctx,
    width,
    height,
    deltaTime,
    elapsedTime,
  }: CanvasRenderContext) => {
    const phase =
      temperature < 0
        ? 'SOLID (Crystalline Lattice)'
        : temperature < 100
        ? 'LIQUID (Cohesive Fluid Flow)'
        : 'GAS (High-Velocity Kinetic Collisions)';

    // Left Chamber: Molecular Particle Box
    const boxX = 35;
    const boxY = 55;
    const boxW = Math.min(310, width * 0.46);
    const boxH = height - 95;

    ctx.strokeStyle = '#475569';
    ctx.lineWidth = 2.5;
    ctx.strokeRect(boxX, boxY, boxW, boxH);

    const speedFactor = Math.max(0.15, (temperature + 60) / 40);

    particlesRef.current.forEach((p, idx) => {
      if (temperature < 0) {
        // Solid lattice vibration around home coordinates
        const amp = 1.5 + ((temperature + 50) / 50) * 3.5;
        p.x = boxX + 35 + (idx % 8) * 32 + Math.sin(elapsedTime * 16 + idx) * amp;
        p.y =
          boxY +
          boxH -
          35 -
          Math.floor(idx / 8) * 28 +
          Math.cos(elapsedTime * 15 + idx * 2) * amp;
      } else if (temperature < 100) {
        // Liquid motion in lower 65% of container
        p.x += p.vx * deltaTime * speedFactor * 1.4;
        p.y += p.vy * deltaTime * speedFactor * 1.4 + 0.35;
        const topLimit = boxY + boxH * 0.38;
        if (p.x < boxX + 12 || p.x > boxX + boxW - 12) p.vx *= -1;
        if (p.y < topLimit || p.y > boxY + boxH - 12) p.vy *= -1;
        p.x = Math.max(boxX + 12, Math.min(boxX + boxW - 12, p.x));
        p.y = Math.max(topLimit, Math.min(boxY + boxH - 12, p.y));
      } else {
        // Gas motion across entire container
        p.x += p.vx * deltaTime * speedFactor * 3.5;
        p.y += p.vy * deltaTime * speedFactor * 3.5;
        if (p.x < boxX + 12 || p.x > boxX + boxW - 12) p.vx *= -1;
        if (p.y < boxY + 12 || p.y > boxY + boxH - 12) p.vy *= -1;
        p.x = Math.max(boxX + 12, Math.min(boxX + boxW - 12, p.x));
        p.y = Math.max(boxY + 12, Math.min(boxY + boxH - 12, p.y));
      }

      ctx.fillStyle =
        temperature < 0 ? '#38bdf8' : temperature < 100 ? '#06b6d4' : '#f43f5e';
      ctx.beginPath();
      ctx.arc(p.x, p.y, 7.5, 0, Math.PI * 2);
      ctx.fill();
    });

    // Right Graph: Heating & Latent Heat Phase Curve
    const gx = boxX + boxW + 45;
    const gy = boxY + 15;
    const gw = Math.max(180, width - gx - 30);
    const gh = boxH - 30;

    if (gw > 120) {
      ctx.strokeStyle = '#334155';
      ctx.lineWidth = 1.5;
      ctx.strokeRect(gx, gy, gw, gh);

      // Phase curve path: Solid rise -> 0°C Latent heat of fusion plateau -> Liquid rise -> 100°C Latent heat of vaporization -> Gas
      ctx.strokeStyle = '#f59e0b';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(gx + 10, gy + gh - 20);
      ctx.lineTo(gx + gw * 0.22, gy + gh * 0.68); // 0°C melting start
      ctx.lineTo(gx + gw * 0.4, gy + gh * 0.68); // Latent heat of fusion
      ctx.lineTo(gx + gw * 0.68, gy + gh * 0.28); // 100°C boiling start
      ctx.lineTo(gx + gw * 0.86, gy + gh * 0.28); // Latent heat of vaporization
      ctx.lineTo(gx + gw - 10, gy + 20);
      ctx.stroke();

      // Current Temperature Marker on Curve
      const normT = (temperature + 50) / 200; // 0 to 1
      const markerX = gx + 10 + normT * (gw - 20);
      const markerY = gy + gh - 20 - normT * (gh - 40);
      ctx.fillStyle = '#10b981';
      ctx.beginPath();
      ctx.arc(markerX, markerY, 6, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = '#cbd5e1';
      ctx.font = 'bold 11px Inter, sans-serif';
      ctx.fillText('Heating Curve & Latent Heat Plateaus', gx + 10, gy - 6);
      ctx.font = '10px JetBrains Mono, monospace';
      ctx.fillText('0°C Melting (ΔH_fus)', gx + gw * 0.2, gy + gh * 0.64);
      ctx.fillText('100°C Boiling (ΔH_vap)', gx + gw * 0.58, gy + gh * 0.24);
    }

    ctx.fillStyle = '#38bdf8';
    ctx.font = 'bold 12px JetBrains Mono, monospace';
    ctx.fillText(`STATE: ${phase} | T = ${temperature}°C (${temperature + 273} K)`, boxX, 30);
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-2 p-2.5 rounded-xl bg-[#111827] border border-[#1F2937]">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setMode('levers')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              mode === 'levers'
                ? 'bg-cyan-500 text-slate-950'
                : 'bg-[#090D16] text-slate-300 border border-slate-800'
            }`}
          >
            <Scale className="w-3.5 h-3.5" />
            Physics: Simple Machines & Levers (Class I, II, III)
          </button>
          <button
            type="button"
            onClick={() => setMode('matter-states')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              mode === 'matter-states'
                ? 'bg-cyan-500 text-slate-950'
                : 'bg-[#090D16] text-slate-300 border border-slate-800'
            }`}
          >
            <Flame className="w-3.5 h-3.5" />
            Chemistry: Kinetic Theory & States of Matter
          </button>
        </div>

        {mode === 'levers' && (
          <div className="flex items-center gap-1">
            {(['Class I', 'Class II', 'Class III'] as LeverClass[]).map((lc) => (
              <button
                key={lc}
                type="button"
                onClick={() => {
                  setLeverClass(lc);
                  if (lc === 'Class II') {
                    setLoadArm(1.0);
                    setEffortArm(2.4);
                  } else if (lc === 'Class III') {
                    setEffortArm(1.0);
                    setLoadArm(2.4);
                  }
                }}
                className={`px-2.5 py-1 rounded text-xs font-mono font-semibold border ${
                  leverClass === lc
                    ? 'bg-amber-500/20 border-amber-400 text-amber-300'
                    : 'bg-slate-900 border-slate-800 text-slate-400'
                }`}
              >
                {lc}
              </button>
            ))}
          </div>
        )}
      </div>

      {mode === 'levers' ? (
        <>
          <Canvas2DWrapper
            title={`Simple Machines — ${leverClass} Lever & Torque Equilibrium`}
            subtitle="Principle of Moments: Effort × Effort Arm = Load × Load Arm"
            height={370}
            onRender={renderLevers}
          />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <FormulaCard
              label="Mechanical Advantage (MA)"
              latex="\\text{MA} = \\frac{\\text{Load } (L)}{\\text{Effort } (E)} = \\frac{\\text{Effort Arm } (d_E)}{\\text{Load Arm } (d_L)}"
              liveSubstitution={`\\text{MA} = \\frac{${effortArm}\\text{ m}}{${loadArm}\\text{ m}} = ${mechanicalAdvantage}`}
            />
            <FormulaCard
              label="Principle of Moments (Rotational Equilibrium)"
              latex="\\tau_{\\text{net}} = (E \\times d_E) - (L \\times d_L) = 0"
              liveSubstitution={`\\tau_{\\text{net}} = (${appliedEffort}\\times ${effortArm}) - (${loadForce}\\times ${loadArm}) = ${netTorque.toFixed(1)}\\text{ N}\\cdot\\text{m}`}
            />
          </div>

          <ParameterPanel
            title="Lever Arm & Force Controls"
            sliders={[
              {
                id: 'load',
                label: 'Load Force (L)',
                value: loadForce,
                min: 20,
                max: 250,
                step: 10,
                unit: 'N',
                onChange: setLoadForce,
              },
              {
                id: 'effort',
                label: 'Applied Effort (E)',
                value: appliedEffort,
                min: 10,
                max: 250,
                step: 5,
                unit: 'N',
                onChange: setAppliedEffort,
              },
              {
                id: 'loadArm',
                label: 'Load Arm Distance (d_L)',
                value: loadArm,
                min: 0.5,
                max: 3.0,
                step: 0.1,
                unit: 'm',
                onChange: setLoadArm,
              },
              {
                id: 'effortArm',
                label: 'Effort Arm Distance (d_E)',
                value: effortArm,
                min: 0.5,
                max: 3.0,
                step: 0.1,
                unit: 'm',
                onChange: setEffortArm,
              },
            ]}
            telemetry={[
              { label: 'Mechanical Advantage', value: `${mechanicalAdvantage}`, color: 'cyan' },
              { label: 'Ideal Balance Effort', value: `${idealEffort}`, unit: 'N', color: 'emerald' },
              { label: 'Load Moment', value: `${loadTorque}`, unit: 'N·m', color: 'rose' },
              { label: 'Effort Moment', value: `${effortTorque}`, unit: 'N·m', color: 'amber' },
            ]}
          />
        </>
      ) : (
        <>
          <Canvas2DWrapper
            title="Kinetic Molecular Theory of Matter & Phase Transitions"
            subtitle="Observe intermolecular spacing, kinetic energy (3/2 k_B T), and latent heat plateaus"
            height={380}
            onRender={renderMatterStates}
          />

          <ParameterPanel
            title="Thermal Energy & Phase Control"
            presets={[
              {
                id: 'solid',
                label: 'Ice / Solid (-30°C)',
                active: temperature < 0,
                onSelect: () => setTemperature(-30),
              },
              {
                id: 'liquid',
                label: 'Liquid Water (35°C)',
                active: temperature >= 0 && temperature < 100,
                onSelect: () => setTemperature(35),
              },
              {
                id: 'gas',
                label: 'Superheated Steam (130°C)',
                active: temperature >= 100,
                onSelect: () => setTemperature(130),
              },
            ]}
            sliders={[
              {
                id: 'temp',
                label: 'System Temperature (T)',
                value: temperature,
                min: -50,
                max: 150,
                step: 2,
                unit: '°C',
                onChange: setTemperature,
              },
            ]}
            telemetry={[
              { label: 'Absolute Temp', value: `${temperature + 273.15}`, unit: 'K', color: 'cyan' },
              {
                label: 'Phase State',
                value: temperature < 0 ? 'Solid' : temperature < 100 ? 'Liquid' : 'Gas',
                color: 'emerald',
              },
              {
                label: 'Intermolecular Force',
                value: temperature < 0 ? 'Strongest' : temperature < 100 ? 'Moderate' : 'Negligible',
                color: 'amber',
              },
              {
                label: 'Mean Kinetic Energy',
                value: `${((temperature + 273.15) * 0.0207).toFixed(2)}`,
                unit: 'kJ/mol',
                color: 'rose',
              },
            ]}
          />
        </>
      )}
    </div>
  );
};
