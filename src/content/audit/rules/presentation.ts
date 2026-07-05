import { isVisible } from '../dom-utils';
import { multiNodeFinding, type RuleFinding } from './shared';

const FOCUSABLE =
  'a[href], button, input, select, textarea, [tabindex]:not([tabindex="-1"]), [contenteditable="true"]';

const FOCUS_RING_HINT = /focus-visible|:focus|focus-ring|focusable|ring-offset|outline-offset/i;

/** RGAA 10.7 — focus indicator likely removed on focusable elements. */
export function checkFocusVisible(): RuleFinding | null {
  const offenders: Element[] = [];
  for (const el of document.querySelectorAll<HTMLElement>(FOCUSABLE)) {
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
  for (const el of document.querySelectorAll<HTMLElement>(OFFSCREEN_SELECTORS)) {
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
  for (const meta of document.querySelectorAll('meta[name="viewport"]')) {
    const content = meta.getAttribute('content') ?? '';
    const blocksScale =
      /user-scalable\s*=\s*no/i.test(content) || /maximum-scale\s*=\s*([0-9.]+)/i.test(content);
    if (blocksScale) {
      const maxMatch = content.match(/maximum-scale\s*=\s*([0-9.]+)/i);
      if (!maxMatch || parseFloat(maxMatch[1]) < 2) offenders.push(meta);
    }
  }
  if (blocksTextSizeAdjust(document.documentElement) || blocksTextSizeAdjust(document.body)) {
    offenders.push(document.documentElement);
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
    for (const el of document.querySelectorAll(tag)) {
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
