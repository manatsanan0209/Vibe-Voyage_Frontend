import {
    createContext,
    useCallback,
    useContext,
    useEffect,
    useState,
    type ReactNode,
} from 'react';
import { format, isValid, parseISO } from 'date-fns';
import { useAuth } from './AuthContext';
import {
    settingsService,
    type UpdateSettingsRequest,
    type UserSettings,
} from '@/services/settings.service';

// ─── Theme helpers ────────────────────────────────────────────────────────────

const THEME_CACHE_KEY = 'vv_theme';
const LANGUAGE_CACHE_KEY = 'vv_language';

type Theme = UserSettings['theme'];
type Language = UserSettings['language'];

function applyThemeToDOM(theme: Theme) {
    const root = document.documentElement;
    if (theme === 'dark') {
        root.classList.add('dark');
    } else if (theme === 'light') {
        root.classList.remove('dark');
    } else {
        // system — follow OS preference
        const prefersDark = window.matchMedia(
            '(prefers-color-scheme: dark)',
        ).matches;
        root.classList.toggle('dark', prefersDark);
    }
    localStorage.setItem(THEME_CACHE_KEY, theme);
}

function applyLanguageToDOM(language: Language) {
    document.documentElement.lang = language;
    localStorage.setItem(LANGUAGE_CACHE_KEY, language);
}

// Apply cached theme immediately on module load to prevent FOUC
const _cached = localStorage.getItem(THEME_CACHE_KEY) as Theme | null;
if (_cached) applyThemeToDOM(_cached);

// Apply cached language immediately on module load
const _cachedLanguage = localStorage.getItem(
    LANGUAGE_CACHE_KEY,
) as Language | null;
if (_cachedLanguage) applyLanguageToDOM(_cachedLanguage);

// ─── Defaults ─────────────────────────────────────────────────────────────────

const DEFAULT_DATE_FORMAT: UserSettings['date_format'] = 'DD/MM/YYYY';
const DEFAULT_TIME_FORMAT: UserSettings['time_format'] = '24h';

function coerceToValidDate(value: Date | string): Date | null {
    if (value instanceof Date) {
        return isValid(value) ? value : null;
    }

    const raw = String(value).trim();
    if (!raw) return null;

    // Time-only (e.g. "08:30")
    if (/^\d{1,2}:\d{2}$/.test(raw)) {
        const [hh, mm] = raw.split(':').map((v) => Number(v));
        if (!Number.isFinite(hh) || !Number.isFinite(mm)) return null;
        const d = new Date();
        d.setHours(hh, mm, 0, 0);
        return isValid(d) ? d : null;
    }

    // Date-only (e.g. "2026-04-27") — construct local date to avoid TZ shifts
    if (/^\d{4}-\d{2}-\d{2}$/.test(raw)) {
        const [yyyy, mm, dd] = raw.split('-').map((v) => Number(v));
        if (
            !Number.isFinite(yyyy) ||
            !Number.isFinite(mm) ||
            !Number.isFinite(dd)
        ) {
            return null;
        }
        const d = new Date(yyyy, mm - 1, dd, 0, 0, 0, 0);
        return isValid(d) ? d : null;
    }

    // ISO-ish strings
    const iso = parseISO(raw);
    if (isValid(iso)) return iso;

    // Fallback
    const d = new Date(raw);
    return isValid(d) ? d : null;
}

// ─── Context type ─────────────────────────────────────────────────────────────

export interface SettingsContextValue {
    settings: UserSettings | null;
    language: Language;
    loading: boolean;
    saving: boolean;
    /** Apply a change locally and immediately (e.g. theme toggle shows live). */
    updateLocal(patch: Partial<UserSettings>): void;
    /** Persist current settings to the API. Throws on failure. */
    saveSettings(): Promise<void>;
    /** Format a date using the user's preferred date_format. */
    formatDate(date: Date | string): string;
    /** Format a time using the user's preferred time_format. */
    formatTime(date: Date | string): string;
}

const SettingsContext = createContext<SettingsContextValue | null>(null);

// ─── Provider ─────────────────────────────────────────────────────────────────

export function SettingsProvider({ children }: { children: ReactNode }) {
    const { isAuthenticated } = useAuth();
    const [settings, setSettings] = useState<UserSettings | null>(null);
    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);
    const [languageFallback, setLanguageFallback] = useState<Language>(
        _cachedLanguage ?? 'en',
    );

    // Fetch settings when the user logs in
    useEffect(() => {
        if (!isAuthenticated) return;

        let active = true;
        setLoading(true);

        settingsService
            .getSettings()
            .then((data) => {
                if (!active) return;
                setSettings(data);
                applyThemeToDOM(data.theme);
                applyLanguageToDOM(data.language);
                setLanguageFallback(data.language);
            })
            .catch(() => {
                // Non-fatal: keep cached theme, use defaults
            })
            .finally(() => {
                if (!active) return;
                setLoading(false);
            });

        return () => {
            active = false;
        };
    }, [isAuthenticated]);

    // Re-apply theme whenever it changes (covers live preview while editing)
    useEffect(() => {
        if (settings?.theme) applyThemeToDOM(settings.theme);
    }, [settings?.theme]);

    // Re-apply language whenever it changes
    useEffect(() => {
        if (!settings?.language) return;
        applyLanguageToDOM(settings.language);
        setLanguageFallback(settings.language);
    }, [settings?.language]);

    // Keep OS preference in sync while theme === 'system'
    useEffect(() => {
        if (settings?.theme !== 'system') return;

        const mq = window.matchMedia('(prefers-color-scheme: dark)');
        const handler = (e: MediaQueryListEvent) => {
            document.documentElement.classList.toggle('dark', e.matches);
        };
        mq.addEventListener('change', handler);
        return () => mq.removeEventListener('change', handler);
    }, [settings?.theme]);

    const updateLocal = useCallback((patch: Partial<UserSettings>) => {
        if (patch.language) {
            applyLanguageToDOM(patch.language);
            setLanguageFallback(patch.language);
        }
        setSettings((prev) => (prev ? { ...prev, ...patch } : prev));
    }, []);

    const saveSettings = useCallback(async () => {
        if (!settings) return;
        setSaving(true);
        try {
            const { settings_id, ...payload } = settings;
            void settings_id;
            const updated = await settingsService.updateSettings(
                payload as UpdateSettingsRequest,
            );
            setSettings(updated);
        } finally {
            setSaving(false);
        }
    }, [settings]);

    function formatDate(date: Date | string): string {
        const d = coerceToValidDate(date);
        if (!d) return typeof date === 'string' ? date : '';
        const fmt = settings?.date_format ?? DEFAULT_DATE_FORMAT;
        // date-fns uses 'dd' for day of month, 'MM' for month, 'yyyy' for year
        return format(d, fmt.replace('DD', 'dd').replace('YYYY', 'yyyy'));
    }

    function formatTime(date: Date | string): string {
        const d = coerceToValidDate(date);
        if (!d) return typeof date === 'string' ? date : '';
        const is24h = (settings?.time_format ?? DEFAULT_TIME_FORMAT) === '24h';
        return format(d, is24h ? 'HH:mm' : 'hh:mm a');
    }

    return (
        <SettingsContext.Provider
            value={{
                settings,
                language: settings?.language ?? languageFallback,
                loading,
                saving,
                updateLocal,
                saveSettings,
                formatDate,
                formatTime,
            }}
        >
            {children}
        </SettingsContext.Provider>
    );
}

export function useSettings(): SettingsContextValue {
    const ctx = useContext(SettingsContext);
    if (!ctx)
        throw new Error('useSettings must be used inside <SettingsProvider>');
    return ctx;
}
