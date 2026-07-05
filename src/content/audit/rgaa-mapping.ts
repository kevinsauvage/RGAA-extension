import type { RgaaReference, Severity } from '@/lib/types';
import { RGAA_THEMES } from '@/lib/rgaa/criteria';

/**
 * Maps axe-core rule ids to the relevant RGAA 4.1 criteria and WCAG success
 * criteria. RGAA (Référentiel Général d'Amélioration de l'Accessibilité) is the
 * French public accessibility standard and is a strict superset of WCAG 2.1 AA.
 *
 * This table is intentionally explicit rather than generated: RGAA compliance
 * work needs a defensible, auditable mapping, not a fuzzy heuristic.
 */

interface MappingEntry {
  criteria: RgaaReference[];
}

function ref(criterion: string, themeNumber: number, wcag: string[]): RgaaReference {
  return { criterion, theme: RGAA_THEMES[themeNumber] ?? 'Autre', wcag };
}

/**
 * axe rule id -> RGAA references. Rules not present here still surface as
 * issues but are tagged with the generic "à vérifier" reference.
 */
const AXE_TO_RGAA: Record<string, MappingEntry> = {
  'image-alt': { criteria: [ref('1.1', 1, ['1.1.1'])] },
  'input-image-alt': { criteria: [ref('1.1', 1, ['1.1.1'])] },
  'area-alt': { criteria: [ref('1.1', 1, ['1.1.1'])] },
  'role-img-alt': { criteria: [ref('1.1', 1, ['1.1.1'])] },
  'svg-img-alt': { criteria: [ref('1.1', 1, ['1.1.1'])] },
  'object-alt': { criteria: [ref('1.1', 1, ['1.1.1'])] },
  'image-redundant-alt': { criteria: [ref('1.2', 1, ['1.1.1'])] },

  'frame-title': { criteria: [ref('2.1', 2, ['4.1.2', '2.4.1'])] },
  'frame-title-unique': { criteria: [ref('2.2', 2, ['4.1.2'])] },

  'color-contrast': { criteria: [ref('3.2', 3, ['1.4.3'])] },
  'color-contrast-enhanced': { criteria: [ref('3.3', 3, ['1.4.6'])] },
  'link-in-text-block': { criteria: [ref('3.1', 3, ['1.4.1'])] },

  'audio-caption': { criteria: [ref('4.1', 4, ['1.2.1'])] },
  'video-caption': { criteria: [ref('4.1', 4, ['1.2.2'])] },
  'no-autoplay-audio': { criteria: [ref('4.9', 4, ['1.4.2'])] },

  'td-headers-attr': { criteria: [ref('5.7', 5, ['1.3.1'])] },
  'th-has-data-cells': { criteria: [ref('5.7', 5, ['1.3.1'])] },
  'table-fake-caption': { criteria: [ref('5.4', 5, ['1.3.1'])] },
  'scope-attr-valid': { criteria: [ref('5.7', 5, ['1.3.1'])] },

  'link-name': { criteria: [ref('6.1', 6, ['2.4.4', '4.1.2'])] },
  'identical-links-same-purpose': { criteria: [ref('6.1', 6, ['2.4.4'])] },

  'aria-required-attr': { criteria: [ref('7.1', 7, ['4.1.2'])] },
  'aria-required-children': { criteria: [ref('7.1', 7, ['1.3.1'])] },
  'aria-required-parent': { criteria: [ref('7.1', 7, ['1.3.1'])] },
  'aria-roles': { criteria: [ref('7.1', 7, ['4.1.2'])] },
  'aria-valid-attr': { criteria: [ref('7.1', 7, ['4.1.2'])] },
  'aria-valid-attr-value': { criteria: [ref('7.1', 7, ['4.1.2'])] },
  'aria-allowed-attr': { criteria: [ref('7.1', 7, ['4.1.2'])] },
  'aria-allowed-role': { criteria: [ref('7.1', 7, ['4.1.2'])] },
  'aria-hidden-body': { criteria: [ref('7.1', 7, ['4.1.2'])] },
  'aria-hidden-focus': { criteria: [ref('7.1', 7, ['1.3.1', '4.1.2'])] },
  'blink': { criteria: [ref('7.4', 7, ['2.2.2'])] },
  'marquee': { criteria: [ref('7.4', 7, ['2.2.2'])] },

  'document-title': { criteria: [ref('8.5', 8, ['2.4.2'])] },
  'html-has-lang': { criteria: [ref('8.3', 8, ['3.1.1'])] },
  'html-lang-valid': { criteria: [ref('8.4', 8, ['3.1.1'])] },
  'html-xml-lang-mismatch': { criteria: [ref('8.4', 8, ['3.1.1'])] },
  'valid-lang': { criteria: [ref('8.7', 8, ['3.1.2'])] },
  'duplicate-id-aria': { criteria: [ref('8.2', 8, ['4.1.1'])] },

  'heading-order': { criteria: [ref('9.1', 9, ['1.3.1'])] },
  'empty-heading': { criteria: [ref('9.1', 9, ['1.3.1'])] },
  'p-as-heading': { criteria: [ref('9.1', 9, ['1.3.1'])] },
  'landmark-one-main': { criteria: [ref('9.2', 9, ['1.3.1'])] },
  'landmark-unique': { criteria: [ref('9.2', 9, ['1.3.1'])] },
  'region': { criteria: [ref('9.2', 9, ['1.3.1'])] },
  'list': { criteria: [ref('9.3', 9, ['1.3.1'])] },
  'listitem': { criteria: [ref('9.3', 9, ['1.3.1'])] },
  'definition-list': { criteria: [ref('9.3', 9, ['1.3.1'])] },

  'meta-viewport': { criteria: [ref('10.4', 10, ['1.4.4'])] },
  'meta-viewport-large': { criteria: [ref('10.4', 10, ['1.4.4'])] },
  'css-orientation-lock': { criteria: [ref('10.11', 10, ['1.3.4'])] },

  'label': { criteria: [ref('11.1', 11, ['3.3.2', '1.3.1', '4.1.2'])] },
  'label-title-only': { criteria: [ref('11.1', 11, ['3.3.2'])] },
  'form-field-multiple-labels': { criteria: [ref('11.1', 11, ['3.3.2'])] },
  'select-name': { criteria: [ref('11.1', 11, ['4.1.2'])] },
  'aria-input-field-name': { criteria: [ref('11.1', 11, ['4.1.2'])] },
  'autocomplete-valid': { criteria: [ref('11.13', 11, ['1.3.5'])] },

  'bypass': { criteria: [ref('12.7', 12, ['2.4.1'])] },
  'skip-link': { criteria: [ref('12.7', 12, ['2.4.1'])] },
  'tabindex': { criteria: [ref('12.8', 12, ['2.4.3'])] },
  'accesskeys': { criteria: [ref('12.10', 12, ['2.1.1'])] },

  'meta-refresh': { criteria: [ref('13.1', 13, ['2.2.1', '2.2.4'])] },
  'meta-refresh-no-exceptions': { criteria: [ref('13.1', 13, ['2.2.1'])] },
};

export function rgaaForRule(ruleId: string): RgaaReference[] {
  const entry = AXE_TO_RGAA[ruleId];
  if (entry) return entry.criteria;
  return [{ criterion: 'à vérifier', theme: 'Autre', wcag: [] }];
}

/** axe impact -> our normalized severity scale. */
export function normalizeSeverity(impact: string | null | undefined): Severity {
  switch (impact) {
    case 'critical':
      return 'critical';
    case 'serious':
      return 'serious';
    case 'moderate':
      return 'moderate';
    case 'minor':
      return 'minor';
    default:
      return 'moderate';
  }
}
