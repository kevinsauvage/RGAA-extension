import { describe, it } from 'vitest';
import { checkCanvasAlt, checkSvgInformative } from '../images';
import { expectNoFinding, expectRule, setBodyHtml } from './setup';

describe('checkSvgInformative (RGAA 1.1)', () => {
  it('passes for decorative SVG with aria-hidden', () => {
    setBodyHtml(`
      <svg aria-hidden="true" width="24" height="24">
        <circle cx="12" cy="12" r="10"/>
      </svg>
    `);
    expectNoFinding(checkSvgInformative());
  });

  it('passes for informative SVG with aria-label', () => {
    setBodyHtml(`
      <svg role="img" aria-label="Graphique des ventes 2024" width="100" height="100">
        <path d="M0 0 L100 100"/>
      </svg>
    `);
    expectNoFinding(checkSvgInformative());
  });

  it('passes for informative SVG with title element', () => {
    setBodyHtml(`
      <svg role="img" width="100" height="100">
        <title>Évolution du trafic</title>
        <rect width="100" height="100"/>
      </svg>
    `);
    expectNoFinding(checkSvgInformative());
  });

  it('passes for informative SVG with aria-labelledby', () => {
    setBodyHtml(`
      <p id="chart-label">Répartition des budgets</p>
      <svg role="img" aria-labelledby="chart-label" width="100" height="100">
        <circle cx="50" cy="50" r="40"/>
      </svg>
    `);
    expectNoFinding(checkSvgInformative());
  });

  it('flags informative SVG with graphics but no alternative', () => {
    setBodyHtml(`
      <svg width="100" height="100">
        <path d="M0 0 L100 100"/>
      </svg>
    `);
    expectRule(checkSvgInformative(), 'rgaa-svg-informative');
  });

  it('flags SVG marked as img without alternative', () => {
    setBodyHtml(`
      <svg role="img" width="50" height="50">
        <rect width="50" height="50"/>
      </svg>
    `);
    expectRule(checkSvgInformative(), 'rgaa-svg-informative');
  });

  it('ignores hidden SVG', () => {
    setBodyHtml(`
      <svg style="display:none" width="100" height="100">
        <path d="M0 0"/>
      </svg>
    `);
    expectNoFinding(checkSvgInformative());
  });

  it('passes for empty decorative SVG without graphics (no path/g)', () => {
    setBodyHtml('<svg width="0" height="0"></svg>');
    expectNoFinding(checkSvgInformative());
  });
});

describe('checkCanvasAlt (RGAA 1.1)', () => {
  it('passes when canvas has aria-label', () => {
    setBodyHtml('<canvas aria-label="Graphique interactif" width="200" height="100"></canvas>');
    expectNoFinding(checkCanvasAlt());
  });

  it('passes when canvas has fallback text content', () => {
    setBodyHtml('<canvas width="200" height="100">Description textuelle du graphique</canvas>');
    expectNoFinding(checkCanvasAlt());
  });

  it('passes when canvas is labelled via associated label', () => {
    setBodyHtml(`
      <label for="chart">Graphique des résultats</label>
      <canvas id="chart" width="200" height="100"></canvas>
    `);
    expectNoFinding(checkCanvasAlt());
  });

  it('flags canvas without any accessible name or fallback', () => {
    setBodyHtml('<canvas width="200" height="100"></canvas>');
    expectRule(checkCanvasAlt(), 'rgaa-canvas-alt');
  });

  it('ignores hidden canvas', () => {
    setBodyHtml('<canvas style="display:none" width="200" height="100"></canvas>');
    expectNoFinding(checkCanvasAlt());
  });
});
