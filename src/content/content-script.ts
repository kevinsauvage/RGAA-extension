import type { ContentMessage, ContentResponse } from '@/lib/messaging';
import type { ScanResult } from '@/lib/types';
import { runAxeAudit, summarize } from './audit/axe-runner';
import { collectPerformance } from './audit/performance';
import { clearHighlight, highlightNode } from './highlight';

function uid(): string {
  return `scan-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

async function runScan(): Promise<ScanResult> {
  const started = performance.now();
  const [accessibilityIssues, perf] = await Promise.all([
    runAxeAudit(),
    collectPerformance(),
  ]);

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
      case 'HIGHLIGHT_NODE':
        highlightNode(message.target);
        sendResponse({ ok: true });
        return false;
      case 'CLEAR_HIGHLIGHT':
        clearHighlight();
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
