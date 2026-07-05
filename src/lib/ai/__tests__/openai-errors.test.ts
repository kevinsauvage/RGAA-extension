import { describe, expect, it } from 'vitest';
import {
  OpenAiApiError,
  decodeDeepScanError,
  encodeDeepScanError,
  formatDeepScanError,
} from '../openai-errors';

describe('OpenAiApiError', () => {
  it('classifies insufficient quota as quota', () => {
    const error = OpenAiApiError.fromResponse(
      429,
      JSON.stringify({
        error: {
          message: 'You exceeded your current quota, please check your plan and billing details.',
          type: 'insufficient_quota',
        },
      }),
      'Deep scan "Images, media and frames"',
    );
    expect(error.kind).toBe('quota');
  });

  it('classifies rate limits separately from quota', () => {
    const error = OpenAiApiError.fromResponse(
      429,
      JSON.stringify({
        error: {
          message: 'Rate limit reached for requests',
          code: 'rate_limit_exceeded',
        },
      }),
      'Deep scan "Forms"',
    );
    expect(error.kind).toBe('rate_limit');
  });
});

describe('encodeDeepScanError', () => {
  it('round-trips structured errors for UI formatting', () => {
    const original = OpenAiApiError.fromResponse(
      429,
      JSON.stringify({ error: { message: 'quota exceeded', type: 'insufficient_quota' } }),
      'Deep scan "Images, médias et cadres"',
    );
    const encoded = encodeDeepScanError(original);
    const decoded = decodeDeepScanError(encoded);
    expect(decoded).toBeInstanceOf(OpenAiApiError);
    expect((decoded as OpenAiApiError).kind).toBe('quota');
  });
});

describe('formatDeepScanError', () => {
  it('shows friendly quota copy in French with batch name', () => {
    const error = OpenAiApiError.fromResponse(
      429,
      JSON.stringify({
        error: {
          message: 'You exceeded your current quota, please check your plan and billing details.',
          type: 'insufficient_quota',
        },
      }),
      'Deep scan "Images, médias et cadres"',
    );
    const display = formatDeepScanError('fr', error);
    expect(display.title).toContain('Quota OpenAI');
    expect(display.body).toContain('Images, médias et cadres');
    expect(display.actions.some((action) => action.href?.includes('billing'))).toBe(true);
    expect(display.technical).toContain('quota');
  });
});
