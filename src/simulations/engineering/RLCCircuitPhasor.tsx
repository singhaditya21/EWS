import React, { useState, useRef } from 'react';
import { Canvas2DWrapper, CanvasRenderContext } from '../../components/engine/Canvas2DWrapper';
import { ParameterPanel } from '../../components/engine/ParameterPanel';
import { TimelineBar, PlaybackSpeed } from '../../components/engine/TimelineBar';
import { FormulaCard } from '../../components/engine/FormulaCard';

export const RLCCircuitPhasor: React.FC = () => {
  const [resistance, setResistance] = useState(40); // Ohms
  const [inductanceMilli, setInductanceMilli] = useState(120); // mH
  const [capacitanceMicro, setCapacitanceMicro] = useState(65); // uF
  const [frequency, setFrequency] = useState(50); // Hz
  const [isPlaying, setIsPlaying] = useState(true);
  const [speed, setSpeed] = useState<PlaybackSpeed>(1);

  const phaseAngleRef = useRef(0);

  const L = inductanceMilli / 1000;
  const C = capacitanceMicro / 1e6;
  const omega = 2 * Math.PI * frequency;
  const xL = omega * L;
  const xC = 1 / (omega * C);
  const netReactance = xL - xC;
  const impedance = Math.sqrt(resistance * resistance + netReactance * netReactance);
  const phiRad = Math.atan2(netReactance, resistance);
  const phiDeg = (phiRad * 180) / Math.PI;
  const powerFactor = Math.cos(phiRad);
  const resonanceFreq = 1 / (2 * Math.PI * Math.sqrt(L * C));

  const vPeak = 100; // V
  const iPeak = vPeak / impedance;

  const renderRLC = ({ ctx, width, height, deltaTime }: CanvasRenderContext) => {
    if (isPlaying) {
      phaseAngleRef.current = (phaseAngleRef.current + deltaTime * 2.8) % (Math.PI * 2);
    }
    const wt = phaseAngleRef.current;

    // Left Half: Rotating Phasor Diagram
    const cx = width * 0.24;
    const cy = height * 0.54;
    const maxRadius = Math.min(width * 0.18, 115);

    // Reference Circle
    ctx.strokeStyle = '#1e293b';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.arc(cx, cy, maxRadius, 0, Math.PI * 2);
    ctx.stroke();

    // Axes
    ctx.beginPath();
    ctx.moveTo(cx - maxRadius - 15, cy);
    ctx.lineTo(cx + maxRadius + 15, cy);
    ctx.moveTo(cx, cy - maxRadius - 15);
    ctx.lineTo(cx, cy + maxRadius + 15);
    ctx.stroke();

    const drawPhasor = (angle: number, magNorm: number, color: string, label: string) => {
      const r = Math.min(maxRadius, Math.max(18, magNorm * maxRadius));
      const ex = cx + Math.cos(angle) * r;
      const ey = cy - Math.sin(angle) * r;
      ctx.strokeStyle = color;
      ctx.fillStyle = color;
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(cx, cy);
      ctx.lineTo(ex, ey);
      ctx.stroke();
      ctx.beginPath();
      ctx.arc(ex, ey, 4, 0, Math.PI * 2);
      ctx.fill();
      ctx.font = 'bold 11px JetBrains Mono, monospace';
      ctx.fillText(label, ex + 6, ey - 4);
    };

    // Current Phasor I at angle wt
    drawPhasor(wt, 0.75, '#10b981', 'I(t)');
    // V_R in phase with I
    drawPhasor(wt, (iPeak * resistance) / vPeak, '#38bdf8', 'V_R');
    // V_L leads I by +90 deg
    drawPhasor(wt + Math.PI / 2, (iPeak * xL) / (vPeak * 1.4), '#f59e0b', 'V_L');
    // V_C lags I by -90 deg
    drawPhasor(wt - Math.PI / 2, (iPeak * xC) / (vPeak * 1.4), '#ec4899', 'V_C');
    // V_total at angle (wt + phiRad)
    drawPhasor(wt + phiRad, 0.95, '#f8fafc', 'V_total');

    // Right Half: Dual-Channel Scrolling Oscilloscope (V(t) vs I(t))
    const oscX = width * 0.48;
    const oscY = 60;
    const oscW = width - oscX - 25;
    const oscH = height - 105;
    const midY = oscY + oscH / 2;

    ctx.strokeStyle = '#334155';
    ctx.lineWidth = 1.5;
    ctx.strokeRect(oscX, oscY, oscW, oscH);

    ctx.beginPath();
    ctx.moveTo(oscX, midY);
    ctx.lineTo(oscX + oscW, midY);
    ctx.stroke();

    // Plot Source Voltage V(t) = V_peak sin(wt + x + phi)
    ctx.strokeStyle = '#f8fafc';
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    for (let px = 0; px <= oscW; px += 3) {
      const angle = wt + (px / oscW) * Math.PI * 4 + phiRad;
      const y = midY - Math.sin(angle) * (oscH * 0.38);
      if (px === 0) ctx.moveTo(oscX + px, y);
      else ctx.lineTo(oscX + px, y);
    }
    ctx.stroke();

    // Plot Circuit Current I(t) = I_peak sin(wt + x)
    ctx.strokeStyle = '#10b981';
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    const currentAmp = Math.min(0.42, (iPeak / 3.0) * 0.38);
    for (let px = 0; px <= oscW; px += 3) {
      const angle = wt + (px / oscW) * Math.PI * 4;
      const y = midY - Math.sin(angle) * (oscH * currentAmp);
      if (px === 0) ctx.moveTo(oscX + px, y);
      else ctx.lineTo(oscX + px, y);
    }
    ctx.stroke();

    ctx.fillStyle = '#e2e8f0';
    ctx.font = 'bold 11px Inter, sans-serif';
    ctx.fillText('Dual-Channel Oscilloscope: White = V(t), Green = I(t)', oscX + 10, oscY - 8);

    // Top HUD
    const regime =
      Math.abs(phiDeg) < 2
        ? 'RESONANCE (Purely Resistive)'
        : phiDeg > 0
        ? 'INDUCTIVE (Voltage Leads Current)'
        : 'CAPACITIVE (Current Leads Voltage)';
    ctx.fillStyle = '#38bdf8';
    ctx.font = 'bold 12px JetBrains Mono, monospace';
    ctx.fillText(
      `Z = ${impedance.toFixed(1)} Ω | φ = ${phiDeg.toFixed(1)}° | PF = ${powerFactor.toFixed(3)} | ${regime}`,
      20,
      28
    );
  };

  return (
    <div className="space-y-4">
      <TimelineBar
        isPlaying={isPlaying}
        onTogglePlay={() => setIsPlaying((p) => !p)}
        onStepForward={() => {
          phaseAngleRef.current += 0.2;
        }}
        onReset={() => {
          phaseAngleRef.current = 0;
        }}
        speed={speed}
        onSpeedChange={setSpeed}
        statusBadge={`Resonance f₀ = ${resonanceFreq.toFixed(1)} Hz`}
      />

      <Canvas2DWrapper
        title="Series RLC AC Circuit — Rotating Phasor Domain & Oscilloscope"
        subtitle="Compare inductive reactance (X_L = ωL) and capacitive reactance (X_C = 1/ωC)"
        height={390}
        isPlaying={isPlaying}
        speed={speed}
        onRender={renderRLC}
      />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <FormulaCard
          label="Total AC Impedance & Phase Angle"
          latex="Z = \sqrt{R^2 + (X_L - X_C)^2}, \quad \tan\phi = \frac{X_L - X_C}{R}"
          liveSubstitution={`X_L = ${xL.toFixed(1)}\\,\\Omega,\\; X_C = ${xC.toFixed(1)}\\,\\Omega \\implies Z = ${impedance.toFixed(1)}\\,\\Omega`}
          accentColor="amber"
        />
        <FormulaCard
          label="Electrical Resonance Frequency (X_L = X_C)"
          latex="f_0 = \frac{1}{2\pi\sqrt{LC}}, \quad \text{Power Factor} = \cos\phi = \frac{R}{Z}"
          liveSubstitution={`f_0 = ${resonanceFreq.toFixed(2)}\\text{ Hz},\\quad \\cos\\phi = ${powerFactor.toFixed(3)}`}
          accentColor="amber"
        />
      </div>

      <ParameterPanel
        title="RLC Circuit Component & Frequency Controls"
        presets={[
          {
            id: 'tune-resonance',
            label: `Tune to Resonance (${resonanceFreq.toFixed(0)} Hz)`,
            active: Math.abs(frequency - resonanceFreq) < 1.5,
            onSelect: () => setFrequency(Math.round(resonanceFreq)),
          },
          {
            id: 'inductive',
            label: 'Inductive Load (f = 90 Hz)',
            onSelect: () => setFrequency(90),
          },
          {
            id: 'capacitive',
            label: 'Capacitive Load (f = 25 Hz)',
            onSelect: () => setFrequency(25),
          },
        ]}
        sliders={[
          {
            id: 'r',
            label: 'Resistance (R)',
            value: resistance,
            min: 10,
            max: 120,
            step: 5,
            unit: 'Ω',
            onChange: setResistance,
          },
          {
            id: 'l',
            label: 'Inductance (L)',
            value: inductanceMilli,
            min: 20,
            max: 300,
            step: 10,
            unit: 'mH',
            onChange: setInductanceMilli,
          },
          {
            id: 'c',
            label: 'Capacitance (C)',
            value: capacitanceMicro,
            min: 15,
            max: 150,
            step: 5,
            unit: 'μF',
            onChange: setCapacitanceMicro,
          },
          {
            id: 'f',
            label: 'AC Source Frequency (f)',
            value: frequency,
            min: 15,
            max: 120,
            step: 1,
            unit: 'Hz',
            onChange: setFrequency,
          },
        ]}
        telemetry={[
          { label: 'Impedance (Z)', value: impedance.toFixed(1), unit: 'Ω', color: 'amber' },
          { label: 'Phase Shift (φ)', value: `${phiDeg.toFixed(1)}°`, color: 'cyan' },
          { label: 'Power Factor', value: powerFactor.toFixed(3), color: 'emerald' },
          { label: 'Peak Current (I₀)', value: iPeak.toFixed(2), unit: 'A', color: 'rose' },
        ]}
      />
    </div>
  );
};
