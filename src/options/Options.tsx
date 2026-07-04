import { useEffect, useMemo, useState } from 'react';
import {
  DEFAULT_SETTINGS,
  getSettings,
  getUsage,
  saveSettings,
  type Settings,
} from '@/lib/storage';
import { FREE_TIER_MONTHLY_SCANS } from '@/lib/scan-limits';
import {
  MODEL_GROUPS,
  OPENAI_MODELS,
  modelsByGroup,
  resolveModelOption,
  type ModelGroup,
} from '@/lib/ai/models';

const MODEL_GROUP_ORDER: ModelGroup[] = ['gpt-5', 'gpt-4'];

export function Options() {
  const [settings, setSettings] = useState<Settings>(DEFAULT_SETTINGS);
  const [usage, setUsage] = useState(0);
  const [saved, setSaved] = useState(false);
  const [showKey, setShowKey] = useState(false);

  useEffect(() => {
    void (async () => {
      setSettings(await getSettings());
      setUsage((await getUsage()).scans);
    })();
  }, []);

  const update = <K extends keyof Settings>(key: K, value: Settings[K]) => {
    setSettings((prev) => ({ ...prev, [key]: value }));
    setSaved(false);
  };

  const save = async () => {
    await saveSettings(settings);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const selectedModel = useMemo(
    () => resolveModelOption(settings.model),
    [settings.model],
  );

  const showCustomModel =
    !OPENAI_MODELS.some((model) => model.id === settings.model);

  return (
    <div className="mx-auto min-h-screen max-w-2xl px-6 py-10">
      <header className="mb-8 flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-600 text-lg font-bold text-white">
          A
        </div>
        <div>
          <h1 className="text-xl font-bold">A11yFix AI — Settings</h1>
          <p className="text-sm text-slate-500">
            Configure the AI copilot and your plan.
          </p>
        </div>
      </header>

      <section className="card mb-6 space-y-4 p-5">
        <h2 className="text-sm font-semibold">AI copilot</h2>

        <label className="block">
          <span className="mb-1 block text-xs font-medium text-slate-600 dark:text-slate-300">
            OpenAI API key
          </span>
          <div className="flex gap-2">
            <input
              type={showKey ? 'text' : 'password'}
              value={settings.openaiApiKey}
              onChange={(e) => update('openaiApiKey', e.target.value)}
              placeholder="sk-…"
              className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 font-mono text-sm dark:border-slate-700 dark:bg-slate-800"
            />
            <button
              type="button"
              className="btn-ghost text-xs"
              onClick={() => setShowKey((v) => !v)}
            >
              {showKey ? 'Hide' : 'Show'}
            </button>
          </div>
          <span className="mt-1 block text-[11px] text-slate-400">
            Stored locally in this browser only. Used to call OpenAI directly for
            AI fixes and AI checks.
          </span>
        </label>

        <label className="block">
          <span className="mb-1 block text-xs font-medium text-slate-600 dark:text-slate-300">
            Model
          </span>
          <select
            value={settings.model}
            onChange={(e) => update('model', e.target.value)}
            className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-800"
          >
            {MODEL_GROUP_ORDER.map((group) => (
              <optgroup key={group} label={MODEL_GROUPS[group]}>
                {modelsByGroup(group).map((model) => (
                  <option key={model.id} value={model.id}>
                    {model.label}
                    {model.recommended ? ' · recommended' : ''}
                  </option>
                ))}
              </optgroup>
            ))}
            {showCustomModel && (
              <option value={settings.model}>{settings.model} (custom)</option>
            )}
          </select>
          <span className="mt-1 block text-[11px] text-slate-400">
            {selectedModel.hint}
          </span>
        </label>

        <label className="block">
          <span className="mb-1 block text-xs font-medium text-slate-600 dark:text-slate-300">
            Fix explanation language
          </span>
          <select
            value={settings.language}
            onChange={(e) => update('language', e.target.value as Settings['language'])}
            className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-800"
          >
            <option value="fr">Français</option>
            <option value="en">English</option>
          </select>
        </label>
      </section>

      <section className="card mb-6 space-y-3 p-5">
        <h2 className="text-sm font-semibold">Plan</h2>
        <div className="flex gap-3">
          {(['free', 'pro'] as const).map((plan) => (
            <button
              key={plan}
              type="button"
              onClick={() => update('plan', plan)}
              className={`flex-1 rounded-lg border p-4 text-left transition-colors ${
                settings.plan === plan
                  ? 'border-brand-500 bg-brand-50 dark:bg-brand-950/30'
                  : 'border-slate-200 dark:border-slate-700'
              }`}
            >
              <div className="text-sm font-semibold capitalize">{plan}</div>
              <div className="text-xs text-slate-500">
                {plan === 'free'
                  ? `${FREE_TIER_MONTHLY_SCANS} scans/month`
                  : 'Unlimited scans, AI fixes, PDF export — $12/mo'}
              </div>
            </button>
          ))}
        </div>
        <p className="text-[11px] text-slate-400">
          {settings.plan === 'free'
            ? `${usage}/${FREE_TIER_MONTHLY_SCANS} scans used this month.`
            : 'Pro plan active.'}
        </p>
      </section>

      <div className="flex items-center gap-3">
        <button type="button" className="btn-primary" onClick={save}>
          Save settings
        </button>
        {saved && <span className="text-sm text-lime-600">Saved ✓</span>}
      </div>
    </div>
  );
}
