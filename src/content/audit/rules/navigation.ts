import { auditDoc } from '../audit-context';
import { getTabbableElements, hasFocusTrap } from '../focus-utils';
import { isVisible } from '../dom-utils';
import { multiNodeFinding, type RuleFinding } from './shared';

const DISMISS_SELECTOR =
  'button[aria-label*="close" i], button[aria-label*="fermer" i], [data-dismiss], [data-bs-dismiss], [data-close], [aria-label*="Close" i]';

/** RGAA 12.9 — keyboard focus trapped inside a modal without escape. */
export function checkKeyboardTrap(): RuleFinding | null {
  const doc = auditDoc();
  const offenders: Element[] = [];
  const allTabbables = getTabbableElements(doc.body);
  const outsideTabbables = (container: Element) =>
    allTabbables.filter((el) => !container.contains(el));

  for (const modal of doc.querySelectorAll('[aria-modal="true"], [role="dialog"]')) {
    if (!isVisible(modal)) continue;
    if (outsideTabbables(modal).length === 0) continue;

    const hasDismiss = modal.querySelector(DISMISS_SELECTOR) !== null;
    const innerTabbables = getTabbableElements(modal);
    if (innerTabbables.length === 0) continue;

    if (!hasDismiss && (hasFocusTrap(modal, outsideTabbables(modal)) || innerTabbables.length >= 2)) {
      offenders.push(modal);
    }
  }

  return multiNodeFinding(offenders, {
    criterion: '12.9',
    ruleId: 'rgaa-keyboard-trap',
    severity: 'serious',
    title: 'Piège clavier dans une fenêtre modale',
    description:
      'Une fenêtre modale ou un dialogue retient le focus au clavier sans mécanisme de fermeture détectable.',
    userImpact:
      'Les utilisateurs au clavier ne peuvent pas quitter la fenêtre pour accéder au reste de la page.',
  });
}
