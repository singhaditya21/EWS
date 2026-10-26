import React, { useState, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Html } from '@react-three/drei';
import * as THREE from 'three';
import { Scene3DWrapper } from '../../components/engine/Scene3DWrapper';
import { ParameterPanel } from '../../components/engine/ParameterPanel';
import { FormulaCard } from '../../components/engine/FormulaCard';
import { Atom, Hexagon } from 'lucide-react';

type ChemMode = 'vsepr' | 'bohr';
type VSEPRKey =
  | 'linear'
  | 'trigonal-planar'
  | 'tetrahedral'
  | 'bent-water'
  | 'trigonal-bipyramidal'
  | 'octahedral';

interface VSEPRSpec {
  id: VSEPRKey;
  name: string;
  formula: string;
  stericNumber: number;
  lonePairs: number;
  hybridization: string;
  bondAngle: string;
  centralColor: string;
  ligandColor: string;
  ligandPositions: [number, number, number][];
  lonePairPositions?: [number, number, number][];
}

const VSEPR_SHAPES: Record<VSEPRKey, VSEPRSpec> = {
  linear: {
    id: 'linear',
    name: 'Linear (AX₂)',
    formula: 'CO₂ / BeCl₂',
    stericNumber: 2,
    lonePairs: 0,
    hybridization: 'sp',
    bondAngle: '180°',
    centralColor: '#94a3b8',
    ligandColor: '#ef4444',
    ligandPositions: [
      [-1.8, 0, 0],
      [1.8, 0, 0],
    ],
  },
  'trigonal-planar': {
    id: 'trigonal-planar',
    name: 'Trigonal Planar (AX₃)',
    formula: 'BF₃',
    stericNumber: 3,
    lonePairs: 0,
    hybridization: 'sp²',
    bondAngle: '120°',
    centralColor: '#f472b6',
    ligandColor: '#10b981',
    ligandPositions: [
      [0, 1.8, 0],
      [-1.56, -0.9, 0],
      [1.56, -0.9, 0],
    ],
  },
  tetrahedral: {
    id: 'tetrahedral',
    name: 'Tetrahedral (AX₄)',
    formula: 'CH₄ (Methane)',
    stericNumber: 4,
    lonePairs: 0,
    hybridization: 'sp³',
    bondAngle: '109.5°',
    centralColor: '#64748b',
    ligandColor: '#f8fafc',
    ligandPositions: [
      [0, 1.8, 0],
      [1.7, -0.6, 0],
      [-0.85, -0.6, 1.47],
      [-0.85, -0.6, -1.47],
    ],
  },
  'bent-water': {
    id: 'bent-water',
    name: 'Bent / Angular (AX₂E₂)',
    formula: 'H₂O (Water)',
    stericNumber: 4,
    lonePairs: 2,
    hybridization: 'sp³',
    bondAngle: '104.5°',
    centralColor: '#ef4444',
    ligandColor: '#f8fafc',
    ligandPositions: [
      [-1.4, -0.9, 0],
      [1.4, -0.9, 0],
    ],
    lonePairPositions: [
      [0, 1.1, 1.1],
      [0, 1.1, -1.1],
    ],
  },
  'trigonal-bipyramidal': {
    id: 'trigonal-bipyramidal',
    name: 'Trigonal Bipyramidal (AX₅)',
    formula: 'PCl₅',
    stericNumber: 5,
    lonePairs: 0,
    hybridization: 'sp³d',
    bondAngle: '90° (axial) & 120° (eq)',
    centralColor: '#f97316',
    ligandColor: '#22c55e',
    ligandPositions: [
      [0, 1.9, 0],
      [0, -1.9, 0],
      [1.8, 0, 0],
      [-0.9, 0, 1.56],
      [-0.9, 0, -1.56],
    ],
  },
  octahedral: {
    id: 'octahedral',
    name: 'Octahedral (AX₆)',
    formula: 'SF₆',
    stericNumber: 6,
    lonePairs: 0,
    hybridization: 'sp³d²',
    bondAngle: '90°',
    centralColor: '#eab308',
    ligandColor: '#10b981',
    ligandPositions: [
      [1.8, 0, 0],
      [-1.8, 0, 0],
      [0, 1.8, 0],
      [0, -1.8, 0],
      [0, 0, 1.8],
      [0, 0, -1.8],
    ],
  },
};

const ELEMENTS_1_TO_20 = [
  { z: 1, sym: 'H', name: 'Hydrogen', mass: 1, shells: [1] },
  { z: 2, sym: 'He', name: 'Helium', mass: 4, shells: [2] },
  { z: 3, sym: 'Li', name: 'Lithium', mass: 7, shells: [2, 1] },
  { z: 4, sym: 'Be', name: 'Beryllium', mass: 9, shells: [2, 2] },
  { z: 5, sym: 'B', name: 'Boron', mass: 11, shells: [2, 3] },
  { z: 6, sym: 'C', name: 'Carbon', mass: 12, shells: [2, 4] },
  { z: 7, sym: 'N', name: 'Nitrogen', mass: 14, shells: [2, 5] },
  { z: 8, sym: 'O', name: 'Oxygen', mass: 16, shells: [2, 6] },
  { z: 9, sym: 'F', name: 'Fluorine', mass: 19, shells: [2, 7] },
  { z: 10, sym: 'Ne', name: 'Neon', mass: 20, shells: [2, 8] },
  { z: 11, sym: 'Na', name: 'Sodium', mass: 23, shells: [2, 8, 1] },
  { z: 12, sym: 'Mg', name: 'Magnesium', mass: 24, shells: [2, 8, 2] },
  { z: 13, sym: 'Al', name: 'Aluminium', mass: 27, shells: [2, 8, 3] },
  { z: 14, sym: 'Si', name: 'Silicon', mass: 28, shells: [2, 8, 4] },
  { z: 15, sym: 'P', name: 'Phosphorus', mass: 31, shells: [2, 8, 5] },
  { z: 16, sym: 'S', name: 'Sulfur', mass: 32, shells: [2, 8, 6] },
  { z: 17, sym: 'Cl', name: 'Chlorine', mass: 35.5, shells: [2, 8, 7] },
  { z: 18, sym: 'Ar', name: 'Argon', mass: 40, shells: [2, 8, 8] },
  { z: 19, sym: 'K', name: 'Potassium', mass: 39, shells: [2, 8, 8, 1] },
  { z: 20, sym: 'Ca', name: 'Calcium', mass: 40, shells: [2, 8, 8, 2] },
];

const VSEPRMesh: React.FC<{ spec: VSEPRSpec }> = ({ spec }) => {
  const groupRef = useRef<THREE.Group>(null);
  useFrame((_, dt) => {
    if (groupRef.current) {
      groupRef.current.rotation.y += dt * 0.45;
    }
  });

  return (
    <group ref={groupRef}>
      {/* Central Atom */}
      <mesh position={[0, 0, 0]}>
        <sphereGeometry args={[0.55, 32, 32]} />
        <meshStandardMaterial color={spec.centralColor} roughness={0.25} metalness={0.2} />
      </mesh>

      {/* Ligands & Covalent Bond Cylinders */}
      {spec.ligandPositions.map((pos, idx) => {
        const vec = new THREE.Vector3(...pos);
        const len = vec.length();
        const mid = vec.clone().multiplyScalar(0.5);
        const quat = new THREE.Quaternion().setFromUnitVectors(
          new THREE.Vector3(0, 1, 0),
          vec.clone().normalize()
        );

        return (
          <group key={idx}>
            <mesh position={[mid.x, mid.y, mid.z]} quaternion={quat}>
              <cylinderGeometry args={[0.11, 0.11, len, 16]} />
              <meshStandardMaterial color="#cbd5e1" />
            </mesh>
            <mesh position={pos}>
              <sphereGeometry args={[0.38, 28, 28]} />
              <meshStandardMaterial color={spec.ligandColor} roughness={0.3} />
            </mesh>
          </group>
        );
      })}

      {/* Non-bonding Lone Pair Lobes */}
      {spec.lonePairPositions?.map((lp, idx) => (
        <group key={`lp-${idx}`} position={lp}>
          <mesh>
            <sphereGeometry args={[0.42, 24, 24]} />
            <meshStandardMaterial
              color="#38bdf8"
              transparent
              opacity={0.42}
              emissive="#06b6d4"
              emissiveIntensity={0.4}
            />
          </mesh>
          <Html center distanceFactor={10}>
            <span className="px-1.5 py-0.5 rounded bg-cyan-950/90 border border-cyan-400 text-[10px] font-mono text-cyan-200">
              LP (··)
            </span>
          </Html>
        </group>
      ))}
    </group>
  );
};

const BohrAtom3DMesh: React.FC<{ atomicNumber: number }> = ({ atomicNumber }) => {
  const el = ELEMENTS_1_TO_20[atomicNumber - 1] || ELEMENTS_1_TO_20[5];
  const shellRefs = useRef<(THREE.Group | null)[]>([]);

  useFrame((_, dt) => {
    shellRefs.current.forEach((grp, idx) => {
      if (grp) {
        grp.rotation.z += dt * (1.5 - idx * 0.28);
      }
    });
  });

  return (
    <group>
      {/* Nucleus */}
      <mesh>
        <sphereGeometry args={[0.48, 28, 28]} />
        <meshStandardMaterial color="#f43f5e" emissive="#e11d48" emissiveIntensity={0.4} />
      </mesh>
      <Html position={[0, 0.72, 0]} center distanceFactor={10}>
        <span className="px-2 py-0.5 rounded bg-slate-900/95 border border-rose-500/50 text-xs font-mono font-bold text-rose-300">
          {el.sym} (Z={el.z})
        </span>
      </Html>

      {/* Concentric Bohr Shells (K, L, M, N) */}
      {el.shells.map((eCount, sIdx) => {
        const radius = 1.15 + sIdx * 0.75;
        return (
          <group
            key={sIdx}
            ref={(node) => {
              shellRefs.current[sIdx] = node;
            }}
            rotation={[0.35 * sIdx, 0.25 * sIdx, 0]}
          >
            <mesh>
              <ringGeometry args={[radius - 0.02, radius + 0.02, 64]} />
              <meshBasicMaterial color="#334155" side={THREE.DoubleSide} />
            </mesh>
            {Array.from({ length: eCount }).map((_, eIdx) => {
              const angle = (eIdx / eCount) * Math.PI * 2;
              return (
                <mesh
                  key={eIdx}
                  position={[Math.cos(angle) * radius, Math.sin(angle) * radius, 0]}
                >
                  <sphereGeometry args={[0.13, 16, 16]} />
                  <meshStandardMaterial
                    color="#38bdf8"
                    emissive="#06b6d4"
                    emissiveIntensity={0.8}
                  />
                </mesh>
              );
            })}
          </group>
        );
      })}
    </group>
  );
};

export const MolecularVSEPR3D: React.FC<{ initialMode?: string }> = ({
  initialMode,
}) => {
  const [mode, setMode] = useState<ChemMode>(
    initialMode === 'bohr' ? 'bohr' : 'vsepr'
  );
  const [vseprKey, setVseprKey] = useState<VSEPRKey>('tetrahedral');
  const [atomicZ, setAtomicZ] = useState(6); // Carbon default

  const activeSpec = VSEPR_SHAPES[vseprKey];
  const activeElement = ELEMENTS_1_TO_20[atomicZ - 1];

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-2 p-2.5 rounded-xl bg-[#111827] border border-[#1F2937]">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setMode('vsepr')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              mode === 'vsepr'
                ? 'bg-cyan-500 text-slate-950'
                : 'bg-[#090D16] text-slate-300 border border-slate-800'
            }`}
          >
            <Hexagon className="w-3.5 h-3.5" />
            3D VSEPR Molecular Geometry & Hybridization (Class 11–12)
          </button>
          <button
            type="button"
            onClick={() => setMode('bohr')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              mode === 'bohr'
                ? 'bg-cyan-500 text-slate-950'
                : 'bg-[#090D16] text-slate-300 border border-slate-800'
            }`}
          >
            <Atom className="w-3.5 h-3.5" />
            3D Bohr Atomic Shells (K, L, M, N — Class 8–10)
          </button>
        </div>
      </div>

      {mode === 'vsepr' ? (
        <>
          <Scene3DWrapper
            title={`3D VSEPR Geometry — ${activeSpec.name} [${activeSpec.formula}]`}
            subtitle={`Hybridization: ${activeSpec.hybridization} • Bond Angle: ${activeSpec.bondAngle} • Lone Pairs: ${activeSpec.lonePairs}`}
            cameraPosition={[0, 2.2, 5.2]}
            height={410}
          >
            <VSEPRMesh spec={activeSpec} />
          </Scene3DWrapper>

          <FormulaCard
            label="Steric Number & Hybridization Rule"
            latex="\text{Steric Number (SN)} = \frac{1}{2}(V + M - C + A) = \text{Bond Pairs} + \text{Lone Pairs}"
            liveSubstitution={`\\text{SN} = ${activeSpec.stericNumber} \\implies \\text{Hybridization: } ${activeSpec.hybridization},\\quad \\theta = ${activeSpec.bondAngle}`}
          />

          <ParameterPanel
            title="Select VSEPR 3D Molecular Geometry"
            presets={(Object.keys(VSEPR_SHAPES) as VSEPRKey[]).map((k) => ({
              id: k,
              label: `${VSEPR_SHAPES[k].name.split(' (')[0]} (${VSEPR_SHAPES[k].formula.split(' ')[0]})`,
              active: vseprKey === k,
              onSelect: () => setVseprKey(k),
            }))}
            telemetry={[
              { label: 'Molecule', value: activeSpec.formula, color: 'cyan' },
              { label: 'Hybridization', value: activeSpec.hybridization, color: 'emerald' },
              { label: 'Bond Angle', value: activeSpec.bondAngle, color: 'amber' },
              { label: 'Lone Pairs (E)', value: `${activeSpec.lonePairs}`, color: 'violet' },
            ]}
          />
        </>
      ) : (
        <>
          <Scene3DWrapper
            title={`3D Bohr Atomic Shell Model — ${activeElement.name} (${activeElement.sym}, Z=${activeElement.z})`}
            subtitle={`Electronic Configuration (K, L, M, N): ${activeElement.shells.join(', ')}`}
            cameraPosition={[0, 0, 6.5]}
            height={410}
            showFloorGrid={false}
          >
            <BohrAtom3DMesh atomicNumber={atomicZ} />
          </Scene3DWrapper>

          <FormulaCard
            label="Bohr-Bury Shell Capacity Rule"
            latex="\text{Max Electrons in } n^{\text{th}}\text{ Shell} = 2n^2 \quad (K=2,\; L=8,\; M=18,\; N=32)"
            liveSubstitution={`_{${activeElement.z}}^{${activeElement.mass}}\\text{${activeElement.sym}} \\implies \\text{Shells: } (${activeElement.shells.join(', ')})`}
          />

          <ParameterPanel
            title="Element Atomic Number Selector (Z = 1 to 20)"
            sliders={[
              {
                id: 'z',
                label: 'Atomic Number (Z = Protons)',
                value: atomicZ,
                min: 1,
                max: 20,
                step: 1,
                onChange: setAtomicZ,
              },
            ]}
            telemetry={[
              { label: 'Element', value: `${activeElement.name} (${activeElement.sym})`, color: 'cyan' },
              { label: 'Shell Config', value: activeElement.shells.join(' - '), color: 'emerald' },
              {
                label: 'Valence Electrons',
                value: `${activeElement.shells[activeElement.shells.length - 1]}`,
                color: 'amber',
              },
              { label: 'Mass Number (A)', value: `${activeElement.mass}`, unit: 'u', color: 'rose' },
            ]}
          />
        </>
      )}
    </div>
  );
};
