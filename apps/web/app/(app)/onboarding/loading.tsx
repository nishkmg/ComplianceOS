export default function OnboardingLoading() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-lightest p-6" aria-busy="true" aria-label="Loading">
      <div className="w-full max-w-2xl space-y-6">
        <div className="flex items-center justify-center gap-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-10 w-10 rounded-full bg-lighter/50" />
          ))}
        </div>
        <div className="rounded-lg border border-border bg-surface p-8 shadow-sm">
          <div className="h-7 w-48 rounded bg-lighter/60" />
          <div className="mt-6 space-y-4">
            <div className="h-10 rounded-md bg-lighter/40" />
            <div className="h-10 rounded-md bg-lighter/40" />
          </div>
        </div>
      </div>
    </div>
  );
}
