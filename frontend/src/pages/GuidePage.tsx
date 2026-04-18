import { Fragment } from 'react';
import { MarketingHeader } from '../components/MarketingHeader';
import { AuthAwareAppLink } from '../components/AuthAwareAppLink';

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
    summary: 'Each chunk is turned into a dense vector so "similar meaning" can be found even when wording differs.',
    output: 'Vector embeddings',
    icon: 'data_array',
    gradient: 'from-cyan-500 to-sky-600',
    shadow: 'shadow-cyan-200/80',
  },
  {
    step: 3,
    title: 'Index & search',
    summary: 'Vectors live in a fast index. At query time we pull the top matches — your private "semantic Google."',
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
    gradient: 'from-amber-500 to-orange-600',
    shadow: 'shadow-amber-200/80',
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
    <div className="flex flex-col min-h-screen bg-white dark:bg-background">
      <MarketingHeader showTryDemo={false} />

      <div className="mx-auto w-full max-w-5xl space-y-10 sm:space-y-16 px-4 sm:px-8 pb-6 sm:pb-8 pt-24 sm:pt-28 lg:px-12 lg:pb-12">
        {/* Hero */}
        <section className="space-y-6 animate-fade-in-up">
          <span className="inline-flex items-center gap-2 rounded-full bg-violet-50 px-4 py-1.5 text-sm font-bold text-violet-700 border border-violet-200/60">
            <span className="h-2 w-2 rounded-full bg-cyan-500 animate-pulse" />
            v2.0 — Intelligence Upgrade
          </span>
          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black font-headline tracking-tight text-neutral-900 leading-tight">
            Getting Started with{' '}
            <span className="text-gradient">DocRAG</span>
          </h1>
          <p className="max-w-2xl text-lg text-neutral-500 leading-relaxed">
            Upload reference documents, let the intelligence pipeline index them in seconds, then
            chat, search, and draft — all grounded in your own data with full source citations.
          </p>
        </section>

        {/* Quick Start Steps */}
        <section className="space-y-8">
          <h2 className="text-2xl font-black font-headline text-neutral-900">Quick Start</h2>
          <div className="grid gap-6 md:grid-cols-3 md:items-stretch">
            {quickStartSteps.map((step, i) => (
              <div
                key={step.number}
                className="relative flex flex-col h-full bg-white p-6 sm:p-8 rounded-2xl border border-neutral-200/60 shadow-sm group card-hover overflow-hidden animate-fade-in-up"
                style={{ animationDelay: `${i * 100}ms` }}
              >
                <span className="absolute -bottom-4 -right-2 text-[7rem] font-black leading-none text-neutral-100 dark:text-on-surface/[0.055] select-none pointer-events-none">
                  {step.number}
                </span>

                <div className="relative z-10 flex flex-col flex-1 min-h-0 gap-4">
                  <div className="w-14 h-14 rounded-xl bg-violet-50 border border-violet-100/50 flex items-center justify-center shrink-0">
                    <span className="material-symbols-outlined text-violet-500 text-3xl">{step.icon}</span>
                  </div>
                  <h3 className="text-lg font-bold text-neutral-900">{step.title}</h3>
                  <p className="text-sm text-neutral-500 leading-relaxed flex-1">{step.description}</p>

                  <div className="mt-auto pt-2 shrink-0">
                    {step.link ? (
                      <AuthAwareAppLink
                        to={step.link}
                        className="group/link inline-flex w-full items-center justify-between gap-2 rounded-xl border border-violet-200/50 bg-violet-50/50 px-4 py-3 text-sm font-bold text-violet-600 transition-colors hover:bg-violet-100/50"
                      >
                        <span>Go to {step.title}</span>
                        <span className="material-symbols-outlined text-lg transition-transform group-hover/link:translate-x-0.5">
                          arrow_forward
                        </span>
                      </AuthAwareAppLink>
                    ) : (
                      <div className="rounded-xl border border-violet-100 bg-violet-50/50 px-4 py-3">
                        <div className="flex items-center gap-2">
                          <span className="material-symbols-outlined text-violet-500 text-lg shrink-0">bolt</span>
                          <span className="text-sm font-bold text-neutral-800">Automatic indexing</span>
                        </div>
                        <div className="mt-3 flex items-center justify-between gap-1 text-[10px] font-bold uppercase tracking-wide text-violet-600/70" aria-hidden>
                          <span className="truncate">Extract</span>
                          <span className="text-violet-300">→</span>
                          <span className="truncate">Embed</span>
                          <span className="text-violet-300">→</span>
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

        {/* Technical Pipeline */}
        <section className="relative overflow-hidden rounded-2xl border border-neutral-200/60 dark:border-outline-variant bg-gradient-to-br from-neutral-50 via-white to-violet-50/30 dark:from-surface-container-low dark:via-surface-container dark:to-violet-500/10 p-4 shadow-sm sm:p-8 lg:p-10">
          <div className="pointer-events-none absolute -right-24 -top-24 h-64 w-64 rounded-full bg-violet-200/20 blur-[80px]" />
          <div className="pointer-events-none absolute -bottom-20 -left-16 h-56 w-56 rounded-full bg-cyan-200/15 blur-[80px]" />

          <div className="relative flex w-full flex-col gap-8 lg:gap-10">
            <div className="grid gap-6 lg:grid-cols-[1fr_minmax(0,280px)] lg:items-start lg:gap-10">
              <div className="min-w-0 space-y-3 text-left">
                <h2 className="font-headline text-2xl font-black tracking-tight text-neutral-900 lg:text-3xl">
                  The Intelligence Pipeline
                </h2>
                <p className="text-sm leading-relaxed text-neutral-500 lg:text-base">
                  Four stages turn raw files into answers you can trust: nothing is invented outside the
                  chunks we retrieve from your own library.
                </p>
              </div>
              <aside className="flex w-full flex-col justify-center rounded-xl border border-violet-100 bg-white px-4 py-3.5 text-left shadow-sm lg:shrink-0">
                <span className="text-[10px] font-bold uppercase tracking-wider text-violet-500">At a glance</span>
                <div className="mt-2 flex items-start gap-2.5">
                  <span className="material-symbols-outlined mt-0.5 shrink-0 text-emerald-600 text-[20px]">lock</span>
                  <p className="text-xs leading-snug text-neutral-600">
                    Your documents are not used to train public foundation models.
                  </p>
                </div>
              </aside>
            </div>

            {/* Flow strip — solid surface in dark so blurs behind do not read through label + chips */}
            <div className="relative z-[1] flex flex-col gap-3 rounded-xl border border-neutral-200/60 bg-white px-3 py-4 sm:gap-4 sm:px-5 sm:py-5 dark:border-outline-variant">
              <p className="shrink-0 text-center text-[10px] font-bold uppercase leading-normal tracking-[0.18em] text-neutral-400 dark:text-on-surface-variant">
                End-to-end flow
              </p>
              <div className="flex w-full min-w-0 items-center justify-center gap-0 overflow-x-auto [-webkit-overflow-scrolling:touch] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
                <div className="flex min-w-min items-center gap-1 sm:gap-1.5">
                  {['Files', 'Chunks', 'Vectors', 'Retrieval', 'Answer'].map((label, i) => (
                    <Fragment key={label}>
                      {i > 0 && (
                        <span className="material-symbols-outlined shrink-0 px-0.5 text-base text-neutral-300 sm:text-lg" aria-hidden>
                          chevron_right
                        </span>
                      )}
                      <span className="shrink-0 rounded-lg bg-violet-50 px-2.5 py-1 text-xs font-bold text-violet-700 ring-1 ring-violet-100/80 dark:ring-violet-500/35 sm:px-3 sm:text-sm">
                        {label}
                      </span>
                    </Fragment>
                  ))}
                </div>
              </div>
            </div>

            {/* Stage cards */}
            <div className="grid items-stretch gap-5 sm:grid-cols-2 lg:grid-cols-4 lg:gap-6">
              {pipelineStages.map((stage) => (
                <article
                  key={stage.step}
                  className="flex h-full min-h-0 flex-col rounded-2xl border border-neutral-200/60 bg-white p-5 shadow-sm transition-all duration-200 card-hover"
                >
                  <div className="mb-4 flex items-center justify-between gap-2">
                    <span className="inline-flex items-center rounded-lg bg-neutral-100 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-neutral-500">
                      Step {stage.step}
                    </span>
                  </div>
                  <div
                    className={`mb-4 flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br ${stage.gradient} shadow-lg ${stage.shadow} dark:shadow-[0_6px_20px_-10px_rgb(0_0_0_/_0.22)]`}
                  >
                    <span className="material-symbols-outlined text-2xl text-white" style={{ fontVariationSettings: "'FILL' 1" }}>
                      {stage.icon}
                    </span>
                  </div>
                  <h3 className="font-headline text-base font-bold leading-snug text-neutral-900">{stage.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-neutral-500">{stage.summary}</p>
                  <div className="mt-auto w-full">
                    <div className="h-px w-full shrink-0 bg-neutral-200" aria-hidden />
                    <div className="flex min-h-[4.75rem] items-start gap-3 pt-4">
                      <span className="material-symbols-outlined mt-0.5 shrink-0 text-lg text-violet-500">output</span>
                      <div className="min-w-0 flex-1">
                        <p className="text-[10px] font-bold uppercase tracking-wider text-neutral-400">Feeds next stage</p>
                        <p className="text-xs font-bold leading-snug text-violet-700">{stage.output}</p>
                      </div>
                    </div>
                  </div>
                </article>
              ))}
            </div>

            <p className="mx-auto max-w-2xl text-center text-xs leading-relaxed text-neutral-400">
              Retrieval runs first, generation second — that order is what keeps answers grounded in your documents.
            </p>
          </div>
        </section>

        {/* Core Capabilities */}
        <section className="space-y-6">
          <div className="max-w-2xl space-y-2">
            <h2 className="text-2xl font-black font-headline text-neutral-900">Core Capabilities</h2>
            <p className="text-sm leading-relaxed text-neutral-500">
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
                iconWrap: 'bg-violet-100 text-violet-700 border border-violet-200/50',
              },
              {
                title: 'Contextual Chat',
                description:
                  'Conversational Q&A grounded in your uploads, with inline citations you can verify in one click.',
                icon: 'forum',
                iconWrap: 'bg-cyan-100 text-cyan-700 border border-cyan-200/50',
              },
              {
                title: 'Draft Generator',
                description:
                  'Turn templates and references into proposals, contracts, and reports — export when you are ready.',
                icon: 'history_edu',
                iconWrap: 'bg-amber-100 text-amber-700 border border-amber-200/50',
              },
            ].map((cap) => (
              <div
                key={cap.title}
                className="flex h-full flex-col rounded-2xl border border-neutral-200/60 bg-white p-6 shadow-sm card-hover"
              >
                <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl ${cap.iconWrap}`}>
                  <span className="material-symbols-outlined text-2xl">{cap.icon}</span>
                </div>
                <h3 className="mt-5 font-headline text-lg font-bold text-neutral-900">{cap.title}</h3>
                <p className="mt-2 flex-1 text-sm leading-relaxed text-neutral-500">{cap.description}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Best Practices */}
        <section className="space-y-8">
          <h2 className="text-2xl font-black font-headline text-neutral-900">Best Practices</h2>
          <div className="grid gap-6 md:grid-cols-2">
            {bestPractices.map((tip, i) => (
              <div
                key={tip.number}
                className="flex items-start gap-5 rounded-2xl bg-white border border-neutral-200/60 p-6 shadow-sm card-hover animate-fade-in-up"
                style={{ animationDelay: `${i * 80}ms` }}
              >
                <div className="w-12 h-12 shrink-0 rounded-xl bg-violet-50 border border-violet-100/50 flex items-center justify-center">
                  <span className="material-symbols-outlined text-violet-500 text-xl">{tip.icon}</span>
                </div>
                <div className="space-y-1.5">
                  <h4 className="font-bold text-neutral-900">
                    <span className="text-violet-600 mr-1.5 font-black">{tip.number}.</span>
                    {tip.title}
                  </h4>
                  <p className="text-sm text-neutral-500 leading-relaxed">{tip.description}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* CTA */}
        <section className="rounded-2xl p-6 sm:p-10 lg:p-14 text-center space-y-6 relative overflow-hidden bg-gradient-to-br from-violet-50 via-white to-cyan-50 dark:from-violet-500/10 dark:via-surface-container dark:to-cyan-500/10 border border-violet-200/50 dark:border-violet-500/20">
          <div className="absolute inset-0 dot-grid opacity-30" />
          <div className="absolute -top-20 -right-20 w-64 h-64 rounded-full bg-violet-200/30 blur-[80px] pointer-events-none" />
          <div className="absolute -bottom-20 -left-20 w-56 h-56 rounded-full bg-cyan-200/20 blur-[80px] pointer-events-none" />
          <div className="relative">
            <h2 className="text-3xl lg:text-4xl font-black font-headline tracking-tight text-neutral-900">
              Get Started Now
            </h2>
            <p className="max-w-xl mx-auto text-base text-neutral-500 leading-relaxed mt-4">
              Upload your first document and experience AI-powered document intelligence — search,
              chat, and draft in minutes.
            </p>
            <div className="flex flex-wrap justify-center gap-4 mt-8">
              <AuthAwareAppLink
                to="/upload"
                className="inline-flex items-center gap-2 px-8 py-3.5 rounded-xl primary-gradient text-white font-bold shadow-lg shadow-violet-500/20 hover:shadow-xl hover:shadow-violet-500/25 hover:-translate-y-px transition-all"
              >
                <span className="material-symbols-outlined text-xl">upload_file</span>
                Upload Documents
              </AuthAwareAppLink>
              <a
                href="mailto:aarav8090shukla@gmail.com"
                className="inline-flex items-center gap-2 px-8 py-3.5 rounded-xl border border-neutral-200 bg-white font-bold hover:border-violet-300 hover:bg-violet-50/50 transition-all text-neutral-700 shadow-sm"
              >
                <span className="material-symbols-outlined text-xl text-violet-500">mail</span>
                Contact
              </a>
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer className="text-center text-sm text-neutral-400 pb-8 font-medium">
          DocRAG — The Intelligent Layer &copy; {new Date().getFullYear()}
        </footer>
      </div>
    </div>
  );
}
