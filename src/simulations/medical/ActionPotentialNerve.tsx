import React, { useState, useRef } from 'react';
import { Canvas2DWrapper, CanvasRenderContext } from '../../components/engine/Canvas2DWrapper';
import { ParameterPanel } from '../../components/engine/ParameterPanel';
import { FormulaCard } from '../../components/engine/FormulaCard';
import { Zap } from 'lucide-react';

export const ActionPotentialNerve: React.FC = () => {
  const [stimulusMv, setStimulusMv] = useState(-50); // Threshold is -55 mV
  const [extracellularNa, setExtracellularNa] = useState(145); // mM
  const [intracellularK, setIntracellularK] = useState(140); // mM
  const [pulseTimeMs, setPulseTimeMs] = useState(2.2); // ms along the 0–5 ms action potential trace

  const autoCursorRef = useRef(0);

  const thresholdCrossed = stimulusMv >= -55;

  // Compute membrane potential V_m(t) in mV for t in [0, 5] ms
  const computeVmAtTime = (tMs: number) => {
    if (!thresholdCrossed) {
      // Sub-threshold local electrotonic potential that decays back to -70 mV
      const bump = (stimulusMv - -70) * Math.exp(-Math.pow((tMs - 1.2) / 0.45, 2));
      return -70 + bump;
    }
    // Full All-or-None Action Potential
    if (tMs < 0.8) return -70;
    if (tMs < 1.3) {
      // Threshold approach
      return -70 + ((tMs - 0.8) / 0.5) * 15;
    }
    if (tMs < 2.1) {
      // Rapid Na+ Depolarization up to +35 mV
      const s = (tMs - 1.3) / 0.8;
      return -55 + Math.sin((s * Math.PI) / 2) * 90;
    }
    if (tMs < 3.4) {
      // K+ Efflux Repolarization down to -82 mV (Hyperpolarization / Undershoot)
      const s = (tMs - 2.1) / 1.3;
      return 35 - s * 117;
    }
    // Recovery via Na+/K+ ATPase pump back to -70 mV
    const s = Math.min(1, (tMs - 3.4) / 1.6);
    return -82 + s * 12;
  };

  const currentVm = computeVmAtTime(pulseTimeMs);
  const naChannelOpen = thresholdCrossed && pulseTimeMs >= 1.2 && pulseTimeMs <= 2.2;
  const kChannelOpen = thresholdCrossed && pulseTimeMs >= 2.1 && pulseTimeMs <= 3.7;

  // Equilibrium Nernst Potentials at 37°C
  const eNa = +(61.5 * Math.log10(extracellularNa / 12)).toFixed(1);
  const eK = +(61.5 * Math.log10(4 / intracellularK)).toFixed(1);

  const renderMembraneAndAP = ({
    ctx,
    width,
    height,
    deltaTime,
  }: CanvasRenderContext) => {
    autoCursorRef.current = (autoCursorRef.current + deltaTime * 1.1) % 5.0;

    // Left Side: Axonal Phospholipid Bilayer & Voltage-Gated Ion Channels
    const memX = 25;
    const memW = width * 0.44;
    const bilayerY = height * 0.52;

    // Extracellular Fluid Label (Top) & Axoplasm (Bottom)
    ctx.fillStyle = '#38bdf8';
    ctx.font = 'bold 11px Inter, sans-serif';
    ctx.fillText(`EXTRACELLULAR FLUID ([Na⁺]ₒ = ${extracellularNa} mM)`, memX, bilayerY - 75);
    ctx.fillStyle = '#a855f7';
    ctx.fillText(`INTRACELLULAR AXOPLASM ([K⁺]ᵢ = ${intracellularK} mM)`, memX, bilayerY + 95);

    // Draw Phospholipid Bilayer Heads & Tails
    ctx.fillStyle = '#64748b';
    for (let x = memX; x < memX + memW; x += 16) {
      if (Math.abs(x - (memX + memW * 0.3)) < 26 || Math.abs(x - (memX + memW * 0.72)) < 26) {
        continue; // Leave gaps for Na+ and K+ channels
      }
      ctx.beginPath();
      ctx.arc(x, bilayerY - 18, 5, 0, Math.PI * 2);
      ctx.arc(x, bilayerY + 18, 5, 0, Math.PI * 2);
      ctx.fill();
    }

    // 1. Voltage-Gated Na+ Channel
    const naX = memX + memW * 0.3;
    ctx.fillStyle = naChannelOpen ? '#10b981' : '#334155';
    ctx.fillRect(naX - 24, bilayerY - 32, 16, 64);
    ctx.fillRect(naX + 8, bilayerY - 32, 16, 64);
    ctx.fillStyle = '#e2e8f0';
    ctx.font = 'bold 10px JetBrains Mono, monospace';
    ctx.fillText(
      `Na⁺ Gate: ${naChannelOpen ? 'OPEN (Influx)' : 'CLOSED'}`,
      naX - 38,
      bilayerY - 40
    );

    if (naChannelOpen) {
      ctx.strokeStyle = '#10b981';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(naX, bilayerY - 55);
      ctx.lineTo(naX, bilayerY + 55);
      ctx.stroke();
    }

    // 2. Voltage-Gated K+ Channel
    const kX = memX + memW * 0.72;
    ctx.fillStyle = kChannelOpen ? '#f59e0b' : '#334155';
    ctx.fillRect(kX - 24, bilayerY - 32, 16, 64);
    ctx.fillRect(kX + 8, bilayerY - 32, 16, 64);
    ctx.fillStyle = '#e2e8f0';
    ctx.fillText(
      `K⁺ Gate: ${kChannelOpen ? 'OPEN (Efflux)' : 'CLOSED'}`,
      kX - 38,
      bilayerY - 40
    );

    if (kChannelOpen) {
      ctx.strokeStyle = '#f59e0b';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(kX, bilayerY + 55);
      ctx.lineTo(kX, bilayerY - 55);
      ctx.stroke();
    }

    // Right Side: Membrane Potential (mV vs ms) Oscilloscope Graph
    const gx = width * 0.51;
    const gy = 55;
    const gw = width - gx - 25;
    const gh = height - 95;

    ctx.strokeStyle = '#334155';
    ctx.lineWidth = 1.5;
    ctx.strokeRect(gx, gy, gw, gh);

    const mvToY = (mv: number) => {
      // Map [-90, +45] mV to [gy + gh - 15, gy + 15]
      const norm = (mv - -90) / 135;
      return gy + gh - 15 - norm * (gh - 30);
    };

    // Threshold Line (-55 mV) & Resting Line (-70 mV)
    ctx.strokeStyle = 'rgba(244, 63, 94, 0.5)';
    ctx.setLineDash([4, 4]);
    ctx.beginPath();
    ctx.moveTo(gx, mvToY(-55));
    ctx.lineTo(gx + gw, mvToY(-55));
    ctx.stroke();
    ctx.setLineDash([]);
    ctx.fillStyle = '#f43f5e';
    ctx.fillText('Threshold (-55 mV)', gx + 8, mvToY(-55) - 5);

    // Action Potential Curve
    ctx.strokeStyle = thresholdCrossed ? '#10b981' : '#f59e0b';
    ctx.lineWidth = 3;
    ctx.beginPath();
    for (let px = 0; px <= gw; px += 2) {
      const t = (px / gw) * 5.0;
      const y = mvToY(computeVmAtTime(t));
      if (px === 0) ctx.moveTo(gx + px, y);
      else ctx.lineTo(gx + px, y);
    }
    ctx.stroke();

    // Active Time Marker Dot at pulseTimeMs
    const markerX = gx + (pulseTimeMs / 5.0) * gw;
    const markerY = mvToY(currentVm);
    ctx.fillStyle = '#38bdf8';
    ctx.beginPath();
    ctx.arc(markerX, markerY, 6.5, 0, Math.PI * 2);
    ctx.fill();

    // Top Readout
    ctx.fillStyle = '#10b981';
    ctx.font = 'bold 12px JetBrains Mono, monospace';
    ctx.fillText(
      `V_m(t=${pulseTimeMs.toFixed(1)}ms) = ${currentVm.toFixed(1)} mV | ${
        thresholdCrossed
          ? 'ALL-OR-NONE ACTION POTENTIAL FIRED'
          : 'SUB-THRESHOLD GRADED POTENTIAL (Failed to reach -55 mV)'
      }`,
      20,
      26
    );
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-2 p-2.5 rounded-xl bg-[#111827] border border-[#1F2937]">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => {
              setStimulusMv(-45);
              setPulseTimeMs(1.8);
            }}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              thresholdCrossed
                ? 'bg-emerald-500 text-slate-950'
                : 'bg-[#090D16] text-slate-300 border border-slate-800'
            }`}
          >
            <Zap className="w-3.5 h-3.5" />
            Fire Suprathreshold Stimulus (-45 mV → Action Potential)
          </button>
          <button
            type="button"
            onClick={() => {
              setStimulusMv(-62);
              setPulseTimeMs(1.2);
            }}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              !thresholdCrossed
                ? 'bg-amber-500 text-slate-950'
                : 'bg-[#090D16] text-slate-300 border border-slate-800'
            }`}
          >
            Apply Sub-Threshold Stimulus (-62 mV → Graded Decay)
          </button>
        </div>
      </div>

      <Canvas2DWrapper
        title="Neuronal Action Potential & Voltage-Gated Na⁺ / K⁺ Channel Kinetics"
        subtitle="Hodgkin-Huxley membrane excitability: Resting (-70 mV) → Threshold (-55 mV) → Peak (+35 mV)"
        height={390}
        onRender={renderMembraneAndAP}
      />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <FormulaCard
          label="Nernst Equilibrium Potential (at 37°C)"
          latex="E_X = \frac{RT}{zF}\ln\frac{[X]_{\text{out}}}{[X]_{\text{in}}} \approx \frac{61.5\text{ mV}}{z}\log_{10}\frac{[X]_{\text{out}}}{[X]_{\text{in}}}"
          liveSubstitution={`E_{\\text{Na}^+} = +${eNa}\\text{ mV}, \\quad E_{\\text{K}^+} = ${eK}\\text{ mV}`}
          accentColor="emerald"
        />
        <FormulaCard
          label="Na⁺/K⁺-ATPase Electrogenic Pump Stoichiometry"
          latex="3\,\text{Na}^+_{\text{in}} + 2\,\text{K}^+_{\text{out}} + \text{ATP} \longrightarrow 3\,\text{Na}^+_{\text{out}} + 2\,\text{K}^+_{\text{in}} + \text{ADP} + \text{P}_i"
          liveSubstitution={`V_m(${pulseTimeMs.toFixed(1)}\\text{ ms}) = ${currentVm.toFixed(1)}\\text{ mV}`}
          accentColor="emerald"
        />
      </div>

      <ParameterPanel
        title="Axonal Membrane & Ion Concentration Controls"
        sliders={[
          {
            id: 't',
            label: 'Action Potential Time Cursor (t)',
            value: pulseTimeMs,
            min: 0.2,
            max: 4.8,
            step: 0.1,
            unit: 'ms',
            onChange: setPulseTimeMs,
          },
          {
            id: 'stim',
            label: 'Depolarizing Stimulus Level',
            value: stimulusMv,
            min: -68,
            max: -35,
            step: 1,
            unit: 'mV',
            onChange: setStimulusMv,
          },
          {
            id: 'na',
            label: 'Extracellular [Na⁺]ₒ',
            value: extracellularNa,
            min: 100,
            max: 180,
            step: 5,
            unit: 'mM',
            onChange: setExtracellularNa,
          },
          {
            id: 'k',
            label: 'Intracellular [K⁺]ᵢ',
            value: intracellularK,
            min: 100,
            max: 170,
            step: 5,
            unit: 'mM',
            onChange: setIntracellularK,
          },
        ]}
        telemetry={[
          { label: 'Membrane V_m', value: currentVm.toFixed(1), unit: 'mV', color: 'emerald' },
          { label: 'Na⁺ Equilibrium', value: `+${eNa}`, unit: 'mV', color: 'cyan' },
          { label: 'K⁺ Equilibrium', value: `${eK}`, unit: 'mV', color: 'amber' },
          {
            label: 'Refractory State',
            value:
              pulseTimeMs >= 1.2 && pulseTimeMs <= 2.4
                ? 'Absolute'
                : pulseTimeMs > 2.4 && pulseTimeMs <= 4.0
                ? 'Relative'
                : 'Excitable',
            color: 'rose',
          },
        ]}
      />
    </div>
  );
};
