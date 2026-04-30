import '@/app/globals.css';

export default function MarketingLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <a href="#main-content" className="skip-link">Skip to main content</a>
      {children}
    </>
  );
}
