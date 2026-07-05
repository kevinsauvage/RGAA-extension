/**
 * Draws a transient overlay around an audited element so the user can locate it
 * on the page from the side panel. Uses a single reusable overlay element.
 */
import { findElement, normalizeSelectors } from './audit/dom-resolve';

const OVERLAY_ID = '__a11yfix_highlight__';

let pinnedKey: string | null = null;
let scrollListener: (() => void) | null = null;
let resizeListener: (() => void) | null = null;

function ensureOverlay(): HTMLDivElement {
  let overlay = document.getElementById(OVERLAY_ID) as HTMLDivElement | null;
  if (!overlay) {
    overlay = document.createElement('div');
    overlay.id = OVERLAY_ID;
    Object.assign(overlay.style, {
      position: 'fixed',
      zIndex: '2147483647',
      pointerEvents: 'none',
      border: '2px solid #3182f6',
      boxShadow: '0 0 0 4px rgba(49,130,246,0.25)',
      borderRadius: '4px',
      transition:
        'top 120ms ease-out, left 120ms ease-out, width 120ms ease-out, height 120ms ease-out',
      display: 'none',
    } satisfies Partial<CSSStyleDeclaration>);
    document.body.appendChild(overlay);
  }
  return overlay;
}

function selectorKey(selectors: string[]): string {
  return normalizeSelectors(selectors).join('|');
}

function positionOverlay(element: Element): void {
  const rect = element.getBoundingClientRect();
  const overlay = ensureOverlay();
  Object.assign(overlay.style, {
    display: 'block',
    top: `${rect.top - 3}px`,
    left: `${rect.left - 3}px`,
    width: `${rect.width + 6}px`,
    height: `${rect.height + 6}px`,
  });
}

function hideOverlay(): void {
  const overlay = document.getElementById(OVERLAY_ID);
  if (overlay) overlay.style.display = 'none';
}

function attachPositionListeners(selectors: string[]): void {
  detachPositionListeners();

  const update = () => {
    const element = findElement(selectors);
    if (!element) {
      clearPinnedHighlight();
      return;
    }
    positionOverlay(element);
  };

  scrollListener = update;
  resizeListener = update;
  window.addEventListener('scroll', update, true);
  window.addEventListener('resize', update);
}

function detachPositionListeners(): void {
  if (scrollListener) {
    window.removeEventListener('scroll', scrollListener, true);
    scrollListener = null;
  }
  if (resizeListener) {
    window.removeEventListener('resize', resizeListener);
    resizeListener = null;
  }
}

export function highlightNode(
  selector: string,
  options: { targets?: string[]; persist?: boolean } = {},
): boolean {
  const selectors = options.targets?.length ? options.targets : selector ? [selector] : [];
  const element = findElement(selectors);
  if (!element) return false;

  element.scrollIntoView({ behavior: 'smooth', block: 'center', inline: 'nearest' });
  positionOverlay(element);

  const key = selectorKey(selectors);
  if (options.persist) {
    pinnedKey = key;
    attachPositionListeners(selectors);
  } else if (!pinnedKey) {
    attachPositionListeners(selectors);
  }

  return true;
}

/** Clear hover preview. Keeps a pinned (clicked) highlight in place. */
export function clearHighlight(): void {
  if (pinnedKey) return;
  detachPositionListeners();
  hideOverlay();
}

/** Clear any highlight, including a pinned one. */
export function clearPinnedHighlight(): void {
  pinnedKey = null;
  detachPositionListeners();
  hideOverlay();
}
