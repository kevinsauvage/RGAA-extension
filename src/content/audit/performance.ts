import type { CoreWebVitals, PerformanceIssue, Severity } from '@/lib/types';

/** "Good" thresholds per Core Web Vitals guidance (ms unless noted). */
const THRESHOLDS = {
  lcp: 2500,
  cls: 0.1,
  inp: 200,
  ttfb: 800,
  fcp: 1800,
} as const;

function readNavigationTiming(): { ttfb: number | null; fcp: number | null } {
  const [nav] = performance.getEntriesByType(
    'navigation',
  ) as PerformanceNavigationTiming[];
  const paint = performance
    .getEntriesByType('paint')
    .find((entry) => entry.name === 'first-contentful-paint');
  return {
    ttfb: nav ? Math.round(nav.responseStart) : null,
    fcp: paint ? Math.round(paint.startTime) : null,
  };
}

function readLcp(): Promise<number | null> {
  return new Promise((resolve) => {
    if (!('PerformanceObserver' in window)) return resolve(null);
    let last: number | null = null;
    try {
      const observer = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        const entry = entries[entries.length - 1];
        if (entry) last = Math.round(entry.startTime);
      });
      observer.observe({ type: 'largest-contentful-paint', buffered: true });
      // LCP is only final after interaction; sample a short window.
      setTimeout(() => {
        observer.disconnect();
        resolve(last);
      }, 600);
    } catch {
      resolve(null);
    }
  });
}

function readCls(): Promise<number | null> {
  return new Promise((resolve) => {
    if (!('PerformanceObserver' in window)) return resolve(null);
    let cls = 0;
    try {
      const observer = new PerformanceObserver((list) => {
        for (const entry of list.getEntries() as unknown as Array<{
          value: number;
          hadRecentInput: boolean;
        }>) {
          if (!entry.hadRecentInput) cls += entry.value;
        }
      });
      observer.observe({ type: 'layout-shift', buffered: true });
      setTimeout(() => {
        observer.disconnect();
        resolve(Math.round(cls * 1000) / 1000);
      }, 600);
    } catch {
      resolve(null);
    }
  });
}

function severityFor(value: number, threshold: number): Severity {
  const ratio = value / threshold;
  if (ratio <= 1) return 'minor';
  if (ratio <= 1.5) return 'moderate';
  if (ratio <= 2.5) return 'serious';
  return 'critical';
}

export async function collectPerformance(): Promise<{
  webVitals: CoreWebVitals;
  issues: PerformanceIssue[];
}> {
  const { ttfb, fcp } = readNavigationTiming();
  const [lcp, cls] = await Promise.all([readLcp(), readCls()]);

  const webVitals: CoreWebVitals = { lcp, cls, inp: null, ttfb, fcp };
  const issues: PerformanceIssue[] = [];

  const push = (
    metric: string,
    value: number | null,
    threshold: number,
    unit: string,
    title: string,
    description: string,
  ) => {
    if (value === null || value <= threshold) return;
    issues.push({
      id: `perf-${metric}`,
      kind: 'performance',
      metric,
      value,
      threshold,
      unit,
      severity: severityFor(value, threshold),
      title,
      description,
    });
  };

  push(
    'LCP',
    lcp,
    THRESHOLDS.lcp,
    'ms',
    'Largest Contentful Paint is slow',
    'The main content takes too long to render. Optimize the hero image/text, preload critical assets and reduce render-blocking resources.',
  );
  push(
    'CLS',
    cls,
    THRESHOLDS.cls,
    '',
    'Layout shifts during load',
    'Content moves as the page loads. Reserve space for images/ads and avoid injecting content above existing content.',
  );
  push(
    'TTFB',
    ttfb,
    THRESHOLDS.ttfb,
    'ms',
    'Server response is slow',
    'Time to first byte is high. Improve server response time, use caching/CDN and reduce redirects.',
  );
  push(
    'FCP',
    fcp,
    THRESHOLDS.fcp,
    'ms',
    'First Contentful Paint is slow',
    'The first pixels appear late. Reduce render-blocking CSS/JS and inline critical styles.',
  );

  return { webVitals, issues };
}
