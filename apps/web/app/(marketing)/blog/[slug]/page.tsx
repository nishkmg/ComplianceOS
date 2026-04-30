"use client";

import { useState } from "react";
import Link from "next/link";
import { MarketingNav } from "@/components/marketing/nav";
import { MarketingFooter } from "@/components/marketing/footer";

export default function BlogPostPage() {
  // In real app, fetch by slug
  return (
    <div className="bg-page-bg text-on-surface min-h-screen">
      <MarketingNav />
      <main className="max-w-[1200px] mx-auto px-8 pt-space-128 pb-space-96">
        <article className="max-w-[680px] mx-auto text-left">
          {/* Category & Date */}
          <div className="flex items-center gap-4 mb-8">
            <span className="font-ui-xs text-ui-xs text-amber-text uppercase tracking-widest font-bold">Tax Compliance</span>
            <span className="h-[1px] w-8 bg-border-subtle"></span>
            <span className="font-mono text-[12px] text-text-light">12 October 2024</span>
          </div>

          {/* Title */}
          <h1 className="font-marketing-hero text-marketing-hero text-on-surface mb-8 leading-tight">
            Navigating Section 43B(h): A New Era for MSME Payments in India
          </h1>

          {/* Byline */}
          <div className="flex items-center gap-4 pb-space-48 border-b-[0.5px] border-border-subtle mb-space-48">
            <div className="w-12 h-12 rounded-full overflow-hidden bg-stone-200">
              <img className="w-full h-full object-cover" src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100" alt="" />
            </div>
            <div>
              <p className="font-ui-sm font-bold text-on-surface">Vikram Patel</p>
              <p className="font-ui-xs text-text-light uppercase tracking-wider">Senior Tax Analyst</p>
            </div>
          </div>

          {/* Content */}
          <div className="space-y-8 leading-relaxed font-serif text-[18px] text-on-surface">
            <p>The recent introduction of Section 43B(h) in the Income Tax Act marks a significant shift in the compliance landscape for Indian businesses dealing with Micro and Small Enterprises (MSMEs).</p>
            <p>This amendment, effective from April 1, 2023, aims to solve a perennial problem: the delayed payment cycle that stifles Micro and Small Enterprises (MSMEs).</p>

            <h2 className="font-display-xl text-display-xl mt-16 mb-6 text-on-surface">The 45-Day Mandate</h2>
            <p>The crux of the matter lies in timing. Under the new regime, any sum payable by an assessee to a registered MSME must be cleared within the time limit specified in Section 15 of the MSMED Act, 2006. If no agreement exists, this is 15 days; if an agreement exists, it cannot exceed 45 days.</p>
            <p>Failure to comply results in the expense being disallowed for that year and allowed only in the year of actual payment. This creates a permanent difference where the assessee loses the deduction forever.</p>

            <div className="bg-stone-50 border-l-4 border-primary-container p-6 my-10">
              <p className="font-ui-md text-sm text-on-surface italic">"The MSME amendment under Section 43B(h) has been one of the most impactful compliance changes in recent years, directly influencing cash flow management strategies across the supply chain."</p>
            </div>

            <h2 className="font-display-xl text-display-xl mt-16 mb-6 text-on-surface">What This Means for Your Business</h2>
            <p>If your organization sources goods or services from MSME-registered vendors, you must now track these payments separately. Your accounting software should flag any MSME invoices approaching the 45-day threshold and prioritize them for processing.</p>
            <p>Non-compliance is expensive — the disallowed expense is permanently lost, increasing your tax liability for the year. This is not a deferral; it is a forfeiture.</p>

            <h2 className="font-display-xl text-display-xl mt-16 mb-6 text-on-surface">How ComplianceOS Handles This</h2>
            <p>Our platform automatically flags MSME invoices and tracks payment timelines against the statutory deadline. You receive proactive notifications at 30 days, 40 days, and finally at 44 days, ensuring you never miss a deadline inadvertently.</p>
          </div>

          {/* Divider */}
          <div className="w-full h-px bg-border-subtle my-space-48"></div>

          {/* Related Posts */}
          <h3 className="font-display-lg text-display-lg text-on-surface mb-8">Related Articles</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="group cursor-pointer">
              <div className="aspect-[16/10] overflow-hidden mb-6 bg-stone-100 border-[0.5px] border-border-subtle">
                <img className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" src="https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?w=400" alt="" />
              </div>
              <span className="font-ui-xs text-xs text-amber-text uppercase tracking-widest font-bold">GST</span>
              <h4 className="font-display-lg text-lg text-on-surface mt-2 mb-2 group-hover:text-primary transition-colors">GSTR-1 vs GSTR-3B: Understanding Mismatches</h4>
              <p className="font-ui-sm text-sm text-text-mid">Common reasons for return mismatches and how to resolve them before notice.</p>
            </div>
            <div className="group cursor-pointer">
              <div className="aspect-[16/10] overflow-hidden mb-6 bg-stone-100 border-[0.5px] border-border-subtle">
                <img className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" src="https://images.unsplash.com/photo-1450101499163-c8848c66ca85?w=400" alt="" />
              </div>
              <span className="font-ui-xs text-xs text-amber-text uppercase tracking-widest font-bold">Payroll</span>
              <h4 className="font-display-lg text-lg text-on-surface mt-2 mb-2 group-hover:text-primary transition-colors">Auto-Calculating PF, ESI, PT and TDS</h4>
              <p className="font-ui-sm text-sm text-text-mid">How ComplianceOS automates statutory payroll calculations.</p>
            </div>
          </div>
        </article>
      </main>
      <MarketingFooter />
    </div>
  );
}
