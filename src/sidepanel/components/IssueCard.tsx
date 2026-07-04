import { useState } from 'react';
import type { AccessibilityIssue, AffectedNode } from '@/lib/types';
import { clearHighlightOnPage, focusIssueOnPage, highlightOnPage } from '@/lib/utils';
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
            {issue.source === 'ai' && (
              <span className="rounded bg-brand-100 px-1.5 py-0.5 text-[10px] font-semibold text-brand-700 dark:bg-brand-900/50 dark:text-brand-200">
                AI
              </span>
            )}
            {issue.source === 'rule' && (
              <span className="rounded bg-violet-100 px-1.5 py-0.5 text-[10px] font-semibold text-violet-700 dark:bg-violet-950/50 dark:text-violet-200">
                Rule
              </span>
            )}
            {issue.confidence === 'needs-review' && (
              <span className="rounded bg-amber-100 px-1.5 py-0.5 text-[10px] font-medium text-amber-700 dark:bg-amber-950 dark:text-amber-300">
                Review
              </span>
            )}
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
              <IssueNodeBlock key={index} node={node} />
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

function IssueNodeBlock({ node }: { node: AffectedNode }) {
  const [active, setActive] = useState(false);

  const scrollToNode = async () => {
    const found = await focusIssueOnPage(node.target, { targets: node.targets });
    setActive(found);
  };

  return (
    <button
      type="button"
      className={`group w-full rounded-md border p-2 text-left transition-colors ${
        active
          ? 'border-brand-400 bg-brand-50 dark:border-brand-700 dark:bg-brand-950/30'
          : 'border-transparent bg-slate-50 hover:border-slate-200 hover:bg-slate-100 dark:bg-slate-800/60 dark:hover:border-slate-700 dark:hover:bg-slate-800'
      }`}
      onClick={() => void scrollToNode()}
      onMouseEnter={() => void highlightOnPage(node.target, node.targets)}
      onMouseLeave={() => void clearHighlightOnPage()}
      title="Scroll to element on page"
    >
      <code className="block break-all text-[11px] text-slate-500">{node.target}</code>
      <code className="mt-1 block break-all text-[11px] text-slate-700 dark:text-slate-300">
        {node.html}
      </code>
      <span className="mt-1 block text-[10px] font-medium text-brand-600 opacity-0 transition-opacity group-hover:opacity-100 dark:text-brand-300">
        Click to scroll →
      </span>
    </button>
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
