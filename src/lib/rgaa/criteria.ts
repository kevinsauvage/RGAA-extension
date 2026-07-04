/**
 * Shared RGAA 4.1.2 metadata.
 * Official referential: https://accessibilite.numerique.gouv.fr/methode/criteres-et-tests/
 */

export const RGAA_SOURCE_URL =
  'https://accessibilite.numerique.gouv.fr/methode/criteres-et-tests/';

export const RGAA_THEMES: Record<number, string> = {
  1: 'Images',
  2: 'Cadres',
  3: 'Couleurs',
  4: 'Multimédia',
  5: 'Tableaux',
  6: 'Liens',
  7: 'Scripts',
  8: 'Éléments obligatoires',
  9: 'Structuration de l’information',
  10: 'Présentation de l’information',
  11: 'Formulaires',
  12: 'Navigation',
  13: 'Consultation',
};

export function themeForCriterion(criterionId: string): string {
  const themeNumber = Number(criterionId.split('.')[0]);
  return RGAA_THEMES[themeNumber] ?? 'Autre';
}

export function criterionHelpUrl(criterionId: string): string {
  return `${RGAA_SOURCE_URL}#${criterionId.replace('.', '-')}`;
}
