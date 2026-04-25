// @ts-nocheck

export function FAQItem({ question, answer }) {
  return (
    <details className="faq-item group border-b border-[#E8E4DC] py-4">
      <summary className="flex items-center justify-between cursor-pointer font-ui text-[15px] font-medium text-dark hover:bg-section-muted rounded-sm px-3 py-2 -mx-3 -my-2 list-none">
        {question}
        <svg className="faq-chevron w-4 h-4 text-light flex-shrink-0 ml-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </summary>
      <div className="faq-answer px-3 pt-3">
        <div className="faq-answer-inner font-ui text-[14px] text-mid leading-relaxed">
          {answer}
        </div>
      </div>
    </details>
  );
}
