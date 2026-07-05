import { auditQueryAll } from '../audit-context';
import { computeAccessibleName } from '../accessible-name';
import { isVisible } from '../dom-utils';
import { multiNodeFinding, type RuleFinding } from './shared';

/** Three flashes per second threshold (WCAG 2.3.1) ≈ 334 ms per cycle. */
const FLASH_DURATION_MS = 334;

function parseDurationMs(duration: string): number | null {
  const parts = duration.split(',').map((part) => part.trim());
  let min: number | null = null;
  for (const part of parts) {
    if (part.endsWith('ms')) {
      const ms = parseFloat(part);
      if (!Number.isNaN(ms)) min = min === null ? ms : Math.min(min, ms);
    } else if (part.endsWith('s')) {
      const ms = parseFloat(part) * 1000;
      if (!Number.isNaN(ms)) min = min === null ? ms : Math.min(min, ms);
    }
  }
  return min;
}

function mayFlashRapidly(el: HTMLElement): boolean {
  const style = getComputedStyle(el);
  let duration = parseDurationMs(style.animationDuration);
  let animationName = style.animationName;
  let iterations = style.animationIterationCount;

  if (animationName === 'none' || !animationName) {
    const inline = el.getAttribute('style') ?? '';
    const animMatch = inline.match(/animation\s*:\s*([^;]+)/i);
    if (animMatch) {
      const parts = animMatch[1];
      animationName = 'inline';
      const durMatch = parts.match(/([\d.]+)\s*(ms|s)/i);
      if (durMatch) {
        duration = durMatch[2].toLowerCase() === 's' ? parseFloat(durMatch[1]) * 1000 : parseFloat(durMatch[1]);
      }
      if (/infinite/i.test(parts)) iterations = 'infinite';
    }
  }

  if (animationName === 'none' || !animationName) return false;
  if (duration === null || duration > FLASH_DURATION_MS) return false;

  if (iterations === 'infinite') return true;
  const count = Number.parseFloat(iterations);
  return !Number.isNaN(count) && count >= 3;
}

/** RGAA 13.7 — rapid luminance/flash animation (CSS heuristic). */
export function checkFlashContent(): RuleFinding | null {
  const offenders: Element[] = [];

  for (const el of auditQueryAll<HTMLElement>('*')) {
    if (!isVisible(el)) continue;
    if (!mayFlashRapidly(el)) continue;
    const rect = el.getBoundingClientRect();
    if (rect.width * rect.height < 4000) continue;
    offenders.push(el);
  }

  return multiNodeFinding(offenders, {
    criterion: '13.7',
    ruleId: 'rgaa-flash-content',
    severity: 'serious',
    title: 'Contenu clignotant ou flash rapide',
    description:
      'Un élément visible utilise une animation CSS rapide (≤ 3 cycles/seconde) susceptible de provoquer des flashs.',
    userImpact:
      'Les personnes photosensibles peuvent être affectées ; les flashs rapides peuvent aussi gêner la lecture.',
  });
}

const NEW_WINDOW_HINTS = /nouvelle\s+fen[eê]tre|new\s+(window|tab)|ouvre\s+dans/i;
const DOC_EXTENSIONS = /\.(pdf|docx?|xlsx?|pptx?|odt|ods|odp)([?#]|$)/i;
const FORMAT_HINTS =
  /pdf|docx?|xlsx?|pptx?|word|excel|powerpoint|document|téléchargement|download|[\d,.]+\s*(ko|mo|kb|mb)/i;
const POPUP_ON_LOAD_PATTERN = /window\.open\s*\(|showModalDialog\s*\(/;

/** RGAA 13.2 — target=_blank without warning. */
export function checkNewWindowLinks(): RuleFinding | null {
  const offenders: Element[] = [];
  for (const link of auditQueryAll('a[target="_blank"]')) {
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
  for (const link of auditQueryAll('a[href]')) {
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

/** RGAA 13.2 (extend) — popup-on-load via inline scripts or handlers. */
export function checkPopupOnLoad(): RuleFinding | null {
  const offenders: Element[] = [];

  for (const script of auditQueryAll('script:not([src])')) {
    const body = script.textContent ?? '';
    if (POPUP_ON_LOAD_PATTERN.test(body) && /load|DOMContentLoaded|ready/i.test(body)) {
      offenders.push(script);
    }
  }

  for (const el of auditQueryAll<HTMLElement>('[onload], body[onload]')) {
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
