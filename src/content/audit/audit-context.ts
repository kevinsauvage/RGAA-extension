/** Scoped document for audit rules (supports same-origin iframe traversal). */

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

/** Same-origin frames plus the top document, deduplicated. */
export function getAuditableDocuments(): Document[] {
  const docs: Document[] = [document];
  const seen = new Set<Document>([document]);

  for (const iframe of document.querySelectorAll('iframe')) {
    try {
      const frameDoc = iframe.contentDocument;
      if (frameDoc && !seen.has(frameDoc)) {
        seen.add(frameDoc);
        docs.push(frameDoc);
      }
    } catch {
      // Cross-origin frame — skip.
    }
  }

  return docs;
}
