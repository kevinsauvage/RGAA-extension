import { useI18n } from '@/lib/i18n/useI18n';

export type MainTab = 'rgaa' | 'performance';

export function MainTabBar({
  active,
  accessibilityCount,
  performanceCount,
  onChange,
}: {
  active: MainTab;
  accessibilityCount: number;
  performanceCount: number;
  onChange: (tab: MainTab) => void;
}) {
  const { t } = useI18n();

  return (
    <div
      className="flex gap-1 rounded-lg bg-slate-100 p-1 dark:bg-slate-800"
      role="tablist"
      aria-label={t('tabs.mainLabel')}
    >
      <TabButton
        active={active === 'rgaa'}
        onClick={() => onChange('rgaa')}
        label={t('tabs.rgaa', { count: accessibilityCount })}
        panelId="rgaa-panel"
      />
      <TabButton
        active={active === 'performance'}
        onClick={() => onChange('performance')}
        label={t('tabs.performance', { count: performanceCount })}
        panelId="performance-panel"
      />
    </div>
  );
}

function TabButton({
  active,
  onClick,
  label,
  panelId,
}: {
  active: boolean;
  onClick: () => void;
  label: string;
  panelId: string;
}) {
  return (
    <button
      type="button"
      role="tab"
      id={`${panelId}-tab`}
      aria-selected={active}
      aria-controls={panelId}
      onClick={onClick}
      className={`flex-1 rounded-md px-3 py-2 text-xs font-medium transition-colors ${
        active
          ? 'bg-white text-brand-700 shadow-sm dark:bg-slate-700 dark:text-white'
          : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
      }`}
    >
      {label}
    </button>
  );
}
