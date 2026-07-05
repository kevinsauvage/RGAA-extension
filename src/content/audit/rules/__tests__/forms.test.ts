import { describe, it } from 'vitest';
import {
  checkDocumentLinks,
  checkFieldsetLegend,
  checkNewWindowLinks,
  checkRadioGroups,
  checkRequiredIndication,
  checkSkipLink,
} from '../forms';
import { expectNoFinding, expectRule, setBodyHtml } from './setup';

describe('checkNewWindowLinks (RGAA 13.2)', () => {
  it('passes when target=_blank link warns in label', () => {
    setBodyHtml(
      '<a href="https://example.com" target="_blank">Ouvre dans une nouvelle fenêtre</a>',
    );
    expectNoFinding(checkNewWindowLinks());
  });

  it('passes when warning is in title attribute', () => {
    setBodyHtml('<a href="https://example.com" target="_blank" title="New window">External</a>');
    expectNoFinding(checkNewWindowLinks());
  });

  it('flags target=_blank without warning', () => {
    setBodyHtml('<a href="https://example.com" target="_blank">Documentation</a>');
    expectRule(checkNewWindowLinks(), 'rgaa-new-window-warning');
  });

  it('ignores hidden target=_blank links', () => {
    setBodyHtml('<a href="#" target="_blank" style="display:none">Hidden</a>');
    expectNoFinding(checkNewWindowLinks());
  });
});

describe('checkDocumentLinks (RGAA 13.3)', () => {
  it('passes when PDF link mentions format', () => {
    setBodyHtml('<a href="/report.pdf">Rapport annuel (PDF, 2 Mo)</a>');
    expectNoFinding(checkDocumentLinks());
  });

  it('passes when Word document format is indicated', () => {
    setBodyHtml('<a href="/file.docx">Modèle Word</a>');
    expectNoFinding(checkDocumentLinks());
  });

  it('flags PDF link without format in label', () => {
    setBodyHtml('<a href="/guide.pdf">Télécharger le guide</a>');
    expectRule(checkDocumentLinks(), 'rgaa-doc-link-format');
  });

  it('ignores non-document links', () => {
    setBodyHtml('<a href="/about">À propos</a>');
    expectNoFinding(checkDocumentLinks());
  });
});

describe('checkSkipLink (RGAA 12.7)', () => {
  it('returns null when no main landmark exists', () => {
    setBodyHtml('<a href="#content">Aller au contenu</a><div id="content">Text</div>');
    expectNoFinding(checkSkipLink());
  });

  it('passes when skip link targets main content', () => {
    setBodyHtml(`
      <a href="#main">Aller au contenu principal</a>
      <main id="main"><h1>Page</h1></main>
    `);
    expectNoFinding(checkSkipLink());
  });

  it('passes with role=main target', () => {
    setBodyHtml(`
      <a href="#content">Skip to content</a>
      <div role="main" id="content">Body</div>
    `);
    expectNoFinding(checkSkipLink());
  });

  it('flags missing skip link when main exists', () => {
    setBodyHtml('<main><h1>Contenu</h1><p>Texte</p></main>');
    expectRule(checkSkipLink(), 'rgaa-skip-link');
  });

  it('flags when anchor exists but label is not a skip hint', () => {
    setBodyHtml(`
      <a href="#main">Menu</a>
      <main id="main">Content</main>
    `);
    expectRule(checkSkipLink(), 'rgaa-skip-link');
  });
});

describe('checkRadioGroups (RGAA 11.5)', () => {
  it('passes when radios are in fieldset', () => {
    setBodyHtml(`
      <fieldset>
        <legend>Genre</legend>
        <input type="radio" name="g" id="m" /><label for="m">M</label>
        <input type="radio" name="g" id="f" /><label for="f">F</label>
      </fieldset>
    `);
    expectNoFinding(checkRadioGroups());
  });

  it('passes when radios are in role=radiogroup', () => {
    setBodyHtml(`
      <div role="radiogroup" aria-label="Taille">
        <input type="radio" name="size" value="s" />
        <input type="radio" name="size" value="l" />
      </div>
    `);
    expectNoFinding(checkRadioGroups());
  });

  it('flags ungrouped radio buttons (2+ same name)', () => {
    setBodyHtml(`
      <input type="radio" name="color" value="red" />
      <input type="radio" name="color" value="blue" />
    `);
    expectRule(checkRadioGroups(), 'rgaa-radio-grouping');
  });

  it('passes for single radio (no group needed)', () => {
    setBodyHtml('<input type="radio" name="solo" value="yes" />');
    expectNoFinding(checkRadioGroups());
  });
});

describe('checkFieldsetLegend (RGAA 11.6)', () => {
  it('passes when fieldset has non-empty legend', () => {
    setBodyHtml(`
      <fieldset>
        <legend>Coordonnées</legend>
        <input type="text" name="street" />
      </fieldset>
    `);
    expectNoFinding(checkFieldsetLegend());
  });

  it('flags fieldset without legend', () => {
    setBodyHtml(`
      <fieldset>
        <input type="text" name="city" />
      </fieldset>
    `);
    expectRule(checkFieldsetLegend(), 'rgaa-fieldset-legend');
  });

  it('flags fieldset with empty legend', () => {
    setBodyHtml(`
      <fieldset>
        <legend>   </legend>
        <input type="text" />
      </fieldset>
    `);
    expectRule(checkFieldsetLegend(), 'rgaa-fieldset-legend');
  });
});

describe('checkRequiredIndication (RGAA 11.10)', () => {
  it('passes when required input label contains asterisk', () => {
    setBodyHtml(`
      <label for="nom">Nom *</label>
      <input id="nom" required />
    `);
    expectNoFinding(checkRequiredIndication());
  });

  it('passes when aria-required label says "obligatoire"', () => {
    setBodyHtml(`
      <input aria-required="true" aria-label="Email obligatoire" />
    `);
    expectNoFinding(checkRequiredIndication());
  });

  it('flags required input without visible indication in label', () => {
    setBodyHtml(`
      <label for="email">Email</label>
      <input id="email" type="email" required />
    `);
    expectRule(checkRequiredIndication(), 'rgaa-required-indication');
  });

  it('flags aria-required select without cue', () => {
    setBodyHtml(`
      <label for="country">Pays</label>
      <select id="country" aria-required="true"><option>FR</option></select>
    `);
    expectRule(checkRequiredIndication(), 'rgaa-required-indication');
  });
});
