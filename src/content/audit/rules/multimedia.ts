import { auditGetElementById, auditQueryAll } from '../audit-context';
import { computeAccessibleName } from '../accessible-name';
import { isAuditableMedia, isVisible } from '../dom-utils';
import { multiNodeFinding, type RuleFinding } from './shared';

function embedHasIdentification(el: Element): boolean {
  return Boolean(
    el.getAttribute('title')?.trim() ||
      el.getAttribute('aria-label')?.trim() ||
      computeAccessibleName(el),
  );
}

function hasTextAlternative(el: Element): boolean {
  const figcaption = el.closest('figure')?.querySelector('figcaption');
  if (figcaption?.textContent?.trim()) return true;

  const describedBy = el.getAttribute('aria-describedby');
  if (describedBy) {
    const hasDesc = describedBy
      .split(/\s+/)
      .some((id) => auditGetElementById(id)?.textContent?.trim());
    if (hasDesc) return true;
  }

  const fallback = el.textContent?.replace(/\s+/g, ' ').trim();
  if (fallback && fallback.length > 0) return true;

  return false;
}

function svgIsAnimated(svg: SVGElement): boolean {
  return svg.querySelector('animate, animateTransform, animateMotion, set') !== null;
}

/** RGAA 4.7 — non-temporal media (object/embed/animated SVG) without identification. */
export function checkMediaIdentification(): RuleFinding | null {
  const offenders: Element[] = [];

  for (const el of auditQueryAll('object, embed')) {
    if (!isVisible(el)) continue;
    if (!embedHasIdentification(el)) offenders.push(el);
  }

  for (const svg of auditQueryAll<SVGElement>('svg')) {
    if (!isVisible(svg) || svg.getAttribute('aria-hidden') === 'true') continue;
    if (svgIsAnimated(svg) && !embedHasIdentification(svg)) offenders.push(svg);
  }

  return multiNodeFinding(offenders, {
    criterion: '4.7',
    ruleId: 'rgaa-media-identification',
    severity: 'moderate',
    title: 'Média non temporel non identifié',
    description:
      'Des contenus object, embed ou SVG animé n’ont pas d’intitulé (title, aria-label ou alternative textuelle).',
    userImpact:
      'Les utilisateurs ne savent pas quel type de contenu non temporel ils rencontrent.',
  });
}

/** RGAA 4.8 — non-temporal media without an accessible alternative. */
export function checkMediaAlternative(): RuleFinding | null {
  const offenders: Element[] = [];

  for (const el of auditQueryAll('object, embed')) {
    if (!isVisible(el)) continue;
    if (embedHasIdentification(el) || hasTextAlternative(el)) continue;
    offenders.push(el);
  }

  for (const svg of auditQueryAll<SVGElement>('svg')) {
    if (!isVisible(svg) || svg.getAttribute('aria-hidden') === 'true') continue;
    if (!svgIsAnimated(svg)) continue;
    const hasDesc =
      svg.querySelector('desc')?.textContent?.trim() ||
      svg.getAttribute('aria-describedby') ||
      embedHasIdentification(svg);
    if (!hasDesc && !hasTextAlternative(svg)) offenders.push(svg);
  }

  return multiNodeFinding(offenders, {
    criterion: '4.8',
    ruleId: 'rgaa-media-alternative',
    severity: 'serious',
    title: 'Média non temporel sans alternative accessible',
    description:
      'Des contenus object, embed ou SVG animé n’ont pas d’alternative textuelle ou descriptive associée.',
    userImpact:
      'Les utilisateurs de technologies d’assistance ne peuvent pas accéder au contenu du média non temporel.',
  });
}

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
