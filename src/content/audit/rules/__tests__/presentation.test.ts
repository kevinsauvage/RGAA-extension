import { describe, it } from 'vitest';
import {
  checkFocusVisible,
  checkHiddenContent,
  checkPresentationalHtml,
  checkTextScaling,
} from '../presentation';
import { expectNoFinding, expectRule, setBodyHtml, setHeadHtml } from './setup';

describe('checkTextScaling (RGAA 10.4)', () => {
  it('passes with permissive viewport meta', () => {
    setHeadHtml('<meta name="viewport" content="width=device-width, initial-scale=1">');
    expectNoFinding(checkTextScaling());
  });

  it('passes when maximum-scale is at least 2', () => {
    setHeadHtml('<meta name="viewport" content="width=device-width, maximum-scale=2.5">');
    expectNoFinding(checkTextScaling());
  });

  it('flags user-scalable=no', () => {
    setHeadHtml('<meta name="viewport" content="width=device-width, user-scalable=no">');
    expectRule(checkTextScaling(), 'rgaa-text-scaling');
  });

  it('flags maximum-scale below 2', () => {
    setHeadHtml('<meta name="viewport" content="width=device-width, maximum-scale=1.5">');
    expectRule(checkTextScaling(), 'rgaa-text-scaling');
  });

  it('flags text-size-adjust:none on html', () => {
    document.documentElement.setAttribute('style', '-webkit-text-size-adjust: none');
    expectRule(checkTextScaling(), 'rgaa-text-scaling');
  });
});

describe('checkFocusVisible (RGAA 10.7)', () => {
  it('passes when focusable element has outline', () => {
    setBodyHtml('<button style="outline: 2px solid blue">OK</button>');
    expectNoFinding(checkFocusVisible());
  });

  it('passes when outline removed but focus ring class hint present', () => {
    setBodyHtml('<button class="focus-visible:ring-2" style="outline:none">OK</button>');
    expectNoFinding(checkFocusVisible());
  });

  it('flags focusable link with outline:none and no focus hint', () => {
    setBodyHtml('<a href="/page" style="outline:none">Lien</a>');
    expectRule(checkFocusVisible(), 'rgaa-focus-visible');
  });

  it('ignores elements with tabindex=-1', () => {
    setBodyHtml('<div tabindex="-1" style="outline:none">Skip me</div>');
    expectNoFinding(checkFocusVisible());
  });

  it('ignores hidden focusable elements', () => {
    setBodyHtml('<button style="display:none; outline:none">Hidden</button>');
    expectNoFinding(checkFocusVisible());
  });
});

describe('checkHiddenContent (RGAA 10.8)', () => {
  it('passes for sr-only text with aria-hidden', () => {
    setBodyHtml('<span class="sr-only" aria-hidden="true">Hidden from AT</span>');
    expectNoFinding(checkHiddenContent());
  });

  it('flags sr-only text exposed to assistive tech', () => {
    setBodyHtml(`
      <span class="sr-only" style="position:absolute;left:-9999px;font-size:0">
        Extra content for screen readers only
      </span>
    `);
    expectRule(checkHiddenContent(), 'rgaa-hidden-content');
  });

  it('flags off-screen positioned text without aria-hidden', () => {
    setBodyHtml(`
      <span style="position:absolute;left:-9999px">Skip navigation duplicate</span>
    `);
    expectRule(checkHiddenContent(), 'rgaa-hidden-content');
  });

  it('ignores empty off-screen elements', () => {
    setBodyHtml('<span class="sr-only" style="position:absolute;left:-9999px"></span>');
    expectNoFinding(checkHiddenContent());
  });

  it('ignores visible sr-only styled element with dimensions (not clipped)', () => {
    setBodyHtml('<span class="sr-only">Visible helper text</span>');
    expectNoFinding(checkHiddenContent());
  });
});

describe('checkPresentationalHtml (RGAA 10.1)', () => {
  it('passes for semantic markup without legacy tags', () => {
    setBodyHtml('<p>Texte normal avec <strong>emphase</strong></p>');
    expectNoFinding(checkPresentationalHtml());
  });

  it('flags visible font tag', () => {
    setBodyHtml('<font color="red">Ancien markup</font>');
    expectRule(checkPresentationalHtml(), 'rgaa-presentational-html');
  });

  it('flags center tag', () => {
    setBodyHtml('<center>Contenu centré</center>');
    expectRule(checkPresentationalHtml(), 'rgaa-presentational-html');
  });

  it('flags marquee element', () => {
    setBodyHtml('<marquee>Défilement</marquee>');
    expectRule(checkPresentationalHtml(), 'rgaa-presentational-html');
  });

  it('ignores hidden legacy tags', () => {
    setBodyHtml('<font style="display:none">Hidden</font>');
    expectNoFinding(checkPresentationalHtml());
  });
});
