import { AnimatePresence, motion } from 'framer-motion';
import { useMemo, useState } from 'react';
import { galaxies } from '../../data/galaxies';
import { useStore } from '../../store/useStore';

function Pill({ children }) {
  return (
    <span className="rounded-full border border-white/10 bg-white/8 px-3 py-1 text-xs text-white/80">
      {children}
    </span>
  );
}

export default function InfoPanel() {
  const currentGalaxy = useStore((state) => state.currentGalaxy);
  const selectedItem = useStore((state) => state.selectedItem);
  const infoPanelOpen = useStore((state) => state.ui.infoPanelOpen);
  const resetSelection = useStore((state) => state.resetSelection);
  const setInfoPanelOpen = useStore((state) => state.setInfoPanelOpen);
  const [transmitted, setTransmitted] = useState(false);

  const galaxy = useMemo(
    () => galaxies.find((entry) => entry.id === currentGalaxy) ?? null,
    [currentGalaxy],
  );

  const isOpen = (infoPanelOpen || Boolean(selectedItem)) && selectedItem?.kind !== 'about';

  const closePanel = () => {
    resetSelection();
    setInfoPanelOpen(false);
  };

  return (
    <AnimatePresence>
      {isOpen ? (
        <motion.aside
          key="info-panel"
          initial={{ opacity: 0, x: 36 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: 36 }}
          transition={{ duration: 0.35 }}
          className="pointer-events-auto absolute bottom-4 right-4 z-30 w-[min(420px,calc(100%-2rem))] rounded-[28px] glass-panel panel-grid p-5 shadow-glow"
          data-ui="true"
        >
          <div className="mb-4 flex items-start justify-between gap-4">
            <div>
              <p className="font-display text-xs uppercase tracking-[0.35em] text-white/55">
                {selectedItem ? selectedItem.kind : galaxy?.label ?? 'Overview'}
              </p>
              <h3 className="mt-1 font-display text-2xl text-white">
                {selectedItem?.title ?? galaxy?.label ?? 'Universe Overview'}
              </h3>
            </div>
            <button
              type="button"
              onClick={closePanel}
              className="rounded-full border border-white/10 px-3 py-1 text-xs uppercase tracking-[0.28em] text-white/65 transition hover:bg-white/10"
            >
              Close
            </button>
          </div>

          {selectedItem?.kind === 'project' ? (
            <div className="space-y-4 text-sm text-white/72">
              <p>{selectedItem.description}</p>
              <div className="flex flex-wrap gap-2">
                {selectedItem.tech.map((tech) => (
                  <Pill key={tech}>{tech}</Pill>
                ))}
              </div>
              <div className="grid gap-3 rounded-2xl border border-white/10 bg-black/20 p-4 sm:grid-cols-2">
                <div>
                  <p className="text-xs uppercase tracking-[0.3em] text-white/45">Role</p>
                  <p className="mt-1 text-white">{selectedItem.role}</p>
                </div>
                <div>
                  <p className="text-xs uppercase tracking-[0.3em] text-white/45">Impact</p>
                  <p className="mt-1 text-white">{selectedItem.metrics}</p>
                </div>
              </div>
              <a
                href={selectedItem.link}
                target="_blank"
                rel="noreferrer"
                className="inline-flex rounded-full bg-nebula px-4 py-2 font-medium text-slate-950 transition hover:translate-y-[-1px]"
              >
                Open Project Orbit
              </a>
            </div>
          ) : null}

          {selectedItem?.kind === 'research' ? (
            <div className="space-y-4 text-sm text-white/72">
              <div className="flex items-center gap-3">
                <Pill>{selectedItem.year}</Pill>
                <Pill>{selectedItem.domain}</Pill>
              </div>
              <p>{selectedItem.summary}</p>
              <div className="flex flex-wrap gap-2">
                {selectedItem.concepts.map((concept) => (
                  <Pill key={concept}>{concept}</Pill>
                ))}
              </div>
              <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
                <p className="text-xs uppercase tracking-[0.3em] text-white/45">Research Notes</p>
                <p className="mt-2">{selectedItem.notes}</p>
              </div>
              <a
                href={selectedItem.link}
                target="_blank"
                rel="noreferrer"
                className="inline-flex rounded-full bg-white px-4 py-2 font-medium text-slate-950 transition hover:translate-y-[-1px]"
              >
                Read Paper Link
              </a>
            </div>
          ) : null}

          {selectedItem?.kind === 'skill' ? (
            <div className="space-y-3 text-sm text-white/72">
              <p>{selectedItem.summary}</p>
              <p>
                Fast-moving product work, motion-heavy interfaces, and reusable systems design are where this skill shows up most often.
              </p>
            </div>
          ) : null}

          {!selectedItem && currentGalaxy === 'resume' ? (
            <div className="space-y-4 text-sm text-white/72">
              <p>
                The station holds a compact recruiter-friendly snapshot focused on product engineering, immersive frontend work, and research-driven interfaces.
              </p>
              <div className="grid gap-2">
                <Pill>Frontend Architecture</Pill>
                <Pill>Creative Development</Pill>
                <Pill>Interactive 3D Experiences</Pill>
              </div>
              <a
                href="/resume.txt"
                download
                className="inline-flex rounded-full bg-aurora px-4 py-2 font-medium text-slate-950 transition hover:translate-y-[-1px]"
              >
                Download Resume Snapshot
              </a>
            </div>
          ) : null}

          {!selectedItem && currentGalaxy === 'contact' ? (
            <form
              className="space-y-3 text-sm text-white/72"
              onSubmit={(event) => {
                event.preventDefault();
                setTransmitted(true);
              }}
            >
              <p>Transmit a signal for collaborations, frontend roles, or research conversations.</p>
              <input
                type="text"
                placeholder="Your name"
                className="w-full rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-white outline-none placeholder:text-white/35"
              />
              <input
                type="email"
                placeholder="Email frequency"
                className="w-full rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-white outline-none placeholder:text-white/35"
              />
              <textarea
                placeholder="Message payload"
                rows="4"
                className="w-full rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-white outline-none placeholder:text-white/35"
              />
              <button
                type="submit"
                className="inline-flex rounded-full bg-plasma px-4 py-2 font-medium text-slate-950 transition hover:translate-y-[-1px]"
              >
                Transmit Signal
              </button>
              {transmitted ? <p className="text-aurora">Signal sent. A reply beacon would normally continue from here.</p> : null}
            </form>
          ) : null}
          {!selectedItem && currentGalaxy !== 'resume' && currentGalaxy !== 'contact' && galaxy ? (
            <div className="space-y-3 text-sm text-white/72">
              <p>{galaxy.description}</p>
              <p>
                Move deeper into the cluster to inspect individual systems. The strongest implementations in this build are the Projects and Research galaxies.
              </p>
            </div>
          ) : null}
        </motion.aside>
      ) : null}
    </AnimatePresence>
  );
}
