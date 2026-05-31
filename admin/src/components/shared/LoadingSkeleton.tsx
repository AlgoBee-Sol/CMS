interface LoadingSkeletonProps {
  rows?: number;
  cols?: number;
}

export default function LoadingSkeleton({ rows = 5, cols = 5 }: LoadingSkeletonProps) {
  return (
    <div className="rounded-xl border overflow-hidden" style={{ borderColor: "var(--color-neutral-200)" }}>
      <div className="px-4 py-3" style={{ background: "var(--color-neutral-50)", borderBottom: "1px solid var(--color-neutral-200)" }}>
        <div className="flex gap-4">
          {Array.from({ length: cols }).map((_, i) => (
            <div key={i} className="h-3 rounded flex-1 shimmer-shimmer" />
          ))}
        </div>
      </div>
      <div className="bg-white divide-y" style={{ borderColor: "var(--color-neutral-100)" }}>
        {Array.from({ length: rows }).map((_, i) => (
          <div key={i} className="px-4 py-3.5 flex gap-4">
            {Array.from({ length: cols }).map((_, j) => (
              <div
                key={j}
                className="h-3 rounded flex-1 shimmer-shimmer"
                style={{ animationDelay: `${(i * cols + j) * 50}ms` }}
              />
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}

export function CardSkeleton({ count = 4 }: { count?: number }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="card-base p-5 space-y-3">
          <div className="flex justify-between items-start">
            <div className="h-3 w-24 rounded shimmer-shimmer" />
            <div className="w-9 h-9 rounded-lg shimmer-shimmer" />
          </div>
          <div className="h-7 w-20 rounded shimmer-shimmer" />
          <div className="h-2.5 w-32 rounded shimmer-shimmer" />
        </div>
      ))}
    </div>
  );
}
