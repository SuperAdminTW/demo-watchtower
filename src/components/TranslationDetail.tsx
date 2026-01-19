import { useState } from 'react';
import { TranslationItem, TranslationState, VALID_ACTIONS } from '@/types/translation';
import { StateBadge } from './StateBadge';
import { ScoreBadge } from './ScoreBadge';
import { WorkflowProgress } from './WorkflowProgress';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { 
  CheckCircle2, 
  XCircle, 
  Languages, 
  Shield, 
  Database,
  Pencil,
  RotateCcw,
  Sparkles,
  X
} from 'lucide-react';

interface TranslationDetailProps {
  item: TranslationItem;
  onAction: (item: TranslationItem, action: string, editedKo?: string) => void;
  onClose: () => void;
}

const actionConfig: Record<string, { icon: React.ComponentType<{ className?: string }>; label: string; variant: 'default' | 'destructive' | 'outline' | 'secondary' }> = {
  generate_draft: { icon: Sparkles, label: 'Generate Draft (KO)', variant: 'default' },
  approve: { icon: CheckCircle2, label: 'Approve', variant: 'default' },
  edit: { icon: Pencil, label: 'Edit & Approve', variant: 'secondary' },
  reject: { icon: XCircle, label: 'Reject', variant: 'destructive' },
  translate: { icon: Languages, label: 'Translate to EN', variant: 'default' },
  validate: { icon: Shield, label: 'Validate', variant: 'default' },
  store: { icon: Database, label: 'Store to TM', variant: 'default' },
  retry: { icon: RotateCcw, label: 'Retry', variant: 'outline' },
};

export function TranslationDetail({ item, onAction, onClose }: TranslationDetailProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editedKo, setEditedKo] = useState(item.ko || '');
  
  const validActions = VALID_ACTIONS[item.state] || [];

  const handleAction = (action: string) => {
    if (action === 'edit') {
      setIsEditing(true);
    } else if (action === 'approve' && isEditing) {
      onAction(item, 'approve', editedKo);
      setIsEditing(false);
    } else {
      onAction(item, action);
    }
  };

  const handleSaveEdit = () => {
    onAction(item, 'approve', editedKo);
    setIsEditing(false);
  };

  return (
    <div className="watchtower-card p-6 animate-fade-in">
      <div className="flex items-start justify-between mb-6">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <code className="font-mono text-lg font-semibold text-foreground">{item.key}</code>
            <StateBadge state={item.state} />
          </div>
          <p className="text-sm text-muted-foreground">
            Last updated: {new Date(item.updatedAt).toLocaleString()}
          </p>
        </div>
        <Button variant="ghost" size="icon" onClick={onClose}>
          <X className="w-4 h-4" />
        </Button>
      </div>

      <WorkflowProgress currentState={item.state} className="mb-8" />

      <div className="space-y-6">
        {/* Source (ZU) */}
        <div>
          <label className="block text-sm font-medium text-muted-foreground mb-2">
            Source (Zulu)
          </label>
          <div className="p-3 bg-muted/50 rounded-lg border border-border">
            <p className="text-foreground">{item.zu}</p>
          </div>
        </div>

        {/* Korean (KO) */}
        <div>
          <label className="block text-sm font-medium text-muted-foreground mb-2">
            Korean Translation
          </label>
          {isEditing ? (
            <Textarea
              value={editedKo}
              onChange={(e) => setEditedKo(e.target.value)}
              className="min-h-[100px]"
              placeholder="Enter Korean translation..."
            />
          ) : (
            <div className="p-3 bg-muted/50 rounded-lg border border-border min-h-[60px]">
              <p className="text-foreground">{item.ko || <span className="text-muted-foreground italic">Not yet generated</span>}</p>
            </div>
          )}
        </div>

        {/* English (EN) */}
        <div>
          <label className="block text-sm font-medium text-muted-foreground mb-2">
            English Translation
          </label>
          <div className="p-3 bg-muted/50 rounded-lg border border-border min-h-[60px]">
            <p className="text-foreground">{item.en || <span className="text-muted-foreground italic">Not yet translated</span>}</p>
          </div>
        </div>

        {/* Validation Score */}
        {item.score && (
          <div>
            <label className="block text-sm font-medium text-muted-foreground mb-2">
              Validation Score
            </label>
            <div className="flex items-center gap-3">
              <ScoreBadge score={item.score} />
              {item.notes && (
                <p className="text-sm text-muted-foreground">{item.notes}</p>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Actions */}
      {(validActions.length > 0 || isEditing) && (
        <div className="mt-8 pt-6 border-t border-border">
          <div className="flex flex-wrap gap-3">
            {isEditing ? (
              <>
                <Button onClick={handleSaveEdit}>
                  <CheckCircle2 className="w-4 h-4 mr-2" />
                  Save & Approve
                </Button>
                <Button variant="outline" onClick={() => setIsEditing(false)}>
                  Cancel
                </Button>
              </>
            ) : (
              validActions.map((action) => {
                const config = actionConfig[action];
                if (!config) return null;
                const Icon = config.icon;
                return (
                  <Button
                    key={action}
                    variant={config.variant}
                    onClick={() => handleAction(action)}
                  >
                    <Icon className="w-4 h-4 mr-2" />
                    {config.label}
                  </Button>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
}
