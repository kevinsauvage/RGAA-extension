import { auditDoc } from '../audit-context';
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
  for (const link of auditDoc().querySelectorAll('a[target="_blank"]')) {
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
  for (const link of auditDoc().querySelectorAll('a[href]')) {
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
  const doc = auditDoc();
  const main = doc.querySelector('main, [role="main"]');
  if (!main) return null;
  const firstLinks = [...doc.querySelectorAll('a[href^="#"]')].slice(0, 8);
  const hasSkipLink = firstLinks.some((link) => {
    const name = computeAccessibleName(link) ?? '';
    const targetId = link.getAttribute('href')?.slice(1) ?? '';
    if (!targetId) return false;
    const target = doc.getElementById(targetId);
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
  for (const radio of auditDoc().querySelectorAll<HTMLInputElement>('input[type="radio"][name]')) {
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
  for (const fieldset of auditDoc().querySelectorAll('fieldset')) {
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
  const doc = auditDoc();
  for (const input of doc.querySelectorAll<HTMLInputElement>(
    'input[required], select[required], textarea[required], [aria-required="true"]',
  )) {
    if (!isVisible(input)) continue;
    const labelText =
      input.labels?.[0]?.textContent ??
      (input.id
        ? doc.querySelector(`label[for="${CSS.escape(input.id)}"]`)?.textContent
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

const ERROR_HINT_PATTERN = /erreur|error|correction|invalid|aide|suggestion|exemple|format attendu/i;

/** RGAA 11.8 — long select lists with visual grouping but no optgroup. */
export function checkSelectOptgroup(): RuleFinding | null {
  const offenders: Element[] = [];

  for (const select of auditDoc().querySelectorAll<HTMLSelectElement>('select')) {
    if (!isVisible(select)) continue;
    if (select.querySelector('optgroup')) continue;

    const options = [...select.options].filter((option) => option.value && !option.disabled);
    if (options.length < 8) continue;

    const disabledHeaders = select.querySelectorAll('option[disabled]');
    if (disabledHeaders.length >= 2) continue;

    const prefixes = options.map((option) => option.text.split(/[-–—|:]/)[0]?.trim() ?? '');
    const uniquePrefixes = new Set(prefixes.filter(Boolean));
    if (uniquePrefixes.size >= 3 && uniquePrefixes.size <= options.length * 0.7) {
      offenders.push(select);
    }
  }

  return multiNodeFinding(offenders, {
    criterion: '11.8',
    ruleId: 'rgaa-select-optgroup',
    severity: 'minor',
    title: 'Liste déroulante sans regroupement optgroup',
    description:
      'Une liste déroulante longue semble visuellement groupée (préfixes répétés) mais n’utilise pas optgroup.',
    userImpact:
      'Les utilisateurs de lecteur d’écran naviguent une longue liste sans repères de regroupement.',
  });
}

/** RGAA 11.11 (partial) — invalid fields without a nearby correction hint. */
export function checkInvalidFieldHint(): RuleFinding | null {
  const doc = auditDoc();
  const offenders: Element[] = [];

  for (const input of doc.querySelectorAll<HTMLElement>('[aria-invalid="true"]')) {
    if (!isVisible(input)) continue;

    let hasHint = false;
    const describedBy = input.getAttribute('aria-describedby');
    if (describedBy) {
      hasHint = describedBy.split(/\s+/).some((id) => {
        const hint = doc.getElementById(id);
        return Boolean(hint?.textContent?.trim() && ERROR_HINT_PATTERN.test(hint.textContent));
      });
    }

    if (!hasHint) {
      const container = input.closest('form, fieldset, [class*="form"], [class*="field"]') ?? input.parentElement;
      const nearby = container?.querySelector(
        '.error, .invalid, .invalid-feedback, [role="alert"], [class*="error-message"]',
      );
      hasHint = Boolean(nearby?.textContent?.trim());
    }

    if (!hasHint) offenders.push(input);
  }

  return multiNodeFinding(offenders, {
    criterion: '11.11',
    ruleId: 'rgaa-invalid-field-hint',
    severity: 'moderate',
    title: 'Champ en erreur sans suggestion de correction',
    description:
      'Des champs marqués aria-invalid="true" n’ont pas de message d’erreur ou de suggestion associé à proximité.',
    userImpact:
      'Les utilisateurs ne savent pas comment corriger leur saisie après une erreur de validation.',
  });
}

const POPUP_ON_LOAD_PATTERN = /window\.open\s*\(|showModalDialog\s*\(/;

/** RGAA 13.2 (extend) — popup-on-load via inline scripts or handlers. */
export function checkPopupOnLoad(): RuleFinding | null {
  const doc = auditDoc();
  const offenders: Element[] = [];

  for (const script of doc.querySelectorAll('script:not([src])')) {
    const body = script.textContent ?? '';
    if (POPUP_ON_LOAD_PATTERN.test(body) && /load|DOMContentLoaded|ready/i.test(body)) {
      offenders.push(script);
    }
  }

  for (const el of doc.querySelectorAll<HTMLElement>('[onload], body[onload]')) {
    const handler = el.getAttribute('onload') ?? '';
    if (POPUP_ON_LOAD_PATTERN.test(handler)) offenders.push(el);
  }

  return multiNodeFinding(offenders, {
    criterion: '13.2',
    ruleId: 'rgaa-popup-on-load',
    severity: 'serious',
    title: 'Ouverture de fenêtre au chargement de la page',
    description:
      'Un script ou gestionnaire onload ouvre une nouvelle fenêtre (window.open) au chargement de la page.',
    userImpact:
      'Les utilisateurs sont surpris par une fenêtre popup qu’ils n’ont pas demandée, perturbant la navigation.',
  });
}
