import { isVisible } from '../dom-utils';
import { multiNodeFinding, type RuleFinding } from './shared';

const INTERACTIVE = 'a[href], button, [role="button"], [role="link"], [onclick], [tabindex]:not([tabindex="-1"])';

/** RGAA 7.3 — non-native elements acting as controls without keyboard access. */
export function checkKeyboardAccessible(): RuleFinding | null {
  const offenders: Element[] = [];
  for (const el of document.querySelectorAll<HTMLElement>(INTERACTIVE)) {
    if (!isVisible(el)) continue;
    const tag = el.tagName.toLowerCase();
    if (['a', 'button', 'input', 'select', 'textarea'].includes(tag)) continue;
    const role = el.getAttribute('role');
    if (role === 'button' || role === 'link' || role === 'menuitem') {
      if (el.tabIndex >= 0) continue;
    }
    const hasClick = el.hasAttribute('onclick') || el.getAttribute('role') === 'button';
    const tabIndex = el.tabIndex;
    if (hasClick && tabIndex < 0 && !role) offenders.push(el);
  }
  return multiNodeFinding(offenders, {
    criterion: '7.3',
    ruleId: 'rgaa-keyboard-accessible',
    severity: 'serious',
    title: 'Élément scripté inaccessible au clavier',
    description:
      'Des éléments non natifs (div, span…) déclenchent une action au clic sans être focusables au clavier (tabindex ou rôle approprié).',
    userImpact: 'Les utilisateurs au clavier ne peuvent pas activer ces contrôles.',
  });
}
