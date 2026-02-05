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
import { Plus, Upload } from 'lucide-react';
import { toast } from 'sonner';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

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
  const [activeTab, setActiveTab] = useState<'single' | 'json'>('single');
  
  // Single entry state
  const [context, setContext] = useState('');
  const [key, setKey] = useState('');
  const [zu, setZu] = useState('');
  const [errors, setErrors] = useState<{ context?: string; key?: string; zu?: string }>({});

  // JSON import state
  const [jsonContext, setJsonContext] = useState('');
  const [jsonInput, setJsonInput] = useState('');
  const [jsonError, setJsonError] = useState<string | null>(null);

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

  const handleJsonSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setJsonError(null);

    if (!jsonContext.trim()) {
      setJsonError('Context is required');
      return;
    }

    if (jsonContext.trim().length > 50) {
      setJsonError('Context must be less than 50 characters');
      return;
    }

    let parsed: Record<string, string>;
    try {
      parsed = JSON.parse(jsonInput);
    } catch {
      setJsonError('Invalid JSON format');
      return;
    }

    if (typeof parsed !== 'object' || parsed === null || Array.isArray(parsed)) {
      setJsonError('JSON must be an object with key-value pairs');
      return;
    }

    const entries = Object.entries(parsed);
    if (entries.length === 0) {
      setJsonError('JSON object is empty');
      return;
    }

    // Validate all keys
    const keyRegex = /^[a-z0-9._-]+$/i;
    const invalidKeys: string[] = [];
    const duplicateKeys: string[] = [];

    for (const [k, v] of entries) {
      if (!keyRegex.test(k)) {
        invalidKeys.push(k);
      }
      if (existingKeys.includes(k)) {
        duplicateKeys.push(k);
      }
      if (typeof v !== 'string') {
        setJsonError(`Value for key "${k}" must be a string`);
        return;
      }
    }

    if (invalidKeys.length > 0) {
      setJsonError(`Invalid key format: ${invalidKeys.slice(0, 3).join(', ')}${invalidKeys.length > 3 ? '...' : ''}`);
      return;
    }

    if (duplicateKeys.length > 0) {
      setJsonError(`Duplicate keys: ${duplicateKeys.slice(0, 3).join(', ')}${duplicateKeys.length > 3 ? '...' : ''}`);
      return;
    }

    // Add all translations
    for (const [k, v] of entries) {
      onSubmit(k, v, jsonContext.trim());
    }

    toast.success(`${entries.length} translation(s) added to workflow`);
    
    // Reset form
    setJsonContext('');
    setJsonInput('');
    setIsOpen(false);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      setJsonInput(content);
      setJsonError(null);
    };
    reader.onerror = () => {
      setJsonError('Failed to read file');
    };
    reader.readAsText(file);
    
    // Reset input to allow re-uploading same file
    e.target.value = '';
  };

  const handleCancel = () => {
    setContext('');
    setKey('');
    setZu('');
    setErrors({});
    setJsonContext('');
    setJsonInput('');
    setJsonError(null);
    setActiveTab('single');
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
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Add New Translation</DialogTitle>
        </DialogHeader>
        
        <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as 'single' | 'json')}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="single">Single Entry</TabsTrigger>
            <TabsTrigger value="json">JSON Import</TabsTrigger>
          </TabsList>
          
          <TabsContent value="single">
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
          </TabsContent>
          
          <TabsContent value="json">
            <form onSubmit={handleJsonSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-muted-foreground mb-2">
                  Context (Category)
                </label>
                <Input
                  value={jsonContext}
                  onChange={(e) => setJsonContext(e.target.value)}
                  placeholder="e.g., onboarding, settings, errors"
                  className={jsonError?.includes('Context') ? 'border-destructive' : ''}
                />
                <p className="mt-1 text-xs text-muted-foreground">
                  All imported keys will use this context
                </p>
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-sm font-medium text-muted-foreground">
                    JSON Data
                  </label>
                  <label className="cursor-pointer">
                    <input
                      type="file"
                      accept=".json"
                      onChange={handleFileUpload}
                      className="hidden"
                    />
                    <span className="inline-flex items-center text-xs text-primary hover:underline">
                      <Upload className="w-3 h-3 mr-1" />
                      Upload File
                    </span>
                  </label>
                </div>
                <Textarea
                  value={jsonInput}
                  onChange={(e) => {
                    setJsonInput(e.target.value);
                    setJsonError(null);
                  }}
                  placeholder={'{\n  "key1": "Zulu text 1",\n  "key2": "Zulu text 2"\n}'}
                  className={jsonError && !jsonError.includes('Context') ? 'border-destructive font-mono text-xs' : 'font-mono text-xs'}
                  rows={6}
                />
                {jsonError && (
                  <p className="mt-1 text-sm text-destructive">{jsonError}</p>
                )}
                <p className="mt-1 text-xs text-muted-foreground">
                  Paste JSON or upload a .json file with key-value pairs
                </p>
              </div>

              <div className="flex gap-3 pt-2">
                <Button type="submit">
                  <Upload className="w-4 h-4 mr-2" />
                  Import All
                </Button>
                <Button type="button" variant="outline" onClick={handleCancel}>
                  Cancel
                </Button>
              </div>
            </form>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
