import { ReactNode } from 'react';
import { Button } from './button';

interface ErrorStateProps {
  /** Error title - e.g., "Failed to load entries" */
  title: string;
  /** Error description - what went wrong */
  description?: string;
  /** Retry action */
  onRetry?: () => void;
  /** Alternative action (e.g., "Go back") */
  onBack?: () => void;
  /** Error type for icon */
  type?: 'network' | 'server' | 'not-found' | 'permission' | 'validation';
}

/**
 * Error State Component
 * 
 * Per §2.9 and §16.3:
 * - Inline validation: shown below field in red, ui-sm Syne
 * - Form-level errors: summary banner above submit
 * - 404/Not found: dedicated screen with back navigation
 * - Server errors: toast with retry action
 * - Network offline: persistent amber banner at top
 */
export function ErrorState({
  title,
  description,
  onRetry,
  onBack,
  type = 'server',
}: ErrorStateProps) {
  const icon = getErrorIcon(type);
  
  return (
    <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
      {/* Error icon */}
      <div className="mb-6 text-danger" aria-hidden="true">
        {icon}
      </div>
      
      {/* Error title */}
      <h3 className="font-display text-xl font-semibold text-dark mb-2">
        {title}
      </h3>

      {/* Error description */}
      {description && (
        <p className="font-ui text-sm text-light max-w-md mb-6">
          {description}
        </p>
      )}
      
      {/* Actions */}
      <div className="flex gap-3">
        {onRetry && (
          <Button variant="default" onClick={onRetry}>
            Try Again
          </Button>
        )}
        {onBack && (
          <Button variant="outline" onClick={onBack}>
            Go Back
          </Button>
        )}
      </div>
    </div>
  );
}

/**
 * Inline Field Error Component
 * 
 * Per §16.3: Shown below the field in red, ui-sm Syne
 * Uses role="alert" for screen reader announcements
 */
export function FieldError({
  error,
  id,
}: {
  error?: string | null;
  id?: string;
}) {
  if (!error) return null;
  
  return (
    <p
      id={id}
      className="font-ui text-xs text-danger mt-1"
      role="alert"
    >
      {error}
    </p>
  );
}

/**
 * Form Error Summary Component
 * 
 * Per §16.3: Shown above submit button with links to errored fields
 */
export function FormErrorSummary({
  errors,
  onFieldClick,
}: {
  errors: Array<{ field: string; message: string }>;
  onFieldClick?: (field: string) => void;
}) {
  if (errors.length === 0) return null;
  
  return (
    <div
      className="bg-danger-bg border border-danger rounded-md p-4 mb-6"
      role="alert"
      aria-live="assertive"
    >
      <h4 className="font-ui text-sm font-medium text-danger mb-2">
        Please fix {errors.length} error{errors.length > 1 ? 's' : ''} before continuing:
      </h4>
      <ul className="space-y-1">
        {errors.map((error, index) => (
          <li key={index}>
            <button
              type="button"
              className="font-ui text-xs text-danger hover:underline text-left"
              onClick={() => onFieldClick?.(error.field)}
            >
              • {error.message}
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}

/**
 * Network Offline Banner Component
 * 
 * Per §16.3: Persistent amber banner at top
 */
export function OfflineBanner() {
  return (
    <div className="bg-amber text-white text-sm font-ui py-2 px-4 text-center">
      You appear to be offline. Changes will not be saved until you reconnect.
    </div>
  );
}

/**
 * 404 Not Found Screen Component
 * 
 * Per §16.3: Dedicated screen with back navigation
 */
export function NotFound({
  resource = 'Page',
  onBack,
}: {
  resource?: string;
  onBack?: () => void;
}) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
      <div className="mb-6 text-light" aria-hidden="true">
        <svg className="w-20 h-20" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      </div>
      
      <h1 className="font-display text-2xl font-semibold text-dark mb-2">
        {resource} Not Found
      </h1>

      <p className="font-ui text-sm text-light mb-6">
        The {resource.toLowerCase()} you're looking for doesn't exist or has been moved.
      </p>
      
      {onBack && (
        <Button variant="outline" onClick={onBack}>
          Go Back
        </Button>
      )}
    </div>
  );
}

/**
 * Permission Denied Screen Component
 * 
 * Per §16.3: Dedicated screen explaining why + contact admin note
 */
export function PermissionDenied({
  resource = 'This page',
  reason,
  adminEmail,
}: {
  resource?: string;
  reason?: string;
  adminEmail?: string;
}) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
      <div className="mb-6 text-danger" aria-hidden="true">
        <svg className="w-20 h-20" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
        </svg>
      </div>
      
      <h1 className="font-display text-2xl font-semibold text-dark mb-2">
        Access Denied
      </h1>

      <p className="font-ui text-sm text-light mb-2">
        {resource} requires additional permissions.
      </p>
      
      {reason && (
        <p className="font-ui text-xs text-light mb-6 max-w-md">
          {reason}
        </p>
      )}
      
      {adminEmail && (
        <p className="font-ui text-xs text-mid">
          Contact your administrator at{' '}
          <a href={`mailto:${adminEmail}`} className="text-amber hover:underline">
            {adminEmail}
          </a>
        </p>
      )}
    </div>
  );
}

// Helper function for error icons
function getErrorIcon(type: string) {
  switch (type) {
    case 'network':
      return (
        <svg className="w-16 h-16" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M8.111 16.404a5.5 5.5 0 017.778 0M12 20h.01m-7.08-7.071c3.904-3.905 10.236-3.905 14.141 0M1.394 9.393c5.857-5.857 15.355-5.857 21.213 0" />
        </svg>
      );
    case 'not-found':
      return (
        <svg className="w-16 h-16" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      );
    case 'permission':
      return (
        <svg className="w-16 h-16" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
        </svg>
      );
    default:
      return (
        <svg className="w-16 h-16" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      );
  }
}
