# User guide: reading the results

A11yFix AI checks one page at a time. This guide explains what each finding's **confidence** label means and how
far you can trust it. Whatever the score, a full RGAA audit still needs a person: automated checks reach about 60%
of the criteria on a single page (see [coverage.md](coverage.md)).

## Confidence levels

Every finding carries a confidence label and the source that produced it.

| Label (EN / FR)           | Source                  | What it means                                                        | What to do                                                   |
| ------------------------- | ----------------------- | -------------------------------------------------------------------- | ------------------------------------------------------------ |
| Certain / Certain         | axe-core                | A rule with no judgement in it failed on the live page.              | Fix it. False positives are rare.                            |
| Likely / Probable         | RGAA rule               | A custom check on the rendered page (styles, visibility, structure). | Look at the highlighted element, then fix or dismiss.        |
| Needs review / À vérifier | AI analysis (deep scan) | A model read the page HTML and flagged something subjective.         | Treat it as a lead. Confirm it yourself before acting on it. |

### Certain

axe-core tested the page and the rule failed: an image without an `alt`, a form field without a label, a missing
page language. These are safe to fix as reported.

### Likely

The extension's own RGAA rules look at the rendered page: is the focus indicator visible, does a skip link exist,
does the text survive a 200% zoom, does a layout table carry data-table markup. They use heuristics (a size
threshold, a list of known patterns), so an unusual but valid design can trip one. The highlighted element and the
"user impact" line tell you what was measured.

### Needs review

The deep scan sends a pruned copy of the page to the model and asks about criteria no rule can decide: whether an
`alt` text is relevant, whether a link text is vague, whether a visual list is marked up as one. Two guards run
before a finding is shown: the model must quote markup that exists on the page, and the selector it names must
resolve. Findings that fail either are dropped and counted as "rejected". What remains is still an opinion, never
"Certain".

## The score

The score starts at 100 and loses points for every accessibility finding in the list, whatever its source:
15 for a critical one, 9 for serious, 4.5 for moderate, 1.5 for minor, down to a floor of 0. Deep-scan findings
count too once the deep scan has run, so the score can drop after it. Use the score to compare two scans of the
same page, not as a compliance percentage: a page with few findings can still fail criteria no tool can check.

## Severity

Severity (minor, moderate, serious, critical) says how badly the problem blocks someone, not how sure the tool is.
A "critical · needs review" finding would be severe if it is real; check it first.

## Performance tab

LCP, CLS, FCP and TTFB are sampled when the scan runs. INP is the slowest interaction since the page loaded, so it
shows "—" until you have clicked or typed on the page. These are single measurements on your machine, not field
data.

## What the tool cannot see

- Other pages, and states you did not open (a closed menu, a step of a form you did not reach).
- Cross-origin iframes. Same-origin iframes are audited.
- Anything that needs a person: whether a caption matches the audio, whether reading order makes sense, whether an
  error message is understandable.
