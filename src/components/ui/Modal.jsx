import { AnimatePresence, motion } from 'framer-motion';
import { useStore } from '../../store/useStore';

export default function Modal() {
  const selectedItem = useStore((state) => state.selectedItem);
  const modalOpen = useStore((state) => state.ui.modalOpen);
  const resetSelection = useStore((state) => state.resetSelection);
  const setModalOpen = useStore((state) => state.setModalOpen);

  const closeModal = () => {
    setModalOpen(false);
    resetSelection();
  };

  return (
    <AnimatePresence>
      {modalOpen && selectedItem?.kind === 'about' ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="absolute inset-0 z-40 flex items-center justify-center bg-slate-950/60 px-4"
          data-ui="true"
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.94, y: 16 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 12 }}
            className="w-full max-w-xl rounded-[30px] glass-panel p-6 shadow-glow"
          >
            <p className="font-display text-xs uppercase tracking-[0.4em] text-white/55">About Transmission</p>
            <h3 className="mt-2 font-display text-3xl text-white">{selectedItem.title}</h3>
            <p className="mt-4 text-sm leading-7 text-white/72">{selectedItem.summary}</p>
            <p className="mt-3 text-sm leading-7 text-white/72">{selectedItem.body}</p>
            <button
              type="button"
              onClick={closeModal}
              className="mt-6 rounded-full bg-nebula px-4 py-2 font-medium text-slate-950"
            >
              Return to Orbit
            </button>
          </motion.div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
