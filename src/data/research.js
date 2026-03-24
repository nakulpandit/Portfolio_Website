export const researchDomains = [
  {
    id: 'llm-foundations',
    title: 'LLM Foundations',
    color: '#ff7df2',
    position: [-2.1, 1.25, 0.35],
    summary: 'Papers studied to understand transformers, open language models, and modern LLM building blocks.',
  },
  {
    id: 'scientific-ml',
    title: 'Scientific ML',
    color: '#72f7ff',
    position: [2.0, 0.4, 0.6],
    summary: 'Research threads connecting model design, vision, and domain-facing applied machine learning.',
  },
  {
    id: 'space-curiosity',
    title: 'Space Curiosity',
    color: '#a4ff86',
    position: [0.3, -1.9, -0.35],
    summary: 'Papers and study directions feeding a longer-term interest in astronomy, exoplanets, and scientific discovery.',
  },
];

export const researchPapers = [
  {
    id: 'attention-is-all-you-need',
    domain: 'llm-foundations',
    title: 'Attention Is All You Need',
    authors: 'Vaswani et al.',
    year: '2017',
    position: [-3.0, 1.7, 0.55],
    simpleSummary:
      'A foundational paper studied to understand why transformer-based models became the backbone of modern language AI.',
    deepSummary:
      'This paper replaces recurrence with self-attention, enabling models to process relationships across a sequence more directly and in parallel. For Nakul’s learning path, it serves as the conceptual starting point for understanding today’s LLM ecosystem.',
    keyConcepts: ['Transformers', 'Self-attention', 'Sequence modeling', 'Parallel training'],
    link: 'https://arxiv.org/abs/1706.03762',
    relatedTo: ['llama-open-efficient-foundation-models', 'deep-residual-learning'],
  },
  {
    id: 'llama-open-efficient-foundation-models',
    domain: 'llm-foundations',
    title: 'LLaMA: Open and Efficient Foundation Language Models',
    authors: 'Touvron et al.',
    year: '2023',
    position: [-1.2, 2.15, 0.15],
    simpleSummary:
      'A paper explored to better understand open foundation models and the training ideas behind practical language-model systems.',
    deepSummary:
      'LLaMA is relevant here because it ties directly to Nakul’s chatbot experimentation. The paper is useful less as theory alone and more as a bridge between model architecture reading and hands-on LLM implementation.',
    keyConcepts: ['Open models', 'Foundation models', 'Scaling', 'Language modeling'],
    link: 'https://arxiv.org/abs/2302.13971',
    relatedTo: ['attention-is-all-you-need'],
  },
  {
    id: 'deep-residual-learning',
    domain: 'scientific-ml',
    title: 'Deep Residual Learning for Image Recognition',
    authors: 'He, Zhang, Ren, Sun',
    year: '2015',
    position: [2.2, 1.1, -0.15],
    simpleSummary:
      'Studied as a key computer-vision foundation paper, especially relevant when thinking about deep learning beyond language tasks.',
    deepSummary:
      'ResNet is important because it demonstrates how architectural changes can make deeper networks train more reliably. It helps connect theoretical deep learning concepts to more applied vision and scientific-imaging contexts.',
    keyConcepts: ['ResNet', 'Skip connections', 'Computer vision', 'Deep learning'],
    link: 'https://arxiv.org/abs/1512.03385',
    relatedTo: ['precision-agriculture-survey'],
  },
  {
    id: 'precision-agriculture-survey',
    domain: 'scientific-ml',
    title: 'Precision Agriculture: AI-Driven Crop Monitoring Systems',
    authors: 'Kamilaris, Prenafeta-Boldu',
    year: '2018',
    position: [3.0, -0.2, 0.35],
    simpleSummary:
      'Included as a survey-style reference point for how AI techniques translate into sensing, crop monitoring, and applied environmental systems.',
    deepSummary:
      'This study direction resonates with AGRIBOT and broader interest in practical AI. It provides a wider lens on how learning systems, sensing, and domain constraints come together outside purely digital products.',
    keyConcepts: ['Precision agriculture', 'Computer vision', 'Environmental monitoring', 'Applied AI'],
    link: 'https://doi.org/10.1016/j.compag.2018.02.016',
    relatedTo: ['deep-residual-learning', 'ches-observation-strategy'],
  },
  {
    id: 'ches-observation-strategy',
    domain: 'space-curiosity',
    title: 'Closeby Habitable Exoplanet Survey (CHES) II: An Observation Strategy for the Target Stars',
    authors: 'Tan et al.',
    year: '2024',
    position: [0.4, -2.65, -0.25],
    simpleSummary:
      'A space-oriented paper explored as part of a wider interest in habitable planets, observation strategy, and exoplanet science.',
    deepSummary:
      'CHES II is less about machine learning and more about the scientific destination that motivates part of Nakul’s trajectory. It outlines how a mission could prioritize nearby solar-type stars and structure observation strategy for habitable-planet discovery.',
    keyConcepts: ['Exoplanets', 'Observation strategy', 'Habitability', 'Mission planning'],
    link: 'https://arxiv.org/abs/2408.06338',
    relatedTo: ['attention-is-all-you-need'],
  },
];

export const paperConnections = researchPapers.flatMap((paper) =>
  (paper.relatedTo ?? []).map((target) => [paper.id, target]),
);
