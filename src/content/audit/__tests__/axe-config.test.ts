import { describe, expect, it } from 'vitest';
import { AXE_RUN_TAGS } from '../axe-config';
import { getAxeRuleIds } from '../rgaa-mapping';
import { assertAxeImpactsComplete, userImpactFor } from '../user-impact';

describe('axe-runner configuration', () => {
  it('does not include best-practice tag (non-RGAA noise)', () => {
    expect(AXE_RUN_TAGS).not.toContain('best-practice');
    expect(AXE_RUN_TAGS.every((tag) => tag.startsWith('wcag'))).toBe(true);
  });
});

describe('userImpactFor', () => {
  it('covers every axe rule in rgaa-mapping', () => {
    expect(() => assertAxeImpactsComplete()).not.toThrow();
    for (const ruleId of getAxeRuleIds()) {
      const impact = userImpactFor(ruleId, 'fallback');
      expect(impact).not.toBe('fallback');
      expect(impact.length).toBeGreaterThan(20);
    }
  });

  it('falls back to axe description for unmapped rules', () => {
    expect(userImpactFor('unknown-rule', 'Original axe text')).toBe('Original axe text');
  });
});
