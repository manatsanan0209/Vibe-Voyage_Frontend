import { useCallback } from 'react';
import { useSettings } from '@/context/SettingsContext';
import { t as translate, type SupportedLanguage } from '@/lib/i18n';

export function useI18n() {
    const { language } = useSettings();

    const t = useCallback(
        (key: string) => translate(language satisfies SupportedLanguage, key),
        [language],
    );

    return { lang: language, t };
}
