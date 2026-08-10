export default function MarketingLoading() {
  return (
    <div className="min-h-screen bg-lightest" aria-busy="true" aria-label="Loading">
      <div className="mx-auto max-w-page px-6 pt-24">
        <div className="h-10 w-2/3 max-w-xl rounded bg-lighter/50" />
        <div className="mt-4 h-4 w-1/2 max-w-md rounded bg-lighter/40" />
        <div className="mt-12 grid grid-cols-1 gap-6 md:grid-cols-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="h-40 rounded-lg border border-border bg-surface" />
          ))}
        </div>
      </div>
    </div>
  );
}
