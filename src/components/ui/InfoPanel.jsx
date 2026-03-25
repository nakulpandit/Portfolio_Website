import { AnimatePresence, motion } from 'framer-motion';
import { useMemo, useState } from 'react';
import { about } from '../../data/about';
import { contact } from '../../data/contact';
import { galaxies } from '../../data/galaxies';
import { skillGroups } from '../../data/skills';
import { useStore } from '../../store/useStore';

function Pill({ children }) {
  return (
    <span className="rounded-full border border-white/10 bg-white/8 px-3 py-1 text-xs text-white/80">
      {children}
    </span>
  );
}

function ActionLink({ href, children, tone = 'primary', download = false }) {
  const isMailto = href?.startsWith('mailto:');
  const styles =
    tone === 'secondary'
      ? 'bg-white text-slate-950'
      : tone === 'warm'
        ? 'bg-plasma text-slate-950'
        : 'bg-nebula text-slate-950';

  return (
    <a
      href={href}
      target={download || isMailto ? undefined : '_blank'}
      rel={download || isMailto ? undefined : 'noreferrer'}
      download={download}
      className={`inline-flex rounded-full px-4 py-2 font-medium transition hover:translate-y-[-1px] ${styles}`}
    >
      {children}
    </a>
  );
}

export default function InfoPanel() {
  const currentGalaxy = useStore((state) => state.currentGalaxy);
  const selectedItem = useStore((state) => state.selectedItem);
  const infoPanelOpen = useStore((state) => state.ui.infoPanelOpen);
  const resetSelection = useStore((state) => state.resetSelection);
  const setInfoPanelOpen = useStore((state) => state.setInfoPanelOpen);
  const [transmitted, setTransmitted] = useState(false);

  const galaxy = useMemo(() => galaxies.find((entry) => entry.id === currentGalaxy) ?? null, [currentGalaxy]);
  const isOpen = (infoPanelOpen || Boolean(selectedItem)) && selectedItem?.kind !== 'about';

  const closePanel = () => {
    resetSelection();
    setInfoPanelOpen(false);
  };

  const skillGroup =
    selectedItem?.kind === 'skill'
      ? skillGroups.find((entry) => entry.id === selectedItem.category)
      : null;

  return (
    <AnimatePresence>
      {isOpen ? (
        <motion.aside
          key="info-panel"
          initial={{ opacity: 0, x: 36 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: 36 }}
          transition={{ duration: 0.35 }}
          className="pointer-events-auto absolute bottom-4 right-4 z-30 w-[min(430px,calc(100%-2rem))] rounded-[28px] glass-panel panel-grid p-5 shadow-glow"
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
              <div className="flex flex-wrap gap-2">
                <Pill>{selectedItem.category}</Pill>
                <Pill>{selectedItem.status}</Pill>
                <Pill>{selectedItem.year}</Pill>
              </div>
              <p>{selectedItem.shortDescription}</p>
              <p>{selectedItem.detailedDescription}</p>
              <div className="flex flex-wrap gap-2">
                {selectedItem.techStack.map((tech) => (
                  <Pill key={tech}>{tech}</Pill>
                ))}
              </div>
              <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
                <p className="text-xs uppercase tracking-[0.3em] text-white/45">Why It Matters</p>
                <p className="mt-2">{selectedItem.highlight}</p>
              </div>
              <div className="flex flex-wrap gap-3">
                {selectedItem.github ? <ActionLink href={selectedItem.github}>Open GitHub</ActionLink> : null}
                {selectedItem.secondaryLink ? (
                  <ActionLink href={selectedItem.secondaryLink} tone="secondary">
                    Reference Repo
                  </ActionLink>
                ) : null}
                {!selectedItem.github && selectedItem.fallbackLabel ? <Pill>{selectedItem.fallbackLabel}</Pill> : null}
              </div>
            </div>
          ) : null}

          {selectedItem?.kind === 'research' ? (
            <div className="space-y-4 text-sm text-white/72">
              <div className="flex flex-wrap gap-2">
                <Pill>Paper study</Pill>
                <Pill>{selectedItem.year}</Pill>
                <Pill>{selectedItem.domainLabel ?? selectedItem.domain}</Pill>
              </div>
              <p className="text-white/55">{selectedItem.authors}</p>
              <p>{selectedItem.simpleSummary}</p>
              <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
                <p className="text-xs uppercase tracking-[0.3em] text-white/45">Deeper Takeaway</p>
                <p className="mt-2">{selectedItem.deepSummary}</p>
              </div>
              <div className="flex flex-wrap gap-2">
                {selectedItem.keyConcepts.map((concept) => (
                  <Pill key={concept}>{concept}</Pill>
                ))}
              </div>
              <ActionLink href={selectedItem.link} tone="secondary">
                Read Source Paper
              </ActionLink>
            </div>
          ) : null}

          {selectedItem?.kind === 'skill' ? (
            <div className="space-y-4 text-sm text-white/72">
              <div className="flex flex-wrap gap-2">
                <Pill>{skillGroup?.label ?? 'Skill'}</Pill>
                <Pill>{selectedItem.levelLabel}</Pill>
              </div>
              <p>{selectedItem.summary}</p>
              <p>
                The portfolio uses orbit size and speed as a visual shorthand for confidence and recent relevance rather than pretending to be a formal skills matrix.
              </p>
            </div>
          ) : null}

          {selectedItem?.kind === 'education' ? (
            <div className="space-y-4 text-sm text-white/72">
              <div className="flex flex-wrap gap-2">
                <Pill>{selectedItem.institution}</Pill>
                <Pill>{selectedItem.period}</Pill>
              </div>
              <p>{selectedItem.description}</p>
              <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
                <p className="text-xs uppercase tracking-[0.3em] text-white/45">Context</p>
                <p className="mt-2">{selectedItem.details}</p>
              </div>
              <div className="flex flex-wrap gap-2">
                {selectedItem.focus.map((item) => (
                  <Pill key={item}>{item}</Pill>
                ))}
              </div>
            </div>
          ) : null}

          {selectedItem?.kind === 'resume' ? (
            <div className="space-y-4 text-sm text-white/72">
              <p>
                A concise recruiter-facing snapshot of Nakul’s profile: engineering foundations, current MSc focus, public project links, and AI/ML plus scientific-computing direction.
              </p>
              <div className="flex flex-wrap gap-2">
                <Pill>MSc AI/ML in Science</Pill>
                <Pill>Creative Frontend</Pill>
                <Pill>Research-minded engineering</Pill>
              </div>
              <ActionLink href="/resume/nakul-pandit-resume.pdf" download>
                Download Resume PDF
              </ActionLink>
            </div>
          ) : null}

          {selectedItem?.kind === 'contact' ? (
            <div className="space-y-4 text-sm text-white/72">
              <p>{selectedItem.value}</p>
              <p>{contact.availability}</p>
              {selectedItem.action?.type === 'mailto' ? <Pill>Email route</Pill> : null}
              <ActionLink href={selectedItem.href} tone="warm">
                Open {selectedItem.label}
              </ActionLink>
            </div>
          ) : null}

          {!selectedItem && currentGalaxy === 'resume' ? (
            <div className="space-y-4 text-sm text-white/72">
              <p>
                This station is designed for quick recruiter scanning: a direct resume download, a concise technical identity, and clean paths into projects and research.
              </p>
              <div className="flex flex-wrap gap-2">
                <Pill>AI / ML Direction</Pill>
                <Pill>Scientific Computing</Pill>
                <Pill>Interactive Frontend</Pill>
              </div>
              <ActionLink href="/resume/nakul-pandit-resume.pdf" download>
                Download Resume PDF
              </ActionLink>
            </div>
          ) : null}

          {!selectedItem && currentGalaxy === 'contact' ? (
            <form
              className="space-y-4 text-sm text-white/72"
              onSubmit={(event) => {
                event.preventDefault();
                setTransmitted(true);
              }}
            >
              <p>{contact.availability}</p>
              <div className="flex flex-wrap gap-2">
                {contact.channels.map((channel) => (
                  <Pill key={channel.id}>{channel.label}</Pill>
                ))}
              </div>
              <div className="flex flex-wrap gap-3">
                <ActionLink href={about.links.github}>Open GitHub</ActionLink>
                <ActionLink href={about.links.linkedin} tone="secondary">
                  Open LinkedIn
                </ActionLink>
                {contact.channels.find((entry) => entry.id === 'email') ? (
                  <ActionLink href={contact.channels.find((entry) => entry.id === 'email').href} tone="warm">
                    Send Email
                  </ActionLink>
                ) : null}
              </div>
              <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
                <p className="text-xs uppercase tracking-[0.3em] text-white/45">Signal Console</p>
                <p className="mt-2">{contact.note}</p>
              </div>
              <input
                type="text"
                placeholder="Your name"
                className="w-full rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-white outline-none placeholder:text-white/35"
              />
              <input
                type="text"
                placeholder="Topic"
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
              {transmitted ? <p className="text-aurora">Signal drafted. Public links above are the reliable contact routes included here.</p> : null}
            </form>
          ) : null}

          {!selectedItem && galaxy && currentGalaxy !== 'resume' && currentGalaxy !== 'contact' ? (
            <div className="space-y-3 text-sm text-white/72">
              <p>{galaxy.description}</p>
              <p>
                Hover reveals lightweight cues; clicking deeper opens the richer panel state. The strongest recruiter-facing sections are Projects, Research, and Resume.
              </p>
            </div>
          ) : null}
        </motion.aside>
      ) : null}
    </AnimatePresence>
  );
}
