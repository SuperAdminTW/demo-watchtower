import { useState } from 'react';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Plus, X } from 'lucide-react';
import { toast } from 'sonner';

const translationSchema = z.object({
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
  onSubmit: (key: string, zu: string) => void;
  existingKeys: string[];
}

export function NewTranslationForm({ onSubmit, existingKeys }: NewTranslationFormProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [key, setKey] = useState('');
  const [zu, setZu] = useState('');
  const [errors, setErrors] = useState<{ key?: string; zu?: string }>({});

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});

    // Validate with zod
    const result = translationSchema.safeParse({ key, zu });

    if (!result.success) {
      const fieldErrors: { key?: string; zu?: string } = {};
      result.error.errors.forEach((err) => {
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

    onSubmit(result.data.key, result.data.zu);
    toast.success('Translation added to workflow');
    
    // Reset form
    setKey('');
    setZu('');
    setIsOpen(false);
  };

  const handleCancel = () => {
    setKey('');
    setZu('');
    setErrors({});
    setIsOpen(false);
  };

  if (!isOpen) {
    return (
      <Button onClick={() => setIsOpen(true)}>
        <Plus className="w-4 h-4 mr-2" />
        New Translation
      </Button>
    );
  }

  return (
    <div className="watchtower-card p-6 animate-fade-in">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-foreground">Add New Translation</h3>
        <Button variant="ghost" size="icon" onClick={handleCancel}>
          <X className="w-4 h-4" />
        </Button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
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
    </div>
  );
}
