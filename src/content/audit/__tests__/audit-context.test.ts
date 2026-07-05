import { describe, expect, it } from 'vitest';
import {
  auditQueryAll,
  collectOpenShadowRoots,
  getAuditableDocuments,
  getIframeAuditSummary,
  withAuditDocument,
} from '../audit-context';
import { setBodyHtml } from '../rules/__tests__/setup';

describe('getAuditableDocuments', () => {
  it('includes nested same-origin iframes', () => {
    setBodyHtml('<main>Top</main>');
    const outer = document.createElement('iframe');
    document.body.appendChild(outer);
    const inner = outer.contentDocument!.createElement('iframe');
    outer.contentDocument!.body.appendChild(inner);
    inner.contentDocument!.body.innerHTML = '<font>Nested</font>';

    expect(getAuditableDocuments()).toHaveLength(3);
  });
});

describe('getIframeAuditSummary', () => {
  it('reports cross-origin frames with src', () => {
    setBodyHtml('');
    const iframe = document.createElement('iframe');
    iframe.setAttribute('src', 'https://example.com/embed');
    document.body.appendChild(iframe);
    Object.defineProperty(iframe, 'contentDocument', { get: () => null, configurable: true });

    const summary = getIframeAuditSummary();
    expect(summary.skippedFrames).toHaveLength(1);
    expect(summary.skippedFrames[0]?.src).toContain('example.com');
  });
});

describe('auditQueryAll', () => {
  it('finds elements inside open shadow roots', () => {
    setBodyHtml('<div id="host"></div>');
    const host = document.getElementById('host')!;
    const shadow = host.attachShadow({ mode: 'open' });
    shadow.innerHTML = '<button id="shadow-btn">Action</button>';

    expect(auditQueryAll('#shadow-btn')).toHaveLength(1);
    expect(collectOpenShadowRoots(document)).toHaveLength(1);
  });

  it('audits shadow content inside same-origin iframes', () => {
    setBodyHtml('');
    const iframe = document.createElement('iframe');
    document.body.appendChild(iframe);
    const frameDoc = iframe.contentDocument!;
    const host = frameDoc.createElement('div');
    frameDoc.body.appendChild(host);
    host.attachShadow({ mode: 'open' }).innerHTML = '<font>Shadow iframe</font>';

    let fonts: ReturnType<typeof auditQueryAll> = [];
    withAuditDocument(frameDoc, () => {
      fonts = auditQueryAll('font');
    });

    expect(fonts).toHaveLength(1);
  });
});
