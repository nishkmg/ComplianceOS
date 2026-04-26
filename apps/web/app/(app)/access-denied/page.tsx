// @ts-nocheck
import Link from "next/link";

export default function AccessDeniedPage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-6">
      <div className="w-16 h-16 rounded-full bg-error/10 flex items-center justify-center">
        <svg className="w-8 h-8 text-error" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
        </svg>
      </div>
      <h1 className="font-display text-[26px] font-normal text-dark">Access Denied</h1>
      <p className="font-ui text-[13px] text-light text-center max-w-md">
        You do not have the required permissions to access this page. Please contact your administrator if you believe this is an error.
      </p>
      <div className="flex gap-3">
        <Link href="/dashboard" className="filter-tab active">Go to Dashboard</Link>
        <Link href="/" className="filter-tab">Back to Home</Link>
      </div>
    </div>
  );
}
