// @ts-nocheck
import Link from 'next/link';

export function MarketingFooter() {
  return (
    <footer className="bg-[#F4F2EE] w-full py-24 border-t border-[#E8E4DC]">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-16 px-8 mx-auto" style={{ maxWidth: '1200px' }}>
        <div>
          <p className="font-display text-[20px] mb-6 text-dark" style={{ fontWeight: 700 }}>ComplianceOS</p>
          <p className="font-ui text-[12px] uppercase tracking-widest leading-relaxed" style={{ fontFamily: 'Syne, sans-serif', color: '#888888' }}>
            &copy; 2024 ComplianceOS. Precision in Indian Accounting.
          </p>
        </div>
        <div>
          <h4 className="font-ui text-[12px] uppercase tracking-widest font-semibold mb-6 text-dark">Resources</h4>
          <ul className="space-y-4">
            <li><Link href="/blog" className="font-ui text-[12px] uppercase tracking-widest no-underline hover:text-[#C8860A] transition-all" style={{ color: '#888888' }}>Compliance Guide</Link></li>
            <li><Link href="/blog" className="font-ui text-[12px] uppercase tracking-widest no-underline hover:text-[#C8860A] transition-all" style={{ color: '#888888' }}>GST Tools</Link></li>
          </ul>
        </div>
        <div>
          <h4 className="font-ui text-[12px] uppercase tracking-widest font-semibold mb-6 text-dark">Company</h4>
          <ul className="space-y-4">
            <li><Link href="/privacy" className="font-ui text-[12px] uppercase tracking-widest no-underline hover:text-[#C8860A] transition-all" style={{ color: '#888888' }}>Privacy Policy</Link></li>
            <li><Link href="/terms" className="font-ui text-[12px] uppercase tracking-widest no-underline hover:text-[#C8860A] transition-all" style={{ color: '#888888' }}>Terms of Service</Link></li>
          </ul>
        </div>
        <div>
          <h4 className="font-ui text-[12px] uppercase tracking-widest font-semibold mb-6 text-dark">Support</h4>
          <ul className="space-y-4">
            <li><Link href="/contact" className="font-ui text-[12px] uppercase tracking-widest no-underline hover:text-[#C8860A] transition-all" style={{ color: '#888888' }}>Contact Support</Link></li>
            <li><Link href="/contact" className="font-ui text-[12px] uppercase tracking-widest no-underline underline decoration-[#C8860A] underline-offset-4" style={{ color: '#888888' }}>Schedule a Demo</Link></li>
          </ul>
        </div>
      </div>
    </footer>
  );
}
