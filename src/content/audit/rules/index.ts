import { toIssue, type RuleFinding } from './shared';
import { checkSvgInformative, checkCanvasAlt } from './images';
import { checkColorOnlyRequired } from './colors';
import {
  checkFocusVisible,
  checkHiddenContent,
  checkPresentationalHtml,
  checkTextScaling,
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
} from './forms';
import { checkAutoplayMedia, checkMovingContent, checkVideoCaptions } from './multimedia';

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
  { id: 'rgaa-color-only-required', check: checkColorOnlyRequired },
  { id: 'rgaa-text-scaling', check: checkTextScaling },
  { id: 'rgaa-focus-visible', check: checkFocusVisible },
  { id: 'rgaa-hidden-content', check: checkHiddenContent },
  { id: 'rgaa-presentational-html', check: checkPresentationalHtml },
  { id: 'rgaa-layout-table-semantics', check: checkLayoutTableSemantics },
  { id: 'rgaa-keyboard-accessible', check: checkKeyboardAccessible },
  { id: 'rgaa-radio-grouping', check: checkRadioGroups },
  { id: 'rgaa-fieldset-legend', check: checkFieldsetLegend },
  { id: 'rgaa-required-indication', check: checkRequiredIndication },
  { id: 'rgaa-skip-link', check: checkSkipLink },
  { id: 'rgaa-new-window-warning', check: checkNewWindowLinks },
  { id: 'rgaa-doc-link-format', check: checkDocumentLinks },
  { id: 'rgaa-video-captions', check: checkVideoCaptions },
  { id: 'rgaa-autoplay-media', check: checkAutoplayMedia },
  { id: 'rgaa-moving-content', check: checkMovingContent },
];

export function getImplementedRuleIds(): string[] {
  return RGAA_RULE_REGISTRY.map((rule) => rule.id);
}

/** Run all deterministic RGAA rules against the live rendered DOM. */
export function runRgaaRules(): ReturnType<typeof toIssue>[] {
  return RGAA_RULE_REGISTRY.map(({ check }) => check())
    .filter((finding): finding is RuleFinding => finding !== null)
    .map(toIssue);
}

export { toIssue, type RuleFinding };
