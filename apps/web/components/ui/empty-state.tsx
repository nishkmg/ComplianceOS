import { ReactNode } from 'react';
import { Icon } from '@/components/ui/icon';

interface EmptyStateProps {
  title: string;
  description?: string;
  action?: {
    label: string;
    onClick: () => void;
  };
  icon?: string;
}

export function EmptyState({
  title,
  description,
  action,
  icon = "inbox",
}: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-24 px-6 text-center">
      <div className="w-20 h-20 rounded-sm border-[0.5px] border-border-subtle flex items-center justify-center bg-white mb-8 shadow-sm">
        <Icon name={icon} className="text-4xl text-text-light/40" />
      </div>
      
      <h3 className="font-display-lg text-2xl font-bold text-on-surface mb-3">
        {title}
      </h3>
      
      {description && (
        <p className="font-ui-md text-sm text-text-mid max-w-md mb-10 leading-relaxed">
          {description}
        </p>
      )}
      
      {action && (
        <button
          onClick={action.onClick}
          className="bg-primary-container text-white px-10 py-4 font-ui-sm text-sm font-bold uppercase tracking-widest hover:bg-primary transition-all rounded-sm border-none shadow-sm cursor-pointer flex items-center gap-2 group"
        >
          {action.label}
          <Icon name="arrow_forward" className="text-lg group-hover:translate-x-1 transition-transform" />
        </button>
      )}
    </div>
  );
}
