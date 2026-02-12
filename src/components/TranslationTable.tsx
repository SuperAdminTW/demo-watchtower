import { TranslationItem, AUTO_PROGRESS_STATES } from '@/types/translation';
import { StateBadge } from './StateBadge';
import { ScoreBadge } from './ScoreBadge';
import { formatDistanceToNow } from 'date-fns';
import { Loader2, Copy } from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

interface TranslationTableProps {
  items: TranslationItem[];
  onSelectItem: (item: TranslationItem) => void;
  selectedId?: string;
  processingIds: Set<string>;
}

function CopyButton({ text, label }: { text: string | null; label: string }) {
  if (!text) return null;
  const handleCopy = (e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard.writeText(text);
    toast.success(`${label} copied`);
  };
  return (
    <button
      onClick={handleCopy}
      className="p-0.5 rounded hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
      title={`Copy ${label}`}
    >
      <Copy className="w-3 h-3" />
    </button>
  );
}

function TranslationLine({ label, text, lang }: { label: string; text: string | null; lang: string }) {
  return (
    <div className="flex items-center gap-1.5 text-sm">
      <CopyButton text={text} label={label} />
      <span className="text-[10px] font-semibold uppercase text-muted-foreground w-5 shrink-0">{lang}</span>
      <span className={cn('truncate', text ? 'text-foreground' : 'text-muted-foreground italic')}>
        {text || '—'}
      </span>
    </div>
  );
}

export function TranslationTable({ items, onSelectItem, selectedId, processingIds }: TranslationTableProps) {
  return (
    <div className="watchtower-card overflow-hidden divide-y divide-border">
      {items.map((item) => {
        const isProcessing = processingIds.has(item.id);
        const isAutoState = AUTO_PROGRESS_STATES.includes(item.state);
        const isStuck = isAutoState && !isProcessing;

        return (
          <div
            key={item.id}
            onClick={() => onSelectItem(item)}
            className={cn(
              'watchtower-table-row cursor-pointer px-4 py-3 flex gap-4',
              selectedId === item.id && 'bg-primary/5',
              isProcessing && 'bg-blue-500/5',
              isStuck && 'bg-amber-500/10'
            )}
          >
            {/* Left: Key */}
            <div className="shrink-0 w-40">
              <div className="flex items-center gap-1.5">
                <code className="font-mono text-sm text-foreground truncate">{item.key}</code>
                {isProcessing && <Loader2 className="w-3 h-3 animate-spin text-primary shrink-0" />}
                {isStuck && <span className="text-xs text-amber-600 font-medium shrink-0">Stuck</span>}
              </div>
              <div className="mt-1">
                <StateBadge state={item.state} />
              </div>
            </div>

            {/* Middle: 3 translation lines */}
            <div className="flex-1 min-w-0 space-y-0.5">
              <TranslationLine label="Zulu" text={item.zu} lang="ZU" />
              <TranslationLine label="Korean" text={item.ko} lang="KO" />
              <TranslationLine label="English" text={item.en} lang="EN" />
            </div>

            {/* Right: Score & Updated */}
            <div className="shrink-0 text-right space-y-1">
              <ScoreBadge score={item.score} />
              <div className="text-xs text-muted-foreground">
                {formatDistanceToNow(new Date(item.updatedAt), { addSuffix: true })}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
