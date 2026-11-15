import { describe, expect, it } from 'vitest';
import { inpFromEntries } from '../performance';

describe('inpFromEntries', () => {
  it('reports nothing before the first interaction', () => {
    expect(inpFromEntries([])).toBeNull();
    // Events without an interaction id (mousemove, scroll) are not interactions.
    expect(inpFromEntries([{ duration: 900, interactionId: 0 }, { duration: 300 }])).toBeNull();
  });

  it('takes the longest event of an interaction, then the slowest interaction', () => {
    const entries = [
      // One tap: pointerdown, pointerup and click share an id.
      { duration: 48, interactionId: 1 },
      { duration: 120.4, interactionId: 1 },
      { duration: 96, interactionId: 1 },
      // A key press.
      { duration: 312.6, interactionId: 2 },
      { duration: 64, interactionId: 3 },
    ];

    expect(inpFromEntries(entries)).toBe(313);
  });
});
