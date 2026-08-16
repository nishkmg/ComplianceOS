/**
 * Capability ticker — replaces the fabricated "trusted by" logo wall with an
 * honest, real list of what the product actually covers. Renders as a ruled
 * ledger strip with monospace labels.
 */
const CAPABILITIES = [
  'Double-Entry Ledger',
  'Invoicing + e-Invoice IRN',
  'GSTR-1 · 2B · 3B · 9',
  'E-Way Bills',
  'ITR-3 · ITR-4',
  'TDS · TCS',
  'PF · ESI',
  'FIFO Inventory',
  'OCR Invoicing',
];

export function CapabilityTicker() {
  return (
    <section aria-label="What Arthvahi covers" className="py-14 px-8 border-y-[0.5px] border-border-subtle bg-surface">
      <div className="max-w-[1320px] mx-auto">
        <p className="font-mono text-ui-2xs uppercase tracking-[0.22em] text-light text-center mb-8">
          One ledger, every Indian compliance
        </p>
        <ul className="flex flex-wrap items-center justify-center gap-x-10 gap-y-4 list-none p-0">
          {CAPABILITIES.map((cap) => (
            <li key={cap} className="font-mono text-ui-xs uppercase tracking-[0.14em] text-mid">
              {cap}
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
