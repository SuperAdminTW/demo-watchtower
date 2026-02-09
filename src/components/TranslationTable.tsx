import { TranslationItem, AUTO_PROGRESS_STATES } from '@/types/translation';
import { StateBadge } from './StateBadge';
import { ScoreBadge } from './ScoreBadge';
import { formatDistanceToNow } from 'date-fns';
import { Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface TranslationTableProps {
  items: TranslationItem[];
  onSelectItem: (item: TranslationItem) => void;
  selectedId?: string;
  processingIds: Set<string>;
}

export function TranslationTable({ items, onSelectItem, selectedId, processingIds }: TranslationTableProps) {
  return (
    <div className="watchtower-card overflow-hidden">
      <table className="w-full">
        <thead>
          <tr className="border-b border-border bg-muted/30">
            <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Key
            </th>
            <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              State
            </th>
            <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Score
            </th>
            <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Updated
            </th>
          </tr>
        </thead>
        <tbody>
          {items.map((item) => {
            const isProcessing = processingIds.has(item.id);
            const isAutoState = AUTO_PROGRESS_STATES.includes(item.state);
            const isStuck = isAutoState && !isProcessing;
            
            return (
              <tr
                key={item.id}
                onClick={() => onSelectItem(item)}
                className={cn(
                  'watchtower-table-row cursor-pointer',
                  selectedId === item.id && 'bg-primary/5',
                  isProcessing && 'bg-blue-500/5',
                  isStuck && 'bg-amber-500/10'
                )}
              >
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    <code className="font-mono text-sm text-foreground">{item.key}</code>
                    {isProcessing && (
                      <Loader2 className="w-3 h-3 animate-spin text-primary" />
                    )}
                    {isStuck && (
                      <span className="text-xs text-amber-600 font-medium">Stuck</span>
                    )}
                  </div>
                </td>
                <td className="px-4 py-3">
                  <StateBadge state={item.state} />
                </td>
                <td className="px-4 py-3">
                  <ScoreBadge score={item.score} />
                </td>
                <td className="px-4 py-3 text-sm text-muted-foreground">
                  {formatDistanceToNow(new Date(item.updatedAt), { addSuffix: true })}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
