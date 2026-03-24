import { Canvas } from '@react-three/fiber';
import { useRef } from 'react';
import * as THREE from 'three';
import Universe from '../components/space/Universe';
import HUD from '../components/ui/HUD';
import InfoPanel from '../components/ui/InfoPanel';
import Modal from '../components/ui/Modal';
import GalaxyScene from './GalaxyScene';
import { useStore } from '../store/useStore';

export default function UniverseScene() {
  const cameraTarget = useStore((state) => state.cameraTarget);
  const setCameraTarget = useStore((state) => state.setCameraTarget);
  const resetSelection = useStore((state) => state.resetSelection);
  const setHoveredItem = useStore((state) => state.setHoveredItem);
  const dragState = useRef({ active: false, x: 0, y: 0 });

  const updateCamera = (deltaX, deltaY) => {
    const position = new THREE.Vector3(...cameraTarget.position);
    const lookAt = new THREE.Vector3(...cameraTarget.lookAt);
    const depth = Math.max(position.distanceTo(lookAt) / 14, 0.2);
    const panX = deltaX * 0.016 * depth;
    const panY = deltaY * 0.016 * depth;

    setCameraTarget((target) => ({
      ...target,
      position: [target.position[0] - panX, target.position[1] + panY, target.position[2]],
      lookAt: [target.lookAt[0] - panX, target.lookAt[1] + panY, target.lookAt[2]],
    }));
  };

  return (
    <div
      className="relative h-full w-full"
      onPointerDown={(event) => {
        if (event.target.closest?.('[data-ui="true"]')) {
          return;
        }

        dragState.current = {
          active: true,
          x: event.clientX,
          y: event.clientY,
        };
      }}
      onPointerMove={(event) => {
        if (!dragState.current.active) {
          return;
        }

        const deltaX = event.clientX - dragState.current.x;
        const deltaY = event.clientY - dragState.current.y;

        updateCamera(deltaX, deltaY);
        dragState.current = { active: true, x: event.clientX, y: event.clientY };
      }}
      onPointerUp={() => {
        dragState.current.active = false;
      }}
      onPointerLeave={() => {
        dragState.current.active = false;
      }}
      onWheel={(event) => {
        if (event.target.closest?.('[data-ui="true"]')) {
          return;
        }

        setCameraTarget((target) => {
          const position = new THREE.Vector3(...target.position);
          const lookAt = new THREE.Vector3(...target.lookAt);
          const direction = position.clone().sub(lookAt).normalize();
          const distance = position.distanceTo(lookAt);
          const nextDistance = THREE.MathUtils.clamp(distance + event.deltaY * 0.012, 3.2, 34);
          const nextPosition = lookAt.clone().add(direction.multiplyScalar(nextDistance));

          return {
            ...target,
            position: nextPosition.toArray(),
          };
        });
      }}
    >
      <Canvas
        camera={{ position: [0, 0, 22], fov: 50 }}
        dpr={[1, 1.75]}
        gl={{ antialias: true, alpha: true }}
        onPointerMissed={() => {
          resetSelection();
          setHoveredItem(null);
        }}
      >
        <fog attach="fog" args={['#040612', 12, 30]} />
        <Universe />
      </Canvas>

      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(114,247,255,0.12),transparent_28%),radial-gradient(circle_at_bottom,rgba(255,124,107,0.09),transparent_24%)]" />
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_42%,rgba(4,6,18,0.28)_100%)]" />
      <div className="pointer-events-none absolute bottom-4 left-1/2 z-20 hidden -translate-x-1/2 rounded-full border border-white/10 bg-slate-950/45 px-4 py-2 text-[11px] uppercase tracking-[0.32em] text-white/48 backdrop-blur-md md:block">
        Drag to pan • Scroll to dive • Click to focus
      </div>
      <GalaxyScene />
      <HUD />
      <InfoPanel />
      <Modal />
    </div>
  );
}
