export const dynamic = "force-dynamic";

export default function OnboardingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="mx-auto max-w-5xl px-6 py-12">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Welcome to ComplianceOS</h1>
          <p className="mt-2 text-gray-600">
            Let&apos;s set up your business for compliance success
          </p>
        </div>
        {children}
      </div>
    </div>
  );
}
