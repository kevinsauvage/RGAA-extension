import { auditDoc, auditGetElementById, auditQueryAll, auditQuerySelector } from '../audit-context';
import { computeAccessibleName } from '../accessible-name';
import { getTabbableElements, hasFocusTrap } from '../focus-utils';
import { isVisible } from '../dom-utils';
import { multiNodeFinding, type RuleFinding } from './shared';

const DISMISS_SELECTOR =
  'button[aria-label*="close" i], button[aria-label*="fermer" i], [data-dismiss], [data-bs-dismiss], [data-close], [aria-label*="Close" i]';

const SKIP_LINK_HINTS = /contenu|content|main|principal/i;

/** RGAA 12.7 — skip link to main content. */
export function checkSkipLink(): RuleFinding | null {
  const main = auditQuerySelector('main, [role="main"]');
  if (!main) return null;
  const firstLinks = [...auditQueryAll<HTMLAnchorElement>('a[href^="#"]')].slice(0, 8);
  const hasSkipLink = firstLinks.some((link) => {
    const name = computeAccessibleName(link) ?? '';
    const targetId = link.getAttribute('href')?.slice(1) ?? '';
    if (!targetId) return false;
    const target = auditGetElementById(targetId);
    return (
      SKIP_LINK_HINTS.test(name) &&
      (target === main || main.contains(target) || target?.contains(main) === true)
    );
  });
  if (hasSkipLink) return null;
  return {
    criterion: '12.7',
    ruleId: 'rgaa-skip-link',
    severity: 'moderate',
    title: "Lien d'évitement vers le contenu principal absent",
    description: "Aucun lien d'accès rapide vers la zone de contenu principal n'a été détecté.",
    userImpact: 'Les utilisateurs au clavier doivent tabuler à travers tout le menu.',
    nodes: [{ selector: 'main, [role="main"]', html: main.outerHTML.slice(0, 220) }],
  };
}

/** RGAA 12.9 — keyboard focus trapped inside a modal without escape. */
export function checkKeyboardTrap(): RuleFinding | null {
  const doc = auditDoc();
  const offenders: Element[] = [];
  const allTabbables = getTabbableElements(doc.body);
  const outsideTabbables = (container: Element) =>
    allTabbables.filter((el) => !container.contains(el));

  for (const modal of auditQueryAll('[aria-modal="true"], [role="dialog"]')) {
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
