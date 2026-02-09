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
  draft: 'Draft',
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
  draft: [],  // Auto-progresses
  approved: ['translate'],
  translated: [],  // Auto-progresses
  validated: [],  // Auto-progresses
  review_required: ['approve', 'reject'],
  rejected: ['retry'],
  stored: [],
};

// Steps that should auto-progress (no user interaction required)
export const AUTO_PROGRESS_STATES: TranslationState[] = [
  'draft',
  'translated',
  'validated',
];

// Map of state to the action that should auto-trigger
export const AUTO_PROGRESS_ACTIONS: Partial<Record<TranslationState, string>> = {
  draft: 'approve',
  translated: 'validate',
  validated: 'store',
};
