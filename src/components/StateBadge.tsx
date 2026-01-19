import { cn } from '@/lib/utils';
import { TranslationState, STATE_LABELS } from '@/types/translation';

interface StateBadgeProps {
  state: TranslationState;
  className?: string;
}

const stateStyles: Record<TranslationState, string> = {
  received: 'bg-state-received/10 text-state-received border-state-received/20',
  draft: 'bg-state-draft/10 text-state-draft border-state-draft/20',
  approved: 'bg-state-approved/10 text-state-approved border-state-approved/20',
  translated: 'bg-state-translated/10 text-state-translated border-state-translated/20',
  validated: 'bg-state-validated/10 text-state-validated border-state-validated/20',
  review_required: 'bg-state-review/10 text-state-review border-state-review/20',
  rejected: 'bg-state-rejected/10 text-state-rejected border-state-rejected/20',
  stored: 'bg-state-stored/10 text-state-stored border-state-stored/20',
};

export function StateBadge({ state, className }: StateBadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border',
        stateStyles[state],
        className
      )}
    >
      {STATE_LABELS[state]}
    </span>
  );
}
