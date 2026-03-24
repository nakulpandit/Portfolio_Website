import { AnimatePresence, motion } from 'framer-motion';
import { useStore } from '../../store/useStore';

export default function Loader() {
  const visible = useStore((state) => state.ui.loaderVisible);

  return (
    <AnimatePresence>
      {visible ? (
        <motion.div
          initial={{ opacity: 1 }}
          exit={{ opacity: 0, transition: { duration: 0.6 } }}
          className="absolute inset-0 z-[60] flex items-center justify-center bg-void"
        >
          <div className="text-center">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ repeat: Infinity, duration: 2.8, ease: 'linear' }}
              className="mx-auto h-14 w-14 rounded-full border border-nebula/30 border-t-nebula"
            />
            <p className="mt-5 font-display text-xs uppercase tracking-[0.5em] text-white/55">Calibrating cosmos</p>
          </div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
