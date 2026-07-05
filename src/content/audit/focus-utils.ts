import { auditDoc } from './audit-context';
import { isVisible } from './dom-utils';

const TABBABLE_SELECTOR =
  'a[href], button:not([disabled]), input:not([disabled]):not([type="hidden"]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"]), [contenteditable="true"], audio[controls], video[controls], summary';

function isTabbable(el: HTMLElement): boolean {
  if (!isVisible(el)) return false;
  if (el.closest('[aria-hidden="true"], [inert]')) return false;
  if (el.hasAttribute('disabled')) return false;
  if (el.tabIndex < 0 && !el.matches(TABBABLE_SELECTOR.replace(/:not\([^)]+\)/g, ''))) {
    return false;
  }
  return true;
}

/** Focusable elements in approximate tab order within a root. */
export function getTabbableElements(root: ParentNode = auditDoc()): HTMLElement[] {
  const nodes = [...root.querySelectorAll<HTMLElement>(TABBABLE_SELECTOR)].filter(isTabbable);

  return nodes.sort((a, b) => {
    const aIdx = a.tabIndex > 0 ? a.tabIndex : 0;
    const bIdx = b.tabIndex > 0 ? b.tabIndex : 0;
    if (aIdx !== bIdx) {
      if (aIdx === 0) return 1;
      if (bIdx === 0) return -1;
      return aIdx - bIdx;
    }
    if (a === b) return 0;
    const position = a.compareDocumentPosition(b);
    if (position & Node.DOCUMENT_POSITION_FOLLOWING) return -1;
    if (position & Node.DOCUMENT_POSITION_PRECEDING) return 1;
    return 0;
  });
}

/** Whether focus cycles inside a container without reaching outside tabbables. */
export function hasFocusTrap(container: Element, outerTabbables: HTMLElement[]): boolean {
  if (outerTabbables.length === 0) return false;

  const innerTabbables = getTabbableElements(container);
  if (innerTabbables.length === 0) return false;

  const doc = auditDoc();
  const active = doc.activeElement;
  const originalFocus = active instanceof HTMLElement ? active : null;

  try {
    innerTabbables[0].focus();
    const allTabbables = getTabbableElements(doc.body);

    for (let step = 0; step < allTabbables.length + 2; step += 1) {
      const focused = doc.activeElement;
      if (!(focused instanceof HTMLElement)) return false;
      if (!container.contains(focused)) return false;

      const index = allTabbables.indexOf(focused);
      const next = allTabbables[(index + 1) % allTabbables.length];
      next?.focus();
    }

    const stillInside = container.contains(doc.activeElement);
    const escaped = outerTabbables.some((el) => el === doc.activeElement);
    return stillInside && !escaped;
  } finally {
    originalFocus?.focus();
  }
}
