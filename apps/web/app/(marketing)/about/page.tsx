// @ts-nocheck
'use client';

import { MarketingNav } from '@/components/marketing/nav';
import { MarketingFooter } from '@/components/marketing/footer';
import Link from 'next/link';

const team = [
  { 
    name: 'Arjun Mehta', 
    role: 'Co-Founder & CEO', 
    bio: 'Former Big 4 auditor who spent a decade unravelling complex corporate structures before realizing the software was the bottleneck, not the legislation.',
    image: '/images/about/arjun.jpg'
  },
  { 
    name: 'Priya Sharma', 
    role: 'Co-Founder & CTO', 
    bio: 'Systems architect obsessed with data integrity. Led engineering teams at leading fintech firms before turning her focus to the foundational layer of compliance.',
    image: '/images/about/priya.jpg'
  },
  { 
    name: 'Rajiv Desai', 
    role: 'Head of Tax Policy', 
    bio: 'Over 30 years of experience navigating the Indian tax code. Ensures every feature we build accurately reflects the latest gazette notifications and tribunal rulings.',
    image: '/images/about/rajiv.jpg'
  },
];

const beliefs = [
  { title: 'Compliance is a feature, not a friction.', desc: "When built correctly, tax compliance shouldn't be an end-of-month panic. It should be an invisible byproduct of standard business operations." },
  { title: 'Data integrity is paramount.', desc: "We don't allow \"soft deletes\" or untraceable edits. Every action must have an indelible audit trail. Trust is built on immutable records." },
  { title: 'Professionals deserve professional tools.', desc: "We reject \"gamified\" interfaces for financial software. CAs and accountants require power-user density and keyboard-centric workflows, not simplified dashboards." },
  { title: 'Local nuance over global scale.', desc: "We will never compromise our deep integration with Indian tax structures just to launch in a new international market. Depth over breadth." },
];

export default function AboutPage() {
  return (
    <div className="bg-page-bg text-on-surface font-ui-md antialiased min-h-screen">
      <MarketingNav />
      
      <main className="flex flex-col pt-16">
        {/* Hero Section */}
        <section className="pt-space-128 pb-space-96 px-gutter-desktop max-w-[1200px] mx-auto w-full">
          <div className="max-w-4xl">
            <p className="font-ui-xs text-amber-text uppercase tracking-widest mb-6 border-l-2 border-amber-text pl-4">Our Origin</p>
            <h1 className="font-marketing-hero text-marketing-hero text-on-surface mb-8">
              We built the accounting software we wish existed when we started our businesses.
            </h1>
            <p className="font-ui-lg text-ui-lg text-on-surface-variant max-w-2xl leading-relaxed">
              A rejection of generic SaaS in favor of editorial precision. Designed specifically for the nuances of Indian compliance and high-stakes fiscal management.
            </p>
          </div>
        </section>

        {/* Divider */}
        <div className="w-full h-px bg-border-subtle max-w-[1200px] mx-auto"></div>

        {/* The Problem Section */}
        <section className="py-space-96 px-gutter-desktop max-w-[1200px] mx-auto w-full">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-12 items-center">
            <div className="col-span-1 md:col-span-5 order-2 md:order-1 text-left">
              <p className="font-ui-xs text-amber-text uppercase tracking-widest mb-4 text-left">The Problem</p>
              <h2 className="font-display-xl text-display-xl text-on-surface mb-6 text-left">Global tools ignore local realities.</h2>
              <div className="space-y-6 font-ui-md text-ui-md text-on-surface-variant text-left">
                <p>Most accounting platforms treat Indian compliance as an afterthought—a secondary module bolted onto a Western framework. This leads to convoluted workflows, manual GST reconciliations, and constant anxiety over audit trails.</p>
                <p>We experienced this friction firsthand. The tools were either too simple to handle real complexity or too archaic to be usable.</p>
              </div>
            </div>
            <div className="col-span-1 md:col-span-7 order-1 md:order-2">
              <div className="bg-surface-container border-[0.5px] border-border-subtle p-2">
                <div className="aspect-[4/3] bg-surface-variant overflow-hidden relative">
                  <img 
                    src="/images/about/problem.jpg" 
                    alt="Complex financial documents" 
                    className="w-full h-full object-cover grayscale opacity-90 mix-blend-multiply" 
                  />
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Divider */}
        <div className="w-full h-px bg-border-subtle max-w-[1200px] mx-auto"></div>

        {/* The Team Section */}
        <section className="py-space-96 px-gutter-desktop max-w-[1200px] mx-auto w-full">
          <div className="mb-16 text-left">
            <p className="font-ui-xs text-amber-text uppercase tracking-widest mb-4">The Team</p>
            <h2 className="font-display-xl text-display-xl text-on-surface">Built by CAs, for CAs.</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {team.map((member) => (
              <div key={member.name} className="group border-[0.5px] border-border-subtle bg-white flex flex-col h-full hover:shadow-sm transition-shadow duration-300">
                <div className="border-t-2 border-primary-container w-full"></div>
                <div className="aspect-square w-full overflow-hidden border-b-[0.5px] border-border-subtle bg-surface-variant">
                  <img 
                    src={member.image} 
                    alt={member.name} 
                    className="w-full h-full object-cover grayscale transition-transform duration-700 group-hover:scale-105 group-hover:grayscale-0" 
                  />
                </div>
                <div className="p-6 flex flex-col flex-grow text-left">
                  <h3 className="font-display-lg text-display-lg text-on-surface mb-1">{member.name}</h3>
                  <p className="font-mono-md text-mono-md text-amber-text mb-4 uppercase tracking-tighter">{member.role}</p>
                  <p className="font-ui-sm text-ui-sm text-on-surface-variant flex-grow">{member.bio}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Divider */}
        <div className="w-full h-px bg-border-subtle max-w-[1200px] mx-auto"></div>

        {/* Why We Built It This Way */}
        <section className="py-space-96 px-gutter-desktop max-w-[1200px] mx-auto w-full bg-section-muted">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-16">
            <div className="text-left">
              <p className="font-ui-xs text-amber-text uppercase tracking-widest mb-4">Editorial Ledger</p>
              <h2 className="font-display-xl text-display-xl text-on-surface mb-6">A design philosophy rooted in print.</h2>
              <p className="font-ui-md text-ui-md text-on-surface-variant mb-6 leading-relaxed">
                We deliberately eschewed the vibrant, bubbly aesthetic of modern SaaS. Accounting is a serious discipline requiring deep focus. 
              </p>
              <p className="font-ui-md text-ui-md text-on-surface-variant leading-relaxed">
                Our interface draws inspiration from high-end financial publishing and physical ledgers. The off-white backgrounds reduce eye strain during long reconciliation sessions, while monospaced typography ensures tabular data remains perfectly aligned and legible.
              </p>
            </div>
            <div className="grid grid-cols-2 gap-4">
              {[
                { icon: 'format_align_left', title: 'Monospaced Precision', desc: 'Numeric integrity through fixed-width typography.' },
                { icon: 'space_dashboard', title: 'Measured Whitespace', desc: 'Providing cognitive relief for complex data sets.' },
                { icon: 'contrast', title: 'Tonal Restraint', desc: 'Using contrast, not color, to establish hierarchy.' },
                { icon: 'gavel', title: 'Authoritative Focus', desc: 'Amber accents direct attention to critical actions.', accent: true },
              ].map((item) => (
                <div key={item.title} className={`border-[0.5px] border-border-subtle bg-white p-6 flex flex-col justify-center text-left ${item.accent ? 'border-t-2 border-t-primary-container' : ''}`}>
                  <span className="material-symbols-outlined text-amber-text text-3xl mb-4">{item.icon}</span>
                  <h4 className="font-mono-md text-mono-md text-on-surface mb-2">{item.title}</h4>
                  <p className="font-ui-sm text-ui-sm text-text-light">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Divider */}
        <div className="w-full h-px bg-border-subtle max-w-[1200px] mx-auto"></div>

        {/* What We Believe */}
        <section className="py-space-96 px-gutter-desktop max-w-[1200px] mx-auto w-full mb-space-64">
          <div className="text-center mb-16 max-w-2xl mx-auto">
            <p className="font-ui-xs text-amber-text uppercase tracking-widest mb-4">Our Core Tenets</p>
            <h2 className="font-display-xl text-display-xl text-on-surface">What we believe</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-16">
            {beliefs.map((b) => (
              <div key={b.title} className="border-l-[0.5px] border-border-subtle pl-6 relative text-left">
                <div className="absolute left-0 top-0 w-[2px] h-8 bg-primary-container -ml-[1px]"></div>
                <h3 className="font-display-lg text-display-lg text-on-surface mb-3 leading-tight">{b.title}</h3>
                <p className="font-ui-md text-ui-md text-on-surface-variant leading-relaxed">{b.desc}</p>
              </div>
            ))}
          </div>
        </section>
      </main>

      <MarketingFooter />
    </div>
  );
}
