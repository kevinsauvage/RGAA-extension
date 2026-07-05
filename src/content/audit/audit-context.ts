/** Scoped document for audit rules (supports same-origin iframe traversal and open shadow roots). */

let currentDocument: Document = document;

export function auditDoc(): Document {
  return currentDocument;
}

export function withAuditDocument<T>(doc: Document, fn: () => T): T {
  const previous = currentDocument;
  currentDocument = doc;
  try {
    return fn();
  } finally {
    currentDocument = previous;
  }
}

/** Collect open shadow roots reachable from a document or shadow root (recursive). */
export function collectOpenShadowRoots(root: ParentNode): ShadowRoot[] {
  const shadows: ShadowRoot[] = [];
  const seen = new Set<ShadowRoot>();

  const collectFrom = (parent: ParentNode): void => {
    for (const el of parent.querySelectorAll('*')) {
      const shadow = el.shadowRoot;
      if (shadow && !seen.has(shadow)) {
        seen.add(shadow);
        shadows.push(shadow);
        collectFrom(shadow);
      }
    }
  };

  collectFrom(root);
  return shadows;
}

/** Document + open shadow roots for the current audit scope. */
export function getAuditableQueryRoots(): ParentNode[] {
  const doc = auditDoc();
  return [doc, ...collectOpenShadowRoots(doc)];
}

/** querySelectorAll across the current document and its open shadow trees. */
export function auditQueryAll<T extends Element = Element>(selector: string): T[] {
  const seen = new Set<T>();
  const results: T[] = [];

  for (const root of getAuditableQueryRoots()) {
    for (const el of root.querySelectorAll<T>(selector)) {
      if (!seen.has(el)) {
        seen.add(el);
        results.push(el);
      }
    }
  }

  return results;
}

/** querySelector across the current document and its open shadow trees. */
export function auditQuerySelector<T extends Element = Element>(selector: string): T | null {
  for (const root of getAuditableQueryRoots()) {
    const found = root.querySelector<T>(selector);
    if (found) return found;
  }
  return null;
}

/** getElementById across the current document and its open shadow trees. */
export function auditGetElementById(id: string): Element | null {
  for (const root of getAuditableQueryRoots()) {
    if (root instanceof Document) {
      const found = root.getElementById(id);
      if (found) return found;
    } else {
      try {
        const found = root.querySelector(`#${CSS.escape(id)}`);
        if (found) return found;
      } catch {
        // Invalid id characters — skip.
      }
    }
  }
  return null;
}

function queryAllDeep(root: ParentNode, selector: string): Element[] {
  const seen = new Set<Element>();
  const results: Element[] = [];
  const scopes: ParentNode[] = [root, ...collectOpenShadowRoots(root)];

  for (const scope of scopes) {
    for (const el of scope.querySelectorAll(selector)) {
      if (!seen.has(el)) {
        seen.add(el);
        results.push(el);
      }
    }
  }

  return results;
}

/** Same-origin frames plus the top document, recursively (deduplicated). */
export function getAuditableDocuments(): Document[] {
  const docs: Document[] = [];
  const seen = new Set<Document>();

  const visit = (doc: Document): void => {
    if (seen.has(doc)) return;
    seen.add(doc);
    docs.push(doc);

    for (const iframe of queryAllDeep(doc, 'iframe')) {
      if (!(iframe instanceof HTMLIFrameElement)) continue;
      try {
        const frameDoc = iframe.contentDocument;
        if (frameDoc) visit(frameDoc);
      } catch {
        // Cross-origin frame — skipped (see getIframeAuditSummary).
      }
    }
  };

  visit(document);
  return docs;
}

export interface SkippedFrame {
  src: string;
}

export interface IframeAuditSummary {
  auditableDocumentCount: number;
  skippedFrames: SkippedFrame[];
}

function truncateSrc(src: string, max = 80): string {
  return src.length > max ? `${src.slice(0, max)}…` : src;
}

/** Count cross-origin / inaccessible frames skipped during the audit. */
export function getIframeAuditSummary(): IframeAuditSummary {
  const skipped: SkippedFrame[] = [];

  const walk = (parent: ParentNode): void => {
    for (const iframe of queryAllDeep(parent, 'iframe')) {
      if (!(iframe instanceof HTMLIFrameElement)) continue;
      const src = iframe.getAttribute('src')?.trim() || iframe.src || '';
      try {
        const frameDoc = iframe.contentDocument;
        if (frameDoc) {
          walk(frameDoc);
        } else if (src && !src.startsWith('about:')) {
          skipped.push({ src: truncateSrc(src) });
        }
      } catch {
        if (src) skipped.push({ src: truncateSrc(src) });
      }
    }
  };

  walk(document);

  return {
    auditableDocumentCount: getAuditableDocuments().length,
    skippedFrames: skipped,
  };
}
