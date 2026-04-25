// @ts-nocheck
'use client';

import { useState } from 'react';
import { MarketingNav } from '@/components/marketing/nav';
import { MarketingFooter } from '@/components/marketing/footer';

export default function ContactPage() {
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');

  async function handleSubmit(e) {
    e.preventDefault();
    const form = e.target;
    const data = { name: form.name.value, email: form.email.value, businessType: form.businessType.value, message: form.message.value };
    try {
      const res = await fetch('/api/contact', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) });
      if (res.ok) setSubmitted(true);
      else setError('Something went wrong. Email us directly at hello@complianceos.in.');
    } catch {
      setError('Something went wrong. Email us directly at hello@complianceos.in.');
    }
  }

  return (
    <div className="bg-page-bg min-h-screen" style={{ paddingTop: '64px' }}>
      <MarketingNav />
      <main id="main-content">
        <section className="py-24 md:py-32">
          <div className="marketing-container">
            <h1 className="font-display text-[36px] md:text-[38px] font-normal text-dark leading-[1.15] mb-12">
              Get in touch.
            </h1>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-12 max-w-4xl">
              {/* Contact form */}
              <div>
                {submitted ? (
                  <div className="flex items-start gap-3">
                    <svg className="w-6 h-6 text-success flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                    <div>
                      <p className="font-ui text-[16px] text-dark">Message sent. We&apos;ll reply to your email within 1 business day.</p>
                    </div>
                  </div>
                ) : (
                  <form onSubmit={handleSubmit} className="space-y-6">
                    {['name', 'email'].map((field) => (
                      <div key={field}>
                        <label htmlFor={`contact-${field}`} className="block font-ui text-[14px] font-medium text-dark mb-1">{field === 'name' ? 'Name' : 'Email'} *</label>
                        <input id={`contact-${field}`} name={field} type={field === 'email' ? 'email' : 'text'} required minLength={field === 'name' ? 2 : undefined} className="w-full px-3 py-2 border border-border rounded-md font-ui text-[14px] bg-surface" />
                      </div>
                    ))}
                    <div>
                      <label htmlFor="contact-businessType" className="block font-ui text-[14px] font-medium text-dark mb-1">Business type</label>
                      <select id="contact-businessType" name="businessType" className="w-full px-3 py-2 border border-border rounded-md font-ui text-[14px] bg-surface">
                        <option value="">Select...</option>
                        <option value="proprietorship">Proprietorship</option>
                        <option value="partnership">Partnership</option>
                        <option value="pvt_ltd">Pvt Ltd</option>
                        <option value="ca_firm">CA Firm</option>
                        <option value="other">Other</option>
                      </select>
                    </div>
                    <div>
                      <label htmlFor="contact-message" className="block font-ui text-[14px] font-medium text-dark mb-1">Message *</label>
                      <textarea id="contact-message" name="message" required minLength={20} className="w-full px-3 py-2 border border-border rounded-md font-ui text-[14px] bg-surface min-h-[120px]" />
                    </div>
                    {error && <p className="font-ui text-[14px] text-danger">{error}</p>}
                    <button type="submit" className="marketing-btn-primary text-[15px] px-6 py-3">Send message</button>
                  </form>
                )}
              </div>

              {/* Contact info */}
              <div>
                <div className="space-y-6">
                  <div>
                    <h3 className="font-ui text-[11px] text-light uppercase tracking-wider mb-2">Email</h3>
                    <a href="mailto:hello@complianceos.in" className="font-ui text-[15px] text-amber-text hover:underline no-underline">hello@complianceos.in</a>
                  </div>
                  <div>
                    <h3 className="font-ui text-[11px] text-light uppercase tracking-wider mb-2">Response time</h3>
                    <p className="font-ui text-[14px] text-mid">Within 1 business day (Mon–Fri, IST)</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>
      <MarketingFooter />
    </div>
  );
}
