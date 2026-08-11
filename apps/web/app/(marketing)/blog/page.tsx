"use client";


import Link from 'next/link';
import { MarketingNav } from '@/components/marketing/nav';
import { MarketingFooter } from '@/components/marketing/footer';

import { blogPosts as posts } from "@/lib/blog-posts";
import { useState } from "react";

export default function BlogIndexPage() {
  const [activeCategory, setActiveCategory] = useState("All");
  const featured = posts[0];
  const visiblePosts = activeCategory === "All" ? posts : posts.filter((p) => p.category === activeCategory);

  return (
    <div className="bg-page-bg text-dark min-h-screen">
      <MarketingNav />
      <main className="max-w-[1320px] mx-auto px-8">
        {/* Featured Post */}
        <section className="pt-space-128 pb-space-96">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-0 bg-surface overflow-hidden border border-border-subtle">
            <div className="relative h-[400px] md:h-auto overflow-hidden">
              <img className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 hover:scale-105" src="https://images.unsplash.com/photo-1450101499163-c8848c66ca85?w=800" alt="" />
            </div>
            <div className="flex flex-col justify-center p-12 text-left">
              <span className="font-ui text-ui-2xs uppercase tracking-[0.2em] text-amber mb-4">{featured.category}</span>
              <Link href={`/blog/${featured.slug}`} className="no-underline group">
                <h1 className="font-display text-marketing-xl text-dark mb-4 group-hover:text-primary transition-colors">{featured.title}</h1>
              </Link>
              <p className="font-ui text-ui-md text-secondary leading-relaxed mb-6">{featured.excerpt}</p>
              <div className="flex items-center justify-between">
                <span className="text-ui-xs text-light">{featured.author} · {featured.date}</span>
                <Link href={`/blog/${featured.slug}`} className="text-ui-xs text-amber font-bold uppercase tracking-wider hover:underline no-underline">Read →</Link>
              </div>
            </div>
          </div>
        </section>

        {/* Newsletter */}
        <section className="border-b-[0.5px] border-border-subtle pb-space-48 mb-space-48">
          <div className="bg-section-muted p-8 flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="text-left">
              <h3 className="font-display text-marketing-xl text-dark font-normal">Stay ahead of compliance changes.</h3>
              <p className="text-ui-sm text-secondary mt-1">Questions about a deadline or a workflow? Reach out — we answer.</p>
            </div>
            <div className="flex gap-2">
              <a href="/contact" className="btn btn-primary whitespace-nowrap no-underline">Talk to us</a>
            </div>
          </div>
        </section>

        {/* Blog Grid */}
        <section className="pb-space-128">
          <div className="flex justify-between items-end mb-12 border-b-2 border-border-subtle pb-4">
            <h2 className="font-display text-marketing-xl">Latest Despatches</h2>
            <div className="hidden md:flex gap-6 font-ui text-light uppercase tracking-widest">
              {["All", "GST", "ITR", "Accounting", "Payroll", "Guides", "Audit"].map((cat) => (
                <button
                  key={cat}
                  onClick={() => setActiveCategory(cat)}
                  className={cat === activeCategory ? "text-dark font-bold cursor-pointer border-none bg-transparent" : "hover:text-dark cursor-pointer border-none bg-transparent"}
                >
                  {cat === "All" ? "All" : cat === "GST" ? "Taxation" : cat}
                </button>
              ))}
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-x-8 gap-y-16">
            {visiblePosts.slice(1).map((post) => (
              <article key={post.slug} className="group text-left">
                <div className="aspect-[16/10] overflow-hidden mb-6 bg-surface border border-border-subtle">
                  <img className="w-full h-full object-cover grayscale group-hover:grayscale-0 group-hover:scale-105 transition-[filter,transform] duration-500" src="https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?w=400" alt="" />
                </div>
                <span className="font-ui text-ui-2xs uppercase tracking-[0.2em] text-amber">{post.category}</span>
                <Link href={`/blog/${post.slug}`} className="no-underline">
                  <h3 className="font-display text-display-lg text-dark mt-2 mb-3 group-hover:text-primary transition-colors">{post.title}</h3>
                </Link>
                <p className="font-ui text-ui-sm text-secondary mb-4 leading-relaxed">{post.excerpt}</p>
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
