import { describe, it } from 'vitest';
import { checkNewWindowLinks, checkDocumentLinks, checkPopupOnLoad } from '../consultation';
import { expectNoFinding, expectRule, setBodyHtml } from './setup';

describe('checkNewWindowLinks (RGAA 13.2)', () => {
  it('passes when target=_blank link warns in label', () => {
    setBodyHtml(
      '<a href="https://example.com" target="_blank">Ouvre dans une nouvelle fenêtre</a>',
    );
    expectNoFinding(checkNewWindowLinks());
  });

  it('flags target=_blank without warning', () => {
    setBodyHtml('<a href="https://example.com" target="_blank">Documentation</a>');
    expectRule(checkNewWindowLinks(), 'rgaa-new-window-warning');
  });
});

describe('checkDocumentLinks (RGAA 13.3)', () => {
  it('passes when PDF link mentions format', () => {
    setBodyHtml('<a href="/report.pdf">Rapport annuel (PDF, 2 Mo)</a>');
    expectNoFinding(checkDocumentLinks());
  });

  it('flags PDF link without format in label', () => {
    setBodyHtml('<a href="/guide.pdf">Télécharger le guide</a>');
    expectRule(checkDocumentLinks(), 'rgaa-doc-link-format');
  });
});

describe('checkPopupOnLoad (RGAA 13.2)', () => {
  it('flags inline script opening window on load', () => {
    setBodyHtml(`
      <script>
        window.addEventListener('load', function () {
          window.open('https://example.com/popup');
        });
      </script>
    `);
    expectRule(checkPopupOnLoad(), 'rgaa-popup-on-load');
  });
});
