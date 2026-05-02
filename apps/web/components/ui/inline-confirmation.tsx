import { ReactNode, useState } from 'react';
import { Button } from './button';

interface InlineConfirmationProps {
  /** The action button that triggers confirmation */
  trigger: ReactNode;
  /** Confirmation message */
  message: string;
  /** Confirm button label */
  confirmLabel?: string;
  /** Cancel button label */
  cancelLabel?: string;
  /** Risk level determines button styling */
  risk?: 'low' | 'medium' | 'high' | 'critical';
  /** For critical: text user must type to confirm */
  confirmText?: string;
  /** Callback when user confirms */
  onConfirm: () => void;
  /** Callback when user cancels */
  onCancel?: () => void;
  /** Initial expanded state */
  defaultOpen?: boolean;
}

/**
 * Inline Confirmation Component
 * 
 * Per §16.5 - Confirmation Patterns:
 * - Low risk: No confirmation, just execute
 * - Medium risk: Inline confirmation with Yes/No
 * - High risk: Inline form requiring additional input
 * - Critical risk: Type-to-confirm pattern
 * 
 * No modals for destructive actions - keeps user in context.
 */
export function InlineConfirmation({
  trigger,
  message,
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  risk = 'medium',
  confirmText,
  onConfirm,
  onCancel,
  defaultOpen = false,
}: InlineConfirmationProps) {
  const [isExpanded, setIsExpanded] = useState(defaultOpen);
  const [inputValue, setInputValue] = useState('');
  
  const isCritical = risk === 'critical' && confirmText;
  const canConfirm = !isCritical || inputValue === confirmText;
  
  const handleConfirm = () => {
    if (canConfirm) {
      onConfirm();
      setIsExpanded(false);
      setInputValue('');
    }
  };
  
  const handleCancel = () => {
    onCancel?.();
    setIsExpanded(false);
    setInputValue('');
  };
  
  return (
    <div className="inline-block">
      {/* Trigger button */}
      {!isExpanded ? (
        <div onClick={() => setIsExpanded(true)}>
          {trigger}
        </div>
      ) : (
        /* Expanded confirmation */
        <div className="border border-border-subtle rounded-md p-4 bg-surface-muted">
          {/* Confirmation message */}
          <p className="font-ui text-ui-md text-dark mb-4">
            {message}
          </p>
          
          {/* Critical risk: type-to-confirm */}
          {isCritical && (
            <div className="mb-4">
              <label className="block font-ui text-ui-sm text-light mb-2">
                Type "{confirmText}" to confirm:
              </label>
              <input
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                className="input-field w-full max-w-xs font-ui"
                placeholder={`Type "${confirmText}"`}
                autoFocus
              />
            </div>
          )}
          
          {/* Action buttons */}
          <div className="flex gap-3">
            <Button
              variant={risk === 'high' || risk === 'critical' ? 'default' : 'default'}
              onClick={handleConfirm}
              disabled={!canConfirm}
              className={`${!canConfirm ? 'opacity-50' : ''} ${risk === 'high' || risk === 'critical' ? 'bg-danger hover:bg-danger/90' : ''}`}
            >
              {confirmLabel}
            </Button>
            <Button
              variant="outline"
              onClick={handleCancel}
            >
              {cancelLabel}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

/**
 * Inline Confirmation with Reason Input
 * 
 * Per §16.5 - High risk pattern (e.g., void journal entry):
 * - Requires additional input before confirmation
 * - Used for actions that need audit trail
 */
interface InlineConfirmationWithReasonProps {
  trigger: ReactNode;
  message: string;
  reasonLabel?: string;
  reasonPlaceholder?: string;
  minReasonLength?: number;
  confirmLabel?: string;
  onConfirm: (reason: string) => void;
  onCancel?: () => void;
}

export function InlineConfirmationWithReason({
  trigger,
  message,
  reasonLabel = 'Reason',
  reasonPlaceholder = 'Explain why...',
  minReasonLength = 10,
  confirmLabel = 'Confirm',
  onConfirm,
  onCancel,
}: InlineConfirmationWithReasonProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [reason, setReason] = useState('');
  
  const canConfirm = reason.length >= minReasonLength;
  
  const handleConfirm = () => {
    if (canConfirm) {
      onConfirm(reason);
      setIsExpanded(false);
      setReason('');
    }
  };
  
  const handleCancel = () => {
    onCancel?.();
    setIsExpanded(false);
    setReason('');
  };
  
  return (
    <div className="inline-block">
      {!isExpanded ? (
        <div onClick={() => setIsExpanded(true)}>
          {trigger}
        </div>
      ) : (
        <div className="border border-border-subtle rounded-md p-4 bg-surface-muted">
          <p className="font-ui text-ui-md text-dark mb-4">
            {message}
          </p>
          
          <div className="mb-4">
            <label className="block font-ui text-ui-sm text-light mb-2">
              {reasonLabel} *
            </label>
            <textarea
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              className="input-field w-full font-ui min-h-[80px]"
              placeholder={reasonPlaceholder}
              autoFocus
            />
            <p className="font-ui text-ui-xs text-light mt-1">
              Minimum {minReasonLength} characters ({reason.length}/{minReasonLength})
            </p>
          </div>
          
          <div className="flex gap-3">
            <Button
              variant="default"
              onClick={handleConfirm}
              disabled={!canConfirm}
              className={`${!canConfirm ? 'opacity-50' : ''} bg-danger hover:bg-danger/90 text-white`}
            >
              {confirmLabel}
            </Button>
            <Button
              variant="outline"
              onClick={handleCancel}
            >
              Cancel
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
