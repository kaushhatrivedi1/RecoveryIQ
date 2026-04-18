import { useRef, useState, Suspense } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Text, Html } from '@react-three/drei';
import * as THREE from 'three';

// Body zone definitions: id, label, position [x,y,z], size
const BODY_PARTS = [
  // Head / Neck
  { id: 'head',           label: 'Head',           pos: [0, 2.5, 0],    size: [0.38, 0.38, 0.35], type: 'sphere' },
  { id: 'neck',           label: 'Neck',           pos: [0, 1.95, 0],   size: [0.14, 0.22, 0.14], type: 'box' },
  // Torso
  { id: 'chest',          label: 'Chest',          pos: [0, 1.4, 0],    size: [0.70, 0.45, 0.30], type: 'box' },
  { id: 'upper_back',     label: 'Upper Back',     pos: [0, 1.4, -0.1], size: [0.70, 0.45, 0.10], type: 'box' },
  { id: 'lower_back',     label: 'Lower Back',     pos: [0, 0.85, -0.1],size: [0.60, 0.40, 0.10], type: 'box' },
  { id: 'abdomen',        label: 'Abdomen',        pos: [0, 0.85, 0],   size: [0.60, 0.40, 0.25], type: 'box' },
  // Shoulders
  { id: 'left_shoulder',  label: 'L. Shoulder',    pos: [-0.62, 1.55, 0], size: [0.20, 0.20, 0.20], type: 'sphere' },
  { id: 'right_shoulder', label: 'R. Shoulder',    pos: [0.62, 1.55, 0],  size: [0.20, 0.20, 0.20], type: 'sphere' },
  // Arms
  { id: 'left_arm',       label: 'L. Arm',         pos: [-0.82, 1.15, 0], size: [0.14, 0.38, 0.14], type: 'box' },
  { id: 'right_arm',      label: 'R. Arm',         pos: [0.82, 1.15, 0],  size: [0.14, 0.38, 0.14], type: 'box' },
  { id: 'left_forearm',   label: 'L. Forearm',     pos: [-0.82, 0.68, 0], size: [0.12, 0.35, 0.12], type: 'box' },
  { id: 'right_forearm',  label: 'R. Forearm',     pos: [0.82, 0.68, 0],  size: [0.12, 0.35, 0.12], type: 'box' },
  // Hips / Pelvis
  { id: 'left_hip',       label: 'L. Hip',         pos: [-0.28, 0.38, 0], size: [0.22, 0.30, 0.22], type: 'sphere' },
  { id: 'right_hip',      label: 'R. Hip',         pos: [0.28, 0.38, 0],  size: [0.22, 0.30, 0.22], type: 'sphere' },
  // Legs
  { id: 'left_thigh',     label: 'L. Thigh',       pos: [-0.28, -0.18, 0],size: [0.18, 0.45, 0.18], type: 'box' },
  { id: 'right_thigh',    label: 'R. Thigh',       pos: [0.28, -0.18, 0], size: [0.18, 0.45, 0.18], type: 'box' },
  { id: 'left_knee',      label: 'L. Knee',        pos: [-0.28, -0.68, 0],size: [0.17, 0.17, 0.17], type: 'sphere' },
  { id: 'right_knee',     label: 'R. Knee',        pos: [0.28, -0.68, 0], size: [0.17, 0.17, 0.17], type: 'sphere' },
  { id: 'left_calf',      label: 'L. Calf',        pos: [-0.28, -1.08, 0],size: [0.14, 0.35, 0.14], type: 'box' },
  { id: 'right_calf',     label: 'R. Calf',        pos: [0.28, -1.08, 0], size: [0.14, 0.35, 0.14], type: 'box' },
  { id: 'left_foot',      label: 'L. Foot',        pos: [-0.28, -1.50, 0.06],size: [0.14, 0.10, 0.28], type: 'box' },
  { id: 'right_foot',     label: 'R. Foot',        pos: [0.28, -1.50, 0.06], size: [0.14, 0.10, 0.28], type: 'box' },
];

const COLOR_DEFAULT = '#d7e4f3';
const COLOR_HOVER = '#7cc8ff';
const COLOR_SELECTED = '#1f7ae0';
const COLOR_EMISSIVE_SEL = '#0f4fb5';
const COLOR_EMISSIVE_HOV = '#3ca9d9';

function BodyPart({ part, isSelected, onSelect }) {
  const ref = useRef();
  const [hovered, setHovered] = useState(false);

  useFrame((_, delta) => {
    if (!ref.current) return;
    const target = isSelected ? 1.12 : hovered ? 1.06 : 1.0;
    ref.current.scale.lerp(
      new THREE.Vector3(target, target, target),
      Math.min(1, delta * 10)
    );
  });

  const color    = isSelected ? COLOR_SELECTED : hovered ? COLOR_HOVER : COLOR_DEFAULT;
  const emissive = isSelected ? COLOR_EMISSIVE_SEL : hovered ? COLOR_EMISSIVE_HOV : '#000000';
  const [sx, sy, sz] = part.size;

  const geometry = part.type === 'sphere'
    ? <sphereGeometry args={[sx, 20, 20]} />
    : <boxGeometry args={[sx, sy, sz]} />;

  return (
    <group
      ref={ref}
      position={part.pos}
      onClick={(e) => { e.stopPropagation(); onSelect(part.id); }}
      onPointerEnter={(e) => { e.stopPropagation(); setHovered(true); document.body.style.cursor = 'pointer'; }}
      onPointerLeave={() => { setHovered(false); document.body.style.cursor = 'default'; }}
    >
      <mesh castShadow receiveShadow>
        {geometry}
        <meshStandardMaterial
          color={color}
          emissive={emissive}
          roughness={0.4}
          metalness={0.1}
          transparent
          opacity={0.95}
        />
      </mesh>
      {(hovered || isSelected) && (
        <Html distanceFactor={6} center>
          <div style={{
            background: isSelected ? '#1f7ae0' : '#13c3b0',
            color: '#fff',
            padding: '3px 8px',
            borderRadius: 6,
            fontSize: 11,
            fontWeight: 600,
            whiteSpace: 'nowrap',
            pointerEvents: 'none',
            boxShadow: '0 2px 8px rgba(0,0,0,0.5)',
          }}>
            {part.label}
          </div>
        </Html>
      )}
    </group>
  );
}

function SelectedBadge({ parts, selectedIds }) {
  const sel = parts.filter(p => selectedIds.includes(p.id));
  return sel.map(p => (
    <mesh key={p.id} position={[p.pos[0], p.pos[1], (p.pos[2] || 0) + 0.25]}>
      <sphereGeometry args={[0.06, 8, 8]} />
      <meshStandardMaterial color="#E8A838" emissive="#7a4500" />
    </mesh>
  ));
}

function Scene({ selectedZones, onToggleZone }) {
  return (
    <>
      <ambientLight intensity={0.95} />
      <directionalLight position={[3, 6, 4]} intensity={1.25} castShadow />
      <directionalLight position={[-3, 2, -2]} intensity={0.6} />
      <pointLight position={[0, 4, 3]} intensity={0.55} color="#b7f4ed" />

      {BODY_PARTS.map(part => (
        <BodyPart
          key={part.id}
          part={part}
          isSelected={selectedZones.includes(part.id)}
          onSelect={onToggleZone}
        />
      ))}

      <SelectedBadge parts={BODY_PARTS} selectedIds={selectedZones} />

      <OrbitControls
        enableZoom
        enablePan={false}
        target={[0, 0.5, 0]}
        minDistance={5.4}
        maxDistance={9.5}
        minPolarAngle={Math.PI * 0.1}
        maxPolarAngle={Math.PI * 0.9}
      />
    </>
  );
}

export default function Body3D({ selectedZones, onToggleZone }) {
  const selected = selectedZones.filter(id => BODY_PARTS.find(p => p.id === id));

  return (
    <div className="relative w-full h-full">
      <Canvas
        shadows
        camera={{ position: [0, 0.55, 6.6], fov: 34 }}
        style={{ background: 'transparent' }}
      >
        <Suspense fallback={null}>
          <Scene selectedZones={selected} onToggleZone={onToggleZone} />
        </Suspense>
      </Canvas>

      <div className="absolute inset-0 rounded-[1.75rem] bg-gradient-to-b from-white/70 to-sky-50/60 pointer-events-none" />

      <div className="absolute bottom-3 left-3 flex gap-3 text-xs pointer-events-none">
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded" style={{ background: COLOR_DEFAULT }} />
          <span className="text-slate-500">Normal</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded" style={{ background: COLOR_HOVER }} />
          <span className="text-slate-500">Hover</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded" style={{ background: COLOR_SELECTED }} />
          <span className="text-slate-500">Selected</span>
        </div>
      </div>

      <div className="absolute top-3 right-3 text-xs text-slate-400 pointer-events-none">
        Drag to rotate · Scroll to zoom
      </div>
    </div>
  );
}

export { BODY_PARTS };
