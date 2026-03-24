import { motion } from 'framer-motion';
import { useEffect } from 'react';
import { about } from '../data/about';

export default function LandingScene({ onComplete }) {
  useEffect(() => {
    const timer = window.setTimeout(() => {
      onComplete();
    }, 4200);

    return () => window.clearTimeout(timer);
  }, [onComplete]);

  return (
    <motion.section
      initial={{ opacity: 1 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="absolute inset-0 z-40 overflow-hidden bg-gradient-to-b from-slate-950/95 via-slate-950/70 to-transparent"
      data-ui="true"
    >
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: [0, 1, 1, 0] }}
        transition={{ duration: 4.1, times: [0, 0.18, 0.82, 1] }}
        className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(114,247,255,0.12),transparent_42%)]"
      />

      <div className="relative flex h-full flex-col items-center justify-center px-6 text-center">
        <motion.p
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25 }}
          className="font-display text-xs uppercase tracking-[0.55em] text-white/55"
        >
          Launch Sequence
        </motion.p>
        <motion.h1
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.45, duration: 0.8 }}
          className="mt-4 max-w-4xl font-display text-4xl uppercase tracking-[0.12em] text-white sm:text-6xl"
        >
          Nakul Pandit
        </motion.h1>
        <motion.p
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7, duration: 0.8 }}
          className="mt-5 max-w-xl text-sm leading-7 text-white/70 sm:text-base"
        >
          {about.shortBio}
        </motion.p>
        <motion.p
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.9, duration: 0.8 }}
          className="mt-3 max-w-2xl text-xs uppercase tracking-[0.35em] text-white/45 sm:text-sm"
        >
          AI, machine learning, scientific curiosity, and cinematic interface design.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 40, scale: 0.9 }}
          animate={{ opacity: 1, y: [-20, -120, -280], scale: [0.8, 1, 1.06] }}
          transition={{ delay: 1.1, duration: 2.4, ease: 'easeInOut' }}
          className="relative mt-16"
        >
          <div className="relative h-24 w-12">
            <div className="absolute left-1/2 top-0 h-0 w-0 -translate-x-1/2 border-l-[16px] border-r-[16px] border-b-[56px] border-l-transparent border-r-transparent border-b-white" />
            <div className="absolute left-1/2 top-[52px] h-12 w-3 -translate-x-1/2 rounded-b-full bg-slate-200" />
            <motion.div
              animate={{ opacity: [0.45, 1, 0.45], scaleY: [0.7, 1.15, 0.7] }}
              transition={{ repeat: Infinity, duration: 0.4 }}
              className="absolute left-1/2 top-[64px] h-14 w-6 -translate-x-1/2 rounded-full bg-gradient-to-b from-orange-200 via-orange-400 to-transparent blur-[3px]"
            />
          </div>
        </motion.div>

        <button
          type="button"
          onClick={onComplete}
          className="mt-20 rounded-full border border-white/15 bg-white/10 px-6 py-3 font-display text-sm uppercase tracking-[0.32em] text-white transition hover:bg-white/15"
        >
          Begin Exploration
        </button>
      </div>
    </motion.section>
  );
}
