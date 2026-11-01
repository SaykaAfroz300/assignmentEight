/** Branded equal-height skeleton loader cards for asynchronous studio grid fetches. */
export default function StudioCardSkeleton({ count = 6 }: { count?: number }) {
  return (
    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="card-surface flex h-full flex-col overflow-hidden p-3.5">
          <div className="skeleton-brand aspect-[16/10] w-full rounded-2xl" />
          <div className="flex flex-1 flex-col justify-between gap-4 p-3 pt-4">
            <div className="space-y-3">
              <div className="flex items-center justify-between gap-2">
                <div className="skeleton-brand h-6 w-28 rounded-full" />
                <div className="skeleton-brand h-6 w-16 rounded-full" />
              </div>
              <div className="skeleton-brand h-6 w-5/6" />
              <div className="skeleton-brand h-4 w-2/3" />
            </div>
            <div className="flex items-center justify-between border-t border-base-content/10 pt-4">
              <div className="skeleton-brand h-7 w-24" />
              <div className="skeleton-brand h-10 w-32 rounded-full" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

