import { Link, useNavigate } from 'react-router-dom';
import { SignedIn, SignedOut } from '@clerk/clerk-react';
import { MarketingHeader } from '../components/MarketingHeader';
import { AuthAwareAppLink } from '../components/AuthAwareAppLink';

const features = [
  {
    icon: 'upload_file',
    title: 'Upload',
    description:
      'Drag-and-drop PDFs and DOCX files up to 50 MB. Content is automatically parsed, chunked, and embedded for retrieval.',
    link: '/upload',
    gradient: 'from-violet-500 to-purple-600',
    shadow: 'shadow-violet-200/60',
  },
  {
    icon: 'search',
    title: 'Search',
    description:
      'Query your corpus with natural language. Semantic similarity finds relevant passages even without exact keyword matches.',
    link: '/search',
    gradient: 'from-cyan-500 to-blue-600',
    shadow: 'shadow-cyan-200/60',
  },
  {
    icon: 'chat',
    title: 'Chat',
    description:
      'Ask questions and receive cited answers grounded entirely in your uploaded documents. No hallucinations.',
    link: '/chat',
    gradient: 'from-emerald-500 to-teal-600',
    shadow: 'shadow-emerald-200/60',
  },
  {
    icon: 'edit_note',
    title: 'Draft',
    description:
      'Generate polished proposals, contracts, and reports from templates. Export to PDF, DOCX, or Markdown instantly.',
    link: '/draft',
    gradient: 'from-amber-500 to-orange-600',
    shadow: 'shadow-amber-200/60',
  },
];

const steps = [
  {
    num: '01',
    title: 'Upload & Ingest',
    description:
      'Drop your files into the pipeline. We extract text, detect structure, and split content into semantically coherent chunks.',
  },
  {
    num: '02',
    title: 'Vector Indexing',
    description:
      'Each chunk is embedded via a high-dimensional model and stored in a vector index for sub-millisecond nearest-neighbour search.',
  },
  {
    num: '03',
    title: 'Synthesized Analysis',
    description:
      'Queries retrieve the most relevant chunks, which are fed as context to a large language model that synthesizes a grounded answer.',
  },
];

const useCases = [
  { icon: 'gavel', title: 'Legal Teams', desc: 'Review contracts and surface key clauses across thousands of pages.' },
  { icon: 'biotech', title: 'Researchers', desc: 'Synthesize findings from large paper corpora with full citations.' },
  { icon: 'engineering', title: 'Engineering', desc: 'Search technical manuals and specs using plain-language queries.' },
  { icon: 'trending_up', title: 'Consultants', desc: 'Generate client deliverables grounded in past successful projects.' },
];

const ragAdvantages = [
  'Semantic retrieval understands meaning, not just keywords',
  'Every answer carries traceable source citations',
  'Documents remain private — never used for model training',
  'Sub-millisecond vector search at any corpus size',
  'Context-aware generation that matches your domain language',
];

const stats = [
  { value: '500M+', label: 'Tokens Processed', color: 'text-violet-600' },
  { value: '99.9%', label: 'Citation Accuracy', color: 'text-emerald-600' },
  { value: '12ms', label: 'Avg Retrieval', color: 'text-cyan-600' },
  { value: '4-in-1', label: 'Integrated Workflow', color: 'text-amber-600' },
];

export function LandingPage() {
  const navigate = useNavigate();

  const handleTryDemo = () => {
    navigate('/draft?demo=true');
  };

  return (
    <div className="min-h-screen bg-white text-on-surface">
      <MarketingHeader />

      {/* ═══════════ Hero ═══════════ */}
      <section className="relative pt-32 pb-24 lg:pt-44 lg:pb-32 overflow-hidden">
        {/* Background effects */}
        <div className="absolute inset-0 dot-grid opacity-40" />
        <div className="absolute -top-60 right-0 w-[700px] h-[700px] rounded-full bg-violet-200/30 blur-[120px] pointer-events-none" />
        <div className="absolute -bottom-40 -left-40 w-[500px] h-[500px] rounded-full bg-cyan-200/25 blur-[100px] pointer-events-none" />

        <div className="relative mx-auto max-w-7xl px-6 lg:px-8 text-center">
          {/* Badge */}
          <div className="animate-fade-in-up delay-0 inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-violet-50 text-violet-700 text-xs font-bold tracking-widest uppercase mb-8 border border-violet-200/60">
            <span className="w-1.5 h-1.5 rounded-full bg-violet-500 animate-pulse" />
            Retrieval-Augmented Intelligence
          </div>

          {/* Headline */}
          <h1 className="animate-fade-in-up delay-1 font-headline text-5xl sm:text-6xl lg:text-[5rem] font-black tracking-tight text-neutral-900 leading-[1.05] mb-6">
            Document Intelligence
            <br />
            <span className="text-gradient">That Actually Works</span>
          </h1>

          {/* Subheading */}
          <p className="animate-fade-in-up delay-2 mx-auto max-w-2xl text-lg text-neutral-500 leading-relaxed mb-12">
            Upload any corpus, ask complex questions, and receive accurate, cited
            answers in seconds — powered by retrieval-augmented generation and
            high-dimensional vector search.
          </p>

          {/* CTAs */}
          <div className="animate-fade-in-up delay-3 flex flex-col sm:flex-row items-center justify-center gap-4 mb-16">
            <SignedIn>
              <Link
                to="/upload"
                className="primary-gradient text-white font-bold px-8 py-4 rounded-2xl text-base shadow-xl shadow-violet-500/25 hover:shadow-2xl hover:shadow-violet-500/30 hover:-translate-y-0.5 transition-all duration-300 flex items-center gap-2"
              >
                <span className="material-symbols-outlined text-xl">rocket_launch</span>
                Start Analyzing
              </Link>
            </SignedIn>
            <SignedOut>
              <Link
                to="/sign-up"
                className="primary-gradient text-white font-bold px-8 py-4 rounded-2xl text-base shadow-xl shadow-violet-500/25 hover:shadow-2xl hover:shadow-violet-500/30 hover:-translate-y-0.5 transition-all duration-300 flex items-center gap-2"
              >
                <span className="material-symbols-outlined text-xl">rocket_launch</span>
                Start Analyzing
              </Link>
            </SignedOut>
            <button
              type="button"
              onClick={handleTryDemo}
              className="bg-white font-bold px-8 py-4 rounded-2xl text-base text-neutral-700 border border-neutral-200 hover:border-violet-300 hover:bg-violet-50/50 hover:-translate-y-0.5 transition-all duration-300 flex items-center gap-2 cursor-pointer shadow-sm"
            >
              <span className="material-symbols-outlined text-xl text-violet-500">play_circle</span>
              Try Demo Mode
            </button>
          </div>

          {/* Optimized tags */}
          <div className="animate-fade-in-up delay-4 flex flex-wrap items-center justify-center gap-3 text-xs font-semibold text-neutral-400">
            <span className="uppercase tracking-wider">Optimized For</span>
            {['Legal Contracts', 'Technical Manuals', 'Research Papers'].map((tag) => (
              <span
                key={tag}
                className="px-3.5 py-1.5 rounded-lg bg-neutral-100 text-neutral-500 border border-neutral-200/50"
              >
                {tag}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════ Stats Bento ═══════════ */}
      <section className="py-16">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {stats.map((stat, i) => (
              <div
                key={stat.label}
                className="animate-fade-in-up bg-white rounded-2xl p-8 flex flex-col justify-end border border-neutral-100 shadow-sm card-hover"
                style={{ animationDelay: `${i * 100 + 200}ms` }}
              >
                <span className={`font-headline text-4xl lg:text-5xl font-black ${stat.color}`}>
                  {stat.value}
                </span>
                <span className="mt-2 text-sm font-medium text-neutral-400">{stat.label}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════ Features ═══════════ */}
      <section id="features" className="py-24 relative overflow-hidden">
        <div className="absolute inset-0 bg-neutral-50/80" />
        <div className="absolute inset-0 dot-grid opacity-30" />

        <div className="relative mx-auto max-w-7xl px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="font-headline text-3xl sm:text-4xl font-black text-neutral-900 mb-4 tracking-tight">
              Everything You Need
            </h2>
            <p className="text-neutral-500 text-lg max-w-2xl mx-auto">
              Four integrated tools that cover the entire document intelligence workflow.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((f, i) => (
              <AuthAwareAppLink
                key={f.title}
                to={f.link}
                className="group bg-white rounded-2xl p-8 border border-neutral-100 card-hover gradient-border block"
                style={{ animationDelay: `${i * 80}ms` }}
              >
                <div
                  className={`w-12 h-12 rounded-xl bg-gradient-to-br ${f.gradient} ${f.shadow} shadow-lg flex items-center justify-center mb-6`}
                >
                  <span className="material-symbols-outlined text-white text-2xl" style={{ fontVariationSettings: "'FILL' 1" }}>
                    {f.icon}
                  </span>
                </div>
                <h3 className="font-headline text-lg font-bold text-neutral-900 mb-2 group-hover:text-violet-600 transition-colors">
                  {f.title}
                </h3>
                <p className="text-sm text-neutral-500 leading-relaxed">{f.description}</p>
                <div className="mt-5 inline-flex items-center gap-1 text-sm font-bold text-violet-600 opacity-0 group-hover:opacity-100 transition-all duration-300 group-hover:translate-x-1">
                  Open
                  <span className="material-symbols-outlined text-base">arrow_forward</span>
                </div>
              </AuthAwareAppLink>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════ How It Works ═══════════ */}
      <section id="how-it-works" className="py-24 bg-white">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div>
              <h2 className="font-headline text-3xl sm:text-4xl font-black text-neutral-900 mb-12 tracking-tight">
                How It Works
              </h2>

              <ol className="space-y-10">
                {steps.map((s) => (
                  <li key={s.num} className="flex gap-6 group">
                    <div className="flex-shrink-0 w-14 h-14 rounded-2xl bg-gradient-to-br from-violet-100 to-cyan-50 border border-violet-200/40 flex items-center justify-center font-headline text-lg font-black text-violet-600 group-hover:scale-105 transition-transform">
                      {s.num}
                    </div>
                    <div>
                      <h3 className="font-headline text-lg font-bold text-neutral-900 mb-1">
                        {s.title}
                      </h3>
                      <p className="text-neutral-500 text-sm leading-relaxed">
                        {s.description}
                      </p>
                    </div>
                  </li>
                ))}
              </ol>

              <div className="mt-10">
                <Link
                  to="/guide"
                  className="group inline-flex items-center gap-1.5 text-sm font-bold text-violet-600"
                >
                  <span className="group-hover:underline underline-offset-4 decoration-2">Read the full guide</span>
                  <span className="material-symbols-outlined text-base transition-transform group-hover:translate-x-0.5">arrow_forward</span>
                </Link>
              </div>
            </div>

            {/* App screen mockup */}
            <div className="rounded-2xl border border-neutral-200 bg-white shadow-2xl shadow-neutral-200/50 overflow-hidden">
              {/* Browser chrome */}
              <div className="flex items-center gap-2 px-4 py-2.5 bg-neutral-50 border-b border-neutral-200">
                <span className="w-2.5 h-2.5 rounded-full bg-red-400" />
                <span className="w-2.5 h-2.5 rounded-full bg-amber-400" />
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-400" />
                <div className="flex-1 mx-3 px-3 py-1 bg-white rounded-md text-[10px] text-neutral-400 font-medium truncate border border-neutral-100">
                  docrag.ai/chat
                </div>
              </div>

              {/* App UI */}
              <div className="flex h-[340px]">
                {/* Mini dark sidebar */}
                <div className="w-14 bg-neutral-50 border-r border-neutral-100 flex flex-col items-center py-3 gap-1 flex-shrink-0">
                  <div className="w-7 h-7 rounded-md primary-gradient flex items-center justify-center mb-3">
                    <span className="text-white text-[8px] font-black">D</span>
                  </div>
                  {['upload_file', 'search', 'chat', 'edit_note', 'auto_stories'].map((icon, i) => (
                    <div
                      key={icon}
                      className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                        i === 2 ? 'bg-violet-50' : ''
                      }`}
                    >
                      <span
                        className={`material-symbols-outlined text-[16px] ${
                          i === 2 ? 'text-violet-600' : 'text-neutral-400'
                        }`}
                        style={i === 2 ? { fontVariationSettings: "'FILL' 1" } : undefined}
                      >
                        {icon}
                      </span>
                    </div>
                  ))}
                </div>

                {/* Doc sidebar */}
                <div className="w-36 border-r border-neutral-100 bg-white flex flex-col flex-shrink-0">
                  <div className="px-3 py-2.5 border-b border-neutral-100">
                    <div className="text-[10px] font-bold text-neutral-700">Documents</div>
                    <div className="text-[9px] text-neutral-400">3 selected</div>
                  </div>
                  <div className="flex-1 px-2 py-2 space-y-1.5 overflow-hidden">
                    {['contract_v2.pdf', 'q3_review.docx', 'policy_doc.pdf'].map((name) => (
                      <div key={name} className="flex items-center gap-1.5 px-2 py-1.5 rounded-lg bg-violet-50/60 border border-violet-100/60">
                        <div className="w-1.5 h-1.5 rounded-full bg-violet-500 flex-shrink-0" />
                        <span className="text-[9px] font-medium text-neutral-600 truncate">{name}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Chat area */}
                <div className="flex-1 flex flex-col bg-white min-w-0">
                  <div className="px-4 py-2.5 border-b border-neutral-100">
                    <div className="text-[11px] font-bold text-neutral-800">Document Q&A</div>
                  </div>
                  <div className="flex-1 px-4 py-3 space-y-3 overflow-hidden">
                    <div className="flex justify-end">
                      <div className="primary-gradient text-white rounded-xl rounded-br-sm px-3 py-2 max-w-[75%]">
                        <p className="text-[10px] leading-relaxed">What are the key liability clauses?</p>
                      </div>
                    </div>
                    <div className="flex justify-start">
                      <div className="bg-neutral-50 border border-neutral-100 rounded-xl rounded-bl-sm px-3 py-2 max-w-[80%] space-y-1.5">
                        <p className="text-[10px] text-neutral-700 leading-relaxed">
                          Based on the contract, there are <span className="font-bold">three main liability clauses</span>:
                        </p>
                        <p className="text-[10px] text-neutral-500 leading-relaxed">
                          1. Limitation of liability capped at total fees paid...
                        </p>
                        <div className="flex items-center gap-1 pt-1 border-t border-neutral-100 mt-1.5">
                          <span className="material-symbols-outlined text-violet-500 text-[10px]">description</span>
                          <span className="text-[8px] text-violet-600 font-bold">contract_v2.pdf · p.12</span>
                          <span className="text-[8px] font-bold text-emerald-600 bg-emerald-50 px-1.5 py-px rounded-md ml-auto">high</span>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="px-3 py-2 border-t border-neutral-100 flex gap-2">
                    <div className="flex-1 px-2.5 py-1.5 bg-neutral-50 border border-neutral-200 rounded-lg text-[9px] text-neutral-400">
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

      {/* ═══════════ Use Cases ═══════════ */}
      <section id="use-cases" className="py-24 relative overflow-hidden">
        <div className="absolute inset-0 bg-neutral-50/80" />
        <div className="absolute inset-0 dot-grid opacity-30" />

        <div className="relative mx-auto max-w-7xl px-6 lg:px-8 text-center">
          <h2 className="font-headline text-3xl sm:text-4xl font-black text-neutral-900 mb-4 tracking-tight">
            Built for Every Knowledge Worker
          </h2>
          <p className="text-neutral-500 text-lg max-w-2xl mx-auto mb-14">
            From legal discovery to academic research, DocRAG adapts to your domain.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {useCases.map((uc) => (
              <div
                key={uc.title}
                className="bg-white rounded-2xl p-8 text-center border border-neutral-100 card-hover"
              >
                <div className="w-14 h-14 mx-auto rounded-2xl bg-gradient-to-br from-violet-100 to-cyan-50 border border-violet-200/30 flex items-center justify-center mb-5">
                  <span className="material-symbols-outlined text-violet-600 text-2xl">{uc.icon}</span>
                </div>
                <h3 className="font-headline font-bold text-neutral-900 mb-2">{uc.title}</h3>
                <p className="text-sm text-neutral-500 leading-relaxed">{uc.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════ Technical RAG Block ═══════════ */}
      <section className="py-24 bg-sidebar text-white relative overflow-hidden noise-overlay">
        <div className="absolute inset-0 dot-grid-dark" />

        <div className="relative mx-auto max-w-7xl px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div>
              <h2 className="font-headline text-3xl sm:text-4xl font-black mb-6 tracking-tight">
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
                    <span className="material-symbols-outlined text-cyan-400 text-xl mt-0.5" style={{ fontVariationSettings: "'FILL' 1" }}>
                      check_circle
                    </span>
                    <span className="text-slate-300">{adv}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="bg-slate-800/50 rounded-2xl p-8 font-mono text-sm leading-relaxed overflow-x-auto border border-slate-700/50 backdrop-blur-sm">
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

      {/* ═══════════ Bottom CTA ═══════════ */}
      <section className="py-24 bg-white relative overflow-hidden">
        <div className="absolute inset-0 dot-grid opacity-20" />
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] rounded-full bg-violet-100/40 blur-[100px] pointer-events-none" />

        <div className="relative mx-auto max-w-4xl px-6 lg:px-8 text-center">
          <h2 className="font-headline text-3xl sm:text-4xl font-black text-neutral-900 mb-4 tracking-tight">
            Ready to Analyze Your Documents?
          </h2>
          <p className="text-neutral-500 text-lg mb-10 max-w-2xl mx-auto">
            Start extracting insights from your corpus in under a minute — no configuration required.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <SignedIn>
              <Link
                to="/upload"
                className="primary-gradient text-white font-bold px-10 py-4 rounded-2xl text-base shadow-xl shadow-violet-500/25 hover:shadow-2xl hover:shadow-violet-500/30 hover:-translate-y-0.5 transition-all duration-300 flex items-center gap-2"
              >
                Get Started Free
                <span className="material-symbols-outlined text-xl">arrow_forward</span>
              </Link>
            </SignedIn>
            <SignedOut>
              <Link
                to="/sign-up"
                className="primary-gradient text-white font-bold px-10 py-4 rounded-2xl text-base shadow-xl shadow-violet-500/25 hover:shadow-2xl hover:shadow-violet-500/30 hover:-translate-y-0.5 transition-all duration-300 flex items-center gap-2"
              >
                Get Started Free
                <span className="material-symbols-outlined text-xl">arrow_forward</span>
              </Link>
            </SignedOut>
            <button
              type="button"
              onClick={handleTryDemo}
              className="bg-white font-bold px-10 py-4 rounded-2xl text-base text-neutral-700 border border-neutral-200 hover:border-violet-300 hover:bg-violet-50/50 hover:-translate-y-0.5 transition-all duration-300 flex items-center gap-2 cursor-pointer shadow-sm"
            >
              <span className="material-symbols-outlined text-xl text-violet-500">play_circle</span>
              Try Demo First
            </button>
          </div>
        </div>
      </section>

      {/* ═══════════ Footer ═══════════ */}
      <footer className="bg-neutral-50 border-t border-neutral-200/60 py-16">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-10">
            <div className="col-span-2 md:col-span-1">
              <div className="flex items-center gap-2.5 mb-4">
                <div className="w-8 h-8 rounded-lg primary-gradient flex items-center justify-center shadow-sm">
                  <span className="text-white text-sm font-black font-headline">D</span>
                </div>
                <span className="font-headline text-lg font-black text-neutral-900">DocRAG</span>
              </div>
              <p className="text-sm text-neutral-500 leading-relaxed">
                AI-powered document intelligence built on retrieval-augmented generation.
              </p>
            </div>

            <div>
              <h4 className="font-bold text-neutral-900 text-sm mb-4">Product</h4>
              <ul className="space-y-2.5 text-sm text-neutral-500">
                <li>
                  <AuthAwareAppLink to="/upload" className="hover:text-violet-600 transition-colors">
                    Upload
                  </AuthAwareAppLink>
                </li>
                <li>
                  <AuthAwareAppLink to="/search" className="hover:text-violet-600 transition-colors">
                    Search
                  </AuthAwareAppLink>
                </li>
                <li>
                  <AuthAwareAppLink to="/chat" className="hover:text-violet-600 transition-colors">
                    Chat
                  </AuthAwareAppLink>
                </li>
                <li>
                  <AuthAwareAppLink to="/draft" className="hover:text-violet-600 transition-colors">
                    Draft
                  </AuthAwareAppLink>
                </li>
              </ul>
            </div>

            <div>
              <h4 className="font-bold text-neutral-900 text-sm mb-4">Resources</h4>
              <ul className="space-y-2.5 text-sm text-neutral-500">
                <li><Link to="/guide" className="hover:text-violet-600 transition-colors">Guide</Link></li>
                <li><a href="#how-it-works" className="hover:text-violet-600 transition-colors">How it Works</a></li>
                <li><a href="#use-cases" className="hover:text-violet-600 transition-colors">Use Cases</a></li>
              </ul>
            </div>

            <div>
              <h4 className="font-bold text-neutral-900 text-sm mb-4">Company</h4>
              <ul className="space-y-2.5 text-sm text-neutral-500">
                <li><a href="#" className="hover:text-violet-600 transition-colors">About</a></li>
                <li><a href="#" className="hover:text-violet-600 transition-colors">Privacy</a></li>
                <li><a href="#" className="hover:text-violet-600 transition-colors">Terms</a></li>
              </ul>
            </div>
          </div>

          <div className="mt-12 pt-8 border-t border-neutral-200/60 text-center text-xs text-neutral-400 font-medium">
            &copy; {new Date().getFullYear()} DocRAG. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
}
