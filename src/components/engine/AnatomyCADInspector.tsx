import React, { useState, useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import { Html } from '@react-three/drei';
import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { Scene3DWrapper } from './Scene3DWrapper';
import { CADPresetId } from '../../types/curriculum.types';
import {
  Layers,
  MapPin,
  Upload,
  Eye,
  Scissors,
  Sparkles,
  RotateCcw,
  Info,
} from 'lucide-react';

interface SubComponentSpec {
  id: string;
  name: string;
  role: string;
  clinicalOrEngNote: string;
  color: string;
  wireframe?: boolean;
  opacity?: number;
  basePos: [number, number, number];
  explodeDir: [number, number, number];
  geometryType:
    | 'sphere'
    | 'cylinder'
    | 'torus'
    | 'box'
    | 'cone'
    | 'octahedron'
    | 'capsule';
  args: number[];
  rotation?: [number, number, number];
}

interface PresetAssembly {
  id: CADPresetId;
  title: string;
  category: 'Medical Anatomy' | 'Engineering CAD' | 'Cell Biology';
  description: string;
  parts: SubComponentSpec[];
}

const ASSEMBLIES: Record<CADPresetId, PresetAssembly> = {
  'heart-thorax': {
    id: 'heart-thorax',
    title: '4-Chamber Human Heart & Great Vessels Assembly',
    category: 'Medical Anatomy',
    description:
      'Multi-layer anatomical model showing ventricles, atria, aortic arch, pulmonary trunk, and pericardial shell.',
    parts: [
      {
        id: 'lv',
        name: 'Left Ventricle (Myocardium)',
        role: 'High-pressure systemic pump (120 mmHg systolic)',
        clinicalOrEngNote:
          'Thickest myocardial wall (10–15 mm) to overcome systemic vascular resistance (afterload). Hypertrophies in chronic hypertension.',
        color: '#e11d48',
        basePos: [-0.45, -0.35, 0.2],
        explodeDir: [-1.4, -0.8, 0.6],
        geometryType: 'cone',
        args: [0.75, 1.65, 28],
        rotation: [0, 0, 3.0],
      },
      {
        id: 'rv',
        name: 'Right Ventricle',
        role: 'Low-pressure pulmonary pump (25 mmHg systolic)',
        clinicalOrEngNote:
          'Crescent-shaped chamber pumping deoxygenated blood via the pulmonary valve into the pulmonary trunk.',
        color: '#3b82f6',
        basePos: [0.5, -0.35, 0.25],
        explodeDir: [1.4, -0.8, 0.7],
        geometryType: 'cone',
        args: [0.68, 1.5, 28],
        rotation: [0, 0, -2.95],
      },
      {
        id: 'la',
        name: 'Left Atrium & Pulmonary Veins',
        role: 'Receives oxygenated blood from 4 pulmonary veins',
        clinicalOrEngNote:
          'Empties into the Left Ventricle via the Bicuspid (Mitral) Valve. Enlargement predisposes to atrial fibrillation.',
        color: '#f43f5e',
        basePos: [-0.55, 0.75, -0.1],
        explodeDir: [-1.3, 1.1, -0.6],
        geometryType: 'sphere',
        args: [0.58, 28, 28],
      },
      {
        id: 'ra',
        name: 'Right Atrium & SA Node Region',
        role: 'Pacemaker chamber receiving SVC & IVC blood',
        clinicalOrEngNote:
          'Houses the Sinoatrial (SA) node at the crista terminalis and the AV node near the interatrial septum.',
        color: '#2563eb',
        basePos: [0.6, 0.75, -0.05],
        explodeDir: [1.3, 1.1, -0.5],
        geometryType: 'sphere',
        args: [0.56, 28, 28],
      },
      {
        id: 'aorta',
        name: 'Ascending Aorta & Aortic Arch',
        role: 'Main systemic arterial conduit with Windkessel elastic recoil',
        clinicalOrEngNote:
          'Branches into Brachiocephalic trunk, Left Common Carotid, and Left Subclavian arteries.',
        color: '#ef4444',
        basePos: [-0.1, 1.35, 0],
        explodeDir: [0, 1.8, 0.3],
        geometryType: 'torus',
        args: [0.55, 0.2, 20, 40, Math.PI],
      },
      {
        id: 'pericardium',
        name: 'Serous & Fibrous Pericardial Sac',
        role: 'Outer protective double-walled fibroserous membrane',
        clinicalOrEngNote:
          'Contains 15–50 mL of pericardial fluid to eliminate friction during cardiac contraction.',
        color: '#94a3b8',
        opacity: 0.22,
        wireframe: true,
        basePos: [0, 0.2, 0],
        explodeDir: [0, 0, -2.0],
        geometryType: 'sphere',
        args: [1.65, 24, 24],
      },
    ],
  },
  'brain-cranium': {
    id: 'brain-cranium',
    title: 'Human Encephalon, Limbic Core & Cranial Vault',
    category: 'Medical Anatomy',
    description:
      '3D neuroanatomical dissection of Left/Right Cerebral Hemispheres, Corpus Callosum, Thalamus, Cerebellum, and Brainstem.',
    parts: [
      {
        id: 'lh',
        name: 'Left Cerebral Hemisphere (Cortex)',
        role: 'Language (Broca/Wernicke), analytical & right-body motor control',
        clinicalOrEngNote:
          'Supplied primarily by the Left Middle & Anterior Cerebral Arteries (MCA/ACA).',
        color: '#f472b6',
        basePos: [-0.62, 0.45, 0],
        explodeDir: [-1.6, 0.6, 0],
        geometryType: 'sphere',
        args: [0.95, 28, 28],
      },
      {
        id: 'rh',
        name: 'Right Cerebral Hemisphere (Cortex)',
        role: 'Visuospatial processing, prosody & left-body motor control',
        clinicalOrEngNote:
          'Separated from the left hemisphere by the longitudinal fissure and falx cerebri.',
        color: '#ec4899',
        basePos: [0.62, 0.45, 0],
        explodeDir: [1.6, 0.6, 0],
        geometryType: 'sphere',
        args: [0.95, 28, 28],
      },
      {
        id: 'diencephalon',
        name: 'Thalamus & Hypothalamic Core',
        role: 'Sensory relay station & neuroendocrine homeostasis center',
        clinicalOrEngNote:
          'Regulates autonomic nervous system and pituitary hormone secretion via the infundibulum.',
        color: '#a855f7',
        basePos: [0, 0.15, 0],
        explodeDir: [0, 1.5, 1.2],
        geometryType: 'sphere',
        args: [0.48, 24, 24],
      },
      {
        id: 'cerebellum',
        name: 'Cerebellum (Arbor Vitae)',
        role: 'Fine motor coordination, posture, balance & motor learning',
        clinicalOrEngNote:
          'Lesions produce ipsilateral ataxia, dysmetria, and intention tremor.',
        color: '#fb923c',
        basePos: [0, -0.55, -0.65],
        explodeDir: [0, -0.9, -1.6],
        geometryType: 'sphere',
        args: [0.62, 24, 24],
      },
      {
        id: 'brainstem',
        name: 'Brainstem (Midbrain, Pons, Medulla)',
        role: 'Cardiorespiratory centers & cranial nerve nuclei (CN III–XII)',
        clinicalOrEngNote:
          'Contains corticospinal tracts (pyramidal decussation) and reticular activating system (RAS).',
        color: '#38bdf8',
        basePos: [0, -0.95, 0.05],
        explodeDir: [0, -1.8, 0.6],
        geometryType: 'cylinder',
        args: [0.28, 0.22, 1.35, 24],
      },
    ],
  },
  'turbofan-jet': {
    id: 'turbofan-jet',
    title: 'High-Bypass Axial Turbofan Aero-Engine CAD',
    category: 'Engineering CAD',
    description:
      'Axial-flow gas turbine assembly demonstrating Brayton Cycle stages: Low-Pressure Fan, High-Pressure Compressor, Annular Combustor, and Turbine.',
    parts: [
      {
        id: 'fan',
        name: 'Titanium Wide-Chord Intake Fan Stage',
        role: 'Accelerates bypass + core air mass flow (Bypass Ratio 9:1)',
        clinicalOrEngNote:
          'Produces ~80% of total net thrust in modern high-bypass commercial turbofans.',
        color: '#38bdf8',
        basePos: [-1.6, 0, 0],
        explodeDir: [-2.0, 0, 0],
        geometryType: 'cylinder',
        args: [1.25, 1.25, 0.35, 32],
        rotation: [0, 0, Math.PI / 2],
      },
      {
        id: 'hpc',
        name: 'Multi-Stage High-Pressure Axial Compressor (HPC)',
        role: 'Isentropic compression raising pressure ratio (PR = 40:1)',
        clinicalOrEngNote:
          'Alternating rotor blades and stator vanes convert shaft kinetic energy into static pressure rise.',
        color: '#0284c7',
        basePos: [-0.65, 0, 0],
        explodeDir: [-0.8, 1.0, 0],
        geometryType: 'cylinder',
        args: [0.85, 0.7, 0.9, 28],
        rotation: [0, 0, Math.PI / 2],
      },
      {
        id: 'combustor',
        name: 'Annular Isobaric Combustion Chamber',
        role: 'Constant-pressure fuel-air heat addition (T_max ~ 1700 K)',
        clinicalOrEngNote:
          'Inconel/ceramic thermal-barrier coated liner with effusion cooling holes.',
        color: '#f97316',
        basePos: [0.25, 0, 0],
        explodeDir: [0, 1.6, 0],
        geometryType: 'torus',
        args: [0.58, 0.24, 20, 32],
        rotation: [0, Math.PI / 2, 0],
      },
      {
        id: 'hpt',
        name: 'Single-Crystal High-Pressure Turbine (HPT)',
        role: 'Extracts enthalpy from hot gas stream to drive compressor shaft',
        clinicalOrEngNote:
          'Cast from single-crystal nickel superalloy to resist creep at temperatures above melting point.',
        color: '#ef4444',
        basePos: [1.05, 0, 0],
        explodeDir: [1.2, 0.9, 0],
        geometryType: 'cylinder',
        args: [0.75, 0.9, 0.65, 28],
        rotation: [0, 0, Math.PI / 2],
      },
      {
        id: 'nozzle',
        name: 'Convergent Exhaust Nozzle & Nacelle Cowl',
        role: 'Accelerates exhaust gas to high-velocity propulsive jet',
        clinicalOrEngNote:
          'Outer nacelle shroud can be sliced with the Y/Z clipping plane to inspect internal rotor stages.',
        color: '#94a3b8',
        opacity: 0.25,
        wireframe: true,
        basePos: [0, 0, 0],
        explodeDir: [2.0, -1.0, 0],
        geometryType: 'cylinder',
        args: [1.35, 1.05, 3.6, 32],
        rotation: [0, 0, Math.PI / 2],
      },
    ],
  },
  'planetary-gearbox': {
    id: 'planetary-gearbox',
    title: 'Epicyclic (Planetary) Gear Train & Torque Transmission',
    category: 'Engineering CAD',
    description:
      'Coaxial mechanical power transmission assembly consisting of Central Sun Gear, Planet Gears, Planet Carrier, and Outer Ring Annulus.',
    parts: [
      {
        id: 'sun',
        name: 'Central Sun Gear (Input Shaft)',
        role: 'High-speed central driving pinion (Z_s = 24 teeth)',
        clinicalOrEngNote:
          'Case-hardened alloy steel spur/helical gear transmitting input torque to surrounding planet gears.',
        color: '#f59e0b',
        basePos: [0, 0, 0],
        explodeDir: [0, 0, 1.8],
        geometryType: 'cylinder',
        args: [0.55, 0.55, 0.5, 24],
        rotation: [Math.PI / 2, 0, 0],
      },
      {
        id: 'planet1',
        name: 'Planet Gear #1 (Upper Epicyclic Pinion)',
        role: 'Meshes simultaneously with Sun Gear and Ring Gear (Z_p = 18)',
        clinicalOrEngNote:
          'Distributes tooth root bending stress across multiple parallel load paths.',
        color: '#06b6d4',
        basePos: [0, 0.95, 0],
        explodeDir: [0, 1.5, 0.6],
        geometryType: 'cylinder',
        args: [0.38, 0.38, 0.5, 20],
        rotation: [Math.PI / 2, 0, 0],
      },
      {
        id: 'planet2',
        name: 'Planet Gear #2 (Lower-Left Pinion)',
        role: 'Load-sharing epicyclic pinion at 120° phase spacing',
        clinicalOrEngNote:
          'Supported on needle roller bearings mounted to the rigid planet carrier.',
        color: '#06b6d4',
        basePos: [-0.82, -0.47, 0],
        explodeDir: [-1.4, -0.9, 0.6],
        geometryType: 'cylinder',
        args: [0.38, 0.38, 0.5, 20],
        rotation: [Math.PI / 2, 0, 0],
      },
      {
        id: 'planet3',
        name: 'Planet Gear #3 (Lower-Right Pinion)',
        role: 'Load-sharing epicyclic pinion at 240° phase spacing',
        clinicalOrEngNote:
          'Cancels radial bearing reaction forces on the central input/output shafts.',
        color: '#06b6d4',
        basePos: [0.82, -0.47, 0],
        explodeDir: [1.4, -0.9, 0.6],
        geometryType: 'cylinder',
        args: [0.38, 0.38, 0.5, 20],
        rotation: [Math.PI / 2, 0, 0],
      },
      {
        id: 'ring',
        name: 'Outer Ring Gear (Internal Annulus)',
        role: 'Internal-tooth ring housing (Z_r = Z_s + 2*Z_p = 60 teeth)',
        clinicalOrEngNote:
          'When held stationary, reduction ratio i = 1 + Z_r / Z_s = 3.5:1.',
        color: '#10b981',
        basePos: [0, 0, 0],
        explodeDir: [0, 0, -1.6],
        geometryType: 'torus',
        args: [1.42, 0.22, 20, 48],
      },
    ],
  },
  'cell-ultrastructure': {
    id: 'cell-ultrastructure',
    title: 'Eukaryotic Cell 3D Organelle Ultrastructure',
    category: 'Cell Biology',
    description:
      'CBSE/ICSE Class 9 & 11 Biology 3D Eukaryotic Cell showing Nucleus, Nucleolus, Mitochondria, Endoplasmic Reticulum, and Plasma Membrane.',
    parts: [
      {
        id: 'nucleus',
        name: 'Nucleus & Nuclear Envelope',
        role: 'Stores genomic DNA chromatin & regulates gene transcription',
        clinicalOrEngNote:
          'Double-membrane envelope perforated by nuclear pore complexes (NPCs) for mRNA export.',
        color: '#8b5cf6',
        basePos: [0, 0.1, 0],
        explodeDir: [0, 1.4, 0],
        geometryType: 'sphere',
        args: [0.7, 28, 28],
      },
      {
        id: 'mito1',
        name: 'Mitochondrion (Powerhouse Organelle)',
        role: 'Oxidative phosphorylation & ATP synthesis (Krebs + ETC)',
        clinicalOrEngNote:
          'Semi-autonomous organelle containing circular mtDNA and 70S ribosomes; cristae maximize inner membrane surface area.',
        color: '#f97316',
        basePos: [1.05, 0.2, 0.3],
        explodeDir: [1.7, 0.5, 0.8],
        geometryType: 'capsule',
        args: [0.25, 0.5, 16, 24],
        rotation: [0.4, 0.3, 0.6],
      },
      {
        id: 'er',
        name: 'Rough Endoplasmic Reticulum & Golgi Network',
        role: 'Cotranslational protein folding, glycosylation & vesicular sorting',
        clinicalOrEngNote:
          'Studded with 80S cytoplasmic ribosomes; cis-to-trans Golgi cisternae package secretory proteins.',
        color: '#06b6d4',
        basePos: [-0.85, -0.2, 0.2],
        explodeDir: [-1.6, -0.5, 0.7],
        geometryType: 'torus',
        args: [0.55, 0.14, 16, 32],
        rotation: [0.8, 0.4, 0],
      },
      {
        id: 'membrane',
        name: 'Phospholipid Bilayer Plasma Membrane',
        role: 'Selectively permeable Fluid-Mosaic boundary (Singer & Nicolson)',
        clinicalOrEngNote:
          'Composed of amphipathic phospholipids, cholesterol, and integral/peripheral proteins.',
        color: '#10b981',
        opacity: 0.24,
        wireframe: true,
        basePos: [0, 0, 0],
        explodeDir: [0, -1.6, -1.2],
        geometryType: 'sphere',
        args: [1.75, 28, 28],
      },
    ],
  },
};

interface ProceduralAssemblyMeshProps {
  assembly: PresetAssembly;
  explodeFactor: number;
  selectedPartId: string;
  onSelectPart: (id: string) => void;
  showPins: boolean;
  autoRotate: boolean;
}

const ProceduralAssemblyMesh: React.FC<ProceduralAssemblyMeshProps> = ({
  assembly,
  explodeFactor,
  selectedPartId,
  onSelectPart,
  showPins,
  autoRotate,
}) => {
  const groupRef = useRef<THREE.Group>(null);

  useFrame((_, delta) => {
    if (groupRef.current && autoRotate) {
      groupRef.current.rotation.y += delta * 0.35;
    }
  });

  return (
    <group ref={groupRef}>
      {assembly.parts.map((part) => {
        const px = part.basePos[0] + part.explodeDir[0] * explodeFactor;
        const py = part.basePos[1] + part.explodeDir[1] * explodeFactor;
        const pz = part.basePos[2] + part.explodeDir[2] * explodeFactor;
        const isSelected = selectedPartId === part.id;

        return (
          <group
            key={part.id}
            position={[px, py, pz]}
            rotation={part.rotation || [0, 0, 0]}
          >
            <mesh
              onClick={(e) => {
                e.stopPropagation();
                onSelectPart(part.id);
              }}
            >
              {part.geometryType === 'sphere' && (
                <sphereGeometry args={part.args as [number, number, number]} />
              )}
              {part.geometryType === 'cylinder' && (
                <cylinderGeometry
                  args={part.args as [number, number, number, number]}
                />
              )}
              {part.geometryType === 'torus' && (
                <torusGeometry
                  args={part.args as [number, number, number, number]}
                />
              )}
              {part.geometryType === 'cone' && (
                <coneGeometry args={part.args as [number, number, number]} />
              )}
              {part.geometryType === 'box' && (
                <boxGeometry args={part.args as [number, number, number]} />
              )}
              {part.geometryType === 'octahedron' && (
                <octahedronGeometry args={part.args as [number, number]} />
              )}
              {part.geometryType === 'capsule' && (
                <capsuleGeometry
                  args={part.args as [number, number, number, number]}
                />
              )}
              <meshStandardMaterial
                color={part.color}
                roughness={0.3}
                metalness={0.25}
                wireframe={part.wireframe}
                transparent={part.opacity !== undefined}
                opacity={part.opacity ?? 1}
                emissive={isSelected ? part.color : '#000000'}
                emissiveIntensity={isSelected ? 0.45 : 0.08}
                side={THREE.DoubleSide}
              />
            </mesh>

            {showPins && (
              <Html distanceFactor={10} position={[0, 0.45, 0]} center>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    onSelectPart(part.id);
                  }}
                  className={`px-2 py-0.5 rounded-full text-[10px] font-mono font-semibold whitespace-nowrap border transition-all flex items-center gap-1 shadow-md ${
                    isSelected
                      ? 'bg-cyan-500 text-slate-950 border-white scale-110'
                      : 'bg-slate-900/90 text-slate-100 border-cyan-500/50 hover:border-cyan-300'
                  }`}
                >
                  <MapPin className="w-2.5 h-2.5" />
                  {part.name.split(' (')[0]}
                </button>
              </Html>
            )}
          </group>
        );
      })}
    </group>
  );
};

interface AnatomyCADInspectorProps {
  initialPreset?: CADPresetId;
}

export const AnatomyCADInspector: React.FC<AnatomyCADInspectorProps> = ({
  initialPreset = 'heart-thorax',
}) => {
  const [presetId, setPresetId] = useState<CADPresetId>(initialPreset);
  const [explodeFactor, setExplodeFactor] = useState(0.15);
  const [clip, setClip] = useState({ x: 4.5, y: 4.5, z: 4.5 });
  const [showPins, setShowPins] = useState(true);
  const [autoRotate, setAutoRotate] = useState(true);
  const [customGltfScene, setCustomGltfScene] = useState<THREE.Group | null>(null);
  const [customFileName, setCustomFileName] = useState<string | null>(null);

  const activeAssembly = ASSEMBLIES[presetId] || ASSEMBLIES['heart-thorax'];
  const [selectedPartId, setSelectedPartId] = useState<string>(
    activeAssembly.parts[0].id
  );

  const selectedPart = useMemo(() => {
    return (
      activeAssembly.parts.find((p) => p.id === selectedPartId) ||
      activeAssembly.parts[0]
    );
  }, [activeAssembly, selectedPartId]);

  const handlePresetSwitch = (id: CADPresetId) => {
    setPresetId(id);
    setCustomGltfScene(null);
    setCustomFileName(null);
    setSelectedPartId(ASSEMBLIES[id].parts[0].id);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const url = URL.createObjectURL(file);
    const loader = new GLTFLoader();
    loader.load(
      url,
      (gltf) => {
        setCustomGltfScene(gltf.scene);
        setCustomFileName(file.name);
      },
      undefined,
      () => {
        URL.revokeObjectURL(url);
      }
    );
  };

  return (
    <div className="space-y-4">
      {/* Top Preset Selector & Custom .GLB Loader */}
      <div className="flex flex-wrap items-center justify-between gap-2 p-3 rounded-xl bg-[#111827] border border-[#1F2937]">
        <div className="flex flex-wrap items-center gap-1.5">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-400 mr-1 flex items-center gap-1">
            <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
            3D Assembly:
          </span>
          {(Object.keys(ASSEMBLIES) as CADPresetId[]).map((id) => {
            const item = ASSEMBLIES[id];
            const active = presetId === id && !customGltfScene;
            return (
              <button
                key={id}
                type="button"
                onClick={() => handlePresetSwitch(id)}
                className={`px-2.5 py-1 rounded-lg text-xs font-medium border transition-all ${
                  active
                    ? 'bg-cyan-500/20 border-cyan-400 text-cyan-200'
                    : 'bg-[#090D16] border-slate-800 text-slate-300 hover:border-slate-600'
                }`}
              >
                {item.title.split(' &')[0]}
              </button>
            );
          })}
        </div>

        <label className="cursor-pointer inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-medium text-cyan-300 border border-slate-700 transition-colors">
          <Upload className="w-3.5 h-3.5" />
          <span>{customFileName ? `Loaded: ${customFileName}` : 'Load .GLB / .GLTF'}</span>
          <input
            type="file"
            accept=".glb,.gltf"
            onChange={handleFileUpload}
            className="hidden"
          />
        </label>
      </div>

      {/* 3D Viewport */}
      <Scene3DWrapper
        title={
          customFileName
            ? `Custom 3D CAD/Anatomy Asset: ${customFileName}`
            : activeAssembly.title
        }
        subtitle={activeAssembly.description}
        height={410}
        cameraPosition={[4.2, 2.8, 4.8]}
        enableClippingUI={true}
        clipX={clip.x}
        clipY={clip.y}
        clipZ={clip.z}
        onClipChange={(axis, val) => setClip((prev) => ({ ...prev, [axis]: val }))}
        overlayControls={
          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={() => setShowPins((p) => !p)}
              className={`px-2.5 py-1 rounded-lg text-xs font-medium border flex items-center gap-1 ${
                showPins
                  ? 'bg-emerald-500/20 border-emerald-500/40 text-emerald-300'
                  : 'bg-slate-900 border-slate-800 text-slate-400'
              }`}
            >
              <MapPin className="w-3.5 h-3.5" />
              3D Pins
            </button>
            <button
              type="button"
              onClick={() => setAutoRotate((r) => !r)}
              className={`px-2.5 py-1 rounded-lg text-xs font-medium border flex items-center gap-1 ${
                autoRotate
                  ? 'bg-amber-500/20 border-amber-500/40 text-amber-300'
                  : 'bg-slate-900 border-slate-800 text-slate-400'
              }`}
            >
              <Eye className="w-3.5 h-3.5" />
              Auto-Orbit
            </button>
          </div>
        }
      >
        {customGltfScene ? (
          <primitive object={customGltfScene} scale={1.5} />
        ) : (
          <ProceduralAssemblyMesh
            assembly={activeAssembly}
            explodeFactor={explodeFactor}
            selectedPartId={selectedPart.id}
            onSelectPart={setSelectedPartId}
            showPins={showPins}
            autoRotate={autoRotate}
          />
        )}
      </Scene3DWrapper>

      {/* Exploded View & Cross-Section Controls + Selected Sub-Component Inspector */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        <div className="lg:col-span-6 p-3.5 rounded-xl bg-[#111827] border border-[#1F2937] space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-200 flex items-center gap-1.5">
              <Layers className="w-4 h-4 text-cyan-400" />
              Exploded View & Axial Cross-Section
            </span>
            <button
              type="button"
              onClick={() => {
                setExplodeFactor(0);
                setClip({ x: 4.5, y: 4.5, z: 4.5 });
              }}
              className="text-[11px] font-mono text-slate-400 hover:text-white flex items-center gap-1"
            >
              <RotateCcw className="w-3 h-3" /> Reset Assembly
            </button>
          </div>

          <div className="p-2.5 rounded-lg bg-[#090D16] border border-slate-800 space-y-1.5">
            <div className="flex justify-between text-xs">
              <span className="text-slate-300 font-medium">
                Radial / Axial Exploded View Separation
              </span>
              <span className="font-mono font-bold text-cyan-300">
                {Math.round(explodeFactor * 100)}%
              </span>
            </div>
            <input
              type="range"
              min={0}
              max={1}
              step={0.02}
              value={explodeFactor}
              onChange={(e) => setExplodeFactor(parseFloat(e.target.value))}
              className="w-full h-1.5 bg-slate-800 rounded-lg cursor-pointer accent-cyan-400"
            />
          </div>

          <div className="grid grid-cols-3 gap-2">
            {(['x', 'y', 'z'] as const).map((axis) => (
              <div
                key={axis}
                className="p-2 rounded-lg bg-[#090D16] border border-slate-800 space-y-1"
              >
                <div className="flex justify-between text-[11px]">
                  <span className="text-slate-400 font-mono uppercase flex items-center gap-1">
                    <Scissors className="w-3 h-3 text-amber-400" />
                    {axis}-Plane
                  </span>
                  <span className="font-mono text-amber-300">
                    {clip[axis].toFixed(1)}m
                  </span>
                </div>
                <input
                  type="range"
                  min={-2.5}
                  max={4.5}
                  step={0.1}
                  value={clip[axis]}
                  onChange={(e) =>
                    setClip((prev) => ({
                      ...prev,
                      [axis]: parseFloat(e.target.value),
                    }))
                  }
                  className="w-full h-1.5 bg-slate-800 rounded-lg cursor-pointer accent-amber-400"
                />
              </div>
            ))}
          </div>
        </div>

        {/* Sub-Component Clinical / Engineering Telemetry Card */}
        <div className="lg:col-span-6 p-3.5 rounded-xl bg-[#111827] border border-[#1F2937] flex flex-col justify-between space-y-3">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-mono uppercase tracking-wider px-2 py-0.5 rounded bg-cyan-500/10 text-cyan-300 border border-cyan-500/30">
                {activeAssembly.category} Hotspot
              </span>
              <span className="text-[11px] text-slate-400">
                Click any 3D pin or badge below
              </span>
            </div>

            <h4 className="text-sm font-bold text-white flex items-center gap-2">
              <span
                className="w-3 h-3 rounded-full shrink-0"
                style={{ backgroundColor: selectedPart.color }}
              />
              {selectedPart.name}
            </h4>

            <p className="text-xs font-medium text-cyan-300">
              Function: {selectedPart.role}
            </p>

            <div className="p-2.5 rounded-lg bg-[#090D16] border border-slate-800 text-xs text-slate-300 leading-relaxed flex items-start gap-2">
              <Info className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
              <span>{selectedPart.clinicalOrEngNote}</span>
            </div>
          </div>

          <div className="flex flex-wrap gap-1.5 pt-1">
            {activeAssembly.parts.map((part) => (
              <button
                key={part.id}
                type="button"
                onClick={() => setSelectedPartId(part.id)}
                className={`px-2 py-1 rounded text-[11px] font-medium border transition-all ${
                  selectedPart.id === part.id
                    ? 'bg-cyan-500/20 border-cyan-400 text-cyan-200'
                    : 'bg-[#090D16] border-slate-800 text-slate-400 hover:text-white'
                }`}
              >
                {part.name.split(' (')[0]}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
