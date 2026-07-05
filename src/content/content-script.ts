import type { ContentMessage, ContentResponse } from '@/lib/messaging';
import type { ScanResult } from '@/lib/types';
import { getIframeAuditSummary } from './audit/audit-context';
import { dedupeAccessibilityIssues } from './audit/dedupe-issues';
import { runRgaaRules } from './audit/rules';
import type { ScanWarning } from '@/lib/types';
import { buildPageHtml, verifySelectors } from './audit/page-html';
import { buildStyleSnippets } from './audit/style-snippets';
import { collectPerformance } from './audit/performance';
import { clearHighlight, clearPinnedHighlight, highlightNode } from './highlight';

function uid(): string {
  return `scan-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

function buildScanWarnings(): ScanWarning[] {
  const { skippedFrames } = getIframeAuditSummary();
  if (skippedFrames.length === 0) return [];

  return [
    {
      code: 'cross_origin_frames',
      count: skippedFrames.length,
      message: `${skippedFrames.length} cross-origin frame(s) could not be audited (RGAA theme 2 — Cadres). Content inside these frames was skipped.`,
    },
  ];
}

async function runScan(): Promise<ScanResult> {
  const started = performance.now();
  const [{ runAxeAudit, summarize }, perf] = await Promise.all([
    import('./audit/axe-runner'),
    collectPerformance(),
  ]);
  const axeIssues = await runAxeAudit();
  const accessibilityIssues = dedupeAccessibilityIssues([...axeIssues, ...runRgaaRules()]);

  const allSeverities = [
    ...accessibilityIssues.map((issue) => ({ severity: issue.severity })),
    ...perf.issues.map((issue) => ({ severity: issue.severity })),
  ];

  return {
    id: uid(),
    url: location.href,
    title: document.title || location.hostname,
    timestamp: Date.now(),
    durationMs: Math.round(performance.now() - started),
    summary: summarize(allSeverities),
    accessibilityIssues,
    performanceIssues: perf.issues,
    webVitals: perf.webVitals,
    warnings: buildScanWarnings(),
  };
}

chrome.runtime.onMessage.addListener(
  (message: ContentMessage, _sender, sendResponse: (r: ContentResponse) => void) => {
    switch (message.type) {
      case 'PING':
        sendResponse({ ok: true });
        return false;
      case 'RUN_SCAN':
        runScan()
          .then((result) => sendResponse({ ok: true, result }))
          .catch((error: unknown) =>
            sendResponse({
              ok: false,
              error: error instanceof Error ? error.message : String(error),
            }),
          );
        return true; // keep the message channel open for the async response
      case 'GET_PAGE_HTML': {
        try {
          sendResponse({ ok: true, html: buildPageHtml(), styleSnippets: buildStyleSnippets() });
        } catch (error: unknown) {
          sendResponse({
            ok: false,
            error: error instanceof Error ? error.message : String(error),
          });
        }
        return false;
      }
      case 'VERIFY_SELECTORS':
        sendResponse({ ok: true, selectors: verifySelectors(message.selectors) });
        return false;
      case 'HIGHLIGHT_NODE': {
        const found = highlightNode(message.target, {
          targets: message.targets,
          persist: message.persist,
        });
        sendResponse(found ? { ok: true } : { ok: false, error: 'Element not found on page.' });
        return false;
      }
      case 'CLEAR_HIGHLIGHT':
        if (message.pinned) {
          clearPinnedHighlight();
        } else {
          clearHighlight();
        }
        sendResponse({ ok: true });
        return false;
      default: {
        const _exhaustive: never = message;
        void _exhaustive;
        return false;
      }
    }
  },
);
