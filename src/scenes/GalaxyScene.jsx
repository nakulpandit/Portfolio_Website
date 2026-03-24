import { motion } from 'framer-motion';
import { galaxies } from '../data/galaxies';
import { useStore } from '../store/useStore';

export default function GalaxyScene() {
  const currentGalaxy = useStore((state) => state.currentGalaxy);
  const selectedItem = useStore((state) => state.selectedItem);

  const galaxy = galaxies.find((entry) => entry.id === currentGalaxy);

  return (
    <motion.div
      initial={{ opacity: 0, y: -18 }}
      animate={{ opacity: 1, y: 0 }}
      className="pointer-events-none absolute left-1/2 top-4 z-20 w-[min(540px,calc(100%-2rem))] -translate-x-1/2 rounded-full glass-panel px-5 py-3 text-center"
      data-ui="true"
    >
      <p className="font-display text-xs uppercase tracking-[0.4em] text-white/50">
        {selectedItem ? 'Deep Scan' : galaxy ? 'Galaxy Focus' : 'Free Flight'}
      </p>
      <p className="mt-1 text-sm text-white/78">
        {selectedItem
          ? `${selectedItem.title}${selectedItem.year ? ` • ${selectedItem.year}` : ''}`
          : galaxy
            ? galaxy.description
            : 'Survey the universe, then warp toward any galaxy cluster to inspect its systems.'}
      </p>
    </motion.div>
  );
}
