import type { PageCandidates, Severity } from '@/lib/types';

/**
 * AI verification checks. Each check asks ONE narrow question about
 * candidates that code extracted from the page. The AI can only classify —
 * it never picks elements, criteria or severities itself.
 */

export interface CheckItem {
  selector: string;
  html: string;
  /** Evidence lines shown to the model for this item. */
  evidence: string[];
}

export interface AiCheck {
  id: string;
  /** RGAA criterion this check verifies. */
  criterion: string;
  severity: Severity;
  label: { fr: string; en: string };
  issueTitle: { fr: string; en: string };
  userImpact: { fr: string; en: string };
  /** The single question the model must answer for each item. */
  question: string;
  /** Few-shot examples anchoring the expected judgment. */
  examples: string;
  getItems(candidates: PageCandidates): CheckItem[];
}

export const AI_CHECKS: AiCheck[] = [
  {
    id: 'alt-relevance',
    criterion: '1.3',
    severity: 'serious',
    label: {
      fr: "Pertinence des alternatives d'images",
      en: 'Image alt text relevance',
    },
    issueTitle: {
      fr: "Alternative textuelle non pertinente",
      en: 'Irrelevant image alt text',
    },
    userImpact: {
      fr: "Les utilisateurs de lecteur d'écran entendent une description inutile au lieu de l'information portée par l'image.",
      en: 'Screen reader users hear a useless description instead of the information the image conveys.',
    },
    question:
      'Is this alt text a relevant description of the image (RGAA 1.3)? An alt is a FAIL only when it clearly cannot inform the user: a file name, a generic word (image, photo, picture, icon, logo without brand name), placeholder text, or text unrelated to the visible context.',
    examples: [
      'alt="IMG_4521.jpg" → fail (file name)',
      'alt="image" → fail (generic word)',
      'alt="photo" → fail (generic word)',
      'alt="Logo Acme" on a header link → pass (identifies the brand/destination)',
      'alt="Évolution des ventes 2024 : +12 % au T3" → pass (describes the chart content)',
      'alt="Bannière" → fail (describes the container, not the content)',
      'alt="Femme souriante travaillant sur un ordinateur portable" → pass (descriptive)',
    ].join('\n'),
    getItems: (candidates) =>
      candidates.images.map((img) => ({
        selector: img.selector,
        html: img.html,
        evidence: [
          `alt: "${img.alt}"`,
          `src: ${img.src}`,
          img.context ? `nearby text: "${img.context}"` : '',
        ].filter(Boolean),
      })),
  },
  {
    id: 'link-clarity',
    criterion: '6.1',
    severity: 'moderate',
    label: {
      fr: 'Liens explicites',
      en: 'Link label clarity',
    },
    issueTitle: {
      fr: 'Intitulé de lien non explicite',
      en: 'Vague link label',
    },
    userImpact: {
      fr: "Les utilisateurs de lecteur d'écran qui naviguent de lien en lien ne peuvent pas deviner la destination.",
      en: 'Screen reader users navigating link-by-link cannot guess the destination.',
    },
    question:
      'Is this link label explicit enough to understand its purpose out of context (RGAA 6.1)? FAIL only for clearly vague labels: "cliquez ici", "en savoir plus", "lire la suite", "ici", "click here", "more", "read more", "voir", "détails" — when the surrounding context does not make the destination obvious in the label itself. A label naming a page, product, action or destination is a PASS.',
    examples: [
      'text: "cliquez ici" → fail (no destination information)',
      'text: "En savoir plus" in a card about pricing → fail (label alone is vague)',
      'text: "Télécharger le rapport annuel 2024 (PDF)" → pass',
      'text: "Contact" → pass (names the destination page)',
      'text: "Voir" → fail (vague)',
      'text: "Politique de confidentialité" → pass',
    ].join('\n'),
    getItems: (candidates) =>
      candidates.links.map((link) => ({
        selector: link.selector,
        html: link.html,
        evidence: [
          `text: "${link.text}"`,
          `href: ${link.href}`,
          link.context ? `context: "${link.context}"` : '',
        ].filter(Boolean),
      })),
  },
  {
    id: 'button-clarity',
    criterion: '11.9',
    severity: 'moderate',
    label: {
      fr: 'Intitulés de boutons',
      en: 'Button label clarity',
    },
    issueTitle: {
      fr: 'Intitulé de bouton non pertinent',
      en: 'Unclear button label',
    },
    userImpact: {
      fr: "Les utilisateurs ne savent pas ce que déclenche le bouton avant de l'activer.",
      en: 'Users cannot tell what the button will do before activating it.',
    },
    question:
      'Is this button label relevant to the action it triggers (RGAA 11.9)? FAIL only when the label clearly does not describe an action: "OK" or "Valider" with no context, single symbols (">", "+", "..."), or text unrelated to a form action. Common explicit actions (Rechercher, Envoyer, Ajouter au panier, Se connecter, Fermer…) are a PASS.',
    examples: [
      'label: "OK" alone in a form → fail (action unknown)',
      'label: ">" → fail (symbol only)',
      'label: "Rechercher" → pass',
      'label: "Ajouter au panier" → pass',
      'label: "Envoyer" in a contact form → pass',
    ].join('\n'),
    getItems: (candidates) =>
      candidates.buttons.map((button) => ({
        selector: button.selector,
        html: button.html,
        evidence: [
          `label: "${button.label}"`,
          button.context ? `context: "${button.context}"` : '',
        ].filter(Boolean),
      })),
  },
  {
    id: 'field-labels',
    criterion: '11.2',
    severity: 'serious',
    label: {
      fr: 'Pertinence des étiquettes de champs',
      en: 'Form label relevance',
    },
    issueTitle: {
      fr: 'Étiquette de champ non pertinente',
      en: 'Irrelevant form field label',
    },
    userImpact: {
      fr: "Les utilisateurs de lecteur d'écran ne savent pas quelle donnée saisir dans le champ.",
      en: 'Screen reader users cannot tell what data the field expects.',
    },
    question:
      'Is this label relevant for the form field (RGAA 11.2)? FAIL only when the label clearly does not describe the expected input: generic words ("champ", "saisie", "input", "texte"), a mismatch with the field type/name, or placeholder-like instructions that name nothing. A label naming the expected data (Email, Nom, Message, Date de naissance…) is a PASS.',
    examples: [
      'label: "champ" for input type=email → fail (generic)',
      'label: "Votre adresse e-mail" for type=email → pass',
      'label: "Texte" for a message textarea → fail (generic)',
      'label: "Rechercher" for a search input → pass',
      'label: "Nom" for name=lastname → pass',
    ].join('\n'),
    getItems: (candidates) =>
      candidates.fields.map((field) => ({
        selector: field.selector,
        html: field.html,
        evidence: [
          `label: "${field.label}"`,
          `type: ${field.fieldType}`,
          field.name ? `name: ${field.name}` : '',
          field.placeholder ? `placeholder: "${field.placeholder}"` : '',
        ].filter(Boolean),
      })),
  },
  {
    id: 'title-quality',
    criterion: '8.6',
    severity: 'moderate',
    label: {
      fr: 'Pertinence du titre de page',
      en: 'Page title relevance',
    },
    issueTitle: {
      fr: 'Titre de page non pertinent',
      en: 'Irrelevant page title',
    },
    userImpact: {
      fr: "Les utilisateurs ne peuvent pas identifier la page dans leurs onglets et les lecteurs d'écran annoncent un titre inutile.",
      en: 'Users cannot identify the page among tabs and screen readers announce a useless title.',
    },
    question:
      'Is this document title relevant for the page (RGAA 8.6)? FAIL only when the title clearly cannot identify the page content: empty-ish values, a bare domain name, "Untitled", "Home"/"Accueil" with nothing else on a content page, or a title unrelated to the main heading. A title naming the page (optionally with the site name) is a PASS.',
    examples: [
      'title: "example.com" → fail (bare domain)',
      'title: "Untitled" → fail',
      'title: "Document" → fail (generic)',
      'title: "Tarifs — Acme" with h1 "Nos tarifs" → pass',
      'title: "Accueil" on the homepage of a site whose h1 is a brand → pass',
    ].join('\n'),
    getItems: (candidates) => {
      if (!candidates.title.trim()) return []; // empty title is axe's job (document-title)
      return [
        {
          selector: 'html',
          html: `<title>${candidates.title}</title>`,
          evidence: [
            `title: "${candidates.title}"`,
            `url: ${candidates.url}`,
            candidates.h1.length ? `h1: ${candidates.h1.map((h) => `"${h}"`).join(', ')}` : 'h1: (none)',
          ],
        },
      ];
    },
  },
];
