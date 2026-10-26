import React, { useMemo, useState } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Grid as DreiGrid } from '@react-three/drei';
import * as THREE from 'three';
import { Box, Scissors, RotateCcw } from 'lucide-react';

interface Scene3DWrapperProps {
  children: React.ReactNode;
  title?: string;
  subtitle?: string;
  height?: number;
  cameraPosition?: [number, number, number];
  enableClippingUI?: boolean;
  clipX?: number;
  clipY?: number;
  clipZ?: number;
  onClipChange?: (axis: 'x' | 'y' | 'z', val: number) => void;
  showFloorGrid?: boolean;
  overlayControls?: React.ReactNode;
}

export const Scene3DWrapper: React.FC<Scene3DWrapperProps> = ({
  children,
  title = '3D WebGL Spatial Engine',
  subtitle = 'Left-drag: Orbit • Right-drag: Pan • Scroll: Zoom',
  height = 430,
  cameraPosition = [5, 4, 6],
  enableClippingUI = false,
  clipX: externalClipX,
  clipY: externalClipY,
  clipZ: externalClipZ,
  onClipChange,
  showFloorGrid = true,
  overlayControls,
}) => {
  const [internalClip, setInternalClip] = useState({ x: 5, y: 5, z: 5 });
  const [showClipDrawer, setShowClipDrawer] = useState(false);

  const cx = externalClipX ?? internalClip.x;
  const cy = externalClipY ?? internalClip.y;
  const cz = externalClipZ ?? internalClip.z;

  const handleAxisChange = (axis: 'x' | 'y' | 'z', val: number) => {
    if (onClipChange) {
      onClipChange(axis, val);
    } else {
      setInternalClip((prev) => ({ ...prev, [axis]: val }));
    }
  };

  const clippingPlanes = useMemo(() => {
    return [
      new THREE.Plane(new THREE.Vector3(-1, 0, 0), cx),
      new THREE.Plane(new THREE.Vector3(0, -1, 0), cy),
      new THREE.Plane(new THREE.Vector3(0, 0, -1), cz),
    ];
  }, [cx, cy, cz]);

  return (
    <div className="relative rounded-xl overflow-hidden border border-[#1F2937] bg-[#090D16] shadow-lg">
      {/* Header Bar */}
      <div className="flex flex-wrap items-center justify-between gap-2 px-3.5 py-2 bg-[#111827]/95 border-b border-[#1F2937]">
        <div className="flex items-center gap-2">
          <Box className="w-4 h-4 text-cyan-400" />
          <div>
            <h4 className="text-xs font-bold text-slate-200">{title}</h4>
            <p className="text-[10px] text-slate-400">{subtitle}</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {overlayControls}
          {enableClippingUI && (
            <button
              type="button"
              onClick={() => setShowClipDrawer((s) => !s)}
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium border transition-colors ${
                showClipDrawer
                  ? 'bg-cyan-500/20 border-cyan-500/50 text-cyan-300'
                  : 'bg-slate-900 border-slate-800 text-slate-300 hover:text-white'
              }`}
            >
              <Scissors className="w-3.5 h-3.5" />
              Cross-Section Planes
            </button>
          )}
        </div>
      </div>

      {/* Optional X/Y/Z Clipping Sliders Bar */}
      {enableClippingUI && showClipDrawer && (
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-2 px-3.5 py-2 bg-[#0D1322] border-b border-slate-800 text-xs">
          {(['x', 'y', 'z'] as const).map((axis) => {
            const val = axis === 'x' ? cx : axis === 'y' ? cy : cz;
            return (
              <div key={axis} className="flex items-center gap-2">
                <span className="font-mono font-bold uppercase text-cyan-400 w-12">
                  Clip {axis.toUpperCase()}:
                </span>
                <input
                  type="range"
                  min={-3.5}
                  max={5}
                  step={0.1}
                  value={val}
                  onChange={(e) => handleAxisChange(axis, parseFloat(e.target.value))}
                  className="flex-1 h-1.5 bg-slate-800 rounded-lg cursor-pointer accent-cyan-400"
                />
                <span className="font-mono text-[11px] text-slate-300 w-9 text-right">
                  {val.toFixed(1)}
                </span>
              </div>
            );
          })}
          <div className="flex items-center justify-end">
            <button
              type="button"
              onClick={() => {
                handleAxisChange('x', 5);
                handleAxisChange('y', 5);
                handleAxisChange('z', 5);
              }}
              className="flex items-center gap-1 px-2.5 py-1 rounded bg-slate-800 text-slate-300 hover:text-white text-[11px]"
            >
              <RotateCcw className="w-3 h-3" /> Reset Slice
            </button>
          </div>
        </div>
      )}

      {/* Three.js Canvas */}
      <div style={{ height: `${height}px` }} className="w-full relative">
        <Canvas
          camera={{ position: cameraPosition, fov: 45 }}
          gl={{ localClippingEnabled: true, antialias: true }}
          onCreated={({ gl }) => {
            gl.clippingPlanes = clippingPlanes;
          }}
        >
          <color attach="background" args={['#090D16']} />
          <ambientLight intensity={0.65} />
          <directionalLight position={[8, 12, 8]} intensity={1.2} />
          <pointLight position={[-8, -6, -6]} intensity={0.5} color="#06B6D4" />

          {showFloorGrid && (
            <DreiGrid
              position={[0, -2.4, 0]}
              args={[16, 16]}
              cellSize={0.8}
              cellThickness={0.6}
              cellColor="#1e293b"
              sectionSize={3.2}
              sectionThickness={1}
              sectionColor="#0e7490"
              fadeDistance={22}
            />
          )}

          {children}

          <OrbitControls
            makeDefault
            enableDamping
            dampingFactor={0.08}
            minDistance={2.2}
            maxDistance={18}
          />
        </Canvas>
      </div>
    </div>
  );
};
