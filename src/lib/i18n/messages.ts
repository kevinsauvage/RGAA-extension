export type Language = 'fr' | 'en';

type MessageValue = string | { [key: string]: MessageValue };
type MessageTree = Record<string, MessageValue>;

const en = {
  app: {
    title: 'A11yFix AI',
    subtitle: 'Accessibility & Performance Copilot',
    settings: 'Settings',
    proUnlimited: 'Pro · unlimited scans',
    scansLeft: '{remaining}/{limit} scans left',
  },
  scan: {
    scanPage: 'Scan this page',
    scanning: 'Scanning…',
    deepScan: 'Deep scan',
    deepScanTitle:
      'Full-page AI analysis against the RGAA criteria list — findings need manual review',
    noPage: 'No page selected',
    readyTitle: 'Ready to audit',
    readyBody:
      'Run a real-time RGAA/WCAG accessibility and Core Web Vitals scan, then use Deep scan for AI-assisted RGAA review.',
    openPanel: 'Open A11yFix panel',
    history: 'Recent scans',
    noHistory: 'No scans yet.',
    score: 'Score {score}',
  },
  tabs: {
    accessibility: 'Accessibility',
    performance: 'Perf',
    coverage: 'RGAA coverage',
  },
  export: {
    label: 'Export',
    pdf: 'PDF report',
    json: 'JSON data',
    csv: 'CSV issues',
    proRequired: 'Pro feature — enable in Settings',
  },
  filters: {
    all: 'All ({count})',
    auto: 'Automated ({count})',
    ai: 'AI ({count})',
  },
  issues: {
    noneAuto: 'No automated violations found. Run Deep scan for AI-assisted RGAA review.',
    noneFilter: 'No issues match this filter.',
    impact: 'Impact:',
    elements: '{count} element(s)',
    refDoc: 'Reference documentation →',
    scrollHint: 'Click to scroll →',
    review: 'Review',
  },
  deepScan: {
    complete:
      'Deep scan complete — {found} finding(s) to review across {criteria} RGAA criteria{rejected}.',
    rejectedSuffix: ' ({count} unverified AI suggestion(s) dropped)',
    proRequired: 'Deep scan, AI fixes, and PDF export require Pro (preview) in Settings.',
    quotaBlocked: 'Monthly free scan limit reached — enable Pro (preview) in Settings for unlimited scans.',
    noApiKey: 'Add an OpenAI API key in Settings to run the deep scan.',
  },
  coverage: {
    title: 'RGAA 4.1.2 coverage',
    summary: '{automated}% deterministic · {withAi}% with AI · {manual}% manual only',
    theme: 'Theme {num} — {name}',
    automated: 'Automated',
    aiAlso: '+ AI',
    manual: 'Manual',
    criteriaInScan: '{count} criteria with findings in this scan',
    viewCriterion: 'View criterion details',
    methods: {
      axe: 'axe-core (certain)',
      rule: 'Deterministic rule (likely)',
      ai: 'AI deep scan (needs review)',
      manual: 'Manual audit',
    },
    officialTests: 'Official tests',
    limitation: 'Limitation',
    openRgaa: 'Open on accessibilite.numerique.gouv.fr →',
  },
  onboarding: {
    title: 'Welcome to A11yFix AI',
    body: 'Scan pages for RGAA/WCAG issues, optionally run an AI deep scan with your own OpenAI key, and export reports. Free tier: 10 scans/month.',
    apiKey: 'Add your OpenAI API key in Settings to unlock AI fixes and deep scan.',
    proNote: 'Pro (preview) unlocks unlimited scans, deep scan, AI fixes, and PDF export.',
    privacy: 'Your API key stays in the browser — see Settings for details.',
    dismiss: 'Got it',
    openSettings: 'Open Settings',
  },
  popup: {
    cantScan: 'This page can’t be scanned.',
    apiKeyHint: 'Add an OpenAI API key in settings to unlock AI fixes.',
  },
  errors: {
    protectedPage:
      'This page cannot be scanned. Browser-internal pages (chrome://, edge://), the Web Store, and PDF viewer tabs are not supported.',
    noTab: 'No active tab found. Focus a normal web page and try again.',
    quota: 'Free tier limit reached ({limit} scans this month). Enable Pro in Settings for unlimited scans.',
    injection:
      'Could not inject the audit script on this page. Try refreshing the tab, or check if an extension is blocking content scripts.',
    worker:
      'Unable to reach the extension background worker. Reload the extension from chrome://extensions and try again.',
    generic: 'Scan failed: {message}',
    pdfPro: 'PDF export is a Pro feature. Enable Pro (preview) in Settings.',
    deepScanPro: 'The AI deep scan is a Pro feature. Enable Pro (preview) in Settings.',
  },
} as const satisfies MessageTree;

const fr: MessageTree = {
  app: {
    title: 'A11yFix AI',
    subtitle: 'Copilote accessibilité & performance',
    settings: 'Paramètres',
    proUnlimited: 'Pro · scans illimités',
    scansLeft: '{remaining}/{limit} scans restants',
  },
  scan: {
    scanPage: 'Auditer cette page',
    scanning: 'Analyse…',
    deepScan: 'Analyse approfondie',
    deepScanTitle:
      'Analyse IA de la page complète selon les critères RGAA — résultats à valider manuellement',
    noPage: 'Aucune page sélectionnée',
    readyTitle: 'Prêt à auditer',
    readyBody:
      'Lancez un audit RGAA/WCAG et Core Web Vitals en temps réel, puis l’analyse approfondie IA pour une revue RGAA assistée.',
    openPanel: 'Ouvrir le panneau A11yFix',
    history: 'Scans récents',
    noHistory: 'Aucun scan pour l’instant.',
    score: 'Score {score}',
  },
  tabs: {
    accessibility: 'Accessibilité',
    performance: 'Perf',
    coverage: 'Couverture RGAA',
  },
  export: {
    label: 'Exporter',
    pdf: 'Rapport PDF',
    json: 'Données JSON',
    csv: 'Issues CSV',
    proRequired: 'Fonction Pro — activer dans Paramètres',
  },
  filters: {
    all: 'Tout ({count})',
    auto: 'Automatisé ({count})',
    ai: 'IA ({count})',
  },
  issues: {
    noneAuto: 'Aucune violation automatisée. Lancez l’analyse approfondie pour une revue RGAA assistée par IA.',
    noneFilter: 'Aucun problème ne correspond à ce filtre.',
    impact: 'Impact :',
    elements: '{count} élément(s)',
    refDoc: 'Documentation de référence →',
    scrollHint: 'Cliquer pour faire défiler →',
    review: 'À vérifier',
  },
  deepScan: {
    complete:
      'Analyse approfondie terminée — {found} résultat(s) à vérifier sur {criteria} critères RGAA{rejected}.',
    rejectedSuffix: ' ({count} suggestion(s) IA non vérifiée(s) ignorée(s))',
    proRequired:
      'Analyse approfondie, corrections IA et export PDF nécessitent Pro (aperçu) dans Paramètres.',
    quotaBlocked:
      'Limite mensuelle gratuite atteinte — activez Pro (aperçu) dans Paramètres pour des scans illimités.',
    noApiKey: 'Ajoutez une clé API OpenAI dans Paramètres pour lancer l’analyse approfondie.',
  },
  coverage: {
    title: 'Couverture RGAA 4.1.2',
    summary: '{automated} % déterministe · {withAi} % avec IA · {manual} % manuel seul',
    theme: 'Thème {num} — {name}',
    automated: 'Automatisé',
    aiAlso: '+ IA',
    manual: 'Manuel',
    criteriaInScan: '{count} critère(s) avec résultats dans ce scan',
    viewCriterion: 'Voir le détail du critère',
    methods: {
      axe: 'axe-core (certain)',
      rule: 'Règle déterministe (probable)',
      ai: 'Analyse IA (à vérifier)',
      manual: 'Audit manuel',
    },
    officialTests: 'Tests officiels',
    limitation: 'Limite',
    openRgaa: 'Ouvrir sur accessibilite.numerique.gouv.fr →',
  },
  onboarding: {
    title: 'Bienvenue sur A11yFix AI',
    body: 'Auditez vos pages RGAA/WCAG, lancez une analyse IA approfondie avec votre clé OpenAI, exportez des rapports. Gratuit : 10 scans/mois.',
    apiKey: 'Ajoutez votre clé OpenAI dans Paramètres pour les corrections IA et l’analyse approfondie.',
    proNote: 'Pro (aperçu) : scans illimités, analyse approfondie, corrections IA et export PDF.',
    privacy: 'Votre clé API reste dans le navigateur — voir Paramètres.',
    dismiss: 'Compris',
    openSettings: 'Ouvrir Paramètres',
  },
  popup: {
    cantScan: 'Cette page ne peut pas être auditée.',
    apiKeyHint: 'Ajoutez une clé OpenAI dans les paramètres pour les corrections IA.',
  },
  errors: {
    protectedPage:
      'Cette page ne peut pas être auditée. Les pages internes (chrome://, edge://), le Web Store et les PDF ne sont pas pris en charge.',
    noTab: 'Aucun onglet actif. Focus sur une page web normale et réessayez.',
    quota:
      'Limite gratuite atteinte ({limit} scans ce mois-ci). Activez Pro dans Paramètres pour des scans illimités.',
    injection:
      'Impossible d’injecter le script d’audit. Actualisez l’onglet ou vérifiez qu’une extension ne bloque pas les content scripts.',
    worker:
      'Impossible de joindre le service worker. Rechargez l’extension depuis chrome://extensions.',
    generic: 'Échec du scan : {message}',
    pdfPro: 'L’export PDF est une fonction Pro. Activez Pro (aperçu) dans Paramètres.',
    deepScanPro: 'L’analyse approfondie IA est une fonction Pro. Activez Pro (aperçu) dans Paramètres.',
  },
};

export const messages: Record<Language, MessageTree> = { en, fr };

function getNested(tree: MessageTree, path: string): string | undefined {
  const value = path.split('.').reduce<string | MessageTree | undefined>((node, key) => {
    if (typeof node === 'string' || node === undefined) return node;
    return node[key];
  }, tree);
  return typeof value === 'string' ? value : undefined;
}

/** Resolve a dot-path message key with optional `{var}` interpolation. */
export function t(
  lang: Language,
  key: string,
  vars?: Record<string, string | number>,
): string {
  const raw = getNested(messages[lang], key) ?? getNested(messages.en, key) ?? key;
  if (!vars) return raw;
  return raw.replace(/\{(\w+)\}/g, (_, name: string) => String(vars[name] ?? `{${name}}`));
}
