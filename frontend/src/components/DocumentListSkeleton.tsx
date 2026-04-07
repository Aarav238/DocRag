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
      className="relative bg-white rounded-2xl border border-neutral-200/60 p-5 shadow-sm animate-pulse"
      style={{ animationDelay: `${index * 100}ms` }}
    >
      <div className="flex items-center gap-4">
        {/* File icon placeholder */}
        <div className="w-12 h-12 rounded-xl bg-neutral-100" />

        {/* Text placeholders */}
        <div className="flex-1 min-w-0 space-y-2">
          <div className="h-4 bg-neutral-100 rounded-lg w-3/5" />
          <div className="h-3 bg-neutral-100 rounded-lg w-2/5" />
        </div>

        {/* Status badge placeholder */}
        <div className="h-7 w-16 bg-neutral-100 rounded-lg" />
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
