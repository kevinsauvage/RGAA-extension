import { describe, it } from 'vitest';
import { checkLayoutTableSemantics } from '../tables';
import { expectNoFinding, expectRule, setBodyHtml } from './setup';

describe('checkLayoutTableSemantics (RGAA 5.8)', () => {
  it('passes for layout table with role=presentation', () => {
    setBodyHtml(`
      <table role="presentation">
        <tr><td>Cell 1</td><td>Cell 2</td></tr>
      </table>
    `);
    expectNoFinding(checkLayoutTableSemantics());
  });

  it('passes for proper data table with th headers', () => {
    setBodyHtml(`
      <table>
        <caption>Effectifs</caption>
        <tr><th scope="col">Nom</th><th scope="col">Score</th></tr>
        <tr><td>Alice</td><td>10</td></tr>
      </table>
    `);
    expectNoFinding(checkLayoutTableSemantics());
  });

  it('flags small layout table with caption but no th', () => {
    setBodyHtml(`
      <table>
        <caption>Mise en page</caption>
        <tr><td>Left</td><td>Right</td></tr>
      </table>
    `);
    expectRule(checkLayoutTableSemantics(), 'rgaa-layout-table-semantics');
  });

  it('flags layout table with summary attribute', () => {
    setBodyHtml(`
      <table summary="Layout">
        <tr><td>A</td><td>B</td></tr>
      </table>
    `);
    expectRule(checkLayoutTableSemantics(), 'rgaa-layout-table-semantics');
  });

  it('passes for plain table without data semantics (no th/caption/summary)', () => {
    setBodyHtml(`
      <table>
        <tr><td>A</td><td>B</td></tr>
        <tr><td>C</td><td>D</td></tr>
        <tr><td>E</td><td>F</td></tr>
      </table>
    `);
    expectNoFinding(checkLayoutTableSemantics());
  });

  it('ignores hidden tables', () => {
    setBodyHtml(`
      <table style="display:none">
        <caption>Hidden</caption>
        <tr><td>A</td></tr>
      </table>
    `);
    expectNoFinding(checkLayoutTableSemantics());
  });
});
