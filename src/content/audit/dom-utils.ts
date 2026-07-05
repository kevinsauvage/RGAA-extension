/** Shared DOM helpers for the audit modules (content-script only). */

import { auditDoc } from './audit-context';

/** Whether a media element should be included in audit checks. */
export function isAuditableMedia(el: Element): boolean {
  if (el.getAttribute('aria-hidden') === 'true') return false;
  if (el instanceof HTMLElement && el.hidden) return false;
  const inline = el.getAttribute('style') ?? '';
  return !/display\s*:\s*none/i.test(inline);
}

export function isVisible(el: Element): boolean {
  const inline = el.getAttribute('style') ?? '';
  if (/display\s*:\s*none/i.test(inline) || /visibility\s*:\s*hidden/i.test(inline)) {
    return false;
  }

  if (el instanceof HTMLElement && el.hidden) return false;

  const tag = el.tagName.toLowerCase();
  // Media elements may have no layout box but still play content.
  if (tag === 'audio' || tag === 'video') {
    if (el.getAttribute('aria-hidden') === 'true') return false;
    const style = getComputedStyle(el);
    return style.display !== 'none' && style.visibility !== 'hidden';
  }

  if (!(el instanceof HTMLElement)) {
    const style = getComputedStyle(el);
    if (style.display === 'none' || style.visibility === 'hidden') return false;
    if (parseFloat(style.opacity) === 0) return false;
    const rect = el.getBoundingClientRect();
    return rect.width > 0 || rect.height > 0;
  }

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

  while (el && el !== auditDoc().documentElement && path.length < 5) {
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
