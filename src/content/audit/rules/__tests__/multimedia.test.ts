import { describe, it } from 'vitest';
import { checkAutoplayMedia, checkMovingContent, checkVideoCaptions } from '../multimedia';
import { expectNoFinding, expectRule, setBodyHtml } from './setup';

describe('checkVideoCaptions (RGAA 4.3)', () => {
  it('passes when video has captions track', () => {
    setBodyHtml(`
      <video src="clip.mp4" controls>
        <track kind="captions" src="fr.vtt" srclang="fr" label="Français" />
      </video>
    `);
    expectNoFinding(checkVideoCaptions());
  });

  it('passes when video has subtitles track', () => {
    setBodyHtml(`
      <video controls>
        <source src="clip.mp4" type="video/mp4" />
        <track kind="subtitles" src="en.vtt" srclang="en" />
      </video>
    `);
    expectNoFinding(checkVideoCaptions());
  });

  it('flags video with source but no caption track', () => {
    setBodyHtml(`
      <video controls>
        <source src="clip.mp4" type="video/mp4" />
      </video>
    `);
    expectRule(checkVideoCaptions(), 'rgaa-video-captions');
  });

  it('flags video with src attribute but no tracks', () => {
    setBodyHtml('<video src="promo.mp4" controls></video>');
    expectRule(checkVideoCaptions(), 'rgaa-video-captions');
  });

  it('passes for video without src (placeholder)', () => {
    setBodyHtml('<video controls></video>');
    expectNoFinding(checkVideoCaptions());
  });
});

describe('checkAutoplayMedia (RGAA 4.10)', () => {
  it('passes for video with autoplay and controls', () => {
    setBodyHtml('<video autoplay controls src="bg.mp4"></video>');
    expectNoFinding(checkAutoplayMedia());
  });

  it('passes for muted autoplay background video', () => {
    setBodyHtml('<video autoplay muted src="bg.mp4"></video>');
    expectNoFinding(checkAutoplayMedia());
  });

  it('flags autoplay video without controls and not muted', () => {
    setBodyHtml('<video autoplay src="loud.mp4"></video>');
    expectRule(checkAutoplayMedia(), 'rgaa-autoplay-media');
  });

  it('flags autoplay audio without controls', () => {
    setBodyHtml('<audio autoplay src="music.mp3"></audio>');
    expectRule(checkAutoplayMedia(), 'rgaa-autoplay-media');
  });
});

describe('checkMovingContent (RGAA 13.8)', () => {
  it('passes for static content', () => {
    setBodyHtml('<p>Contenu statique</p>');
    expectNoFinding(checkMovingContent());
  });

  it('flags marquee element', () => {
    setBodyHtml('<marquee>Annonces</marquee>');
    expectRule(checkMovingContent(), 'rgaa-moving-content');
  });

  it('flags blink element', () => {
    setBodyHtml('<blink>Alert</blink>');
    expectRule(checkMovingContent(), 'rgaa-moving-content');
  });

  it('flags autoplay video without controls', () => {
    setBodyHtml('<video autoplay src="ad.mp4"></video>');
    expectRule(checkMovingContent(), 'rgaa-moving-content');
  });

  it('passes for autoplay video with controls', () => {
    setBodyHtml('<video autoplay controls src="ad.mp4"></video>');
    expectNoFinding(checkMovingContent());
  });
});
