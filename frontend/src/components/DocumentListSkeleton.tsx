/**
 * Skeleton placeholder shown while documents are loading.
 * Matches the layout of DocumentList cards so the transition feels seamless.
 */

interface DocumentListSkeletonProps {
  count?: number;
  compact?: boolean;
}

function SkeletonCard({ index }: { index: number }) {
  return (
    <div
      className="relative min-w-0 animate-pulse rounded-2xl border border-neutral-200/60 bg-white p-5 shadow-sm"
      style={{ animationDelay: `${index * 100}ms` }}
    >
      <div className="flex min-w-0 flex-col gap-3 sm:flex-row sm:items-center sm:gap-4">
        <div className="flex min-w-0 flex-1 items-center gap-4">
          <div className="h-12 w-12 shrink-0 rounded-xl bg-neutral-100" />
          <div className="min-w-0 flex-1 space-y-2">
            <div className="h-4 w-3/5 rounded-lg bg-neutral-100" />
            <div className="h-3 w-2/5 rounded-lg bg-neutral-100" />
          </div>
        </div>
        <div className="flex w-full items-center justify-between gap-2 border-t border-neutral-200/60 pt-3 sm:w-auto sm:border-t-0 sm:pt-0">
          <div className="h-7 w-20 shrink-0 rounded-lg bg-neutral-100" />
          <div className="flex shrink-0 gap-1.5">
            <div className="h-9 w-9 rounded-lg bg-neutral-100" />
            <div className="h-9 w-9 rounded-lg bg-neutral-100" />
            <div className="h-9 w-9 rounded-lg bg-neutral-100" />
          </div>
        </div>
      </div>
    </div>
  );
}

function CompactSkeletonCard({ index }: { index: number }) {
  return (
    <div
      className="rounded-xl border border-neutral-100 bg-white p-3 animate-pulse"
      style={{ animationDelay: `${index * 80}ms` }}
    >
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 rounded-lg bg-neutral-100 flex-shrink-0" />
        <div className="flex-1 min-w-0 space-y-1.5">
          <div className="h-3.5 bg-neutral-100 rounded-md w-4/5" />
          <div className="h-2.5 bg-neutral-100 rounded-md w-2/5" />
        </div>
      </div>
    </div>
  );
}

export function DocumentListSkeleton({ count = 3, compact = false }: DocumentListSkeletonProps) {
  const items = Array.from({ length: count }, (_, i) => i);

  if (compact) {
    return (
      <div className="space-y-1.5">
        {items.map((i) => (
          <CompactSkeletonCard key={i} index={i} />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {items.map((i) => (
        <SkeletonCard key={i} index={i} />
      ))}
    </div>
  );
}
