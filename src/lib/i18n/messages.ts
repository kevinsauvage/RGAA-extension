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
  summary: {
    accessibilityScore: 'A11y score',
    performanceScore: 'Perf score',
    critical: 'Critical',
    serious: 'Serious',
    moderate: 'Moderate',
    minor: 'Minor',
  },
  sections: {
    findings: 'Findings',
    coverage: 'RGAA coverage',
  },
  performance: {
    noIssues: 'No performance issues detected in this sample.',
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
    mainLabel: 'Scan results',
    rgaa: 'RGAA & Accessibility ({count})',
    performance: 'Performance ({count})',
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
    errors: {
      unknownBatch: 'this step',
      openSettings: 'Open Settings',
      technicalDetails: 'Technical details',
      pro: {
        title: 'Pro feature required',
        body: 'Enable Pro (preview) in Settings to run the AI deep scan.',
      },
      noApiKey: {
        title: 'OpenAI API key missing',
        body: 'Add your API key in Settings to run the deep scan.',
      },
      quota: {
        title: 'OpenAI quota exceeded',
        body: 'The deep scan stopped during “{batch}”. Your OpenAI account has no remaining credits or hit its usage limit.',
        hint: 'Add billing credits on OpenAI or wait for your limit to reset, then try again.',
        billing: 'OpenAI billing →',
        usage: 'View usage →',
      },
      rateLimit: {
        title: 'OpenAI rate limit reached',
        body: 'The deep scan paused during “{batch}” because too many requests were sent in a short time.',
        hint: 'Wait a minute and try again, or switch to a lighter model in Settings.',
      },
      auth: {
        title: 'Invalid OpenAI API key',
        body: 'Authentication failed during “{batch}”.',
        hint: 'Check your API key in Settings — create a new one if needed.',
      },
      model: {
        title: 'Model not available',
        body: 'The configured model could not be used during “{batch}”.',
        hint: 'Pick another model in Settings (e.g. gpt-4o-mini).',
      },
      server: {
        title: 'OpenAI service unavailable',
        body: 'OpenAI returned a server error during “{batch}”.',
        hint: 'Try again in a few minutes.',
      },
      generic: {
        title: 'Deep scan failed',
        body: 'An unexpected error occurred during “{batch}”.',
        hint: 'Check your API key and network connection, then try again.',
      },
    },
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
      'This page cannot be scanned. Use a normal website tab — not Settings, the side panel, or browser-internal pages (chrome://, edge://).',
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
  summary: {
    accessibilityScore: 'Score a11y',
    performanceScore: 'Score perf',
    critical: 'Critique',
    serious: 'Grave',
    moderate: 'Modéré',
    minor: 'Mineur',
  },
  sections: {
    findings: 'Résultats',
    coverage: 'Couverture RGAA',
  },
  performance: {
    noIssues: 'Aucun problème de performance détecté sur cet échantillon.',
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
    mainLabel: 'Résultats du scan',
    rgaa: 'RGAA & Accessibilité ({count})',
    performance: 'Performance ({count})',
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
    errors: {
      unknownBatch: 'cette étape',
      openSettings: 'Ouvrir Paramètres',
      technicalDetails: 'Détails techniques',
      pro: {
        title: 'Fonction Pro requise',
        body: 'Activez Pro (aperçu) dans Paramètres pour lancer l’analyse approfondie IA.',
      },
      noApiKey: {
        title: 'Clé API OpenAI manquante',
        body: 'Ajoutez votre clé API dans Paramètres pour lancer l’analyse approfondie.',
      },
      quota: {
        title: 'Quota OpenAI dépassé',
        body: 'L’analyse approfondie s’est arrêtée pendant « {batch} ». Votre compte OpenAI n’a plus de crédits ou a atteint sa limite d’utilisation.',
        hint: 'Ajoutez des crédits sur OpenAI ou attendez la réinitialisation du quota, puis réessayez.',
        billing: 'Facturation OpenAI →',
        usage: 'Voir l’utilisation →',
      },
      rateLimit: {
        title: 'Limite de débit OpenAI atteinte',
        body: 'L’analyse approfondie a été interrompue pendant « {batch} » : trop de requêtes en peu de temps.',
        hint: 'Attendez une minute et réessayez, ou choisissez un modèle plus léger dans Paramètres.',
      },
      auth: {
        title: 'Clé API OpenAI invalide',
        body: 'Échec d’authentification pendant « {batch} ».',
        hint: 'Vérifiez votre clé API dans Paramètres — créez-en une nouvelle si besoin.',
      },
      model: {
        title: 'Modèle indisponible',
        body: 'Le modèle configuré n’a pas pu être utilisé pendant « {batch} ».',
        hint: 'Choisissez un autre modèle dans Paramètres (ex. gpt-4o-mini).',
      },
      server: {
        title: 'Service OpenAI indisponible',
        body: 'OpenAI a renvoyé une erreur serveur pendant « {batch} ».',
        hint: 'Réessayez dans quelques minutes.',
      },
      generic: {
        title: 'Échec de l’analyse approfondie',
        body: 'Une erreur inattendue s’est produite pendant « {batch} ».',
        hint: 'Vérifiez votre clé API et votre connexion, puis réessayez.',
      },
    },
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
      'Cette page ne peut pas être auditée. Utilisez un onglet de site web normal — pas Paramètres, le panneau latéral, ni les pages internes (chrome://, edge://).',
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
