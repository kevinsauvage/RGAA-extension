import type {
  ButtonCandidate,
  FieldCandidate,
  ImageCandidate,
  KnownIssueRef,
  LinkCandidate,
  PageCandidates,
} from '@/lib/types';
import { computeAccessibleName } from './accessible-name';
import { buildSelector, isVisible, surroundingText, truncate } from './dom-utils';

const MAX_IMAGES = 25;
const MAX_LINKS = 40;
const MAX_BUTTONS = 25;
const MAX_FIELDS = 25;

function truncatedHtml(element: Element): string {
  return truncate(element.outerHTML, 220);
}

/** Elements already flagged by axe/rules are excluded so the AI never re-reports them. */
function makeKnownFilter(knownIssues: KnownIssueRef[]): (selector: string) => boolean {
  const known = new Set(
    knownIssues.map((issue) => issue.selector.trim().toLowerCase()).filter(Boolean),
  );
  return (selector) => known.has(selector.trim().toLowerCase());
}

function collectImages(isKnown: (s: string) => boolean): ImageCandidate[] {
  const candidates: ImageCandidate[] = [];
  for (const img of document.querySelectorAll<HTMLImageElement>('img[alt]')) {
    const alt = img.getAttribute('alt')?.trim() ?? '';
    // Empty alt marks decorative images; only judge non-empty alternatives.
    if (!alt || !isVisible(img)) continue;
    const selector = buildSelector(img);
    if (isKnown(selector)) continue;
    candidates.push({
      selector,
      html: truncatedHtml(img),
      alt,
      src: truncate(img.currentSrc || img.src, 120),
      context: surroundingText(img),
    });
    if (candidates.length >= MAX_IMAGES) break;
  }
  return candidates;
}

function collectLinks(isKnown: (s: string) => boolean): LinkCandidate[] {
  const candidates: LinkCandidate[] = [];
  for (const link of document.querySelectorAll<HTMLAnchorElement>('a[href]')) {
    if (!isVisible(link)) continue;
    const text = computeAccessibleName(link)?.trim() ?? '';
    // Links with no name at all are already caught by axe (link-name).
    if (!text) continue;
    const selector = buildSelector(link);
    if (isKnown(selector)) continue;
    candidates.push({
      selector,
      html: truncatedHtml(link),
      text: truncate(text, 120),
      href: truncate(link.getAttribute('href') ?? '', 120),
      context: surroundingText(link),
    });
    if (candidates.length >= MAX_LINKS) break;
  }
  return candidates;
}

function collectButtons(isKnown: (s: string) => boolean): ButtonCandidate[] {
  const candidates: ButtonCandidate[] = [];
  const nodes = document.querySelectorAll<HTMLElement>(
    'button, input[type="submit"], input[type="button"], [role="button"]',
  );
  for (const button of nodes) {
    if (!isVisible(button)) continue;
    const label =
      computeAccessibleName(button)?.trim() ??
      (button as HTMLInputElement).value?.trim() ??
      '';
    if (!label) continue; // empty labels are axe's job (button-name)
    const selector = buildSelector(button);
    if (isKnown(selector)) continue;
    candidates.push({
      selector,
      html: truncatedHtml(button),
      label: truncate(label, 120),
      context: surroundingText(button),
    });
    if (candidates.length >= MAX_BUTTONS) break;
  }
  return candidates;
}

function collectFields(isKnown: (s: string) => boolean): FieldCandidate[] {
  const candidates: FieldCandidate[] = [];
  const nodes = document.querySelectorAll<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>(
    'input:not([type="hidden"]):not([type="submit"]):not([type="button"]), select, textarea',
  );
  for (const field of nodes) {
    if (!isVisible(field)) continue;
    const label = computeAccessibleName(field)?.trim() ?? '';
    if (!label) continue; // missing labels are axe's job (label)
    const selector = buildSelector(field);
    if (isKnown(selector)) continue;
    candidates.push({
      selector,
      html: truncatedHtml(field),
      label: truncate(label, 120),
      fieldType: field.tagName === 'INPUT' ? (field as HTMLInputElement).type : field.tagName.toLowerCase(),
      name: field.getAttribute('name') ?? undefined,
      placeholder: field.getAttribute('placeholder') ?? undefined,
    });
    if (candidates.length >= MAX_FIELDS) break;
  }
  return candidates;
}

/** Collect all AI-check candidates from the live page in one pass. */
export function collectPageCandidates(knownIssues: KnownIssueRef[] = []): PageCandidates {
  const isKnown = makeKnownFilter(knownIssues);
  return {
    url: location.href,
    title: document.title,
    lang: document.documentElement.lang || '',
    h1: [...document.querySelectorAll('h1')].map((h) => truncate(h.textContent ?? '', 120)),
    images: collectImages(isKnown),
    links: collectLinks(isKnown),
    buttons: collectButtons(isKnown),
    fields: collectFields(isKnown),
  };
}
