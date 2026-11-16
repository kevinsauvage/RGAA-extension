# Adding a deterministic RGAA rule

A rule is a function that inspects the rendered page and returns a finding or `null`. Adding one touches five
places; CI fails if any is missed.

## 1. Write the check

Put it in the theme file it belongs to under `src/content/audit/rules/` (`images.ts`, `forms.ts`, `navigation.ts`,
…), or a new file for a new theme.

```ts
import { auditQueryAll } from '../audit-context';
import { isVisible } from '../dom-utils';
import { multiNodeFinding, type RuleFinding } from './shared';

/** RGAA 5.8 — layout tables using data-table semantics. */
export function checkLayoutTableSemantics(): RuleFinding | null {
  const offenders: Element[] = [];
  for (const table of auditQueryAll('table')) {
    if (!isVisible(table)) continue;
    // … decide whether this element fails …
    offenders.push(table);
  }
  return multiNodeFinding(offenders, {
    criterion: '5.8',
    ruleId: 'rgaa-layout-table-semantics',
    severity: 'moderate',
    title: '…',
    description: '…',
    userImpact: '…',
  });
}
```

Conventions:

- Query with `auditQueryAll`, not `document.querySelectorAll`: it also covers same-origin iframes.
- Skip elements a user cannot perceive (`isVisible`), unless the rule is about hidden content.
- `ruleId` starts with `rgaa-` and is unique. `criterion` is the RGAA number (`'5.8'`).
- `multiNodeFinding` returns `null` for an empty list and caps the reported elements at 10.
- Rule findings are shown as **Likely** (`toIssue` in `shared.ts`). If a check cannot be made reliable, it belongs
  in the AI deep scan, not here.
- Titles and descriptions are written in French, like the existing rules.

## 2. Register it

Add it to `RGAA_RULE_REGISTRY` in `src/content/audit/rules/index.ts`:

```ts
{ id: 'rgaa-layout-table-semantics', check: checkLayoutTableSemantics },
```

## 3. Declare the coverage

In `src/lib/rgaa/coverage.ts`, add the rule id to its criterion and make sure `methods` includes `'rule'`:

```ts
'5.8': { methods: ['rule'], rules: ['rgaa-layout-table-semantics'] },
```

A test compares the registry with the declared rule ids, so an undeclared or unregistered rule fails `npm test`.

## 4. Test it

- **Unit test** in `src/content/audit/rules/__tests__/<theme>.test.ts`: at least one failing and one passing DOM.
  Coverage on `src/content/audit/rules/**` is gated (80% statements, 65% branches, 95% functions, 90% lines).
- **Fixture pages** in `e2e/fixtures/`: `<rule>-missing.html` and `<rule>-present.html`, each wired into
  `e2e/fixture-rules.test.ts`.

## 5. Regenerate the docs

```bash
npm run docs
```

This rewrites `docs/coverage.md`, `docs/rgaa-criteria.md` and `src/lib/rgaa/referential.json`. Commit the result:
CI runs the same command and fails on any difference.

## Before pushing

```bash
npm run typecheck && npm test && npm run test:coverage && npm run lint && npm run format:check && npm run build
```
