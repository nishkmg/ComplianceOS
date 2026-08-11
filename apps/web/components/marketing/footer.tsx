import Link from 'next/link';

export function MarketingFooter() {
  return (
    <footer className="w-full py-24 border-t-[0.5px] border-border-subtle bg-page-bg font-ui text-sm">
      <div className="max-w-page mx-auto px-8 grid grid-cols-2 md:grid-cols-4 gap-12">
        <div className="col-span-2 md:col-span-1">
          <Link href="/" className="text-lg font-bold text-dark mb-4 block opacity-100 hover:opacity-80 transition-opacity no-underline">
            Arthvahi
          </Link>
          <p className="text-mid">© 2026 Arthvahi. Precision in Indian Accounting.</p>
        </div>
        
        <div>
          <h4 className="font-semibold text-dark mb-6 uppercase tracking-wider text-ui-xs">Product</h4>
          <ul className="space-y-4 list-none p-0">
            <li><Link className="text-mid hover:text-amber hover:underline decoration-amber underline-offset-4 transition-colors no-underline" href="/features">Features</Link></li>
            <li><Link className="text-mid hover:text-amber hover:underline decoration-amber underline-offset-4 transition-colors no-underline" href="/pricing">Pricing</Link></li>
            <li><Link className="text-mid hover:text-amber hover:underline decoration-amber underline-offset-4 transition-colors no-underline" href="/security">Security</Link></li>
            <li><Link className="text-mid hover:text-amber hover:underline decoration-amber underline-offset-4 transition-colors no-underline" href="/features">Product</Link></li>
          </ul>
        </div>

        <div>
          <h4 className="font-semibold text-dark mb-6 uppercase tracking-wider text-ui-xs">Company</h4>
          <ul className="space-y-4 list-none p-0">
            <li><Link className="text-mid hover:text-amber hover:underline decoration-amber underline-offset-4 transition-colors no-underline" href="/about">About</Link></li>
            <li><Link className="text-mid hover:text-amber hover:underline decoration-amber underline-offset-4 transition-colors no-underline" href="/about">About</Link></li>
            <li><Link className="text-mid hover:text-amber hover:underline decoration-amber underline-offset-4 transition-colors no-underline" href="/blog">Blog</Link></li>
            <li><Link className="text-mid hover:text-amber hover:underline decoration-amber underline-offset-4 transition-colors no-underline" href="/blog">Blog</Link></li>
          </ul>
        </div>

        <div>
          <h4 className="font-semibold text-dark mb-6 uppercase tracking-wider text-ui-xs">Legal & Support</h4>
          <ul className="space-y-4 list-none p-0">
            <li><Link className="text-mid hover:text-amber hover:underline decoration-amber underline-offset-4 transition-colors no-underline" href="/privacy">Privacy</Link></li>
            <li><Link className="text-mid hover:text-amber hover:underline decoration-amber underline-offset-4 transition-colors no-underline" href="/terms">Terms</Link></li>
            <li><Link className="text-mid hover:text-amber hover:underline decoration-amber underline-offset-4 transition-colors no-underline" href="/security">Security</Link></li>
            <li><Link className="text-mid hover:text-amber hover:underline decoration-amber underline-offset-4 transition-colors no-underline" href="/contact">Contact</Link></li>
          </ul>
        </div>
      </div>
    </footer>
  );
}
