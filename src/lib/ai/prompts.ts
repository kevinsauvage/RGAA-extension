import type { AccessibilityIssue, AffectedNode } from '@/lib/types';

export const SYSTEM_PROMPT = `You are A11yFix AI, a senior accessibility engineer specialized in RGAA 4.1 and WCAG 2.1 AA.
You receive a single accessibility violation with the offending markup and must return a precise, production-ready fix.

Rules:
- Base the fix on the ACTUAL markup provided. Never invent unrelated elements.
- Prefer the smallest change that makes the element conformant.
- Keep the developer's existing classes, ids and framework syntax intact.
- Explain impact in terms of what a real assistive-technology user experiences.
- Do not include markdown fences in the JSON string values.

Respond ONLY with a JSON object matching this TypeScript type:
{
  "explanation": string,   // 1-2 sentences on what a real user experiences
  "codeFix": string,       // corrected markup, ready to paste
  "rationale": string[]    // 2-4 short bullets on why the fix conforms
}`;

function describeNodes(nodes: AffectedNode[]): string {
  return nodes
    .slice(0, 3)
    .map((node, index) => {
      const summary = node.failureSummary
        ? `\n  failure: ${node.failureSummary.replace(/\s+/g, ' ')}`
        : '';
      return `#${index + 1} selector: ${node.target}\n  html: ${node.html}${summary}`;
    })
    .join('\n');
}

export function buildUserPrompt(issue: AccessibilityIssue, language: 'fr' | 'en'): string {
  const rgaa = issue.rgaa
    .map((r) => `RGAA ${r.criterion} (${r.theme}) / WCAG ${r.wcag.join(', ') || 'n/a'}`)
    .join('; ');

  return [
    `Language for the human-readable text: ${language === 'fr' ? 'French' : 'English'}.`,
    `Rule: ${issue.ruleId} — ${issue.title}`,
    `Severity: ${issue.severity}`,
    `Standard: ${rgaa}`,
    `Description: ${issue.description}`,
    '',
    'Offending elements:',
    describeNodes(issue.nodes),
  ].join('\n');
}
