'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Icon } from '@/components/ui/icon';
import { MarketingNav } from '@/components/marketing/nav';
import { MarketingFooter } from '@/components/marketing/footer';
import { MarketingButton } from '@/components/marketing/button';

const SUBMIT_ERROR = 'Something went wrong. Email us directly at hello@arthvahi.in.';

const inputCls =
  'border-b-[0.5px] border-border bg-transparent py-2 font-ui text-ui-sm text-dark transition-colors outline-none focus-visible:ring-2 focus-visible:ring-amber focus-visible:border-amber placeholder:text-light';

const labelCls = 'text-ui-2xs font-mono uppercase tracking-widest text-mid';

export default function ContactPage() {
  const router = useRouter();
  const [error, setError] = useState('');

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const form = e.currentTarget as HTMLFormElement;
    const fd = new FormData(form);
    const data = {
      name: fd.get('name') as string,
      email: fd.get('email') as string,
      businessType: fd.get('businessType') as string,
      message: fd.get('message') as string,
    };
    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (res.ok) {
        router.push('/contact/success');
      } else {
        setError(SUBMIT_ERROR);
      }
    } catch {
      setError(SUBMIT_ERROR);
    }
  }

  return (
    <div className="bg-page-bg text-dark font-ui antialiased min-h-screen">
      <MarketingNav />
      <main id="main-content">
        {/* Hero */}
        <header className="pt-space-128 pb-space-64 px-8 max-w-[1320px] mx-auto text-left">
          <p className="font-mono text-ui-2xs uppercase tracking-[0.22em] text-amber font-semibold">
            Contact
          </p>
          <h1 className="font-display text-marketing-xl text-dark mt-4 leading-tight text-balance">
            Get in touch.
          </h1>
          <p className="font-ui text-ui-md text-mid max-w-xl mt-4 leading-relaxed">
            Whether you are a Chartered Accountant looking for automation or a
            business owner scaling in India, our team will point you in the right
            direction.
          </p>
        </header>

        {/* Two-column layout */}
        <section className="pb-space-128 px-8 max-w-[1320px] mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            {/* Form */}
            <div className="lg:col-span-7 bg-surface p-12 border border-border-subtle border-t-2 border-t-amber">
              <p className="font-mono text-mono-sm text-amber uppercase tracking-tighter mb-10">
                Send a message
              </p>
              <form onSubmit={handleSubmit} className="space-y-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="flex flex-col gap-2 text-left">
                    <label htmlFor="name" className={labelCls}>
                      Full Name
                    </label>
                    <input
                      id="name"
                      name="name"
                      className={inputCls}
                      placeholder="Arjun Mehta"
                      type="text"
                      required
                    />
                  </div>
                  <div className="flex flex-col gap-2 text-left">
                    <label htmlFor="email" className={labelCls}>
                      Email Address
                    </label>
                    <input
                      id="email"
                      name="email"
                      className={inputCls}
                      placeholder="arjun@taxsolutions.in"
                      type="email"
                      required
                    />
                  </div>
                </div>
                <div className="flex flex-col gap-2 text-left">
                  <label htmlFor="businessType" className={labelCls}>
                    Business Type
                  </label>
                  <select
                    id="businessType"
                    name="businessType"
                    className={`${inputCls} appearance-none cursor-pointer`}
                    required
                  >
                    <option value="" disabled>
                      Select category
                    </option>
                    <option value="ca">Chartered Accountant / Firm</option>
                    <option value="startup">Startup / SME</option>
                    <option value="enterprise">Enterprise</option>
                    <option value="other">Other</option>
                  </select>
                </div>
                <div className="flex flex-col gap-2 text-left">
                  <label htmlFor="message" className={labelCls}>
                    Message
                  </label>
                  <textarea
                    id="message"
                    name="message"
                    className={`${inputCls} resize-none`}
                    placeholder="How can we help your compliance journey?"
                    rows={4}
                    required
                  />
                </div>
                {error && (
                  <p className="text-ui-sm font-mono text-amber" role="alert">
                    {error}
                  </p>
                )}
                <div className="pt-4">
                  <MarketingButton type="submit" className="w-full">
                    Send Message
                    <span aria-hidden="true">→</span>
                  </MarketingButton>
                </div>
              </form>
            </div>

            {/* Contact details */}
            <div className="lg:col-span-5 flex flex-col gap-4">
              {[
                {
                  icon: 'mail' as const,
                  label: 'Email',
                  value: 'hello@arthvahi.in',
                  mono: true,
                },
                {
                  icon: 'phone' as const,
                  label: 'Phone',
                  value: '+91 95677 41714',
                  mono: true,
                },
                {
                  icon: 'location_on' as const,
                  label: 'Office',
                  value: 'COM 07, First Floor, Vipul World, Sector 29, Gurgaon, Haryana 122001, India',
                  mono: false,
                },
              ].map((item) => (
                <div key={item.label} className="bg-section-muted border border-border-subtle p-8 text-left">
                  <Icon name={item.icon} className="text-amber text-2xl mb-4" />
                  <h3 className="font-mono text-mono-sm uppercase tracking-wider text-mid mb-2">
                    {item.label}
                  </h3>
                  <p className={`${item.mono ? 'font-mono text-mono-md' : 'text-ui-sm'} text-dark leading-relaxed`}>
                    {item.value}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>
      <MarketingFooter />
    </div>
  );
}
