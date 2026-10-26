import React from 'react';
import { Sliders, Sparkles, Activity } from 'lucide-react';

export interface SliderControl {
  id: string;
  label: string;
  value: number;
  min: number;
  max: number;
  step: number;
  unit?: string;
  onChange: (val: number) => void;
}

export interface PresetOption {
  id: string;
  label: string;
  description?: string;
  onSelect: () => void;
  active?: boolean;
}

export interface TelemetryMetric {
  label: string;
  value: string;
  unit?: string;
  color?: 'cyan' | 'amber' | 'emerald' | 'rose' | 'violet';
}

interface ParameterPanelProps {
  title?: string;
  sliders?: SliderControl[];
  presets?: PresetOption[];
  telemetry?: TelemetryMetric[];
  children?: React.ReactNode;
}

const colorClasses = {
  cyan: 'text-cyan-300 border-cyan-500/30 bg-cyan-950/20',
  amber: 'text-amber-300 border-amber-500/30 bg-amber-950/20',
  emerald: 'text-emerald-300 border-emerald-500/30 bg-emerald-950/20',
  rose: 'text-rose-300 border-rose-500/30 bg-rose-950/20',
  violet: 'text-violet-300 border-violet-500/30 bg-violet-950/20',
};

export const ParameterPanel: React.FC<ParameterPanelProps> = ({
  title = 'Laboratory Parameters',
  sliders = [],
  presets = [],
  telemetry = [],
  children,
}) => {
  return (
    <div className="rounded-xl bg-[#111827] border border-[#1F2937] p-3.5 space-y-4">
      <div className="flex items-center justify-between border-b border-slate-800 pb-2.5">
        <div className="flex items-center gap-2">
          <Sliders className="w-4 h-4 text-cyan-400" />
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-200">
            {title}
          </h3>
        </div>
        <span className="text-[10px] font-mono text-slate-400">REAL-TIME INPUTS</span>
      </div>

      {presets.length > 0 && (
        <div className="space-y-1.5">
          <div className="flex items-center gap-1.5 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
            <Sparkles className="w-3 h-3 text-amber-400" />
            Quick Presets
          </div>
          <div className="flex flex-wrap gap-1.5">
            {presets.map((p) => (
              <button
                key={p.id}
                type="button"
                onClick={p.onSelect}
                title={p.description}
                className={`px-2.5 py-1 rounded-lg text-xs font-medium border transition-all ${
                  p.active
                    ? 'bg-cyan-500/20 border-cyan-400 text-cyan-200 shadow-sm'
                    : 'bg-[#090D16] border-slate-800 text-slate-300 hover:border-slate-600 hover:text-white'
                }`}
              >
                {p.label}
              </button>
            ))}
          </div>
        </div>
      )}

      {sliders.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {sliders.map((s) => (
            <div
              key={s.id}
              className="p-2.5 rounded-lg bg-[#090D16]/80 border border-slate-800/80 space-y-1.5"
            >
              <div className="flex items-center justify-between text-xs">
                <span className="font-medium text-slate-300">{s.label}</span>
                <span className="font-mono font-semibold text-cyan-300">
                  {s.value}
                  {s.unit ? ` ${s.unit}` : ''}
                </span>
              </div>
              <input
                type="range"
                min={s.min}
                max={s.max}
                step={s.step}
                value={s.value}
                onChange={(e) => s.onChange(parseFloat(e.target.value))}
                className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-cyan-400"
              />
              <div className="flex justify-between text-[10px] font-mono text-slate-500">
                <span>
                  {s.min}
                  {s.unit ? s.unit : ''}
                </span>
                <span>
                  {s.max}
                  {s.unit ? s.unit : ''}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}

      {children}

      {telemetry.length > 0 && (
        <div className="pt-2 border-t border-slate-800/80 space-y-2">
          <div className="flex items-center gap-1.5 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
            <Activity className="w-3.5 h-3.5 text-emerald-400" />
            Live Telemetry Readout
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {telemetry.map((t, idx) => (
              <div
                key={idx}
                className={`p-2 rounded-lg border ${
                  colorClasses[t.color || 'cyan']
                } flex flex-col justify-between`}
              >
                <span className="text-[10px] uppercase tracking-wider text-slate-400 truncate">
                  {t.label}
                </span>
                <span className="text-sm font-mono font-bold mt-0.5">
                  {t.value}
                  {t.unit && (
                    <span className="text-[11px] font-normal opacity-80 ml-1">
                      {t.unit}
                    </span>
                  )}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
