/**
 * RGAA 4.1.2 coverage map — single source of truth for how each criterion
 * is tested in A11yFix AI. Used by doc generation and runtime stats.
 *
 * Methods:
 * - axe    : axe-core on live DOM (confidence: certain)
 * - rule   : custom deterministic check in content script (confidence: likely)
 * - ai     : AI deep scan on pruned HTML (confidence: needs-review)
 * - manual : requires human auditor; not automatable on a single page
 */

export type CheckMethod = 'axe' | 'rule' | 'ai' | 'manual';

export interface CriterionCoverage {
  /** How this extension checks the criterion (can combine axe + rule + ai). */
  methods: CheckMethod[];
  /** Custom rule ids (src/content/audit/rules/). */
  rules?: string[];
  /** axe-core rule ids (src/content/audit/rgaa-mapping.ts). */
  axeRules?: string[];
  /** Short note on limitations or what remains manual. */
  note?: string;
}

/** Per-criterion coverage for all 106 RGAA 4.1.2 criteria. */
export const CRITERION_COVERAGE: Record<string, CriterionCoverage> = {
  // ── Theme 1 — Images ──────────────────────────────────────────────────────
  '1.1': {
    methods: ['axe', 'rule'],
    axeRules: [
      'image-alt',
      'input-image-alt',
      'area-alt',
      'role-img-alt',
      'svg-img-alt',
      'object-alt',
    ],
    rules: ['rgaa-svg-informative', 'rgaa-canvas-alt'],
    note: 'Informative vs decorative judgment for edge cases may need manual review.',
  },
  '1.2': {
    methods: ['axe', 'ai', 'rule'],
    axeRules: ['image-redundant-alt'],
    rules: ['rgaa-decorative-image-alt'],
    note: 'Decorative images with non-empty alt; full intent may need manual review.',
  },
  '1.3': { methods: ['ai'], note: 'Alt relevance requires semantic judgment.' },
  '1.4': { methods: ['manual'], note: 'CAPTCHA/test images — manual audit.' },
  '1.5': { methods: ['manual'], note: 'CAPTCHA alternative mechanism — manual audit.' },
  '1.6': { methods: ['ai'], note: 'Complex image descriptions — AI flags candidates.' },
  '1.7': { methods: ['manual'], note: 'Detailed description relevance — manual.' },
  '1.8': { methods: ['manual'], note: 'Text-as-image replacement — manual.' },
  '1.9': { methods: ['ai'], note: 'Figure/figcaption association — AI on markup.' },

  // ── Theme 2 — Frames ──────────────────────────────────────────────────────
  '2.1': { methods: ['axe'], axeRules: ['frame-title'] },
  '2.2': {
    methods: ['axe', 'ai'],
    axeRules: ['frame-title-unique'],
    note: 'Title relevance partially AI-assessed.',
  },

  // ── Theme 3 — Couleurs ────────────────────────────────────────────────────
  '3.1': {
    methods: ['axe', 'rule'],
    axeRules: ['link-in-text-block'],
    rules: ['rgaa-color-only-required'],
    note: 'Full “information by color only” needs manual context review.',
  },
  '3.2': { methods: ['axe'], axeRules: ['color-contrast'] },
  '3.3': { methods: ['axe'], axeRules: ['color-contrast-enhanced'] },

  // ── Theme 4 — Multimédia ──────────────────────────────────────────────────
  '4.1': {
    methods: ['axe', 'ai'],
    axeRules: ['audio-caption', 'video-caption'],
    note: 'Transcript presence AI; quality manual.',
  },
  '4.2': { methods: ['manual'], note: 'Transcript/AD relevance — manual.' },
  '4.3': {
    methods: ['rule'],
    rules: ['rgaa-video-captions'],
    note: 'Checks track[kind=captions/subtitles] presence.',
  },
  '4.4': { methods: ['manual'], note: 'Caption relevance — manual.' },
  '4.5': { methods: ['manual'], note: 'Audio description — manual playback.' },
  '4.6': { methods: ['manual'], note: 'AD relevance — manual.' },
  '4.7': {
    methods: ['rule'],
    rules: ['rgaa-media-identification'],
    note: 'object/embed/animated SVG without title or aria-label; relevance manual.',
  },
  '4.8': {
    methods: ['rule'],
    rules: ['rgaa-media-alternative'],
    note: 'Non-temporal media without text alternative; quality manual.',
  },
  '4.9': { methods: ['manual'], note: 'Alternative relevance — manual.' },
  '4.10': {
    methods: ['axe', 'rule'],
    axeRules: ['no-autoplay-audio'],
    rules: ['rgaa-autoplay-media'],
  },
  '4.11': {
    methods: ['rule'],
    rules: ['rgaa-media-control-focus'],
    note: 'Custom player control focusability; full keyboard playback manual.',
  },
  '4.12': { methods: ['manual'], note: 'Non-temporal media keyboard control — manual.' },
  '4.13': { methods: ['manual'], note: 'Media AT compatibility — manual.' },

  // ── Theme 5 — Tableaux ────────────────────────────────────────────────────
  '5.1': { methods: ['manual'], note: 'Complex table summary — manual.' },
  '5.2': { methods: ['manual'], note: 'Summary relevance — manual.' },
  '5.3': { methods: ['ai'], note: 'Layout table linearization — AI on markup.' },
  '5.4': { methods: ['axe'], axeRules: ['table-fake-caption'] },
  '5.5': { methods: ['manual'], note: 'Caption relevance — manual.' },
  '5.6': { methods: ['ai'], note: 'Header declaration — AI flags td-as-header patterns.' },
  '5.7': {
    methods: ['axe'],
    axeRules: ['td-headers-attr', 'th-has-data-cells', 'scope-attr-valid'],
  },
  '5.8': { methods: ['rule'], rules: ['rgaa-layout-table-semantics'] },

  // ── Theme 6 — Liens ───────────────────────────────────────────────────────
  '6.1': {
    methods: ['axe', 'ai'],
    axeRules: ['link-name', 'identical-links-same-purpose'],
    note: 'Vague link text AI-assessed.',
  },
  '6.2': { methods: ['axe'], axeRules: ['link-name'] },

  // ── Theme 7 — Scripts ─────────────────────────────────────────────────────
  '7.1': {
    methods: ['axe'],
    axeRules: [
      'aria-required-attr',
      'aria-required-children',
      'aria-required-parent',
      'aria-roles',
      'aria-valid-attr',
      'aria-valid-attr-value',
      'aria-allowed-attr',
      'aria-allowed-role',
      'aria-hidden-body',
      'aria-hidden-focus',
    ],
  },
  '7.2': {
    methods: ['rule'],
    rules: ['rgaa-script-widget-alt'],
    note: 'ARIA widgets without accessible name; alternative relevance manual.',
  },
  '7.3': { methods: ['rule'], rules: ['rgaa-keyboard-accessible'] },
  '7.4': { methods: ['axe'], axeRules: ['blink', 'marquee'] },
  '7.5': {
    methods: ['rule'],
    rules: ['rgaa-status-messages'],
    note: 'Toast/notification regions without aria-live; live SR test still manual.',
  },

  // ── Theme 8 — Éléments obligatoires ───────────────────────────────────────
  '8.1': { methods: ['rule'], rules: ['rgaa-doctype'] },
  '8.2': {
    methods: ['axe'],
    axeRules: ['duplicate-id-aria'],
    note: 'Full HTML validation not automated.',
  },
  '8.3': { methods: ['axe'], axeRules: ['html-has-lang'] },
  '8.4': { methods: ['axe'], axeRules: ['html-lang-valid', 'html-xml-lang-mismatch'] },
  '8.5': { methods: ['axe'], axeRules: ['document-title'] },
  '8.6': { methods: ['ai'], note: 'Page title relevance — AI judgment.' },
  '8.7': {
    methods: ['axe', 'ai'],
    axeRules: ['valid-lang'],
    note: 'Missing lang on foreign passages AI-assessed.',
  },
  '8.8': { methods: ['axe'], axeRules: ['valid-lang'] },
  '8.9': { methods: ['ai'], note: 'Presentational tag misuse — AI on markup.' },
  '8.10': { methods: ['rule'], rules: ['rgaa-text-direction'] },

  // ── Theme 9 — Structuration ───────────────────────────────────────────────
  '9.1': { methods: ['axe', 'ai'], axeRules: ['heading-order', 'empty-heading', 'p-as-heading'] },
  '9.2': { methods: ['axe'], axeRules: ['landmark-one-main', 'landmark-unique', 'region'] },
  '9.3': { methods: ['axe', 'ai'], axeRules: ['list', 'listitem', 'definition-list'] },
  '9.4': { methods: ['ai'], note: 'Citation markup — AI on markup.' },

  // ── Theme 10 — Présentation ─────────────────────────────────────────────────
  '10.1': {
    methods: ['ai', 'rule'],
    rules: ['rgaa-presentational-html'],
    note: 'Legacy presentational tags via rule; CSS-only checks AI.',
  },
  '10.2': { methods: ['manual'], note: 'CSS disabled test — manual.' },
  '10.3': { methods: ['manual'], note: 'Comprehension without CSS — manual.' },
  '10.4': {
    methods: ['axe', 'rule'],
    axeRules: ['meta-viewport', 'meta-viewport-large'],
    rules: ['rgaa-text-scaling'],
  },
  '10.5': {
    methods: ['rule'],
    rules: ['rgaa-bg-image-contrast'],
    note: 'Text on background-image with insufficient solid-bg contrast heuristic.',
  },
  '10.6': { methods: ['axe'], axeRules: ['link-in-text-block'] },
  '10.7': { methods: ['rule'], rules: ['rgaa-focus-visible'] },
  '10.8': { methods: ['rule'], rules: ['rgaa-hidden-content'] },
  '10.9': { methods: ['manual'], note: 'Information by shape/size/position — manual.' },
  '10.10': { methods: ['manual'], note: 'Implementation of shape/size cues — manual.' },
  '10.11': { methods: ['axe'], axeRules: ['css-orientation-lock'] },
  '10.12': {
    methods: ['rule'],
    rules: ['rgaa-text-spacing-override'],
    note: 'CSS !important blocks text spacing override probe.',
  },
  '10.13': {
    methods: ['rule'],
    rules: ['rgaa-hover-focus-overlay'],
    note: 'Expanded aria-haspopup overlays without dismiss; full hover test manual.',
  },
  '10.14': {
    methods: ['rule'],
    rules: ['rgaa-css-interactive'],
    note: 'Pointer-styled scripted elements without keyboard access.',
  },

  // ── Theme 11 — Formulaires ──────────────────────────────────────────────────
  '11.1': {
    methods: ['axe'],
    axeRules: [
      'label',
      'label-title-only',
      'form-field-multiple-labels',
      'select-name',
      'aria-input-field-name',
    ],
  },
  '11.2': { methods: ['ai'], note: 'Label relevance — AI judgment.' },
  '11.3': { methods: ['manual'], note: 'Cross-page label consistency — multi-page.' },
  '11.4': {
    methods: ['rule'],
    rules: ['rgaa-label-proximity'],
    note: 'Visual label near field without programmatic association.',
  },
  '11.5': { methods: ['rule'], rules: ['rgaa-radio-grouping'] },
  '11.6': { methods: ['rule'], rules: ['rgaa-fieldset-legend'] },
  '11.7': { methods: ['manual'], note: 'Legend relevance — manual.' },
  '11.8': {
    methods: ['rule'],
    rules: ['rgaa-select-optgroup'],
    note: 'Long selects with prefix grouping but no optgroup.',
  },
  '11.9': { methods: ['ai'], note: 'Button label relevance — AI judgment.' },
  '11.10': {
    methods: ['ai', 'rule'],
    rules: ['rgaa-required-indication'],
    note: 'Required field indication rule + AI for format hints.',
  },
  '11.11': {
    methods: ['rule'],
    rules: ['rgaa-invalid-field-hint'],
    note: 'aria-invalid fields without nearby correction hint.',
  },
  '11.12': { methods: ['manual'], note: 'Reversible submissions — manual.' },
  '11.13': { methods: ['axe'], axeRules: ['autocomplete-valid'] },

  // ── Theme 12 — Navigation ───────────────────────────────────────────────────
  '12.1': { methods: ['manual'], note: 'Two navigation systems — site-wide manual.' },
  '12.2': { methods: ['manual'], note: 'Consistent nav placement — multi-page.' },
  '12.3': { methods: ['manual'], note: 'Sitemap relevance — manual.' },
  '12.4': { methods: ['manual'], note: 'Sitemap access — multi-page.' },
  '12.5': { methods: ['manual'], note: 'Search engine access — multi-page.' },
  '12.6': {
    methods: ['axe', 'ai'],
    axeRules: ['region', 'landmark-one-main'],
    note: 'Landmark reachability AI-assessed.',
  },
  '12.7': {
    methods: ['axe', 'rule'],
    axeRules: ['bypass', 'skip-link'],
    rules: ['rgaa-skip-link'],
  },
  '12.8': { methods: ['axe'], axeRules: ['tabindex'] },
  '12.9': {
    methods: ['rule'],
    rules: ['rgaa-keyboard-trap'],
    note: 'Modal focus trap without dismiss control.',
  },
  '12.10': { methods: ['axe'], axeRules: ['accesskeys'] },
  '12.11': {
    methods: ['rule'],
    rules: ['rgaa-tooltip-keyboard'],
    note: 'title/aria-describedby tooltip on non-focusable element.',
  },

  // ── Theme 13 — Consultation ─────────────────────────────────────────────────
  '13.1': { methods: ['axe'], axeRules: ['meta-refresh', 'meta-refresh-no-exceptions'] },
  '13.2': {
    methods: ['rule'],
    rules: ['rgaa-new-window-warning', 'rgaa-popup-on-load'],
    note: 'target=_blank warning + popup-on-load script detection.',
  },
  '13.3': {
    methods: ['rule'],
    rules: ['rgaa-doc-link-format'],
    note: 'Accessible document version not verified.',
  },
  '13.4': { methods: ['manual'], note: 'Accessible doc equivalence — manual.' },
  '13.5': { methods: ['manual'], note: 'Cryptic content alternatives — manual.' },
  '13.6': { methods: ['manual'], note: 'Cryptic alternative relevance — manual.' },
  '13.7': {
    methods: ['rule'],
    rules: ['rgaa-flash-content'],
    note: 'CSS animation flash heuristic (≥3 cycles/s on large visible area).',
  },
  '13.8': {
    methods: ['axe', 'rule'],
    axeRules: ['blink', 'marquee'],
    rules: ['rgaa-moving-content'],
  },
  '13.9': { methods: ['axe'], axeRules: ['css-orientation-lock'] },
  '13.10': { methods: ['manual'], note: 'Complex gestures — manual/device test.' },
  '13.11': { methods: ['manual'], note: 'Pointer cancellation — manual.' },
  '13.12': { methods: ['manual'], note: 'Motion actuation alternatives — manual.' },
};

export interface CoverageStats {
  total: number;
  /** Criteria with at least axe or rule (deterministic). */
  automated: number;
  /** Criteria also or only checked by AI deep scan. */
  aiAssisted: number;
  /** Criteria with no automated or AI check. */
  manualOnly: number;
  automatedPercent: number;
  automatedPlusAiPercent: number;
  manualPercent: number;
  byTheme: Record<number, { total: number; automated: number; ai: number; manual: number }>;
}

/** @docs-only Used by `npm run docs` — not surfaced in the extension UI (see P2 coverage dashboard). */
export function computeCoverageStats(): CoverageStats {
  const ids = Object.keys(CRITERION_COVERAGE);
  let automated = 0;
  let aiAssisted = 0;
  let manualOnly = 0;
  const byTheme: CoverageStats['byTheme'] = {};

  for (const id of ids) {
    const theme = Number(id.split('.')[0]);
    const entry = CRITERION_COVERAGE[id];
    if (!byTheme[theme]) byTheme[theme] = { total: 0, automated: 0, ai: 0, manual: 0 };
    byTheme[theme].total += 1;

    const hasAutomated = entry.methods.includes('axe') || entry.methods.includes('rule');
    const hasAi = entry.methods.includes('ai');
    const isManualOnly = entry.methods.length === 1 && entry.methods[0] === 'manual';

    if (hasAutomated) {
      automated += 1;
      byTheme[theme].automated += 1;
    }
    if (hasAi) {
      aiAssisted += 1;
      byTheme[theme].ai += 1;
    }
    if (isManualOnly) {
      manualOnly += 1;
      byTheme[theme].manual += 1;
    }
  }

  const total = ids.length;
  const automatedOrAi = ids.filter((id) => {
    const m = CRITERION_COVERAGE[id].methods;
    return m.includes('axe') || m.includes('rule') || m.includes('ai');
  }).length;

  return {
    total,
    automated,
    aiAssisted,
    manualOnly,
    automatedPercent: Math.round((automated / total) * 1000) / 10,
    automatedPlusAiPercent: Math.round((automatedOrAi / total) * 1000) / 10,
    manualPercent: Math.round((manualOnly / total) * 1000) / 10,
    byTheme,
  };
}

/** Rule ids declared in coverage — useful for validating rule registration. */
export function allDeclaredRuleIds(): string[] {
  const ids = new Set<string>();
  for (const entry of Object.values(CRITERION_COVERAGE)) {
    entry.rules?.forEach((id) => ids.add(id));
  }
  return [...ids].sort();
}
