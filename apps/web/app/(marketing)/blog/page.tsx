'use client';

import Link from 'next/link';
import { MarketingNav } from '@/components/marketing/nav';
import { MarketingFooter } from '@/components/marketing/footer';

const posts = [
  { slug: 'gst-filing-deadlines', category: 'GST', title: 'GST Filing Deadlines for FY 2026-27', excerpt: 'Every due date for GSTR-1, 2B, and 3B this financial year. Bookmark this.', author: 'ComplianceOS Team', date: '25 Apr 2026', image: '/images/homepage/hero-dashboard.jpg' },
  { slug: 'old-vs-new-regime', category: 'ITR', title: 'Old vs New Tax Regime: Compare Using Your Books', excerpt: 'Use your actual P&L to decide, not a generic calculator. Here is how the numbers differ.', author: 'Neha Sharma', date: '18 Apr 2026', image: '/images/homepage/hero-dashboard.jpg' },
  { slug: 'indian-numbering', category: 'Accounting', title: 'Why Indian Numbering is Not a Formatting Preference', excerpt: 'Lakhs and crores are how Indian business owners think about money. Your software should too.', author: 'Vikram Patel', date: '10 Apr 2026', image: '/images/homepage/hero-dashboard.jpg' },
  { slug: 'moving-from-tally', category: 'Guides', title: 'Moving from Tally: A Practical Migration Guide', excerpt: 'What to expect, what to prepare, and how long it really takes. Based on real migrations.', author: 'Aarav Mehta', date: '5 Apr 2026', image: '/images/homepage/hero-dashboard.jpg' },
  { slug: 'payroll-auto-calc', category: 'Payroll', title: 'Automating PF, ESI, PT and TDS Calculations', excerpt: 'How we calculate statutory components automatically so you never miss a compliance deadline.', author: 'Priya Sharma', date: '28 Mar 2026', image: '/images/homepage/hero-dashboard.jpg' },
  { slug: 'audit-trail-mca', category: 'Audit', title: 'MCA-Compliant Audit Trails: What Changed in 2025', excerpt: 'The MCA mandate for audit trails is here. Here is how ComplianceOS handles it.', author: 'Rajiv Desai', date: '15 Mar 2026', image: '/images/homepage/hero-dashboard.jpg' },
];

export default function BlogIndexPage() {
  const featured = posts[0];

  return (
    <div className="bg-page-bg text-dark min-h-screen">
      <MarketingNav />
      <main className="max-w-[1320px] mx-auto px-8">
        {/* Featured Post */}
        <section className="pt-space-128 pb-space-96">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-0 bg-white overflow-hidden border border-border-subtle">
            <div className="relative h-[400px] md:h-auto overflow-hidden">
              <img className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 hover:scale-105" src="https://images.unsplash.com/photo-1450101499163-c8848c66ca85?w=800" alt="" />
            </div>
            <div className="flex flex-col justify-center p-12 text-left">
              <span className="text-ui-xs font-ui-xs text-amber-text uppercase tracking-widest mb-4">{featured.category}</span>
              <Link href={`/blog/${featured.slug}`} className="no-underline group">
                <h1 className="font-display-xl text-display-xl text-dark mb-4 group-hover:text-primary transition-colors">{featured.title}</h1>
              </Link>
              <p className="font-ui-md text-ui-md text-mid leading-relaxed mb-6">{featured.excerpt}</p>
              <div className="flex items-center justify-between">
                <span className="text-ui-xs text-light">{featured.author} · {featured.date}</span>
                <Link href={`/blog/${featured.slug}`} className="text-ui-xs text-amber-text font-bold uppercase tracking-wider hover:underline no-underline">Read →</Link>
              </div>
            </div>
          </div>
        </section>

        {/* Newsletter */}
        <section className="border-b-[0.5px] border-border-subtle pb-space-48 mb-space-48">
          <div className="bg-section-muted p-8 flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="text-left">
              <h3 className="font-display-md text-display-md text-dark font-normal">Stay ahead of compliance changes.</h3>
              <p className="text-ui-sm text-ui-sm text-mid mt-1">Get our weekly newsletter straight to your inbox.</p>
            </div>
            <div className="flex gap-2">
              <input className="border border-border-subtle bg-white px-4 py-3 font-ui-sm text-ui-sm w-full md:w-80 focus:outline-none focus:border-primary" placeholder="professional@firm.com" type="email" />
              <button className="bg-on-surface text-white px-8 py-3 font-ui-xs uppercase tracking-widest whitespace-nowrap hover:bg-primary transition-colors cursor-pointer border-none">Subscribe</button>
            </div>
          </div>
        </section>

        {/* Blog Grid */}
        <section className="pb-space-128">
          <div className="flex justify-between items-end mb-12 border-b-2 border-border-subtle pb-4">
            <h2 className="font-display-xl">Latest Despatches</h2>
            <div className="hidden md:flex gap-6 font-ui-xs text-light uppercase tracking-widest">
              <button className="text-dark font-bold cursor-pointer border-none bg-transparent">All</button>
              <button className="hover:text-dark cursor-pointer border-none bg-transparent">Taxation</button>
              <button className="hover:text-dark cursor-pointer border-none bg-transparent">Audit</button>
              <button className="hover:text-dark cursor-pointer border-none bg-transparent">Payroll</button>
              <button className="hover:text-dark cursor-pointer border-none bg-transparent">SME Guide</button>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-x-8 gap-y-16">
            {posts.slice(1).map((post) => (
              <article key={post.slug} className="group text-left">
                <div className="aspect-[16/10] overflow-hidden mb-6 bg-white border border-border-subtle">
                  <img className="w-full h-full object-cover grayscale group-hover:grayscale-0 group-hover:scale-105 transition-all duration-500" src="https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?w=400" alt="" />
                </div>
                <span className="text-ui-xs font-ui-xs text-amber-text uppercase tracking-widest">{post.category}</span>
                <Link href={`/blog/${post.slug}`} className="no-underline">
                  <h3 className="font-display-lg text-display-lg text-dark mt-2 mb-3 group-hover:text-primary transition-colors">{post.title}</h3>
                </Link>
                <p className="font-ui-sm text-ui-sm text-mid mb-4 leading-relaxed">{post.excerpt}</p>
                <span className="text-ui-xs text-light">{post.author} · {post.date}</span>
              </article>
            ))}
          </div>
        </section>
      </main>
      <MarketingFooter />
    </div>
  );
}
