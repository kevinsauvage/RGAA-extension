import { describe, expect, it } from 'vitest';
import { summarizeIssues } from '../scan-summary';

describe('summarizeIssues', () => {
  it('computes score from accessibility severities only', () => {
    const summary = summarizeIssues([
      { severity: 'moderate' },
      { severity: 'moderate' },
      { severity: 'minor' },
      { severity: 'minor' },
    ]);
    expect(summary).toEqual({
      total: 4,
      critical: 0,
      serious: 0,
      moderate: 2,
      minor: 2,
      score: 88,
    });
  });

  it('does not mix performance severities into accessibility totals', () => {
    const a11yOnly = summarizeIssues([{ severity: 'moderate' }, { severity: 'minor' }]);
    const mixed = summarizeIssues([
      { severity: 'moderate' },
      { severity: 'minor' },
      { severity: 'critical' },
    ]);
    expect(a11yOnly.critical).toBe(0);
    expect(mixed.critical).toBe(1);
    expect(a11yOnly.score).toBeGreaterThan(mixed.score);
  });
});
