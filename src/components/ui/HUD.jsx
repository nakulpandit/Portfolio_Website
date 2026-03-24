import { motion } from 'framer-motion';
import { galaxies } from '../../data/galaxies';
import { useStore } from '../../store/useStore';

export default function HUD() {
  const currentGalaxy = useStore((state) => state.currentGalaxy);
  const selectedItem = useStore((state) => state.selectedItem);
  const focusGalaxy = useStore((state) => state.focusGalaxy);
  const isMobile = useStore((state) => state.isMobile);

  return (
    <div className="pointer-events-none absolute inset-0 z-20" data-ui="true">
      <motion.aside
        initial={{ opacity: 0, x: -30 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.25, duration: 0.7 }}
        className="pointer-events-auto absolute left-4 top-20 w-[min(320px,calc(100%-2rem))] rounded-[30px] glass-panel p-4 shadow-glow"
      >
        <div className="mb-4 flex items-center justify-between">
          <div>
            <p className="font-display text-[10px] uppercase tracking-[0.45em] text-white/45">Command HUD</p>
            <h2 className="font-display text-xl text-white">Navigation Grid</h2>
          </div>
          <div className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-[10px] uppercase tracking-[0.28em] text-white/60">
            {currentGalaxy ? 'Focused' : 'Survey'}
          </div>
        </div>

        <div className="mb-4 grid grid-cols-3 gap-2">
          <div className="rounded-2xl border border-white/10 bg-black/20 px-3 py-2">
            <p className="text-[10px] uppercase tracking-[0.3em] text-white/40">Mode</p>
            <p className="mt-1 text-sm text-white/78">{currentGalaxy ? 'Orbital focus' : 'Wide scan'}</p>
          </div>
          <div className="rounded-2xl border border-white/10 bg-black/20 px-3 py-2">
            <p className="text-[10px] uppercase tracking-[0.3em] text-white/40">Target</p>
            <p className="mt-1 truncate text-sm text-white/78">{selectedItem?.title ?? currentGalaxy ?? 'Universe'}</p>
          </div>
          <div className="rounded-2xl border border-white/10 bg-black/20 px-3 py-2">
            <p className="text-[10px] uppercase tracking-[0.3em] text-white/40">Input</p>
            <p className="mt-1 text-sm text-white/78">{isMobile ? 'Touch' : 'Mouse'}</p>
          </div>
        </div>

        <div className="mb-4 grid grid-cols-2 gap-2">
          {galaxies.map((galaxy) => (
            <button
              key={galaxy.id}
              type="button"
              onClick={() => focusGalaxy(galaxy)}
              className={`rounded-2xl border px-3 py-2 text-left transition ${
                currentGalaxy === galaxy.id
                  ? 'border-white/30 bg-white/15 text-white shadow-[0_0_24px_rgba(255,255,255,0.08)]'
                  : 'border-white/10 bg-white/5 text-white/75 hover:bg-white/10'
              }`}
            >
              <p className="font-display text-[13px] leading-tight">{galaxy.label}</p>
              <p className="mt-1 text-[11px] uppercase tracking-[0.18em] text-white/45">{galaxy.name}</p>
            </button>
          ))}
        </div>

        <div className="grid gap-3 md:grid-cols-[92px_1fr]">
          <div className="relative h-24 rounded-2xl border border-white/10 bg-black/20">
            <div className="absolute inset-3 rounded-full border border-nebula/30" />
            <div className="absolute inset-8 rounded-full border border-white/10" />
            {galaxies.map((galaxy) => {
              const x = 48 + galaxy.position[0] * 2.1;
              const y = 48 + galaxy.position[1] * 2.2;
              const size = galaxy.radius ? 6 + galaxy.radius * 2 : 8;
              return (
                <span
                  key={galaxy.id}
                  className={`absolute -translate-x-1/2 -translate-y-1/2 rounded-full ${
                    currentGalaxy === galaxy.id ? 'bg-white shadow-[0_0_12px_rgba(255,255,255,0.95)]' : 'bg-nebula/75'
                  }`}
                  style={{ left: `${x}px`, top: `${y}px`, width: `${size}px`, height: `${size}px` }}
                />
              );
            })}
          </div>

          <div className="space-y-2 text-[13px] leading-6 text-white/68">
            <p>{selectedItem ? `Tracking ${selectedItem.title}.` : 'Choose a galaxy, let the camera settle, then scan deeper objects.'}</p>
            <p>{isMobile ? 'Mobile mode trims the heaviest visual effects for smoother navigation.' : 'Drag to pan, scroll to zoom, and follow the glow cues for interactive objects.'}</p>
          </div>
        </div>
      </motion.aside>
    </div>
  );
}
