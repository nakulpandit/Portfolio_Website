import { AnimatePresence } from 'framer-motion';
import { lazy, Suspense, useEffect } from 'react';
import CursorShip from './components/space/CursorShip';
import Loader from './components/ui/Loader';
import { useStore } from './store/useStore';

const LandingScene = lazy(() => import('./scenes/LandingScene'));
const UniverseScene = lazy(() => import('./scenes/UniverseScene'));

export default function App() {
  const phase = useStore((state) => state.phase);
  const warpActive = useStore((state) => state.ui.warpActive);
  const setPhase = useStore((state) => state.setPhase);
  const setIsMobile = useStore((state) => state.setIsMobile);
  const setLoaderVisible = useStore((state) => state.setLoaderVisible);
  const setWarpActive = useStore((state) => state.setWarpActive);

  useEffect(() => {
    const mediaQuery = window.matchMedia('(max-width: 768px)');
    const update = () => setIsMobile(mediaQuery.matches);

    update();
    mediaQuery.addEventListener('change', update);
    return () => mediaQuery.removeEventListener('change', update);
  }, [setIsMobile]);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setLoaderVisible(false);
    }, 1400);

    return () => window.clearTimeout(timer);
  }, [setLoaderVisible]);

  useEffect(() => {
    if (!warpActive) {
      return undefined;
    }

    const timer = window.setTimeout(() => {
      setWarpActive(false);
    }, 1000);

    return () => window.clearTimeout(timer);
  }, [setWarpActive, warpActive]);

  return (
    <div className="relative h-full w-full overflow-hidden bg-void font-body text-starlight">
      {phase === 'universe' ? (
        <Suspense fallback={null}>
          <UniverseScene />
        </Suspense>
      ) : (
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(114,247,255,0.12),transparent_30%),radial-gradient(circle_at_bottom,rgba(255,124,107,0.08),transparent_28%),#040612]" />
      )}

      <AnimatePresence>
        {phase === 'landing' ? <LandingScene onComplete={() => setPhase('universe')} /> : null}
      </AnimatePresence>

      <Loader />
      <CursorShip />
    </div>
  );
}
