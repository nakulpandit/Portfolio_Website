import { motion } from 'framer-motion';
import { galaxies } from '../data/galaxies';
import { useStore } from '../store/useStore';

export default function GalaxyScene() {
  const currentGalaxy = useStore((state) => state.currentGalaxy);
  const selectedItem = useStore((state) => state.selectedItem);
  const resetSelection = useStore((state) => state.resetSelection);
  const returnToUniverse = useStore((state) => state.returnToUniverse);

  const galaxy = galaxies.find((entry) => entry.id === currentGalaxy);

  return (
    <motion.div
      initial={{ opacity: 0, y: -18 }}
      animate={{ opacity: 1, y: 0 }}
      className="pointer-events-auto absolute left-1/2 top-4 z-20 flex w-[min(760px,calc(100%-2rem))] -translate-x-1/2 items-center justify-between gap-4 rounded-[32px] glass-panel px-5 py-3"
      data-ui="true"
    >
      <div className="min-w-0 text-center sm:text-left">
        <p className="font-display text-[10px] uppercase tracking-[0.45em] text-white/45">
          {selectedItem ? 'Deep Scan' : galaxy ? 'Galaxy Focus' : 'Free Flight'}
        </p>
        <p className="mt-1 truncate text-sm text-white/82">
          {selectedItem
            ? `${selectedItem.title}${selectedItem.year ? ` • ${selectedItem.year}` : ''}`
            : galaxy
              ? galaxy.description
              : 'Survey the universe, then warp toward any galaxy cluster to inspect its systems.'}
        </p>
      </div>

      <div className="flex shrink-0 gap-2">
        {selectedItem ? (
          <button
            type="button"
            onClick={resetSelection}
            className="rounded-full border border-white/10 px-4 py-2 text-xs uppercase tracking-[0.28em] text-white/70 transition hover:bg-white/10"
          >
            Clear Scan
          </button>
        ) : null}
        {currentGalaxy ? (
          <button
            type="button"
            onClick={returnToUniverse}
            className="rounded-full border border-white/10 px-4 py-2 text-xs uppercase tracking-[0.28em] text-white/70 transition hover:bg-white/10"
          >
            Back to Universe
          </button>
        ) : null}
      </div>
    </motion.div>
  );
}
