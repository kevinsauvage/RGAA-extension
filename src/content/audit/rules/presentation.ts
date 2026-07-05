import { auditDoc, auditGetElementById, auditQueryAll } from '../audit-context';
import {
  contrastRatio,
  effectiveBackgroundColor,
  hasBackgroundImage,
} from '../contrast-utils';
import { isVisible } from '../dom-utils';
import { multiNodeFinding, type RuleFinding } from './shared';

const AA_CONTRAST = 4.5;

const TEXT_WITH_COLOR =
  'p, span, a, li, h1, h2, h3, h4, h5, h6, label, td, th, button, legend, figcaption';

/** RGAA 10.5 (partial) — text contrast fails when background-image is ignored. */
export function checkBackgroundImageContrast(): RuleFinding | null {
  const offenders: Element[] = [];

  for (const el of auditQueryAll<HTMLElement>(TEXT_WITH_COLOR)) {
    if (!isVisible(el)) continue;
    if (!el.textContent?.trim()) continue;
    if (!hasBackgroundImage(el)) continue;

    const fg = getComputedStyle(el).color;
    const bg = effectiveBackgroundColor(el);
    const ratio = contrastRatio(fg, bg);
    if (ratio !== null && ratio < AA_CONTRAST) offenders.push(el);
  }

  return multiNodeFinding(offenders, {
    criterion: '10.5',
    ruleId: 'rgaa-bg-image-contrast',
    severity: 'moderate',
    title: 'Contraste texte insuffisant sans image de fond',
    description:
      'Du texte sur fond image semble lisible visuellement, mais le contraste couleur/fond CSS seul est inférieur à 4,5:1 (l’image masque probablement le problème).',
    userImpact:
      'Les utilisateurs qui désactivent les images ou utilisent un mode à contraste élevé ne peuvent pas lire le texte.',
  });
}

const FOCUSABLE =
  'a[href], button, input, select, textarea, [tabindex]:not([tabindex="-1"]), [contenteditable="true"]';

const FOCUS_RING_HINT = /focus-visible|:focus|focus-ring|focusable|ring-offset|outline-offset/i;

const DISMISS_SELECTOR =
  'button[aria-label*="close" i], button[aria-label*="fermer" i], [data-dismiss], [data-bs-dismiss]';

/** RGAA 10.7 — focus indicator likely removed on focusable elements. */
export function checkFocusVisible(): RuleFinding | null {
  const offenders: Element[] = [];
  for (const el of auditQueryAll<HTMLElement>(FOCUSABLE)) {
    if (!isVisible(el)) continue;
    if (el.getAttribute('tabindex') === '-1') continue;
    const style = getComputedStyle(el);
    const outlineRemoved = style.outlineStyle === 'none' || parseFloat(style.outlineWidth) === 0;
    if (!outlineRemoved) continue;
    const classHint = `${el.className} ${el.getAttribute('style') ?? ''}`;
    if (FOCUS_RING_HINT.test(classHint)) continue;
    offenders.push(el);
  }
  return multiNodeFinding(offenders, {
    criterion: '10.7',
    ruleId: 'rgaa-focus-visible',
    severity: 'moderate',
    title: 'Indicateur de focus non visible',
    description:
      'Des éléments focusables n’ont pas d’indicateur visuel de prise de focus (outline ou équivalent).',
    userImpact:
      'Les utilisateurs au clavier ne voient pas quel élément est actif lors de la navigation.',
  });
}

const OFFSCREEN_SELECTORS = [
  '[style*="left: -999"]',
  '[style*="left:-999"]',
  '[style*="top: -999"]',
  '[style*="text-indent: -999"]',
  '.sr-only:not([aria-hidden="true"])',
  '.visually-hidden:not([aria-hidden="true"])',
  '.screen-reader-text:not([aria-hidden="true"])',
].join(', ');

/** RGAA 10.8 — off-screen / visually-hidden content still exposed to AT. */
export function checkHiddenContent(): RuleFinding | null {
  const offenders: Element[] = [];
  for (const el of auditQueryAll<HTMLElement>(OFFSCREEN_SELECTORS)) {
    if (!el.textContent?.trim()) continue;
    if (el.getAttribute('aria-hidden') === 'true') continue;
    if (el.closest('[aria-hidden="true"]')) continue;
    const style = getComputedStyle(el);
    const rect = el.getBoundingClientRect();
    const clipped =
      rect.width <= 1 ||
      rect.height <= 1 ||
      parseFloat(style.fontSize) === 0 ||
      style.clip === 'rect(0px, 0px, 0px, 0px)' ||
      style.clipPath === 'inset(50%)';
    if (clipped) offenders.push(el);
  }
  return multiNodeFinding(offenders, {
    criterion: '10.8',
    ruleId: 'rgaa-hidden-content',
    severity: 'moderate',
    title: 'Contenu visuellement masqué mais restitué aux technologies d’assistance',
    description:
      'Des éléments sont positionnés hors écran ou masqués visuellement sans aria-hidden, et restent annoncés.',
    userImpact:
      'Les lecteurs d’écran annoncent du contenu que les utilisateurs voyants ne voient pas.',
  });
}

function blocksTextSizeAdjust(el: HTMLElement): boolean {
  const style = getComputedStyle(el);
  const extended = style as CSSStyleDeclaration & {
    textSizeAdjust?: string;
    webkitTextSizeAdjust?: string;
  };
  if (extended.textSizeAdjust === 'none' || extended.webkitTextSizeAdjust === 'none') {
    return true;
  }
  const inline = el.getAttribute('style') ?? '';
  return (
    /text-size-adjust\s*:\s*none/i.test(inline) ||
    /-webkit-text-size-adjust\s*:\s*none/i.test(inline)
  );
}

/** RGAA 10.4 — viewport or CSS blocks text scaling beyond 200%. */
export function checkTextScaling(): RuleFinding | null {
  const offenders: Element[] = [];
  for (const meta of auditQueryAll('meta[name="viewport"]')) {
    const content = meta.getAttribute('content') ?? '';
    const blocksScale =
      /user-scalable\s*=\s*no/i.test(content) || /maximum-scale\s*=\s*([0-9.]+)/i.test(content);
    if (blocksScale) {
      const maxMatch = content.match(/maximum-scale\s*=\s*([0-9.]+)/i);
      if (!maxMatch || parseFloat(maxMatch[1]) < 2) offenders.push(meta);
    }
  }
  const doc = auditDoc();
  if (blocksTextSizeAdjust(doc.documentElement) || blocksTextSizeAdjust(doc.body)) {
    offenders.push(doc.documentElement);
  }
  return multiNodeFinding(offenders, {
    criterion: '10.4',
    ruleId: 'rgaa-text-scaling',
    severity: 'serious',
    title: 'Mise à l’échelle du texte limitée',
    description:
      'La page empêche ou limite l’agrandissement du texte (viewport user-scalable=no, maximum-scale < 2 ou text-size-adjust:none).',
    userImpact:
      'Les utilisateurs ayant besoin d’un texte agrandi ne peuvent pas lire confortablement le contenu.',
  });
}

const LEGACY_PRESENTATIONAL = new Set([
  'font',
  'center',
  'big',
  'strike',
  'u',
  'basefont',
  'blink',
  'marquee',
]);

/** RGAA 10.1 — legacy presentational HTML tags. */
export function checkPresentationalHtml(): RuleFinding | null {
  const offenders: Element[] = [];
  for (const tag of LEGACY_PRESENTATIONAL) {
    for (const el of auditQueryAll(tag)) {
      if (isVisible(el)) offenders.push(el);
    }
  }
  return multiNodeFinding(offenders, {
    criterion: '10.1',
    ruleId: 'rgaa-presentational-html',
    severity: 'minor',
    title: 'Balises de présentation HTML utilisées',
    description:
      'Des balises de présentation obsolètes (font, center, big, u, blink, marquee…) sont utilisées au lieu du CSS.',
    userImpact:
      'La présentation devrait être gérée par les feuilles de styles pour permettre l’adaptation utilisateur.',
  });
}

const SPACING_PROBES: Array<[prop: string, value: string]> = [
  ['letter-spacing', '0.12em'],
  ['line-height', '2.5'],
  ['word-spacing', '0.16em'],
];

function spacingBlocked(el: HTMLElement): boolean {
  const view = auditDoc().defaultView;
  if (!view) return false;

  for (const [prop, value] of SPACING_PROBES) {
    const before = view.getComputedStyle(el).getPropertyValue(prop);
    el.style.setProperty(prop, value, 'important');
    const after = view.getComputedStyle(el).getPropertyValue(prop);
    el.style.removeProperty(prop);
    if (before === after && before !== value) return true;
  }
  return false;
}

/** RGAA 10.12 — CSS blocks user text spacing overrides (WCAG 1.4.12 style probe). */
export function checkTextSpacingOverride(): RuleFinding | null {
  const doc = auditDoc();
  const probe = doc.createElement('p');
  probe.textContent = 'A11yFix spacing probe';
  probe.style.cssText = 'position:absolute;visibility:hidden;pointer-events:none';
  doc.body.appendChild(probe);

  const blocked = spacingBlocked(probe);
  probe.remove();

  if (!blocked) return null;

  return {
    criterion: '10.12',
    ruleId: 'rgaa-text-spacing-override',
    severity: 'moderate',
    title: 'Espacement du texte non modifiable',
    description:
      'La page empêche l’augmentation de l’interlettrage, de l’interlignage ou de l’espacement des mots via CSS !important.',
    userImpact:
      'Les utilisateurs dyslexiques ou malvoyants ne peuvent pas adapter l’espacement du texte pour lire confortablement.',
    nodes: [{ selector: 'html', html: '<html>…</html>' }],
  };
}

const EXPANDED_POPUP_SELECTOR = '[aria-expanded="true"][aria-haspopup], [aria-expanded="true"][aria-controls]';

/** RGAA 10.13 (partial) — expanded hover/focus popups without dismiss control. */
export function checkHoverFocusOverlay(): RuleFinding | null {
  const offenders: Element[] = [];

  for (const trigger of auditQueryAll<HTMLElement>(EXPANDED_POPUP_SELECTOR)) {
    if (!isVisible(trigger)) continue;

    const popupId = trigger.getAttribute('aria-controls');
    const popup = popupId ? auditGetElementById(popupId) : null;
    if (!popup) continue;

    const popupHasDismiss = popup.querySelector(DISMISS_SELECTOR) !== null;
    const triggerCanToggle =
      trigger.matches('button, a[href], summary, [role="button"]') ||
      trigger.hasAttribute('data-dismiss');

    if (!popupHasDismiss && !triggerCanToggle) {
      offenders.push(trigger);
    }
  }

  return multiNodeFinding(offenders, {
    criterion: '10.13',
    ruleId: 'rgaa-hover-focus-overlay',
    severity: 'moderate',
    title: 'Contenu additionnel au focus/survol non dismissible',
    description:
      'Un contenu additionnel affiché au focus ou au survol (aria-expanded) ne propose pas de mécanisme de fermeture.',
    userImpact:
      'Les utilisateurs qui naviguent au clavier ou au survol ne peuient pas masquer le contenu qui recouvre la page.',
  });
}

/** RGAA 10.14 (partial) — pointer-styled elements not reachable by keyboard. */
export function checkCssInteractiveReachability(): RuleFinding | null {
  const offenders: Element[] = [];

  for (const el of auditQueryAll<HTMLElement>('*')) {
    if (!isVisible(el)) continue;
    if (el.matches('a[href], button, input, select, textarea, summary, [role="button"], [role="link"]')) {
      continue;
    }
    if (el.tabIndex >= 0) continue;

    const style = getComputedStyle(el);
    if (style.cursor !== 'pointer') continue;

    const hasClickHandler =
      el.hasAttribute('onclick') ||
      el.hasAttribute('ng-click') ||
      el.hasAttribute('@click') ||
      el.dataset.action !== undefined;
    if (!hasClickHandler && !el.closest('[onclick], [role="button"]')) continue;

    offenders.push(el);
  }

  return multiNodeFinding(offenders, {
    criterion: '10.14',
    ruleId: 'rgaa-css-interactive',
    severity: 'serious',
    title: 'Contenu CSS interactif inaccessible au clavier',
    description:
      'Des éléments stylés comme cliquables (cursor:pointer) avec action scriptée ne sont pas atteignables au clavier.',
    userImpact: 'Les utilisateurs au clavier ne peuvent pas activer ces contrôles visuels.',
  });
}
