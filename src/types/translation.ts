export type TranslationState = 
  | 'received'
  | 'draft'
  | 'approved'
  | 'translated'
  | 'validated'
  | 'review_required'
  | 'rejected'
  | 'stored';

export type ValidationScore = 'high' | 'medium' | 'low' | null;

export interface TranslationItem {
  id: string;
  key: string;
  context: string;
  zu: string;
  ko: string | null;
  en: string | null;
  state: TranslationState;
  score: ValidationScore;
  createdAt: string;
  updatedAt: string;
  reviewer?: string;
  notes?: string;
}

export const STATE_LABELS: Record<TranslationState, string> = {
  received: 'Received',
  draft: 'Draft (KO)',
  approved: 'Approved',
  translated: 'Translated',
  validated: 'Validated',
  review_required: 'Review Required',
  rejected: 'Rejected',
  stored: 'Stored',
};

export const STATE_ORDER: TranslationState[] = [
  'received',
  'draft',
  'approved',
  'translated',
  'validated',
  'stored',
];

export const VALID_ACTIONS: Record<TranslationState, string[]> = {
  received: ['generate_draft'],
  draft: ['approve', 'edit', 'reject'],
  approved: ['translate'],
  translated: ['validate'],
  validated: ['store'],
  review_required: ['approve', 'reject'],
  rejected: ['retry'],
  stored: [],
};
