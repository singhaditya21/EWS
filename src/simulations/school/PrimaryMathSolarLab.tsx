import React, { useState, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Html } from '@react-three/drei';
import * as THREE from 'three';
import { Scene3DWrapper } from '../../components/engine/Scene3DWrapper';
import { Canvas2DWrapper, CanvasRenderContext } from '../../components/engine/Canvas2DWrapper';
import { ParameterPanel } from '../../components/engine/ParameterPanel';
import { FormulaCard } from '../../components/engine/FormulaCard';
import { Calculator, Globe, CloudRain, PieChart } from 'lucide-react';

type PrimarySubMode = 'abacus-fractions' | 'solar-3d' | 'water-cycle';

const PLANETS = [
  { name: 'Mercury', radius: 0.16, dist: 1.5, speed: 2.2, color: '#94a3b8', period: '88d' },
  { name: 'Venus', radius: 0.24, dist: 2.2, speed: 1.6, color: '#fbbf24', period: '225d' },
  { name: 'Earth', radius: 0.28, dist: 3.1, speed: 1.1, color: '#38bdf8', period: '365d' },
  { name: 'Mars', radius: 0.21, dist: 4.0, speed: 0.85, color: '#f87171', period: '687d' },
  { name: 'Jupiter', radius: 0.52, dist: 5.3, speed: 0.48, color: '#fb923c', period: '11.9y' },
  { name: 'Saturn', radius: 0.44, dist: 6.7, speed: 0.34, color: '#fde047', period: '29.5y', hasRing: true },
];

const SolarSystem3DMesh: React.FC<{ orbitSpeed: number; showLabels: boolean }> = ({
  orbitSpeed,
  showLabels,
}) => {
  const planetRefs = useRef<(THREE.Group | null)[]>([]);
  const anglesRef = useRef<number[]>(PLANETS.map((_, i) => i * 1.1));

  useFrame((_, delta) => {
    PLANETS.forEach((p, i) => {
      anglesRef.current[i] += delta * p.speed * orbitSpeed;
      const grp = planetRefs.current[i];
      if (grp) {
        grp.position.x = Math.cos(anglesRef.current[i]) * p.dist;
        grp.position.z = Math.sin(anglesRef.current[i]) * p.dist;
        grp.rotation.y += delta * 1.8;
      }
    });
  });

  return (
    <group>
      {/* Sun */}
      <mesh position={[0, 0, 0]}>
        <sphereGeometry args={[0.85, 32, 32]} />
        <meshStandardMaterial
          color="#f59e0b"
          emissive="#f59e0b"
          emissiveIntensity={1.2}
        />
      </mesh>
      <pointLight position={[0, 0, 0]} intensity={2.6} distance={25} color="#fde047" />

      {/* Orbit Rings & Planets */}
      {PLANETS.map((p, idx) => (
        <group key={p.name}>
          <mesh rotation={[-Math.PI / 2, 0, 0]}>
            <ringGeometry args={[p.dist - 0.02, p.dist + 0.02, 64]} />
            <meshBasicMaterial color="#1e293b" side={THREE.DoubleSide} />
          </mesh>

          <group
            ref={(el) => {
              planetRefs.current[idx] = el;
            }}
            position={[p.dist, 0, 0]}
          >
            <mesh>
              <sphereGeometry args={[p.radius, 24, 24]} />
              <meshStandardMaterial color={p.color} roughness={0.4} />
            </mesh>
            {p.hasRing && (
              <mesh rotation={[Math.PI / 2.4, 0, 0]}>
                <ringGeometry args={[p.radius * 1.35, p.radius * 2.0, 32]} />
                <meshStandardMaterial
                  color="#fef08a"
                  side={THREE.DoubleSide}
                  transparent
                  opacity={0.7}
                />
              </mesh>
            )}
            {showLabels && (
              <Html distanceFactor={12} position={[0, p.radius + 0.35, 0]} center>
                <div className="px-2 py-0.5 rounded bg-slate-900/90 border border-cyan-500/40 text-[10px] font-mono text-cyan-200 whitespace-nowrap">
                  {p.name} ({p.period})
                </div>
              </Html>
            )}
          </group>
        </group>
      ))}
    </group>
  );
};

export const PrimaryMathSolarLab: React.FC<{ initialMode?: string }> = ({
  initialMode,
}) => {
  const [subMode, setSubMode] = useState<PrimarySubMode>(
    (initialMode as PrimarySubMode) || 'abacus-fractions'
  );

  // Abacus & Fraction states
  const [abacusNumber, setAbacusNumber] = useState(4325);
  const [numerator, setNumerator] = useState(3);
  const [denominator, setDenominator] = useState(8);
  const [equivMultiplier, setEquivMultiplier] = useState(2);

  // Solar & Water Cycle states
  const [orbitSpeed, setOrbitSpeed] = useState(1.0);
  const [showPlanetLabels, setShowPlanetLabels] = useState(true);
  const [sunHeatIntensity, setSunHeatIntensity] = useState(75);

  const safeNum = Math.min(numerator, denominator);
  const eqNum = safeNum * equivMultiplier;
  const eqDen = denominator * equivMultiplier;

  const digits = [
    { label: 'Ten-Thousands (10,000s)', val: Math.floor(abacusNumber / 10000) % 10, color: '#f43f5e', mul: 10000 },
    { label: 'Thousands (1,000s)', val: Math.floor(abacusNumber / 1000) % 10, color: '#f59e0b', mul: 1000 },
    { label: 'Hundreds (100s)', val: Math.floor(abacusNumber / 100) % 10, color: '#10b981', mul: 100 },
    { label: 'Tens (10s)', val: Math.floor(abacusNumber / 10) % 10, color: '#06b6d4', mul: 10 },
    { label: 'Ones (1s)', val: abacusNumber % 10, color: '#a855f7', mul: 1 },
  ];

  const renderWaterCycle = ({ ctx, width, height, elapsedTime }: CanvasRenderContext) => {
    const rate = sunHeatIntensity / 50;

    // Sky & Sun
    ctx.fillStyle = '#0c192c';
    ctx.fillRect(0, 0, width, height * 0.68);

    const sunX = 95;
    const sunY = 70;
    const pulse = 34 + Math.sin(elapsedTime * 3) * 4;
    const sunGrad = ctx.createRadialGradient(sunX, sunY, 8, sunX, sunY, pulse * 1.6);
    sunGrad.addColorStop(0, '#fde047');
    sunGrad.addColorStop(0.5, '#f59e0b');
    sunGrad.addColorStop(1, 'rgba(245, 158, 11, 0)');
    ctx.fillStyle = sunGrad;
    ctx.beginPath();
    ctx.arc(sunX, sunY, pulse * 1.6, 0, Math.PI * 2);
    ctx.fill();

    // Mountains & Land (Right)
    ctx.fillStyle = '#1e293b';
    ctx.beginPath();
    ctx.moveTo(width * 0.45, height * 0.72);
    ctx.lineTo(width * 0.68, height * 0.28);
    ctx.lineTo(width * 0.85, height * 0.42);
    ctx.lineTo(width, height * 0.25);
    ctx.lineTo(width, height);
    ctx.lineTo(width * 0.45, height);
    ctx.closePath();
    ctx.fill();

    // Ocean (Left)
    ctx.fillStyle = '#0284c7';
    ctx.fillRect(0, height * 0.72, width * 0.55, height * 0.28);

    // River Collection (Mountain to Ocean)
    ctx.strokeStyle = '#38bdf8';
    ctx.lineWidth = 8;
    ctx.beginPath();
    ctx.moveTo(width * 0.72, height * 0.46);
    ctx.quadraticCurveTo(width * 0.62, height * 0.68, width * 0.48, height * 0.74);
    ctx.stroke();

    // 1. Evaporation arrows rising from ocean
    ctx.strokeStyle = '#67e8f9';
    ctx.lineWidth = 2;
    for (let i = 0; i < 6; i++) {
      const x = 60 + i * 42;
      const offset = ((elapsedTime * 45 * rate + i * 25) % 140);
      const y = height * 0.7 - offset;
      ctx.beginPath();
      ctx.arc(x + Math.sin(elapsedTime * 4 + i) * 5, y, 4, 0, Math.PI * 2);
      ctx.stroke();
    }

    // 2. Condensation Clouds
    const cloudX = width * 0.56 + Math.sin(elapsedTime * 0.7) * 18;
    const cloudY = 82;
    ctx.fillStyle = '#cbd5e1';
    ctx.beginPath();
    ctx.arc(cloudX, cloudY, 28, 0, Math.PI * 2);
    ctx.arc(cloudX + 26, cloudY - 6, 34, 0, Math.PI * 2);
    ctx.arc(cloudX + 56, cloudY, 26, 0, Math.PI * 2);
    ctx.fill();

    // 3. Precipitation Raindrops
    ctx.strokeStyle = '#38bdf8';
    ctx.lineWidth = 2;
    for (let r = 0; r < 14; r++) {
      const rx = cloudX - 15 + (r % 7) * 14;
      const ry = cloudY + 25 + ((elapsedTime * 110 * rate + r * 19) % 135);
      ctx.beginPath();
      ctx.moveTo(rx, ry);
      ctx.lineTo(rx - 3, ry + 10);
      ctx.stroke();
    }

    // Labels for the 4 Stages
    const labels = [
      { text: '1. EVAPORATION (Liquid → Vapor)', x: 55, y: height * 0.58, color: '#67e8f9' },
      { text: '2. CONDENSATION (Cloud Formation)', x: width * 0.44, y: 38, color: '#f8fafc' },
      { text: '3. PRECIPITATION (Rain / Snow)', x: width * 0.62, y: 155, color: '#38bdf8' },
      { text: '4. COLLECTION & RUNOFF', x: width * 0.48, y: height * 0.86, color: '#fde047' },
    ];
    ctx.font = 'bold 12px Inter, sans-serif';
    labels.forEach((lbl) => {
      ctx.fillStyle = 'rgba(9, 13, 22, 0.82)';
      ctx.fillRect(lbl.x - 8, lbl.y - 14, 225, 22);
      ctx.fillStyle = lbl.color;
      ctx.fillText(lbl.text, lbl.x, lbl.y);
    });
  };

  return (
    <div className="space-y-4">
      {/* Sub-mode Switcher */}
      <div className="flex flex-wrap items-center gap-2 p-2.5 rounded-xl bg-[#111827] border border-[#1F2937]">
        <button
          type="button"
          onClick={() => setSubMode('abacus-fractions')}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
            subMode === 'abacus-fractions'
              ? 'bg-cyan-500 text-slate-950 shadow-sm'
              : 'bg-[#090D16] text-slate-300 border border-slate-800 hover:text-white'
          }`}
        >
          <PieChart className="w-3.5 h-3.5" />
          Math: Place-Value Abacus & Visual Fractions
        </button>

        <button
          type="button"
          onClick={() => setSubMode('solar-3d')}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
            subMode === 'solar-3d'
              ? 'bg-cyan-500 text-slate-950 shadow-sm'
              : 'bg-[#090D16] text-slate-300 border border-slate-800 hover:text-white'
          }`}
        >
          <Globe className="w-3.5 h-3.5" />
          EVS: 3D Solar System & Planetary Orbits
        </button>

        <button
          type="button"
          onClick={() => setSubMode('water-cycle')}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
            subMode === 'water-cycle'
              ? 'bg-cyan-500 text-slate-950 shadow-sm'
              : 'bg-[#090D16] text-slate-300 border border-slate-800 hover:text-white'
          }`}
        >
          <CloudRain className="w-3.5 h-3.5" />
          EVS: Animated Water Cycle
        </button>
      </div>

      {subMode === 'abacus-fractions' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* Interactive 5-Rod Bead Abacus */}
            <div className="p-4 rounded-xl bg-[#111827] border border-[#1F2937] space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-bold uppercase tracking-wider text-cyan-400 flex items-center gap-1.5">
                  <Calculator className="w-4 h-4" />
                  5-Rod Place Value Bead Abacus
                </h4>
                <span className="font-mono text-sm font-bold text-white bg-slate-900 px-2.5 py-1 rounded border border-slate-700">
                  Number = {abacusNumber.toLocaleString()}
                </span>
              </div>

              <div className="grid grid-cols-5 gap-2 pt-2 pb-3 px-2 bg-[#090D16] rounded-xl border border-slate-800">
                {digits.map((d) => (
                  <div key={d.label} className="flex flex-col items-center">
                    <span className="text-[10px] font-mono text-slate-400 mb-1 text-center">
                      {d.label.split(' ')[0]}
                    </span>
                    {/* Vertical Rod */}
                    <div className="relative h-44 w-full flex flex-col justify-end items-center py-2">
                      <div className="absolute inset-y-0 w-1 bg-slate-700 rounded-full" />
                      {Array.from({ length: d.val }).map((_, bIdx) => (
                        <div
                          key={bIdx}
                          style={{ backgroundColor: d.color }}
                          className="relative z-10 w-9 h-3.5 rounded-full my-0.5 shadow-md border border-white/20 transition-all"
                        />
                      ))}
                    </div>
                    <div className="mt-1 font-mono text-sm font-bold text-white">
                      {d.val}
                    </div>
                    <div className="flex gap-1 mt-1">
                      <button
                        type="button"
                        onClick={() =>
                          setAbacusNumber((n) => Math.max(0, n - d.mul))
                        }
                        className="px-2 py-0.5 rounded bg-slate-800 hover:bg-slate-700 text-xs font-bold"
                      >
                        -
                      </button>
                      <button
                        type="button"
                        onClick={() =>
                          setAbacusNumber((n) => Math.min(99999, n + d.mul))
                        }
                        className="px-2 py-0.5 rounded bg-slate-800 hover:bg-slate-700 text-xs font-bold"
                      >
                        +
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              <p className="text-xs font-mono text-slate-300 bg-[#090D16] p-2.5 rounded-lg border border-slate-800">
                Expanded Form:{' '}
                {digits
                  .map((d) => `${d.val * d.mul}`)
                  .join(' + ')}{' '}
                = <strong className="text-cyan-300">{abacusNumber}</strong>
              </p>
            </div>

            {/* Interactive Pizza & Bar Equivalent Fractions */}
            <div className="p-4 rounded-xl bg-[#111827] border border-[#1F2937] space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-bold uppercase tracking-wider text-emerald-400">
                  Visual Fraction & Equivalence Explorer
                </h4>
                <span className="font-mono text-xs text-emerald-300 bg-emerald-950/30 border border-emerald-500/30 px-2.5 py-1 rounded">
                  {safeNum}/{denominator} = {eqNum}/{eqDen} ({((safeNum / denominator) * 100).toFixed(1)}%)
                </span>
              </div>

              <div className="flex flex-col sm:flex-row items-center justify-around gap-4 py-3 bg-[#090D16] rounded-xl border border-slate-800">
                {/* SVG Circular Fraction Sector */}
                <svg width="150" height="150" viewBox="-75 -75 150 150">
                  {Array.from({ length: denominator }).map((_, idx) => {
                    const startAngle = (idx / denominator) * Math.PI * 2 - Math.PI / 2;
                    const endAngle = ((idx + 1) / denominator) * Math.PI * 2 - Math.PI / 2;
                    const r = 64;
                    const x1 = Math.cos(startAngle) * r;
                    const y1 = Math.sin(startAngle) * r;
                    const x2 = Math.cos(endAngle) * r;
                    const y2 = Math.sin(endAngle) * r;
                    const largeArc = 1 / denominator > 0.5 ? 1 : 0;
                    const d =
                      denominator === 1
                        ? `M 0 -64 A 64 64 0 1 1 -0.01 -64 Z`
                        : `M 0 0 L ${x1} ${y1} A ${r} ${r} 0 ${largeArc} 1 ${x2} ${y2} Z`;
                    const active = idx < safeNum;
                    return (
                      <path
                        key={idx}
                        d={d}
                        fill={active ? '#06b6d4' : '#1e293b'}
                        stroke="#090d16"
                        strokeWidth="2"
                      />
                    );
                  })}
                </svg>

                {/* Equivalent Fraction Bar Strip */}
                <div className="w-full sm:w-52 space-y-3 px-3">
                  <div>
                    <div className="text-[11px] font-mono text-slate-400 mb-1">
                      Base Fraction ({safeNum}/{denominator})
                    </div>
                    <div className="flex h-6 rounded overflow-hidden border border-slate-700">
                      {Array.from({ length: denominator }).map((_, i) => (
                        <div
                          key={i}
                          className={`flex-1 border-r border-slate-900 ${
                            i < safeNum ? 'bg-cyan-500' : 'bg-slate-800'
                          }`}
                        />
                      ))}
                    </div>
                  </div>

                  <div>
                    <div className="text-[11px] font-mono text-emerald-400 mb-1">
                      Equivalent Fraction ({eqNum}/{eqDen})
                    </div>
                    <div className="flex h-6 rounded overflow-hidden border border-slate-700">
                      {Array.from({ length: eqDen }).map((_, i) => (
                        <div
                          key={i}
                          className={`flex-1 border-r border-slate-900 ${
                            i < eqNum ? 'bg-emerald-500' : 'bg-slate-800'
                          }`}
                        />
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              <FormulaCard
                label="Equivalent Fraction Identity"
                latex={`\\frac{${safeNum}}{${denominator}} = \\frac{${safeNum} \\times ${equivMultiplier}}{${denominator} \\times ${equivMultiplier}} = \\frac{${eqNum}}{${eqDen}} = ${(
                  safeNum / denominator
                ).toFixed(3)}`}
                description="Multiplying both numerator and denominator by the same non-zero number preserves the exact proportional value."
              />
            </div>
          </div>

          <ParameterPanel
            title="Primary Math & Fractions Controls"
            sliders={[
              {
                id: 'num',
                label: 'Fraction Numerator (Parts Shaded)',
                value: safeNum,
                min: 1,
                max: denominator,
                step: 1,
                onChange: setNumerator,
              },
              {
                id: 'den',
                label: 'Fraction Denominator (Total Parts)',
                value: denominator,
                min: 2,
                max: 12,
                step: 1,
                onChange: (val) => {
                  setDenominator(val);
                  if (numerator > val) setNumerator(val);
                },
              },
              {
                id: 'eq',
                label: 'Equivalence Multiplier (k)',
                value: equivMultiplier,
                min: 2,
                max: 4,
                step: 1,
                unit: 'x',
                onChange: setEquivMultiplier,
              },
              {
                id: 'abacus',
                label: 'Abacus Value Slider',
                value: abacusNumber,
                min: 0,
                max: 99999,
                step: 1,
                onChange: setAbacusNumber,
              },
            ]}
          />
        </div>
      )}

      {subMode === 'solar-3d' && (
        <div className="space-y-4">
          <Scene3DWrapper
            title="3D Heliocentric Solar System (Mercury to Saturn)"
            subtitle="Keplerian planetary orbits — inner terrestrial planets orbit faster than outer gas giants"
            cameraPosition={[0, 7.5, 10]}
            height={420}
            overlayControls={
              <button
                type="button"
                onClick={() => setShowPlanetLabels((l) => !l)}
                className="px-2.5 py-1 rounded bg-slate-800 text-xs text-cyan-300 border border-slate-700"
              >
                {showPlanetLabels ? 'Hide Labels' : 'Show Labels'}
              </button>
            }
          >
            <SolarSystem3DMesh
              orbitSpeed={orbitSpeed}
              showLabels={showPlanetLabels}
            />
          </Scene3DWrapper>

          <ParameterPanel
            title="Solar System Orbital Controls"
            sliders={[
              {
                id: 'speed',
                label: 'Orbital Time-Lapse Speed',
                value: orbitSpeed,
                min: 0,
                max: 3,
                step: 0.1,
                unit: 'x',
                onChange: setOrbitSpeed,
              },
            ]}
            telemetry={[
              { label: 'Central Star', value: 'Sun (G2V)', color: 'amber' },
              { label: 'Earth Period', value: '365.25', unit: 'days', color: 'cyan' },
              { label: 'Earth Axial Tilt', value: '23.5°', color: 'emerald' },
              { label: 'Inner Planets', value: '4 Rocky', color: 'violet' },
            ]}
          />
        </div>
      )}

      {subMode === 'water-cycle' && (
        <div className="space-y-4">
          <Canvas2DWrapper
            title="Hydrological (Water) Cycle Interactive Simulator"
            subtitle="Adjust solar thermal radiation to observe changes in evaporation, cloud condensation, and rainfall rate"
            height={390}
            onRender={renderWaterCycle}
          />
          <ParameterPanel
            title="Solar Radiation & Hydrological Controls"
            sliders={[
              {
                id: 'heat',
                label: 'Solar Thermal Intensity (Evaporation Driver)',
                value: sunHeatIntensity,
                min: 20,
                max: 100,
                step: 5,
                unit: '%',
                onChange: setSunHeatIntensity,
              },
            ]}
            telemetry={[
              {
                label: 'Evaporation Rate',
                value: (sunHeatIntensity * 0.12).toFixed(1),
                unit: 'mm/day',
                color: 'cyan',
              },
              {
                label: 'Cloud Humidity',
                value: `${Math.min(100, Math.round(sunHeatIntensity * 1.1))}`,
                unit: '%',
                color: 'emerald',
              },
              {
                label: 'Phase Change 1',
                value: 'Liquid → Gas',
                color: 'amber',
              },
              {
                label: 'Phase Change 2',
                value: 'Gas → Liquid',
                color: 'violet',
              },
            ]}
          />
        </div>
      )}
    </div>
  );
};
