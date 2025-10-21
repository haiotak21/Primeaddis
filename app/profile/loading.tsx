export default function Loading() {
  return (
    <div className="mx-auto max-w-2xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="h-16 w-16 animate-pulse rounded-full bg-muted mb-4" />
      <div className="h-8 w-56 animate-pulse rounded bg-muted mb-2" />
      <div className="h-4 w-80 animate-pulse rounded bg-muted mb-4" />
      <div className="space-y-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="h-10 animate-pulse rounded bg-muted" />
        ))}
      </div>
    </div>
  );
}
