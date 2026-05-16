export const dynamic = "force-dynamic";

export default function OnboardingLayout({ children }: { children: React.ReactNode }) {
  return <div className="min-h-screen bg-surface-muted">{children}</div>;
}
