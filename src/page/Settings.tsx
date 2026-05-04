import { useState, type ReactNode } from 'react';
import {
    Loader2,
    Monitor,
    Sun,
    Moon,
    Globe,
    Calendar,
    Clock,
    Bell,
    CheckCircle2,
    XCircle,
    Users,
    LogOut,
    Plane,
    Activity,
    MapPin,
} from 'lucide-react';
import { toast } from 'sonner';
import { useBlocker } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { useSettings } from '@/context/SettingsContext';
import { useI18n } from '@/hooks/useI18n';
import type { UserSettings } from '@/services/settings.service';

// ─── Toggle Switch ────────────────────────────────────────────────────────────

function Toggle({
    checked,
    onChange,
    disabled,
}: {
    checked: boolean;
    onChange: (v: boolean) => void;
    disabled?: boolean;
}) {
    return (
        <button
            type="button"
            role="switch"
            aria-checked={checked}
            disabled={disabled}
            onClick={() => onChange(!checked)}
            className={cn(
                'relative inline-flex h-6 w-11 shrink-0 cursor-pointer items-center rounded-full transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50',
                checked ? 'bg-primary' : 'bg-gray-200',
            )}
        >
            <span
                className={cn(
                    'pointer-events-none inline-block size-5 rounded-full bg-white shadow-sm ring-0 transition-transform duration-200',
                    checked ? 'translate-x-5' : 'translate-x-0.5',
                )}
            />
        </button>
    );
}

// ─── Setting Row ──────────────────────────────────────────────────────────────

function SettingRow({
    label,
    description,
    children,
}: {
    label: string;
    description?: string;
    children: ReactNode;
}) {
    return (
        <div className="flex items-center justify-between gap-4 py-4">
            <div className="min-w-0 flex-1">
                <p className="text-sm font-medium text-gray-900 dark:text-slate-100">
                    {label}
                </p>
                {description && (
                    <p className="mt-0.5 text-xs text-gray-500 dark:text-slate-400">
                        {description}
                    </p>
                )}
            </div>
            <div className="shrink-0">{children}</div>
        </div>
    );
}

// ─── Section Card ─────────────────────────────────────────────────────────────

function SectionCard({
    icon,
    title,
    children,
}: {
    icon: ReactNode;
    title: string;
    children: ReactNode;
}) {
    return (
        <section className="rounded-2xl border border-border bg-white px-6 py-5">
            <div className="mb-1 flex items-center gap-2">
                <span className="text-muted-foreground">{icon}</span>
                <h2 className="text-base font-semibold text-primary">
                    {title}
                </h2>
            </div>
            <div className="divide-y divide-muted">{children}</div>
        </section>
    );
}

// ─── Skeleton Loading ─────────────────────────────────────────────────────────

function SettingsSkeleton() {
    return (
        <div className="flex flex-col gap-6">
            {[1, 2].map((i) => (
                <div
                    key={i}
                    className="rounded-2xl border border-border bg-white px-6 py-5"
                >
                    <Skeleton className="mb-4 h-5 w-40" />
                    {[1, 2, 3, 4].map((j) => (
                        <div
                            key={j}
                            className="flex items-center justify-between py-4"
                        >
                            <div className="flex flex-col gap-1.5">
                                <Skeleton className="h-4 w-32" />
                                <Skeleton className="h-3 w-48" />
                            </div>
                            <Skeleton className="h-9 w-28 rounded-md" />
                        </div>
                    ))}
                </div>
            ))}
        </div>
    );
}

// ─── Live Date/Time Preview ───────────────────────────────────────────────────

function FormatPreview({ label }: { label: string }) {
    const { formatDate, formatTime } = useSettings();
    const now = new Date();
    return (
        <div className="flex items-center gap-2 pt-2 pb-3">
            <span className="text-xs text-gray-400 dark:text-slate-500">
                {label}:
            </span>
            <span className="rounded-md bg-muted px-2 py-1 font-mono text-xs text-primary">
                {formatDate(now)} · {formatTime(now)}
            </span>
        </div>
    );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function Settings() {
    const { settings, loading, saving, updateLocal, saveSettings } =
        useSettings();
    const { t } = useI18n();
    const [isDirty, setIsDirty] = useState(false);

    const blocker = useBlocker(isDirty);

    async function handleSave() {
        try {
            await saveSettings();
            setIsDirty(false);
            toast.success(t('settings.saveSuccess'), {
                icon: <CheckCircle2 className="size-4" />,
            });
        } catch {
            toast.error(t('settings.saveFail'), {
                icon: <XCircle className="size-4" />,
            });
        }
    }

    async function handleSaveAndLeave() {
        try {
            await saveSettings();
            setIsDirty(false);
            blocker.proceed?.();
        } catch {
            toast.error(t('settings.saveFail'), {
                icon: <XCircle className="size-4" />,
            });
            blocker.reset?.();
        }
    }

    function set<K extends keyof UserSettings>(key: K, value: UserSettings[K]) {
        updateLocal({ [key]: value });
        setIsDirty(true);
    }

    return (
        <>
        <Dialog open={blocker.state === 'blocked'} onOpenChange={() => blocker.reset?.()}>
            <DialogContent className="sm:max-w-sm">
                <DialogHeader>
                    <DialogTitle>{t('settings.unsavedDialog.title')}</DialogTitle>
                    <DialogDescription>
                        {t('settings.unsavedDialog.message')}
                    </DialogDescription>
                </DialogHeader>
                <DialogFooter className="flex-col gap-2 sm:flex-row">
                    <Button variant="outline" onClick={() => blocker.reset?.()}>
                        {t('settings.unsavedDialog.cancel')}
                    </Button>
                    <Button variant="ghost" onClick={() => blocker.proceed?.()}>
                        {t('settings.unsavedDialog.discard')}
                    </Button>
                    <Button onClick={handleSaveAndLeave} disabled={saving}>
                        {saving ? (
                            <Loader2 className="mr-2 size-4 animate-spin" />
                        ) : null}
                        {t('settings.unsavedDialog.save')}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
        <main className="flex flex-col gap-6 sm:gap-8 px-4 sm:px-8 pb-12">
            <div className="w-full rounded-4xl bg-muted px-4 sm:px-8 py-6 sm:py-8">
                <h1 className="mb-6 text-2xl font-bold text-primary">
                    {t('settings.title')}
                </h1>

                {loading && <SettingsSkeleton />}

                {!loading && !settings && (
                    <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-8 text-center text-sm text-red-600">
                        {t('settings.loadFail')}
                    </div>
                )}

                {!loading && settings && (
                    <div className="flex flex-col gap-6">
                        {/* ── Appearance ──────────────────────────── */}
                        <SectionCard
                            icon={<Monitor className="size-5" />}
                            title={t('settings.appearance')}
                        >
                            {/* Theme */}
                            <SettingRow
                                label={t('settings.theme')}
                                description={t('settings.themeDesc')}
                            >
                                <Select
                                    value={settings.theme}
                                    onValueChange={(v) =>
                                        set('theme', v as UserSettings['theme'])
                                    }
                                >
                                    <SelectTrigger className="w-44 border-border">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="light">
                                            <span className="flex items-center gap-2">
                                                <Sun className="size-4" />
                                                {t('settings.themeLight')}
                                            </span>
                                        </SelectItem>
                                        <SelectItem value="dark">
                                            <span className="flex items-center gap-2">
                                                <Moon className="size-4" />
                                                {t('settings.themeDark')}
                                            </span>
                                        </SelectItem>
                                        <SelectItem value="system">
                                            <span className="flex items-center gap-2">
                                                <Monitor className="size-4" />
                                                {t('settings.themeSystem')}
                                            </span>
                                        </SelectItem>
                                    </SelectContent>
                                </Select>
                            </SettingRow>

                            {/* Language */}
                            <SettingRow
                                label={t('settings.language')}
                                description={t('settings.languageDesc')}
                            >
                                <Select
                                    value={settings.language}
                                    onValueChange={(v) =>
                                        set(
                                            'language',
                                            v as UserSettings['language'],
                                        )
                                    }
                                >
                                    <SelectTrigger className="w-36 border-border">
                                        <span className="flex items-center gap-2">
                                            <Globe className="size-4" />
                                            <SelectValue />
                                        </span>
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="en">
                                            {t('settings.languageOptionEn')}
                                        </SelectItem>
                                        <SelectItem value="th">
                                            {t('settings.languageOptionTh')}
                                        </SelectItem>
                                    </SelectContent>
                                </Select>
                            </SettingRow>

                            {/* Date Format */}
                            <SettingRow
                                label={t('settings.dateFormat')}
                                description={t('settings.dateFormatDesc')}
                            >
                                <Select
                                    value={settings.date_format}
                                    onValueChange={(v) =>
                                        set(
                                            'date_format',
                                            v as UserSettings['date_format'],
                                        )
                                    }
                                >
                                    <SelectTrigger className="w-40 border-border">
                                        <span className="flex items-center gap-2">
                                            <Calendar className="size-4" />
                                            <SelectValue />
                                        </span>
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="DD/MM/YYYY">
                                            DD/MM/YYYY
                                        </SelectItem>
                                        <SelectItem value="MM/DD/YYYY">
                                            MM/DD/YYYY
                                        </SelectItem>
                                        <SelectItem value="YYYY-MM-DD">
                                            YYYY-MM-DD
                                        </SelectItem>
                                    </SelectContent>
                                </Select>
                            </SettingRow>

                            {/* Time Format */}
                            <SettingRow
                                label={t('settings.timeFormat')}
                                description={t('settings.timeFormatDesc')}
                            >
                                <Select
                                    value={settings.time_format}
                                    onValueChange={(v) =>
                                        set(
                                            'time_format',
                                            v as UserSettings['time_format'],
                                        )
                                    }
                                >
                                    <SelectTrigger className="w-36 border-border">
                                        <span className="flex items-center gap-2">
                                            <Clock className="size-4" />
                                            <SelectValue />
                                        </span>
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="12h">
                                            {t('settings.lang12h')}
                                        </SelectItem>
                                        <SelectItem value="24h">
                                            {t('settings.lang24h')}
                                        </SelectItem>
                                    </SelectContent>
                                </Select>
                            </SettingRow>

                            {/* Live preview */}
                            <FormatPreview label={t('settings.preview')} />
                        </SectionCard>

                        {/* ── Notifications ────────────────────────── */}
                        <SectionCard
                            icon={<Bell className="size-5" />}
                            title={t('settings.notifications')}
                        >
                            <SettingRow
                                label={t('settings.notify.roomInvite')}
                                description={t(
                                    'settings.notify.roomInviteDesc',
                                )}
                            >
                                <Toggle
                                    checked={settings.notify_room_invite}
                                    onChange={(v) =>
                                        set('notify_room_invite', v)
                                    }
                                />
                            </SettingRow>

                            <SettingRow
                                label={t('settings.notify.memberJoined')}
                                description={t(
                                    'settings.notify.memberJoinedDesc',
                                )}
                            >
                                <Toggle
                                    checked={settings.notify_member_joined}
                                    onChange={(v) =>
                                        set('notify_member_joined', v)
                                    }
                                />
                            </SettingRow>

                            <SettingRow
                                label={t('settings.notify.memberLeft')}
                                description={t(
                                    'settings.notify.memberLeftDesc',
                                )}
                            >
                                <Toggle
                                    checked={settings.notify_member_left}
                                    onChange={(v) =>
                                        set('notify_member_left', v)
                                    }
                                />
                            </SettingRow>

                            <SettingRow
                                label={t('settings.notify.tripCreated')}
                                description={t(
                                    'settings.notify.tripCreatedDesc',
                                )}
                            >
                                <Toggle
                                    checked={settings.notify_trip_created}
                                    onChange={(v) =>
                                        set('notify_trip_created', v)
                                    }
                                />
                            </SettingRow>

                            <SettingRow
                                label={t('settings.notify.lifestyleAnalyzed')}
                                description={t(
                                    'settings.notify.lifestyleAnalyzedDesc',
                                )}
                            >
                                <Toggle
                                    checked={settings.notify_lifestyle_analyzed}
                                    onChange={(v) =>
                                        set('notify_lifestyle_analyzed', v)
                                    }
                                />
                            </SettingRow>

                            <SettingRow
                                label={t('settings.notify.scheduleUpdated')}
                                description={t(
                                    'settings.notify.scheduleUpdatedDesc',
                                )}
                            >
                                <Toggle
                                    checked={settings.notify_schedule_updated}
                                    onChange={(v) =>
                                        set('notify_schedule_updated', v)
                                    }
                                />
                            </SettingRow>
                        </SectionCard>

                        {/* ── Notification Guide ───────────────────── */}
                        <section className="rounded-2xl border border-border bg-muted/60 px-6 py-5">
                            <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                                {t('settings.guideTitle')}
                            </p>
                            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                                {(
                                    [
                                        {
                                            icon: <Users className="size-4" />,
                                            label: t(
                                                'settings.notify.roomInvite',
                                            ),
                                            desc: t(
                                                'settings.guide.roomInvite',
                                            ),
                                        },
                                        {
                                            icon: (
                                                <LogOut className="size-4 rotate-180" />
                                            ),
                                            label: t(
                                                'settings.notify.memberJoined',
                                            ),
                                            desc: t(
                                                'settings.guide.memberJoined',
                                            ),
                                        },
                                        {
                                            icon: <LogOut className="size-4" />,
                                            label: t(
                                                'settings.notify.memberLeft',
                                            ),
                                            desc: t(
                                                'settings.guide.memberLeft',
                                            ),
                                        },
                                        {
                                            icon: <Plane className="size-4" />,
                                            label: t(
                                                'settings.notify.tripCreated',
                                            ),
                                            desc: t(
                                                'settings.guide.tripCreated',
                                            ),
                                        },
                                        {
                                            icon: (
                                                <Activity className="size-4" />
                                            ),
                                            label: t(
                                                'settings.notify.lifestyleAnalyzed',
                                            ),
                                            desc: t(
                                                'settings.guide.lifestyleAnalyzed',
                                            ),
                                        },
                                        {
                                            icon: <MapPin className="size-4" />,
                                            label: t(
                                                'settings.notify.scheduleUpdated',
                                            ),
                                            desc: t(
                                                'settings.guide.scheduleUpdated',
                                            ),
                                        },
                                    ] as const
                                ).map(({ icon, label, desc }) => (
                                    <div
                                        key={label}
                                        className="flex items-start gap-2.5 rounded-xl border border-border bg-white p-3 shadow-xs"
                                    >
                                        <span className="mt-0.5 shrink-0 text-muted-foreground">
                                            {icon}
                                        </span>
                                        <div>
                                            <p className="text-xs font-medium text-primary">
                                                {label}
                                            </p>
                                            <p className="text-xs text-gray-500 dark:text-slate-400">
                                                {desc}
                                            </p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </section>

                        {/* ── Save Button ──────────────────────────── */}
                        <div className="flex justify-end">
                            <Button
                                onClick={handleSave}
                                disabled={saving}
                                className="min-w-40 bg-primary text-primary-foreground hover:bg-primary/90"
                            >
                                {saving ? (
                                    <>
                                        <Loader2 className="mr-2 size-4 animate-spin" />
                                        {t('settings.saving')}
                                    </>
                                ) : (
                                    t('settings.saveChanges')
                                )}
                            </Button>
                        </div>
                    </div>
                )}
            </div>
        </main>
        </>
    );
}
