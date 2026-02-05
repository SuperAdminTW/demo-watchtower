import { useState, useCallback, useMemo } from 'react';
import { TranslationItem, TranslationState } from '@/types/translation';
import { toast } from 'sonner';

export function useTranslations() {
  const [items, setItems] = useState<TranslationItem[]>([]);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const refresh = useCallback(async () => {
    setIsRefreshing(true);
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 800));
    setIsRefreshing(false);
    toast.success('Data refreshed');
  }, []);

  const addItem = useCallback((key: string, zu: string, context: string) => {
    const newItem: TranslationItem = {
      id: `item-${Date.now()}`,
      key,
      context,
      zu,
      ko: null,
      en: null,
      state: 'received',
      score: null,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    setItems((prev) => [newItem, ...prev]);
    return newItem;
  }, []);

  const updateItem = useCallback((id: string, updates: Partial<TranslationItem>) => {
    setItems((prev) =>
      prev.map((item) =>
        item.id === id
          ? { ...item, ...updates, updatedAt: new Date().toISOString() }
          : item
      )
    );
  }, []);

  const performAction = useCallback(
    async (item: TranslationItem, action: string, edits?: { key?: string; zu?: string; ko?: string; en?: string }) => {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 500));

      let newState: TranslationState = item.state;
      let updates: Partial<TranslationItem> = {};

      switch (action) {
        case 'generate_draft':
          newState = 'draft';
          updates = {
            ko: '자동 생성된 한국어 번역', // Mock generated Korean
          };
          toast.success('Draft generated successfully');
          break;
        case 'approve':
          newState = 'approved';
          if (edits?.ko) {
            updates.ko = edits.ko;
          }
          toast.success('Translation approved');
          break;
        case 'review_approve':
          newState = 'validated';
          updates = {
            key: edits?.key || item.key,
            zu: edits?.zu || item.zu,
            ko: edits?.ko || item.ko,
            en: edits?.en || item.en,
            score: 'high' as const,
          };
          toast.success('Translation validated and approved');
          break;
        case 'reject':
          newState = 'rejected';
          toast.info('Translation rejected');
          break;
        case 'translate':
          newState = 'translated';
          updates = {
            en: 'Auto-translated English text', // Mock translation
          };
          toast.success('Translation completed');
          break;
        case 'validate':
          // Simulate random validation score
          const scores: ('high' | 'medium' | 'low')[] = ['high', 'medium', 'low'];
          const score = scores[Math.floor(Math.random() * 3)];
          
          if (score === 'high') {
            newState = 'validated';
            toast.success('Validation passed with high score');
          } else if (score === 'medium') {
            newState = 'review_required';
            toast.warning('Review required - medium score');
          } else {
            newState = 'rejected';
            toast.error('Validation failed - low score');
          }
          updates.score = score;
          break;
        case 'store':
          newState = 'stored';
          toast.success('Translation stored in Translation Memory');
          break;
        case 'retry':
          newState = 'received';
          updates = {
            ko: null,
            en: null,
            score: null,
            notes: undefined,
          };
          toast.info('Translation reset for retry');
          break;
      }

      updateItem(item.id, { state: newState, ...updates });
    },
    [updateItem]
  );

  const counts = useMemo(() => {
    const result: Record<TranslationState | 'all', number> = {
      all: items.length,
      received: 0,
      draft: 0,
      approved: 0,
      translated: 0,
      validated: 0,
      review_required: 0,
      rejected: 0,
      stored: 0,
    };

    items.forEach((item) => {
      result[item.state]++;
    });

    return result;
  }, [items]);

  return {
    items,
    isRefreshing,
    refresh,
    addItem,
    performAction,
    counts,
  };
}
