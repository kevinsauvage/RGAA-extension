/**
 * Human-readable "what a real user experiences" strings keyed by axe rule id.
 * Covers all axe rules mapped in rgaa-mapping.ts; unmapped rules fall back to
 * axe's own violation description.
 */
import { getAxeRuleIds } from '@/content/audit/rgaa-mapping';

const IMPACTS: Record<string, string> = {
  'image-alt':
    'Screen reader users hear nothing (or the file name) where an image should convey meaning.',
  'input-image-alt':
    'Submit buttons styled as images are announced without purpose; users cannot tell what the control does.',
  'area-alt':
    'Clickable regions on image maps are announced without labels, so their purpose is unknown.',
  'role-img-alt':
    'Elements marked as images have no text alternative, so their meaning is lost to assistive tech.',
  'svg-img-alt':
    'SVG graphics marked as images are silent in screen readers when no accessible name is provided.',
  'object-alt':
    'Embedded objects are announced without a text alternative describing their content.',
  'image-redundant-alt':
    'Screen readers repeat the same information twice when decorative images have redundant alt text.',

  'frame-title':
    'Screen reader users hear an unlabeled frame and cannot tell what content it holds.',
  'frame-title-unique':
    'Multiple frames share the same title, so users cannot distinguish one embedded view from another.',

  'color-contrast': 'Low-vision users and anyone in bright light cannot reliably read this text.',
  'color-contrast-enhanced':
    'Users with moderate low vision struggle to read text that fails enhanced contrast requirements.',
  'link-in-text-block':
    'Links that rely on color alone are invisible to color-blind users and hard to spot for everyone else.',

  'audio-caption':
    'Deaf and hard-of-hearing users cannot access audio content without captions or a transcript.',
  'video-caption':
    'Video speech and sounds are inaccessible when no captions or subtitles are provided.',
  'no-autoplay-audio':
    'Unexpected audio startles users and can be impossible to stop for people using screen readers.',

  'td-headers-attr':
    'Screen reader users lose the relationship between table data cells and their headers.',
  'th-has-data-cells':
    'Table headers exist but are not associated with data cells, breaking table navigation.',
  'table-fake-caption':
    'Table captions are faked with non-semantic markup, so the table purpose is unclear.',
  'scope-attr-valid':
    'Invalid header scope values confuse screen readers reading row and column relationships.',

  'link-name':
    'Screen reader users hear "link" with no destination, so they cannot decide whether to follow it.',
  'identical-links-same-purpose':
    'Links with the same label go to different places, causing wrong navigation choices.',

  'aria-required-attr':
    'Assistive tech receives an incomplete widget and may expose the wrong state or role.',
  'aria-required-children':
    'Composite widgets are missing required child roles, breaking how assistive tech reads them.',
  'aria-required-parent':
    'Widget roles appear outside their required parent, so their meaning is misinterpreted.',
  'aria-roles':
    'Invalid ARIA roles cause assistive technologies to announce the wrong type of control.',
  'aria-valid-attr':
    'Unknown ARIA attributes are ignored, so intended accessibility semantics never reach users.',
  'aria-valid-attr-value':
    'Invalid ARIA values break widget state announcements (expanded, selected, checked…).',
  'aria-allowed-attr':
    'Disallowed ARIA attributes on this role are ignored, hiding important state from users.',
  'aria-allowed-role':
    'This role is not permitted on the element, so assistive tech may ignore it entirely.',
  'aria-hidden-body':
    'The entire page is hidden from assistive technology, making all content unreachable.',
  'aria-hidden-focus':
    'Focus can land on elements hidden from assistive tech, creating confusing navigation.',
  blink:
    'Blinking text distracts users and can trigger seizures or vestibular symptoms.',
  marquee:
    'Moving text is hard to read and cannot be paused by users who need static content.',

  'document-title':
    'Users cannot tell tabs apart and screen readers announce a meaningless page name.',
  'html-has-lang':
    'Screen readers may pronounce the whole page with the wrong accent and voice.',
  'html-lang-valid':
    'An invalid page language code causes incorrect pronunciation for the entire document.',
  'html-xml-lang-mismatch':
    'Conflicting language declarations make screen readers pick the wrong reading voice.',
  'valid-lang':
    'Foreign-language passages are read with the wrong accent when lang is missing or invalid.',
  'duplicate-id-aria':
    'Duplicate IDs break label associations and ARIA references, misdirecting assistive tech.',

  'heading-order':
    'Screen reader users who navigate by headings get a broken, confusing outline of the page.',
  'empty-heading':
    'Empty headings pollute the document outline and waste navigation for screen reader users.',
  'p-as-heading':
    'Styled paragraphs pretend to be headings, breaking the logical page structure.',
  'landmark-one-main':
    'Without a single main landmark, users cannot jump directly to primary content.',
  'landmark-unique':
    'Duplicate landmarks make “skip to navigation/main” commands unreliable.',
  region:
    'Content outside landmarks is harder to reach with screen reader region navigation.',
  list:
    'Lists built without proper list markup are read without item counts or structure.',
  listitem:
    'List items outside ul/ol/dl are not announced as part of a list.',
  'definition-list':
    'Definition lists with invalid structure hide term/definition relationships.',

  'meta-viewport':
    'Users who zoom to read are blocked, forcing tiny text on people who need it largest.',
  'meta-viewport-large':
    'Maximum zoom is capped below what low-vision users need to read comfortably.',
  'css-orientation-lock':
    'Users who rely on landscape or portrait orientation cannot adapt the layout to their needs.',

  label:
    'Screen reader users reach this field with no idea what to enter; voice-control users cannot target it.',
  'label-title-only':
    'Fields labeled only by title are often skipped or misidentified by assistive tech.',
  'form-field-multiple-labels':
    'Conflicting labels cause screen readers to announce the wrong field name.',
  'select-name':
    'Select menus without accessible names are announced as unlabeled controls.',
  'aria-input-field-name':
    'Custom input widgets lack an accessible name, so their purpose is unknown.',
  'autocomplete-valid':
    'Invalid autocomplete tokens prevent browsers from offering helpful autofill suggestions.',

  bypass:
    'Keyboard and screen reader users must tab through every menu item on every page load.',
  'skip-link':
    'The skip link target is missing or invalid, so it fails to bypass repetitive navigation.',
  tabindex:
    'Positive tabindex values disrupt natural tab order and confuse keyboard users.',
  accesskeys:
    'Access keys can conflict with browser or assistive tech shortcuts, causing accidental actions.',

  'meta-refresh':
    'Automatic page refresh disorients users and interrupts reading or form completion.',
  'meta-refresh-no-exceptions':
    'Timed redirects without user control remove agency from people who read slowly.',
};

export function userImpactFor(ruleId: string, fallback: string): string {
  return IMPACTS[ruleId] ?? fallback;
}

/** Ensures every mapped axe rule has a dedicated user-impact string. */
export function assertAxeImpactsComplete(): void {
  for (const ruleId of getAxeRuleIds()) {
    if (!IMPACTS[ruleId]) {
      throw new Error(`Missing user impact for axe rule "${ruleId}"`);
    }
  }
}
