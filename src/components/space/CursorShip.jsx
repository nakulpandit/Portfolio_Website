import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';
import { useStore } from '../../store/useStore';

export default function CursorShip() {
  const hoveredItem = useStore((state) => state.hoveredItem);
  const [position, setPosition] = useState({ x: window.innerWidth / 2, y: window.innerHeight / 2 });

  useEffect(() => {
    const handleMove = (event) => {
      setPosition({ x: event.clientX, y: event.clientY });
    };

    window.addEventListener('pointermove', handleMove);
    return () => window.removeEventListener('pointermove', handleMove);
  }, []);

  return (
    <motion.div
      className="pointer-events-none fixed left-0 top-0 z-50 hidden md:block"
      animate={{
        x: position.x - 14,
        y: position.y - 14,
        scale: hoveredItem ? 1.15 : 1,
        rotate: hoveredItem ? 18 : 0,
      }}
      transition={{ type: 'spring', stiffness: 320, damping: 28, mass: 0.4 }}
    >
      <div className="relative h-7 w-7">
        <div className="absolute left-1/2 top-0 h-0 w-0 -translate-x-1/2 border-l-[7px] border-r-[7px] border-b-[20px] border-l-transparent border-r-transparent border-b-nebula drop-shadow-[0_0_12px_rgba(114,247,255,0.95)]" />
        <div className="absolute left-1/2 top-4 h-2 w-2 -translate-x-1/2 rounded-full bg-white blur-[1px]" />
      </div>
    </motion.div>
  );
}
