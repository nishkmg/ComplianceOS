
// @ts-ignore
export function TestimonialCard({ quote, name, role, location }) {
  return (
    <div className="testimonial-card bg-surface border border-[#E8E4DC] rounded-lg p-8 md:p-10">
      <div className="mb-4">
        <span className="font-display text-[48px] text-amber leading-none" aria-hidden="true">"</span>
      </div>
      <blockquote className="font-display text-display-md italic text-dark leading-relaxed mb-6">
        {quote}
      </blockquote>
      <div className="flex items-center gap-3">
        <div className="w-12 h-12 rounded-sm bg-section-muted border border-border" aria-hidden="true" />
        <div>
          <div className="font-ui text-[14px] font-medium text-dark">{name}</div>
          <div className="font-ui text-[12px] text-light">{role}</div>
          <div className="font-ui text-[12px] text-light">{location}</div>
        </div>
      </div>
    </div>
  );
}
