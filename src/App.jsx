import { AnimatePresence } from 'framer-motion';
import { Component, lazy, Suspense, useEffect } from 'react';
import CursorShip from './components/space/CursorShip';
import Loader from './components/ui/Loader';
import { useStore } from './store/useStore';

const LandingScene = lazy(() => import('./scenes/LandingScene'));
const UniverseScene = lazy(() => import('./scenes/UniverseScene'));

class SceneErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, message: '' };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, message: error?.message ?? 'Unexpected render error.' };
  }

  componentDidCatch(error) {
    // Keep logging to help debug WebGL lifecycle failures.
    console.error('Scene rendering error', error);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="absolute inset-0 z-[120] flex items-center justify-center bg-void px-4">
          <div className="max-w-lg rounded-[28px] border border-white/14 bg-slate-950/72 p-6 text-center backdrop-blur-xl">
            <p className="font-display text-xs uppercase tracking-[0.35em] text-white/52">Recovery Console</p>
            <h2 className="mt-3 font-display text-2xl text-white/92">Scene refresh required</h2>
            <p className="mt-3 text-sm text-white/68">{this.state.message}</p>
            <button
              type="button"
              onClick={() => window.location.reload()}
              className="mt-6 rounded-full border border-white/14 bg-white/10 px-5 py-2 text-xs uppercase tracking-[0.24em] text-white/78 transition hover:bg-white/16"
            >
              Reload Scene
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

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
      <SceneErrorBoundary>
        {phase === 'universe' ? (
          <Suspense fallback={null}>
            <UniverseScene />
          </Suspense>
        ) : (
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(114,247,255,0.12),transparent_30%),radial-gradient(circle_at_bottom,rgba(255,124,107,0.08),transparent_28%),#040612]" />
        )}
      </SceneErrorBoundary>

      <AnimatePresence>
        {phase === 'landing' ? <LandingScene onComplete={() => setPhase('universe')} /> : null}
      </AnimatePresence>

      <Loader />
      <CursorShip />
    </div>
  );
}
