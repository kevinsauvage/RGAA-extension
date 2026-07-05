import { describe, expect, it } from 'vitest';
import { contrastRatio, isTransparentBg, parseRgb } from '../contrast-utils';

describe('contrast-utils', () => {
  it('parses rgb and rgba', () => {
    expect(parseRgb('rgb(255, 0, 0)')).toEqual([255, 0, 0, 1]);
    expect(parseRgb('rgba(0, 0, 0, 0.5)')).toEqual([0, 0, 0, 0.5]);
  });

  it('detects transparent backgrounds', () => {
    expect(isTransparentBg('rgba(0, 0, 0, 0)')).toBe(true);
    expect(isTransparentBg('rgb(255, 255, 255)')).toBe(false);
  });

  it('computes contrast ratio for black on white', () => {
    const ratio = contrastRatio('rgb(0, 0, 0)', 'rgb(255, 255, 255)');
    expect(ratio).toBeGreaterThan(20);
  });

  it('computes low contrast for similar colors', () => {
    const ratio = contrastRatio('rgb(200, 200, 200)', 'rgb(255, 255, 255)');
    expect(ratio).not.toBeNull();
    expect(ratio!).toBeLessThan(4.5);
  });
});
