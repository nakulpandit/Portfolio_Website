import { Canvas } from '@react-three/fiber';
import { useRef } from 'react';
import Universe from '../components/space/Universe';
import HUD from '../components/ui/HUD';
import InfoPanel from '../components/ui/InfoPanel';
import Modal from '../components/ui/Modal';
import GalaxyScene from './GalaxyScene';
import { useStore } from '../store/useStore';

const distanceBetweenTouches = (touches) => {
  const [firstTouch, secondTouch] = touches;
  return Math.hypot(secondTouch.clientX - firstTouch.clientX, secondTouch.clientY - firstTouch.clientY);
};

const midpointBetweenTouches = (touches) => ({
  x: (touches[0].clientX + touches[1].clientX) / 2,
  y: (touches[0].clientY + touches[1].clientY) / 2,
});

export default function UniverseScene() {
  const currentGalaxy = useStore((state) => state.currentGalaxy);
  const panCamera = useStore((state) => state.panCamera);
  const orbitCamera = useStore((state) => state.orbitCamera);
  const zoomCamera = useStore((state) => state.zoomCamera);
  const resetSelection = useStore((state) => state.resetSelection);
  const setHoveredItem = useStore((state) => state.setHoveredItem);
  const gestureRef = useRef({
    active: false,
    pointerType: null,
    x: 0,
    y: 0,
    pinchDistance: 0,
    midpoint: { x: 0, y: 0 },
  });

  const isUiTarget = (target) => target.closest?.('[data-ui="true"]');

  const handleDrag = (deltaX, deltaY, intensity = 1) => {
    if (currentGalaxy) {
      orbitCamera({ deltaX: deltaX * intensity, deltaY: deltaY * intensity });
      return;
    }

    panCamera({ deltaX: deltaX * intensity, deltaY: deltaY * intensity });
  };

  return (
    <div
      className="relative h-full w-full touch-none select-none"
      onPointerDown={(event) => {
        if (event.pointerType === 'touch' || isUiTarget(event.target)) {
          return;
        }

        gestureRef.current = {
          ...gestureRef.current,
          active: true,
          pointerType: event.pointerType,
          x: event.clientX,
          y: event.clientY,
        };
      }}
      onPointerMove={(event) => {
        if (!gestureRef.current.active || gestureRef.current.pointerType === 'touch') {
          return;
        }

        const deltaX = event.clientX - gestureRef.current.x;
        const deltaY = event.clientY - gestureRef.current.y;

        handleDrag(deltaX, deltaY);
        gestureRef.current = {
          ...gestureRef.current,
          x: event.clientX,
          y: event.clientY,
        };
      }}
      onPointerUp={() => {
        gestureRef.current.active = false;
      }}
      onPointerLeave={() => {
        gestureRef.current.active = false;
      }}
      onWheel={(event) => {
        if (isUiTarget(event.target)) {
          return;
        }

        event.preventDefault();
        zoomCamera(event.deltaY * (currentGalaxy ? 0.012 : 0.02));
      }}
      onTouchStart={(event) => {
        if (isUiTarget(event.target)) {
          return;
        }

        if (event.touches.length === 1) {
          gestureRef.current = {
            ...gestureRef.current,
            active: true,
            pointerType: 'touch',
            x: event.touches[0].clientX,
            y: event.touches[0].clientY,
          };
        }

        if (event.touches.length === 2) {
          gestureRef.current = {
            ...gestureRef.current,
            active: true,
            pointerType: 'pinch',
            pinchDistance: distanceBetweenTouches(event.touches),
            midpoint: midpointBetweenTouches(event.touches),
          };
        }
      }}
      onTouchMove={(event) => {
        if (isUiTarget(event.target)) {
          return;
        }

        event.preventDefault();

        if (event.touches.length === 1 && gestureRef.current.pointerType === 'touch') {
          const touch = event.touches[0];
          const deltaX = touch.clientX - gestureRef.current.x;
          const deltaY = touch.clientY - gestureRef.current.y;

          handleDrag(deltaX, deltaY, 0.9);
          gestureRef.current = {
            ...gestureRef.current,
            x: touch.clientX,
            y: touch.clientY,
          };
        }

        if (event.touches.length === 2) {
          const pinchDistance = distanceBetweenTouches(event.touches);
          const midpoint = midpointBetweenTouches(event.touches);
          const pinchDelta = gestureRef.current.pinchDistance - pinchDistance;
          const deltaX = midpoint.x - gestureRef.current.midpoint.x;
          const deltaY = midpoint.y - gestureRef.current.midpoint.y;

          zoomCamera(pinchDelta * 0.02);
          handleDrag(deltaX, deltaY, 0.45);

          gestureRef.current = {
            ...gestureRef.current,
            pointerType: 'pinch',
            pinchDistance,
            midpoint,
          };
        }
      }}
      onTouchEnd={() => {
        gestureRef.current.active = false;
      }}
    >
      <Canvas
        camera={{ position: [0, 0, 22], fov: 52 }}
        dpr={[1, 1.75]}
        gl={{ antialias: true, alpha: true, powerPreference: 'high-performance' }}
        onPointerMissed={() => {
          resetSelection();
          setHoveredItem(null);
        }}
      >
        <fog attach="fog" args={['#040612', 14, 52]} />
        <Universe />
      </Canvas>

      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(114,247,255,0.14),transparent_28%),radial-gradient(circle_at_bottom,rgba(255,124,107,0.1),transparent_26%)]" />
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_38%,rgba(4,6,18,0.34)_100%)]" />
      <div className="pointer-events-none absolute bottom-4 left-1/2 z-20 hidden -translate-x-1/2 rounded-full border border-white/10 bg-slate-950/45 px-4 py-2 text-[11px] uppercase tracking-[0.32em] text-white/48 backdrop-blur-md md:block">
        {currentGalaxy ? 'Drag to orbit • Scroll to approach • Click nodes to inspect' : 'Drag to pan • Scroll to dive • Click galaxies to enter'}
      </div>
      <GalaxyScene />
      <HUD />
      <InfoPanel />
      <Modal />
    </div>
  );
}
