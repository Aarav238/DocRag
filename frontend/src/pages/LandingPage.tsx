import { Link, useNavigate } from 'react-router-dom';

const features = [
  {
    icon: '📤',
    title: 'Smart Document Upload',
    description: 'Upload PDF and DOCX files up to 50MB. Our AI automatically extracts, chunks, and indexes content for intelligent retrieval.',
    link: '/upload',
    color: 'bg-blue-500',
  },
  {
    icon: '🔍',
    title: 'Semantic Search',
    description: 'Find information using natural language. Our AI understands context and meaning, delivering results even without exact keyword matches.',
    link: '/search',
    color: 'bg-purple-500',
  },
  {
    icon: '💬',
    title: 'Document Q&A',
    description: 'Ask questions and get accurate, cited answers. Every response is grounded in your documents with traceable sources.',
    link: '/chat',
    color: 'bg-green-500',
  },
  {
    icon: '📝',
    title: 'AI Document Generator',
    description: 'Generate professional proposals, contracts, and reports from templates. Export to PDF, DOCX, or Markdown instantly.',
    link: '/draft',
    color: 'bg-orange-500',
  },
];

const templates = [
  { name: 'Business Proposal', icon: '💼' },
  { name: 'Investment Pitch', icon: '📈' },
  { name: 'Service Contract', icon: '📝' },
  { name: 'Status Report', icon: '📊' },
  { name: 'NDA', icon: '🔒' },
  { name: 'Research Report', icon: '🔬' },
];

const steps = [
  {
    step: '01',
    title: 'Upload Reference Documents',
    description: 'Drag and drop your existing proposals, contracts, or reports. We analyze your writing style and content patterns.',
  },
  {
    step: '02',
    title: 'Choose a Template',
    description: 'Select from professional templates or start custom. Our AI understands document structure and best practices.',
  },
  {
    step: '03',
    title: 'Generate & Export',
    description: 'Get a polished draft in seconds. Export to PDF, DOCX, or Markdown. Edit and iterate as needed.',
  },
];

const useCases = [
  {
    title: 'Sales Teams',
    description: 'Generate personalized proposals in minutes, not hours. Win more deals faster.',
    icon: '🎯',
  },
  {
    title: 'Legal Teams',
    description: 'Draft contracts and NDAs using your approved templates and language.',
    icon: '⚖️',
  },
  {
    title: 'Consultants',
    description: 'Create professional deliverables based on your past successful projects.',
    icon: '💼',
  },
  {
    title: 'Startups',
    description: 'Build investor decks and business plans using proven structures.',
    icon: '🚀',
  },
];

const stats = [
  { value: '10x', label: 'Faster Drafts' },
  { value: '8+', label: 'Templates' },
  { value: '100%', label: 'Source Citations' },
  { value: '3', label: 'Export Formats' },
];

export function LandingPage() {
  const navigate = useNavigate();

  const handleTryDemo = () => {
    // Navigate to draft page with demo mode enabled
    navigate('/draft?demo=true');
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 bg-white/80 backdrop-blur-md border-b border-gray-100 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
                <span className="text-white text-sm font-bold">D</span>
              </div>
              <span className="text-xl font-bold text-gray-900">DocRAG</span>
            </div>
            <div className="hidden md:flex items-center gap-8">
              <a href="#features" className="text-gray-600 hover:text-gray-900 cursor-pointer">Features</a>
              <a href="#how-it-works" className="text-gray-600 hover:text-gray-900 cursor-pointer">How it Works</a>
              <a href="#templates" className="text-gray-600 hover:text-gray-900 cursor-pointer">Templates</a>
              <Link to="/guide" className="text-gray-600 hover:text-gray-900 cursor-pointer">Guide</Link>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={handleTryDemo}
                className="px-4 py-2 text-gray-700 font-medium hover:text-gray-900 cursor-pointer"
              >
                Try Demo
              </button>
              <Link
                to="/upload"
                className="px-4 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors cursor-pointer"
              >
                Get Started
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative overflow-hidden pt-24">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-50 via-white to-purple-50" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-24">
          <div className="text-center">
            <div className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-blue-100 to-purple-100 text-blue-700 rounded-full text-sm font-medium mb-8">
              <span className="mr-2">🚀</span>
              AI-Powered Document Intelligence
            </div>
            <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold text-gray-900 tracking-tight mb-6">
              Generate Professional
              <br />
              <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                Documents in Seconds
              </span>
            </h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-10 leading-relaxed">
              Upload your reference materials, select a template, and let AI create
              polished proposals, contracts, and reports — all grounded in your actual content
              with traceable citations.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                to="/upload"
                className="inline-flex items-center justify-center px-8 py-4 bg-blue-600 text-white font-semibold rounded-xl hover:bg-blue-700 transition-all shadow-lg hover:shadow-xl hover:-translate-y-0.5 cursor-pointer"
              >
                Start Building
                <svg className="ml-2 w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </Link>
              <button
                onClick={handleTryDemo}
                className="inline-flex items-center justify-center px-8 py-4 bg-white text-gray-700 font-semibold rounded-xl border border-gray-200 hover:border-gray-300 hover:bg-gray-50 transition-all cursor-pointer"
              >
                <span className="mr-2">✨</span>
                Try Demo Mode
              </button>
            </div>

            {/* Stats */}
            <div className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-8 max-w-3xl mx-auto">
              {stats.map((stat) => (
                <div key={stat.label} className="text-center">
                  <div className="text-3xl font-bold text-gray-900">{stat.value}</div>
                  <div className="text-sm text-gray-500">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Hero Visual */}
          <div className="mt-16 relative">
            <div className="absolute inset-0 bg-gradient-to-t from-gray-50 to-transparent z-10 pointer-events-none" />
            <div className="bg-white rounded-2xl shadow-2xl border border-gray-200 overflow-hidden mx-auto max-w-5xl">
              <div className="bg-gray-100 px-4 py-3 flex items-center gap-2 border-b border-gray-200">
                <div className="w-3 h-3 rounded-full bg-red-400" />
                <div className="w-3 h-3 rounded-full bg-yellow-400" />
                <div className="w-3 h-3 rounded-full bg-green-400" />
                <span className="ml-4 text-sm text-gray-500">DocRAG - AI Document Generator</span>
              </div>
              <div className="p-8 bg-gradient-to-br from-gray-50 to-white">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                    <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center text-xl mb-4">📄</div>
                    <h4 className="font-semibold text-gray-900 mb-2">Upload References</h4>
                    <p className="text-sm text-gray-500">Past proposals, contracts, reports</p>
                  </div>
                  <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                    <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center text-xl mb-4">🎨</div>
                    <h4 className="font-semibold text-gray-900 mb-2">Choose Template</h4>
                    <p className="text-sm text-gray-500">8+ professional templates</p>
                  </div>
                  <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                    <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center text-xl mb-4">📥</div>
                    <h4 className="font-semibold text-gray-900 mb-2">Export Anywhere</h4>
                    <p className="text-sm text-gray-500">PDF, DOCX, or Markdown</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Templates Section */}
      <section id="templates" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
              Professional Templates
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Start with proven structures for any business document
            </p>
          </div>
          <div className="flex flex-wrap justify-center gap-4">
            {templates.map((template) => (
              <Link
                key={template.name}
                to="/draft"
                className="inline-flex items-center gap-2 px-6 py-3 bg-gray-50 rounded-full text-gray-700 font-medium hover:bg-gray-100 hover:shadow-md transition-all cursor-pointer"
              >
                <span>{template.icon}</span>
                {template.name}
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-24 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
              Complete Document Intelligence
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              From search to generation, everything you need to work smarter with documents
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {features.map((feature) => (
              <Link
                key={feature.title}
                to={feature.link}
                className="group relative bg-white p-8 rounded-2xl border border-gray-200 hover:border-gray-300 hover:shadow-lg transition-all cursor-pointer"
              >
                <div className={`inline-flex items-center justify-center w-14 h-14 ${feature.color} rounded-xl text-2xl mb-6 shadow-lg`}>
                  {feature.icon}
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3 group-hover:text-blue-600 transition-colors">
                  {feature.title}
                </h3>
                <p className="text-gray-600 leading-relaxed">
                  {feature.description}
                </p>
                <div className="mt-4 inline-flex items-center text-blue-600 font-medium">
                  Try it now
                  <svg className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section id="how-it-works" className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
              Three Steps to Professional Documents
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              From upload to export in under a minute
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {steps.map((item, index) => (
              <div key={item.step} className="relative">
                {index < steps.length - 1 && (
                  <div className="hidden md:block absolute top-12 left-full w-full h-0.5 bg-gradient-to-r from-blue-200 to-transparent -translate-x-1/2" />
                )}
                <div className="bg-gradient-to-br from-gray-50 to-white p-8 rounded-2xl border border-gray-200 hover:shadow-md transition-shadow">
                  <div className="text-5xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-4">{item.step}</div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-3">{item.title}</h3>
                  <p className="text-gray-600">{item.description}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-12 text-center">
            <Link
              to="/guide"
              className="inline-flex items-center gap-2 text-blue-600 font-medium hover:text-blue-700 cursor-pointer"
            >
              Read the full guide
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </Link>
          </div>
        </div>
      </section>

      {/* Use Cases Section */}
      <section className="py-24 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
              Built for Teams That Move Fast
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Stop spending hours on document formatting — focus on what matters
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {useCases.map((useCase) => (
              <div
                key={useCase.title}
                className="text-center p-8 rounded-2xl bg-white border border-gray-200 hover:shadow-md transition-all"
              >
                <div className="text-4xl mb-4">{useCase.icon}</div>
                <h3 className="font-semibold text-gray-900 mb-2">{useCase.title}</h3>
                <p className="text-sm text-gray-600">{useCase.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Technical Section */}
      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-6">
                Powered by RAG Technology
              </h2>
              <p className="text-lg text-gray-600 mb-8">
                Unlike generic AI tools, DocRAG uses Retrieval-Augmented Generation to ground
                every response in your actual documents. No hallucinations — just accurate,
                cited content you can trust.
              </p>
              <ul className="space-y-4">
                {[
                  'Semantic search understands meaning, not just keywords',
                  'Every answer includes traceable source citations',
                  'Your documents stay private and secure',
                  'Export to PDF, DOCX, or Markdown instantly',
                  'Professional templates for every use case',
                  'Context-aware generation matches your style',
                ].map((item) => (
                  <li key={item} className="flex items-start">
                    <svg className="w-6 h-6 text-green-500 mr-3 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <span className="text-gray-700">{item}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div className="bg-gray-900 rounded-2xl p-8 text-white font-mono text-sm overflow-hidden">
              <div className="flex items-center gap-2 mb-6 text-gray-400">
                <span className="w-3 h-3 rounded-full bg-red-500" />
                <span className="w-3 h-3 rounded-full bg-yellow-500" />
                <span className="w-3 h-3 rounded-full bg-green-500" />
                <span className="ml-2">RAG Pipeline</span>
              </div>
              <div className="space-y-3">
                <div><span className="text-blue-400">1.</span> <span className="text-gray-300">Document Upload</span></div>
                <div className="pl-4 text-gray-500">→ Parse PDF/DOCX content</div>
                <div><span className="text-blue-400">2.</span> <span className="text-gray-300">Smart Chunking</span></div>
                <div className="pl-4 text-gray-500">→ Preserve semantic context</div>
                <div><span className="text-blue-400">3.</span> <span className="text-gray-300">Vector Embedding</span></div>
                <div className="pl-4 text-gray-500">→ OpenAI text-embedding-3-small</div>
                <div><span className="text-blue-400">4.</span> <span className="text-gray-300">Vector Index</span></div>
                <div className="pl-4 text-gray-500">→ Pinecone for fast retrieval</div>
                <div><span className="text-blue-400">5.</span> <span className="text-gray-300">RAG Generation</span></div>
                <div className="pl-4 text-gray-500">→ GPT-4 + retrieved context</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 bg-gradient-to-r from-blue-600 to-purple-600">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl sm:text-4xl font-bold text-white mb-6">
            Ready to Transform Your Document Workflow?
          </h2>
          <p className="text-xl text-blue-100 mb-10">
            Join teams who create professional documents 10x faster with AI-powered generation.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/upload"
              className="inline-flex items-center justify-center px-10 py-5 bg-white text-blue-600 font-semibold rounded-xl hover:bg-gray-100 transition-all shadow-lg text-lg cursor-pointer"
            >
              Get Started Free
              <svg className="ml-3 w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </Link>
            <button
              onClick={handleTryDemo}
              className="inline-flex items-center justify-center px-10 py-5 bg-transparent text-white font-semibold rounded-xl border-2 border-white/30 hover:bg-white/10 transition-all text-lg cursor-pointer"
            >
              <span className="mr-2">✨</span>
              Try Demo First
            </button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-400 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center mb-4 md:mb-0">
              <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-purple-600 rounded-lg flex items-center justify-center mr-3">
                <span className="text-white text-sm font-bold">D</span>
              </div>
              <span className="text-2xl font-bold text-white">DocRAG</span>
              <span className="ml-4 text-sm">AI Document Intelligence</span>
            </div>
            <div className="flex items-center gap-8">
              <Link to="/upload" className="hover:text-white transition-colors cursor-pointer">Upload</Link>
              <Link to="/search" className="hover:text-white transition-colors cursor-pointer">Search</Link>
              <Link to="/chat" className="hover:text-white transition-colors cursor-pointer">Chat</Link>
              <Link to="/draft" className="hover:text-white transition-colors cursor-pointer">Draft</Link>
              <Link to="/guide" className="hover:text-white transition-colors cursor-pointer">Guide</Link>
            </div>
          </div>
          <div className="mt-8 pt-8 border-t border-gray-800 text-center text-sm">
            <p>Built with RAG technology — Your documents, intelligently analyzed</p>
            <p className="mt-2 text-gray-500">&copy; {new Date().getFullYear()} DocRAG. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
