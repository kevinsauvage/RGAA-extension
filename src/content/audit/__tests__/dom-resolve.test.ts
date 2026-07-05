import { beforeEach, describe, expect, it } from 'vitest';
import { findElement, verifySelectors } from '../dom-resolve';

describe('dom-resolve', () => {
  beforeEach(() => {
    document.body.innerHTML = '';
  });

  it('finds elements in open shadow roots', () => {
    const host = document.createElement('div');
    document.body.appendChild(host);
    const shadow = host.attachShadow({ mode: 'open' });
    const button = document.createElement('button');
    button.id = 'shadow-btn';
    shadow.appendChild(button);

    expect(findElement(['#shadow-btn'])).toBe(button);
    expect(verifySelectors(['#shadow-btn'])).toEqual({ '#shadow-btn': true });
  });

  it('returns false for invalid selectors', () => {
    expect(verifySelectors(['>>>invalid'])).toEqual({ '>>>invalid': false });
  });
});
