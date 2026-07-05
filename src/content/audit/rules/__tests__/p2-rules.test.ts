import { describe, it } from 'vitest';
import { checkMediaIdentification, checkMediaAlternative } from '../multimedia';
import { checkScriptWidgetAlternative } from '../scripts';
import { checkBackgroundImageContrast } from '../presentation';
import { checkLabelProximity } from '../forms';
import { checkTooltipKeyboardAccess } from '../navigation';
import { checkFlashContent } from '../consultation';
import { expectNoFinding, expectRule, setBodyHtml, setHeadHtml } from './setup';

describe('checkMediaIdentification (RGAA 4.7)', () => {
  it('passes for object with title', () => {
    setBodyHtml('<object data="chart.svg" title="Graphique des ventes"></object>');
    expectNoFinding(checkMediaIdentification());
  });

  it('flags object without identification', () => {
    setBodyHtml('<object data="diagram.svg"></object>');
    expectRule(checkMediaIdentification(), 'rgaa-media-identification');
  });

  it('flags animated SVG without accessible name', () => {
    setBodyHtml(`
      <svg width="100" height="100">
        <circle cx="50" cy="50" r="40">
          <animate attributeName="r" values="40;20;40" dur="2s" repeatCount="indefinite" />
        </circle>
      </svg>
    `);
    expectRule(checkMediaIdentification(), 'rgaa-media-identification');
  });
});

describe('checkMediaAlternative (RGAA 4.8)', () => {
  it('passes for object with figcaption', () => {
    setBodyHtml(`
      <figure>
        <object data="map.svg"></object>
        <figcaption>Carte des régions</figcaption>
      </figure>
    `);
    expectNoFinding(checkMediaAlternative());
  });

  it('flags embed without alternative', () => {
    setBodyHtml('<embed src="animation.swf" type="application/x-shockwave-flash" />');
    expectRule(checkMediaAlternative(), 'rgaa-media-alternative');
  });
});

describe('checkScriptWidgetAlternative (RGAA 7.2)', () => {
  it('passes for widget with aria-label', () => {
    setBodyHtml('<div role="slider" aria-label="Volume"></div>');
    expectNoFinding(checkScriptWidgetAlternative());
  });

  it('flags role=tab without name', () => {
    setBodyHtml('<div role="tab"></div>');
    expectRule(checkScriptWidgetAlternative(), 'rgaa-script-widget-alt');
  });
});

describe('checkBackgroundImageContrast (RGAA 10.5)', () => {
  it('passes when text contrast is sufficient without image', () => {
    setHeadHtml(`
      <style>
        .hero { background-image: url('bg.jpg'); color: rgb(0, 0, 0); }
      </style>
    `);
    setBodyHtml('<div class="hero"><p>Texte lisible</p></div>');
    expectNoFinding(checkBackgroundImageContrast());
  });

  it('flags low-contrast text over background-image', () => {
    setHeadHtml(`
      <style>
        .hero { background-image: url('bg.jpg'); color: rgb(200, 200, 200); }
      </style>
    `);
    setBodyHtml('<div class="hero"><p>Texte pâle</p></div>');
    expectRule(checkBackgroundImageContrast(), 'rgaa-bg-image-contrast');
  });
});

describe('checkLabelProximity (RGAA 11.4)', () => {
  it('passes when label is programmatically associated', () => {
    setBodyHtml(`
      <label for="email">Courriel</label>
      <input id="email" type="email" />
    `);
    expectNoFinding(checkLabelProximity());
  });

  it('flags visually grouped label without for attribute', () => {
    setBodyHtml(`
      <div class="field">
        <span>Nom</span>
        <input type="text" />
      </div>
    `);
    expectRule(checkLabelProximity(), 'rgaa-label-proximity');
  });
});

describe('checkTooltipKeyboardAccess (RGAA 12.11)', () => {
  it('passes for focusable element with title', () => {
    setBodyHtml('<button title="Aide contextuelle">?</button>');
    expectNoFinding(checkTooltipKeyboardAccess());
  });

  it('flags title on non-focusable span', () => {
    setBodyHtml('<span title="Information complémentaire">Réf. 42</span>');
    expectRule(checkTooltipKeyboardAccess(), 'rgaa-tooltip-keyboard');
  });

  it('flags aria-describedby tooltip on non-focusable element', () => {
    setBodyHtml(`
      <span aria-describedby="tip">Info</span>
      <span id="tip" role="tooltip">Détails supplémentaires</span>
    `);
    expectRule(checkTooltipKeyboardAccess(), 'rgaa-tooltip-keyboard');
  });
});

describe('checkFlashContent (RGAA 13.7)', () => {
  it('passes for slow animation', () => {
    setHeadHtml(`
      <style>
        @keyframes fade { from { opacity: 1; } to { opacity: 0.5; } }
        .slow { animation: fade 2s infinite; width: 200px; height: 200px; }
      </style>
    `);
    setBodyHtml('<div class="slow">Contenu</div>');
    expectNoFinding(checkFlashContent());
  });

  it('flags rapid infinite animation on large element', () => {
    setBodyHtml(
      '<div style="animation: flash 0.2s infinite; width: 200px; height: 200px;">Alerte</div>',
    );
    expectRule(checkFlashContent(), 'rgaa-flash-content');
  });
});
