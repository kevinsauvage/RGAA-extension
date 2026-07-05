import { auditDoc, auditQueryAll } from '../audit-context';
import { multiNodeFinding, type RuleFinding } from './shared';

/** RGAA 8.1 — valid doctype present. */
export function checkDoctype(): RuleFinding | null {
  const dt = auditDoc().doctype;
  if (dt && dt.name.toLowerCase() === 'html') return null;
  return {
    criterion: '8.1',
    ruleId: 'rgaa-doctype',
    severity: 'moderate',
    title: 'Doctype HTML absent ou invalide',
    description: 'La page ne déclare pas un doctype HTML valide.',
    userImpact:
      'Sans doctype, les navigateurs peuvent basculer en mode quirks et interpréter le code différemment.',
    nodes: [
      {
        selector: 'html',
        html: '<html>…</html>',
      },
    ],
  };
}

/** RGAA 8.10 — text direction changes not marked with dir attribute. */
export function checkTextDirection(): RuleFinding | null {
  const offenders: Element[] = [];
  const doc = auditDoc();
  const rtlChars = /[\u0590-\u08FF\uFB1D-\uFDFF\uFE70-\uFEFF]/;
  const pageDir = doc.documentElement.getAttribute('dir') ?? 'ltr';
  for (const el of auditQueryAll('p, li, td, th, span, div, blockquote')) {
    const text = el.textContent?.trim() ?? '';
    if (text.length < 8) continue;
    const elDir = el.getAttribute('dir') ?? el.closest('[dir]')?.getAttribute('dir') ?? pageDir;
    if (elDir === 'ltr' && rtlChars.test(text)) offenders.push(el);
    if (elDir === 'rtl' && /^[A-Za-z0-9\s.,!?'"()-]+$/.test(text) && text.length > 20) {
      offenders.push(el);
    }
  }
  return multiNodeFinding(offenders, {
    criterion: '8.10',
    ruleId: 'rgaa-text-direction',
    severity: 'minor',
    title: 'Changement de sens de lecture non signalé',
    description:
      'Un passage de texte semble dans une direction de lecture différente sans attribut dir approprié.',
    userImpact: 'Les lecteurs d’écran peuvent lire le texte dans le mauvais ordre.',
  });
}
