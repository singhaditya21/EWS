import React from 'react';
import { Play, Pause, SkipForward, RotateCcw, Gauge } from 'lucide-react';

export type PlaybackSpeed = 0.25 | 0.5 | 1 | 2;

interface TimelineBarProps {
  isPlaying: boolean;
  onTogglePlay: () => void;
  onStepForward?: () => void;
  onReset: () => void;
  speed: PlaybackSpeed;
  onSpeedChange: (speed: PlaybackSpeed) => void;
  elapsedLabel?: string;
  statusBadge?: string;
}

const SPEEDS: PlaybackSpeed[] = [0.25, 0.5, 1, 2];

export const TimelineBar: React.FC<TimelineBarProps> = ({
  isPlaying,
  onTogglePlay,
  onStepForward,
  onReset,
  speed,
  onSpeedChange,
  elapsedLabel,
  statusBadge,
}) => {
  return (
    <div className="flex flex-wrap items-center justify-between gap-2 px-3.5 py-2 rounded-xl bg-[#111827]/95 border border-[#1F2937] backdrop-blur-md">
      <div className="flex items-center gap-1.5">
        <button
          type="button"
          onClick={onTogglePlay}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
            isPlaying
              ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 hover:bg-amber-500/30'
              : 'bg-cyan-500 text-slate-950 hover:bg-cyan-400 shadow-sm shadow-cyan-500/20'
          }`}
        >
          {isPlaying ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
          {isPlaying ? 'Pause' : 'Play'}
        </button>

        {onStepForward && (
          <button
            type="button"
            onClick={onStepForward}
            disabled={isPlaying}
            title="Step forward one frame"
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-medium bg-slate-800/80 text-slate-200 border border-slate-700 hover:bg-slate-700 disabled:opacity-40 disabled:pointer-events-none transition-colors"
          >
            <SkipForward className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Step</span>
          </button>
        )}

        <button
          type="button"
          onClick={onReset}
          title="Reset simulation"
          className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-medium bg-slate-800/80 text-slate-300 border border-slate-700 hover:bg-slate-700 hover:text-white transition-colors"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Reset</span>
        </button>
      </div>

      <div className="flex items-center gap-2">
        {statusBadge && (
          <span className="px-2.5 py-1 rounded-md bg-slate-900 border border-slate-800 text-[11px] font-mono text-cyan-300">
            {statusBadge}
          </span>
        )}
        {elapsedLabel && (
          <span className="text-xs font-mono text-slate-400 hidden md:inline">
            {elapsedLabel}
          </span>
        )}

        <div className="flex items-center gap-1 bg-[#090D16] p-1 rounded-lg border border-slate-800">
          <Gauge className="w-3.5 h-3.5 text-slate-400 ml-1 mr-0.5" />
          {SPEEDS.map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => onSpeedChange(s)}
              className={`px-2 py-0.5 rounded text-[11px] font-mono font-semibold transition-colors ${
                speed === s
                  ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              {s}x
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
