import 'next/link';

// @ts-ignore
export function SectionLabel({ children }) {
  return (
    <div className="font-ui text-ui-xs font-medium text-amber uppercase tracking-widest mb-4">
      {children}
    </div>
  );
}
