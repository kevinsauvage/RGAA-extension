import { useCallback } from 'react';
import { usePanelStore } from '@/sidepanel/store';
import { t, type Language } from './messages';

/** Side panel hook — reads language from Zustand store. */
export function useI18n() {
  const language = usePanelStore((s) => s.language);

  const translate = useCallback(
    (key: string, vars?: Record<string, string | number>) => t(language, key, vars),
    [language],
  );

  return { language, t: translate };
}

/** For popup/options without panel store — pass language explicitly. */
export function useTranslate(lang: Language) {
  return useCallback((key: string, vars?: Record<string, string | number>) => t(lang, key, vars), [lang]);
}
