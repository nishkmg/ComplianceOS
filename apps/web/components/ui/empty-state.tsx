import { Icon } from '@/components/ui/icon';
import { Button } from '@/components/ui/button';

interface EmptyStateProps {
  title: string;
  description?: string;
  action?: {
    label: string;
    onClick: () => void;
  };
  icon?: string;
}

export function EmptyState({ title, description, action, icon = "inbox" }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center px-6 py-16 text-center">
      <div className="mb-5 flex h-14 w-14 items-center justify-center rounded-full bg-surface-muted border border-border">
        <Icon name={icon} className="text-2xl text-light" />
      </div>
      <h3 className="font-ui text-base font-semibold text-dark">{title}</h3>
      {description && (
        <p className="mt-1.5 max-w-md font-ui text-ui-sm leading-relaxed text-mid">{description}</p>
      )}
      {action && (
        <Button onClick={action.onClick} className="mt-6">
          {action.label}
        </Button>
      )}
    </div>
  );
}
