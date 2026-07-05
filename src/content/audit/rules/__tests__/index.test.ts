import { describe, expect, it } from 'vitest';
import { runRgaaRules, getImplementedRuleIds } from '../index';
import { allDeclaredRuleIds } from '@/lib/rgaa/coverage';
import { setBodyHtml, setHeadHtml } from './setup';

describe('runRgaaRules integration', () => {
  it('returns no issues on an accessible minimal page', () => {
    setHeadHtml('<meta name="viewport" content="width=device-width, initial-scale=1">');
    setBodyHtml(`
      <a href="#main">Aller au contenu principal</a>
      <main id="main">
        <h1>Accueil</h1>
        <p>Page accessible de démonstration.</p>
        <button style="outline:2px solid blue">Action</button>
      </main>
    `);
    expect(runRgaaRules()).toHaveLength(0);
  });

  it('aggregates multiple rule violations', () => {
    setHeadHtml('<meta name="viewport" content="width=device-width, user-scalable=no">');
    setBodyHtml(`
      <main>
        <div onclick="act()">Cliquer</div>
        <marquee>News</marquee>
        <a href="/file.pdf">Guide</a>
      </main>
    `);
    const issues = runRgaaRules();
    const ruleIds = new Set(issues.map((i) => i.ruleId));
    expect(ruleIds.has('rgaa-text-scaling')).toBe(true);
    expect(ruleIds.has('rgaa-keyboard-accessible')).toBe(true);
    expect(ruleIds.has('rgaa-moving-content')).toBe(true);
    expect(ruleIds.has('rgaa-doc-link-format')).toBe(true);
    expect(issues.every((i) => i.source === 'rule')).toBe(true);
    expect(issues.every((i) => i.confidence === 'likely')).toBe(true);
  });

  it('registry matches coverage declarations', () => {
    const implemented = new Set(getImplementedRuleIds());
    const declared = new Set(allDeclaredRuleIds());
    expect(implemented).toEqual(declared);
  });

  it('audits same-origin iframe documents', () => {
    setBodyHtml('<main><p>Top frame</p></main>');
    const iframe = document.createElement('iframe');
    document.body.appendChild(iframe);
    iframe.contentDocument!.body.innerHTML = '<font>Legacy iframe</font>';

    const issues = runRgaaRules();
    expect(issues.some((issue) => issue.ruleId === 'rgaa-presentational-html')).toBe(true);
  });
});

describe('shared rule finding shape', () => {
  it('produces AccessibilityIssue with RGAA criterion metadata', () => {
    setBodyHtml('<font>Legacy</font>');
    const [issue] = runRgaaRules();
    expect(issue.ruleId).toBe('rgaa-presentational-html');
    expect(issue.rgaa[0]?.criterion).toBe('10.1');
    expect(issue.rgaa[0]?.theme).toBeTruthy();
    expect(issue.helpUrl).toContain('10-1');
    expect(issue.nodes[0]?.target).toBeTruthy();
  });
});
