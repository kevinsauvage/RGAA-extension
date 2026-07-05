/**
 * Serializes a pruned version of the rendered DOM for the AI deep scan.
 * Goal: keep everything semantically relevant for RGAA while stripping
 * noise (scripts, styles, framework attributes) to control token cost.
 */

const REMOVED_TAGS = new Set(['script', 'style', 'noscript', 'template', 'link', 'object']);

/** Attributes with accessibility or structural meaning. */
const KEPT_ATTRS = new Set([
  'href',
  'src',
  'alt',
  'title',
  'lang',
  'dir',
  'role',
  'type',
  'name',
  'value',
  'placeholder',
  'for',
  'id',
  'class',
  'tabindex',
  'target',
  'rel',
  'scope',
  'headers',
  'colspan',
  'rowspan',
  'summary',
  'required',
  'disabled',
  'checked',
  'selected',
  'autoplay',
  'controls',
  'loop',
  'muted',
  'autocomplete',
  'onclick',
  'style',
  'align',
  'bgcolor',
  'border',
  'width',
  'height',
  'content',
  'charset',
  'http-equiv',
  'label',
  'longdesc',
  'download',
  'open',
  'datetime',
]);

const MAX_ATTR_LENGTH = 120;
const MAX_TEXT_LENGTH = 240;
const MAX_HTML_LENGTH = 150_000;
const TRUNCATION_MARKER = '\n<!-- [truncated: page exceeds deep-scan size limit] -->';

function pruneElement(el: Element): void {
  if (el.tagName.toLowerCase() === 'svg') {
    // Keep the svg tag (role/aria matter) but drop its drawing internals.
    el.replaceChildren();
    return;
  }

  for (const attr of [...el.attributes]) {
    const name = attr.name.toLowerCase();
    if (!KEPT_ATTRS.has(name) && !name.startsWith('aria-')) {
      el.removeAttribute(attr.name);
      continue;
    }
    if (attr.value.length > MAX_ATTR_LENGTH) {
      el.setAttribute(attr.name, `${attr.value.slice(0, MAX_ATTR_LENGTH)}…`);
    }
  }

  for (const child of [...el.children]) {
    if (REMOVED_TAGS.has(child.tagName.toLowerCase())) {
      child.remove();
    } else {
      pruneElement(child);
    }
  }
}

function pruneNode(node: Node): void {
  const toRemove: Node[] = [];
  const walker = document.createTreeWalker(node, NodeFilter.SHOW_COMMENT | NodeFilter.SHOW_TEXT);
  let current = walker.nextNode();
  while (current) {
    if (current.nodeType === Node.COMMENT_NODE) {
      toRemove.push(current);
    } else if (current.textContent && current.textContent.length > MAX_TEXT_LENGTH) {
      current.textContent = `${current.textContent.slice(0, MAX_TEXT_LENGTH)}…`;
    }
    current = walker.nextNode();
  }
  toRemove.forEach((n) => n.parentNode?.removeChild(n));
}

/** Build the pruned HTML string of the current page. */
export function buildPageHtml(): string {
  const doctype = document.doctype
    ? `<!DOCTYPE ${document.doctype.name}>`
    : '<!-- no doctype declared -->';

  const root = document.documentElement.cloneNode(true) as HTMLElement;

  // Keep only meaningful head children (title + meta); everything else is noise.
  const head = root.querySelector('head');
  if (head) {
    for (const child of [...head.children]) {
      const tag = child.tagName.toLowerCase();
      if (tag !== 'title' && tag !== 'meta') child.remove();
    }
  }

  pruneElement(root);
  pruneNode(root);

  const html = `${doctype}\n${root.outerHTML}`;
  if (html.length <= MAX_HTML_LENGTH) return html;
  return html.slice(0, MAX_HTML_LENGTH) + TRUNCATION_MARKER;
}

/** Check which of the given CSS selectors resolve on the live page. */
export function verifySelectors(selectors: string[]): Record<string, boolean> {
  const results: Record<string, boolean> = {};
  for (const selector of selectors) {
    try {
      results[selector] = document.querySelector(selector) !== null;
    } catch {
      results[selector] = false;
    }
  }
  return results;
}
