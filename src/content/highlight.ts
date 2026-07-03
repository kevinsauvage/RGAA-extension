/**
 * Draws a transient overlay around an audited element so the user can locate it
 * on the page from the side panel. Uses a single reusable overlay element.
 */
const OVERLAY_ID = '__a11yfix_highlight__';

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
      transition: 'all 120ms ease-out',
      display: 'none',
    } satisfies Partial<CSSStyleDeclaration>);
    document.body.appendChild(overlay);
  }
  return overlay;
}

export function highlightNode(selector: string): void {
  let element: Element | null = null;
  try {
    element = document.querySelector(selector);
  } catch {
    element = null;
  }
  if (!element) return;

  element.scrollIntoView({ behavior: 'smooth', block: 'center' });
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

export function clearHighlight(): void {
  const overlay = document.getElementById(OVERLAY_ID);
  if (overlay) overlay.style.display = 'none';
}
