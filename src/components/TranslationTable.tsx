import { TranslationItem } from '@/types/translation';
import { StateBadge } from './StateBadge';
import { ScoreBadge } from './ScoreBadge';
import { formatDistanceToNow } from 'date-fns';

interface TranslationTableProps {
  items: TranslationItem[];
  onSelectItem: (item: TranslationItem) => void;
  selectedId?: string;
}

export function TranslationTable({ items, onSelectItem, selectedId }: TranslationTableProps) {
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
          {items.map((item) => (
            <tr
              key={item.id}
              onClick={() => onSelectItem(item)}
              className={`watchtower-table-row cursor-pointer ${
                selectedId === item.id ? 'bg-primary/5' : ''
              }`}
            >
              <td className="px-4 py-3">
                <code className="font-mono text-sm text-foreground">{item.key}</code>
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
          ))}
        </tbody>
      </table>
    </div>
  );
}
