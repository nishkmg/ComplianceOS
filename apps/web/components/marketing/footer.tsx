import Link from 'next/link';

const footerLink = "text-mid hover:text-amber hover:underline decoration-amber underline-offset-4 transition-colors no-underline";

const COLUMNS: Array<{ title: string; links: Array<{ href: string; label: string }> }> = [
  {
    title: 'Product',
    links: [
      { href: '/features', label: 'Features' },
      { href: '/pricing', label: 'Pricing' },
      { href: '/calculators', label: 'Calculators' },
      { href: '/demo', label: 'Book a Demo' },
    ],
  },
  {
    title: 'Company',
    links: [
      { href: '/about', label: 'About' },
      { href: '/blog', label: 'Blog' },
      { href: '/contact', label: 'Contact' },
    ],
  },
  {
    title: 'Legal',
    links: [
      { href: '/privacy', label: 'Privacy' },
      { href: '/terms', label: 'Terms' },
      { href: '/cookies', label: 'Cookies' },
    ],
  },
];

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

        {COLUMNS.map((col) => (
          <div key={col.title}>
            <h4 className="font-semibold text-dark mb-6 uppercase tracking-wider text-ui-xs">{col.title}</h4>
            <ul className="space-y-4 list-none p-0">
              {col.links.map((l) => (
                <li key={l.href}>
                  <Link className={footerLink} href={l.href}>{l.label}</Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </footer>
  );
}
