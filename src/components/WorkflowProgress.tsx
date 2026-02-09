import { cn } from '@/lib/utils';
import { TranslationState, STATE_ORDER } from '@/types/translation';
import { Check } from 'lucide-react';

interface WorkflowProgressProps {
  currentState: TranslationState;
  className?: string;
}

const stateToIndex: Record<TranslationState, number> = {
  received: 0,
  draft: 1,
  approved: 2,
  translated: 3,
  validated: 4,
  review_required: 4,
  rejected: -1,
  stored: 5,
};

const stepLabels = ['Received', 'Draft', 'Approved', 'Translated', 'Validated', 'Stored'];

export function WorkflowProgress({ currentState, className }: WorkflowProgressProps) {
  const currentIndex = stateToIndex[currentState];
  const isRejected = currentState === 'rejected';
  const isReviewRequired = currentState === 'review_required';

  return (
    <div className={cn('flex items-center w-full max-w-2xl', className)}>
      {stepLabels.map((label, index) => {
        const isComplete = currentIndex > index;
        const isActive = currentIndex === index;
        const isPending = currentIndex < index;

        return (
          <div key={label} className="flex items-center flex-1 last:flex-none">
            <div className="flex flex-col items-center">
              <div
                className={cn(
                  'workflow-step',
                  isComplete && 'workflow-step-complete',
                  isActive && !isRejected && 'workflow-step-active',
                  isActive && isReviewRequired && 'bg-state-review text-white ring-4 ring-state-review/20',
                  isPending && 'workflow-step-pending',
                  isRejected && isActive && 'bg-state-rejected text-white ring-4 ring-state-rejected/20'
                )}
              >
                {isComplete ? (
                  <Check className="w-4 h-4" />
                ) : (
                  <span>{index + 1}</span>
                )}
              </div>
              <span
                className={cn(
                  'mt-2 text-xs font-medium whitespace-nowrap',
                  isActive ? 'text-foreground' : 'text-muted-foreground'
                )}
              >
                {label}
              </span>
            </div>
            {index < stepLabels.length - 1 && (
              <div
                className={cn(
                  'workflow-connector mt-[-20px]',
                  isComplete ? 'workflow-connector-complete' : 'workflow-connector-pending'
                )}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}
