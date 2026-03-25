import { Canvas } from '@react-three/fiber';
import { useEffect } from 'react';
import * as THREE from 'three';
import Universe from '../components/space/Universe';
import HUD from '../components/ui/HUD';
import InfoPanel from '../components/ui/InfoPanel';
import Modal from '../components/ui/Modal';
import GalaxyScene from './GalaxyScene';
import { useStore } from '../store/useStore';

export default function UniverseScene() {
  const currentGalaxy = useStore((state) => state.currentGalaxy);
  const resetSelection = useStore((state) => state.resetSelection);
  const setHoveredItem = useStore((state) => state.setHoveredItem);
  const dragThresholdPx = useStore((state) => state.dragThresholdPx);
  const completeTransition = useStore((state) => state.completeTransition);

  useEffect(() => {
    const handleVisibilityRestore = () => {
      if (document.visibilityState === 'visible') {
        completeTransition();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityRestore);
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityRestore);
    };
  }, [completeTransition]);

  return (
    <div className="relative h-full w-full select-none">
      <Canvas
        camera={{ position: [0, 0, 22], fov: 52 }}
        dpr={[1, 2]}
        gl={{ antialias: true, alpha: true, powerPreference: 'high-performance' }}
        onCreated={({ gl, camera }) => {
          gl.setPixelRatio(Math.min(window.devicePixelRatio, 2));
          gl.toneMapping = THREE.ACESFilmicToneMapping;
          gl.toneMappingExposure = 1.08;
          camera.updateProjectionMatrix();
        }}
        onPointerMissed={(event) => {
          if (event?.delta > dragThresholdPx) {
            return;
          }
          resetSelection();
          setHoveredItem(null);
        }}
      >
        <fog attach="fog" args={['#040612', 12, 78]} />
        <Universe />
      </Canvas>

      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(114,247,255,0.14),transparent_28%),radial-gradient(circle_at_bottom,rgba(255,124,107,0.1),transparent_26%)]" />
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_38%,rgba(4,6,18,0.34)_100%)]" />
      <div className="pointer-events-none absolute bottom-4 left-1/2 z-20 hidden -translate-x-1/2 rounded-full border border-white/10 bg-slate-950/40 px-4 py-2 text-[11px] uppercase tracking-[0.3em] text-white/48 backdrop-blur-md md:block">
        {currentGalaxy ? 'Drag to orbit • Scroll or pinch to zoom • Click nodes to inspect' : 'Scroll to travel • Drag to pan • Click galaxies to enter'}
      </div>
      <GalaxyScene />
      <HUD />
      <InfoPanel />
      <Modal />
    </div>
  );
}
