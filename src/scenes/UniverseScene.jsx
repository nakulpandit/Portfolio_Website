import { Canvas } from '@react-three/fiber';
import { useRef } from 'react';
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
    const depth = Math.max(cameraTarget.position[2] / 14, 0.2);
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

        const nextZ = Math.min(18, Math.max(3.4, cameraTarget.position[2] + event.deltaY * 0.008));
        setCameraTarget((target) => ({
          ...target,
          position: [target.position[0], target.position[1], nextZ],
        }));
      }}
    >
      <Canvas
        camera={{ position: [0, 0, 14], fov: 50 }}
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

      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(114,247,255,0.08),transparent_32%),radial-gradient(circle_at_bottom,rgba(255,124,107,0.08),transparent_28%)]" />
      <GalaxyScene />
      <HUD />
      <InfoPanel />
      <Modal />
    </div>
  );
}
