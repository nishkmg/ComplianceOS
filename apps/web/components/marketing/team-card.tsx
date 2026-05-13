import Link from 'next/link';

// @ts-ignore
export function TeamCard({ name, role, bio }) {
  return (
    <div className="bg-surface border border-border-subtle rounded-lg p-7">
      <div className="w-20 h-20 rounded-sm bg-section-muted border border-border mb-4" />
      <h3 className="font-ui text-[16px] font-medium text-dark">{name}</h3>
      <p className="font-ui text-[14px] text-light mb-3">{role}</p>
      <p className="font-ui text-[14px] text-mid leading-relaxed">{bio}</p>
    </div>
  );
}
