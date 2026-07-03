import { useState } from 'react';
import type { AccessibilityIssue } from '@/lib/types';
import { clearHighlightOnPage, highlightOnPage } from '@/lib/utils';
import { SeverityBadge } from './SeverityBadge';
import { AIFixPanel } from './AIFixPanel';

export function IssueCard({ issue }: { issue: AccessibilityIssue }) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className="card overflow-hidden">
      <button
        type="button"
        className="flex w-full items-start gap-3 p-3 text-left hover:bg-slate-50 dark:hover:bg-slate-800/50"
        onClick={() => setExpanded((v) => !v)}
        aria-expanded={expanded}
      >
        <SeverityBadge severity={issue.severity} />
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-medium text-slate-800 dark:text-slate-100">
            {issue.title}
          </p>
          <div className="mt-1 flex flex-wrap gap-1">
            {issue.rgaa.map((r) => (
              <span
                key={r.criterion}
                className="rounded bg-slate-100 px-1.5 py-0.5 text-[10px] font-medium text-slate-600 dark:bg-slate-800 dark:text-slate-300"
                title={`${r.theme} · WCAG ${r.wcag.join(', ')}`}
              >
                RGAA {r.criterion}
              </span>
            ))}
            <span className="rounded bg-slate-100 px-1.5 py-0.5 text-[10px] text-slate-500 dark:bg-slate-800">
              {issue.nodes.length} element{issue.nodes.length > 1 ? 's' : ''}
            </span>
          </div>
        </div>
        <ChevronIcon expanded={expanded} />
      </button>

      {expanded && (
        <div className="space-y-3 border-t border-slate-100 p-3 dark:border-slate-800">
          <p className="text-xs text-slate-600 dark:text-slate-300">
            <span className="font-semibold">Impact: </span>
            {issue.userImpact}
          </p>

          <div className="space-y-1.5">
            {issue.nodes.slice(0, 5).map((node, index) => (
              <div
                key={index}
                className="group rounded-md bg-slate-50 p-2 dark:bg-slate-800/60"
                onMouseEnter={() => void highlightOnPage(node.target)}
                onMouseLeave={() => void clearHighlightOnPage()}
              >
                <code className="block break-all text-[11px] text-slate-500">
                  {node.target}
                </code>
                <code className="mt-1 block break-all text-[11px] text-slate-700 dark:text-slate-300">
                  {node.html}
                </code>
              </div>
            ))}
            {issue.nodes.length > 5 && (
              <p className="text-[11px] text-slate-400">
                +{issue.nodes.length - 5} more element(s)
              </p>
            )}
          </div>

          <AIFixPanel issue={issue} />

          {issue.helpUrl && (
            <a
              href={issue.helpUrl}
              target="_blank"
              rel="noreferrer"
              className="inline-block text-[11px] font-medium text-brand-600 hover:underline"
            >
              Reference documentation →
            </a>
          )}
        </div>
      )}
    </div>
  );
}

function ChevronIcon({ expanded }: { expanded: boolean }) {
  return (
    <svg
      viewBox="0 0 24 24"
      width="16"
      height="16"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      className={`mt-0.5 shrink-0 text-slate-400 transition-transform ${
        expanded ? 'rotate-180' : ''
      }`}
      aria-hidden="true"
    >
      <path d="M6 9l6 6 6-6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
