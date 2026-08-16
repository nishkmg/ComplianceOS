"use client";

import Link from 'next/link';
import { useState } from 'react';
import { MarketingNav } from '@/components/marketing/nav';
import { MarketingFooter } from '@/components/marketing/footer';
import { MarketingButton } from '@/components/marketing/button';
import { blogPosts as posts } from "@/lib/blog-posts";

const CATEGORIES = ['All', 'GST', 'ITR', 'Accounting', 'Payroll', 'Guides', 'Audit'];

const CATEGORY_IMAGE: Record<string, string> = {
  GST: '/images/marketing/gst-hub.png',
  ITR: '/images/marketing/itr-returns.png',
  Accounting: '/images/marketing/journal.png',
  Payroll: '/images/marketing/invoices.png',
  Guides: '/images/marketing/dashboard.png',
  Audit: '/images/marketing/gstr1.png',
};

function imageFor(category: string) {
  return CATEGORY_IMAGE[category] ?? '/images/marketing/dashboard.png';
}

export default function BlogIndexPage() {
  const [activeCategory, setActiveCategory] = useState('All');
  const featured = posts[0];
  const visiblePosts =
    activeCategory === 'All' ? posts : posts.filter((p) => p.category === activeCategory);

  return (
    <div className="bg-page-bg text-dark font-ui antialiased min-h-screen">
      <MarketingNav />
      <main id="main-content" className="max-w-[1320px] mx-auto px-8">
        {/* Featured post: wide split card */}
        <section className="pt-space-128 pb-space-64">
          <div className="grid grid-cols-1 md:grid-cols-2 bg-surface border border-border-subtle overflow-hidden">
            <div className="relative h-[320px] md:h-auto overflow-hidden">
              <img
                className="absolute inset-0 w-full h-full object-cover"
                src={imageFor(featured.category)}
                alt={`Cover image for ${featured.title}`}
              />
            </div>
            <div className="flex flex-col justify-center p-12 text-left">
              <span className="font-mono text-ui-2xs uppercase tracking-[0.22em] text-amber mb-4">
                {featured.category}
              </span>
              <Link href={`/blog/${featured.slug}`} className="no-underline group">
                <h1 className="font-display text-display-xl text-dark mb-4 leading-tight text-balance group-hover:text-amber transition-colors">
                  {featured.title}
                </h1>
              </Link>
              <p className="font-ui text-ui-sm text-mid leading-relaxed mb-6">
                {featured.excerpt}
              </p>
              <div className="flex items-center justify-between">
                <span className="font-mono text-ui-xs text-light">
                  {featured.author} · {featured.date}
                </span>
                <Link
                  href={`/blog/${featured.slug}`}
                  className="text-ui-xs font-mono uppercase tracking-wider text-amber hover:underline no-underline"
                >
                  Read →
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* Newsletter strip */}
        <section className="border-b border-border-subtle pb-space-48 mb-space-48">
          <div className="bg-section-muted p-8 flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="text-left">
              <h2 className="font-display text-display-lg text-dark">Stay ahead of compliance changes.</h2>
              <p className="text-ui-sm text-mid mt-1">
                Questions about a deadline or a workflow? Write to us, we answer.
              </p>
            </div>
            <MarketingButton href="/contact" variant="secondary">
              Talk to us
            </MarketingButton>
          </div>
        </section>

        {/* Post grid */}
        <section className="pb-space-128">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 mb-12 border-b-2 border-border-subtle pb-4">
            <h2 className="font-display text-display-xl text-dark">Latest Despatches</h2>
            <div
              role="group"
              aria-label="Filter posts by category"
              className="flex flex-wrap gap-x-6 gap-y-2 font-mono text-ui-xs uppercase tracking-widest text-light"
            >
              {CATEGORIES.map((cat) => (
                <button
                  key={cat}
                  type="button"
                  aria-pressed={activeCategory === cat}
                  onClick={() => setActiveCategory(cat)}
                  className={`cursor-pointer border-none bg-transparent p-0 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-amber transition-colors ${
                    activeCategory === cat ? 'text-dark font-bold' : 'hover:text-dark'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-12 gap-x-8 gap-y-16">
            {visiblePosts.slice(1).map((post, i) => {
              const wide = i % 2 === 0;
              return (
                <article
                  key={post.slug}
                  className={`group text-left ${wide ? 'md:col-span-7' : 'md:col-span-5'}`}
                >
                  <div
                    className={`overflow-hidden mb-6 bg-section-muted border border-border-subtle ${
                      wide ? 'aspect-[16/9]' : 'aspect-[4/3]'
                    }`}
                  >
                    <img
                      className="w-full h-full object-cover grayscale group-hover:grayscale-0 group-hover:scale-105 transition-[filter,transform] duration-500"
                      src={imageFor(post.category)}
                      alt={`Cover image for ${post.title}`}
                    />
                  </div>
                  <span className="font-mono text-ui-2xs uppercase tracking-[0.22em] text-amber">
                    {post.category}
                  </span>
                  <Link href={`/blog/${post.slug}`} className="no-underline">
                    <h3
                      className={`font-display text-dark mt-2 mb-3 leading-tight group-hover:text-amber transition-colors ${
                        wide ? 'text-display-xl' : 'text-display-lg'
                      }`}
                    >
                      {post.title}
                    </h3>
                  </Link>
                  <p className="font-ui text-ui-sm text-mid mb-4 leading-relaxed">{post.excerpt}</p>
                  <span className="font-mono text-ui-xs text-light">
                    {post.author} · {post.date}
                  </span>
                </article>
              );
            })}
          </div>
        </section>
      </main>
      <MarketingFooter />
    </div>
  );
}
