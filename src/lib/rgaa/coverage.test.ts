import { describe, expect, it } from 'vitest';
import { getImplementedRuleIds } from '@/content/audit/rules';
import { getAxeRuleIds } from '@/content/audit/rgaa-mapping';
import { DEEP_SCAN_CRITERIA } from '@/lib/rgaa/criteria';
import { CRITERION_COVERAGE, allDeclaredRuleIds } from '@/lib/rgaa/coverage';

describe('RGAA coverage sync (ADR-2)', () => {
  const implementedRules = new Set(getImplementedRuleIds());
  const declaredRules = new Set(allDeclaredRuleIds());
  const axeRuleIds = new Set(getAxeRuleIds());
  const deepScanIds = new Set(DEEP_SCAN_CRITERIA.map((c) => c.id));

  it('every implemented rule is declared in coverage.ts', () => {
    for (const id of implementedRules) {
      expect(declaredRules.has(id)).toBe(true);
    }
  });

  it('every declared custom rule is implemented', () => {
    for (const id of declaredRules) {
      expect(implementedRules.has(id)).toBe(true);
    }
  });

  it('every axeRules entry in coverage exists in rgaa-mapping', () => {
    for (const entry of Object.values(CRITERION_COVERAGE)) {
      for (const axeId of entry.axeRules ?? []) {
        expect(axeRuleIds.has(axeId)).toBe(true);
      }
    }
  });

  it('every AI-only criterion in coverage has a deep-scan hint', () => {
    for (const [criterionId, entry] of Object.entries(CRITERION_COVERAGE)) {
      const aiOnly =
        entry.methods.includes('ai') &&
        !entry.methods.includes('axe') &&
        !entry.methods.includes('rule');
      if (aiOnly) {
        expect(deepScanIds.has(criterionId)).toBe(true);
      }
    }
  });

  it('every deep-scan criterion is marked with ai in coverage', () => {
    for (const criterion of DEEP_SCAN_CRITERIA) {
      const entry = CRITERION_COVERAGE[criterion.id];
      expect(entry).toBeDefined();
      expect(entry?.methods).toContain('ai');
    }
  });

  it('registry rule count matches declared rules count', () => {
    expect(implementedRules.size).toBe(declaredRules.size);
    expect(implementedRules.size).toBe(30);
  });
});
