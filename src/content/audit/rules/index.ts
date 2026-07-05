import { getAuditableDocuments, withAuditDocument } from '../audit-context';
import { toIssue, type RuleFinding } from './shared';
import { checkSvgInformative, checkCanvasAlt, checkDecorativeImageAlt } from './images';
import { checkColorOnlyRequired } from './colors';
import {
  checkFocusVisible,
  checkHiddenContent,
  checkPresentationalHtml,
  checkTextScaling,
  checkTextSpacingOverride,
  checkHoverFocusOverlay,
  checkCssInteractiveReachability,
} from './presentation';
import { checkKeyboardAccessible } from './scripts';
import { checkLayoutTableSemantics } from './tables';
import { checkDoctype, checkTextDirection } from './mandatory';
import {
  checkDocumentLinks,
  checkFieldsetLegend,
  checkNewWindowLinks,
  checkRadioGroups,
  checkRequiredIndication,
  checkSkipLink,
  checkSelectOptgroup,
  checkInvalidFieldHint,
  checkPopupOnLoad,
} from './forms';
import {
  checkAutoplayMedia,
  checkMovingContent,
  checkVideoCaptions,
  checkMediaControlFocus,
} from './multimedia';
import { checkKeyboardTrap } from './navigation';
import { checkStatusMessages } from './status-messages';

export interface RegisteredRule {
  id: string;
  check: () => RuleFinding | null;
}

/** Deterministic RGAA rules — single registry for runtime and coverage validation. */
export const RGAA_RULE_REGISTRY: RegisteredRule[] = [
  { id: 'rgaa-doctype', check: checkDoctype },
  { id: 'rgaa-text-direction', check: checkTextDirection },
  { id: 'rgaa-svg-informative', check: checkSvgInformative },
  { id: 'rgaa-canvas-alt', check: checkCanvasAlt },
  { id: 'rgaa-decorative-image-alt', check: checkDecorativeImageAlt },
  { id: 'rgaa-color-only-required', check: checkColorOnlyRequired },
  { id: 'rgaa-text-scaling', check: checkTextScaling },
  { id: 'rgaa-text-spacing-override', check: checkTextSpacingOverride },
  { id: 'rgaa-focus-visible', check: checkFocusVisible },
  { id: 'rgaa-hidden-content', check: checkHiddenContent },
  { id: 'rgaa-presentational-html', check: checkPresentationalHtml },
  { id: 'rgaa-hover-focus-overlay', check: checkHoverFocusOverlay },
  { id: 'rgaa-css-interactive', check: checkCssInteractiveReachability },
  { id: 'rgaa-layout-table-semantics', check: checkLayoutTableSemantics },
  { id: 'rgaa-keyboard-accessible', check: checkKeyboardAccessible },
  { id: 'rgaa-status-messages', check: checkStatusMessages },
  { id: 'rgaa-radio-grouping', check: checkRadioGroups },
  { id: 'rgaa-fieldset-legend', check: checkFieldsetLegend },
  { id: 'rgaa-select-optgroup', check: checkSelectOptgroup },
  { id: 'rgaa-required-indication', check: checkRequiredIndication },
  { id: 'rgaa-invalid-field-hint', check: checkInvalidFieldHint },
  { id: 'rgaa-skip-link', check: checkSkipLink },
  { id: 'rgaa-keyboard-trap', check: checkKeyboardTrap },
  { id: 'rgaa-new-window-warning', check: checkNewWindowLinks },
  { id: 'rgaa-popup-on-load', check: checkPopupOnLoad },
  { id: 'rgaa-doc-link-format', check: checkDocumentLinks },
  { id: 'rgaa-video-captions', check: checkVideoCaptions },
  { id: 'rgaa-autoplay-media', check: checkAutoplayMedia },
  { id: 'rgaa-moving-content', check: checkMovingContent },
  { id: 'rgaa-media-control-focus', check: checkMediaControlFocus },
];

export function getImplementedRuleIds(): string[] {
  return RGAA_RULE_REGISTRY.map((rule) => rule.id);
}

function runRulesInCurrentDocument(): RuleFinding[] {
  return RGAA_RULE_REGISTRY.map(({ check }) => check()).filter(
    (finding): finding is RuleFinding => finding !== null,
  );
}

/** Run all deterministic RGAA rules against the live rendered DOM (including same-origin iframes). */
export function runRgaaRules(): ReturnType<typeof toIssue>[] {
  const findings: RuleFinding[] = [];

  for (const doc of getAuditableDocuments()) {
    findings.push(...withAuditDocument(doc, runRulesInCurrentDocument));
  }

  return findings.map(toIssue);
}

export { toIssue, type RuleFinding };
