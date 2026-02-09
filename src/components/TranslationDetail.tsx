import { useState, useEffect } from 'react';
import { TranslationItem, TranslationState, VALID_ACTIONS, AUTO_PROGRESS_STATES } from '@/types/translation';
import { StateBadge } from './StateBadge';
import { ScoreBadge } from './ScoreBadge';
import { WorkflowProgress } from './WorkflowProgress';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { 
  CheckCircle2, 
  XCircle, 
  Languages, 
  Shield, 
  Database,
  Pencil,
  RotateCcw,
  Sparkles,
  X,
  Save,
  Loader2,
  RefreshCw
} from 'lucide-react';

interface TranslationDetailProps {
  item: TranslationItem;
  onAction: (item: TranslationItem, action: string, edits?: { key?: string; zu?: string; ko?: string; en?: string }) => void;
  onClose: () => void;
  isProcessing?: boolean;
}

interface EditableFields {
  key: string;
  zu: string;
  ko: string;
  en: string;
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

export function TranslationDetail({ item, onAction, onClose, isProcessing }: TranslationDetailProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editedKo, setEditedKo] = useState(item.ko || '');
  const [editableFields, setEditableFields] = useState<EditableFields>({
    key: item.key,
    zu: item.zu,
    ko: item.ko || '',
    en: item.en || '',
  });
  
  const isReviewRequired = item.state === 'review_required';
  const validActions = VALID_ACTIONS[item.state] || [];
  const isAutoState = AUTO_PROGRESS_STATES.includes(item.state);
  const isStuck = isAutoState && !isProcessing;

  // Reset editable fields when item changes
  useEffect(() => {
    setEditableFields({
      key: item.key,
      zu: item.zu,
      ko: item.ko || '',
      en: item.en || '',
    });
    setEditedKo(item.ko || '');
  }, [item]);

  const handleAction = (action: string) => {
    if (action === 'edit') {
      setIsEditing(true);
    } else if (action === 'approve' && isEditing) {
      onAction(item, 'approve', { ko: editedKo });
      setIsEditing(false);
    } else {
      onAction(item, action);
    }
  };

  const handleSaveEdit = () => {
    onAction(item, 'approve', { ko: editedKo });
    setIsEditing(false);
  };

  const handleReviewApprove = () => {
    onAction(item, 'review_approve', editableFields);
  };

  const updateField = (field: keyof EditableFields, value: string) => {
    setEditableFields(prev => ({ ...prev, [field]: value }));
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
        {/* Key */}
        <div>
          <label className="block text-sm font-medium text-muted-foreground mb-2">
            Translation Key
          </label>
          {isReviewRequired ? (
            <Input
              value={editableFields.key}
              onChange={(e) => updateField('key', e.target.value)}
              className="font-mono"
            />
          ) : (
            <div className="p-3 bg-muted/50 rounded-lg border border-border">
              <code className="font-mono text-foreground">{item.key}</code>
            </div>
          )}
        </div>

        {/* Source (ZU) */}
        <div>
          <label className="block text-sm font-medium text-muted-foreground mb-2">
            Source (Zulu)
          </label>
          {isReviewRequired ? (
            <Textarea
              value={editableFields.zu}
              onChange={(e) => updateField('zu', e.target.value)}
              rows={2}
            />
          ) : (
            <div className="p-3 bg-muted/50 rounded-lg border border-border">
              <p className="text-foreground">{item.zu}</p>
            </div>
          )}
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
          ) : isReviewRequired ? (
            <Textarea
              value={editableFields.ko}
              onChange={(e) => updateField('ko', e.target.value)}
              rows={2}
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
          {isReviewRequired ? (
            <Textarea
              value={editableFields.en}
              onChange={(e) => updateField('en', e.target.value)}
              rows={2}
            />
          ) : (
            <div className="p-3 bg-muted/50 rounded-lg border border-border min-h-[60px]">
              <p className="text-foreground">{item.en || <span className="text-muted-foreground italic">Not yet translated</span>}</p>
            </div>
          )}
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
      {(validActions.length > 0 || isEditing || isReviewRequired || isProcessing || isStuck) && (
        <div className="mt-8 pt-6 border-t border-border">
          {isProcessing && (
            <div className="flex items-center gap-2 text-primary mb-4">
              <Loader2 className="w-4 h-4 animate-spin" />
              <span className="text-sm font-medium">Auto-progressing...</span>
            </div>
          )}
          
          {isStuck && (
            <div className="flex items-center gap-3 mb-4 p-3 rounded-lg bg-amber-500/10 border border-amber-500/20">
              <span className="text-sm text-amber-700">
                This item appears to be stuck. Click retry to continue the workflow.
              </span>
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => onAction(item, 'retry_step')}
              >
                <RefreshCw className="w-4 h-4 mr-2" />
                Retry
              </Button>
            </div>
          )}
          
          <div className="flex flex-wrap gap-3">
            {isReviewRequired ? (
              <>
                <Button onClick={handleReviewApprove}>
                  <CheckCircle2 className="w-4 h-4 mr-2" />
                  Validate & Approve
                </Button>
                <Button 
                  variant="destructive" 
                  onClick={() => onAction(item, 'reject')}
                >
                  <XCircle className="w-4 h-4 mr-2" />
                  Reject
                </Button>
              </>
            ) : isEditing ? (
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
                    disabled={isProcessing}
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
