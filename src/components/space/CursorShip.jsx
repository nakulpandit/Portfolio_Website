import { motion } from 'framer-motion';
import { useEffect, useRef, useState } from 'react';
import { useStore } from '../../store/useStore';

export default function CursorShip() {
  const hoveredItem = useStore((state) => state.hoveredItem);
  const [position, setPosition] = useState({ x: window.innerWidth / 2, y: window.innerHeight / 2 });
  const [velocity, setVelocity] = useState({ x: 0, y: 0 });
  const lastRef = useRef({ x: window.innerWidth / 2, y: window.innerHeight / 2, time: performance.now() });

  useEffect(() => {
    const handleMove = (event) => {
      const now = performance.now();
      const delta = Math.max(now - lastRef.current.time, 16);
      const nextVelocity = {
        x: (event.clientX - lastRef.current.x) / delta,
        y: (event.clientY - lastRef.current.y) / delta,
      };

      setPosition({ x: event.clientX, y: event.clientY });
      setVelocity(nextVelocity);
      lastRef.current = { x: event.clientX, y: event.clientY, time: now };
    };

    window.addEventListener('pointermove', handleMove);
    return () => window.removeEventListener('pointermove', handleMove);
  }, []);

  return (
    <motion.div
      className="pointer-events-none fixed left-0 top-0 z-50 hidden md:block"
      animate={{
        x: position.x - 18,
        y: position.y - 18,
        scale: hoveredItem ? 1.08 : 1,
        rotate: hoveredItem ? 12 + velocity.x * 40 : velocity.x * 28,
      }}
      transition={{ type: 'spring', stiffness: 260, damping: 24, mass: 0.35 }}
    >
      <div className="relative h-9 w-9">
        <motion.div
          animate={{ scale: hoveredItem ? 1.24 : 1, opacity: hoveredItem ? 0.95 : 0.55 }}
          className="absolute inset-0 rounded-full border border-nebula/55 bg-nebula/5 shadow-[0_0_24px_rgba(114,247,255,0.18)]"
        />
        <motion.div
          animate={{ scale: hoveredItem ? 0.72 : 0.9, opacity: hoveredItem ? 0.8 : 0.35 }}
          className="absolute inset-[7px] rounded-full border border-white/30"
        />
        <div className="absolute left-1/2 top-[4px] h-0 w-0 -translate-x-1/2 border-l-[7px] border-r-[7px] border-b-[18px] border-l-transparent border-r-transparent border-b-nebula drop-shadow-[0_0_16px_rgba(114,247,255,0.95)]" />
        <div className="absolute left-1/2 top-[17px] h-2 w-2 -translate-x-1/2 rounded-full bg-white blur-[1px]" />
        <div className="absolute left-1/2 top-[21px] h-3 w-[2px] -translate-x-1/2 rounded-full bg-nebula/80" />

        {hoveredItem?.title ? (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 8 }}
            className="absolute left-11 top-1/2 -translate-y-1/2 rounded-full border border-white/10 bg-slate-950/80 px-3 py-1.5 text-[10px] uppercase tracking-[0.28em] text-white/70 backdrop-blur-md"
          >
            {hoveredItem.title}
          </motion.div>
        ) : null}
      </div>
    </motion.div>
  );
}
