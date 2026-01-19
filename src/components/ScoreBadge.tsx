import { cn } from '@/lib/utils';
import { ValidationScore } from '@/types/translation';

interface ScoreBadgeProps {
  score: ValidationScore;
  className?: string;
}

const scoreStyles: Record<Exclude<ValidationScore, null>, string> = {
  high: 'bg-score-high/10 text-score-high',
  medium: 'bg-score-medium/10 text-score-medium',
  low: 'bg-score-low/10 text-score-low',
};

const scoreLabels: Record<Exclude<ValidationScore, null>, string> = {
  high: 'High',
  medium: 'Medium',
  low: 'Low',
};

export function ScoreBadge({ score, className }: ScoreBadgeProps) {
  if (!score) {
    return (
      <span className={cn('text-xs text-muted-foreground', className)}>—</span>
    );
  }

  return (
    <span
      className={cn(
        'inline-flex items-center px-2 py-0.5 rounded text-xs font-medium',
        scoreStyles[score],
        className
      )}
    >
      {scoreLabels[score]}
    </span>
  );
}
