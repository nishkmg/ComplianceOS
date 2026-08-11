export default function SettingsLoading() {
  return (
    <div className="space-y-10 text-left">
      <div className="h-8 w-64 rounded bg-surface-muted animate-pulse" />
      <div className="h-4 w-96 rounded bg-surface-muted animate-pulse" />
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        {[0, 1, 2, 3].map((i) => (
          <div key={i} className="h-40 rounded-md border border-border bg-surface animate-pulse" />
        ))}
      </div>
    </div>
  );
}
