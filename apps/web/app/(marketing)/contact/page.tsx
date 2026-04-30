'use client';

import { useState } from 'react';
import { Icon } from '@/components/ui/icon';
import { MarketingNav } from '@/components/marketing/nav';
import { MarketingFooter } from '@/components/marketing/footer';

export default function ContactPage() {
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const form = e.currentTarget as HTMLFormElement;
    const fd = new FormData(form);
    const data = { name: fd.get('name') as string, email: fd.get('email') as string, businessType: fd.get('businessType') as string, message: fd.get('message') as string };
    try {
      const res = await fetch('/api/contact', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) });
      if (res.ok) setSubmitted(true);
      else setError('Something went wrong. Email us directly at hello@complianceos.in.');
    } catch {
      setError('Something went wrong. Email us directly at hello@complianceos.in.');
    }
  }

  return (
    <div className="bg-page-bg text-on-surface min-h-screen">
      <MarketingNav />
      <main className="min-h-screen">
        {/* Hero */}
        <header className="pt-space-128 pb-space-64 px-8 max-w-[1320px] mx-auto text-left">
          <span className="text-ui-xs font-ui-xs uppercase tracking-widest text-amber-text">Connect with us</span>
          <h1 className="font-display-xl text-display-xl text-stone-900 mt-4">Get in touch.</h1>
          <p className="font-ui-md text-ui-md text-text-mid max-w-xl mt-4">Whether you're a Chartered Accountant looking for automation or a business owner scaling in India, our team of experts is ready to assist.</p>
        </header>

        {/* 2-Column Layout */}
        <section className="pb-space-128 px-8 max-w-[1320px] mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-gutter-wide">
            {/* Left: Form */}
            <div className="lg:col-span-7 bg-white p-12 border-[0.5px] border-border-subtle border-t-2 border-t-primary-container">
              {submitted ? (
                <div className="flex items-center gap-3 p-4 bg-surface-container-low border-[0.5px] border-primary-container/20">
                  <Icon name="check_circle" className="text-primary" />
                  <span className="text-ui-sm font-ui-sm text-on-surface">Message sent successfully. We'll be in touch soon.</span>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-8">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="flex flex-col gap-2 text-left">
                      <label className="text-ui-xs font-ui-xs text-on-surface-variant uppercase">Full Name</label>
                      <input name="name" className="border-b-[0.5px] border-outline-variant bg-transparent py-2 focus:border-primary focus:ring-0 font-ui-sm transition-colors outline-none" placeholder="Arjun Mehta" type="text" required />
                    </div>
                    <div className="flex flex-col gap-2 text-left">
                      <label className="text-ui-xs font-ui-xs text-on-surface-variant uppercase">Email Address</label>
                      <input name="email" className="border-b-[0.5px] border-outline-variant bg-transparent py-2 focus:border-primary focus:ring-0 font-ui-sm transition-colors outline-none" placeholder="arjun@taxsolutions.in" type="email" required />
                    </div>
                  </div>
                  <div className="flex flex-col gap-2 text-left">
                    <label className="text-ui-xs font-ui-xs text-on-surface-variant uppercase">Business Type</label>
                    <select name="businessType" className="border-b-[0.5px] border-outline-variant bg-transparent py-2 focus:border-primary focus:ring-0 font-ui-sm transition-colors outline-none appearance-none">
                      <option disabled selected value="">Select category</option>
                      <option value="ca">Chartered Accountant / Firm</option>
                      <option value="startup">Startup / SME</option>
                      <option value="enterprise">Enterprise</option>
                      <option value="other">Other</option>
                    </select>
                  </div>
                  <div className="flex flex-col gap-2 text-left">
                    <label className="text-ui-xs font-ui-xs text-on-surface-variant uppercase">Message</label>
                    <textarea name="message" className="border-b-[0.5px] border-outline-variant bg-transparent py-2 focus:border-primary focus:ring-0 font-ui-sm transition-colors outline-none resize-none" placeholder="How can we help your compliance journey?" rows={4} required></textarea>
                  </div>
                  {error && <p className="text-sm text-error">{error}</p>}
                  <div className="pt-4">
                    <button className="w-full bg-primary-container text-white py-4 font-ui-md text-ui-md font-bold hover:shadow-card transition-all flex items-center justify-center gap-2 group cursor-pointer border-none" type="submit">
                      Send Message
                      <span className="group-hover:translate-x-1 transition-transform">→</span>
                    </button>
                  </div>
                </form>
              )}
            </div>

            {/* Right: Contact Info */}
            <div className="lg:col-span-5 space-y-gutter-wide">
              <div className="bg-section-muted border-[0.5px] border-border-subtle p-8 text-left">
                <Icon name="mail" className="text-primary text-2xl mb-4" />
                <h3 className="font-ui-md font-bold text-on-surface mb-2">Email</h3>
                <p className="font-ui-sm text-text-mid">hello@complianceos.in</p>
              </div>
              <div className="bg-section-muted border-[0.5px] border-border-subtle p-8 text-left">
                <Icon name="phone" className="text-primary text-2xl mb-4" />
                <h3 className="font-ui-md font-bold text-on-surface mb-2">Phone</h3>
                <p className="font-ui-sm text-text-mid">+91 95677 41714</p>
              </div>
              <div className="bg-section-muted border-[0.5px] border-border-subtle p-8 text-left">
                <Icon name="location_on" className="text-primary text-2xl mb-4" />
                <h3 className="font-ui-md font-bold text-on-surface mb-2">Office</h3>
                <p className="font-ui-sm text-text-mid leading-relaxed">COM 07, First Floor, Vipul World, Sector 29, Gurgaon, Haryana 122001, India</p>
              </div>
            </div>
          </div>
        </section>
      </main>
      <MarketingFooter />
    </div>
  );
}
