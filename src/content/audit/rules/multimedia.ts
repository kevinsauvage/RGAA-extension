import { isAuditableMedia, isVisible } from '../dom-utils';
import { multiNodeFinding, type RuleFinding } from './shared';

/** RGAA 4.3 — video without caption/subtitle track. */
export function checkVideoCaptions(): RuleFinding | null {
  const offenders: Element[] = [];
  for (const video of document.querySelectorAll('video')) {
    if (!isAuditableMedia(video)) continue;
    const hasCaptions = [...video.querySelectorAll('track')].some((track) => {
      const kind = track.getAttribute('kind') ?? '';
      return kind === 'captions' || kind === 'subtitles';
    });
    if (!hasCaptions && (video.hasAttribute('src') || video.querySelector('source'))) {
      offenders.push(video);
    }
  }
  return multiNodeFinding(offenders, {
    criterion: '4.3',
    ruleId: 'rgaa-video-captions',
    severity: 'serious',
    title: 'Vidéo sans piste de sous-titres',
    description: 'Des éléments video n’ont pas de piste track kind="captions" ou "subtitles".',
    userImpact: 'Les personnes sourdes ou malentendantes ne peuvent pas accéder au contenu audio.',
  });
}

/** RGAA 4.10 / 13.8 — autoplay media without controls. */
export function checkAutoplayMedia(): RuleFinding | null {
  const offenders: Element[] = [];
  for (const media of document.querySelectorAll('video, audio')) {
    if (!isAuditableMedia(media)) continue;
    if (
      media.hasAttribute('autoplay') &&
      !media.hasAttribute('controls') &&
      !media.hasAttribute('muted')
    ) {
      offenders.push(media);
    }
  }
  return multiNodeFinding(offenders, {
    criterion: '4.10',
    ruleId: 'rgaa-autoplay-media',
    severity: 'serious',
    title: 'Média en lecture automatique sans contrôle',
    description: 'Des éléments video/audio se lancent automatiquement sans contrôles utilisateur.',
    userImpact:
      'Les utilisateurs sont surpris par du son ou du mouvement qu’ils ne peuvent pas arrêter facilement.',
  });
}

/** RGAA 13.8 — uncontrollable moving content. */
export function checkMovingContent(): RuleFinding | null {
  const offenders: Element[] = [];
  for (const el of document.querySelectorAll('marquee, blink')) {
    if (isVisible(el)) offenders.push(el);
  }
  for (const video of document.querySelectorAll('video[autoplay]')) {
    if (isAuditableMedia(video) && !video.hasAttribute('controls')) offenders.push(video);
  }
  return multiNodeFinding(offenders, {
    criterion: '13.8',
    ruleId: 'rgaa-moving-content',
    severity: 'moderate',
    title: 'Contenu en mouvement non contrôlable',
    description: 'Du contenu en mouvement (marquee, blink, vidéo autoplay) n’est pas contrôlable.',
    userImpact:
      'Les utilisateurs sensibles au mouvement ou utilisant un lecteur d’écran sont gênés.',
  });
}
