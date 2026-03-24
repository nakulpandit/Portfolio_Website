export const researchDomains = [
  {
    id: 'ai',
    title: 'AI Constellation',
    color: '#ff7df2',
    position: [-1.8, 0.8, 0],
    summary: 'Human-centered machine intelligence, multimodal systems, and trustworthy model interaction.',
  },
  {
    id: 'space',
    title: 'Space Systems',
    color: '#72f7ff',
    position: [1.8, 0.2, 0.4],
    summary: 'Orbital computation, planetary sensing, and mission intelligence.',
  },
  {
    id: 'data-science',
    title: 'Data Science',
    color: '#a4ff86',
    position: [0.4, -1.7, -0.2],
    summary: 'Signal extraction, decision systems, and exploratory modeling.',
  },
];

export const researchPapers = [
  {
    id: 'adaptive-agents',
    domain: 'ai',
    title: 'Adaptive Agents for Multimodal Decision Support',
    year: '2025',
    position: [-2.3, 1.4, 0.2],
    summary:
      'Designed an interpretable agent workflow that fused visual and structured inputs for complex planning tasks.',
    concepts: ['Multimodal reasoning', 'Interpretability', 'Agent orchestration'],
    notes: 'Focused on interaction design patterns that keep high-agency users in control.',
    link: 'https://example.com/adaptive-agents',
  },
  {
    id: 'orbital-vision',
    domain: 'space',
    title: 'Orbital Vision for Terrain Change Detection',
    year: '2024',
    position: [2.3, 0.7, 0.1],
    summary:
      'Explored automated surface-change detection using temporal satellite imagery and uncertainty-aware scoring.',
    concepts: ['Remote sensing', 'Temporal modeling', 'Uncertainty estimation'],
    notes: 'Highlighted a lightweight UI for analysts reviewing model confidence.',
    link: 'https://example.com/orbital-vision',
  },
  {
    id: 'resilient-signals',
    domain: 'data-science',
    title: 'Resilient Signal Modeling in Sparse Systems',
    year: '2023',
    position: [0.5, -2.3, -0.1],
    summary:
      'Investigated sparse-data forecasting strategies with explainable outputs for technical stakeholders.',
    concepts: ['Forecasting', 'Sparse datasets', 'Explainability'],
    notes: 'Connected low-signal data scenarios to human decision-making workflows.',
    link: 'https://example.com/resilient-signals',
  },
];

export const paperConnections = [
  ['adaptive-agents', 'orbital-vision'],
  ['adaptive-agents', 'resilient-signals'],
  ['orbital-vision', 'resilient-signals'],
];
