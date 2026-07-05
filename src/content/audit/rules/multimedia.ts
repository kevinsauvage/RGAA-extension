import { auditQueryAll } from '../audit-context';
import { isAuditableMedia, isVisible } from '../dom-utils';
import { multiNodeFinding, type RuleFinding } from './shared';

/** RGAA 4.3 — video without caption/subtitle track. */
export function checkVideoCaptions(): RuleFinding | null {
  const offenders: Element[] = [];
  for (const video of auditQueryAll('video')) {
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
  for (const media of auditQueryAll('video, audio')) {
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
  for (const el of auditQueryAll('marquee, blink')) {
    if (isVisible(el)) offenders.push(el);
  }
  for (const video of auditQueryAll('video[autoplay]')) {
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

const CUSTOM_PLAYER_HINT = /player|media|video-js|plyr|vjs/i;

/** RGAA 4.11 (partial) — custom media player controls not keyboard focusable. */
export function checkMediaControlFocus(): RuleFinding | null {
  const offenders: Element[] = [];

  for (const media of auditQueryAll<HTMLMediaElement>('video, audio')) {
    if (!isAuditableMedia(media)) continue;
    if (media.hasAttribute('controls')) continue;

    const wrapper =
      media.closest('[class*="player"], [class*="media"], [class*="video-js"], [class*="plyr"]') ??
      media.parentElement;
    if (!wrapper || !CUSTOM_PLAYER_HINT.test(String(wrapper.className))) continue;

    const controls = [...wrapper.querySelectorAll<HTMLElement>('button, [role="button"], [tabindex]')].filter(
      isVisible,
    );
    const focusableControls = controls.filter((control) => control.tabIndex >= 0 || control.matches('button'));
    if (focusableControls.length === 0) offenders.push(wrapper);
  }

  return multiNodeFinding(offenders, {
    criterion: '4.11',
    ruleId: 'rgaa-media-control-focus',
    severity: 'moderate',
    title: 'Contrôles du lecteur média non accessibles au clavier',
    description:
      'Un lecteur média personnalisé n’expose pas de contrôles focusables au clavier (play, pause, volume…).',
    userImpact:
      'Les utilisateurs au clavier ne peuvent pas contrôler la lecture du contenu audio ou vidéo.',
  });
}
