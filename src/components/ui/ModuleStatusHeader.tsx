import { AlertTriangle, RefreshCw } from 'lucide-react';

interface ModuleStatusHeaderProps {
  stepNumber: string;
  title: string;
  description: string;
  lastGeneratedAt?: string;
  actionLabel: string;
  onAction: () => void;
  isLoading: boolean;
  disabled?: boolean;
  error?: string | null;
  secondaryAction?: {
    label: string;
    onClick: () => void;
  };
}

export function ModuleStatusHeader({
  stepNumber,
  title,
  description,
  lastGeneratedAt,
  actionLabel,
  onAction,
  isLoading,
  disabled = false,
  error,
  secondaryAction,
}: ModuleStatusHeaderProps) {
  return (
    <div className="mb-6 space-y-4">
      <div className="flex flex-col gap-4 border-b border-[#E6E1D9] pb-5 sm:flex-row sm:items-end sm:justify-between">
        <div className="space-y-1.5 max-w-2xl">
          <div className="flex items-center gap-2 text-xs font-medium text-[#667085]">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-[#E85A32]">
              {stepNumber}
            </span>
            {lastGeneratedAt && (
              <>
                <span aria-hidden="true">·</span>
                <span className="tabular-nums">
                  Updated{' '}
                  {new Intl.DateTimeFormat('en-US', {
                    month: 'short',
                    day: 'numeric',
                    hour: 'numeric',
                    minute: '2-digit',
                  }).format(new Date(lastGeneratedAt))}
                </span>
              </>
            )}
          </div>
          <h1 className="text-2xl font-semibold tracking-tight text-[#172B43]">
            {title}
          </h1>
          <p className="text-sm leading-relaxed text-[#667085]">{description}</p>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          {secondaryAction && (
            <button
              type="button"
              onClick={secondaryAction.onClick}
              disabled={isLoading}
              className="inline-flex items-center justify-center rounded-lg border border-[#E6E1D9] bg-white px-4 py-2 text-sm font-medium text-[#172B43] transition-colors hover:bg-[#F5F3EF] disabled:opacity-50 whitespace-nowrap shrink-0 cursor-pointer"
            >
              {secondaryAction.label}
            </button>
          )}
          <button
            type="button"
            onClick={onAction}
            disabled={isLoading || disabled}
            className="inline-flex items-center justify-center gap-2 rounded-lg bg-[#E85A32] px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-[#D44A23] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#E85A32] disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap shrink-0 cursor-pointer"
          >
            <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
            {isLoading ? 'Generating...' : actionLabel}
          </button>
        </div>
      </div>

      {error && (
        <div
          role="alert"
          className="flex flex-col gap-3 rounded-lg border border-[#FECACA] bg-[#FEF2F2] p-4 sm:flex-row sm:items-center sm:justify-between"
        >
          <div className="flex items-start gap-3">
            <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-[#B91C1C]" />
            <div className="text-sm text-[#7F1D1D]">
              <p className="font-medium">Generation error</p>
              <p className="mt-0.5 text-[#991B1B]">{error}</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onAction}
            disabled={isLoading}
            className="inline-flex items-center gap-1.5 rounded-lg border border-[#FECACA] bg-white px-3 py-1.5 text-xs font-medium text-[#991B1B] hover:bg-[#FEE2E2] whitespace-nowrap shrink-0 cursor-pointer"
          >
            <RefreshCw className="h-3.5 w-3.5" />
            Retry
          </button>
        </div>
      )}
    </div>
  );
}
