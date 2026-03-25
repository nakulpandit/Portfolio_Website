import { AnimatePresence, motion } from 'framer-motion';
import { galaxies } from '../../data/galaxies';
import { useStore } from '../../store/useStore';

function CompactHud({ collapsed, onToggle, currentGalaxy, selectedItem, onBack }) {
  const currentLabel = selectedItem?.title ?? galaxies.find((entry) => entry.id === currentGalaxy)?.label ?? 'Universe';

  return (
    <motion.div
      initial={{ opacity: 0, y: -16 }}
      animate={{ opacity: 1, y: 0 }}
      className="pointer-events-auto absolute left-4 top-4 flex items-center gap-2 rounded-full border border-white/12 bg-[linear-gradient(135deg,rgba(12,18,34,0.82),rgba(6,10,22,0.72))] px-2 py-2 shadow-[0_12px_30px_rgba(4,10,24,0.45)] backdrop-blur-xl"
      data-ui="true"
    >
      <button
        type="button"
        onClick={onToggle}
        className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-white/15 bg-white/10 text-sm text-white/88 transition hover:bg-white/18"
        aria-label={collapsed ? 'Expand HUD' : 'Collapse HUD'}
      >
        {collapsed ? '+' : '−'}
      </button>
      <div className="pr-2">
        <p className="font-display text-[10px] uppercase tracking-[0.34em] text-white/45">Current</p>
        <div className="flex items-center gap-2">
          <motion.span
            className="h-2 w-2 rounded-full bg-nebula/90 shadow-[0_0_10px_rgba(114,247,255,0.6)]"
            animate={{ opacity: [0.6, 1, 0.6], scale: [0.9, 1.15, 0.9] }}
            transition={{ duration: 2.4, repeat: Infinity, ease: 'easeInOut' }}
          />
          <p className="max-w-[160px] truncate text-xs text-white/78">{currentLabel}</p>
        </div>
      </div>
      {currentGalaxy ? (
        <button
          type="button"
          onClick={onBack}
          className="rounded-full border border-white/15 bg-white/10 px-3 py-1.5 text-[10px] uppercase tracking-[0.22em] text-white/75 transition hover:bg-white/18"
        >
          Back
        </button>
      ) : null}
    </motion.div>
  );
}

export default function HUD() {
  const currentGalaxy = useStore((state) => state.currentGalaxy);
  const selectedItem = useStore((state) => state.selectedItem);
  const hudCollapsed = useStore((state) => state.hudCollapsed);
  const focusGalaxy = useStore((state) => state.focusGalaxy);
  const returnToUniverse = useStore((state) => state.returnToUniverse);
  const setHudCollapsed = useStore((state) => state.setHudCollapsed);
  const isMobile = useStore((state) => state.isMobile);

  const toggleHud = () => {
    setHudCollapsed(!hudCollapsed);
  };

  return (
    <div className="pointer-events-none absolute inset-0 z-20">
      <CompactHud
        collapsed={hudCollapsed}
        onToggle={toggleHud}
        currentGalaxy={currentGalaxy}
        selectedItem={selectedItem}
        onBack={returnToUniverse}
      />

      <AnimatePresence>
        {!hudCollapsed ? (
          <motion.aside
            key="hud-expanded"
            initial={{ opacity: 0, x: -24 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -24 }}
            transition={{ duration: 0.28 }}
            className="pointer-events-auto absolute left-4 top-16 w-[min(300px,calc(100%-2rem))] rounded-[26px] border border-white/12 bg-[linear-gradient(140deg,rgba(12,18,34,0.86),rgba(4,8,20,0.76))] p-4 shadow-[0_18px_40px_rgba(3,8,22,0.5)] backdrop-blur-2xl"
            data-ui="true"
          >
            <div className="mb-3 flex items-center justify-between">
              <div>
                <p className="font-display text-[10px] uppercase tracking-[0.35em] text-white/45">Support HUD</p>
                <h2 className="font-display text-lg text-white/92">Quick Jump</h2>
              </div>
              <button
                type="button"
                onClick={() => setHudCollapsed(true)}
                className="rounded-full border border-white/15 px-3 py-1 text-[10px] uppercase tracking-[0.2em] text-white/64 transition hover:bg-white/16"
              >
                Collapse
              </button>
            </div>

            <div className="grid grid-cols-2 gap-2">
              {galaxies.map((galaxy) => (
                <button
                  key={galaxy.id}
                  type="button"
                  onClick={() => focusGalaxy(galaxy)}
                  className={`rounded-xl border px-3 py-2 text-left transition ${
                    currentGalaxy === galaxy.id
                      ? 'border-white/32 bg-white/16 text-white'
                      : 'border-white/12 bg-white/6 text-white/78 hover:bg-white/12'
                  }`}
                >
                  <p className="font-display text-[12px] leading-tight">{galaxy.name}</p>
                  <p className="mt-1 text-[10px] uppercase tracking-[0.18em] text-white/45">{galaxy.label}</p>
                </button>
              ))}
            </div>

            <div className="mt-3 rounded-xl border border-white/10 bg-black/20 p-3 text-[12px] leading-5 text-white/66">
              <p>{currentGalaxy ? 'Universe remains interactive: click nodes in space to inspect details.' : 'Primary navigation is in-space: hover and click galaxies directly in the universe.'}</p>
              <p className="mt-1">{isMobile ? 'Touch mode: drag, pinch, and tap nodes.' : 'Desktop mode: drag, wheel zoom, click nodes.'}</p>
            </div>
          </motion.aside>
        ) : null}
      </AnimatePresence>
    </div>
  );
}
