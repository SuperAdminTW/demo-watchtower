import { useState } from 'react';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Plus, X } from 'lucide-react';
import { toast } from 'sonner';

const translationSchema = z.object({
  context: z
    .string()
    .trim()
    .min(1, 'Context is required')
    .max(50, 'Context must be less than 50 characters'),
  key: z
    .string()
    .trim()
    .min(1, 'Key is required')
    .max(100, 'Key must be less than 100 characters')
    .regex(/^[a-z0-9._-]+$/i, 'Key must contain only letters, numbers, dots, dashes, and underscores'),
  zu: z
    .string()
    .trim()
    .min(1, 'Zulu source text is required')
    .max(500, 'Source text must be less than 500 characters'),
});

interface NewTranslationFormProps {
  onSubmit: (key: string, zu: string, context: string) => void;
  existingKeys: string[];
}

export function NewTranslationForm({ onSubmit, existingKeys }: NewTranslationFormProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [context, setContext] = useState('');
  const [key, setKey] = useState('');
  const [zu, setZu] = useState('');
  const [errors, setErrors] = useState<{ context?: string; key?: string; zu?: string }>({});

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});

    // Validate with zod
    const result = translationSchema.safeParse({ context, key, zu });

    if (!result.success) {
      const fieldErrors: { context?: string; key?: string; zu?: string } = {};
      result.error.errors.forEach((err) => {
        if (err.path[0] === 'context') fieldErrors.context = err.message;
        if (err.path[0] === 'key') fieldErrors.key = err.message;
        if (err.path[0] === 'zu') fieldErrors.zu = err.message;
      });
      setErrors(fieldErrors);
      return;
    }

    // Check for duplicate keys
    if (existingKeys.includes(result.data.key)) {
      setErrors({ key: 'This key already exists' });
      return;
    }

    onSubmit(result.data.key, result.data.zu, result.data.context);
    toast.success('Translation added to workflow');
    
    // Reset form
    setContext('');
    setKey('');
    setZu('');
    setIsOpen(false);
  };

  const handleCancel = () => {
    setContext('');
    setKey('');
    setZu('');
    setErrors({});
    setIsOpen(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => {
      if (!open) handleCancel();
      setIsOpen(open);
    }}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="w-4 h-4 mr-2" />
          New Translation
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Add New Translation</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-muted-foreground mb-2">
              Context (Category)
            </label>
            <Input
              value={context}
              onChange={(e) => setContext(e.target.value)}
              placeholder="e.g., onboarding, settings, errors"
              className={errors.context ? 'border-destructive' : ''}
            />
            {errors.context && (
              <p className="mt-1 text-sm text-destructive">{errors.context}</p>
            )}
            <p className="mt-1 text-xs text-muted-foreground">
              Group related keys (e.g., onboarding, dashboard, errors)
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-muted-foreground mb-2">
              Translation Key
            </label>
            <Input
              value={key}
              onChange={(e) => setKey(e.target.value)}
              placeholder="e.g., app.button.save"
              className={errors.key ? 'border-destructive' : ''}
            />
            {errors.key && (
              <p className="mt-1 text-sm text-destructive">{errors.key}</p>
            )}
            <p className="mt-1 text-xs text-muted-foreground">
              Use dot notation (e.g., app.section.element)
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-muted-foreground mb-2">
              Source Text (Zulu)
            </label>
            <Textarea
              value={zu}
              onChange={(e) => setZu(e.target.value)}
              placeholder="Enter the Zulu source text..."
              className={errors.zu ? 'border-destructive' : ''}
              rows={3}
            />
            {errors.zu && (
              <p className="mt-1 text-sm text-destructive">{errors.zu}</p>
            )}
          </div>

          <div className="flex gap-3 pt-2">
            <Button type="submit">
              <Plus className="w-4 h-4 mr-2" />
              Add to Workflow
            </Button>
            <Button type="button" variant="outline" onClick={handleCancel}>
              Cancel
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
