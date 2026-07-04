/**
 * OpenAI Chat Completions models exposed in Settings.
 * @see https://developers.openai.com/api/docs/models
 */

export type ModelGroup = 'gpt-5' | 'gpt-4';

export interface OpenAiModel {
  id: string;
  label: string;
  /** Short hint shown under the model picker. */
  hint: string;
  group: ModelGroup;
  /** Shown with a “recommended” badge in Settings. */
  recommended?: boolean;
}

export const MODEL_GROUPS: Record<ModelGroup, string> = {
  'gpt-5': 'GPT-5 — Latest',
  'gpt-4': 'GPT-4 — Legacy',
};

/** Curated list — aliases only, no dated snapshots. */
export const OPENAI_MODELS: OpenAiModel[] = [
  {
    id: 'gpt-5.5',
    label: 'GPT-5.5',
    hint: 'Flagship model for complex reasoning, coding and professional work.',
    group: 'gpt-5',
    recommended: true,
  },
  {
    id: 'gpt-5.5-pro',
    label: 'GPT-5.5 Pro',
    hint: 'Highest accuracy; slower and more expensive. Best for difficult fixes.',
    group: 'gpt-5',
  },
  {
    id: 'gpt-5.4',
    label: 'GPT-5.4',
    hint: 'Strong balance of quality and cost for everyday audits.',
    group: 'gpt-5',
  },
  {
    id: 'gpt-5.4-mini',
    label: 'GPT-5.4 mini',
    hint: 'Fast and efficient — good default for most users.',
    group: 'gpt-5',
  },
  {
    id: 'gpt-5.4-nano',
    label: 'GPT-5.4 nano',
    hint: 'Cheapest GPT-5 class model; ideal for AI classification checks.',
    group: 'gpt-5',
  },
  {
    id: 'gpt-4o-mini',
    label: 'GPT-4o mini',
    hint: 'Previous-generation fast model; low cost.',
    group: 'gpt-4',
  },
  {
    id: 'gpt-4o',
    label: 'GPT-4o',
    hint: 'Previous-generation flagship.',
    group: 'gpt-4',
  },
  {
    id: 'gpt-4.1-mini',
    label: 'GPT-4.1 mini',
    hint: 'Previous-generation efficient model.',
    group: 'gpt-4',
  },
];

export const DEFAULT_OPENAI_MODEL = 'gpt-5.4-mini';

export function getOpenAiModel(id: string): OpenAiModel | undefined {
  return OPENAI_MODELS.find((model) => model.id === id);
}

export function modelsByGroup(group: ModelGroup): OpenAiModel[] {
  return OPENAI_MODELS.filter((model) => model.group === group);
}

/** Keep a custom model id selectable if the user typed one before we updated the list. */
export function resolveModelOption(id: string): { id: string; label: string; hint: string } {
  const known = getOpenAiModel(id);
  if (known) {
    return { id: known.id, label: known.label, hint: known.hint };
  }
  return { id, label: id, hint: 'Custom model id (not in the curated list).' };
}
