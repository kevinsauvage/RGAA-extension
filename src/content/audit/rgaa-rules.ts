import type { AccessibilityIssue, Severity } from '@/lib/types';
import { criterionHelpUrl, themeForCriterion } from '@/lib/rgaa/criteria';
import { computeAccessibleName } from './accessible-name';
import { buildSelector, isVisible, truncate } from './dom-utils';

/**
 * Deterministic RGAA checks that axe-core does not cover.
 * These run with the classic scan — no AI involved.
 */

const NEW_WINDOW_HINTS = /nouvelle\s+fen[eê]tre|new\s+(window|tab)|ouvre\s+dans/i;
const DOC_EXTENSIONS = /\.(pdf|docx?|xlsx?|pptx?|odt|ods|odp)([?#]|$)/i;
const FORMAT_HINTS = /pdf|docx?|xlsx?|pptx?|word|excel|powerpoint|document|téléchargement|download|[\d,.]+\s*(ko|mo|kb|mb)/i;
const SKIP_LINK_HINTS = /contenu|content|main|principal/i;

interface RuleFinding {
  criterion: string;
  ruleId: string;
  severity: Severity;
  title: string;
  description: string;
  userImpact: string;
  nodes: Array<{ selector: string; html: string }>;
}

function checkNewWindowLinks(): RuleFinding | null {
  const offenders: Element[] = [];
  for (const link of document.querySelectorAll('a[target="_blank"]')) {
    if (!isVisible(link)) continue;
    const name = computeAccessibleName(link) ?? '';
    const title = link.getAttribute('title') ?? '';
    if (!NEW_WINDOW_HINTS.test(name) && !NEW_WINDOW_HINTS.test(title)) {
      offenders.push(link);
    }
  }
  if (offenders.length === 0) return null;
  return {
    criterion: '13.2',
    ruleId: 'rgaa-new-window-warning',
    severity: 'minor',
    title: 'Ouverture de nouvelle fenêtre non signalée',
    description:
      'Des liens avec target="_blank" ne préviennent pas que le lien ouvre une nouvelle fenêtre (intitulé ou title).',
    userImpact:
      "Les utilisateurs de lecteur d'écran perdent leur contexte de navigation sans avertissement lorsque la nouvelle fenêtre s'ouvre.",
    nodes: offenders.slice(0, 10).map((el) => ({
      selector: buildSelector(el),
      html: truncate(el.outerHTML, 220),
    })),
  };
}

function checkDocumentLinks(): RuleFinding | null {
  const offenders: Element[] = [];
  for (const link of document.querySelectorAll('a[href]')) {
    if (!isVisible(link)) continue;
    const href = link.getAttribute('href') ?? '';
    if (!DOC_EXTENSIONS.test(href)) continue;
    const name = computeAccessibleName(link) ?? '';
    if (!FORMAT_HINTS.test(name)) offenders.push(link);
  }
  if (offenders.length === 0) return null;
  return {
    criterion: '13.3',
    ruleId: 'rgaa-doc-link-format',
    severity: 'minor',
    title: 'Document en téléchargement sans indication de format',
    description:
      "Des liens pointent vers des documents bureautiques (PDF, Word…) sans indiquer le format dans l'intitulé.",
    userImpact:
      "Les utilisateurs ne savent pas qu'ils vont télécharger un fichier ni s'ils pourront l'ouvrir avec leur outil.",
    nodes: offenders.slice(0, 10).map((el) => ({
      selector: buildSelector(el),
      html: truncate(el.outerHTML, 220),
    })),
  };
}

function checkSkipLink(): RuleFinding | null {
  const main = document.querySelector('main, [role="main"]');
  if (!main) return null; // no main region: axe (landmark-one-main) reports it

  // Look for an internal anchor among the first focusable links of the page.
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
    description:
      "Aucun lien d'accès rapide (« aller au contenu ») pointant vers la zone de contenu principal n'a été détecté en début de page.",
    userImpact:
      'Les utilisateurs au clavier doivent tabuler à travers tout le menu sur chaque page pour atteindre le contenu.',
    nodes: [
      {
        selector: buildSelector(main),
        html: truncate(main.outerHTML, 220),
      },
    ],
  };
}

function checkRadioGroups(): RuleFinding | null {
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
    const grouped = radios.every((radio) =>
      radio.closest('fieldset, [role="group"], [role="radiogroup"]'),
    );
    if (!grouped) offenders.push(radios[0]);
  }

  if (offenders.length === 0) return null;
  return {
    criterion: '11.5',
    ruleId: 'rgaa-radio-grouping',
    severity: 'moderate',
    title: 'Boutons radio non regroupés',
    description:
      'Des groupes de boutons radio ne sont pas regroupés dans un fieldset ou un élément avec role="group"/"radiogroup".',
    userImpact:
      "Les utilisateurs de lecteur d'écran ne perçoivent pas que ces options font partie d'une même question.",
    nodes: offenders.slice(0, 10).map((el) => ({
      selector: buildSelector(el),
      html: truncate(el.outerHTML, 220),
    })),
  };
}

function toIssue(finding: RuleFinding): AccessibilityIssue {
  return {
    id: `rule-${finding.ruleId}`,
    kind: 'accessibility',
    ruleId: finding.ruleId,
    source: 'rule',
    confidence: 'likely',
    severity: finding.severity,
    title: finding.title,
    description: finding.description,
    userImpact: finding.userImpact,
    helpUrl: criterionHelpUrl(finding.criterion),
    rgaa: [
      {
        criterion: finding.criterion,
        theme: themeForCriterion(finding.criterion),
        wcag: [],
      },
    ],
    nodes: finding.nodes.map((node) => ({
      target: node.selector,
      targets: [node.selector],
      html: node.html,
      failureSummary: finding.description,
    })),
  };
}

/** Run all deterministic RGAA rules against the live DOM. */
export function runRgaaRules(): AccessibilityIssue[] {
  const findings = [
    checkNewWindowLinks(),
    checkDocumentLinks(),
    checkSkipLink(),
    checkRadioGroups(),
  ];
  return findings
    .filter((finding): finding is RuleFinding => finding !== null)
    .map(toIssue);
}
