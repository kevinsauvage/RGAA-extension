/**
 * Computed-style snippets for the AI deep scan.
 * Helps assess color-only cues and contrast adjacency without running full contrast math.
 */

import { buildSelector, isVisible } from './dom-utils';

const SNIPPET_LIMIT = 35;

const CANDIDATE_SELECTOR =
  'a[href], button, label, p, span, h1, h2, h3, h4, input, select, textarea, [aria-required], [class*="required"], [class*="error"]';

function effectiveBackground(el: Element): string {
  let current: Element | null = el;
  while (current) {
    const bg = getComputedStyle(current).backgroundColor;
    if (bg && bg !== 'rgba(0, 0, 0, 0)' && bg !== 'transparent') return bg;
    current = current.parentElement;
  }
  return 'transparent';
}

/** Collect compact computed-style lines for color/context assessment. */
export function buildStyleSnippets(): string {
  const lines: string[] = [];
  const seen = new Set<string>();

  for (const el of document.querySelectorAll(CANDIDATE_SELECTOR)) {
    if (lines.length >= SNIPPET_LIMIT) break;
    if (!(el instanceof HTMLElement) || !isVisible(el)) continue;

    const selector = buildSelector(el);
    if (seen.has(selector)) continue;
    seen.add(selector);

    const style = getComputedStyle(el);
    const text = el.textContent?.replace(/\s+/g, ' ').trim().slice(0, 48);
    const tag = el.tagName.toLowerCase();
    lines.push(
      [
        selector,
        `tag=${tag}`,
        text ? `text="${text}"` : null,
        `color=${style.color}`,
        `background=${effectiveBackground(el)}`,
        `font-weight=${style.fontWeight}`,
        style.textDecorationLine !== 'none' ? `text-decoration=${style.textDecorationLine}` : null,
      ]
        .filter(Boolean)
        .join('; '),
    );
  }

  return lines.join('\n');
}
