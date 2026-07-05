/**
 * Short, human-readable "what a real user experiences" strings keyed by axe
 * rule id. These are deterministic fallbacks; the AI layer can produce richer,
 * markup-specific explanations on demand.
 */
const IMPACTS: Record<string, string> = {
  'image-alt':
    'Screen reader users hear nothing (or the file name) where an image should convey meaning.',
  'color-contrast': 'Low-vision users and anyone in bright light cannot reliably read this text.',
  'link-name':
    'Screen reader users hear "link" with no destination, so they cannot decide whether to follow it.',
  label:
    'Screen reader users reach this field with no idea what to enter; voice-control users cannot target it.',
  'button-name':
    'The control is announced as an unlabeled "button", giving no clue about what it does.',
  'document-title':
    'Users cannot tell tabs apart and screen readers announce a meaningless page name.',
  'html-has-lang': 'Screen readers may pronounce the whole page with the wrong accent and voice.',
  'heading-order':
    'Screen reader users who navigate by headings get a broken, confusing outline of the page.',
  'frame-title':
    'Screen reader users hear an unlabeled frame and cannot tell what content it holds.',
  'aria-required-attr':
    'Assistive tech receives an incomplete widget and may expose the wrong state or role.',
  bypass: 'Keyboard and screen reader users must tab through every menu item on every page load.',
  'meta-viewport':
    'Users who zoom to read are blocked, forcing tiny text on people who need it largest.',
};

export function userImpactFor(ruleId: string, fallback: string): string {
  return IMPACTS[ruleId] ?? fallback;
}
