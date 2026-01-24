import { useState, useEffect } from 'react';
import { useSearchParams, Link, useNavigate } from 'react-router-dom';
import ReactMarkdown from 'react-markdown';
import { api } from '../api/client';
import { DocumentList } from '../components/DocumentList';
import { templates, type DocumentTemplate } from '../lib/templates';
import { exportToPdf, exportToDocx, exportToMarkdown } from '../lib/exportUtils';
import { demoDocuments } from '../lib/demoData';
import type { Document, DraftResponse } from '../api/types';

// Demo documents as mock Document objects
const mockDemoDocuments: Document[] = demoDocuments.map((doc, index) => ({
  doc_id: `demo-${index + 1}`,
  file_name: doc.name,
  file_type: 'application/pdf',
  status: 'indexed' as const,
  created_at: new Date().toISOString(),
}));

export function DraftPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const isDemo = searchParams.get('demo') === 'true';

  const toggleDemoMode = () => {
    if (isDemo) {
      navigate('/draft');
    } else {
      navigate('/draft?demo=true');
    }
  };

  const [documents, setDocuments] = useState<Document[]>([]);
  const [selectedDocIds, setSelectedDocIds] = useState<string[]>([]);
  const [selectedTemplate, setSelectedTemplate] = useState<DocumentTemplate | null>(null);
  const [instruction, setInstruction] = useState('');
  const [sections, setSections] = useState('');
  const [styleGuidance, setStyleGuidance] = useState('');
  const [documentTitle, setDocumentTitle] = useState('');
  const [draft, setDraft] = useState<DraftResponse | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [activeTab, setActiveTab] = useState<'preview' | 'raw'>('preview');
  const [showTemplates, setShowTemplates] = useState(true);
  const [showExportMenu, setShowExportMenu] = useState(false);

  useEffect(() => {
    if (isDemo) {
      // Load demo documents
      setDocuments(mockDemoDocuments);
      // Auto-select all demo documents
      setSelectedDocIds(mockDemoDocuments.map((d) => d.doc_id));
    } else {
      api.listDocuments('indexed').then(({ documents }) => setDocuments(documents));
    }
  }, [isDemo]);

  const handleSelectTemplate = (template: DocumentTemplate) => {
    setSelectedTemplate(template);
    setSections(template.sections.join('\n'));
    setInstruction(template.defaultInstruction);
    setStyleGuidance(template.styleGuidance);
    setShowTemplates(false);
  };

  const handleGenerate = async () => {
    if (!instruction.trim() || selectedDocIds.length === 0) return;

    setIsGenerating(true);
    setError(null);
    setDraft(null);

    try {
      const sectionList = sections
        .split('\n')
        .map((s) => s.trim())
        .filter(Boolean);

      if (isDemo) {
        // Simulate generation delay for demo
        await new Promise((resolve) => setTimeout(resolve, 2000));

        // Generate a demo draft based on template
        const templateId = selectedTemplate?.id || 'business-proposal';
        const demoContent = generateDemoDraft(templateId, documentTitle);

        setDraft({
          instruction: instruction,
          draft: demoContent,
          sections: sectionList.map((s) => ({ title: s, content: '' })),
          reference_docs: mockDemoDocuments.map((d) => d.file_name),
        });
      } else {
        const response = await api.generateDraft(
          instruction,
          selectedDocIds,
          sectionList.length > 0 ? sectionList : undefined,
          styleGuidance.trim() || undefined
        );
        setDraft(response);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to generate draft');
    } finally {
      setIsGenerating(false);
    }
  };

  // Generate demo draft content
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

    // Default business proposal
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
    } catch (err) {
      setError(`Failed to export as ${format.toUpperCase()}`);
    }
    setShowExportMenu(false);
  };

  const groupedTemplates = {
    proposal: templates.filter((t) => t.category === 'proposal'),
    contract: templates.filter((t) => t.category === 'contract'),
    report: templates.filter((t) => t.category === 'report'),
    general: templates.filter((t) => t.category === 'general'),
  };

  return (
    <div className="space-y-6">
      {/* Demo Mode Banner */}
      {isDemo && (
        <div className="bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 rounded-xl p-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-amber-100 rounded-lg flex items-center justify-center">
              <span className="text-xl">✨</span>
            </div>
            <div>
              <p className="font-semibold text-amber-900">Demo Mode Active</p>
              <p className="text-sm text-amber-700">
                Using sample documents to showcase the draft generation feature
              </p>
            </div>
          </div>
          <Link
            to="/upload"
            className="px-4 py-2 bg-amber-600 text-white text-sm font-medium rounded-lg hover:bg-amber-700 transition-colors cursor-pointer"
          >
            Upload Real Documents
          </Link>
        </div>
      )}

      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">AI Draft Generator</h1>
          <p className="text-gray-600">
            {isDemo
              ? 'Try generating documents with our sample reference materials'
              : 'Generate professional documents based on your reference materials'}
          </p>
        </div>
        <div className="flex items-center gap-3">
          {/* Demo Mode Toggle */}
          <button
            onClick={toggleDemoMode}
            className={`inline-flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg transition-colors cursor-pointer ${
              isDemo
                ? 'bg-amber-100 text-amber-700 hover:bg-amber-200'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            <span>{isDemo ? '✨' : '🎮'}</span>
            {isDemo ? 'Exit Demo' : 'Try Demo'}
          </button>
          {draft && (
            <>
            <button
              onClick={handleCopy}
              className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors cursor-pointer"
            >
              {copied ? (
                <>
                  <svg className="w-4 h-4 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  Copied!
                </>
              ) : (
                <>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                  </svg>
                  Copy
                </>
              )}
            </button>

            {/* Export Dropdown */}
            <div className="relative">
              <button
                onClick={() => setShowExportMenu(!showExportMenu)}
                className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors cursor-pointer"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                </svg>
                Export
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>

              {showExportMenu && (
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-lg border border-gray-200 py-2 z-10">
                  <button
                    onClick={() => handleExport('pdf')}
                    className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-3 cursor-pointer"
                  >
                    <span className="text-red-500">
                      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4z" clipRule="evenodd" />
                      </svg>
                    </span>
                    Download as PDF
                  </button>
                  <button
                    onClick={() => handleExport('docx')}
                    className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-3 cursor-pointer"
                  >
                    <span className="text-blue-500">
                      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4z" clipRule="evenodd" />
                      </svg>
                    </span>
                    Download as DOCX
                  </button>
                  <button
                    onClick={() => handleExport('md')}
                    className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-3 cursor-pointer"
                  >
                    <span className="text-gray-500">
                      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4z" clipRule="evenodd" />
                      </svg>
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

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl flex items-start gap-3">
          <svg className="w-5 h-5 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span>{error}</span>
        </div>
      )}

      {/* Template Selection */}
      {showTemplates && (
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Choose a Template</h2>

          {/* Proposals */}
          <div className="mb-6">
            <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wider mb-3">Proposals</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {groupedTemplates.proposal.map((template) => (
                <button
                  key={template.id}
                  onClick={() => handleSelectTemplate(template)}
                  className="flex items-start gap-3 p-4 rounded-xl border border-gray-200 hover:border-blue-300 hover:bg-blue-50/50 transition-all text-left cursor-pointer"
                >
                  <span className="text-2xl">{template.icon}</span>
                  <div>
                    <p className="font-medium text-gray-900">{template.name}</p>
                    <p className="text-sm text-gray-500">{template.description}</p>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Contracts */}
          <div className="mb-6">
            <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wider mb-3">Contracts</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {groupedTemplates.contract.map((template) => (
                <button
                  key={template.id}
                  onClick={() => handleSelectTemplate(template)}
                  className="flex items-start gap-3 p-4 rounded-xl border border-gray-200 hover:border-blue-300 hover:bg-blue-50/50 transition-all text-left cursor-pointer"
                >
                  <span className="text-2xl">{template.icon}</span>
                  <div>
                    <p className="font-medium text-gray-900">{template.name}</p>
                    <p className="text-sm text-gray-500">{template.description}</p>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Reports */}
          <div className="mb-6">
            <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wider mb-3">Reports</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {groupedTemplates.report.map((template) => (
                <button
                  key={template.id}
                  onClick={() => handleSelectTemplate(template)}
                  className="flex items-start gap-3 p-4 rounded-xl border border-gray-200 hover:border-blue-300 hover:bg-blue-50/50 transition-all text-left cursor-pointer"
                >
                  <span className="text-2xl">{template.icon}</span>
                  <div>
                    <p className="font-medium text-gray-900">{template.name}</p>
                    <p className="text-sm text-gray-500">{template.description}</p>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Custom */}
          <div>
            <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wider mb-3">Other</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {groupedTemplates.general.map((template) => (
                <button
                  key={template.id}
                  onClick={() => handleSelectTemplate(template)}
                  className="flex items-start gap-3 p-4 rounded-xl border border-gray-200 hover:border-blue-300 hover:bg-blue-50/50 transition-all text-left cursor-pointer"
                >
                  <span className="text-2xl">{template.icon}</span>
                  <div>
                    <p className="font-medium text-gray-900">{template.name}</p>
                    <p className="text-sm text-gray-500">{template.description}</p>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Main Content */}
      {!showTemplates && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Left Panel - Configuration */}
          <div className="space-y-6">
            {/* Selected Template */}
            {selectedTemplate && (
              <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border border-blue-100 p-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="text-2xl">{selectedTemplate.icon}</span>
                  <div>
                    <p className="font-medium text-gray-900">{selectedTemplate.name}</p>
                    <p className="text-sm text-gray-500">{selectedTemplate.description}</p>
                  </div>
                </div>
                <button
                  onClick={() => setShowTemplates(true)}
                  className="text-sm text-blue-600 hover:text-blue-700 font-medium cursor-pointer"
                >
                  Change
                </button>
              </div>
            )}

            {/* Document Title */}
            <div className="bg-white rounded-xl border border-gray-200 p-5">
              <label className="block text-sm font-semibold text-gray-900 mb-3">
                Document Title
              </label>
              <input
                type="text"
                value={documentTitle}
                onChange={(e) => setDocumentTitle(e.target.value)}
                placeholder="e.g., Q1 2025 Business Proposal"
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-gray-800 placeholder-gray-400"
              />
            </div>

            {/* Reference Documents */}
            <div className="bg-white rounded-xl border border-gray-200 p-5">
              <h3 className="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2">
                <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                Reference Documents
                {selectedDocIds.length > 0 && (
                  <span className="ml-auto text-xs font-medium text-blue-600 bg-blue-50 px-2 py-1 rounded-full">
                    {selectedDocIds.length} selected
                  </span>
                )}
              </h3>
              <div className="max-h-[200px] overflow-y-auto">
                <DocumentList
                  documents={documents}
                  selectable
                  selectedIds={selectedDocIds}
                  onSelectionChange={setSelectedDocIds}
                />
              </div>
            </div>

            {/* Instructions */}
            <div className="bg-white rounded-xl border border-gray-200 p-5">
              <label className="block text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2">
                <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
                Instructions
              </label>
              <textarea
                value={instruction}
                onChange={(e) => setInstruction(e.target.value)}
                placeholder="Describe what kind of document you want to create. Be specific about the topic, purpose, and target audience..."
                rows={4}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none resize-none text-gray-800 placeholder-gray-400"
              />
            </div>

            {/* Sections */}
            <div className="bg-white rounded-xl border border-gray-200 p-5">
              <label className="block text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2">
                <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
                </svg>
                Document Sections
                <span className="ml-auto text-xs text-gray-400 font-normal">One per line</span>
              </label>
              <textarea
                value={sections}
                onChange={(e) => setSections(e.target.value)}
                rows={4}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none resize-none font-mono text-sm text-gray-800"
              />
            </div>

            {/* Style Guidance */}
            <div className="bg-white rounded-xl border border-gray-200 p-5">
              <label className="block text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2">
                <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" />
                </svg>
                Style Guidance
                <span className="ml-auto text-xs text-gray-400 font-normal">Optional</span>
              </label>
              <textarea
                value={styleGuidance}
                onChange={(e) => setStyleGuidance(e.target.value)}
                placeholder="e.g., Professional and formal tone, use bullet points for lists, include executive summary..."
                rows={2}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none resize-none text-gray-800 placeholder-gray-400"
              />
            </div>

            {/* Generate Button */}
            <button
              onClick={handleGenerate}
              disabled={isGenerating || !instruction.trim() || selectedDocIds.length === 0}
              className="w-full py-4 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl hover:from-blue-700 hover:to-blue-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all font-semibold text-lg shadow-lg shadow-blue-600/25 flex items-center justify-center gap-3 cursor-pointer"
            >
              {isGenerating ? (
                <>
                  <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  Generating Draft...
                </>
              ) : (
                <>
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                  Generate Draft
                </>
              )}
            </button>
          </div>

          {/* Right Panel - Output */}
          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden flex flex-col h-[900px]">
            {/* Tabs */}
            <div className="flex items-center border-b border-gray-200 px-4">
              <button
                onClick={() => setActiveTab('preview')}
                className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors cursor-pointer ${
                  activeTab === 'preview'
                    ? 'border-blue-600 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                Preview
              </button>
              <button
                onClick={() => setActiveTab('raw')}
                className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors cursor-pointer ${
                  activeTab === 'raw'
                    ? 'border-blue-600 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                Markdown
              </button>
              {draft && (
                <div className="ml-auto flex items-center gap-2 text-xs text-gray-400">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  {draft.reference_docs.join(', ')}
                </div>
              )}
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto">
              {isGenerating ? (
                <div className="flex flex-col items-center justify-center h-full">
                  <div className="relative mb-6">
                    <div className="w-16 h-16 rounded-full bg-blue-100 flex items-center justify-center">
                      <svg className="w-8 h-8 text-blue-600 animate-pulse" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                    </div>
                    <div className="absolute inset-0 rounded-full border-4 border-blue-400 animate-ping opacity-25" />
                  </div>
                  <p className="text-gray-700 font-medium mb-2">Generating your {selectedTemplate?.name || 'document'}...</p>
                  <p className="text-sm text-gray-500">This may take a moment</p>
                  <div className="mt-6 flex items-center gap-2">
                    <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                    <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                    <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                  </div>
                </div>
              ) : draft ? (
                activeTab === 'preview' ? (
                  <div className="p-6 prose prose-sm max-w-none prose-headings:text-gray-900 prose-p:text-gray-700 prose-li:text-gray-700 prose-strong:text-gray-900">
                    <ReactMarkdown
                      components={{
                        h1: ({ children }) => (
                          <h1 className="text-2xl font-bold text-gray-900 mb-4 pb-2 border-b border-gray-200">
                            {children}
                          </h1>
                        ),
                        h2: ({ children }) => (
                          <h2 className="text-xl font-semibold text-gray-900 mt-8 mb-4 flex items-center gap-2">
                            <span className="w-1 h-6 bg-blue-600 rounded-full" />
                            {children}
                          </h2>
                        ),
                        h3: ({ children }) => (
                          <h3 className="text-lg font-semibold text-gray-800 mt-6 mb-3">{children}</h3>
                        ),
                        p: ({ children }) => (
                          <p className="text-gray-700 leading-relaxed mb-4">{children}</p>
                        ),
                        ul: ({ children }) => (
                          <ul className="list-disc list-inside space-y-2 mb-4 text-gray-700">{children}</ul>
                        ),
                        ol: ({ children }) => (
                          <ol className="list-decimal list-inside space-y-2 mb-4 text-gray-700">{children}</ol>
                        ),
                        li: ({ children }) => <li className="text-gray-700">{children}</li>,
                        blockquote: ({ children }) => (
                          <blockquote className="border-l-4 border-blue-500 pl-4 italic text-gray-600 my-4">
                            {children}
                          </blockquote>
                        ),
                        code: ({ children }) => (
                          <code className="bg-gray-100 px-1.5 py-0.5 rounded text-sm text-gray-800">
                            {children}
                          </code>
                        ),
                        pre: ({ children }) => (
                          <pre className="bg-gray-900 text-gray-100 p-4 rounded-lg overflow-x-auto my-4">
                            {children}
                          </pre>
                        ),
                      }}
                    >
                      {draft.draft}
                    </ReactMarkdown>
                  </div>
                ) : (
                  <div className="p-4">
                    <pre className="bg-gray-50 p-4 rounded-lg overflow-x-auto text-sm text-gray-800 font-mono whitespace-pre-wrap">
                      {draft.draft}
                    </pre>
                  </div>
                )
              ) : (
                <div className="flex flex-col items-center justify-center h-full text-gray-400">
                  <svg className="w-16 h-16 mb-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  <p className="font-medium text-gray-500">No draft generated yet</p>
                  <p className="text-sm text-gray-400 mt-1">Select documents and provide instructions to begin</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
