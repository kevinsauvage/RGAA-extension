import { auditGetElementById, auditQueryAll, auditQuerySelector } from '../audit-context';
import { isVisible } from '../dom-utils';
import { multiNodeFinding, type RuleFinding } from './shared';

const REQUIRED_MARKERS = /obligatoire|required|\*|requis/i;
const ERROR_HINT_PATTERN = /erreur|error|correction|invalid|aide|suggestion|exemple|format attendu/i;

/** RGAA 11.5 — radio groups not in fieldset. */
export function checkRadioGroups(): RuleFinding | null {
  const byName = new Map<string, HTMLInputElement[]>();
  for (const radio of auditQueryAll<HTMLInputElement>('input[type="radio"][name]')) {
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
  for (const fieldset of auditQueryAll('fieldset')) {
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
  for (const input of auditQueryAll<HTMLInputElement>(
    'input[required], select[required], textarea[required], [aria-required="true"]',
  )) {
    if (!isVisible(input)) continue;
    const labelText =
      input.labels?.[0]?.textContent ??
      (input.id
        ? auditQuerySelector(`label[for="${CSS.escape(input.id)}"]`)?.textContent
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

/** RGAA 11.8 — long select lists with visual grouping but no optgroup. */
export function checkSelectOptgroup(): RuleFinding | null {
  const offenders: Element[] = [];

  for (const select of auditQueryAll<HTMLSelectElement>('select')) {
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
  const offenders: Element[] = [];

  for (const input of auditQueryAll<HTMLElement>('[aria-invalid="true"]')) {
    if (!isVisible(input)) continue;

    let hasHint = false;
    const describedBy = input.getAttribute('aria-describedby');
    if (describedBy) {
      hasHint = describedBy.split(/\s+/).some((id) => {
        const hint = auditGetElementById(id);
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
