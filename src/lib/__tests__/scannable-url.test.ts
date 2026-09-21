import { describe, expect, it } from 'vitest';
import { isScannable } from '../scannable-url';

describe('isScannable', () => {
  it('allows http and https pages', () => {
    expect(isScannable('https://example.com/page')).toBe(true);
    expect(isScannable('http://localhost:3000')).toBe(true);
  });

  it('allows file URLs', () => {
    expect(isScannable('file:///tmp/test.html')).toBe(true);
  });

  it('blocks extension and browser-internal URLs', () => {
    expect(isScannable('chrome-extension://abc123/src/options/index.html')).toBe(false);
    expect(isScannable('chrome://extensions')).toBe(false);
    expect(isScannable('edge://settings')).toBe(false);
  });
});
