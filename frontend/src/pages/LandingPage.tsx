import { Link, useNavigate } from 'react-router-dom';

const features = [
  {
    icon: 'upload_file',
    title: 'Upload',
    description:
      'Drag-and-drop PDFs and DOCX files up to 50 MB. Content is automatically parsed, chunked, and embedded for retrieval.',
    link: '/upload',
    iconBg: 'bg-indigo-50',
    iconColor: 'text-indigo-600',
  },
  {
    icon: 'search',
    title: 'Search',
    description:
      'Query your corpus with natural language. Semantic similarity finds relevant passages even without exact keyword matches.',
    link: '/search',
    iconBg: 'bg-cyan-50',
    iconColor: 'text-cyan-600',
  },
  {
    icon: 'chat',
    title: 'Chat',
    description:
      'Ask questions and receive cited answers grounded entirely in your uploaded documents. No hallucinations.',
    link: '/chat',
    iconBg: 'bg-emerald-50',
    iconColor: 'text-emerald-600',
  },
  {
    icon: 'edit_note',
    title: 'Draft',
    description:
      'Generate polished proposals, contracts, and reports from templates. Export to PDF, DOCX, or Markdown instantly.',
    link: '/draft',
    iconBg: 'bg-violet-50',
    iconColor: 'text-violet-600',
  },
];

const steps = [
  {
    num: '01',
    title: 'Upload & Ingest',
    description:
      'Drop your files into the pipeline. We extract text, detect structure, and split content into semantically coherent chunks.',
    iconBg: 'bg-indigo-100',
    numColor: 'text-indigo-700',
  },
  {
    num: '02',
    title: 'Vector Indexing',
    description:
      'Each chunk is embedded via a high-dimensional model and stored in a vector index for sub-millisecond nearest-neighbour search.',
    iconBg: 'bg-cyan-100',
    numColor: 'text-cyan-700',
  },
  {
    num: '03',
    title: 'Synthesized Analysis',
    description:
      'Queries retrieve the most relevant chunks, which are fed as context to a large language model that synthesizes a grounded answer.',
    iconBg: 'bg-emerald-100',
    numColor: 'text-emerald-700',
  },
];

const useCases = [
  { icon: 'gavel', title: 'Legal Teams', desc: 'Review contracts and surface key clauses across thousands of pages.', iconBg: 'bg-amber-50', iconColor: 'text-amber-600' },
  { icon: 'biotech', title: 'Researchers', desc: 'Synthesize findings from large paper corpora with full citations.', iconBg: 'bg-rose-50', iconColor: 'text-rose-600' },
  { icon: 'engineering', title: 'Engineering', desc: 'Search technical manuals and specs using plain-language queries.', iconBg: 'bg-sky-50', iconColor: 'text-sky-600' },
  { icon: 'trending_up', title: 'Consultants', desc: 'Generate client deliverables grounded in past successful projects.', iconBg: 'bg-violet-50', iconColor: 'text-violet-600' },
];

const ragAdvantages = [
  'Semantic retrieval understands meaning, not just keywords',
  'Every answer carries traceable source citations',
  'Documents remain private — never used for model training',
  'Sub-millisecond vector search at any corpus size',
  'Context-aware generation that matches your domain language',
];

export function LandingPage() {
  const navigate = useNavigate();

  const handleTryDemo = () => {
    navigate('/draft?demo=true');
  };

  return (
    <div className="min-h-screen bg-white text-on-surface">
      {/* ───────── Navbar ───────── */}
      <nav className="fixed top-0 inset-x-0 z-50 bg-white/80 backdrop-blur-xl border-b border-slate-200/60">
        <div className="mx-auto max-w-7xl px-6 lg:px-8 flex items-center justify-between h-16">
          <Link to="/" className="flex items-center gap-2.5">
            <div className="w-8 h-8 primary-gradient rounded-lg flex items-center justify-center shadow-sm">
              <span className="text-white text-sm font-bold">D</span>
            </div>
            <span className="font-headline text-xl font-bold text-slate-900">DocRAG</span>
          </Link>

          <div className="hidden md:flex items-center gap-8 text-sm font-medium text-slate-500">
            <a href="#features" className="hover:text-indigo-600 transition-colors">
              Features
            </a>
            <a href="#how-it-works" className="hover:text-indigo-600 transition-colors">
              How it Works
            </a>
            <a href="#use-cases" className="hover:text-indigo-600 transition-colors">
              Use Cases
            </a>
            <Link to="/guide" className="hover:text-indigo-600 transition-colors">
              Guide
            </Link>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={handleTryDemo}
              className="hidden sm:inline-flex px-4 py-2 text-sm font-medium text-slate-600 hover:text-indigo-600 transition-colors cursor-pointer"
            >
              Try Demo
            </button>
            <Link
              to="/upload"
              className="primary-gradient text-white text-sm font-semibold px-5 py-2.5 rounded-full shadow-md shadow-indigo-200/50 hover:opacity-90 transition-opacity"
            >
              Get Started
            </Link>
          </div>
        </div>
      </nav>

      {/* ───────── Hero ───────── */}
      <section className="relative pt-32 pb-20 lg:pt-40 lg:pb-28 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-[600px] h-[600px] rounded-full bg-indigo-100/50 blur-3xl pointer-events-none" />
        <div className="absolute -bottom-40 -left-40 w-[500px] h-[500px] rounded-full bg-cyan-100/40 blur-3xl pointer-events-none" />

        <div className="relative mx-auto max-w-7xl px-6 lg:px-8 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-indigo-50 text-indigo-600 text-xs font-semibold tracking-widest uppercase mb-8 border border-indigo-100">
            <span className="material-symbols-outlined text-base" style={{ fontVariationSettings: "'FILL' 1" }}>auto_awesome</span>
            Next-Gen AI Analysis
          </div>

          <h1 className="font-headline text-5xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight text-slate-900 leading-[1.08] mb-6">
            Semantic Document
            <br />
            <span className="bg-gradient-to-r from-indigo-600 to-cyan-600 bg-clip-text text-transparent">Intelligence</span>
          </h1>

          <p className="mx-auto max-w-2xl text-lg text-slate-500 leading-relaxed mb-10">
            Upload any corpus, ask complex questions, and receive accurate, cited
            answers in seconds — powered by retrieval-augmented generation and
            high-dimensional vector search.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-14">
            <Link
              to="/upload"
              className="primary-gradient text-white font-semibold px-8 py-4 rounded-2xl text-base shadow-lg shadow-indigo-300/40 hover:shadow-xl hover:shadow-indigo-300/50 transition-all flex items-center gap-2"
            >
              <span className="material-symbols-outlined text-xl">rocket_launch</span>
              Start Analyzing
            </Link>
            <button
              onClick={handleTryDemo}
              className="bg-white font-semibold px-8 py-4 rounded-2xl text-base text-slate-700 border border-slate-200 hover:border-indigo-200 hover:bg-indigo-50/50 transition-all flex items-center gap-2 cursor-pointer"
            >
              <span className="material-symbols-outlined text-xl text-indigo-500">play_circle</span>
              Try Demo Mode
            </button>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-3 text-xs font-medium text-slate-400">
            <span className="uppercase tracking-wider">Optimized For</span>
            {['Legal Contracts', 'Technical Manuals', 'Research Papers'].map((tag) => (
              <span
                key={tag}
                className="px-3 py-1 rounded-full bg-slate-100 text-slate-500"
              >
                {tag}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* ───────── Bento Stats ───────── */}
      <section className="py-16">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white rounded-3xl p-8 flex flex-col justify-end border border-slate-100 shadow-sm">
              <span className="font-headline text-4xl font-extrabold text-indigo-600">500M+</span>
              <span className="mt-1 text-sm text-slate-500">Tokens Processed</span>
            </div>
            <div className="bg-white rounded-3xl p-8 flex flex-col justify-end border border-slate-100 shadow-sm">
              <span className="font-headline text-4xl font-extrabold text-emerald-600">99.9%</span>
              <span className="mt-1 text-sm text-slate-500">Citation Accuracy</span>
            </div>
            <div className="bg-white rounded-3xl p-8 flex flex-col justify-end border border-slate-100 shadow-sm">
              <span className="font-headline text-4xl font-extrabold text-cyan-600">12ms</span>
              <span className="mt-1 text-sm text-slate-500">Avg Retrieval</span>
            </div>
            <div className="bg-white rounded-3xl p-8 flex flex-col justify-end border border-slate-100 shadow-sm">
              <span className="font-headline text-4xl font-extrabold text-violet-600">4-in-1</span>
              <span className="mt-1 text-sm text-slate-500">Integrated Workflow</span>
            </div>
          </div>
        </div>
      </section>

      {/* ───────── Features ───────── */}
      <section id="features" className="py-24 bg-slate-50/80">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="font-headline text-3xl sm:text-4xl font-bold text-slate-900 mb-4">
              Everything You Need
            </h2>
            <p className="text-slate-500 text-lg max-w-2xl mx-auto">
              Four integrated tools that cover the entire document intelligence workflow.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((f) => (
              <Link
                key={f.title}
                to={f.link}
                className="group bg-white rounded-3xl p-8 border border-slate-100 hover:shadow-lg hover:border-slate-200 transition-all"
              >
                <div className={`w-12 h-12 rounded-2xl ${f.iconBg} flex items-center justify-center mb-6`}>
                  <span className={`material-symbols-outlined ${f.iconColor} text-2xl`}>
                    {f.icon}
                  </span>
                </div>
                <h3 className="font-headline text-lg font-semibold text-slate-900 mb-2 group-hover:text-indigo-600 transition-colors">
                  {f.title}
                </h3>
                <p className="text-sm text-slate-500 leading-relaxed">{f.description}</p>
                <div className="mt-5 inline-flex items-center gap-1 text-sm font-medium text-indigo-600 opacity-0 group-hover:opacity-100 transition-opacity">
                  Open
                  <span className="material-symbols-outlined text-base">arrow_forward</span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ───────── How It Works ───────── */}
      <section id="how-it-works" className="py-24 bg-white">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div>
              <h2 className="font-headline text-3xl sm:text-4xl font-bold text-slate-900 mb-12">
                How It Works
              </h2>

              <ol className="space-y-10">
                {steps.map((s) => (
                  <li key={s.num} className="flex gap-6">
                    <div className={`flex-shrink-0 w-12 h-12 rounded-full ${s.iconBg} flex items-center justify-center font-headline text-lg font-bold ${s.numColor}`}>
                      {s.num}
                    </div>
                    <div>
                      <h3 className="font-headline text-lg font-semibold text-slate-900 mb-1">
                        {s.title}
                      </h3>
                      <p className="text-slate-500 text-sm leading-relaxed">
                        {s.description}
                      </p>
                    </div>
                  </li>
                ))}
              </ol>

              <div className="mt-10">
                <Link
                  to="/guide"
                  className="group inline-flex items-center gap-1.5 text-sm font-medium text-indigo-600"
                >
                  <span className="group-hover:underline underline-offset-2">Read the full guide</span>
                  <span className="material-symbols-outlined text-base">arrow_forward</span>
                </Link>
              </div>
            </div>

            {/* App screen mockup */}
            <div className="rounded-2xl border border-slate-200 bg-white shadow-2xl shadow-slate-300/30 overflow-hidden">
              {/* Browser chrome */}
              <div className="flex items-center gap-2 px-4 py-2.5 bg-slate-100 border-b border-slate-200">
                <span className="w-2.5 h-2.5 rounded-full bg-rose-400" />
                <span className="w-2.5 h-2.5 rounded-full bg-amber-400" />
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-400" />
                <div className="flex-1 mx-3 px-3 py-1 bg-white rounded-md text-[10px] text-slate-400 font-medium truncate">
                  docrag.ai/chat
                </div>
              </div>

              {/* App UI */}
              <div className="flex h-[340px]">
                {/* Mini sidebar */}
                <div className="w-14 bg-slate-50 border-r border-slate-100 flex flex-col items-center py-3 gap-1 flex-shrink-0">
                  <div className="w-7 h-7 rounded-md primary-gradient flex items-center justify-center mb-3">
                    <span className="text-white text-[8px] font-bold">D</span>
                  </div>
                  {['upload_file', 'search', 'chat', 'edit_note', 'auto_stories'].map((icon, i) => (
                    <div
                      key={icon}
                      className={`w-8 h-8 rounded-md flex items-center justify-center ${
                        i === 2 ? 'bg-white shadow-sm' : ''
                      }`}
                    >
                      <span
                        className={`material-symbols-outlined text-[16px] ${
                          i === 2 ? 'text-indigo-600' : 'text-slate-400'
                        }`}
                        style={i === 2 ? { fontVariationSettings: "'FILL' 1" } : undefined}
                      >
                        {icon}
                      </span>
                    </div>
                  ))}
                </div>

                {/* Doc sidebar */}
                <div className="w-36 border-r border-slate-100 bg-white flex flex-col flex-shrink-0">
                  <div className="px-3 py-2.5 border-b border-slate-100">
                    <div className="text-[10px] font-bold text-slate-700">Documents</div>
                    <div className="text-[9px] text-slate-400">3 selected</div>
                  </div>
                  <div className="flex-1 px-2 py-2 space-y-1.5 overflow-hidden">
                    {['contract_v2.pdf', 'q3_review.docx', 'policy_doc.pdf'].map((name) => (
                      <div key={name} className="flex items-center gap-1.5 px-2 py-1.5 rounded-md bg-indigo-50/60 border border-indigo-100/60">
                        <div className="w-1.5 h-1.5 rounded-full bg-indigo-500 flex-shrink-0" />
                        <span className="text-[9px] font-medium text-slate-600 truncate">{name}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Chat area */}
                <div className="flex-1 flex flex-col bg-white min-w-0">
                  <div className="px-4 py-2.5 border-b border-slate-100">
                    <div className="text-[11px] font-bold text-slate-800">Document Q&A</div>
                  </div>
                  <div className="flex-1 px-4 py-3 space-y-3 overflow-hidden">
                    {/* User message */}
                    <div className="flex justify-end">
                      <div className="primary-gradient text-white rounded-xl rounded-br-sm px-3 py-2 max-w-[75%]">
                        <p className="text-[10px] leading-relaxed">What are the key liability clauses?</p>
                      </div>
                    </div>
                    {/* AI response */}
                    <div className="flex justify-start">
                      <div className="bg-slate-50 border border-slate-100 rounded-xl rounded-bl-sm px-3 py-2 max-w-[80%] space-y-1.5">
                        <p className="text-[10px] text-slate-700 leading-relaxed">
                          Based on the contract, there are <span className="font-semibold">three main liability clauses</span>:
                        </p>
                        <p className="text-[10px] text-slate-500 leading-relaxed">
                          1. Limitation of liability capped at total fees paid...
                        </p>
                        <div className="flex items-center gap-1 pt-1 border-t border-slate-100 mt-1.5">
                          <span className="material-symbols-outlined text-indigo-500 text-[10px]">description</span>
                          <span className="text-[8px] text-indigo-600 font-medium">contract_v2.pdf · p.12</span>
                          <span className="text-[8px] font-bold text-emerald-600 bg-emerald-50 px-1 py-px rounded ml-auto">high</span>
                        </div>
                      </div>
                    </div>
                  </div>
                  {/* Input */}
                  <div className="px-3 py-2 border-t border-slate-100 flex gap-2">
                    <div className="flex-1 px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-[9px] text-slate-400">
                      Ask a question...
                    </div>
                    <div className="px-2.5 py-1.5 primary-gradient rounded-lg flex items-center">
                      <span className="material-symbols-outlined text-white text-[12px]">send</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ───────── Use Cases ───────── */}
      <section id="use-cases" className="py-24 bg-slate-50/80">
        <div className="mx-auto max-w-7xl px-6 lg:px-8 text-center">
          <h2 className="font-headline text-3xl sm:text-4xl font-bold text-slate-900 mb-4">
            Built for Every Knowledge Worker
          </h2>
          <p className="text-slate-500 text-lg max-w-2xl mx-auto mb-14">
            From legal discovery to academic research, DocRAG adapts to your domain.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {useCases.map((uc) => (
              <div
                key={uc.title}
                className="bg-white rounded-3xl p-8 text-center border border-slate-100 hover:shadow-md hover:border-slate-200 transition-all"
              >
                <div className={`w-14 h-14 mx-auto rounded-2xl ${uc.iconBg} flex items-center justify-center mb-5`}>
                  <span className={`material-symbols-outlined ${uc.iconColor} text-2xl`}>{uc.icon}</span>
                </div>
                <h3 className="font-headline font-semibold text-slate-900 mb-2">{uc.title}</h3>
                <p className="text-sm text-slate-500 leading-relaxed">{uc.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ───────── Technical RAG Block ───────── */}
      <section className="py-24 bg-slate-900 text-white">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div>
              <h2 className="font-headline text-3xl sm:text-4xl font-bold mb-6">
                Powered by Retrieval-Augmented Generation
              </h2>
              <p className="text-slate-400 text-lg mb-8 leading-relaxed">
                Unlike generic AI tools, every response is grounded in your uploaded
                documents. The pipeline retrieves the most relevant chunks before
                generating an answer — eliminating hallucinations and providing
                verifiable citations.
              </p>
              <ul className="space-y-3">
                {ragAdvantages.map((adv) => (
                  <li key={adv} className="flex items-start gap-3">
                    <span className="material-symbols-outlined text-emerald-400 text-xl mt-0.5" style={{ fontVariationSettings: "'FILL' 1" }}>
                      check_circle
                    </span>
                    <span className="text-slate-300">{adv}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="bg-slate-800/80 rounded-3xl p-8 font-mono text-sm leading-relaxed overflow-x-auto border border-slate-700/50">
              <div className="flex items-center gap-2 mb-6 text-slate-500">
                <span className="w-3 h-3 rounded-full bg-red-400/60" />
                <span className="w-3 h-3 rounded-full bg-amber-400/60" />
                <span className="w-3 h-3 rounded-full bg-green-400/60" />
                <span className="ml-2 text-xs text-slate-500">rag_pipeline.py</span>
              </div>
              <pre className="text-slate-300 whitespace-pre">
{`# 1. Chunk & embed documents
chunks  = split(doc, max_tokens=512)
vectors = embed(chunks, model="text-embedding-3-small")
index.upsert(vectors)

# 2. Retrieve relevant context
query_vec = embed(query)
results   = index.query(query_vec, top_k=8)

# 3. Generate grounded answer
answer = llm.chat(
    system="Use ONLY the provided context.",
    context=results,
    question=query,
)`}
              </pre>
            </div>
          </div>
        </div>
      </section>

      {/* ───────── Bottom CTA Band ───────── */}
      <section className="py-20 bg-white">
        <div className="mx-auto max-w-4xl px-6 lg:px-8 text-center">
          <h2 className="font-headline text-3xl sm:text-4xl font-bold text-slate-900 mb-4">
            Ready to Analyze Your Documents?
          </h2>
          <p className="text-slate-500 text-lg mb-10 max-w-2xl mx-auto">
            Start extracting insights from your corpus in under a minute — no configuration required.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              to="/upload"
              className="primary-gradient text-white font-semibold px-10 py-4 rounded-2xl text-base shadow-lg shadow-indigo-300/40 hover:shadow-xl transition-all flex items-center gap-2"
            >
              Get Started Free
              <span className="material-symbols-outlined text-xl">arrow_forward</span>
            </Link>
            <button
              onClick={handleTryDemo}
              className="bg-white font-semibold px-10 py-4 rounded-2xl text-base text-slate-700 border border-slate-200 hover:border-indigo-200 hover:bg-indigo-50/50 transition-all flex items-center gap-2 cursor-pointer"
            >
              <span className="material-symbols-outlined text-xl text-indigo-500">play_circle</span>
              Try Demo First
            </button>
          </div>
        </div>
      </section>

      {/* ───────── Footer ───────── */}
      <footer className="bg-slate-50 border-t border-slate-200/60 py-16">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-10">
            <div className="col-span-2 md:col-span-1">
              <div className="flex items-center gap-2.5 mb-4">
                <div className="w-8 h-8 primary-gradient rounded-lg flex items-center justify-center shadow-sm">
                  <span className="text-white text-sm font-bold">D</span>
                </div>
                <span className="font-headline text-lg font-bold text-slate-900">DocRAG</span>
              </div>
              <p className="text-sm text-slate-500 leading-relaxed">
                AI-powered document intelligence built on retrieval-augmented generation.
              </p>
            </div>

            <div>
              <h4 className="font-semibold text-slate-900 text-sm mb-4">Product</h4>
              <ul className="space-y-2 text-sm text-slate-500">
                <li><Link to="/upload" className="hover:text-indigo-600 transition-colors">Upload</Link></li>
                <li><Link to="/search" className="hover:text-indigo-600 transition-colors">Search</Link></li>
                <li><Link to="/chat" className="hover:text-indigo-600 transition-colors">Chat</Link></li>
                <li><Link to="/draft" className="hover:text-indigo-600 transition-colors">Draft</Link></li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold text-slate-900 text-sm mb-4">Resources</h4>
              <ul className="space-y-2 text-sm text-slate-500">
                <li><Link to="/guide" className="hover:text-indigo-600 transition-colors">Guide</Link></li>
                <li><a href="#how-it-works" className="hover:text-indigo-600 transition-colors">How it Works</a></li>
                <li><a href="#use-cases" className="hover:text-indigo-600 transition-colors">Use Cases</a></li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold text-slate-900 text-sm mb-4">Company</h4>
              <ul className="space-y-2 text-sm text-slate-500">
                <li><a href="#" className="hover:text-indigo-600 transition-colors">About</a></li>
                <li><a href="#" className="hover:text-indigo-600 transition-colors">Privacy</a></li>
                <li><a href="#" className="hover:text-indigo-600 transition-colors">Terms</a></li>
              </ul>
            </div>
          </div>

          <div className="mt-12 pt-8 border-t border-slate-200/60 text-center text-xs text-slate-400">
            &copy; {new Date().getFullYear()} DocRAG. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
}
