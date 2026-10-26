import React, { useRef, useEffect, useState } from 'react';
import { Grid, ZoomIn, ZoomOut, Maximize2, Activity } from 'lucide-react';

export interface CanvasRenderContext {
  ctx: CanvasRenderingContext2D;
  width: number;
  height: number;
  zoom: number;
  panX: number;
  panY: number;
  showGrid: boolean;
  deltaTime: number;
  elapsedTime: number;
}

interface Canvas2DWrapperProps {
  onRender: (context: CanvasRenderContext) => void;
  isPlaying?: boolean;
  speed?: number;
  height?: number;
  title?: string;
  subtitle?: string;
  onCanvasMouseDown?: (x: number, y: number, e: React.MouseEvent<HTMLCanvasElement>) => void;
  onCanvasMouseMove?: (x: number, y: number, e: React.MouseEvent<HTMLCanvasElement>) => void;
  onCanvasMouseUp?: () => void;
  overlayTopRight?: React.ReactNode;
}

export const Canvas2DWrapper: React.FC<Canvas2DWrapperProps> = ({
  onRender,
  isPlaying = true,
  speed = 1,
  height = 420,
  title,
  subtitle,
  onCanvasMouseDown,
  onCanvasMouseMove,
  onCanvasMouseUp,
  overlayTopRight,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [showGrid, setShowGrid] = useState(true);
  const [fps, setFps] = useState(60);

  const elapsedRef = useRef(0);
  const lastTimeRef = useRef<number | null>(null);
  const frameCountRef = useRef(0);
  const fpsTimerRef = useRef(0);
  const onRenderRef = useRef(onRender);
  onRenderRef.current = onRender;

  useEffect(() => {
    let animationFrameId: number;

    const renderLoop = (timestamp: number) => {
      if (lastTimeRef.current === null) {
        lastTimeRef.current = timestamp;
      }
      const rawDt = Math.min((timestamp - lastTimeRef.current) / 1000, 0.1);
      lastTimeRef.current = timestamp;

      frameCountRef.current += 1;
      fpsTimerRef.current += rawDt;
      if (fpsTimerRef.current >= 0.5) {
        setFps(Math.min(60, Math.round(frameCountRef.current / fpsTimerRef.current)));
        frameCountRef.current = 0;
        fpsTimerRef.current = 0;
      }

      const dt = isPlaying ? rawDt * speed : 0;
      elapsedRef.current += dt;

      const canvas = canvasRef.current;
      if (canvas) {
        const rect = canvas.getBoundingClientRect();
        const dpr = window.devicePixelRatio || 1;
        if (
          canvas.width !== Math.floor(rect.width * dpr) ||
          canvas.height !== Math.floor(rect.height * dpr)
        ) {
          canvas.width = Math.floor(rect.width * dpr);
          canvas.height = Math.floor(rect.height * dpr);
        }

        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.save();
          ctx.scale(dpr, dpr);
          const w = rect.width;
          const h = rect.height;

          ctx.fillStyle = '#090D16';
          ctx.fillRect(0, 0, w, h);

          if (showGrid) {
            const gridStep = 32 * zoom;
            ctx.strokeStyle = 'rgba(30, 41, 59, 0.55)';
            ctx.lineWidth = 1;
            ctx.beginPath();
            for (let gx = (pan.x % gridStep + gridStep) % gridStep; gx < w; gx += gridStep) {
              ctx.moveTo(gx, 0);
              ctx.lineTo(gx, h);
            }
            for (let gy = (pan.y % gridStep + gridStep) % gridStep; gy < h; gy += gridStep) {
              ctx.moveTo(0, gy);
              ctx.lineTo(w, gy);
            }
            ctx.stroke();
          }

          onRenderRef.current({
            ctx,
            width: w,
            height: h,
            zoom,
            panX: pan.x,
            panY: pan.y,
            showGrid,
            deltaTime: dt,
            elapsedTime: elapsedRef.current,
          });

          ctx.restore();
        }
      }

      animationFrameId = requestAnimationFrame(renderLoop);
    };

    animationFrameId = requestAnimationFrame(renderLoop);
    return () => cancelAnimationFrame(animationFrameId);
  }, [isPlaying, speed, zoom, pan, showGrid]);

  const handleMouseEvent = (
    e: React.MouseEvent<HTMLCanvasElement>,
    cb?: (x: number, y: number, e: React.MouseEvent<HTMLCanvasElement>) => void
  ) => {
    if (!cb || !canvasRef.current) return;
    const rect = canvasRef.current.getBoundingClientRect();
    cb(e.clientX - rect.left, e.clientY - rect.top, e);
  };

  return (
    <div className="relative rounded-xl overflow-hidden border border-[#1F2937] bg-[#090D16] shadow-lg">
      {/* Top HUD Bar */}
      <div className="flex items-center justify-between px-3 py-2 bg-[#111827]/90 border-b border-[#1F2937] backdrop-blur-md">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
          <div>
            {title && (
              <h4 className="text-xs font-bold text-slate-200 tracking-wide">
                {title}
              </h4>
            )}
            {subtitle && (
              <p className="text-[10px] text-slate-400">{subtitle}</p>
            )}
          </div>
        </div>

        <div className="flex items-center gap-1.5">
          {overlayTopRight}
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-slate-900 border border-slate-800 text-[10px] font-mono text-emerald-400">
            <Activity className="w-3 h-3" />
            {fps} FPS
          </span>
          <button
            type="button"
            onClick={() => setShowGrid((g) => !g)}
            title="Toggle coordinate grid"
            className={`p-1.5 rounded-lg border text-xs transition-colors ${
              showGrid
                ? 'bg-cyan-500/20 border-cyan-500/40 text-cyan-300'
                : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white'
            }`}
          >
            <Grid className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onClick={() => setZoom((z) => Math.min(2.0, +(z + 0.15).toFixed(2)))}
            title="Zoom in"
            className="p-1.5 rounded-lg bg-slate-900 border border-slate-800 text-slate-400 hover:text-white transition-colors"
          >
            <ZoomIn className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onClick={() => setZoom((z) => Math.max(0.6, +(z - 0.15).toFixed(2)))}
            title="Zoom out"
            className="p-1.5 rounded-lg bg-slate-900 border border-slate-800 text-slate-400 hover:text-white transition-colors"
          >
            <ZoomOut className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onClick={() => {
              setZoom(1);
              setPan({ x: 0, y: 0 });
            }}
            title="Reset camera view"
            className="p-1.5 rounded-lg bg-slate-900 border border-slate-800 text-slate-400 hover:text-white transition-colors"
          >
            <Maximize2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Interactive 60FPS Canvas */}
      <canvas
        ref={canvasRef}
        style={{ height: `${height}px` }}
        onMouseDown={(e) => handleMouseEvent(e, onCanvasMouseDown)}
        onMouseMove={(e) => handleMouseEvent(e, onCanvasMouseMove)}
        onMouseUp={() => onCanvasMouseUp && onCanvasMouseUp()}
        onMouseLeave={() => onCanvasMouseUp && onCanvasMouseUp()}
        className="w-full block cursor-crosshair select-none"
      />
    </div>
  );
};
