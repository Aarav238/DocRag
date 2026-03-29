import { Fragment } from 'react';
import { Link } from 'react-router-dom';

const quickStartSteps = [
  {
    number: '01',
    title: 'Upload',
    description: 'Drag & drop PDFs or DOCX files. We handle OCR, parsing, and chunking automatically.',
    icon: 'upload_file',
    link: '/upload',
  },
  {
    number: '02',
    title: 'Index',
    description: 'Documents are embedded and indexed into a high-performance vector store in seconds.',
    icon: 'database',
    link: null,
  },
  {
    number: '03',
    title: 'Chat & Draft',
    description: 'Ask questions grounded in your docs or generate polished drafts with full citations.',
    icon: 'chat_bubble',
    link: '/chat',
  },
];

const pipelineStages = [
  {
    step: 1,
    title: 'Ingest & chunk',
    summary: 'PDFs and Word docs are parsed, cleaned, and split into overlapping chunks your team can retrieve later.',
    output: 'Structured text chunks',
    icon: 'picture_as_pdf',
    gradient: 'from-violet-500 to-purple-600',
    shadow: 'shadow-violet-200/80',
  },
  {
    step: 2,
    title: 'Embed',
    summary: 'Each chunk is turned into a dense vector so “similar meaning” can be found even when wording differs.',
    output: 'Vector embeddings',
    icon: 'data_array',
    gradient: 'from-cyan-500 to-sky-600',
    shadow: 'shadow-cyan-200/80',
  },
  {
    step: 3,
    title: 'Index & search',
    summary: 'Vectors live in a fast index. At query time we pull the top matches — your private “semantic Google.”',
    output: 'Top-k relevant chunks',
    icon: 'database',
    gradient: 'from-emerald-500 to-teal-600',
    shadow: 'shadow-emerald-200/80',
  },
  {
    step: 4,
    title: 'Grounded answer',
    summary: 'Only those chunks are sent to the model, so answers stay tied to your documents with citations.',
    output: 'Answer + sources',
    icon: 'auto_awesome',
    gradient: 'from-indigo-500 to-blue-600',
    shadow: 'shadow-indigo-200/80',
  },
] as const;

const bestPractices = [
  {
    number: '01',
    title: 'Write Effective Prompts',
    description:
      'Be specific with your questions. Instead of "summarize this", try "summarize the payment terms in section 4.2 of the vendor agreement".',
    icon: 'edit_note',
  },
  {
    number: '02',
    title: 'Use High-Quality OCR',
    description:
      'Ensure scanned documents are legible and properly oriented. Clean scans produce dramatically better extraction results.',
    icon: 'document_scanner',
  },
  {
    number: '03',
    title: 'Tag Your Documents',
    description:
      'Organize uploads with meaningful names and tags so the retrieval engine can surface the right context every time.',
    icon: 'label',
  },
  {
    number: '04',
    title: 'Verify with Citations',
    description:
      'Every answer includes source references. Click through to the original page to confirm accuracy before sharing.',
    icon: 'verified',
  },
];

export function GuidePage() {
  return (
    <div className="flex flex-col min-h-screen">
      {/* ── Header ── */}
      <header className="sticky top-0 z-50 bg-white/70 backdrop-blur-xl px-6 py-3 flex justify-between items-center w-full">
        <h2 className="text-xl font-bold tracking-tight text-indigo-900 font-headline">Guide</h2>
      </header>

      {/* ── Content ── */}
      <div className="max-w-5xl mx-auto p-8 lg:p-12 space-y-16 w-full">
        {/* ── Hero ── */}
        <section className="space-y-6">
          <span className="inline-flex items-center gap-2 rounded-full bg-indigo-50 px-4 py-1.5 text-sm font-medium text-indigo-700">
            <span className="h-2 w-2 rounded-full bg-secondary" />
            v2.0 — Intelligence Upgrade
          </span>
          <h1 className="text-5xl lg:text-6xl font-extrabold font-headline tracking-tight text-slate-900 leading-tight">
            Getting Started with{' '}
            <span className="text-primary">DocRAG</span>
          </h1>
          <p className="max-w-2xl text-lg text-slate-600 leading-relaxed">
            Upload reference documents, let the intelligence pipeline index them in seconds, then
            chat, search, and draft — all grounded in your own data with full source citations.
          </p>
        </section>

        {/* ── Quick Start Steps ── */}
        <section className="space-y-8">
          <h2 className="text-2xl font-bold font-headline text-slate-900">Quick Start</h2>
          <div className="grid gap-6 md:grid-cols-3 md:items-stretch">
            {quickStartSteps.map((step) => (
              <div
                key={step.number}
                className="relative flex flex-col h-full bg-surface-container-lowest p-6 sm:p-8 rounded-xl border border-outline-variant/10 shadow-sm group hover:shadow-md transition-shadow overflow-hidden"
              >
                {/* Large step number watermark */}
                <span className="absolute -bottom-4 -right-2 text-[7rem] font-black text-slate-100 leading-none select-none pointer-events-none">
                  {step.number}
                </span>

                <div className="relative z-10 flex flex-col flex-1 min-h-0 gap-4">
                  <div className="w-14 h-14 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                    <span className="material-symbols-outlined text-primary text-3xl">
                      {step.icon}
                    </span>
                  </div>
                  <h3 className="text-lg font-semibold text-slate-900">{step.title}</h3>
                  <p className="text-sm text-slate-500 leading-relaxed flex-1">{step.description}</p>

                  <div className="mt-auto pt-2 shrink-0">
                    {step.link ? (
                      <Link
                        to={step.link}
                        className="group/link inline-flex w-full items-center justify-between gap-2 rounded-lg border border-primary/15 bg-primary/5 px-4 py-3 text-sm font-semibold text-primary transition-colors hover:bg-primary/10 hover:border-primary/25"
                      >
                        <span>Go to {step.title}</span>
                        <span className="material-symbols-outlined text-lg transition-transform group-hover/link:translate-x-0.5">
                          arrow_forward
                        </span>
                      </Link>
                    ) : (
                      <div className="rounded-lg border border-indigo-100 bg-indigo-50/60 px-4 py-3">
                        <div className="flex items-center gap-2">
                          <span className="material-symbols-outlined text-indigo-600 text-lg shrink-0">bolt</span>
                          <span className="text-sm font-semibold text-slate-900">Automatic indexing</span>
                        </div>
                        <div
                          className="mt-3 flex items-center justify-between gap-1 text-[10px] font-semibold uppercase tracking-wide text-indigo-900/70"
                          aria-hidden
                        >
                          <span className="truncate">Extract</span>
                          <span className="text-indigo-300">→</span>
                          <span className="truncate">Embed</span>
                          <span className="text-indigo-300">→</span>
                          <span className="truncate">Index</span>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ── Technical Pipeline ── */}
        <section className="relative overflow-hidden rounded-3xl border border-slate-200/80 bg-gradient-to-br from-slate-50 via-white to-indigo-50/40 p-6 shadow-sm sm:p-8 lg:p-10">
          <div className="pointer-events-none absolute -right-24 -top-24 h-64 w-64 rounded-full bg-indigo-200/30 blur-3xl" />
          <div className="pointer-events-none absolute -bottom-20 -left-16 h-56 w-56 rounded-full bg-cyan-200/25 blur-3xl" />

          <div className="relative flex w-full flex-col gap-8 lg:gap-10">
            {/* Header: title block + trust callout aligned on one grid */}
            <div className="grid gap-6 lg:grid-cols-[1fr_minmax(0,280px)] lg:items-start lg:gap-10">
              <div className="min-w-0 space-y-3 text-left">
                <h2 className="font-headline text-2xl font-bold tracking-tight text-slate-900 lg:text-3xl">
                  The Intelligence Pipeline
                </h2>
                <p className="text-sm leading-relaxed text-slate-600 lg:text-base">
                  Four stages turn raw files into answers you can trust: nothing is invented outside the
                  chunks we retrieve from your own library.
                </p>
              </div>
              <aside className="flex w-full flex-col justify-center rounded-2xl border border-indigo-100/90 bg-white/90 px-4 py-3.5 text-left shadow-sm backdrop-blur-sm lg:shrink-0">
                <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-500">At a glance</span>
                <div className="mt-2 flex items-start gap-2.5">
                  <span className="material-symbols-outlined mt-0.5 shrink-0 text-emerald-600 text-[20px]">lock</span>
                  <p className="text-xs leading-snug text-slate-600">
                    Your documents are not used to train public foundation models.
                  </p>
                </div>
              </aside>
            </div>

            {/* Flow strip — single horizontal line, scrolls on narrow viewports */}
            <div className="rounded-2xl border border-slate-200/60 bg-white/80 px-3 py-4 shadow-inner sm:px-5 sm:py-5">
              <p className="mb-3 text-center text-[10px] font-bold uppercase tracking-[0.18em] text-slate-400 sm:mb-4">
                End-to-end flow
              </p>
              <div className="flex items-center justify-center gap-0 overflow-x-auto pb-1 [-webkit-overflow-scrolling:touch] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
                <div className="flex min-w-min items-center gap-1 sm:gap-1.5">
                  {['Files', 'Chunks', 'Vectors', 'Retrieval', 'Answer'].map((label, i) => (
                    <Fragment key={label}>
                      {i > 0 && (
                        <span
                          className="material-symbols-outlined shrink-0 px-0.5 text-base text-slate-300 sm:text-lg"
                          aria-hidden
                        >
                          chevron_right
                        </span>
                      )}
                      <span className="shrink-0 rounded-full bg-indigo-50 px-2.5 py-1 text-xs font-semibold text-indigo-900 ring-1 ring-indigo-100/80 sm:px-3 sm:text-sm">
                        {label}
                      </span>
                    </Fragment>
                  ))}
                </div>
              </div>
            </div>

            {/* Stage cards — equal height grid; footer pinned to bottom so border-t aligns */}
            <div className="grid items-stretch gap-5 sm:grid-cols-2 lg:grid-cols-4 lg:gap-6">
              {pipelineStages.map((stage) => (
                <article
                  key={stage.step}
                  className="flex h-full min-h-0 flex-col rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm ring-1 ring-slate-100/80 transition-all duration-200 hover:-translate-y-0.5 hover:border-indigo-200/60 hover:shadow-md"
                >
                  <div className="mb-4 flex items-center justify-between gap-2">
                    <span className="inline-flex items-center rounded-full bg-slate-100 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-slate-500">
                      Step {stage.step}
                    </span>
                  </div>
                  <div
                    className={`mb-4 flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br ${stage.gradient} shadow-lg ${stage.shadow}`}
                  >
                    <span
                      className="material-symbols-outlined text-2xl text-white"
                      style={{ fontVariationSettings: "'FILL' 1" }}
                    >
                      {stage.icon}
                    </span>
                  </div>
                  <h3 className="font-headline text-base font-bold leading-snug text-slate-900">{stage.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-slate-500">{stage.summary}</p>
                  {/* Fixed-structure footer: same rule length (full width), same line thickness, same block height */}
                  <div className="mt-auto w-full">
                    <div className="h-px w-full shrink-0 bg-slate-200" aria-hidden />
                    <div className="flex min-h-[4.75rem] items-start gap-3 pt-4">
                      <span className="material-symbols-outlined mt-0.5 shrink-0 text-lg text-indigo-500">output</span>
                      <div className="min-w-0 flex-1">
                        <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Feeds next stage</p>
                        <p className="text-xs font-semibold leading-snug text-indigo-700">{stage.output}</p>
                      </div>
                    </div>
                  </div>
                </article>
              ))}
            </div>

            <p className="mx-auto max-w-2xl text-center text-xs leading-relaxed text-slate-400">
              Retrieval runs first, generation second — that order is what keeps answers grounded in your documents.
            </p>
          </div>
        </section>

        {/* ── Core Capabilities — three equal features ── */}
        <section className="space-y-6">
          <div className="max-w-2xl space-y-2">
            <h2 className="text-2xl font-bold font-headline text-slate-900">Core Capabilities</h2>
            <p className="text-sm leading-relaxed text-slate-500">
              Three ways to work with your indexed documents — same pipeline, consistent design.
            </p>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 lg:gap-5">
            {[
              {
                title: 'Semantic Search',
                description:
                  'Understand meaning, not just keywords. Ask in plain language and surface the most relevant passages across your library.',
                icon: 'neurology',
                iconWrap: 'bg-indigo-100 text-indigo-700',
              },
              {
                title: 'Contextual Chat',
                description:
                  'Conversational Q&A grounded in your uploads, with inline citations you can verify in one click.',
                icon: 'forum',
                iconWrap: 'bg-cyan-100 text-cyan-700',
              },
              {
                title: 'Draft Generator',
                description:
                  'Turn templates and references into proposals, contracts, and reports — export when you are ready.',
                icon: 'history_edu',
                iconWrap: 'bg-violet-100 text-violet-700',
              },
            ].map((cap) => (
              <div
                key={cap.title}
                className="flex h-full flex-col rounded-2xl border border-slate-200/80 bg-white p-6 shadow-sm transition-shadow hover:shadow-md"
              >
                <div
                  className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl ${cap.iconWrap}`}
                >
                  <span className="material-symbols-outlined text-2xl">{cap.icon}</span>
                </div>
                <h3 className="mt-5 font-headline text-lg font-bold text-slate-900">{cap.title}</h3>
                <p className="mt-2 flex-1 text-sm leading-relaxed text-slate-600">{cap.description}</p>
              </div>
            ))}
          </div>
        </section>

        {/* ── Best Practices ── */}
        <section className="space-y-8">
          <h2 className="text-2xl font-bold font-headline text-slate-900">Best Practices</h2>
          <div className="grid gap-6 md:grid-cols-2">
            {bestPractices.map((tip) => (
              <div
                key={tip.number}
                className="flex items-start gap-5 rounded-xl bg-surface-container-lowest border border-outline-variant/10 p-6 shadow-sm"
              >
                <div className="w-12 h-12 shrink-0 rounded-xl bg-primary/10 flex items-center justify-center">
                  <span className="material-symbols-outlined text-primary text-xl">
                    {tip.icon}
                  </span>
                </div>
                <div className="space-y-1.5">
                  <h4 className="font-semibold text-slate-900">
                    <span className="text-primary mr-1.5">{tip.number}.</span>
                    {tip.title}
                  </h4>
                  <p className="text-sm text-slate-500 leading-relaxed">{tip.description}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ── CTA ── */}
        <section className="bg-primary-container text-on-primary-container rounded-3xl p-10 lg:p-14 text-center space-y-6">
          <h2 className="text-3xl lg:text-4xl font-extrabold font-headline tracking-tight">
            Get Started Now
          </h2>
          <p className="max-w-xl mx-auto text-base opacity-80 leading-relaxed">
            Upload your first document and experience AI-powered document intelligence — search,
            chat, and draft in minutes.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link
              to="/upload"
              className="inline-flex items-center gap-2 px-8 py-3.5 rounded-xl bg-primary text-white font-semibold shadow-lg hover:shadow-xl hover:brightness-110 transition-all"
            >
              <span className="material-symbols-outlined text-xl">upload_file</span>
              Upload Documents
            </Link>
            <button className="inline-flex items-center gap-2 px-8 py-3.5 rounded-xl border border-current font-semibold hover:bg-black/5 transition-colors">
              <span className="material-symbols-outlined text-xl">mail</span>
              Contact Sales
            </button>
          </div>
        </section>

        {/* ── Footer ── */}
        <footer className="text-center text-sm text-slate-400 pb-8">
          DocRAG — The Intelligent Layer &copy; 2024
        </footer>
      </div>
    </div>
  );
}
