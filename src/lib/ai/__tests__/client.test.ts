import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import type { AccessibilityIssue } from '@/lib/types';
import type { Settings } from '@/lib/storage';
import { generateFix } from '../client';
import { OpenAiApiError } from '../openai-errors';

vi.mock('../openai', () => ({
  openaiChatCompletion: vi.fn(),
  stripJsonFences: (content: string) => content,
}));

import { openaiChatCompletion } from '../openai';

const settings: Settings = {
  openaiApiKey: 'sk-test',
  model: 'gpt-4o-mini',
  language: 'en',
  plan: 'pro',
};

const issue: AccessibilityIssue = {
  id: 'issue-1',
  kind: 'accessibility',
  ruleId: 'image-alt',
  source: 'axe',
  confidence: 'certain',
  severity: 'serious',
  title: 'Images must have alternate text',
  description: 'img elements must have an alt attribute.',
  userImpact: 'Screen reader users cannot perceive the image.',
  rgaa: [{ criterion: '1.1', theme: 'Images', wcag: ['1.1.1'] }],
  nodes: [{ target: 'img.logo', html: '<img class="logo" src="logo.png">' }],
};

describe('generateFix', () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  it('throws when no API key is configured', async () => {
    await expect(generateFix(issue, { ...settings, openaiApiKey: '' })).rejects.toThrow(
      'No OpenAI API key configured',
    );
  });

  it('parses a JSON fix response from OpenAI', async () => {
    vi.mocked(openaiChatCompletion).mockResolvedValue(
      JSON.stringify({
        explanation: 'Add descriptive alt text.',
        codeFix: '<img class="logo" src="logo.png" alt="Company logo">',
        rationale: ['Alt text conveys the image purpose to assistive tech.'],
      }),
    );

    const fix = await generateFix(issue, settings);
    expect(fix.issueId).toBe('issue-1');
    expect(fix.codeFix).toContain('alt=');
    expect(fix.rationale).toHaveLength(1);
    expect(fix.model).toBe('gpt-4o-mini');
  });

  it('surfaces OpenAI HTTP errors', async () => {
    vi.mocked(openaiChatCompletion).mockRejectedValue(
      OpenAiApiError.fromResponse(401, JSON.stringify({ error: { message: 'Invalid API key' } })),
    );

    await expect(generateFix(issue, settings)).rejects.toBeInstanceOf(OpenAiApiError);
  });
});
