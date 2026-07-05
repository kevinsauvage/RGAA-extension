import { useI18n } from '@/lib/i18n/useI18n';
import { dismissOnboarding } from '@/lib/storage';

interface OnboardingBannerProps {
  hasApiKey: boolean;
  onOpenSettings: () => void;
  onDismissed: () => void;
}

export function OnboardingBanner({ hasApiKey, onOpenSettings, onDismissed }: OnboardingBannerProps) {
  const { t } = useI18n();

  const dismiss = async () => {
    await dismissOnboarding();
    onDismissed();
  };

  return (
    <section
      className="card border-brand-200 bg-brand-50/80 p-4 dark:border-brand-900 dark:bg-brand-950/30"
      aria-labelledby="onboarding-title"
    >
      <h2 id="onboarding-title" className="text-sm font-semibold text-brand-900 dark:text-brand-100">
        {t('onboarding.title')}
      </h2>
      <p className="mt-2 text-xs text-slate-600 dark:text-slate-300">{t('onboarding.body')}</p>
      {!hasApiKey && (
        <p className="mt-2 text-xs text-amber-800 dark:text-amber-200">{t('onboarding.apiKey')}</p>
      )}
      <p className="mt-1 text-xs text-slate-500">{t('onboarding.proNote')}</p>
      <p className="mt-1 text-[10px] text-slate-400">{t('onboarding.privacy')}</p>
      <div className="mt-3 flex flex-wrap gap-2">
        <button type="button" className="btn-primary text-xs" onClick={onOpenSettings}>
          {t('onboarding.openSettings')}
        </button>
        <button type="button" className="btn-ghost text-xs" onClick={() => void dismiss()}>
          {t('onboarding.dismiss')}
        </button>
      </div>
    </section>
  );
}
