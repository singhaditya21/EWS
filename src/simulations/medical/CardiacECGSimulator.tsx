import React, { useState, useRef } from 'react';
import { Canvas2DWrapper, CanvasRenderContext } from '../../components/engine/Canvas2DWrapper';
import { ParameterPanel } from '../../components/engine/ParameterPanel';
import { TimelineBar, PlaybackSpeed } from '../../components/engine/TimelineBar';
import { FormulaCard } from '../../components/engine/FormulaCard';

type RhythmPreset = 'normal' | 'bradycardia' | 'tachycardia' | 'afib';

export const CardiacECGSimulator: React.FC = () => {
  const [rhythm, setRhythm] = useState<RhythmPreset>('normal');
  const [bpm, setBpm] = useState(72);
  const [strokeVolume, setStrokeVolume] = useState(70); // mL/beat
  const [isPlaying, setIsPlaying] = useState(true);
  const [speed, setSpeed] = useState<PlaybackSpeed>(1);

  const cyclePhaseRef = useRef(0);

  const cardiacOutputLMin = +((bpm * strokeVolume) / 1000).toFixed(2);
  const cycleDurationSec = +(60 / bpm).toFixed(2);

  // Synthetic P-QRS-T waveform generator for normalized phase p in [0, 1)
  const sampleECG = (p: number) => {
    const gaussian = (center: number, width: number, amp: number) =>
      amp * Math.exp(-Math.pow((p - center) / width, 2));

    const pWave = rhythm === 'afib' ? Math.sin(p * 45) * 0.08 : gaussian(0.16, 0.035, 0.22);
    const qWave = gaussian(0.36, 0.012, -0.18);
    const rWave = gaussian(0.39, 0.014, 1.05);
    const sWave = gaussian(0.42, 0.014, -0.28);
    const tWave = gaussian(0.66, 0.048, 0.34);

    return pWave + qWave + rWave + sWave + tWave;
  };

  // Left Ventricular Pressure (LVP) & Aortic Pressure (AoP) in mmHg
  const samplePressures = (p: number) => {
    const systole = Math.exp(-Math.pow((p - 0.48) / 0.12, 2));
    const lvp = 8 + systole * 112;
    const aop = 80 + Math.max(0, systole * 40 - 2) + Math.exp(-Math.pow((p - 0.64) / 0.08, 2)) * 12;
    return { lvp, aop };
  };

  const renderCardiac = ({ ctx, width, height, deltaTime }: CanvasRenderContext) => {
    if (isPlaying) {
      const beatsPerSec = bpm / 60;
      cyclePhaseRef.current = (cyclePhaseRef.current + deltaTime * beatsPerSec) % 1;
    }

    const phase = cyclePhaseRef.current;

    // Determine active electrical conduction node
    const conductionStage =
      phase < 0.18
        ? 'SA Node Firing (Atrial Depolarization — P Wave)'
        : phase < 0.34
        ? 'AV Node Delay (Atrioventricular Nodal Conduction — PR Segment)'
        : phase < 0.46
        ? 'Bundle of His & Purkinje Fibers (Ventricular Depolarization — QRS)'
        : phase < 0.72
        ? 'Ventricular Systole & Repolarization (ST–T Wave)'
        : 'Isoelectric Diastole (Passive Ventricular Filling)';

    // Left Side: 4-Chamber Heart & Conduction System Schematic
    const hx = width * 0.22;
    const hy = height * 0.53;
    const atrialContract = phase >= 0.12 && phase <= 0.3 ? 0.88 : 1.0;
    const ventContract = phase >= 0.38 && phase <= 0.62 ? 0.84 : 1.0;

    // Right Atrium (Top-Left on viewer schematic) & Left Atrium (Top-Right)
    ctx.fillStyle = 'rgba(37, 99, 235, 0.38)';
    ctx.strokeStyle = '#3b82f6';
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.ellipse(hx - 38, hy - 48, 32 * atrialContract, 28 * atrialContract, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = 'rgba(225, 29, 72, 0.38)';
    ctx.strokeStyle = '#f43f5e';
    ctx.beginPath();
    ctx.ellipse(hx + 38, hy - 48, 32 * atrialContract, 28 * atrialContract, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    // Right Ventricle & Left Ventricle
    ctx.fillStyle = 'rgba(37, 99, 235, 0.45)';
    ctx.strokeStyle = '#60a5fa';
    ctx.beginPath();
    ctx.ellipse(hx - 34, hy + 34, 34 * ventContract, 52 * ventContract, -0.15, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = 'rgba(225, 29, 72, 0.5)';
    ctx.strokeStyle = '#fb7185';
    ctx.beginPath();
    ctx.ellipse(hx + 34, hy + 34, 36 * ventContract, 54 * ventContract, 0.15, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    // Conduction Nodes & Yellow Electrical Impulse Highlight
    const nodes = [
      { label: 'SA Node', x: hx - 52, y: hy - 62, active: phase < 0.22 },
      { label: 'AV Node', x: hx - 6, y: hy - 22, active: phase >= 0.18 && phase < 0.36 },
      { label: 'His Bundle', x: hx, y: hy + 8, active: phase >= 0.34 && phase < 0.44 },
      { label: 'Purkinje', x: hx + 36, y: hy + 58, active: phase >= 0.38 && phase < 0.52 },
    ];

    ctx.strokeStyle = '#fde047';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(nodes[0].x, nodes[0].y);
    ctx.lineTo(nodes[1].x, nodes[1].y);
    ctx.lineTo(nodes[2].x, nodes[2].y);
    ctx.lineTo(nodes[3].x, nodes[3].y);
    ctx.stroke();

    nodes.forEach((n) => {
      ctx.fillStyle = n.active ? '#fde047' : '#64748b';
      ctx.beginPath();
      ctx.arc(n.x, n.y, n.active ? 7 : 4.5, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = n.active ? '#fde047' : '#cbd5e1';
      ctx.font = 'bold 10px JetBrains Mono, monospace';
      ctx.fillText(n.label, n.x - 22, n.y - 10);
    });

    // Right Side Top: Wiggers Left Ventricular & Aortic Pressure Strip
    const gx = width * 0.44;
    const gw = width - gx - 25;
    const wiggersY = 55;
    const wiggersH = 125;

    ctx.strokeStyle = '#334155';
    ctx.lineWidth = 1.5;
    ctx.strokeRect(gx, wiggersY, gw, wiggersH);

    // Plot AoP (Amber) & LVP (Rose)
    ctx.strokeStyle = '#f59e0b';
    ctx.lineWidth = 2;
    ctx.beginPath();
    for (let px = 0; px <= gw; px += 3) {
      const p = ((px / gw) * 2 + phase) % 1;
      const { aop } = samplePressures(p);
      const y = wiggersY + wiggersH - (aop / 140) * (wiggersH - 18);
      if (px === 0) ctx.moveTo(gx + px, y);
      else ctx.lineTo(gx + px, y);
    }
    ctx.stroke();

    ctx.strokeStyle = '#f43f5e';
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    for (let px = 0; px <= gw; px += 3) {
      const p = ((px / gw) * 2 + phase) % 1;
      const { lvp } = samplePressures(p);
      const y = wiggersY + wiggersH - (lvp / 140) * (wiggersH - 18);
      if (px === 0) ctx.moveTo(gx + px, y);
      else ctx.lineTo(gx + px, y);
    }
    ctx.stroke();

    ctx.fillStyle = '#e2e8f0';
    ctx.font = 'bold 11px Inter, sans-serif';
    ctx.fillText(
      'Wiggers Hemodynamics: Red = LV Pressure (mmHg) • Amber = Aortic Pressure',
      gx + 8,
      wiggersY - 6
    );

    // Right Side Bottom: Live Lead II Surface ECG Strip (P-QRS-T)
    const ecgY = 215;
    const ecgH = 140;
    ctx.strokeStyle = '#334155';
    ctx.lineWidth = 1.5;
    ctx.strokeRect(gx, ecgY, gw, ecgH);

    const baselineY = ecgY + ecgH * 0.62;
    ctx.strokeStyle = '#10b981';
    ctx.lineWidth = 2.8;
    ctx.beginPath();
    for (let px = 0; px <= gw; px += 2) {
      const p = ((px / gw) * 2 + phase) % 1;
      const mv = sampleECG(p);
      const y = baselineY - mv * (ecgH * 0.48);
      if (px === 0) ctx.moveTo(gx + px, y);
      else ctx.lineTo(gx + px, y);
    }
    ctx.stroke();

    ctx.fillStyle = '#10b981';
    ctx.fillText('Lead II Electrocardiogram (P–QRS–T Waveform)', gx + 8, ecgY - 6);

    // Top Status Readout
    ctx.fillStyle = '#10b981';
    ctx.font = 'bold 12px JetBrains Mono, monospace';
    ctx.fillText(
      `${conductionStage} | HR = ${bpm} BPM | CO = ${cardiacOutputLMin} L/min`,
      20,
      26
    );
  };

  return (
    <div className="space-y-4">
      <TimelineBar
        isPlaying={isPlaying}
        onTogglePlay={() => setIsPlaying((p) => !p)}
        onStepForward={() => {
          cyclePhaseRef.current = (cyclePhaseRef.current + 0.05) % 1;
        }}
        onReset={() => {
          cyclePhaseRef.current = 0;
        }}
        speed={speed}
        onSpeedChange={setSpeed}
        statusBadge={`Cardiac Cycle = ${cycleDurationSec}s | CO = ${cardiacOutputLMin} L/min`}
      />

      <Canvas2DWrapper
        title="Cardiac Electrical Conduction, Wiggers Hemodynamics & Live ECG"
        subtitle="SA Node → AV Node → Bundle of His → Purkinje Network synchronized with Lead II ECG"
        height={395}
        isPlaying={isPlaying}
        speed={speed}
        onRender={renderCardiac}
      />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <FormulaCard
          label="Cardiac Output & Stroke Volume Equation"
          latex="\text{CO} = \text{HR} \times \text{SV} = \text{HR} \times (\text{EDV} - \text{ESV})"
          liveSubstitution={`\\text{CO} = ${bpm}\\text{ BPM} \\times ${strokeVolume}\\text{ mL} = ${cardiacOutputLMin}\\text{ L/min}`}
          accentColor="emerald"
        />
        <FormulaCard
          label="Mean Arterial Pressure (MAP) & Ejection Fraction"
          latex="\text{MAP} \approx \text{DBP} + \frac{1}{3}(\text{SBP} - \text{DBP}), \quad \text{EF} = \frac{\text{SV}}{\text{EDV}} \times 100\%"
          liveSubstitution={`\\text{MAP} \\approx 80 + \\frac{1}{3}(120 - 80) = 93.3\\text{ mmHg}, \\quad \\text{EF} = ${Math.round(
            (strokeVolume / 120) * 100
          )}\\%`}
          accentColor="emerald"
        />
      </div>

      <ParameterPanel
        title="Cardiac Electrophysiology & Hemodynamic Controls"
        presets={[
          {
            id: 'normal',
            label: 'Normal Sinus Rhythm (72 BPM)',
            active: rhythm === 'normal',
            onSelect: () => {
              setRhythm('normal');
              setBpm(72);
            },
          },
          {
            id: 'bradycardia',
            label: 'Sinus Bradycardia (48 BPM)',
            active: rhythm === 'bradycardia',
            onSelect: () => {
              setRhythm('bradycardia');
              setBpm(48);
            },
          },
          {
            id: 'tachycardia',
            label: 'Sinus Tachycardia (135 BPM)',
            active: rhythm === 'tachycardia',
            onSelect: () => {
              setRhythm('tachycardia');
              setBpm(135);
            },
          },
          {
            id: 'afib',
            label: 'Atrial Fibrillation (Absent P-Wave)',
            active: rhythm === 'afib',
            onSelect: () => {
              setRhythm('afib');
              setBpm(118);
            },
          },
        ]}
        sliders={[
          {
            id: 'bpm',
            label: 'Heart Rate (HR)',
            value: bpm,
            min: 40,
            max: 180,
            step: 2,
            unit: 'BPM',
            onChange: setBpm,
          },
          {
            id: 'sv',
            label: 'Left Ventricular Stroke Volume (SV)',
            value: strokeVolume,
            min: 40,
            max: 110,
            step: 5,
            unit: 'mL',
            onChange: setStrokeVolume,
          },
        ]}
        telemetry={[
          { label: 'Cardiac Output', value: `${cardiacOutputLMin}`, unit: 'L/min', color: 'emerald' },
          { label: 'Cycle Duration', value: `${cycleDurationSec}`, unit: 'sec', color: 'cyan' },
          { label: 'Systolic / Diastolic', value: '120 / 80', unit: 'mmHg', color: 'rose' },
          {
            label: 'Ejection Fraction',
            value: `${Math.round((strokeVolume / 120) * 100)}`,
            unit: '%',
            color: 'amber',
          },
        ]}
      />
    </div>
  );
};
