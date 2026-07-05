import { isVisible } from '../dom-utils';
import { multiNodeFinding, type RuleFinding } from './shared';

/** RGAA 5.8 — layout tables using data-table semantics. */
export function checkLayoutTableSemantics(): RuleFinding | null {
  const offenders: Element[] = [];
  for (const table of document.querySelectorAll('table')) {
    if (!isVisible(table)) continue;
    const role = table.getAttribute('role');
    if (role === 'presentation' || role === 'none') continue;
    const hasDataSemantics =
      table.hasAttribute('summary') ||
      table.querySelector('th, caption, summary, [scope], [headers]') !== null;
    if (hasDataSemantics && table.querySelector('td') && table.querySelector('th') === null) {
      const cellCount = table.querySelectorAll('td').length;
      if (cellCount <= 4) offenders.push(table);
    }
  }
  return multiNodeFinding(offenders, {
    criterion: '5.8',
    ruleId: 'rgaa-layout-table-semantics',
    severity: 'moderate',
    title: 'Tableau de mise en forme avec sémantique de données',
    description:
      'Des tableaux de mise en forme utilisent th, caption ou summary, ou devraient avoir role="presentation".',
    userImpact:
      'Les lecteurs d’écran annoncent un tableau de données là où il n’y a que de la mise en page.',
  });
}
