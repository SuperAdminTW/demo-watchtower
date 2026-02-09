import { useState, useCallback, useMemo, useRef } from 'react';
import { TranslationItem, TranslationState, AUTO_PROGRESS_STATES, AUTO_PROGRESS_ACTIONS } from '@/types/translation';
import { toast } from 'sonner';

export function useTranslations() {
  const [items, setItems] = useState<TranslationItem[]>([]);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [processingIds, setProcessingIds] = useState<Set<string>>(new Set());
  const processingRef = useRef<Set<string>>(new Set());

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

  const triggerAutoProgress = useCallback(
    async (itemId: string, state: TranslationState) => {
      // Check if this state should auto-progress
      if (!AUTO_PROGRESS_STATES.includes(state)) return;
      
      const action = AUTO_PROGRESS_ACTIONS[state];
      if (!action) return;

      // Prevent duplicate processing
      if (processingRef.current.has(itemId)) return;
      processingRef.current.add(itemId);
      setProcessingIds(new Set(processingRef.current));

      // Small delay to show the intermediate state
      await new Promise((resolve) => setTimeout(resolve, 1000));

      try {
        // Get current item state
        let currentItem: TranslationItem | undefined;
        setItems((prev) => {
          currentItem = prev.find((i) => i.id === itemId);
          return prev;
        });

        if (!currentItem || currentItem.state !== state) {
          processingRef.current.delete(itemId);
          setProcessingIds(new Set(processingRef.current));
          return;
        }

        // Simulate API call for auto-action
        await new Promise((resolve) => setTimeout(resolve, 500));

        let newState: TranslationState = state;
        let updates: Partial<TranslationItem> = {};

        switch (action) {
          case 'approve':
            newState = 'approved';
            break;
          case 'validate':
            // Simulate random validation score
            const scores: ('high' | 'medium' | 'low')[] = ['high', 'medium', 'low'];
            const score = scores[Math.floor(Math.random() * 3)];
            
            if (score === 'high') {
              newState = 'validated';
            } else if (score === 'medium') {
              newState = 'review_required';
            } else {
              newState = 'rejected';
            }
            updates.score = score;
            break;
          case 'store':
            newState = 'stored';
            break;
        }

        setItems((prev) =>
          prev.map((item) =>
            item.id === itemId
              ? { ...item, state: newState, ...updates, updatedAt: new Date().toISOString() }
              : item
          )
        );

        // Continue auto-progression if applicable
        if (newState !== 'review_required' && newState !== 'rejected' && newState !== 'stored') {
          processingRef.current.delete(itemId);
          setProcessingIds(new Set(processingRef.current));
          triggerAutoProgress(itemId, newState);
        } else {
          processingRef.current.delete(itemId);
          setProcessingIds(new Set(processingRef.current));
        }
      } catch (error) {
        console.error('Auto-progress error:', error);
        processingRef.current.delete(itemId);
        setProcessingIds(new Set(processingRef.current));
        toast.error('Auto-progress failed. Use manual retry.');
      }
    },
    []
  );

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
          toast.success('Draft generated - auto-progressing...');
          break;
        case 'approve':
          newState = 'approved';
          if (edits?.ko) {
            updates.ko = edits.ko;
          }
          toast.success('Translation approved - auto-translating...');
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
          toast.success('Translation validated - auto-storing...');
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
          toast.success('Translation completed - auto-validating...');
          break;
        case 'validate':
          // Simulate random validation score
          const scores: ('high' | 'medium' | 'low')[] = ['high', 'medium', 'low'];
          const score = scores[Math.floor(Math.random() * 3)];
          
          if (score === 'high') {
            newState = 'validated';
            toast.success('Validation passed - auto-storing...');
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
        case 'retry_step':
          // Retry the current step's auto-action
          triggerAutoProgress(item.id, item.state);
          return;
      }

      setItems((prev) =>
        prev.map((i) =>
          i.id === item.id
            ? { ...i, state: newState, ...updates, updatedAt: new Date().toISOString() }
            : i
        )
      );

      // Trigger auto-progression for applicable states
      if (AUTO_PROGRESS_STATES.includes(newState)) {
        triggerAutoProgress(item.id, newState);
      }
    },
    [triggerAutoProgress]
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
    processingIds,
    refresh,
    addItem,
    performAction,
    counts,
  };
}
