import { computeAccessibleName } from '../accessible-name';
import { isVisible } from '../dom-utils';
import { multiNodeFinding, type RuleFinding } from './shared';

const NEW_WINDOW_HINTS = /nouvelle\s+fen[eê]tre|new\s+(window|tab)|ouvre\s+dans/i;
const DOC_EXTENSIONS = /\.(pdf|docx?|xlsx?|pptx?|odt|ods|odp)([?#]|$)/i;
const FORMAT_HINTS =
  /pdf|docx?|xlsx?|pptx?|word|excel|powerpoint|document|téléchargement|download|[\d,.]+\s*(ko|mo|kb|mb)/i;
const SKIP_LINK_HINTS = /contenu|content|main|principal/i;
const REQUIRED_MARKERS = /obligatoire|required|\*|requis/i;

/** RGAA 13.2 — target=_blank without warning. */
export function checkNewWindowLinks(): RuleFinding | null {
  const offenders: Element[] = [];
  for (const link of document.querySelectorAll('a[target="_blank"]')) {
    if (!isVisible(link)) continue;
    const name = computeAccessibleName(link) ?? '';
    const title = link.getAttribute('title') ?? '';
    if (!NEW_WINDOW_HINTS.test(name) && !NEW_WINDOW_HINTS.test(title)) offenders.push(link);
  }
  return multiNodeFinding(offenders, {
    criterion: '13.2',
    ruleId: 'rgaa-new-window-warning',
    severity: 'minor',
    title: 'Ouverture de nouvelle fenêtre non signalée',
    description:
      'Des liens avec target="_blank" ne préviennent pas que le lien ouvre une nouvelle fenêtre.',
    userImpact: "Les utilisateurs de lecteur d'écran perdent leur contexte sans avertissement.",
  });
}

/** RGAA 13.3 — document download links without format in label. */
export function checkDocumentLinks(): RuleFinding | null {
  const offenders: Element[] = [];
  for (const link of document.querySelectorAll('a[href]')) {
    if (!isVisible(link)) continue;
    const href = link.getAttribute('href') ?? '';
    if (!DOC_EXTENSIONS.test(href)) continue;
    const name = computeAccessibleName(link) ?? '';
    if (!FORMAT_HINTS.test(name)) offenders.push(link);
  }
  return multiNodeFinding(offenders, {
    criterion: '13.3',
    ruleId: 'rgaa-doc-link-format',
    severity: 'minor',
    title: 'Document en téléchargement sans indication de format',
    description:
      "Des liens vers des documents bureautiques n'indiquent pas le format dans l'intitulé.",
    userImpact: "Les utilisateurs ne savent pas qu'ils vont télécharger un fichier.",
  });
}

/** RGAA 12.7 — skip link to main content. */
export function checkSkipLink(): RuleFinding | null {
  const main = document.querySelector('main, [role="main"]');
  if (!main) return null;
  const firstLinks = [...document.querySelectorAll('a[href^="#"]')].slice(0, 8);
  const hasSkipLink = firstLinks.some((link) => {
    const name = computeAccessibleName(link) ?? '';
    const targetId = link.getAttribute('href')?.slice(1) ?? '';
    if (!targetId) return false;
    const target = document.getElementById(targetId);
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

/** RGAA 11.5 — radio groups not in fieldset. */
export function checkRadioGroups(): RuleFinding | null {
  const byName = new Map<string, HTMLInputElement[]>();
  for (const radio of document.querySelectorAll<HTMLInputElement>('input[type="radio"][name]')) {
    if (!isVisible(radio)) continue;
    const group = byName.get(radio.name) ?? [];
    group.push(radio);
    byName.set(radio.name, group);
  }
  const offenders: Element[] = [];
  for (const radios of byName.values()) {
    if (radios.length < 2) continue;
    const grouped = radios.every((r) => r.closest('fieldset, [role="group"], [role="radiogroup"]'));
    if (!grouped) offenders.push(radios[0]);
  }
  return multiNodeFinding(offenders, {
    criterion: '11.5',
    ruleId: 'rgaa-radio-grouping',
    severity: 'moderate',
    title: 'Boutons radio non regroupés',
    description: 'Des groupes de boutons radio ne sont pas dans un fieldset ou role="group".',
    userImpact: "Les lecteurs d'écran ne perçoivent pas le regroupement des options.",
  });
}

/** RGAA 11.6 — fieldset without legend for grouped fields. */
export function checkFieldsetLegend(): RuleFinding | null {
  const offenders: Element[] = [];
  for (const fieldset of document.querySelectorAll('fieldset')) {
    if (!isVisible(fieldset)) continue;
    const legend = fieldset.querySelector('legend');
    if (!legend?.textContent?.trim()) offenders.push(fieldset);
  }
  return multiNodeFinding(offenders, {
    criterion: '11.6',
    ruleId: 'rgaa-fieldset-legend',
    severity: 'moderate',
    title: 'Regroupement de champs sans légende',
    description: 'Des fieldset n’ont pas de légende (legend) non vide.',
    userImpact: "Le sens du regroupement de champs n'est pas annoncé.",
  });
}

/** RGAA 11.10 — required fields without visible indication. */
export function checkRequiredIndication(): RuleFinding | null {
  const offenders: Element[] = [];
  for (const input of document.querySelectorAll<HTMLInputElement>(
    'input[required], select[required], textarea[required], [aria-required="true"]',
  )) {
    if (!isVisible(input)) continue;
    const labelText =
      input.labels?.[0]?.textContent ??
      (input.id
        ? document.querySelector(`label[for="${CSS.escape(input.id)}"]`)?.textContent
        : null) ??
      input.getAttribute('aria-label') ??
      '';
    if (!REQUIRED_MARKERS.test(labelText)) offenders.push(input);
  }
  return multiNodeFinding(offenders, {
    criterion: '11.10',
    ruleId: 'rgaa-required-indication',
    severity: 'moderate',
    title: 'Champ obligatoire sans indication visible',
    description:
      'Des champs marqués required ou aria-required n’ont pas d’indication visible dans leur étiquette.',
    userImpact:
      'Les utilisateurs ne savent pas quels champs sont obligatoires avant la soumission.',
  });
}
