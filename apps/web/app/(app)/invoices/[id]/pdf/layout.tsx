export default function InvoicePdfLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-surface-muted">
      <div className="py-6">
        {children}
      </div>
    </div>
  );
}
