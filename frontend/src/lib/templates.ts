export interface DocumentTemplate {
  id: string;
  name: string;
  description: string;
  icon: string;
  category: 'proposal' | 'contract' | 'report' | 'general';
  sections: string[];
  defaultInstruction: string;
  styleGuidance: string;
}

export const templates: DocumentTemplate[] = [
  {
    id: 'business-proposal',
    name: 'Business Proposal',
    description: 'Professional proposal for business opportunities and partnerships',
    icon: '💼',
    category: 'proposal',
    sections: [
      'Executive Summary',
      'Problem Statement',
      'Proposed Solution',
      'Scope of Work',
      'Timeline & Milestones',
      'Budget & Pricing',
      'Terms & Conditions',
      'Conclusion',
    ],
    defaultInstruction: 'Create a professional business proposal that clearly outlines the value proposition and benefits.',
    styleGuidance: 'Professional and persuasive tone. Use bullet points for key benefits. Include specific numbers and metrics where possible.',
  },
  {
    id: 'investment-proposal',
    name: 'Investment Proposal',
    description: 'Pitch deck style proposal for investors and funding rounds',
    icon: '📈',
    category: 'proposal',
    sections: [
      'Executive Summary',
      'Market Opportunity',
      'Problem & Solution',
      'Business Model',
      'Traction & Metrics',
      'Team',
      'Financial Projections',
      'Investment Ask',
    ],
    defaultInstruction: 'Create a compelling investment proposal that highlights market opportunity and growth potential.',
    styleGuidance: 'Confident and data-driven tone. Emphasize market size, traction metrics, and competitive advantages.',
  },
  {
    id: 'project-proposal',
    name: 'Project Proposal',
    description: 'Detailed proposal for internal or client projects',
    icon: '📋',
    category: 'proposal',
    sections: [
      'Project Overview',
      'Objectives',
      'Scope',
      'Methodology',
      'Deliverables',
      'Timeline',
      'Resources Required',
      'Risk Assessment',
    ],
    defaultInstruction: 'Create a detailed project proposal with clear objectives, scope, and deliverables.',
    styleGuidance: 'Clear and structured. Use tables for timelines. Be specific about deliverables and success criteria.',
  },
  {
    id: 'service-contract',
    name: 'Service Agreement',
    description: 'Contract template for service-based engagements',
    icon: '📝',
    category: 'contract',
    sections: [
      'Parties',
      'Scope of Services',
      'Term & Duration',
      'Compensation',
      'Payment Terms',
      'Confidentiality',
      'Intellectual Property',
      'Termination',
      'Governing Law',
    ],
    defaultInstruction: 'Create a professional service agreement that protects both parties.',
    styleGuidance: 'Formal legal tone. Use clear, unambiguous language. Define all terms precisely.',
  },
  {
    id: 'nda',
    name: 'Non-Disclosure Agreement',
    description: 'Standard NDA for protecting confidential information',
    icon: '🔒',
    category: 'contract',
    sections: [
      'Parties',
      'Definition of Confidential Information',
      'Obligations of Receiving Party',
      'Exclusions',
      'Term',
      'Return of Information',
      'Remedies',
      'General Provisions',
    ],
    defaultInstruction: 'Create a mutual non-disclosure agreement to protect confidential information shared between parties.',
    styleGuidance: 'Formal legal language. Be specific about what constitutes confidential information.',
  },
  {
    id: 'research-report',
    name: 'Research Report',
    description: 'Academic or business research report format',
    icon: '🔬',
    category: 'report',
    sections: [
      'Abstract',
      'Introduction',
      'Literature Review',
      'Methodology',
      'Findings',
      'Analysis',
      'Conclusions',
      'Recommendations',
      'References',
    ],
    defaultInstruction: 'Create a comprehensive research report with evidence-based findings.',
    styleGuidance: 'Academic and objective tone. Cite sources. Present data clearly with visualizations where appropriate.',
  },
  {
    id: 'status-report',
    name: 'Status Report',
    description: 'Project or business status update report',
    icon: '📊',
    category: 'report',
    sections: [
      'Executive Summary',
      'Key Accomplishments',
      'Work in Progress',
      'Upcoming Milestones',
      'Risks & Issues',
      'Budget Status',
      'Next Steps',
    ],
    defaultInstruction: 'Create a concise status report highlighting progress, issues, and next steps.',
    styleGuidance: 'Concise and factual. Use bullet points. Highlight blockers and risks prominently.',
  },
  {
    id: 'custom',
    name: 'Custom Document',
    description: 'Start from scratch with your own structure',
    icon: '✨',
    category: 'general',
    sections: [
      'Introduction',
      'Background',
      'Main Content',
      'Conclusion',
    ],
    defaultInstruction: '',
    styleGuidance: '',
  },
];

export const getTemplateById = (id: string): DocumentTemplate | undefined => {
  return templates.find((t) => t.id === id);
};

export const getTemplatesByCategory = (category: DocumentTemplate['category']): DocumentTemplate[] => {
  return templates.filter((t) => t.category === category);
};
