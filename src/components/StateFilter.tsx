import { TranslationState, STATE_LABELS } from '@/types/translation';
import { cn } from '@/lib/utils';

interface StateFilterProps {
  selectedState: TranslationState | 'all';
  onStateChange: (state: TranslationState | 'all') => void;
  counts: Record<TranslationState | 'all', number>;
}

const states: (TranslationState | 'all')[] = [
  'all',
  'received',
  'draft',
  'approved',
  'translated',
  'validated',
  'review_required',
  'rejected',
  'stored',
];

export function StateFilter({ selectedState, onStateChange, counts }: StateFilterProps) {
  return (
    <div className="flex flex-wrap gap-2">
      {states.map((state) => (
        <button
          key={state}
          onClick={() => onStateChange(state)}
          className={cn(
            'inline-flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium transition-all',
            selectedState === state
              ? 'bg-primary text-primary-foreground'
              : 'bg-muted/50 text-muted-foreground hover:bg-muted hover:text-foreground'
          )}
        >
          <span>{state === 'all' ? 'All' : STATE_LABELS[state]}</span>
          <span
            className={cn(
              'inline-flex items-center justify-center min-w-[20px] h-5 px-1.5 rounded-full text-xs',
              selectedState === state
                ? 'bg-primary-foreground/20 text-primary-foreground'
                : 'bg-background text-muted-foreground'
            )}
          >
            {counts[state]}
          </span>
        </button>
      ))}
    </div>
  );
}
