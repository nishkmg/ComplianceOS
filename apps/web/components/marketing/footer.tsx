// @ts-nocheck
import Link from 'next/link';

export function MarketingFooter() {
  return (
    <footer className="bg-[#F4F2EE] w-full py-24 border-t-[0.5px] border-[#E8E4DC]">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-16 px-8" style={{ maxWidth: '1200px', margin: '0 auto' }}>
        <div>
          <p className="font-display text-[20px] text-dark mb-6">ComplianceOS</p>
          <p className="font-ui text-[12px] uppercase tracking-widest text-light leading-relaxed">
            © 2024 ComplianceOS. Precision in Indian Accounting.
          </p>
        </div>

        <div>
          <h4 className="font-ui text-[12px] uppercase tracking-widest text-dark font-semibold mb-6">Resources</h4>
          <ul className="space-y-4">
            <li><Link href="/blog" className="font-ui text-[12px] uppercase tracking-widest text-light hover:text-amber transition-all no-underline">Compliance Guide</Link></li>
            <li><Link href="/blog" className="font-ui text-[12px] uppercase tracking-widest text-light hover:text-amber transition-all no-underline">GST Tools</Link></li>
          </ul>
        </div>

        <div>
          <h4 className="font-ui text-[12px] uppercase tracking-widest text-dark font-semibold mb-6">Company</h4>
          <ul className="space-y-4">
            <li><Link href="/privacy" className="font-ui text-[12px] uppercase tracking-widest text-light hover:text-amber transition-all no-underline">Privacy Policy</Link></li>
            <li><Link href="/terms" className="font-ui text-[12px] uppercase tracking-widest text-light hover:text-amber transition-all no-underline">Terms of Service</Link></li>
          </ul>
        </div>

        <div>
          <h4 className="font-ui text-[12px] uppercase tracking-widest text-dark font-semibold mb-6">Support</h4>
          <ul className="space-y-4">
            <li><Link href="/contact" className="font-ui text-[12px] uppercase tracking-widest text-light hover:text-amber transition-all no-underline">Contact Support</Link></li>
            <li><Link href="/contact" className="font-ui text-[12px] uppercase tracking-widest text-amber underline decoration-amber underline-offset-4 no-underline">Schedule a Demo</Link></li>
          </ul>
        </div>
      </div>
    </footer>
  );
}
