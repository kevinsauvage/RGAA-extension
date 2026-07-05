import { describe, expect, it } from 'vitest';
import type { AccessibilityIssue } from '@/lib/types';
import { dedupeAccessibilityIssues } from '../dedupe-issues';

function issue(
  partial: Partial<AccessibilityIssue> & Pick<AccessibilityIssue, 'ruleId' | 'source' | 'confidence'>,
): AccessibilityIssue {
  return {
    id: partial.id ?? '1',
    kind: 'accessibility',
    severity: partial.severity ?? 'serious',
    title: partial.title ?? 'Test issue',
    description: partial.description ?? '',
    userImpact: partial.userImpact ?? '',
    rgaa: partial.rgaa ?? [{ criterion: '12.7', theme: 'Navigation', wcag: ['2.4.1'] }],
    nodes: partial.nodes ?? [{ target: 'body', html: '<body></body>' }],
    ...partial,
  };
}

describe('dedupeAccessibilityIssues', () => {
  it('merges skip-link axe and rule findings for RGAA 12.7', () => {
    const axe = issue({
      ruleId: 'bypass',
      source: 'axe',
      confidence: 'certain',
      title: 'Page must have means to bypass blocks',
    });
    const rule = issue({
      ruleId: 'rgaa-skip-link',
      source: 'rule',
      confidence: 'likely',
      title: 'Skip link missing',
      nodes: [{ target: 'main', html: '<main></main>' }],
    });

    const result = dedupeAccessibilityIssues([axe, rule]);
    expect(result).toHaveLength(1);
    expect(result[0].source).toBe('axe');
    expect(result[0].confidence).toBe('certain');
    expect(result[0].nodes).toHaveLength(2);
  });

  it('keeps separate issues when criteria differ', () => {
    const a = issue({
      ruleId: 'color-contrast',
      source: 'axe',
      confidence: 'certain',
      rgaa: [{ criterion: '3.2', theme: 'Colors', wcag: ['1.4.3'] }],
      nodes: [{ target: 'p', html: '<p>text</p>' }],
    });
    const b = issue({
      ruleId: 'rgaa-skip-link',
      source: 'rule',
      confidence: 'likely',
      nodes: [{ target: 'main', html: '<main></main>' }],
    });

    expect(dedupeAccessibilityIssues([a, b])).toHaveLength(2);
  });

  it('merges overlapping selectors on the same criterion', () => {
    const a = issue({
      ruleId: 'image-alt',
      source: 'axe',
      confidence: 'certain',
      rgaa: [{ criterion: '1.1', theme: 'Images', wcag: ['1.1.1'] }],
      nodes: [{ target: 'img.logo', html: '<img class="logo">' }],
    });
    const b = issue({
      ruleId: 'rgaa-image-alt',
      source: 'rule',
      confidence: 'likely',
      rgaa: [{ criterion: '1.1', theme: 'Images', wcag: ['1.1.1'] }],
      nodes: [{ target: 'img.logo', html: '<img class="logo">' }],
    });

    const result = dedupeAccessibilityIssues([a, b]);
    expect(result).toHaveLength(1);
    expect(result[0].source).toBe('axe');
    expect(result[0].nodes).toHaveLength(1);
  });
});
