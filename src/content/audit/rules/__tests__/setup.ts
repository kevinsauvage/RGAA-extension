/**
 * Shared DOM setup for deterministic rule tests.
 * happy-dom reports 0×0 bounding boxes — we stub dimensions for visible elements.
 */

import { beforeEach, expect, vi } from 'vitest';

export function setPageHtml(html: string): void {
  document.documentElement.innerHTML = html;
}

/** Parse a fragment into body (preserves structure without replacing html/body). */
export function setBodyHtml(html: string): void {
  document.body.innerHTML = html;
}

export function setHeadHtml(html: string): void {
  document.head.innerHTML = html;
}

export function mockDoctype(name: string | null): void {
  if (name === null) {
    Object.defineProperty(document, 'doctype', { value: null, configurable: true });
    return;
  }
  Object.defineProperty(document, 'doctype', {
    value: { name, publicId: '', systemId: '' },
    configurable: true,
  });
}

/** Assert a rule returns a finding with the expected ruleId. */
export function expectRule(
  result: { ruleId: string; criterion: string; nodes: unknown[] } | null,
  ruleId: string,
): void {
  expect(result).not.toBeNull();
  expect(result!.ruleId).toBe(ruleId);
  expect(result!.nodes.length).toBeGreaterThan(0);
}

export function expectNoFinding(result: unknown): void {
  expect(result).toBeNull();
}

beforeEach(() => {
  document.documentElement.innerHTML = '<head></head><body></body>';
  mockDoctype('html');

  vi.spyOn(Element.prototype, 'getBoundingClientRect').mockImplementation(function (
    this: Element,
  ) {
    if (!(this instanceof HTMLElement)) return new DOMRect(0, 0, 100, 20);
    const style = getComputedStyle(this);
    const inline = this.getAttribute('style') ?? '';
    if (
      style.display === 'none' ||
      style.visibility === 'hidden' ||
      style.opacity === '0' ||
      /display\s*:\s*none/i.test(inline) ||
      /left\s*:\s*-999/i.test(inline) ||
      /text-indent\s*:\s*-999/i.test(inline) ||
      parseFloat(style.fontSize) === 0
    ) {
      return new DOMRect(0, 0, 0, 0);
    }
    return new DOMRect(0, 0, 200, 40);
  });
});
