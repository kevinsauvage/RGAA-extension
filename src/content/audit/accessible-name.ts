/**
 * Lightweight accessible name computation (subset of AccName 1.1).
 * Good enough for AI audit context, not a full implementation.
 */
import { auditGetElementById, auditQuerySelector } from './audit-context';

export function computeAccessibleName(element: Element): string | undefined {
  const ariaLabel = element.getAttribute('aria-label')?.trim();
  if (ariaLabel) return ariaLabel;

  const labelledBy = element.getAttribute('aria-labelledby');
  if (labelledBy) {
    const parts = labelledBy
      .split(/\s+/)
      .map((id) => auditGetElementById(id)?.textContent?.trim())
      .filter(Boolean);
    if (parts.length) return parts.join(' ');
  }

  const tag = element.tagName.toLowerCase();
  if (tag === 'img' || tag === 'area') {
    const alt = element.getAttribute('alt');
    if (alt !== null) return alt.trim();
  }

  if (tag === 'input' || tag === 'select' || tag === 'textarea' || tag === 'canvas') {
    const id = element.getAttribute('id');
    if (id) {
      const label = auditQuerySelector(`label[for="${CSS.escape(id)}"]`);
      if (label?.textContent?.trim()) return label.textContent.trim();
    }
    const title = element.getAttribute('title')?.trim();
    if (title) return title;
    const placeholder = element.getAttribute('placeholder')?.trim();
    if (placeholder) return placeholder;
  }

  if (tag === 'svg') {
    const title = element.querySelector('title')?.textContent?.trim();
    if (title) return title;
  }

  if (tag === 'a' || tag === 'button') {
    const text = element.textContent?.replace(/\s+/g, ' ').trim();
    if (text) return text.slice(0, 120);
  }

  const title = element.getAttribute('title')?.trim();
  if (title) return title;

  return undefined;
}
