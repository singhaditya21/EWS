import React, { useState, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Html } from '@react-three/drei';
import * as THREE from 'three';
import { Scene3DWrapper } from '../../components/engine/Scene3DWrapper';
import { ParameterPanel } from '../../components/engine/ParameterPanel';
import { FormulaCard } from '../../components/engine/FormulaCard';

const BASE_SEQUENCE: ('A-T' | 'T-A' | 'G-C' | 'C-G')[] = [
  'A-T',
  'G-C',
  'C-G',
  'T-A',
  'A-T',
  'G-C',
  'T-A',
  'C-G',
  'G-C',
  'A-T',
  'T-A',
  'G-C',
  'C-G',
  'A-T',
];

const BASE_COLORS: Record<string, string> = {
  A: '#10b981', // Adenine (Green)
  T: '#f43f5e', // Thymine (Rose)
  G: '#38bdf8', // Guanine (Cyan)
  C: '#f59e0b', // Cytosine (Amber)
};

interface DNAHelixMeshProps {
  unzipFactor: number;
  twistSpeed: number;
  showLabels: boolean;
}

const DNAHelixMesh: React.FC<DNAHelixMeshProps> = ({
  unzipFactor,
  twistSpeed,
  showLabels,
}) => {
  const groupRef = useRef<THREE.Group>(null);

  useFrame((_, dt) => {
    if (groupRef.current) {
      groupRef.current.rotation.y += dt * twistSpeed;
    }
  });

  const numPairs = BASE_SEQUENCE.length;

  return (
    <group ref={groupRef}>
      {BASE_SEQUENCE.map((pair, idx) => {
        const y = (idx - (numPairs - 1) / 2) * 0.42;
        const normalizedFromBottom = 1 - idx / (numPairs - 1);
        // Helicase unzipping starts from bottom fork up to unzipFactor
        const unzipAmount = Math.max(
          0,
          (unzipFactor - normalizedFromBottom) * 2.4
        );

        const angle = idx * 0.62;
        const radius = 1.15 + unzipAmount;

        const x1 = Math.cos(angle) * radius;
        const z1 = Math.sin(angle) * radius;
        const x2 = -Math.cos(angle) * radius;
        const z2 = -Math.sin(angle) * radius;

        const [b1, b2] = pair.split('-');
        const vec1 = new THREE.Vector3(x1, y, z1);
        const vec2 = new THREE.Vector3(x2, y, z2);
        const halfRungLen = radius * 0.88;

        const dir = vec2.clone().sub(vec1).normalize();
        const quat = new THREE.Quaternion().setFromUnitVectors(
          new THREE.Vector3(0, 1, 0),
          dir
        );

        return (
          <group key={idx}>
            {/* Strand 1 Sugar-Phosphate Backbone Sphere */}
            <mesh position={[x1, y, z1]}>
              <sphereGeometry args={[0.19, 20, 20]} />
              <meshStandardMaterial color="#a855f7" roughness={0.3} />
            </mesh>

            {/* Strand 2 Sugar-Phosphate Backbone Sphere */}
            <mesh position={[x2, y, z2]}>
              <sphereGeometry args={[0.19, 20, 20]} />
              <meshStandardMaterial color="#ec4899" roughness={0.3} />
            </mesh>

            {/* Half-Rung 1 (Nitrogenous Base 1) */}
            <mesh
              position={[x1 * 0.55, y, z1 * 0.55]}
              quaternion={quat}
            >
              <cylinderGeometry args={[0.08, 0.08, halfRungLen, 14]} />
              <meshStandardMaterial color={BASE_COLORS[b1]} />
            </mesh>

            {/* Half-Rung 2 (Complementary Nitrogenous Base 2) */}
            <mesh
              position={[x2 * 0.55, y, z2 * 0.55]}
              quaternion={quat}
            >
              <cylinderGeometry args={[0.08, 0.08, halfRungLen, 14]} />
              <meshStandardMaterial color={BASE_COLORS[b2]} />
            </mesh>

            {/* Sparse 3D Nucleotide Pair Pin */}
            {showLabels && idx % 4 === 1 && (
              <Html position={[0, y, 0]} center distanceFactor={10}>
                <span className="px-2 py-0.5 rounded bg-slate-900/90 border border-emerald-500/40 text-[10px] font-mono text-emerald-300 whitespace-nowrap">
                  {pair} ({b1 === 'G' || b1 === 'C' ? '3 H-Bonds' : '2 H-Bonds'})
                </span>
              </Html>
            )}
          </group>
        );
      })}
    </group>
  );
};

export const DNAReplication3D: React.FC = () => {
  const [unzipFactor, setUnzipFactor] = useState(0.25);
  const [twistSpeed, setTwistSpeed] = useState(0.5);
  const [gcContent, setGcContent] = useState(50); // % G-C base pairs
  const [showLabels, setShowLabels] = useState(true);

  const adenineThyminePct = 100 - gcContent;
  const eachGC = (gcContent / 2).toFixed(1);
  const eachAT = (adenineThyminePct / 2).toFixed(1);

  return (
    <div className="space-y-4">
      <Scene3DWrapper
        title="3D B-DNA Double Helix & Helicase Replication Fork"
        subtitle="Green = Adenine (A) • Rose = Thymine (T) • Cyan = Guanine (G) • Amber = Cytosine (C)"
        cameraPosition={[0, 0.5, 6.8]}
        height={410}
        overlayControls={
          <button
            type="button"
            onClick={() => setShowLabels((s) => !s)}
            className="px-2.5 py-1 rounded bg-slate-800 text-xs text-emerald-300 border border-slate-700"
          >
            {showLabels ? 'Hide Base Pins' : 'Show Base Pins'}
          </button>
        }
      >
        <DNAHelixMesh
          unzipFactor={unzipFactor}
          twistSpeed={twistSpeed}
          showLabels={showLabels}
        />
      </Scene3DWrapper>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <FormulaCard
          label="Chargaff's Base Equivalence Rules"
          latex="[A] = [T], \quad [G] = [C], \quad [A] + [G] = [T] + [C] = 50\%"
          liveSubstitution={`G = ${eachGC}\\%,\\; C = ${eachGC}\\%,\\; A = ${eachAT}\\%,\\; T = ${eachAT}\\%`}
          accentColor="emerald"
        />
        <FormulaCard
          label="Watson-Crick B-DNA Helical Geometry"
          latex="\text{Pitch} = 3.4\text{ nm (10 bp/turn)}, \quad \text{Rise/bp} = 0.34\text{ nm}, \quad d = 2.0\text{ nm}"
          liveSubstitution={`\\text{Replication Fork Unzip} = ${Math.round(
            unzipFactor * 100
          )}\\% \\text{ (Helicase Active)}`}
          accentColor="emerald"
        />
      </div>

      <ParameterPanel
        title="DNA Helicase Unzipping & Chargaff Stoichiometry Controls"
        presets={[
          {
            id: 'intact',
            label: 'Intact B-DNA Double Helix (0% Unzip)',
            active: unzipFactor === 0,
            onSelect: () => setUnzipFactor(0),
          },
          {
            id: 'fork',
            label: 'Active Replication Fork (50% Unzip)',
            active: Math.abs(unzipFactor - 0.5) < 0.05,
            onSelect: () => setUnzipFactor(0.5),
          },
          {
            id: 'denatured',
            label: 'Full Strand Separation (95% Unzip)',
            active: unzipFactor >= 0.9,
            onSelect: () => setUnzipFactor(0.95),
          },
        ]}
        sliders={[
          {
            id: 'unzip',
            label: 'Helicase Replication Unzipping',
            value: unzipFactor,
            min: 0,
            max: 1,
            step: 0.05,
            onChange: setUnzipFactor,
          },
          {
            id: 'gc',
            label: 'G≡C Content Percentage (Melting Stability)',
            value: gcContent,
            min: 20,
            max: 80,
            step: 2,
            unit: '%',
            onChange: setGcContent,
          },
          {
            id: 'rot',
            label: '3D Helical Rotation Speed',
            value: twistSpeed,
            min: 0,
            max: 2.0,
            step: 0.1,
            unit: 'rad/s',
            onChange: setTwistSpeed,
          },
        ]}
        telemetry={[
          { label: 'Replication Fork', value: `${Math.round(unzipFactor * 100)}% Open`, color: 'emerald' },
          { label: 'Purine : Pyrimidine', value: '1 : 1', color: 'cyan' },
          { label: 'A=T / G≡C Ratio', value: `${adenineThyminePct}% / ${gcContent}%`, color: 'amber' },
          {
            label: 'Melting Temp (T_m)',
            value: `${(64.9 + 0.41 * gcContent).toFixed(1)}`,
            unit: '°C',
            color: 'rose',
          },
        ]}
      />
    </div>
  );
};
