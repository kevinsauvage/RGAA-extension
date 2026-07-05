import { describe, expect, it } from 'vitest';
import { enrichDeepScanHint, officialMethodologyHint } from '@/lib/rgaa/referential-hints';
import { DEEP_SCAN_CRITERIA } from '@/lib/rgaa/criteria';

describe('referential-hints', () => {
  it('returns official test wording for known criteria', () => {
    const hint = officialMethodologyHint('6.1');
    expect(hint.length).toBeGreaterThan(40);
    expect(hint).toMatch(/lien|link/i);
  });

  it('enriches deep-scan hints with official methodology', () => {
    const criterion = DEEP_SCAN_CRITERIA.find((entry) => entry.id === '9.3');
    expect(criterion).toBeDefined();
    const enriched = enrichDeepScanHint(criterion!.id, criterion!.hint);
    expect(enriched).toContain(criterion!.hint);
    expect(enriched).toContain('Official RGAA checks:');
  });

  it('covers all deep-scan criteria with official hints', () => {
    for (const criterion of DEEP_SCAN_CRITERIA) {
      expect(officialMethodologyHint(criterion.id).length).toBeGreaterThan(10);
    }
  });
});
