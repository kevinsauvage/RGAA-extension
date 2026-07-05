import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import type { Settings } from '@/lib/storage';
import { runDeepScan } from '../deep-scan';

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

const html =
  '<html><body><ul class="fake-list"><li>One</li><li>Two</li></ul></body></html>';

describe('runDeepScan', () => {
  beforeEach(() => {
    vi.mocked(openaiChatCompletion).mockResolvedValue(JSON.stringify({ findings: [] }));
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('requires an OpenAI API key', async () => {
    await expect(
      runDeepScan(html, [], { ...settings, openaiApiKey: '' }, async () => ({})),
    ).rejects.toThrow('No OpenAI API key configured');
  });

  it('rejects findings whose evidence is not in the HTML', async () => {
    vi.mocked(openaiChatCompletion).mockResolvedValue(
      JSON.stringify({
        findings: [
          {
            criterion: '9.3',
            selector: 'ul.fake-list',
            evidence: '<ul class="hallucinated">',
            description: 'Not a real list',
          },
        ],
      }),
    );

    const result = await runDeepScan(html, [], settings, async () => ({ 'ul.fake-list': true }));
    expect(result.issues).toHaveLength(0);
    expect(result.rejected).toBeGreaterThanOrEqual(1);
  });

  it('rejects findings when the selector does not resolve on the page', async () => {
    vi.mocked(openaiChatCompletion).mockResolvedValue(
      JSON.stringify({
        findings: [
          {
            criterion: '9.3',
            selector: 'ul.fake-list',
            evidence: '<ul class="fake-list"><li>One</li>',
            description: 'Fake list markup',
          },
        ],
      }),
    );

    const result = await runDeepScan(html, [], settings, async () => ({ 'ul.fake-list': false }));
    expect(result.issues).toHaveLength(0);
    expect(result.rejected).toBeGreaterThanOrEqual(1);
  });

  it('accepts validated findings with evidence and selector checks', async () => {
    vi.mocked(openaiChatCompletion).mockResolvedValue(
      JSON.stringify({
        findings: [
          {
            criterion: '9.3',
            selector: 'ul.fake-list',
            evidence: '<ul class="fake-list"><li>One</li><li>Two</li></ul>',
            description: 'List used for layout',
          },
        ],
      }),
    );

    const result = await runDeepScan(html, [], settings, async () => ({ 'ul.fake-list': true }));
    expect(result.issues).toHaveLength(1);
    expect(result.issues[0]?.confidence).toBe('needs-review');
    expect(result.issues[0]?.source).toBe('ai');
    expect(result.rejected).toBe(0);
  });

  it('skips findings that duplicate known selectors', async () => {
    vi.mocked(openaiChatCompletion).mockResolvedValue(
      JSON.stringify({
        findings: [
          {
            criterion: '9.3',
            selector: 'ul.fake-list',
            evidence: '<ul class="fake-list"><li>One</li><li>Two</li></ul>',
            description: 'Duplicate',
          },
        ],
      }),
    );

    const result = await runDeepScan(
      html,
      [{ selector: 'ul.fake-list', ruleId: 'ai-deep-9.3', title: 'Existing' }],
      settings,
      async () => ({ 'ul.fake-list': true }),
    );
    expect(result.issues).toHaveLength(0);
  });

  it('reports batch progress', async () => {
    const progress: string[] = [];
    await runDeepScan(
      html,
      [],
      settings,
      async () => ({}),
      (state) => progress.push(state.checkLabel),
    );
    expect(progress.length).toBeGreaterThan(0);
    expect(openaiChatCompletion).toHaveBeenCalled();
  });

  it('ignores malformed findings in batch JSON', async () => {
    vi.mocked(openaiChatCompletion).mockResolvedValue(
      JSON.stringify({
        findings: [
          { criterion: '9.3', selector: '', evidence: 'missing selector' },
          { criterion: 9.3, selector: 'ul.fake-list', evidence: 'bad criterion type' },
        ],
      }),
    );

    const result = await runDeepScan(html, [], settings, async () => ({ 'ul.fake-list': true }));
    expect(result.issues).toHaveLength(0);
  });
});
