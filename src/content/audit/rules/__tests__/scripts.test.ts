import { describe, it } from 'vitest';
import { checkKeyboardAccessible } from '../scripts';
import { expectNoFinding, expectRule, setBodyHtml } from './setup';

describe('checkKeyboardAccessible (RGAA 7.3)', () => {
  it('passes for native button', () => {
    setBodyHtml('<button type="button">Valider</button>');
    expectNoFinding(checkKeyboardAccessible());
  });

  it('passes for native link', () => {
    setBodyHtml('<a href="/contact">Contact</a>');
    expectNoFinding(checkKeyboardAccessible());
  });

  it('passes for div with role=button and tabindex=0', () => {
    setBodyHtml('<div role="button" tabindex="0">Action</div>');
    expectNoFinding(checkKeyboardAccessible());
  });

  it('passes for div with role=button even if tabindex unset (has role)', () => {
    setBodyHtml('<div role="button">Action</div>');
    expectNoFinding(checkKeyboardAccessible());
  });

  it('flags div with onclick and no keyboard access', () => {
    setBodyHtml('<div onclick="submit()">Cliquer ici</div>');
    expectRule(checkKeyboardAccessible(), 'rgaa-keyboard-accessible');
  });

  it('flags span with onclick attribute', () => {
    setBodyHtml('<span onclick="openMenu()">Menu</span>');
    expectRule(checkKeyboardAccessible(), 'rgaa-keyboard-accessible');
  });

  it('passes when onclick div has tabindex=0', () => {
    setBodyHtml('<div onclick="go()" tabindex="0">Go</div>');
    expectNoFinding(checkKeyboardAccessible());
  });

  it('ignores hidden interactive elements', () => {
    setBodyHtml('<div onclick="x()" style="display:none">Hidden</div>');
    expectNoFinding(checkKeyboardAccessible());
  });
});
