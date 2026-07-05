import { auditQueryAll, auditQuerySelector } from '../audit-context';
import { isVisible } from '../dom-utils';
import { multiNodeFinding, type RuleFinding } from './shared';

const REQUIRED_MARKERS = /obligatoire|required|\*|requis/i;

/** RGAA 3.1 — required field indicated by color only (heuristic). */
export function checkColorOnlyRequired(): RuleFinding | null {
  const offenders: Element[] = [];
  for (const input of auditQueryAll<HTMLInputElement>(
    'input[required], select[required], textarea[required], [aria-required="true"]',
  )) {
    if (!isVisible(input)) continue;
    const label =
      input.labels?.[0]?.textContent ??
      (input.id ? auditQuerySelector(`label[for="${CSS.escape(input.id)}"]`)?.textContent : null) ??
      input.getAttribute('aria-label') ??
      '';
    if (REQUIRED_MARKERS.test(label)) continue;

    // Look for a colored asterisk or marker in the label wrapper without text.
    const wrapper = input.closest('.form-group, .field, label, div') ?? input.parentElement;
    const marker = wrapper?.querySelector(
      '[class*="required"], [class*="asterisk"], .required, .asterisk',
    );
    if (!marker || !isVisible(marker)) continue;
    const markerText = marker.textContent?.replace(/\s/g, '') ?? '';
    if (markerText && markerText !== '*' && !/^\*+$/.test(markerText)) continue;
    offenders.push(input);
  }
  return multiNodeFinding(offenders, {
    criterion: '3.1',
    ruleId: 'rgaa-color-only-required',
    severity: 'moderate',
    title: 'Champ obligatoire signalé uniquement par la couleur ou un astérisque',
    description:
      'Des champs obligatoires semblent indiqués visuellement (astérisque/couleur) sans mention textuelle « obligatoire » ou attribut explicite dans l’étiquette.',
    userImpact:
      'Les utilisateurs daltoniens ou en noir et blanc peuvent ne pas percevoir qu’un champ est requis.',
  });
}
