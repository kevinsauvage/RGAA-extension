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

/** All deterministic RGAA rule checks, in execution order. */
const RULE_CHECKS: Array<() => RuleFinding | null> = [
  // Mandatory
  checkDoctype,
  checkTextDirection,
  // Images
  checkSvgInformative,
  checkCanvasAlt,
  // Colors
  checkColorOnlyRequired,
  // Presentation
  checkTextScaling,
  checkFocusVisible,
  checkHiddenContent,
  checkPresentationalHtml,
  // Tables
  checkLayoutTableSemantics,
  // Scripts
  checkKeyboardAccessible,
  // Forms
  checkRadioGroups,
  checkFieldsetLegend,
  checkRequiredIndication,
  // Navigation / consultation
  checkSkipLink,
  checkNewWindowLinks,
  checkDocumentLinks,
  // Multimedia
  checkVideoCaptions,
  checkAutoplayMedia,
  checkMovingContent,
];

/** Run all deterministic RGAA rules against the live rendered DOM. */
export function runRgaaRules(): ReturnType<typeof toIssue>[] {
  return RULE_CHECKS.map((check) => check())
    .filter((finding): finding is RuleFinding => finding !== null)
    .map(toIssue);
}

export { toIssue, type RuleFinding };
