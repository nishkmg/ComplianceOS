/**
 * (app) segment loading state — layout-shaped skeletons so route streaming
 * feels intentional instead of a blank flash. Mirrors the shell: topbar,
 * sidebar, main content skeleton.
 */
export default function AppLoading() {
  return (
    <div className="min-h-screen bg-lightest" aria-busy="true" aria-label="Loading">
      {/* Topbar placeholder */}
      <div className="fixed top-0 z-50 flex h-14 w-full items-center justify-between bg-sidebar px-6">
        <div className="h-4 w-32 rounded bg-lighter/30" />
        <div className="flex items-center gap-3">
          <div className="h-8 w-8 rounded-full bg-lighter/30" />
          <div className="hidden h-4 w-24 rounded bg-lighter/30 md:block" />
        </div>
      </div>

      {/* Sidebar placeholder (desktop) */}
      <aside className="fixed inset-y-0 left-0 z-40 hidden w-64 border-r border-border-subtle bg-sidebar p-4 pt-16 lg:block">
        <div className="space-y-6">
          <div className="h-4 w-24 rounded bg-lighter/30" />
          <div className="space-y-2">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="h-4 rounded bg-lighter/20" style={{ width: `${100 - i * 8}%` }} />
            ))}
          </div>
        </div>
      </aside>

      {/* Main skeleton */}
      <main className="relative min-h-screen p-6 pt-20 lg:ml-64">
        <div className="max-w-5xl">
          <div className="h-6 w-56 rounded bg-lighter/70" />
          <div className="mt-2 h-3 w-96 max-w-full rounded bg-lighter/50" />
          <div className="mt-8 grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="h-28 rounded-lg border border-border bg-surface p-5">
                <div className="h-3 w-24 rounded bg-lighter/60" />
                <div className="mt-4 h-6 w-32 rounded bg-lighter/70" />
              </div>
            ))}
          </div>
          <div className="mt-8 h-64 rounded-lg border border-border bg-surface" />
        </div>
      </main>
    </div>
  );
}
