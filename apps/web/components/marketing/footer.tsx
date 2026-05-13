import Link from 'next/link';

export function MarketingFooter() {
  return (
    <footer className="w-full py-24 border-t-[0.5px] border-border-subtle bg-page-bg font-ui text-sm">
      <div className="max-w-[1200px] mx-auto px-8 grid grid-cols-2 md:grid-cols-4 gap-12">
        <div className="col-span-2 md:col-span-1">
          <Link href="/" className="text-lg font-bold text-dark dark:text-stone-50 mb-4 block opacity-100 hover:opacity-80 transition-opacity no-underline">
            ComplianceOS
          </Link>
          <p className="text-mid dark:text-mid">© 2024 ComplianceOS. Precision in Indian Accounting.</p>
        </div>
        
        <div>
          <h4 className="font-semibold text-dark dark:text-stone-50 mb-6 uppercase tracking-wider text-[11px]">Product</h4>
          <ul className="space-y-4 list-none p-0">
            <li><Link className="text-mid dark:text-mid hover:text-amber hover:underline decoration-amber underline-offset-4 transition-all no-underline" href="/features">Features</Link></li>
            <li><Link className="text-mid dark:text-mid hover:text-amber hover:underline decoration-amber underline-offset-4 transition-all no-underline" href="/pricing">Pricing</Link></li>
            <li><Link className="text-mid dark:text-mid hover:text-amber hover:underline decoration-amber underline-offset-4 transition-all no-underline" href="/security">Security</Link></li>
            <li><Link className="text-mid dark:text-mid hover:text-amber hover:underline decoration-amber underline-offset-4 transition-all no-underline" href="/api">API</Link></li>
          </ul>
        </div>

        <div>
          <h4 className="font-semibold text-dark dark:text-stone-50 mb-6 uppercase tracking-wider text-[11px]">Company</h4>
          <ul className="space-y-4 list-none p-0">
            <li><Link className="text-mid dark:text-mid hover:text-amber hover:underline decoration-amber underline-offset-4 transition-all no-underline" href="/about">About</Link></li>
            <li><Link className="text-mid dark:text-mid hover:text-amber hover:underline decoration-amber underline-offset-4 transition-all no-underline" href="/careers">Careers</Link></li>
            <li><Link className="text-mid dark:text-mid hover:text-amber hover:underline decoration-amber underline-offset-4 transition-all no-underline" href="/press">Press</Link></li>
            <li><Link className="text-mid dark:text-mid hover:text-amber hover:underline decoration-amber underline-offset-4 transition-all no-underline" href="/blog">Blog</Link></li>
          </ul>
        </div>

        <div>
          <h4 className="font-semibold text-dark dark:text-stone-50 mb-6 uppercase tracking-wider text-[11px]">Legal & Support</h4>
          <ul className="space-y-4 list-none p-0">
            <li><Link className="text-mid dark:text-mid hover:text-amber hover:underline decoration-amber underline-offset-4 transition-all no-underline" href="/privacy">Privacy</Link></li>
            <li><Link className="text-mid dark:text-mid hover:text-amber hover:underline decoration-amber underline-offset-4 transition-all no-underline" href="/terms">Terms</Link></li>
            <li><Link className="text-mid dark:text-mid hover:text-amber hover:underline decoration-amber underline-offset-4 transition-all no-underline" href="/compliance">Compliance</Link></li>
            <li><Link className="text-mid dark:text-mid hover:text-amber hover:underline decoration-amber underline-offset-4 transition-all no-underline" href="/contact">Contact</Link></li>
          </ul>
        </div>
      </div>
    </footer>
  );
}
