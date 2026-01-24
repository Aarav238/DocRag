import { Link } from 'react-router-dom';

const steps = [
  {
    number: '01',
    title: 'Upload Your Documents',
    description: 'Start by uploading your reference documents. We support PDF and DOCX files up to 50MB.',
    details: [
      'Drag and drop files or click to browse',
      'Upload proposals, contracts, reports, or any business documents',
      'Documents are processed automatically in the background',
      'Track processing status in real-time',
    ],
    icon: '📤',
    link: '/upload',
  },
  {
    number: '02',
    title: 'Wait for Processing',
    description: 'Our AI processes your documents through a sophisticated pipeline.',
    details: [
      'Text extraction from PDF/DOCX',
      'Smart chunking that preserves context',
      'Semantic embedding generation',
      'Vector indexing for fast retrieval',
    ],
    icon: '⚙️',
    link: '/upload',
  },
  {
    number: '03',
    title: 'Search Your Documents',
    description: 'Use natural language to find relevant information across all your documents.',
    details: [
      'Semantic search understands meaning, not just keywords',
      'Filter by specific documents',
      'See relevance scores for each result',
      'Jump to exact page references',
    ],
    icon: '🔍',
    link: '/search',
  },
  {
    number: '04',
    title: 'Ask Questions',
    description: 'Chat with your documents to get accurate answers with citations.',
    details: [
      'Ask complex questions in natural language',
      'Get answers based only on your documents',
      'Every answer includes source citations',
      'Confidence indicators help you verify accuracy',
    ],
    icon: '💬',
    link: '/chat',
  },
  {
    number: '05',
    title: 'Generate Drafts',
    description: 'Create professional documents using your reference materials.',
    details: [
      'Choose from templates: proposals, contracts, reports',
      'AI generates content based on your documents',
      'Customize sections and style',
      'Export as PDF, DOCX, or Markdown',
    ],
    icon: '📝',
    link: '/draft',
  },
];

const features = [
  {
    title: 'Semantic Search',
    description: 'Unlike keyword search, our semantic search understands the meaning and context of your queries. Ask "What are the payment terms?" and find relevant clauses even if they don\'t contain those exact words.',
    icon: '🧠',
  },
  {
    title: 'RAG Technology',
    description: 'Retrieval-Augmented Generation ensures our AI only uses information from your documents. No hallucinations, no made-up facts—just accurate responses grounded in your content.',
    icon: '🎯',
  },
  {
    title: 'Source Citations',
    description: 'Every answer and generated content includes references to the source documents and page numbers. Verify information instantly and build trust in AI-generated content.',
    icon: '📚',
  },
  {
    title: 'Professional Templates',
    description: 'Start with pre-built templates for business proposals, investment pitches, contracts, NDAs, and reports. Each template includes optimal sections and style guidance.',
    icon: '📋',
  },
  {
    title: 'Multiple Export Formats',
    description: 'Export your generated documents as PDF for sharing, DOCX for editing in Word, or Markdown for developers. Formatting is preserved across all formats.',
    icon: '📄',
  },
  {
    title: 'Context-Aware Generation',
    description: 'Our AI learns from your document style, tone, and structure. Generated content matches the professionalism of your reference materials.',
    icon: '✨',
  },
];

const tips = [
  {
    title: 'Quality Reference Documents',
    description: 'The better your reference documents, the better the output. Use well-formatted, professional documents as references.',
  },
  {
    title: 'Be Specific in Instructions',
    description: 'Instead of "write a proposal", try "write a software development proposal for a mobile app targeting healthcare providers".',
  },
  {
    title: 'Customize Sections',
    description: 'Adjust the default sections to match your needs. Remove irrelevant sections or add custom ones.',
  },
  {
    title: 'Use Style Guidance',
    description: 'Specify tone (formal, conversational), formatting preferences (bullet points, tables), and any specific requirements.',
  },
  {
    title: 'Iterate and Refine',
    description: 'Generate multiple drafts with different instructions. Combine the best parts or refine your instructions based on results.',
  },
  {
    title: 'Review and Edit',
    description: 'Always review generated content. AI provides a strong starting point, but human oversight ensures accuracy and appropriateness.',
  },
];

export function GuidePage() {
  return (
    <div className="max-w-4xl mx-auto">
      {/* Header */}
      <div className="text-center mb-16">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">Getting Started Guide</h1>
        <p className="text-xl text-gray-600">
          Learn how to use DocRAG to transform your document workflow
        </p>
      </div>

      {/* Quick Start Steps */}
      <section className="mb-20">
        <h2 className="text-2xl font-bold text-gray-900 mb-8">Quick Start</h2>
        <div className="space-y-6">
          {steps.map((step) => (
            <div
              key={step.number}
              className="bg-white rounded-2xl border border-gray-200 p-6 hover:shadow-lg transition-shadow"
            >
              <div className="flex items-start gap-6">
                <div className="flex-shrink-0">
                  <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-3xl">
                    {step.icon}
                  </div>
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <span className="text-sm font-bold text-blue-600">STEP {step.number}</span>
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">{step.title}</h3>
                  <p className="text-gray-600 mb-4">{step.description}</p>
                  <ul className="space-y-2 mb-4">
                    {step.details.map((detail, i) => (
                      <li key={i} className="flex items-start gap-2 text-sm text-gray-600">
                        <svg className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                        {detail}
                      </li>
                    ))}
                  </ul>
                  <Link
                    to={step.link}
                    className="inline-flex items-center gap-2 text-blue-600 font-medium hover:text-blue-700 cursor-pointer"
                  >
                    Try it now
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Features Deep Dive */}
      <section className="mb-20">
        <h2 className="text-2xl font-bold text-gray-900 mb-8">Features Explained</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {features.map((feature) => (
            <div
              key={feature.title}
              className="bg-gray-50 rounded-xl p-6"
            >
              <div className="text-3xl mb-4">{feature.icon}</div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">{feature.title}</h3>
              <p className="text-gray-600 text-sm">{feature.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Tips for Best Results */}
      <section className="mb-20">
        <h2 className="text-2xl font-bold text-gray-900 mb-8">Tips for Best Results</h2>
        <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl p-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {tips.map((tip, index) => (
              <div key={index} className="flex items-start gap-4">
                <div className="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center flex-shrink-0 text-sm font-bold">
                  {index + 1}
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900 mb-1">{tip.title}</h4>
                  <p className="text-sm text-gray-600">{tip.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works (Technical) */}
      <section className="mb-20">
        <h2 className="text-2xl font-bold text-gray-900 mb-8">How It Works</h2>
        <div className="bg-gray-900 rounded-2xl p-8 text-white">
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            {[
              { step: 'Upload', desc: 'PDF/DOCX files' },
              { step: 'Extract', desc: 'Text parsing' },
              { step: 'Chunk', desc: 'Semantic splitting' },
              { step: 'Embed', desc: 'Vector encoding' },
              { step: 'Index', desc: 'Vector database' },
            ].map((item, index) => (
              <div key={item.step} className="text-center">
                <div className="w-12 h-12 rounded-full bg-blue-600 flex items-center justify-center mx-auto mb-3 text-lg font-bold">
                  {index + 1}
                </div>
                <p className="font-semibold mb-1">{item.step}</p>
                <p className="text-sm text-gray-400">{item.desc}</p>
                {index < 4 && (
                  <div className="hidden md:block absolute right-0 top-1/2 transform -translate-y-1/2">
                    <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </div>
                )}
              </div>
            ))}
          </div>
          <div className="mt-8 pt-8 border-t border-gray-700">
            <h4 className="font-semibold mb-4">Query Pipeline</h4>
            <div className="flex flex-wrap items-center gap-3 text-sm">
              <span className="px-3 py-1 bg-blue-600 rounded-full">Your Question</span>
              <span className="text-gray-500">→</span>
              <span className="px-3 py-1 bg-gray-700 rounded-full">Embed Query</span>
              <span className="text-gray-500">→</span>
              <span className="px-3 py-1 bg-gray-700 rounded-full">Vector Search</span>
              <span className="text-gray-500">→</span>
              <span className="px-3 py-1 bg-gray-700 rounded-full">Retrieve Context</span>
              <span className="text-gray-500">→</span>
              <span className="px-3 py-1 bg-gray-700 rounded-full">LLM Generation</span>
              <span className="text-gray-500">→</span>
              <span className="px-3 py-1 bg-green-600 rounded-full">Answer + Sources</span>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="text-center">
        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl p-12 text-white">
          <h2 className="text-3xl font-bold mb-4">Ready to Get Started?</h2>
          <p className="text-blue-100 mb-8 max-w-2xl mx-auto">
            Upload your first document and experience the power of AI-driven document intelligence.
          </p>
          <Link
            to="/upload"
            className="inline-flex items-center gap-2 px-8 py-4 bg-white text-blue-600 font-semibold rounded-xl hover:bg-gray-100 transition-colors cursor-pointer"
          >
            Upload Your First Document
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
            </svg>
          </Link>
        </div>
      </section>
    </div>
  );
}
