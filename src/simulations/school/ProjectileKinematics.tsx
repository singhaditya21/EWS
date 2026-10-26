import React, { useState, useRef } from 'react';
import { Canvas2DWrapper, CanvasRenderContext } from '../../components/engine/Canvas2DWrapper';
import { ParameterPanel } from '../../components/engine/ParameterPanel';
import { TimelineBar, PlaybackSpeed } from '../../components/engine/TimelineBar';
import { FormulaCard } from '../../components/engine/FormulaCard';

const GRAVITY_PRESETS = [
  { id: 'earth', label: 'Earth (9.8 m/s²)', g: 9.8 },
  { id: 'mars', label: 'Mars (3.71 m/s²)', g: 3.71 },
  { id: 'moon', label: 'Moon (1.62 m/s²)', g: 1.62 },
];

export const ProjectileKinematics: React.FC = () => {
  const [angleDeg, setAngleDeg] = useState(45);
  const [v0, setV0] = useState(32); // m/s
  const [launchHeight, setLaunchHeight] = useState(10); // m
  const [gravity, setGravity] = useState(9.8); // m/s^2
  const [mass, setMass] = useState(2.0); // kg
  const [isPlaying, setIsPlaying] = useState(true);
  const [speed, setSpeed] = useState<PlaybackSpeed>(1);

  const simTimeRef = useRef(0);

  const thetaRad = (angleDeg * Math.PI) / 180;
  const vx0 = v0 * Math.cos(thetaRad);
  const vy0 = v0 * Math.sin(thetaRad);

  // Total time of flight solving y(t) = h0 + vy0*t - 0.5*g*t^2 = 0
  const discriminant = vy0 * vy0 + 2 * gravity * launchHeight;
  const totalFlightTime = (vy0 + Math.sqrt(discriminant)) / gravity;
  const maxRange = vx0 * totalFlightTime;
  const maxHeight = launchHeight + (vy0 * vy0) / (2 * gravity);

  const renderProjectile = ({
    ctx,
    width,
    height,
    deltaTime,
  }: CanvasRenderContext) => {
    if (isPlaying) {
      simTimeRef.current += deltaTime;
      if (simTimeRef.current > totalFlightTime) {
        simTimeRef.current = 0;
      }
    }

    const t = Math.min(simTimeRef.current, totalFlightTime);
    const curX = vx0 * t;
    const curY = Math.max(0, launchHeight + vy0 * t - 0.5 * gravity * t * t);
    const curVy = vy0 - gravity * t;
    const curSpeed = Math.sqrt(vx0 * vx0 + curVy * curVy);

    const ke = 0.5 * mass * curSpeed * curSpeed;
    const pe = mass * gravity * curY;
    const totalE = Math.max(1, ke + pe);

    const originX = 55;
    const groundY = height - 45;
    const scaleX = Math.min((width - 210) / Math.max(maxRange, 40), 5.2);
    const scaleY = Math.min((groundY - 50) / Math.max(maxHeight, 25), 5.2);
    const scale = Math.min(scaleX, scaleY);

    // Ground line
    ctx.strokeStyle = '#334155';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(20, groundY);
    ctx.lineTo(width - 20, groundY);
    ctx.stroke();

    // Launch Tower
    if (launchHeight > 0) {
      ctx.fillStyle = '#1e293b';
      ctx.fillRect(
        originX - 12,
        groundY - launchHeight * scale,
        24,
        launchHeight * scale
      );
    }

    // Full Parabolic Trajectory Path
    ctx.strokeStyle = 'rgba(6, 182, 212, 0.45)';
    ctx.lineWidth = 2;
    ctx.setLineDash([5, 5]);
    ctx.beginPath();
    const steps = 60;
    for (let i = 0; i <= steps; i++) {
      const st = (i / steps) * totalFlightTime;
      const sx = originX + vx0 * st * scale;
      const sy =
        groundY - (launchHeight + vy0 * st - 0.5 * gravity * st * st) * scale;
      if (i === 0) ctx.moveTo(sx, sy);
      else ctx.lineTo(sx, sy);
    }
    ctx.stroke();
    ctx.setLineDash([]);

    // Current Projectile Position
    const px = originX + curX * scale;
    const py = groundY - curY * scale;

    // Velocity Vector Components (v_x and v_y)
    ctx.strokeStyle = '#10b981';
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.moveTo(px, py);
    ctx.lineTo(px + vx0 * 1.3, py);
    ctx.stroke();

    ctx.strokeStyle = '#f43f5e';
    ctx.beginPath();
    ctx.moveTo(px, py);
    ctx.lineTo(px, py - curVy * 1.3);
    ctx.stroke();

    // Projectile Sphere
    ctx.fillStyle = '#f59e0b';
    ctx.beginPath();
    ctx.arc(px, py, 8, 0, Math.PI * 2);
    ctx.fill();

    // Live KE vs PE Energy Bar Chart on Right
    const barBaseX = width - 125;
    const barBaseY = groundY - 15;
    const maxBarH = 160;

    const keH = (ke / totalE) * maxBarH;
    const peH = (pe / totalE) * maxBarH;

    ctx.fillStyle = 'rgba(17, 24, 39, 0.88)';
    ctx.fillRect(barBaseX - 18, barBaseY - maxBarH - 35, 125, maxBarH + 55);

    ctx.fillStyle = '#10b981';
    ctx.fillRect(barBaseX, barBaseY - keH, 32, keH);
    ctx.fillStyle = '#38bdf8';
    ctx.fillRect(barBaseX + 52, barBaseY - peH, 32, peH);

    ctx.fillStyle = '#e2e8f0';
    ctx.font = 'bold 10px JetBrains Mono, monospace';
    ctx.fillText('KE', barBaseX + 8, barBaseY + 14);
    ctx.fillText('PE', barBaseX + 60, barBaseY + 14);
    ctx.fillText('ENERGY (J)', barBaseX + 12, barBaseY - maxBarH - 15);

    // Top Telemetry
    ctx.fillStyle = '#38bdf8';
    ctx.font = 'bold 12px JetBrains Mono, monospace';
    ctx.fillText(
      `t = ${t.toFixed(2)}s | x = ${curX.toFixed(1)}m | y = ${curY.toFixed(1)}m | v_x = ${vx0.toFixed(1)}m/s | v_y = ${curVy.toFixed(1)}m/s`,
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
          simTimeRef.current = Math.min(
            totalFlightTime,
            simTimeRef.current + 0.1
          );
        }}
        onReset={() => {
          simTimeRef.current = 0;
        }}
        speed={speed}
        onSpeedChange={setSpeed}
        statusBadge={`Flight Time T = ${totalFlightTime.toFixed(2)} s`}
      />

      <Canvas2DWrapper
        title="2D Projectile Motion & Mechanical Energy Conservation"
        subtitle="Green vector: Horizontal velocity (v_x) • Red vector: Vertical velocity (v_y)"
        height={390}
        isPlaying={isPlaying}
        speed={speed}
        onRender={renderProjectile}
      />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <FormulaCard
          label="Maximum Height (H) & Horizontal Range (R)"
          latex="H = h_0 + \frac{v_0^2 \sin^2\theta}{2g}, \quad R = v_0 \cos\theta \cdot T_{\text{flight}}"
          liveSubstitution={`H_{\\max} = ${maxHeight.toFixed(2)}\\text{ m}, \\quad R = ${maxRange.toFixed(2)}\\text{ m}`}
        />
        <FormulaCard
          label="Conservation of Mechanical Energy"
          latex="E_{\text{total}} = KE + PE = \frac{1}{2}mv^2 + mgh = \text{constant}"
          liveSubstitution={`E_{\\text{total}} = ${(
            0.5 * mass * v0 * v0 +
            mass * gravity * launchHeight
          ).toFixed(1)}\\text{ Joules}`}
        />
      </div>

      <ParameterPanel
        title="Kinematics & Gravity Controls"
        presets={GRAVITY_PRESETS.map((gp) => ({
          id: gp.id,
          label: gp.label,
          active: Math.abs(gravity - gp.g) < 0.05,
          onSelect: () => {
            setGravity(gp.g);
            simTimeRef.current = 0;
          },
        }))}
        sliders={[
          {
            id: 'angle',
            label: 'Launch Angle (θ)',
            value: angleDeg,
            min: 10,
            max: 85,
            step: 1,
            unit: '°',
            onChange: (val) => {
              setAngleDeg(val);
              simTimeRef.current = 0;
            },
          },
          {
            id: 'v0',
            label: 'Initial Velocity (v₀)',
            value: v0,
            min: 10,
            max: 60,
            step: 1,
            unit: 'm/s',
            onChange: (val) => {
              setV0(val);
              simTimeRef.current = 0;
            },
          },
          {
            id: 'h0',
            label: 'Launch Elevation (h₀)',
            value: launchHeight,
            min: 0,
            max: 40,
            step: 2,
            unit: 'm',
            onChange: (val) => {
              setLaunchHeight(val);
              simTimeRef.current = 0;
            },
          },
          {
            id: 'mass',
            label: 'Projectile Mass (m)',
            value: mass,
            min: 0.5,
            max: 10,
            step: 0.5,
            unit: 'kg',
            onChange: setMass,
          },
        ]}
        telemetry={[
          { label: 'Max Height (H)', value: maxHeight.toFixed(1), unit: 'm', color: 'cyan' },
          { label: 'Horizontal Range (R)', value: maxRange.toFixed(1), unit: 'm', color: 'emerald' },
          { label: 'Time of Flight (T)', value: totalFlightTime.toFixed(2), unit: 's', color: 'amber' },
          { label: 'Gravity (g)', value: gravity.toFixed(2), unit: 'm/s²', color: 'violet' },
        ]}
      />
    </div>
  );
};
