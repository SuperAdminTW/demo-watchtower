import { cn } from '@/lib/utils';
import { LucideIcon } from 'lucide-react';

interface StatsCardProps {
  title: string;
  value: number;
  icon: LucideIcon;
  trend?: 'up' | 'down' | 'neutral';
  trendValue?: string;
  className?: string;
}

export function StatsCard({ title, value, icon: Icon, trend, trendValue, className }: StatsCardProps) {
  return (
    <div className={cn('watchtower-card p-4', className)}>
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-medium text-muted-foreground">{title}</p>
          <p className="mt-1 text-2xl font-semibold text-foreground">{value}</p>
          {trendValue && (
            <p
              className={cn(
                'mt-1 text-xs font-medium',
                trend === 'up' && 'text-score-high',
                trend === 'down' && 'text-score-low',
                trend === 'neutral' && 'text-muted-foreground'
              )}
            >
              {trendValue}
            </p>
          )}
        </div>
        <div className="p-2 rounded-lg bg-muted">
          <Icon className="w-5 h-5 text-muted-foreground" />
        </div>
      </div>
    </div>
  );
}
