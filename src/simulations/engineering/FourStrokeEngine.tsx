import React, { useState, useRef } from 'react';
import { Canvas2DWrapper, CanvasRenderContext } from '../../components/engine/Canvas2DWrapper';
import { ParameterPanel } from '../../components/engine/ParameterPanel';
import { TimelineBar, PlaybackSpeed } from '../../components/engine/TimelineBar';
import { FormulaCard } from '../../components/engine/FormulaCard';

export const FourStrokeEngine: React.FC = () => {
  const [rpm, setRpm] = useState(1800);
  const [compressionRatio, setCompressionRatio] = useState(9.5);
  const [gamma, setGamma] = useState(1.4); // Specific heat ratio Cp/Cv
  const [isPlaying, setIsPlaying] = useState(true);
  const [speed, setSpeed] = useState<PlaybackSpeed>(1);

  // Crank angle in degrees [0, 720) for 4 strokes
  const crankAngleRef = useRef(0);

  const thermalEfficiency = +((1 - 1 / Math.pow(compressionRatio, gamma - 1)) * 100).toFixed(1);

  const renderEngine = ({ ctx, width, height, deltaTime }: CanvasRenderContext) => {
    if (isPlaying) {
      // Scale angular speed for clear visual observation while proportional to RPM
      const visualDegPerSec = (rpm / 1000) * 180;
      crankAngleRef.current = (crankAngleRef.current + visualDegPerSec * deltaTime) % 720;
    }

    const deg = crankAngleRef.current;
    const rad = (deg * Math.PI) / 180;

    // Determine Stroke (0-180: Intake, 180-360: Compression, 360-540: Power/Combustion, 540-720: Exhaust)
    const strokeIdx = Math.floor(deg / 180);
    const strokeNames = [
      '1. INTAKE (Isobaric Suction)',
      '2. COMPRESSION (Isentropic)',
      '3. POWER / EXPANSION (Combustion)',
      '4. EXHAUST (Blowdown)',
    ];
    const strokeColors = ['#38bdf8', '#f59e0b', '#ef4444', '#94a3b8'];

    // Left Half: Cylinder, Piston, Connecting Rod, Crankshaft, Valves
    const cylX = width * 0.24;
    const cylTopY = 65;
    const crankCenterY = height - 95;
    const crankRadius = 42;
    const rodLength = 115;

    // Crankpin coordinates
    const pinX = cylX + Math.sin(rad) * crankRadius;
    const pinY = crankCenterY - Math.cos(rad) * crankRadius;

    // Piston wrist-pin Y coordinate using exact slider-crank kinematics
    const dx = pinX - cylX;
    const pistonY = pinY - Math.sqrt(Math.max(10, rodLength * rodLength - dx * dx));

    // Cylinder Walls
    const cylW = 96;
    ctx.strokeStyle = '#64748b';
    ctx.lineWidth = 4;
    ctx.strokeRect(cylX - cylW / 2, cylTopY, cylW, 185);

    // Combustion Chamber Gas Shading
    const chamberH = Math.max(12, pistonY - 22 - cylTopY);
    ctx.fillStyle =
      strokeIdx === 0
        ? 'rgba(56, 189, 248, 0.25)'
        : strokeIdx === 1
        ? 'rgba(245, 158, 11, 0.35)'
        : strokeIdx === 2
        ? 'rgba(239, 68, 68, 0.55)'
        : 'rgba(148, 163, 184, 0.28)';
    ctx.fillRect(cylX - cylW / 2 + 2, cylTopY + 2, cylW - 4, chamberH);

    // Spark Plug Flash near TDC at 360 deg
    if (deg >= 352 && deg <= 385) {
      ctx.fillStyle = '#fde047';
      ctx.beginPath();
      ctx.arc(cylX, cylTopY + 12, 14, 0, Math.PI * 2);
      ctx.fill();
    }

    // Intake Valve (Left) & Exhaust Valve (Right)
    const intakeLift = strokeIdx === 0 ? Math.sin(rad) * 10 : 0;
    const exhaustLift = strokeIdx === 3 ? Math.sin(rad - 3 * Math.PI) * 10 : 0;

    ctx.strokeStyle = '#38bdf8';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(cylX - 24, cylTopY - 22 + intakeLift);
    ctx.lineTo(cylX - 24, cylTopY + 4 + intakeLift);
    ctx.moveTo(cylX - 34, cylTopY + 4 + intakeLift);
    ctx.lineTo(cylX - 14, cylTopY + 4 + intakeLift);
    ctx.stroke();

    ctx.strokeStyle = '#f97316';
    ctx.beginPath();
    ctx.moveTo(cylX + 24, cylTopY - 22 + exhaustLift);
    ctx.lineTo(cylX + 24, cylTopY + 4 + exhaustLift);
    ctx.moveTo(cylX + 14, cylTopY + 4 + exhaustLift);
    ctx.lineTo(cylX + 34, cylTopY + 4 + exhaustLift);
    ctx.stroke();

    // Piston Crown & Skirt
    ctx.fillStyle = '#94a3b8';
    ctx.fillRect(cylX - cylW / 2 + 4, pistonY - 22, cylW - 8, 44);
    ctx.strokeStyle = '#1e293b';
    ctx.lineWidth = 2;
    ctx.strokeRect(cylX - cylW / 2 + 4, pistonY - 22, cylW - 8, 44);

    // Connecting Rod
    ctx.strokeStyle = '#cbd5e1';
    ctx.lineWidth = 7;
    ctx.beginPath();
    ctx.moveTo(cylX, pistonY);
    ctx.lineTo(pinX, pinY);
    ctx.stroke();

    // Crankshaft Web & Counterweight Circle
    ctx.strokeStyle = '#475569';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.arc(cylX, crankCenterY, crankRadius + 10, 0, Math.PI * 2);
    ctx.stroke();

    ctx.fillStyle = '#f59e0b';
    ctx.beginPath();
    ctx.arc(pinX, pinY, 6, 0, Math.PI * 2);
    ctx.fill();

    // Right Half: Live P-V Otto Cycle Thermodynamic Loop
    const pvX = width * 0.52;
    const pvY = 65;
    const pvW = Math.max(180, width * 0.42);
    const pvH = height - 120;

    ctx.strokeStyle = '#334155';
    ctx.lineWidth = 1.5;
    ctx.strokeRect(pvX, pvY, pvW, pvH);

    // Normalized volume vNorm in [0, 1] where 0 = TDC (V_min), 1 = BDC (V_max)
    const vNorm = (1 - Math.cos(rad)) / 2;

    const getPVPoint = (vN: number, sIdx: number) => {
      const x = pvX + 28 + vN * (pvW - 56);
      let pNorm = 0.08;
      if (sIdx === 0) {
        pNorm = 0.08; // Intake
      } else if (sIdx === 1) {
        // Adiabatic compression P * V^gamma = const
        pNorm = 0.08 + Math.pow(1 - vN, gamma) * 0.36;
      } else if (sIdx === 2) {
        // Adiabatic power expansion from peak combustion pressure
        pNorm = 0.14 + Math.pow(1 - vN, gamma * 1.1) * 0.78;
      } else {
        pNorm = 0.1; // Exhaust
      }
      const y = pvY + pvH - 24 - pNorm * (pvH - 48);
      return { x, y, pNorm };
    };

    // Trace Complete Ideal Otto Cycle Loop
    ctx.strokeStyle = 'rgba(245, 158, 11, 0.55)';
    ctx.lineWidth = 2;
    ctx.beginPath();
    for (let s = 0; s < 4; s++) {
      for (let step = 0; step <= 25; step++) {
        const frac = step / 25;
        const vn = s % 2 === 0 ? frac : 1 - frac;
        const pt = getPVPoint(vn, s);
        if (s === 0 && step === 0) ctx.moveTo(pt.x, pt.y);
        else ctx.lineTo(pt.x, pt.y);
      }
    }
    ctx.closePath();
    ctx.stroke();

    // Active State Point on P-V Diagram
    const activePt = getPVPoint(vNorm, strokeIdx);
    ctx.fillStyle = strokeColors[strokeIdx];
    ctx.beginPath();
    ctx.arc(activePt.x, activePt.y, 7, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#e2e8f0';
    ctx.font = 'bold 11px Inter, sans-serif';
    ctx.fillText('Live Pressure–Volume (P-V) Otto Cycle', pvX + 12, pvY - 8);
    ctx.font = '10px JetBrains Mono, monospace';
    ctx.fillText('V_min (TDC)', pvX + 16, pvY + pvH + 15);
    ctx.fillText('V_max (BDC)', pvX + pvW - 78, pvY + pvH + 15);

    // Top Status Readout
    ctx.fillStyle = strokeColors[strokeIdx];
    ctx.font = 'bold 12px JetBrains Mono, monospace';
    ctx.fillText(
      `STROKE: ${strokeNames[strokeIdx]} | Crank θ = ${Math.round(deg)}° | η_Otto = ${thermalEfficiency}%`,
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
          crankAngleRef.current = (crankAngleRef.current + 15) % 720;
        }}
        onReset={() => {
          crankAngleRef.current = 0;
        }}
        speed={speed}
        onSpeedChange={setSpeed}
        statusBadge={`RPM = ${rpm} | Compression Ratio r = ${compressionRatio}:1`}
      />

      <Canvas2DWrapper
        title="4-Stroke Internal Combustion Engine & Otto Cycle P-V Analyzer"
        subtitle="Synchronized slider-crank kinematics and thermodynamic Pressure-Volume state loop"
        height={395}
        isPlaying={isPlaying}
        speed={speed}
        onRender={renderEngine}
      />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <FormulaCard
          label="Air-Standard Otto Cycle Thermal Efficiency"
          latex="\eta_{\text{Otto}} = 1 - \frac{1}{r^{\gamma - 1}}, \quad r = \frac{V_{\text{BDC}}}{V_{\text{TDC}}}"
          liveSubstitution={`\\eta_{\\text{Otto}} = 1 - \\frac{1}{${compressionRatio}^{${(gamma - 1).toFixed(2)}}} = ${thermalEfficiency}\\%`}
          accentColor="amber"
        />
        <FormulaCard
          label="Mean Piston Speed & 4-Stroke Power Frequency"
          latex="\bar{U}_p = 2 \cdot S \cdot \frac{\text{RPM}}{60}, \quad f_{\text{power}} = \frac{\text{RPM}}{120}"
          liveSubstitution={`f_{\\text{power}} = ${(rpm / 120).toFixed(1)}\\text{ power strokes/sec}`}
          accentColor="amber"
        />
      </div>

      <ParameterPanel
        title="IC Engine Thermodynamic & Mechanical Controls"
        sliders={[
          {
            id: 'rpm',
            label: 'Engine Crankshaft Speed (RPM)',
            value: rpm,
            min: 600,
            max: 6000,
            step: 100,
            unit: 'RPM',
            onChange: setRpm,
          },
          {
            id: 'cr',
            label: 'Compression Ratio (r = V₁/V₂)',
            value: compressionRatio,
            min: 6.0,
            max: 14.0,
            step: 0.5,
            unit: ':1',
            onChange: setCompressionRatio,
          },
          {
            id: 'gamma',
            label: 'Adiabatic Index (γ = C_p / C_v)',
            value: gamma,
            min: 1.25,
            max: 1.67,
            step: 0.01,
            onChange: setGamma,
          },
        ]}
        telemetry={[
          { label: 'Thermal Efficiency', value: `${thermalEfficiency}`, unit: '%', color: 'amber' },
          { label: 'Compression Ratio', value: `${compressionRatio}:1`, color: 'cyan' },
          { label: 'Power Cycles/sec', value: `${(rpm / 120).toFixed(1)}`, unit: 'Hz', color: 'emerald' },
          { label: 'Crank Revolutions/Cycle', value: '2 (720°)', color: 'rose' },
        ]}
      />
    </div>
  );
};
