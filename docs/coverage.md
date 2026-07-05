# RGAA coverage tracker

How A11yFix AI checks each RGAA 4.1.2 criterion on a **single rendered page**.

> Généré automatiquement — lancer `npm run docs` pour régénérer.

## Summary

| Metric | Count | % |
|--------|------:|--:|
| Total criteria | 106 | 100% |
| Deterministic (axe + rules) | 57 | 53.8% |
| + AI deep scan (needs review) | 20 criteria also | — |
| Automated + AI reachable | 63 criteria | 63.2% |
| Manual only | 39 | 36.8% |

### How to read this

- **axe-core** runs on the live DOM with computed styles (contrast, viewport, ARIA…). Findings are **certain**.
- **Deterministic rules** (`src/content/audit/rules/`) use the rendered page — visibility, computed CSS, keyboard reachability. Findings are **likely**.
- **AI deep scan** sends pruned HTML + criterion hints to the model. Findings are **needs-review** and require human confirmation.
- **Manual** criteria need a human auditor, multi-page review, media playback, or interaction tests we do not automate yet.

## By theme

| Theme | Total | Automated | AI also | Manual only |
|-------|------:|----------:|--------:|------------:|
| 1. Images | 9 | 2 | 4 | 4 |
| 2. Cadres | 2 | 2 | 1 | 0 |
| 3. Couleurs | 3 | 3 | 0 | 0 |
| 4. Multimédia | 13 | 4 | 1 | 9 |
| 5. Tableaux | 8 | 3 | 2 | 3 |
| 6. Liens | 2 | 2 | 1 | 0 |
| 7. Scripts | 5 | 4 | 0 | 1 |
| 8. Éléments obligatoires | 10 | 8 | 3 | 0 |
| 9. Structuration de l’information | 4 | 3 | 3 | 0 |
| 10. Présentation de l’information | 14 | 9 | 1 | 5 |
| 11. Formulaires | 13 | 7 | 3 | 4 |
| 12. Navigation | 11 | 5 | 1 | 6 |
| 13. Consultation | 12 | 5 | 0 | 7 |

## Per-criterion matrix

| Criterion | Theme | Methods | Rules / axe | Note |
|-----------|-------|---------|-------------|------|
| 1.1 | Images | axe, rule | rgaa-svg-informative, rgaa-canvas-alt, image-alt, input-image-alt | Informative vs decorative judgment for edge cases may need m |
| 1.2 | Images | axe, ai, rule | rgaa-decorative-image-alt, image-redundant-alt | Decorative images with non-empty alt; full intent may need m |
| 1.3 | Images | ai |  | Alt relevance requires semantic judgment. |
| 1.4 | Images | manual |  | CAPTCHA/test images — manual audit. |
| 1.5 | Images | manual |  | CAPTCHA alternative mechanism — manual audit. |
| 1.6 | Images | ai |  | Complex image descriptions — AI flags candidates. |
| 1.7 | Images | manual |  | Detailed description relevance — manual. |
| 1.8 | Images | manual |  | Text-as-image replacement — manual. |
| 1.9 | Images | ai |  | Figure/figcaption association — AI on markup. |
| 2.1 | Cadres | axe | frame-title |  |
| 2.2 | Cadres | axe, ai | frame-title-unique | Title relevance partially AI-assessed. |
| 3.1 | Couleurs | axe, rule | rgaa-color-only-required, link-in-text-block | Full “information by color only” needs manual context review |
| 3.2 | Couleurs | axe | color-contrast |  |
| 3.3 | Couleurs | axe | color-contrast-enhanced |  |
| 4.1 | Multimédia | axe, ai | audio-caption, video-caption | Transcript presence AI; quality manual. |
| 4.2 | Multimédia | manual |  | Transcript/AD relevance — manual. |
| 4.3 | Multimédia | rule | rgaa-video-captions | Checks track[kind=captions/subtitles] presence. |
| 4.4 | Multimédia | manual |  | Caption relevance — manual. |
| 4.5 | Multimédia | manual |  | Audio description — manual playback. |
| 4.6 | Multimédia | manual |  | AD relevance — manual. |
| 4.7 | Multimédia | manual |  | Media identification — partial manual. |
| 4.8 | Multimédia | manual |  | Non-temporal media alternatives — manual. |
| 4.9 | Multimédia | manual |  | Alternative relevance — manual. |
| 4.10 | Multimédia | axe, rule | rgaa-autoplay-media, no-autoplay-audio |  |
| 4.11 | Multimédia | rule | rgaa-media-control-focus | Custom player control focusability; full keyboard playback m |
| 4.12 | Multimédia | manual |  | Non-temporal media keyboard control — manual. |
| 4.13 | Multimédia | manual |  | Media AT compatibility — manual. |
| 5.1 | Tableaux | manual |  | Complex table summary — manual. |
| 5.2 | Tableaux | manual |  | Summary relevance — manual. |
| 5.3 | Tableaux | ai |  | Layout table linearization — AI on markup. |
| 5.4 | Tableaux | axe | table-fake-caption |  |
| 5.5 | Tableaux | manual |  | Caption relevance — manual. |
| 5.6 | Tableaux | ai |  | Header declaration — AI flags td-as-header patterns. |
| 5.7 | Tableaux | axe | td-headers-attr, th-has-data-cells |  |
| 5.8 | Tableaux | rule | rgaa-layout-table-semantics |  |
| 6.1 | Liens | axe, ai | link-name, identical-links-same-purpose | Vague link text AI-assessed. |
| 6.2 | Liens | axe | link-name |  |
| 7.1 | Scripts | axe | aria-required-attr, aria-required-children |  |
| 7.2 | Scripts | manual |  | Script alternative relevance — manual. |
| 7.3 | Scripts | rule | rgaa-keyboard-accessible |  |
| 7.4 | Scripts | axe | blink, marquee |  |
| 7.5 | Scripts | rule | rgaa-status-messages | Toast/notification regions without aria-live; live SR test s |
| 8.1 | Éléments obligatoires | rule | rgaa-doctype |  |
| 8.2 | Éléments obligatoires | axe | duplicate-id-aria | Full HTML validation not automated. |
| 8.3 | Éléments obligatoires | axe | html-has-lang |  |
| 8.4 | Éléments obligatoires | axe | html-lang-valid, html-xml-lang-mismatch |  |
| 8.5 | Éléments obligatoires | axe | document-title |  |
| 8.6 | Éléments obligatoires | ai |  | Page title relevance — AI judgment. |
| 8.7 | Éléments obligatoires | axe, ai | valid-lang | Missing lang on foreign passages AI-assessed. |
| 8.8 | Éléments obligatoires | axe | valid-lang |  |
| 8.9 | Éléments obligatoires | ai |  | Presentational tag misuse — AI on markup. |
| 8.10 | Éléments obligatoires | rule | rgaa-text-direction |  |
| 9.1 | Structuration de l’information | axe, ai | heading-order, empty-heading |  |
| 9.2 | Structuration de l’information | axe | landmark-one-main, landmark-unique |  |
| 9.3 | Structuration de l’information | axe, ai | list, listitem |  |
| 9.4 | Structuration de l’information | ai |  | Citation markup — AI on markup. |
| 10.1 | Présentation de l’information | ai, rule | rgaa-presentational-html | Legacy presentational tags via rule; CSS-only checks AI. |
| 10.2 | Présentation de l’information | manual |  | CSS disabled test — manual. |
| 10.3 | Présentation de l’information | manual |  | Comprehension without CSS — manual. |
| 10.4 | Présentation de l’information | axe, rule | rgaa-text-scaling, meta-viewport, meta-viewport-large |  |
| 10.5 | Présentation de l’information | manual |  | Background/font color CSS pairing — manual. |
| 10.6 | Présentation de l’information | axe | link-in-text-block |  |
| 10.7 | Présentation de l’information | rule | rgaa-focus-visible |  |
| 10.8 | Présentation de l’information | rule | rgaa-hidden-content |  |
| 10.9 | Présentation de l’information | manual |  | Information by shape/size/position — manual. |
| 10.10 | Présentation de l’information | manual |  | Implementation of shape/size cues — manual. |
| 10.11 | Présentation de l’information | axe | css-orientation-lock |  |
| 10.12 | Présentation de l’information | rule | rgaa-text-spacing-override | CSS !important blocks text spacing override probe. |
| 10.13 | Présentation de l’information | rule | rgaa-hover-focus-overlay | Expanded aria-haspopup overlays without dismiss; full hover  |
| 10.14 | Présentation de l’information | rule | rgaa-css-interactive | Pointer-styled scripted elements without keyboard access. |
| 11.1 | Formulaires | axe | label, label-title-only |  |
| 11.2 | Formulaires | ai |  | Label relevance — AI judgment. |
| 11.3 | Formulaires | manual |  | Cross-page label consistency — multi-page. |
| 11.4 | Formulaires | manual |  | Label proximity — visual layout manual. |
| 11.5 | Formulaires | rule | rgaa-radio-grouping |  |
| 11.6 | Formulaires | rule | rgaa-fieldset-legend |  |
| 11.7 | Formulaires | manual |  | Legend relevance — manual. |
| 11.8 | Formulaires | rule | rgaa-select-optgroup | Long selects with prefix grouping but no optgroup. |
| 11.9 | Formulaires | ai |  | Button label relevance — AI judgment. |
| 11.10 | Formulaires | ai, rule | rgaa-required-indication | Required field indication rule + AI for format hints. |
| 11.11 | Formulaires | rule | rgaa-invalid-field-hint | aria-invalid fields without nearby correction hint. |
| 11.12 | Formulaires | manual |  | Reversible submissions — manual. |
| 11.13 | Formulaires | axe | autocomplete-valid |  |
| 12.1 | Navigation | manual |  | Two navigation systems — site-wide manual. |
| 12.2 | Navigation | manual |  | Consistent nav placement — multi-page. |
| 12.3 | Navigation | manual |  | Sitemap relevance — manual. |
| 12.4 | Navigation | manual |  | Sitemap access — multi-page. |
| 12.5 | Navigation | manual |  | Search engine access — multi-page. |
| 12.6 | Navigation | axe, ai | region, landmark-one-main | Landmark reachability AI-assessed. |
| 12.7 | Navigation | axe, rule | rgaa-skip-link, bypass, skip-link |  |
| 12.8 | Navigation | axe | tabindex |  |
| 12.9 | Navigation | rule | rgaa-keyboard-trap | Modal focus trap without dismiss control. |
| 12.10 | Navigation | axe | accesskeys |  |
| 12.11 | Navigation | manual |  | Keyboard reachability of tooltips — interaction test. |
| 13.1 | Consultation | axe | meta-refresh, meta-refresh-no-exceptions |  |
| 13.2 | Consultation | rule | rgaa-new-window-warning, rgaa-popup-on-load | target=_blank warning + popup-on-load script detection. |
| 13.3 | Consultation | rule | rgaa-doc-link-format | Accessible document version not verified. |
| 13.4 | Consultation | manual |  | Accessible doc equivalence — manual. |
| 13.5 | Consultation | manual |  | Cryptic content alternatives — manual. |
| 13.6 | Consultation | manual |  | Cryptic alternative relevance — manual. |
| 13.7 | Consultation | manual |  | Flash/luminance changes — manual. |
| 13.8 | Consultation | axe, rule | rgaa-moving-content, blink, marquee |  |
| 13.9 | Consultation | axe | css-orientation-lock |  |
| 13.10 | Consultation | manual |  | Complex gestures — manual/device test. |
| 13.11 | Consultation | manual |  | Pointer cancellation — manual. |
| 13.12 | Consultation | manual |  | Motion actuation alternatives — manual. |

## Architecture

```
Classic scan (automatic)
├── axe-core          → WCAG/RGAA mapped violations
└── rules/            → deterministic RGAA checks on live DOM

Deep scan (on demand)
└── AI + pruned HTML  → subjective / markup criteria
```

## Roadmap (deterministic)

Planned next checks on the rendered page:

- **12.9** keyboard trap detection (tab simulation)
- **10.12** text spacing override resistance
- **10.13** hover/focus overlay dismissibility
- **iframe** recursive audit for same-origin frames
