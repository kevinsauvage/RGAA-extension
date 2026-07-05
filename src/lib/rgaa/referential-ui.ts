import referential from '@/lib/rgaa/referential.json';
import {
  CRITERION_COVERAGE,
  computeCoverageStats,
  type CheckMethod,
} from '@/lib/rgaa/coverage';
import { RGAA_THEMES, criterionHelpUrl } from '@/lib/rgaa/criteria';

export interface ReferentialCriterion {
  id: string;
  title: string;
  theme: number;
  tests: Array<{ id: string; title: string }>;
}

export interface CriterionDetail {
  id: string;
  title: string;
  theme: number;
  themeName: string;
  methods: CheckMethod[];
  rules: string[];
  axeRules: string[];
  note?: string;
  tests: Array<{ id: string; title: string }>;
  helpUrl: string;
}

const criteriaById = new Map<string, ReferentialCriterion>(
  (referential.criteria as ReferentialCriterion[]).map((c) => [c.id, c]),
);

export function getCoverageStats() {
  return computeCoverageStats();
}

export function getCriterionDetail(id: string): CriterionDetail | null {
  const ref = criteriaById.get(id);
  const cov = CRITERION_COVERAGE[id];
  if (!ref || !cov) return null;

  return {
    id: ref.id,
    title: ref.title,
    theme: ref.theme,
    themeName: RGAA_THEMES[ref.theme] ?? 'Autre',
    methods: cov.methods,
    rules: cov.rules ?? [],
    axeRules: cov.axeRules ?? [],
    note: cov.note,
    tests: ref.tests,
    helpUrl: criterionHelpUrl(id),
  };
}

export function listAllCriteria(): CriterionDetail[] {
  return (referential.criteria as ReferentialCriterion[])
    .map((c) => getCriterionDetail(c.id))
    .filter((c): c is CriterionDetail => c !== null);
}

export function criteriaInScan(issueCriteria: string[]): Set<string> {
  return new Set(issueCriteria);
}

export { RGAA_THEMES };
