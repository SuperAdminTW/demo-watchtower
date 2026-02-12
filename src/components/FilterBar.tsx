import { useState } from 'react';
import { Plus, X, Filter } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

export type FilterField = 'context' | 'key' | 'zu';

export type FilterOperator = 'contains' | 'not_contains' | 'equals' | 'starts_with' | 'ends_with';

export interface FilterCondition {
  id: string;
  field: FilterField;
  operator: FilterOperator;
  value: string;
}

const FIELD_LABELS: Record<FilterField, string> = {
  context: 'Context',
  key: 'Key',
  zu: 'Source Text',
};

const OPERATOR_LABELS: Record<FilterOperator, string> = {
  contains: 'Contains',
  not_contains: 'Does not contain',
  equals: 'Equals',
  starts_with: 'Starts with',
  ends_with: 'Ends with',
};

interface FilterBarProps {
  conditions: FilterCondition[];
  onChange: (conditions: FilterCondition[]) => void;
}

export function FilterBar({ conditions, onChange }: FilterBarProps) {
  const addCondition = () => {
    if (conditions.length >= 5) return;
    onChange([
      ...conditions,
      { id: crypto.randomUUID(), field: 'key', operator: 'contains', value: '' },
    ]);
  };

  const updateCondition = (id: string, updates: Partial<FilterCondition>) => {
    onChange(conditions.map((c) => (c.id === id ? { ...c, ...updates } : c)));
  };

  const removeCondition = (id: string) => {
    onChange(conditions.filter((c) => c.id !== id));
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <Filter className="w-4 h-4 text-muted-foreground" />
        <span className="text-sm font-medium text-muted-foreground">Filters</span>
        {conditions.length < 5 && (
          <Button variant="ghost" size="sm" onClick={addCondition} className="h-7 px-2 text-xs">
            <Plus className="w-3 h-3 mr-1" />
            Add filter
          </Button>
        )}
        {conditions.length > 0 && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onChange([])}
            className="h-7 px-2 text-xs text-muted-foreground ml-auto"
          >
            Clear all
          </Button>
        )}
      </div>

      {conditions.map((condition) => (
        <div key={condition.id} className="flex items-center gap-2 flex-wrap">
          <Select
            value={condition.field}
            onValueChange={(v) => updateCondition(condition.id, { field: v as FilterField })}
          >
            <SelectTrigger className="w-[130px] h-8 text-xs">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {Object.entries(FIELD_LABELS).map(([value, label]) => (
                <SelectItem key={value} value={value}>
                  {label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select
            value={condition.operator}
            onValueChange={(v) => updateCondition(condition.id, { operator: v as FilterOperator })}
          >
            <SelectTrigger className="w-[160px] h-8 text-xs">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {Object.entries(OPERATOR_LABELS).map(([value, label]) => (
                <SelectItem key={value} value={value}>
                  {label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Input
            value={condition.value}
            onChange={(e) => updateCondition(condition.id, { value: e.target.value })}
            placeholder="Enter value…"
            className="flex-1 min-w-[140px] h-8 text-xs"
          />

          <Button
            variant="ghost"
            size="icon"
            onClick={() => removeCondition(condition.id)}
            className="h-8 w-8 text-muted-foreground hover:text-destructive shrink-0"
          >
            <X className="w-4 h-4" />
          </Button>
        </div>
      ))}
    </div>
  );
}

export function applyFilterConditions<T extends Record<string, any>>(
  items: T[],
  conditions: FilterCondition[]
): T[] {
  if (conditions.length === 0) return items;

  return items.filter((item) =>
    conditions.every((c) => {
      if (!c.value) return true;
      const fieldValue = String(item[c.field] ?? '').toLowerCase();
      const search = c.value.toLowerCase();

      switch (c.operator) {
        case 'contains': return fieldValue.includes(search);
        case 'not_contains': return !fieldValue.includes(search);
        case 'equals': return fieldValue === search;
        case 'starts_with': return fieldValue.startsWith(search);
        case 'ends_with': return fieldValue.endsWith(search);
        default: return true;
      }
    })
  );
}
