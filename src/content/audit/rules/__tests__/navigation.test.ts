import { describe, it } from 'vitest';
import { checkKeyboardTrap, checkSkipLink } from '../navigation';
import { expectNoFinding, expectRule, setBodyHtml } from './setup';

describe('checkSkipLink (RGAA 12.7)', () => {
  it('passes when skip link targets main content', () => {
    setBodyHtml(`
      <a href="#main">Aller au contenu principal</a>
      <main id="main"><h1>Page</h1></main>
    `);
    expectNoFinding(checkSkipLink());
  });

  it('flags missing skip link when main exists', () => {
    setBodyHtml('<main><h1>Contenu</h1></main>');
    expectRule(checkSkipLink(), 'rgaa-skip-link');
  });
});

describe('checkKeyboardTrap (RGAA 12.9)', () => {
  it('passes when modal has a close button', () => {
    setBodyHtml(`
      <main><button id="outside">Outside</button></main>
      <div role="dialog" aria-modal="true">
        <p>Modal content</p>
        <button aria-label="Fermer">×</button>
        <button>OK</button>
      </div>
    `);
    expectNoFinding(checkKeyboardTrap());
  });

  it('passes when no modal is present', () => {
    setBodyHtml('<main><button>Action</button></main>');
    expectNoFinding(checkKeyboardTrap());
  });

  it('flags aria-modal dialog without dismiss control and keyboard trap', () => {
    setBodyHtml(`
      <main><a href="/help">Help</a></main>
      <div role="dialog" aria-modal="true">
        <button>First</button>
        <button>Second</button>
        <input type="text" />
      </div>
    `);
    expectRule(checkKeyboardTrap(), 'rgaa-keyboard-trap');
  });
});
