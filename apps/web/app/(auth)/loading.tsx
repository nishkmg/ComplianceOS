export default function AuthLoading() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-lightest p-6" aria-busy="true" aria-label="Loading">
      <div className="w-full max-w-[440px] rounded-lg border border-border bg-surface p-8 shadow-sm">
        <div className="h-6 w-32 rounded bg-lighter/60" />
        <div className="mt-6 space-y-3">
          <div className="h-10 rounded-md bg-lighter/40" />
          <div className="h-10 rounded-md bg-lighter/40" />
        </div>
        <div className="mt-6 h-10 rounded-md bg-lighter/60" />
      </div>
    </div>
  );
}
