import { useState, useEffect, useRef, useCallback } from 'react';
import { useSearchParams, Link, useNavigate } from 'react-router-dom';
import { api } from '../api/client';
import { DocumentList } from '../components/DocumentList';
import { DocumentListSkeleton } from '../components/DocumentListSkeleton';
import { StreamingMarkdown } from '../components/StreamingMarkdown';
import { useAppUser } from '../contexts/UserContext';
import { templates, type DocumentTemplate } from '../lib/templates';
import { exportToPdf, exportToDocx, exportToMarkdown } from '../lib/exportUtils';
import { demoDocuments, type DemoDocument } from '../lib/demoData';
import type { Document, DraftResponse } from '../api/types';

const mockDemoDocuments: Document[] = demoDocuments.map((doc: DemoDocument, index: number) => ({
  doc_id: `demo-${index + 1}`,
  file_name: doc.name,
  file_type: 'application/pdf',
  status: 'indexed' as const,
  created_at: new Date().toISOString(),
}));

const styleOptions = [
  'Professional & Formal',
  'Technical & Concise',
  'Persuasive & Narrative',
  'Academic & Research',
  'Casual & Conversational',
];

const categoryLabels: Record<string, string> = {
  proposal: 'Proposals',
  contract: 'Contracts',
  report: 'Reports',
  general: 'Other',
};

// ── Draft History ────────────────────────────────────────────────────────────
interface SavedDraft {
  id: string;
  title: string;
  templateName: string;
  draft: DraftResponse;
  createdAt: string;
  updatedAt: string;
}

const getDraftHistoryKey = (userId: string) => `docrag-draft-history-${userId}`;

function loadDraftHistory(userId: string): SavedDraft[] {
  try {
    const stored = localStorage.getItem(getDraftHistoryKey(userId));
    return stored ? JSON.parse(stored) : [];
  } catch { return []; }
}

function saveDraftHistory(userId: string, history: SavedDraft[]) {
  try {
    localStorage.setItem(getDraftHistoryKey(userId), JSON.stringify(history));
  } catch { /* ignore quota errors */ }
}

// ── AI Refine Actions ────────────────────────────────────────────────────────
const refineActions = [
  { label: 'Make Formal', icon: 'business_center', instruction: 'Make the tone more formal and professional. Use industry-standard language.' },
  { label: 'Simplify', icon: 'lightbulb', instruction: 'Simplify the language. Use shorter sentences, clearer words, and remove jargon.' },
  { label: 'Expand', icon: 'expand', instruction: 'Expand each section with more detail, examples, and supporting points. Make it more comprehensive.' },
  { label: 'Shorten', icon: 'compress', instruction: 'Make this more concise. Remove redundancy, tighten prose, keep key points.' },
  { label: 'Fix Grammar', icon: 'spellcheck', instruction: 'Fix all grammar, spelling, and punctuation errors. Do not change the content or meaning.' },
];

export function DraftPage() {
  const { id: userId } = useAppUser();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const isDemo = searchParams.get('demo') === 'true';

  const toggleDemoMode = () => {
    navigate(isDemo ? '/draft' : '/draft?demo=true');
  };

  const [documents, setDocuments] = useState<Document[]>([]);
  const [isLoadingDocs, setIsLoadingDocs] = useState(true);
  const [selectedDocIds, setSelectedDocIds] = useState<string[]>([]);
  const [selectedTemplate, setSelectedTemplate] = useState<DocumentTemplate | null>(null);
  const [instruction, setInstruction] = useState('');
  const [enabledSections, setEnabledSections] = useState<string[]>([]);
  const [styleGuidance, setStyleGuidance] = useState(styleOptions[0]);
  const [documentTitle, setDocumentTitle] = useState('');
  const [draft, setDraft] = useState<DraftResponse | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isRefining, setIsRefining] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [activeTab, setActiveTab] = useState<'preview' | 'edit' | 'raw'>('preview');
  const [showTemplates, setShowTemplates] = useState(true);
  const [showExportMenu, setShowExportMenu] = useState(false);
  const [showDocSelector, setShowDocSelector] = useState(false);
  const [customRefinePrompt, setCustomRefinePrompt] = useState('');

  // Draft history
  const [draftHistory, setDraftHistory] = useState<SavedDraft[]>(() => loadDraftHistory(userId));
  const [showHistory, setShowHistory] = useState(false);
  const [activeDraftId, setActiveDraftId] = useState<string | null>(null);

  const docSelectorRef = useRef<HTMLDivElement>(null);
  const exportMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (docSelectorRef.current && !docSelectorRef.current.contains(e.target as Node)) {
        setShowDocSelector(false);
      }
      if (exportMenuRef.current && !exportMenuRef.current.contains(e.target as Node)) {
        setShowExportMenu(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    if (isDemo) {
      setDocuments(mockDemoDocuments);
      setSelectedDocIds(mockDemoDocuments.map((d) => d.doc_id));
      setIsLoadingDocs(false);
    } else {
      api.listDocuments('indexed').then(({ documents }) => setDocuments(documents)).finally(() => setIsLoadingDocs(false));
    }
  }, [isDemo]);

  const handleSelectTemplate = (template: DocumentTemplate) => {
    setSelectedTemplate(template);
    setEnabledSections([...template.sections]);
    setInstruction(template.defaultInstruction);
    setStyleGuidance(template.styleGuidance || styleOptions[0]);
    setShowTemplates(false);
  };

  const toggleSection = (section: string) => {
    setEnabledSections((prev) =>
      prev.includes(section) ? prev.filter((s) => s !== section) : [...prev, section]
    );
  };

  const removeDocument = (docId: string) => {
    setSelectedDocIds((prev) => prev.filter((id) => id !== docId));
  };

  const getDocFileName = (docId: string) => {
    return documents.find((d) => d.doc_id === docId)?.file_name || docId;
  };

  const handleGenerate = async () => {
    if (!instruction.trim() || selectedDocIds.length === 0) return;

    setIsGenerating(true);
    setError(null);
    setDraft(null);

    try {
      const sectionList = enabledSections.filter(Boolean);

      if (isDemo) {
        await new Promise((resolve) => setTimeout(resolve, 2000));
        const templateId = selectedTemplate?.id || 'business-proposal';
        const demoContent = generateDemoDraft(templateId, documentTitle);
        setDraft({
          instruction,
          draft: demoContent,
          sections: sectionList.map((s) => ({ title: s, content: '' })),
          reference_docs: mockDemoDocuments.map((d) => d.file_name),
        });
      } else {
        // Stream the draft token-by-token
        const streamingDraft: DraftResponse = {
          instruction,
          draft: '',
          sections: [],
          reference_docs: [],
        };
        setDraft(streamingDraft);

        await api.generateDraftStream(
          instruction,
          selectedDocIds,
          (chunk) => {
            setDraft((prev) => prev ? { ...prev, draft: prev.draft + chunk } : prev);
          },
          (metadata) => {
            setDraft((prev) => prev ? {
              ...prev,
              sections: metadata.sections.map((s) => ({ title: s.title, content: s.content })),
              reference_docs: metadata.reference_docs,
            } : prev);
          },
          sectionList.length > 0 ? sectionList : undefined,
          styleGuidance.trim() || undefined
        );
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to generate draft');
    } finally {
      setIsGenerating(false);
    }
  };

  // ── Draft History ──────────────────────────────────────────────────────────
  const saveDraftToHistory = useCallback((draftToSave: DraftResponse) => {
    const title = documentTitle || draftToSave.draft.match(/^#\s+(.+)/m)?.[1] || 'Untitled Draft';
    const now = new Date().toISOString();

    setDraftHistory((prev) => {
      let updated: SavedDraft[];
      if (activeDraftId) {
        // Update existing
        updated = prev.map((d) =>
          d.id === activeDraftId
            ? { ...d, title, draft: draftToSave, updatedAt: now }
            : d
        );
      } else {
        // Create new
        const newDraft: SavedDraft = {
          id: crypto.randomUUID(),
          title,
          templateName: selectedTemplate?.name || 'Custom',
          draft: draftToSave,
          createdAt: now,
          updatedAt: now,
        };
        setActiveDraftId(newDraft.id);
        updated = [newDraft, ...prev];
      }
      saveDraftHistory(userId, updated);
      return updated;
    });
  }, [activeDraftId, documentTitle, selectedTemplate, userId]);

  // Auto-save after generation completes
  useEffect(() => {
    if (draft && draft.draft && !isGenerating && !isRefining) {
      saveDraftToHistory(draft);
    }
  }, [isGenerating, isRefining]);

  const loadDraftFromHistory = (saved: SavedDraft) => {
    setDraft(saved.draft);
    setActiveDraftId(saved.id);
    setDocumentTitle(saved.title);
    setShowHistory(false);
    setShowTemplates(false);
    setActiveTab('preview');
  };

  const deleteDraftFromHistory = (id: string) => {
    setDraftHistory((prev) => {
      const updated = prev.filter((d) => d.id !== id);
      saveDraftHistory(userId, updated);
      return updated;
    });
    if (activeDraftId === id) {
      setActiveDraftId(null);
    }
  };

  const handleNewDraft = () => {
    setDraft(null);
    setActiveDraftId(null);
    setDocumentTitle('');
    setInstruction('');
    setShowTemplates(true);
    setShowHistory(false);
  };

  // ── AI Refine ──────────────────────────────────────────────────────────────
  const handleRefine = async (refineInstruction: string) => {
    if (!draft || !refineInstruction.trim() || isRefining || isGenerating) return;

    setIsRefining(true);
    setError(null);
    setActiveTab('preview');

    try {
      const previousDraft = draft.draft;
      setDraft((prev) => prev ? { ...prev, draft: '' } : prev);

      await api.refineDraftStream(
        previousDraft,
        refineInstruction,
        (chunk) => {
          setDraft((prev) => prev ? { ...prev, draft: prev.draft + chunk } : prev);
        },
      );
      setCustomRefinePrompt('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to refine draft');
      // Restore the previous draft on error
      setDraft((prev) => prev ? { ...prev, draft: draft.draft } : prev);
    } finally {
      setIsRefining(false);
    }
  };

  const generateDemoDraft = (templateId: string, title: string): string => {
    const docTitle = title || selectedTemplate?.name || 'Business Proposal';

    if (templateId === 'investment-proposal') {
      return `# ${docTitle}

## Executive Summary

Based on our analysis of similar successful ventures, we present a compelling investment opportunity in the document automation space. The market is experiencing rapid growth with digital transformation initiatives driving demand.

**Key Highlights:**
- Target market size: $10.17 billion by 2025
- Projected CAGR: 13.2%
- Current traction: Strong customer retention and NPS scores

## Market Opportunity

The global document management market presents significant growth potential. Enterprise companies are actively seeking solutions to reduce the 40% of employee time currently spent on manual document processing.

**Market Drivers:**
- Digital transformation acceleration
- Remote work adoption
- Compliance requirements
- Operational efficiency demands

## Problem & Solution

**The Problem:**
Organizations struggle with manual document processing, inconsistent quality, and difficulty finding information across documents.

**Our Solution:**
AI-powered platform offering automated document generation, smart search, real-time collaboration, and compliance monitoring.

## Business Model

SaaS subscription model with tiered pricing:
- Starter: $500/month (up to 10 users)
- Professional: $2,000/month (up to 50 users)
- Enterprise: Custom pricing

Average contract value: $45,000/year

## Financial Projections

| Year | ARR Projection |
|------|---------------|
| Year 1 | $3M |
| Year 2 | $8M |
| Year 3 | $20M |

## Investment Ask

Seeking $5M Series A at $20M pre-money valuation.

**Use of Funds:**
- 50% Sales & Marketing
- 30% Product Development
- 20% Operations

---
*Generated with DocRAG | Demo Mode*`;
    }

    if (templateId === 'service-contract') {
      return `# ${docTitle}

## Software Development Agreement

This Software Development Agreement ("Agreement") establishes the terms for custom software development services.

## 1. Parties

**Client:** [Client Name]
**Developer:** [Developer Name]

## 2. Scope of Services

### 2.1 Project Description
Developer agrees to design, develop, and deliver custom software according to the specifications outlined in the project documentation.

### 2.2 Deliverables
- Requirements documentation
- System architecture design
- Frontend and backend application
- Database design and implementation
- User documentation
- Training materials

## 3. Timeline

| Phase | Duration |
|-------|----------|
| Requirements | 4 weeks |
| Design | 6 weeks |
| Development | 16 weeks |
| Testing | 4 weeks |
| Deployment | 2 weeks |

## 4. Compensation

### 4.1 Payment Schedule
- 20% upon signing
- 20% upon design approval
- 30% upon beta delivery
- 20% upon final delivery
- 10% upon acceptance

## 5. Intellectual Property

All work product created specifically for this project shall be owned by Client upon full payment.

## 6. Confidentiality

Both parties agree to maintain confidentiality of all proprietary information exchanged during this engagement.

## 7. Warranties

Developer warrants that the software will perform according to specifications and be free from material defects for 90 days.

## 8. Termination

Either party may terminate with 30 days written notice.

---
*Generated with DocRAG | Demo Mode*`;
    }

    if (templateId === 'status-report') {
      return `# ${docTitle}

## Executive Summary

Project remains on track for scheduled delivery. Key milestones have been achieved this quarter with budget utilization at 78%. No significant blockers identified.

**Status: ON TRACK**

## Key Accomplishments

### Completed This Period
- Infrastructure migration completed (12 services migrated)
- API Gateway implementation deployed
- Database optimization achieved 60% performance improvement
- Security audit passed

### Metrics
| Metric | Target | Actual |
|--------|--------|--------|
| Uptime | 99.5% | 99.9% |
| Response Time | <200ms | 150ms |
| Bug Resolution | 48hrs | 36hrs |

## Work in Progress

| Task | Owner | Status | ETA |
|------|-------|--------|-----|
| Security Testing | Security Team | In Progress | Next Week |
| User Training | L&D Team | In Progress | 2 Weeks |
| Documentation | Tech Writers | In Progress | 1 Week |

## Risks & Issues

### Active Risks
1. **Holiday Staffing** (Medium)
   - Mitigation: On-call rotation established

2. **Third-party Dependencies** (Low)
   - Mitigation: Fallback endpoints configured

### Resolved Issues
- Performance regression in reporting module - Fixed

## Budget Status

| Category | Budgeted | Spent | Remaining |
|----------|----------|-------|-----------|
| Personnel | $800K | $650K | $150K |
| Infrastructure | $200K | $145K | $55K |
| Software | $100K | $85K | $15K |
| **Total** | **$1.1M** | **$880K** | **$220K** |

## Next Steps

1. Complete security testing
2. Finalize documentation
3. Begin user acceptance testing
4. Schedule go-live dry run

---
*Generated with DocRAG | Demo Mode*`;
    }

    return `# ${docTitle}

## Executive Summary

This proposal outlines a comprehensive solution for document automation and intelligence, designed to transform how organizations create, manage, and leverage their business documents.

**Key Benefits:**
- 10x faster document creation
- Consistent quality and branding
- AI-powered content generation
- Full source traceability

## Problem Statement

Organizations face significant challenges in document management:
- Manual processes consume 40% of employee time
- Inconsistent document quality across teams
- Difficulty maintaining compliance
- Inefficient knowledge retrieval

## Proposed Solution

Our AI-powered document intelligence platform provides:

### Smart Document Generation
- Template-based creation with AI assistance
- Style and tone matching
- Automatic section generation

### Semantic Search
- Natural language queries
- Context-aware results
- Cross-document discovery

### Citation & Compliance
- Automatic source tracking
- Audit trails
- Version control

## Implementation Plan

| Phase | Activities | Duration |
|-------|-----------|----------|
| Discovery | Requirements gathering, stakeholder interviews | 2 weeks |
| Setup | Platform configuration, integration | 2 weeks |
| Training | User onboarding, documentation | 1 week |
| Launch | Go-live, monitoring | 1 week |

## Investment

### Pricing Options
- **Starter:** $500/month (10 users)
- **Professional:** $2,000/month (50 users)
- **Enterprise:** Custom pricing

### ROI Projection
- 70% reduction in document creation time
- 50% improvement in consistency
- Payback period: 3-6 months

## Next Steps

1. Schedule a demo session
2. Define pilot scope
3. Begin discovery phase

## Contact

For questions or to proceed, please contact our team.

---
*Generated with DocRAG | Demo Mode*`;
  };

  const handleCopy = async () => {
    if (!draft) return;
    await navigator.clipboard.writeText(draft.draft);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleExport = async (format: 'pdf' | 'docx' | 'md') => {
    if (!draft) return;
    const title = documentTitle || selectedTemplate?.name || 'Document';

    try {
      if (format === 'pdf') {
        await exportToPdf(draft.draft, { title, author: 'DocRAG' });
      } else if (format === 'docx') {
        await exportToDocx(draft.draft, { title, author: 'DocRAG' });
      } else {
        exportToMarkdown(draft.draft, { title });
      }
    } catch {
      setError(`Failed to export as ${format.toUpperCase()}`);
    }
    setShowExportMenu(false);
  };

  const groupedTemplates: Record<string, DocumentTemplate[]> = {
    proposal: templates.filter((t: DocumentTemplate) => t.category === 'proposal'),
    contract: templates.filter((t: DocumentTemplate) => t.category === 'contract'),
    report: templates.filter((t: DocumentTemplate) => t.category === 'report'),
    general: templates.filter((t: DocumentTemplate) => t.category === 'general'),
  };

  const selectedDocNames = draft?.reference_docs || selectedDocIds.map(getDocFileName);

  return (
    <div className="flex flex-col min-h-screen animate-fade-in">
      {/* Toolbar */}
      <div className="sticky top-14 z-20 flex flex-wrap items-center justify-between gap-3 border-b border-neutral-100 glass-panel px-8 py-2.5">
        <div className="flex items-center gap-3">
          {isDemo ? (
            <span className="rounded-full border border-amber-100 bg-amber-50 px-3 py-1 text-xs font-bold text-amber-700">
              Demo Mode
            </span>
          ) : (
            <span className="rounded bg-neutral-100 px-2 py-0.5 text-[10px] font-bold tracking-wider text-neutral-500">
              WORKSPACE
            </span>
          )}
          {!showTemplates && (
            <button
              onClick={handleNewDraft}
              className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-semibold text-primary hover:bg-violet-50 rounded-lg transition-colors cursor-pointer"
            >
              <span className="material-symbols-outlined text-base">add</span>
              New
            </button>
          )}
        </div>
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => setShowHistory(!showHistory)}
            className={`flex items-center gap-1.5 px-3 py-1.5 text-sm font-semibold rounded-lg transition-colors cursor-pointer ${
              showHistory
                ? 'bg-violet-50 text-primary'
                : 'text-neutral-500 hover:text-neutral-700 hover:bg-neutral-50'
            }`}
          >
            <span className="material-symbols-outlined text-base">history</span>
            History
            {draftHistory.length > 0 && (
              <span className="ml-1 px-1.5 py-0.5 text-[10px] font-bold bg-violet-100 text-violet-600 rounded-full">
                {draftHistory.length}
              </span>
            )}
          </button>
          <button
            type="button"
            onClick={toggleDemoMode}
            className="cursor-pointer text-sm font-medium text-primary hover:underline"
          >
            {isDemo ? 'Exit Demo' : 'Try Demo'}
          </button>
        </div>
      </div>

      {/* ── History Sidebar (slide-over) ── */}
      {showHistory && (
        <div className="fixed inset-0 z-30 flex justify-end">
          <div className="absolute inset-0 bg-black/20 backdrop-blur-sm" onClick={() => setShowHistory(false)} />
          <div className="relative w-full max-w-sm bg-white shadow-2xl border-l border-neutral-200 flex flex-col animate-slide-in-left">
            {/* Header */}
            <div className="flex items-center justify-between p-5 border-b border-neutral-100">
              <div className="flex items-center gap-2.5">
                <span className="material-symbols-outlined text-violet-500">history</span>
                <h3 className="font-headline font-bold text-neutral-900">Draft History</h3>
              </div>
              <button
                onClick={() => setShowHistory(false)}
                className="p-1.5 text-neutral-400 hover:text-neutral-600 hover:bg-neutral-100 rounded-lg transition-colors cursor-pointer"
              >
                <span className="material-symbols-outlined text-lg">close</span>
              </button>
            </div>

            {/* Draft List */}
            <div className="flex-1 overflow-y-auto p-4 space-y-2">
              {draftHistory.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-center py-12">
                  <div className="w-14 h-14 rounded-2xl bg-neutral-100 flex items-center justify-center mb-3">
                    <span className="material-symbols-outlined text-2xl text-neutral-300">description</span>
                  </div>
                  <p className="text-sm font-medium text-neutral-500">No saved drafts yet</p>
                  <p className="text-xs text-neutral-400 mt-1">Generated drafts will appear here</p>
                </div>
              ) : (
                draftHistory.map((saved) => (
                  <div
                    key={saved.id}
                    className={`group p-4 rounded-xl border transition-all cursor-pointer ${
                      activeDraftId === saved.id
                        ? 'border-violet-200 bg-violet-50/50'
                        : 'border-neutral-100 bg-white hover:border-neutral-200 hover:shadow-sm'
                    }`}
                    onClick={() => loadDraftFromHistory(saved)}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0 flex-1">
                        <p className="font-semibold text-sm text-neutral-900 truncate">{saved.title}</p>
                        <p className="text-xs text-neutral-400 mt-0.5">{saved.templateName}</p>
                        <p className="text-[11px] text-neutral-400 mt-1.5">
                          {new Date(saved.updatedAt).toLocaleDateString(undefined, {
                            month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit',
                          })}
                        </p>
                      </div>
                      <button
                        onClick={(e) => { e.stopPropagation(); deleteDraftFromHistory(saved.id); }}
                        className="opacity-0 group-hover:opacity-100 p-1 text-neutral-300 hover:text-red-500 transition-all cursor-pointer"
                        title="Delete draft"
                      >
                        <span className="material-symbols-outlined text-base">delete</span>
                      </button>
                    </div>
                    <p className="text-xs text-neutral-500 mt-2 line-clamp-2">
                      {saved.draft.draft.replace(/[#*_`>|\-\[\]]/g, '').slice(0, 120)}...
                    </p>
                  </div>
                ))
              )}
            </div>

            {/* Footer */}
            {draftHistory.length > 0 && (
              <div className="p-4 border-t border-neutral-100">
                <button
                  onClick={handleNewDraft}
                  className="w-full flex items-center justify-center gap-2 px-4 py-2.5 primary-gradient text-white text-sm font-bold rounded-xl shadow-lg shadow-violet-500/15 hover:shadow-xl transition-all cursor-pointer"
                >
                  <span className="material-symbols-outlined text-base">add</span>
                  New Draft
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Template Selection View */}
      {showTemplates ? (
        <div className="flex-1 p-8 overflow-y-auto">
          {/* Demo Banner */}
          {isDemo && (
            <div className="mb-6 bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 rounded-2xl p-5 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-amber-100 rounded-xl flex items-center justify-center">
                  <span className="material-symbols-outlined text-amber-600" style={{ fontSize: '24px' }}>
                    auto_awesome
                  </span>
                </div>
                <div>
                  <p className="font-bold text-amber-900">Demo Mode Active</p>
                  <p className="text-sm text-amber-700">
                    Using sample documents to showcase the draft generation feature
                  </p>
                </div>
              </div>
              <Link
                to="/upload"
                className="px-5 py-2.5 primary-gradient text-white text-sm font-bold rounded-xl shadow-lg hover:shadow-xl transition-all cursor-pointer"
              >
                Upload Real Documents
              </Link>
            </div>
          )}

          {error && (
            <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-5 py-4 rounded-2xl flex items-start gap-3">
              <span className="material-symbols-outlined flex-shrink-0 mt-0.5" style={{ fontSize: '20px' }}>
                error
              </span>
              <span>{error}</span>
            </div>
          )}

          <div className="bg-white rounded-2xl border border-neutral-200/60 shadow-sm p-8">
            <h2 className="font-headline text-lg font-extrabold text-neutral-900 mb-6">Choose a Template</h2>

            {Object.entries(groupedTemplates).map(([category, categoryTemplates]) =>
              categoryTemplates.length > 0 ? (
                <div key={category} className="mb-8 last:mb-0">
                  <h3 className="text-sm font-bold text-neutral-900 uppercase tracking-widest mb-4">
                    {categoryLabels[category] || category}
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {categoryTemplates.map((template: DocumentTemplate) => (
                      <button
                        key={template.id}
                        onClick={() => handleSelectTemplate(template)}
                        className="flex items-start gap-4 p-5 rounded-2xl border border-neutral-200/60 bg-white shadow-sm hover:shadow-md hover:border-primary/20 transition-all text-left cursor-pointer"
                      >
                        <div className="w-12 h-12 bg-primary-fixed rounded-xl flex items-center justify-center flex-shrink-0">
                          <span className="text-2xl">{template.icon}</span>
                        </div>
                        <div>
                          <p className="font-bold text-on-surface">{template.name}</p>
                          <p className="text-sm text-on-surface-variant mt-1">{template.description}</p>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              ) : null
            )}
          </div>
        </div>
      ) : (
        /* Editor — Two-Column Layout */
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Demo Banner (compact) */}
          {isDemo && (
            <div className="mx-8 mt-6 bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 rounded-xl p-3 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="material-symbols-outlined text-amber-600" style={{ fontSize: '20px' }}>
                  auto_awesome
                </span>
                <p className="text-sm font-medium text-amber-800">
                  Demo Mode — using sample documents.{' '}
                  <Link to="/upload" className="text-primary font-bold hover:underline">
                    Upload real docs
                  </Link>
                </p>
              </div>
            </div>
          )}

          {error && (
            <div className="mx-8 mt-4 bg-red-50 border border-red-200 text-red-700 px-5 py-3 rounded-xl flex items-start gap-3">
              <span className="material-symbols-outlined flex-shrink-0 mt-0.5" style={{ fontSize: '20px' }}>
                error
              </span>
              <span className="text-sm">{error}</span>
              <button onClick={() => setError(null)} className="ml-auto text-red-400 hover:text-red-600 cursor-pointer">
                <span className="material-symbols-outlined text-lg">close</span>
              </button>
            </div>
          )}

          <div className="flex-1 grid grid-cols-1 lg:grid-cols-2 p-8 gap-8 overflow-hidden">
            {/* Left Column: Controls */}
            <section className="overflow-y-auto pr-2 space-y-6">
              <div className="bg-white p-6 rounded-xl border border-neutral-200/60">
                {/* Template Header */}
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-secondary/10 text-secondary flex items-center justify-center">
                      <span className="material-symbols-outlined">description</span>
                    </div>
                    <div>
                      <h3 className="font-headline font-bold text-on-surface">{selectedTemplate?.name}</h3>
                      <p className="text-xs text-neutral-500">{selectedTemplate?.description}</p>
                    </div>
                  </div>
                  <button
                    onClick={() => setShowTemplates(true)}
                    className="text-sm font-semibold text-primary hover:text-primary-container transition-colors cursor-pointer"
                  >
                    Change
                  </button>
                </div>

                <div className="space-y-4">
                  {/* Document Title */}
                  <div className="space-y-1.5">
                    <label className="text-[11px] font-bold text-neutral-400 uppercase tracking-wider ml-1">
                      Document Title
                    </label>
                    <input
                      type="text"
                      value={documentTitle}
                      onChange={(e) => setDocumentTitle(e.target.value)}
                      placeholder="e.g., Enterprise Service Agreement 2024"
                      className="w-full px-4 py-3 bg-neutral-100 border-none rounded-lg focus:ring-2 focus:ring-secondary transition-all font-medium text-on-surface placeholder:text-neutral-400"
                    />
                  </div>

                  {/* Reference Documents */}
                  <div className="space-y-1.5 relative" ref={docSelectorRef}>
                    <label className="text-[11px] font-bold text-neutral-400 uppercase tracking-wider ml-1">
                      Reference Documents
                    </label>
                    <div
                      className="w-full px-4 py-3 bg-neutral-100 rounded-lg flex items-center justify-between cursor-pointer group"
                      onClick={() => setShowDocSelector(!showDocSelector)}
                    >
                      <div className="flex flex-wrap gap-2 min-h-[24px]">
                        {selectedDocIds.length > 0 ? (
                          selectedDocIds.map((docId) => (
                            <span
                              key={docId}
                              className="px-2 py-1 bg-white rounded border border-neutral-200 text-xs flex items-center gap-1 font-medium"
                            >
                              {getDocFileName(docId)}
                              <span
                                className="material-symbols-outlined text-[14px] text-neutral-400 hover:text-error cursor-pointer"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  removeDocument(docId);
                                }}
                              >
                                close
                              </span>
                            </span>
                          ))
                        ) : (
                          <span className="text-sm text-neutral-400">Select reference documents...</span>
                        )}
                      </div>
                      <span className="material-symbols-outlined text-neutral-400 group-hover:text-primary transition-colors flex-shrink-0 ml-2">
                        add_circle
                      </span>
                    </div>

                    {showDocSelector && (
                      <div className="absolute z-20 left-0 right-0 mt-1 bg-white rounded-xl shadow-xl border border-neutral-200/60 max-h-60 overflow-y-auto p-3">
                        {isLoadingDocs ? (
                          <DocumentListSkeleton count={3} compact />
                        ) : (
                          <DocumentList
                            documents={documents}
                            selectable
                            selectedIds={selectedDocIds}
                            onSelectionChange={setSelectedDocIds}
                            compact
                          />
                        )}
                      </div>
                    )}
                  </div>

                  {/* Instructions */}
                  <div className="space-y-1.5">
                    <label className="text-[11px] font-bold text-neutral-400 uppercase tracking-wider ml-1">
                      Generation Instructions
                    </label>
                    <textarea
                      value={instruction}
                      onChange={(e) => setInstruction(e.target.value)}
                      placeholder="e.g. Summarize the legal clauses and focus on the liability section..."
                      rows={4}
                      className="w-full px-4 py-3 bg-neutral-100 border-none rounded-lg focus:ring-2 focus:ring-secondary transition-all font-body text-sm resize-none placeholder:text-neutral-400"
                    />
                  </div>

                  {/* Sections & Style */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-[11px] font-bold text-neutral-400 uppercase tracking-wider ml-1">
                        Include Sections
                      </label>
                      <div className="flex flex-wrap gap-2 p-1 max-h-40 overflow-y-auto">
                        {selectedTemplate?.sections.map((section) => (
                          <label
                            key={section}
                            className="flex items-center gap-2 px-3 py-1.5 bg-neutral-50 rounded-lg cursor-pointer hover:bg-neutral-100 transition-colors"
                          >
                            <input
                              type="checkbox"
                              checked={enabledSections.includes(section)}
                              onChange={() => toggleSection(section)}
                              className="rounded border-neutral-300 text-primary focus:ring-primary"
                            />
                            <span className="text-xs font-medium">{section}</span>
                          </label>
                        ))}
                      </div>
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-[11px] font-bold text-neutral-400 uppercase tracking-wider ml-1">
                        Tone & Style
                      </label>
                      <select
                        value={styleGuidance}
                        onChange={(e) => setStyleGuidance(e.target.value)}
                        className="w-full px-3 py-2 bg-neutral-100 border-none rounded-lg text-sm font-medium focus:ring-2 focus:ring-secondary"
                      >
                        {styleOptions.map((opt) => (
                          <option key={opt} value={opt}>
                            {opt}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {/* Generate Button */}
                  <button
                    onClick={handleGenerate}
                    disabled={isGenerating || !instruction.trim() || selectedDocIds.length === 0}
                    className="w-full mt-4 py-4 bg-gradient-to-r from-primary to-primary-container text-white rounded-xl font-bold shadow-lg shadow-violet-500/20 flex items-center justify-center gap-2 hover:scale-[1.01] active:scale-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 cursor-pointer"
                  >
                    {isGenerating ? (
                      <>
                        <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                          <path
                            className="opacity-75"
                            fill="currentColor"
                            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                          />
                        </svg>
                        Generating Draft...
                      </>
                    ) : (
                      <>
                        <span className="material-symbols-outlined">magic_button</span>
                        Generate Draft
                      </>
                    )}
                  </button>
                </div>
              </div>
            </section>

            {/* Right Column: Preview */}
            <section className="flex flex-col h-full space-y-4 min-h-0">
              {/* Tabs & Actions */}
              <div className="flex items-center justify-between flex-shrink-0">
                <div className="flex bg-neutral-100 p-1 rounded-lg">
                  {(['preview', 'edit', 'raw'] as const).map((tab) => (
                    <button
                      key={tab}
                      onClick={() => setActiveTab(tab)}
                      className={`px-5 py-1.5 rounded-md text-sm transition-all cursor-pointer ${
                        activeTab === tab
                          ? 'bg-white shadow-sm text-primary font-bold'
                          : 'text-neutral-500 hover:text-neutral-600 font-medium'
                      }`}
                    >
                      {tab === 'preview' ? 'Preview' : tab === 'edit' ? 'Edit' : 'Markdown'}
                    </button>
                  ))}
                </div>
                <div className="flex items-center gap-2">
                  {draft && (
                    <>
                      <button
                        onClick={handleCopy}
                        className="p-2 text-neutral-400 hover:text-primary transition-colors cursor-pointer"
                        title={copied ? 'Copied!' : 'Copy to clipboard'}
                      >
                        <span className="material-symbols-outlined">
                          {copied ? 'check' : 'content_copy'}
                        </span>
                      </button>
                      <div className="relative" ref={exportMenuRef}>
                        <button
                          onClick={() => setShowExportMenu(!showExportMenu)}
                          className="flex items-center gap-2 px-4 py-2 bg-white border border-neutral-200 rounded-lg text-sm font-semibold hover:border-primary transition-colors cursor-pointer"
                        >
                          Export
                          <span className="material-symbols-outlined text-[18px]">expand_more</span>
                        </button>

                        {showExportMenu && (
                          <div className="absolute right-0 mt-2 w-52 bg-white rounded-2xl shadow-lg border border-neutral-200/60 py-2 z-10">
                            <button
                              onClick={() => handleExport('pdf')}
                              className="w-full px-4 py-2.5 text-left text-sm text-on-surface hover:bg-neutral-50 flex items-center gap-3 cursor-pointer"
                            >
                              <span className="material-symbols-outlined text-red-500" style={{ fontSize: '20px' }}>
                                picture_as_pdf
                              </span>
                              Download as PDF
                            </button>
                            <button
                              onClick={() => handleExport('docx')}
                              className="w-full px-4 py-2.5 text-left text-sm text-on-surface hover:bg-neutral-50 flex items-center gap-3 cursor-pointer"
                            >
                              <span className="material-symbols-outlined text-primary" style={{ fontSize: '20px' }}>
                                description
                              </span>
                              Download as DOCX
                            </button>
                            <button
                              onClick={() => handleExport('md')}
                              className="w-full px-4 py-2.5 text-left text-sm text-on-surface hover:bg-neutral-50 flex items-center gap-3 cursor-pointer"
                            >
                              <span
                                className="material-symbols-outlined text-on-surface-variant"
                                style={{ fontSize: '20px' }}
                              >
                                code
                              </span>
                              Download as Markdown
                            </button>
                          </div>
                        )}
                      </div>
                    </>
                  )}
                </div>
              </div>

              {/* Content Area */}
              <div className="flex-1 bg-white rounded-2xl border border-neutral-200/60 overflow-hidden flex flex-col min-h-0">
                {/* Metadata Bar */}
                {selectedDocNames.length > 0 && (
                  <div className="px-6 py-3 bg-neutral-50 border-b border-neutral-100 flex items-center gap-4 flex-shrink-0">
                    <span className="text-[10px] font-black uppercase text-neutral-400 tracking-tighter flex-shrink-0">
                      References
                    </span>
                    <div className="flex gap-3 flex-wrap">
                      {selectedDocNames.map((name, i) => (
                        <span key={i} className="text-[11px] text-violet-600 font-medium flex items-center gap-1">
                          <span className="material-symbols-outlined text-[14px]">
                            {name.endsWith('.pdf') ? 'picture_as_pdf' : 'description'}
                          </span>
                          {name}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* AI Refine Toolbar */}
                {draft && !isGenerating && (
                  <div className="px-4 py-2.5 border-b border-neutral-100 bg-gradient-to-r from-violet-50/50 to-white flex-shrink-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="material-symbols-outlined text-sm text-violet-400">auto_awesome</span>
                      <span className="text-[11px] font-bold text-violet-500 uppercase tracking-wider mr-1">AI Refine</span>
                      {refineActions.map((action) => (
                        <button
                          key={action.label}
                          onClick={() => handleRefine(action.instruction)}
                          disabled={isRefining}
                          className="px-3 py-1 text-xs font-semibold text-neutral-600 bg-white border border-neutral-200 rounded-lg hover:border-violet-300 hover:text-violet-600 hover:bg-violet-50 transition-all cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-1"
                        >
                          <span className="material-symbols-outlined text-[14px]">{action.icon}</span>
                          {action.label}
                        </button>
                      ))}
                      <div className="flex-1 flex items-center gap-2 ml-2">
                        <input
                          type="text"
                          value={customRefinePrompt}
                          onChange={(e) => setCustomRefinePrompt(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter' && customRefinePrompt.trim()) {
                              handleRefine(customRefinePrompt.trim());
                            }
                          }}
                          placeholder="Custom instruction..."
                          disabled={isRefining}
                          className="flex-1 min-w-[140px] px-3 py-1 text-xs bg-white border border-neutral-200 rounded-lg focus:ring-1 focus:ring-violet-300 focus:border-violet-300 outline-none placeholder:text-neutral-300 disabled:opacity-40"
                        />
                        {customRefinePrompt.trim() && (
                          <button
                            onClick={() => handleRefine(customRefinePrompt.trim())}
                            disabled={isRefining}
                            className="p-1 text-violet-500 hover:text-violet-700 transition-colors cursor-pointer disabled:opacity-40"
                          >
                            <span className="material-symbols-outlined text-base">send</span>
                          </button>
                        )}
                      </div>
                      {isRefining && (
                        <span className="text-xs text-violet-500 font-medium flex items-center gap-1.5 ml-2">
                          <span className="w-1.5 h-1.5 bg-violet-400 rounded-full animate-pulse" />
                          Refining...
                        </span>
                      )}
                    </div>
                  </div>
                )}

                {/* Preview Content */}
                <div className="flex-1 overflow-y-auto relative">
                  {(isGenerating || isRefining) && !draft?.draft ? (
                    <>
                      {/* Skeleton — only shown before first token arrives */}
                      <div className="p-10 space-y-6">
                        <div className="space-y-4 animate-pulse">
                          <div className="h-8 bg-neutral-100 rounded-lg w-3/4" />
                          <div className="space-y-3">
                            <div className="h-4 bg-neutral-50 rounded w-full" />
                            <div className="h-4 bg-neutral-50 rounded w-full" />
                            <div className="h-4 bg-neutral-50 rounded w-5/6" />
                          </div>
                          <div className="pt-8 space-y-4">
                            <div className="h-6 bg-neutral-100 rounded w-1/4" />
                            <div className="grid grid-cols-3 gap-4">
                              <div className="h-20 bg-neutral-50 rounded-xl" />
                              <div className="h-20 bg-neutral-50 rounded-xl" />
                              <div className="h-20 bg-neutral-50 rounded-xl" />
                            </div>
                          </div>
                          <div className="space-y-3 pt-6">
                            <div className="h-4 bg-neutral-50 rounded w-full" />
                            <div className="h-4 bg-neutral-50 rounded w-4/5" />
                          </div>
                        </div>
                      </div>

                      {/* Glass overlay status */}
                      <div className="glass-panel absolute inset-x-0 bottom-0 p-6 border-t border-white/40 flex items-center justify-center pointer-events-none">
                        <div className="flex items-center gap-3 bg-white px-6 py-3 rounded-full shadow-2xl shadow-violet-200/50 border border-violet-100">
                          <div className="relative w-4 h-4">
                            <div className="absolute inset-0 bg-secondary rounded-full blur-[4px] opacity-40" />
                            <div className="relative w-4 h-4 bg-secondary rounded-full flex items-center justify-center">
                              <div className="w-1.5 h-1.5 bg-white rounded-full" />
                            </div>
                          </div>
                          <span className="text-xs font-bold text-neutral-500">AI is curating your draft...</span>
                        </div>
                      </div>
                    </>
                  ) : draft ? (
                    activeTab === 'preview' ? (
                      <div className="p-10">
                        <StreamingMarkdown text={draft.draft} variant="draft" isStreaming={isGenerating || isRefining} />
                      </div>
                    ) : activeTab === 'edit' ? (
                      <div className="flex flex-col h-full">
                        <div className="flex items-center gap-2 px-6 py-2 border-b border-neutral-100 bg-neutral-50/50 flex-shrink-0">
                          <span className="material-symbols-outlined text-sm text-neutral-400">edit_note</span>
                          <span className="text-xs font-bold text-neutral-400 uppercase tracking-wider">Editing Draft</span>
                          <span className="text-xs text-neutral-300 ml-auto">{draft.draft.length} chars</span>
                        </div>
                        <textarea
                          value={draft.draft}
                          onChange={(e) => setDraft({ ...draft, draft: e.target.value })}
                          className="flex-1 w-full p-6 text-sm text-on-surface font-mono leading-relaxed bg-white resize-none outline-none placeholder:text-neutral-300"
                          placeholder="Start writing your draft..."
                          spellCheck={false}
                        />
                      </div>
                    ) : (
                      <div className="p-6">
                        <pre className="bg-neutral-50 p-6 rounded-2xl overflow-x-auto text-sm text-on-surface font-mono whitespace-pre-wrap border border-neutral-200/60">
                          {draft.draft}
                        </pre>
                      </div>
                    )
                  ) : (
                    /* Empty state — static skeleton placeholder */
                    <div className="p-10 space-y-6">
                      <div className="space-y-4">
                        <div className="h-8 bg-neutral-100 rounded-lg w-3/4" />
                        <div className="space-y-3">
                          <div className="h-4 bg-neutral-50 rounded w-full" />
                          <div className="h-4 bg-neutral-50 rounded w-full" />
                          <div className="h-4 bg-neutral-50 rounded w-5/6" />
                        </div>
                        <div className="pt-8 space-y-4">
                          <div className="h-6 bg-neutral-100 rounded w-1/4" />
                          <div className="grid grid-cols-3 gap-4">
                            <div className="h-20 bg-neutral-50 rounded-xl" />
                            <div className="h-20 bg-neutral-50 rounded-xl" />
                            <div className="h-20 bg-neutral-50 rounded-xl" />
                          </div>
                        </div>
                        <div className="space-y-3 pt-6">
                          <div className="h-4 bg-neutral-50 rounded w-full" />
                          <div className="h-4 bg-neutral-50 rounded w-4/5" />
                        </div>
                      </div>
                      <div className="flex flex-col items-center justify-center pt-8">
                        <p className="text-sm font-medium text-neutral-400">Your generated draft will appear here</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </section>
          </div>
        </div>
      )}
    </div>
  );
}
