/** Shared DOM helpers for the audit modules (content-script only). */

export function isVisible(el: Element): boolean {
  if (!(el instanceof HTMLElement)) return true;
  const style = getComputedStyle(el);
  if (style.display === 'none' || style.visibility === 'hidden') return false;
  if (parseFloat(style.opacity) === 0) return false;
  const rect = el.getBoundingClientRect();
  return rect.width > 0 || rect.height > 0;
}

/** Build a stable CSS selector for highlighting (prefers id, else nth-of-type path). */
export function buildSelector(element: Element): string {
  if (element.id) {
    try {
      return `#${CSS.escape(element.id)}`;
    } catch {
      return `#${element.id}`;
    }
  }

  const path: string[] = [];
  let el: Element | null = element;

  while (el && el !== document.documentElement && path.length < 5) {
    const tag = el.tagName.toLowerCase();
    const parent: Element | null = el.parentElement;
    if (!parent) {
      path.unshift(tag);
      break;
    }
    let index = 1;
    for (const sibling of parent.children) {
      if (sibling === el) break;
      if (sibling.tagName === el.tagName) index += 1;
    }
    path.unshift(`${tag}:nth-of-type(${index})`);
    el = parent;
  }

  return path.join(' > ');
}

export function truncate(text: string, max = 200): string {
  const clean = text.replace(/\s+/g, ' ').trim();
  return clean.length > max ? `${clean.slice(0, max)}…` : clean;
}

/** Text of the closest block ancestor, for judging an element in context. */
export function surroundingText(element: Element, max = 160): string | undefined {
  const block = element.closest('p, li, td, figcaption, article, section, div');
  const text = block?.textContent;
  if (!text?.trim()) return undefined;
  return truncate(text, max);
}
