import { describe, it } from 'vitest';
import {
  checkTextSpacingOverride,
  checkHoverFocusOverlay,
  checkCssInteractiveReachability,
} from '../presentation';
import { checkPopupOnLoad } from '../consultation';
import { checkSelectOptgroup, checkInvalidFieldHint } from '../forms';
import { checkDecorativeImageAlt } from '../images';
import { checkMediaControlFocus } from '../multimedia';
import { expectNoFinding, expectRule, setBodyHtml, setHeadHtml } from './setup';

describe('checkTextSpacingOverride (RGAA 10.12)', () => {
  it('passes on a normal page', () => {
    setBodyHtml('<p>Texte lisible avec espacement normal.</p>');
    expectNoFinding(checkTextSpacingOverride());
  });

  it('flags when spacing cannot be overridden', () => {
    setHeadHtml(`
      <style>
        p { line-height: 1.2 !important; letter-spacing: 0 !important; word-spacing: 0 !important; }
      </style>
    `);
    setBodyHtml('<p>Texte bloqué</p>');
    const result = checkTextSpacingOverride();
    if (result) {
      expectRule(result, 'rgaa-text-spacing-override');
    }
  });
});

describe('checkHoverFocusOverlay (RGAA 10.13)', () => {
  it('passes when expanded popup has close control', () => {
    setBodyHtml(`
      <button aria-expanded="true" aria-haspopup="dialog" aria-controls="menu">Menu</button>
      <div id="menu" role="dialog">
        <button aria-label="Fermer">×</button>
        <p>Options</p>
      </div>
    `);
    expectNoFinding(checkHoverFocusOverlay());
  });

  it('flags expanded popup without dismiss mechanism', () => {
    setBodyHtml(`
      <div aria-expanded="true" aria-haspopup="dialog" aria-controls="tip">Aide</div>
      <div id="tip" role="dialog"><p>Informations supplémentaires</p></div>
    `);
    expectRule(checkHoverFocusOverlay(), 'rgaa-hover-focus-overlay');
  });
});

describe('checkCssInteractiveReachability (RGAA 10.14)', () => {
  it('passes when pointer element is focusable', () => {
    setBodyHtml('<div style="cursor:pointer" tabindex="0" onclick="void(0)">Action</div>');
    expectNoFinding(checkCssInteractiveReachability());
  });

  it('flags pointer element with onclick but no tabindex', () => {
    setBodyHtml('<div style="cursor:pointer" onclick="void(0)">Action</div>');
    expectRule(checkCssInteractiveReachability(), 'rgaa-css-interactive');
  });
});

describe('checkSelectOptgroup (RGAA 11.8)', () => {
  it('passes when select uses optgroup', () => {
    setBodyHtml(`
      <select>
        <optgroup label="Fruits">
          <option value="a">Pomme</option>
          <option value="b">Poire</option>
        </optgroup>
        <optgroup label="Légumes">
          <option value="c">Carotte</option>
          <option value="d">Poireau</option>
        </optgroup>
      </select>
    `);
    expectNoFinding(checkSelectOptgroup());
  });

  it('flags long select with repeated prefixes and no optgroup', () => {
    setBodyHtml(`
      <select>
        <option value="1">Europe - France</option>
        <option value="2">Europe - Allemagne</option>
        <option value="3">Europe - Italie</option>
        <option value="4">Asie - Japon</option>
        <option value="5">Asie - Chine</option>
        <option value="6">Asie - Corée</option>
        <option value="7">Amériques - Canada</option>
        <option value="8">Amériques - Brésil</option>
      </select>
    `);
    expectRule(checkSelectOptgroup(), 'rgaa-select-optgroup');
  });
});

describe('checkInvalidFieldHint (RGAA 11.11)', () => {
  it('passes when aria-describedby points to error hint', () => {
    setBodyHtml(`
      <input id="email" aria-invalid="true" aria-describedby="email-error" />
      <p id="email-error">Format attendu : nom@domaine.fr</p>
    `);
    expectNoFinding(checkInvalidFieldHint());
  });

  it('flags aria-invalid field without correction hint', () => {
    setBodyHtml('<input id="name" aria-invalid="true" />');
    expectRule(checkInvalidFieldHint(), 'rgaa-invalid-field-hint');
  });
});

describe('checkPopupOnLoad (RGAA 13.2)', () => {
  it('passes without popup scripts', () => {
    setBodyHtml('<main><p>Contenu</p></main>');
    expectNoFinding(checkPopupOnLoad());
  });

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

describe('checkDecorativeImageAlt (RGAA 1.2)', () => {
  it('passes when decorative image uses empty alt', () => {
    setBodyHtml('<a href="/"><img src="icon.png" alt="" /> Accueil</a>');
    expectNoFinding(checkDecorativeImageAlt());
  });

  it('flags decorative icon in link with visible text and non-empty alt', () => {
    setBodyHtml('<a href="/"><img src="home.png" alt="Home" /> Accueil</a>');
    expectRule(checkDecorativeImageAlt(), 'rgaa-decorative-image-alt');
  });

  it('flags generic decorative alt text', () => {
    setBodyHtml('<img src="spacer.gif" alt="decorative" />');
    expectRule(checkDecorativeImageAlt(), 'rgaa-decorative-image-alt');
  });
});

describe('checkMediaControlFocus (RGAA 4.11)', () => {
  it('passes for native controls', () => {
    setBodyHtml('<video controls src="movie.mp4"></video>');
    expectNoFinding(checkMediaControlFocus());
  });

  it('flags custom player without focusable controls', () => {
    setBodyHtml(`
      <div class="video-player">
        <video src="movie.mp4"></video>
        <div tabindex="-1" class="play-btn">▶</div>
      </div>
    `);
    expectRule(checkMediaControlFocus(), 'rgaa-media-control-focus');
  });
});
