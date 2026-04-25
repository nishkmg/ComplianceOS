// @ts-nocheck
'use client';

import Link from 'next/link';
import { MarketingNav } from '@/components/marketing/nav';
import { MarketingFooter } from '@/components/marketing/footer';
import { SectionLabel } from '@/components/marketing/section-label';

const posts = [
  { slug: 'moving-from-tally-to-complianceos', category: 'Guides', title: 'Moving from Tally to ComplianceOS: A Practical Guide', excerpt: 'What to expect, what to prepare, and how long it really takes. Based on actual migrations.', author: 'Aarav Mehta', date: '15 Apr 2026' },
  { slug: 'gstr-3b-deadlines-fy-2026', category: 'GST', title: 'GSTR-3B Deadlines for FY 2026-27: Every Due Date in One Place', excerpt: 'Monthly and quarterly filing deadlines for the current financial year. Bookmark this.', author: 'ComplianceOS Team', date: '10 Apr 2026' },
  { slug: 'old-vs-new-tax-regime', category: 'ITR', title: 'Old vs New Tax Regime: Which One Saves You More?', excerpt: 'Use your actual books to compare — not a generic calculator. Here is how the numbers differ for a typical SME.', author: 'Neha Sharma', date: '5 Apr 2026' },
  { slug: 'indian-numbering-system-accounting', category: 'Accounting', title: 'Why Indian Numbering Matters in Accounting Software', excerpt: 'Lakhs and crores are not a formatting preference. They are how business owners actually think about money.', author: 'Vikram Patel', date: '1 Apr 2026' },
];

export default function BlogIndexPage() {
  const featured = posts[0];

  return (
    <div className="bg-page-bg min-h-screen" style={{ paddingTop: '64px' }}>
      <MarketingNav />
      <main id="main-content">
        <section className="py-24 md:py-32">
          <div className="marketing-container">
            <SectionLabel>Blog</SectionLabel>
            <h1 className="font-display text-[36px] md:text-[48px] font-normal text-dark leading-[1.15] mb-12">
              Insights for Indian business owners.
            </h1>

            {/* Featured post */}
            <Link href={`/blog/${featured.slug}`} className="block bg-surface border border-[#E8E4DC] rounded-lg overflow-hidden mb-12 no-underline group hover:shadow-card transition-shadow">
              <div className="grid grid-cols-1 md:grid-cols-2">
                <div className="bg-section-muted min-h-[200px] flex items-center justify-center">
                  <span className="font-ui text-ui-xs text-light">Featured image placeholder</span>
                </div>
                <div className="p-8">
                  <span className="font-ui text-[11px] font-medium text-amber-text uppercase tracking-wider">{featured.category}</span>
                  <h2 className="font-display text-display-lg text-dark mt-2 mb-3 group-hover:text-amber transition-colors">{featured.title}</h2>
                  <p className="font-ui text-[14px] text-mid mb-4">{featured.excerpt}</p>
                  <div className="flex items-center gap-2 font-ui text-[12px] text-light">
                    <span>{featured.author}</span>
                    <span>·</span>
                    <span>{featured.date}</span>
                  </div>
                </div>
              </div>
            </Link>

            {/* Post grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {posts.slice(1).map((post) => (
                <Link key={post.slug} href={`/blog/${post.slug}`} className="block bg-surface border border-[#E8E4DC] rounded-lg p-6 no-underline group hover:shadow-card transition-shadow">
                  <span className="font-ui text-[11px] font-medium text-amber-text uppercase tracking-wider">{post.category}</span>
                  <h3 className="font-display text-display-md text-dark mt-2 mb-3 group-hover:text-amber transition-colors line-clamp-2">{post.title}</h3>
                  <p className="font-ui text-[14px] text-mid mb-4 line-clamp-3">{post.excerpt}</p>
                  <div className="flex items-center gap-2 font-ui text-[12px] text-light">
                    <span>{post.author}</span>
                    <span>·</span>
                    <span>{post.date}</span>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      </main>
      <MarketingFooter />
    </div>
  );
}
