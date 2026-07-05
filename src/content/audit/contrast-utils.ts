/** WCAG 2.x relative luminance and contrast helpers (content-script only). */

function srgbToLinear(channel: number): number {
  const c = channel / 255;
  return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
}

function relativeLuminance(r: number, g: number, b: number): number {
  return 0.2126 * srgbToLinear(r) + 0.7152 * srgbToLinear(g) + 0.0722 * srgbToLinear(b);
}

/** Parse rgb()/rgba() from getComputedStyle. Returns null for unparseable values. */
export function parseRgb(color: string): [number, number, number, number] | null {
  const match = color.match(/rgba?\(\s*([\d.]+)[,\s]+([\d.]+)[,\s]+([\d.]+)(?:[,\s/]+([\d.]+))?\s*\)/i);
  if (!match) return null;
  return [
    Number(match[1]),
    Number(match[2]),
    Number(match[3]),
    match[4] !== undefined ? Number(match[4]) : 1,
  ];
}

export function isTransparentBg(color: string): boolean {
  if (!color || color === 'transparent') return true;
  const parsed = parseRgb(color);
  if (!parsed) return false;
  return parsed[3] === 0;
}

/** WCAG contrast ratio between two CSS color strings (4.5:1 is AA for normal text). */
export function contrastRatio(foreground: string, background: string): number | null {
  const fg = parseRgb(foreground);
  const bg = parseRgb(background);
  if (!fg || !bg) return null;

  const fgL = relativeLuminance(fg[0], fg[1], fg[2]);
  const bgL = relativeLuminance(bg[0], bg[1], bg[2]);
  const lighter = Math.max(fgL, bgL);
  const darker = Math.min(fgL, bgL);
  return (lighter + 0.05) / (darker + 0.05);
}

/** Walk ancestors for the first non-transparent background-color. */
export function effectiveBackgroundColor(element: Element): string {
  let current: Element | null = element;
  while (current) {
    const bg = getComputedStyle(current).backgroundColor;
    if (!isTransparentBg(bg)) return bg;
    current = current.parentElement;
  }
  const bodyBg = getComputedStyle(document.body).backgroundColor;
  return isTransparentBg(bodyBg) ? 'rgb(255, 255, 255)' : bodyBg;
}

export function hasBackgroundImage(element: Element): boolean {
  let current: Element | null = element;
  while (current) {
    const image = getComputedStyle(current).backgroundImage;
    if (image && image !== 'none') return true;
    current = current.parentElement;
  }
  return false;
}
