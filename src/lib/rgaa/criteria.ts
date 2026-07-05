/**
 * Shared RGAA 4.1.2 metadata.
 * Official referential: https://accessibilite.numerique.gouv.fr/methode/criteres-et-tests/
 */

export const RGAA_SOURCE_URL = 'https://accessibilite.numerique.gouv.fr/methode/criteres-et-tests/';

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

/** A criterion the AI deep scan can assess from the rendered HTML. */
export interface RgaaCriterion {
  id: string;
  title: string;
  /** What the AI should look for in the markup. */
  hint: string;
}

/**
 * Criteria assessable from static rendered HTML, for the AI deep scan.
 * Hints are enriched at prompt time with official test methodology via referential-hints.ts.
 * Excluded on purpose (handled elsewhere):
 * - axe-core: 1.1, 2.1, 3.2, 8.3, 8.5, 11.1, 13.1…
 * - deterministic rules: 7.3, 8.1, 10.4, 10.7, 10.8, 11.5, 11.6, 11.10, 12.7, 13.2, 13.3, 13.8…
 * - manual / interaction: contrast quality, keyboard traps, media playback, multi-page…
 */
export const DEEP_SCAN_CRITERIA: RgaaCriterion[] = [
  // Theme 1 — Images
  {
    id: '1.3',
    title: 'Alternative textuelle pertinente',
    hint: 'Alt text on informative images must describe the content, not file names or generic words ("image", "photo", "logo" without brand). Flag alt values that clearly cannot inform the user.',
  },
  {
    id: '1.2',
    title: 'Images de décoration correctement ignorées',
    hint: 'Purely decorative images (spacers, visual flourishes) must have empty alt="" and no title/aria-label; decorative svg/icon fonts must be aria-hidden. Flag decorative images exposed to assistive tech.',
  },
  {
    id: '1.6',
    title: 'Images porteuses d’information complexes avec description détaillée',
    hint: 'Charts, diagrams or infographics (img/svg/canvas) conveying complex data need a detailed description (longdesc, aria-describedby, adjacent text). Flag complex informative images with only a short alt.',
  },
  {
    id: '1.9',
    title: 'Légendes d’images correctement associées',
    hint: 'Visible captions next to images must be linked via figure/figcaption (with aria-label matching or role). Flag images with an adjacent visible caption not wrapped in figure/figcaption.',
  },
  // Theme 2 — Frames
  {
    id: '2.2',
    title: 'Titre de cadre pertinent',
    hint: 'iframe title attributes must describe the frame content. Flag generic titles like "frame", "iframe", "widget" or titles unrelated to the src.',
  },
  // Theme 4 — Multimedia
  {
    id: '4.1',
    title: 'Médias temporels avec transcription',
    hint: 'video/audio elements need an adjacent transcript or a clearly labelled link to one. Flag media elements with no visible transcript mechanism nearby. Verdict is inherently needs-review.',
  },
  // Theme 5 — Tables
  {
    id: '5.3',
    title: 'Tableaux de mise en forme linéarisables',
    hint: 'Layout tables (no data relationships) must use role="presentation" and must not contain th, caption or summary. Flag layout tables exposing data semantics.',
  },
  {
    id: '5.6',
    title: 'En-têtes de tableau correctement déclarés',
    hint: 'Data tables must declare column/row headers with th (and scope where needed). Flag data tables whose first row/column uses td styled as headers.',
  },
  // Theme 6 — Links
  {
    id: '6.1',
    title: 'Intitulé de lien explicite',
    hint: 'Link text must be understandable out of context. Flag vague labels: "cliquez ici", "en savoir plus", "lire la suite", "ici", "click here", "more", "read more", "voir", "détails" when the destination is not obvious from the label alone.',
  },
  // Theme 7 — Scripts
  // 7.3 covered by deterministic rule rgaa-keyboard-accessible
  // Theme 8 — Mandatory elements
  // 8.1 covered by deterministic rule rgaa-doctype
  {
    id: '8.6',
    title: 'Titre de page pertinent',
    hint: 'The document title must identify the page content. Flag empty-ish titles, bare domain names, "Untitled", generic "Home"/"Accueil"/"Document" on content pages, or titles unrelated to the main heading.',
  },
  {
    id: '8.7',
    title: 'Changements de langue indiqués',
    hint: 'Passages in a different language than the page lang must carry a lang attribute (e.g. English phrases in a French page). Ignore proper nouns, brand names and technical terms.',
  },
  {
    id: '8.9',
    title: 'Balises non utilisées à des fins de présentation',
    hint: 'Semantic tags must not be used for visual effect only: blockquote for indentation, headings for font size, table for layout with data semantics, br sequences to fake paragraphs or lists.',
  },
  // Theme 9 — Structure
  {
    id: '9.1',
    title: 'Hiérarchie de titres pertinente',
    hint: 'Heading levels must reflect the content structure: exactly relevant h1, no skipped levels used for styling, sections with visible titles not marked as headings. Judge from the heading tags present.',
  },
  {
    id: '9.3',
    title: 'Listes correctement structurées',
    hint: 'Visual lists (lines starting with bullets/dashes/numbers, or repeated sibling divs acting as list items) must use ul/ol/li or dl/dt/dd. Flag fake lists built with br, p or div.',
  },
  {
    id: '9.4',
    title: 'Citations correctement indiquées',
    hint: 'Quotations must use q (inline) or blockquote (block). Flag visible quotes (guillemets, quotation dashes, testimonial blocks) marked up as plain p/div.',
  },
  // Theme 10 — Presentation
  {
    id: '10.1',
    title: 'Présentation gérée par CSS, pas par le HTML',
    hint: 'Flag presentational markup: font/center/big tags, align/bgcolor/border width attributes on non-table elements, inline styles replacing semantic tags.',
  },
  // Theme 11 — Forms
  {
    id: '11.2',
    title: 'Étiquette de champ pertinente',
    hint: 'Form field labels must describe the expected input. Flag generic labels ("champ", "saisie", "input", "texte") or labels that mismatch the field type/name.',
  },
  {
    id: '11.9',
    title: 'Intitulé de bouton pertinent',
    hint: 'Button labels must describe the action. Flag symbol-only labels (">", "+"), generic "OK"/"Valider" with no context, or labels unrelated to the form action.',
  },
  {
    id: '11.10',
    title: 'Contrôles de saisie indiqués',
    hint: 'Required fields must be indicated (required/aria-required plus a visible cue) and expected formats stated in the label or an associated description. Flag required inputs with no indication in their label.',
  },
  // Theme 12 — Navigation
  {
    id: '12.6',
    title: 'Zones de regroupement atteignables',
    hint: 'Main content areas (header, nav, main, footer) should exist as landmarks (HTML5 tags or ARIA roles). Flag pages structured only with anonymous divs.',
  },
  // Theme 13 — Consultation
  // 13.8 covered by rules rgaa-moving-content + axe blink/marquee
];
