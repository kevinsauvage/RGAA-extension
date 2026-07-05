import { computeAccessibleName } from '../accessible-name';
import { isVisible } from '../dom-utils';
import { multiNodeFinding, type RuleFinding } from './shared';

function svgHasTextAlternative(svg: SVGElement): boolean {
  if (svg.getAttribute('aria-label')?.trim()) return true;
  const labelledBy = svg.getAttribute('aria-labelledby');
  if (labelledBy) {
    return labelledBy.split(/\s+/).some((id) => document.getElementById(id)?.textContent?.trim());
  }
  const title = svg.querySelector(':scope > title');
  return Boolean(title?.textContent?.trim());
}

/** RGAA 1.1 — informative SVG without text alternative. */
export function checkSvgInformative(): RuleFinding | null {
  const offenders: Element[] = [];
  for (const svg of document.querySelectorAll('svg')) {
    if (!isVisible(svg)) continue;
    const role = svg.getAttribute('role');
    const ariaHidden = svg.getAttribute('aria-hidden') === 'true';
    if (ariaHidden) continue;
    // Decorative SVGs should be hidden; informative ones need role=img + alt mechanism.
    const isMarkedImg =
      role === 'img' || role === 'graphics-document' || role === 'graphics-symbol';
    const hasAlt = svgHasTextAlternative(svg);
    if (!hasAlt && (isMarkedImg || svg.querySelector('text, path, circle, rect, polygon, g'))) {
      offenders.push(svg);
    }
  }
  return multiNodeFinding(offenders, {
    criterion: '1.1',
    ruleId: 'rgaa-svg-informative',
    severity: 'serious',
    title: 'Image SVG informative sans alternative textuelle',
    description:
      'Des éléments SVG porteurs d’information n’ont pas d’alternative (title, aria-label ou aria-labelledby).',
    userImpact:
      'Les utilisateurs de lecteur d’écran ne perçoivent pas le contenu graphique de l’image SVG.',
  });
}

/** RGAA 1.1 — canvas without accessible name. */
export function checkCanvasAlt(): RuleFinding | null {
  const offenders: Element[] = [];
  for (const canvas of document.querySelectorAll('canvas')) {
    if (!isVisible(canvas)) continue;
    const name = computeAccessibleName(canvas);
    const fallback = canvas.textContent?.trim();
    if (!name && !fallback) offenders.push(canvas);
  }
  return multiNodeFinding(offenders, {
    criterion: '1.1',
    ruleId: 'rgaa-canvas-alt',
    severity: 'serious',
    title: 'Canvas sans alternative textuelle',
    description:
      'Des éléments canvas porteurs d’information n’ont pas d’alternative textuelle ni de contenu de secours.',
    userImpact:
      'Le contenu bitmap dessiné dans le canvas est invisible pour les technologies d’assistance.',
  });
}
