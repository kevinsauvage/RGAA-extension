import { collectOpenShadowRoots, getAuditableDocuments } from './audit-context';

/** Deduplicate and trim CSS selector candidates. */
export function normalizeSelectors(selectors: string[]): string[] {
  const unique = new Set<string>();
  for (const selector of selectors) {
    const trimmed = selector.trim();
    if (trimmed) unique.add(trimmed);
  }
  return [...unique];
}

/** Find the first element matching any selector across documents, iframes, and open shadow roots. */
export function findElement(selectors: string[]): Element | null {
  const candidates = normalizeSelectors(selectors);
  if (candidates.length === 0) return null;

  for (const doc of getAuditableDocuments()) {
    const roots: ParentNode[] = [doc, ...collectOpenShadowRoots(doc)];
    for (const root of roots) {
      for (const selector of candidates) {
        try {
          const element = root.querySelector(selector);
          if (element) return element;
        } catch {
          // Invalid selector — try next.
        }
      }
    }
  }

  return null;
}

/** Check which selectors resolve on the live page (including frames and shadow DOM). */
export function verifySelectors(selectors: string[]): Record<string, boolean> {
  const results: Record<string, boolean> = {};
  for (const selector of selectors) {
    results[selector] = findElement([selector]) !== null;
  }
  return results;
}
