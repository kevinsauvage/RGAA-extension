import { auditQueryAll } from '../audit-context';
import { computeAccessibleName } from '../accessible-name';
import { isVisible } from '../dom-utils';
import { multiNodeFinding, type RuleFinding } from './shared';

const INTERACTIVE =
  'a[href], button, [role="button"], [role="link"], [onclick], [tabindex]:not([tabindex="-1"])';

const WIDGET_ROLES = new Set([
  'button',
  'checkbox',
  'combobox',
  'gridcell',
  'link',
  'listbox',
  'menuitem',
  'menuitemcheckbox',
  'menuitemradio',
  'option',
  'radio',
  'searchbox',
  'slider',
  'spinbutton',
  'switch',
  'tab',
  'textbox',
  'treeitem',
  'progressbar',
  'scrollbar',
]);

/** RGAA 7.2 — scripted widget without accessible name or alternative. */
export function checkScriptWidgetAlternative(): RuleFinding | null {
  const offenders: Element[] = [];
  const seen = new Set<Element>();

  for (const el of auditQueryAll('[role]')) {
    if (!isVisible(el)) continue;
    const role = el.getAttribute('role');
    if (!role || !WIDGET_ROLES.has(role)) continue;
    if (computeAccessibleName(el)) continue;
    if (seen.has(el)) continue;
    seen.add(el);
    offenders.push(el);
  }

  for (const el of auditQueryAll<HTMLElement>('[aria-pressed], [aria-expanded], [aria-checked]')) {
    if (!isVisible(el)) continue;
    if (el.matches('button, input, select, textarea, a[href]')) continue;
    if (computeAccessibleName(el)) continue;
    if (seen.has(el)) continue;
    seen.add(el);
    offenders.push(el);
  }

  return multiNodeFinding(offenders, {
    criterion: '7.2',
    ruleId: 'rgaa-script-widget-alt',
    severity: 'serious',
    title: 'Composant scripté sans alternative accessible',
    description:
      'Des widgets scriptés (rôle ARIA ou états aria-*) n’ont pas de nom accessible (aria-label, aria-labelledby ou texte visible).',
    userImpact:
      'Les utilisateurs de lecteur d’écran ne comprennent pas le rôle ou l’action du composant scripté.',
  });
}

/** RGAA 7.3 — non-native elements acting as controls without keyboard access. */
export function checkKeyboardAccessible(): RuleFinding | null {
  const offenders: Element[] = [];
  for (const el of auditQueryAll<HTMLElement>(INTERACTIVE)) {
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
