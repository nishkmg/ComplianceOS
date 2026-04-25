// @ts-nocheck
import Link from 'next/link';

export function MarketingFooter() {
  const columns = [
    {
      title: 'Product',
      links: [
        { href: '/features/accounting', label: 'Accounting' },
        { href: '/features/gst', label: 'GST Filing' },
        { href: '/features/invoicing', label: 'Invoicing' },
        { href: '/features/payroll', label: 'Payroll' },
        { href: '/features/itr', label: 'ITR Returns' },
      ],
    },
    {
      title: 'Company',
      links: [
        { href: '/about', label: 'About' },
        { href: '/blog', label: 'Blog' },
        { href: '/pricing', label: 'Pricing' },
        { href: '/contact', label: 'Contact' },
      ],
    },
    {
      title: 'Legal',
      links: [
        { href: '/privacy', label: 'Privacy policy' },
        { href: '/terms', label: 'Terms of service' },
        { href: '/cookies', label: 'Cookie policy' },
        { href: '/security', label: 'Security' },
      ],
    },
  ];

  return (
    <footer className="bg-section-muted border-t border-hairline border-[#E8E4DC]">
      <div className="marketing-container py-16 pb-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
          {/* Column 1: Brand */}
          <div>
            <div className="font-display text-display-md text-dark mb-2">
              ComplianceOS
            </div>
            <p className="font-ui text-[14px] italic text-light mb-4">
              Built for Indian business.
            </p>
            <p className="font-ui text-[12px] text-light">
              © 2026 ComplianceOS. All rights reserved.
            </p>
          </div>

          {/* Link columns */}
          {columns.map((col) => (
            <div key={col.title}>
              <h4 className="font-ui text-[11px] font-medium text-light uppercase tracking-wider mb-4">
                {col.title}
              </h4>
              <ul className="space-y-3 list-none p-0 m-0">
                {col.links.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="font-ui text-[14px] text-mid hover:text-dark no-underline transition-colors"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </footer>
  );
}
