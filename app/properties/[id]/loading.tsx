export default function Loading() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="grid gap-8 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-4">
          <div className="h-96 animate-pulse rounded bg-muted" />
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="h-24 animate-pulse rounded bg-muted" />
            ))}
          </div>
          <div className="h-64 animate-pulse rounded bg-muted" />
        </div>
        <div className="lg:col-span-1">
          <div className="h-80 animate-pulse rounded bg-muted" />
        </div>
      </div>
    </div>
  );
}
