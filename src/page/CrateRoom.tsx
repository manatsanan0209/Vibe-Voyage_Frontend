import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import axios from 'axios';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { MdMoreHoriz, MdIosShare } from 'react-icons/md';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { useSidebar } from '@/components/ui/sidebar';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from '@/components/ui/popover';
import RoomMembers from '@/components/room/RoomMembers';
import RoomPlanning from '@/components/room/RoomPlanning';
import { useAuth } from '@/context/AuthContext';
import { useSettings } from '@/context/SettingsContext';
import {
    emitCacheInvalidation,
    subscribeCacheInvalidation,
    type CacheInvalidationEventPayload,
} from '@/lib/cache-events';
import {
    roomService,
    type CreateInviteCodeRequest,
    type RoomInviteCode,
    type RoomMember,
} from '@/services/room.service';
import {
    tripService,
    type ReplaceTripScheduleItemDTO,
    type ReplaceTripScheduleRequestDTO,
    type ScheduleDayResponseDTO,
} from '@/services/trip.service';
import { suggestionService } from '@/services/suggestion.service';
import type { PublishCheckResponseDTO } from '@/types/suggestion';
import type { ApiErrorResponseDTO } from '@/types/api';
import type { PlaceSuggestion, PlaceType } from '@/types/place';
import type { ScheduleDay } from '@/types/schedule';
import { useI18n } from '@/hooks/useI18n';

const AUTOSAVE_DEBOUNCE_MS = 1000;
const AUTOSAVE_RETRY_MS = 4000;
const POLLING_TICK_MS = 1000;
const POLLING_SYNC_INTERVAL_MS = 5000;
const POLLING_READINESS_INTERVAL_MS = 3000;
const POLLING_READINESS_TIMEOUT_MS = 90000;
const POLLING_MAX_BACKOFF_MS = 8000;
const DEFAULT_UNSCHEDULED_TIME = '00:00';

type AutoSaveStatus = 'idle' | 'saving' | 'saved' | 'retrying';
type ScheduleReadinessStatus =
    | 'initial-loading'
    | 'generating'
    | 'ready'
    | 'timeout'
    | 'poll-error';

type RoomRouteState = {
    joinedRole?: number;
    fromCreateTrip?: boolean;
    createdAt?: number;
    lifestyleSubmitted?: boolean;
};

type InviteExpireChoice = '12h' | '1d' | '3d' | '7d' | 'unlimited';

function getExpireTimeByChoice(choice: InviteExpireChoice): string | undefined {
    if (choice === 'unlimited') {
        return undefined;
    }

    const now = Date.now();
    const msByChoice: Record<
        Exclude<InviteExpireChoice, 'unlimited'>,
        number
    > = {
        '12h': 12 * 60 * 60 * 1000,
        '1d': 24 * 60 * 60 * 1000,
        '3d': 3 * 24 * 60 * 60 * 1000,
        '7d': 7 * 24 * 60 * 60 * 1000,
    };

    return new Date(now + msByChoice[choice]).toISOString();
}

function getExpireChoiceDescription(choice: InviteExpireChoice): string {
    switch (choice) {
        case '12h':
            return 'หมดอายุใน 12 ชั่วโมงจากเวลาปัจจุบัน';
        case '1d':
            return 'หมดอายุใน 1 วันจากเวลาปัจจุบัน';
        case '3d':
            return 'หมดอายุใน 3 วันจากเวลาปัจจุบัน';
        case '7d':
            return 'หมดอายุใน 7 วันจากเวลาปัจจุบัน';
        case 'unlimited':
            return 'ไม่ส่ง expire_time ไปใน payload (ขึ้นกับการตีความของ backend)';
        default:
            return '';
    }
}

function getApiErrorMessage(error: unknown, fallback: string): string {
    if (axios.isAxiosError<ApiErrorResponseDTO>(error)) {
        return (
            error.response?.data?.error ||
            error.response?.data?.message ||
            fallback
        );
    }

    return fallback;
}

function getLeaveRoomErrorMessage(
    error: unknown,
    t: (key: string) => string,
): {
    message: string;
    shouldRedirect: boolean;
} {
    if (axios.isAxiosError<ApiErrorResponseDTO>(error)) {
        const status = error.response?.status;
        const rawMessage =
            error.response?.data?.error ||
            error.response?.data?.message ||
            t('room.failedToLeave');
        const normalized = rawMessage.toLowerCase();

        if (normalized.includes('room owner cannot leave')) {
            return {
                message: t('room.ownerCannotLeave'),
                shouldRedirect: false,
            };
        }

        if (normalized.includes('not a member')) {
            return {
                message: t('room.notMember'),
                shouldRedirect: true,
            };
        }

        if (status === 401) {
            return {
                message: t('room.unauthorized'),
                shouldRedirect: false,
            };
        }

        return {
            message: rawMessage,
            shouldRedirect: false,
        };
    }

    return {
        message: t('room.failedToLeave'),
        shouldRedirect: false,
    };
}

function normalizeInviteAccessLabel(access: RoomInviteCode['access']): string {
    if (access === 1 || access === 'edit') {
        return 'edit';
    }
    if (access === 2 || access === 'view') {
        return 'view';
    }
    return 'unknown';
}

function resolveRoomIdFromMembers(
    routeId: string,
    members: RoomMember[],
): string {
    const roomId = members[0]?.room_id;
    return roomId ? String(roomId) : routeId;
}

function normalizeTypeForScheduleApi(type: PlaceType): string {
    switch (type) {
        case 'Attraction':
            return 'attraction';
        case 'Restaurant':
            return 'restaurant';
        case 'Hotel':
            return 'hotel';
        default:
            return 'attraction';
    }
}

function mapScheduleDays(days: ScheduleDayResponseDTO[]): ScheduleDay[] {
    return days.map((day) => ({
        id: `day-${day.day_number}`,
        day_number: day.day_number,
        date: day.date,
        // Render-time formatting uses SettingsContext (global app preference)
        dateLabel: day.date,
        items: day.schedules,
    }));
}

function isScheduleReady(
    suggestions: PlaceSuggestion[],
    days: ScheduleDayResponseDTO[],
): boolean {
    if (suggestions.length > 0) return true;
    return days.some((day) => day.schedules.length > 0);
}

function buildReplaceSchedulePayload(
    places: PlaceSuggestion[],
    schedule: ScheduleDay[],
): ReplaceTripScheduleRequestDTO {
    const scheduledItems: ReplaceTripScheduleItemDTO[] = schedule.flatMap(
        (day) =>
            day.items
                .filter((item) => item.place_id !== '')
                .map((item, index) => ({
                    trip_schedule_id: Number(item.id) || undefined,
                    day_number: day.day_number,
                    sequence_order: index + 1,
                    place_name: item.place_name,
                    place_id: item.place_id,
                    latitude: item.location?.lat ?? 0,
                    longitude: item.location?.lng ?? 0,
                    start_time: item.start_time ?? DEFAULT_UNSCHEDULED_TIME,
                    end_time: item.end_time ?? DEFAULT_UNSCHEDULED_TIME,
                    type: normalizeTypeForScheduleApi(item.type),
                })),
    );

    const suggestionItems: ReplaceTripScheduleItemDTO[] = places
        .filter((place) => place.place_id !== '')
        .map((place) => ({
            trip_schedule_id: Number(place.id) || undefined,
            day_number: 0,
            sequence_order: 0,
            place_name: place.name,
            place_id: place.place_id,
            latitude: place.location.lat,
            longitude: place.location.lng,
            start_time: DEFAULT_UNSCHEDULED_TIME,
            end_time: DEFAULT_UNSCHEDULED_TIME,
            type: normalizeTypeForScheduleApi(place.type),
        }));

    return {
        items: [...suggestionItems, ...scheduledItems],
    };
}

export default function CreateRoom() {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const location = useLocation();
    const { setOpen } = useSidebar();
    const { user } = useAuth();
    const { formatDate, formatTime } = useSettings();
    const { t } = useI18n();
    const routeState = (location.state as RoomRouteState | null) ?? null;
    const joinedRoleFromState = routeState?.joinedRole ?? null;
    const isFromCreateTrip = Boolean(routeState?.fromCreateTrip);

    const formatInviteDateTime = useCallback(
        (value?: string): string => {
            if (!value) return '-';
            return `${formatDate(value)} ${formatTime(value)}`;
        },
        [formatDate, formatTime],
    );

    const [places, setPlaces] = useState<PlaceSuggestion[]>([]);
    const [schedule, setSchedule] = useState<ScheduleDay[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [shareOpen, setShareOpen] = useState(false);
    const [moreMenuOpen, setMoreMenuOpen] = useState(false);
    const [leaveDialogOpen, setLeaveDialogOpen] = useState(false);
    const [leaveSubmitting, setLeaveSubmitting] = useState(false);
    const [leaveError, setLeaveError] = useState<string | null>(null);
    const [currentRole, setCurrentRole] = useState<number | null>(
        joinedRoleFromState,
    );
    const [shareRoomId, setShareRoomId] = useState<string>('');
    const [inviteAccess, setInviteAccess] = useState<'view' | 'edit'>('view');
    const [inviteExpireChoice, setInviteExpireChoice] =
        useState<InviteExpireChoice>('1d');
    const [inviteSubmitting, setInviteSubmitting] = useState(false);
    const [inviteError, setInviteError] = useState<string | null>(null);
    const [createdInvite, setCreatedInvite] = useState<RoomInviteCode | null>(
        null,
    );
    const [copied, setCopied] = useState(false);
    const [inviteHistory, setInviteHistory] = useState<RoomInviteCode[]>([]);
    const [inviteHistoryLoading, setInviteHistoryLoading] = useState(false);
    const [inviteHistoryError, setInviteHistoryError] = useState<string | null>(
        null,
    );
    const [inviteHistoryLoaded, setInviteHistoryLoaded] = useState(false);
    const [saveStatus, setSaveStatus] = useState<AutoSaveStatus>('idle');
    const [saveError, setSaveError] = useState<string | null>(null);
    const [scheduleReadinessStatus, setScheduleReadinessStatus] =
        useState<ScheduleReadinessStatus>('initial-loading');
    const [scheduleReadinessMessage, setScheduleReadinessMessage] = useState<
        string | null
    >(null);
    const [showLifestyleSubmittedNotice, setShowLifestyleSubmittedNotice] =
        useState(Boolean(routeState?.lifestyleSubmitted));

    const [publishStatus, setPublishStatus] =
        useState<PublishCheckResponseDTO | null>(null);
    const [publishDialogOpen, setPublishDialogOpen] = useState(false);
    const [unpublishDialogOpen, setUnpublishDialogOpen] = useState(false);
    const [publishTitle, setPublishTitle] = useState('');
    const [publishDescription, setPublishDescription] = useState('');
    const [publishSubmitting, setPublishSubmitting] = useState(false);
    const [publishError, setPublishError] = useState<string | null>(null);

    const latestPayloadRef = useRef<ReplaceTripScheduleRequestDTO>({
        items: [],
    });
    const latestHashRef = useRef('');
    const lastSyncedHashRef = useRef('');
    const initializedRef = useRef(false);
    const suppressAutosaveRef = useRef(false);
    const saveInFlightRef = useRef(false);
    const pollInFlightRef = useRef(false);
    const retryTimerRef = useRef<number | null>(null);
    const nextPollAtRef = useRef(0);
    const pollFailureStreakRef = useRef(0);
    const lifestyleInvalidationEmittedRef = useRef(false);
    const scheduleReadinessRef = useRef({
        enabled: isFromCreateTrip,
        startedAt:
            typeof routeState?.createdAt === 'number'
                ? routeState.createdAt
                : Date.now(),
    });
    const saveScheduleRef = useRef<
        (mode: 'autosave' | 'retry') => Promise<void>
    >(async () => {});

    useEffect(() => {
        setOpen(false);
        return () => setOpen(true);
    }, [setOpen]);

    const applyServerSnapshot = useCallback(
        (suggestions: PlaceSuggestion[], days: ScheduleDayResponseDTO[]) => {
            const mappedSchedule = mapScheduleDays(days);
            const nextPayload = buildReplaceSchedulePayload(
                suggestions,
                mappedSchedule,
            );
            const nextHash = JSON.stringify(nextPayload);

            suppressAutosaveRef.current = true;
            setPlaces(suggestions);
            setSchedule(mappedSchedule);
            latestPayloadRef.current = nextPayload;
            latestHashRef.current = nextHash;
            lastSyncedHashRef.current = nextHash;

            requestAnimationFrame(() => {
                suppressAutosaveRef.current = false;
            });
        },
        [],
    );

    useEffect(() => {
        if (!id) return;

        initializedRef.current = false;
        setLoading(true);
        setError(null);
        setScheduleReadinessStatus('initial-loading');
        setScheduleReadinessMessage(null);
        pollFailureStreakRef.current = 0;
        nextPollAtRef.current = 0;
        scheduleReadinessRef.current = {
            enabled: isFromCreateTrip,
            startedAt:
                typeof routeState?.createdAt === 'number'
                    ? routeState.createdAt
                    : Date.now(),
        };

        tripService
            .getSchedule(id)
            .then(({ suggestions, days }) => {
                applyServerSnapshot(suggestions, days);
                initializedRef.current = true;
                setSaveStatus('saved');
                setSaveError(null);

                const ready = isScheduleReady(suggestions, days);
                if (scheduleReadinessRef.current.enabled && !ready) {
                    setScheduleReadinessStatus('generating');
                    setScheduleReadinessMessage(
                        'สร้างทริปเรียบร้อยแล้ว ระบบกำลังเตรียม AI suggestions ให้คุณ',
                    );
                } else {
                    scheduleReadinessRef.current.enabled = false;
                    setScheduleReadinessStatus('ready');
                    setScheduleReadinessMessage(null);
                }
            })
            .catch((err) => {
                console.error('[CreateRoom] Failed to load schedule:', err);
                setError('ไม่สามารถโหลดข้อมูลตารางเดินทางได้');
                setScheduleReadinessStatus('poll-error');
                setScheduleReadinessMessage('ไม่สามารถโหลดตารางเดินทางได้');
            })
            .finally(() => setLoading(false));
    }, [applyServerSnapshot, id, isFromCreateTrip, routeState?.createdAt]);

    useEffect(() => {
        if (!id || !user?.id) return;

        let active = true;
        roomService
            .getMembers(id)
            .then((members) => {
                if (!active) return;
                const me = members.find((member) => member.user_id === user.id);
                if (!me) {
                    setCurrentRole(null);
                    emitCacheInvalidation({
                        key: 'user-rooms',
                        reason: 'removed-from-room',
                    });
                    navigate('/your-trips', {
                        replace: true,
                        state: {
                            removedFromRoom: true,
                        },
                    });
                    return;
                }

                if (me?.role != null) {
                    setCurrentRole(me.role);
                } else if (joinedRoleFromState == null) {
                    setCurrentRole(null);
                }
                setShareRoomId(resolveRoomIdFromMembers(id, members));
            })
            .catch(() => {
                if (!active) return;
                if (joinedRoleFromState == null) {
                    setCurrentRole(null);
                }
                setShareRoomId(id);
            });

        return () => {
            active = false;
        };
    }, [id, joinedRoleFromState, navigate, user?.id]);

    const isOwner = currentRole === 1;
    const canEdit = currentRole !== 3;

    const replacePayload = useMemo(
        () => buildReplaceSchedulePayload(places, schedule),
        [places, schedule],
    );
    const replacePayloadHash = useMemo(
        () => JSON.stringify(replacePayload),
        [replacePayload],
    );

    useEffect(() => {
        latestPayloadRef.current = replacePayload;
        latestHashRef.current = replacePayloadHash;
    }, [replacePayload, replacePayloadHash]);

    const saveSchedule = useCallback(
        async (mode: 'autosave' | 'retry') => {
            if (!id || !canEdit) return;
            if (saveInFlightRef.current) return;
            if (latestHashRef.current === lastSyncedHashRef.current) return;

            saveInFlightRef.current = true;
            setSaveStatus(mode === 'retry' ? 'retrying' : 'saving');

            try {
                await tripService.replaceSchedule(id, latestPayloadRef.current);
                lastSyncedHashRef.current = latestHashRef.current;
                setSaveStatus('saved');
                setSaveError(null);
                emitCacheInvalidation({
                    key: 'trip-schedule',
                    tripId: id,
                    reason: 'replace-schedule',
                });
                if (retryTimerRef.current != null) {
                    window.clearTimeout(retryTimerRef.current);
                    retryTimerRef.current = null;
                }
            } catch (err) {
                setSaveStatus('retrying');
                setSaveError(
                    getApiErrorMessage(err, 'ไม่สามารถบันทึกแผนการเดินทางได้'),
                );

                if (retryTimerRef.current != null) {
                    window.clearTimeout(retryTimerRef.current);
                }
                retryTimerRef.current = window.setTimeout(() => {
                    void saveScheduleRef.current('retry');
                }, AUTOSAVE_RETRY_MS);
            } finally {
                saveInFlightRef.current = false;
            }
        },
        [canEdit, id],
    );

    useEffect(() => {
        saveScheduleRef.current = saveSchedule;
    }, [saveSchedule]);

    useEffect(() => {
        if (!id || !canEdit || !initializedRef.current) return;
        if (suppressAutosaveRef.current) return;
        if (replacePayloadHash === lastSyncedHashRef.current) return;

        const timeoutId = window.setTimeout(() => {
            void saveSchedule('autosave');
        }, AUTOSAVE_DEBOUNCE_MS);

        return () => {
            window.clearTimeout(timeoutId);
        };
    }, [canEdit, id, replacePayloadHash, saveSchedule]);

    useEffect(() => {
        if (!id) return;

        const intervalId = window.setInterval(async () => {
            if (!initializedRef.current) return;
            const now = Date.now();
            if (now < nextPollAtRef.current) return;
            if (pollInFlightRef.current || saveInFlightRef.current) return;

            pollInFlightRef.current = true;
            try {
                const { suggestions, days } = await tripService.getSchedule(id);
                pollFailureStreakRef.current = 0;
                const mappedSchedule = mapScheduleDays(days);
                const remotePayload = buildReplaceSchedulePayload(
                    suggestions,
                    mappedSchedule,
                );
                const remoteHash = JSON.stringify(remotePayload);

                const hasUnsavedLocalChanges =
                    latestHashRef.current !== lastSyncedHashRef.current;
                const ready = isScheduleReady(suggestions, days);

                if (
                    !hasUnsavedLocalChanges &&
                    remoteHash !== latestHashRef.current
                ) {
                    suppressAutosaveRef.current = true;
                    setPlaces(suggestions);
                    setSchedule(mappedSchedule);
                    latestPayloadRef.current = remotePayload;
                    latestHashRef.current = remoteHash;
                    lastSyncedHashRef.current = remoteHash;
                    setSaveStatus('saved');
                    setSaveError(null);

                    requestAnimationFrame(() => {
                        suppressAutosaveRef.current = false;
                    });
                }

                if (scheduleReadinessRef.current.enabled) {
                    const elapsed =
                        now - scheduleReadinessRef.current.startedAt;

                    if (ready) {
                        scheduleReadinessRef.current.enabled = false;
                        setScheduleReadinessStatus('ready');
                        setScheduleReadinessMessage(null);
                    } else if (elapsed >= POLLING_READINESS_TIMEOUT_MS) {
                        scheduleReadinessRef.current.enabled = false;
                        setScheduleReadinessStatus('timeout');
                        setScheduleReadinessMessage(
                            'AI suggestions ยังเตรียมไม่เสร็จ คุณใช้งานหน้านี้ต่อได้และกดรีเฟรชภายหลัง',
                        );
                    } else {
                        setScheduleReadinessStatus('generating');
                        setScheduleReadinessMessage(
                            'Trip created, scheduling is preparing...',
                        );
                    }
                }

                nextPollAtRef.current =
                    Date.now() +
                    (scheduleReadinessRef.current.enabled
                        ? POLLING_READINESS_INTERVAL_MS
                        : POLLING_SYNC_INTERVAL_MS);
            } catch (err) {
                console.error('[CreateRoom] Poll schedule failed:', err);

                pollFailureStreakRef.current += 1;
                const backoffMs = Math.min(
                    POLLING_MAX_BACKOFF_MS,
                    POLLING_READINESS_INTERVAL_MS *
                        2 ** (pollFailureStreakRef.current - 1),
                );
                nextPollAtRef.current = Date.now() + backoffMs;

                if (scheduleReadinessRef.current.enabled) {
                    setScheduleReadinessStatus('poll-error');
                    setScheduleReadinessMessage(
                        'เชื่อมต่อไม่เสถียร ระบบกำลังลองดึง AI suggestions ใหม่',
                    );
                }
            } finally {
                pollInFlightRef.current = false;
            }
        }, POLLING_TICK_MS);

        return () => {
            window.clearInterval(intervalId);
        };
    }, [id]);

    useEffect(
        () => () => {
            if (retryTimerRef.current != null) {
                window.clearTimeout(retryTimerRef.current);
            }
        },
        [],
    );

    useEffect(() => {
        if (!id) return;

        return subscribeCacheInvalidation(
            (event: CacheInvalidationEventPayload) => {
                if (event.key === 'trip-schedule' && event.tripId === id) {
                    nextPollAtRef.current = 0;
                }
            },
        );
    }, [id]);

    useEffect(() => {
        if (!routeState?.lifestyleSubmitted) return;
        setShowLifestyleSubmittedNotice(true);

        if (shareRoomId && !lifestyleInvalidationEmittedRef.current) {
            emitCacheInvalidation({
                key: 'room-submissions',
                roomId: shareRoomId,
                reason: 'lifestyle-submit',
            });
            lifestyleInvalidationEmittedRef.current = true;
        }

        const timeoutId = window.setTimeout(() => {
            setShowLifestyleSubmittedNotice(false);
        }, 8000);

        return () => {
            window.clearTimeout(timeoutId);
        };
    }, [routeState?.lifestyleSubmitted, shareRoomId]);

    const handleRetrySchedulePolling = useCallback(() => {
        if (!id) return;

        scheduleReadinessRef.current = {
            enabled: true,
            startedAt: Date.now(),
        };
        pollFailureStreakRef.current = 0;
        nextPollAtRef.current = 0;
        setScheduleReadinessStatus('generating');
        setScheduleReadinessMessage(
            'กำลังขอ AI suggestions ใหม่ กรุณารอสักครู่',
        );

        emitCacheInvalidation({
            key: 'trip-schedule',
            tripId: id,
            reason: 'manual-retry',
        });
    }, [id]);

    const autoSaveStatusLabel = useMemo(() => {
        if (!canEdit) return '';

        if (saveStatus === 'saving') {
            return 'กำลังบันทึกแผนอัตโนมัติ...';
        }
        if (saveStatus === 'retrying') {
            return saveError
                ? `บันทึกไม่สำเร็จ กำลังลองใหม่... (${saveError})`
                : 'กำลังลองบันทึกใหม่อัตโนมัติ...';
        }
        if (saveStatus === 'saved') {
            return 'บันทึกแผนอัตโนมัติล่าสุดเรียบร้อย';
        }

        return 'ระบบจะบันทึกอัตโนมัติเมื่อมีการแก้ไข';
    }, [canEdit, saveError, saveStatus]);

    useEffect(() => {
        if (!id || !isOwner) return;
        let active = true;

        suggestionService
            .checkPublishStatus(id)
            .then((status) => {
                if (!active) return;
                setPublishStatus(status);
            })
            .catch(() => {
                /* non-critical — publish status unavailable */
            });

        return () => {
            active = false;
        };
    }, [id, isOwner]);

    const handlePublish = useCallback(async () => {
        if (!id) return;
        setPublishSubmitting(true);
        setPublishError(null);
        try {
            await suggestionService.publishTrip(id, {
                title: publishTitle.trim() || undefined,
                description: publishDescription.trim() || undefined,
            });
            const updated = await suggestionService.checkPublishStatus(id);
            setPublishStatus(updated);
            setPublishDialogOpen(false);
            setPublishTitle('');
            setPublishDescription('');
        } catch (err) {
            setPublishError(getApiErrorMessage(err, 'Failed to publish trip.'));
        } finally {
            setPublishSubmitting(false);
        }
    }, [id, publishTitle, publishDescription]);

    const handleUnpublish = useCallback(async () => {
        if (!id) return;
        setPublishSubmitting(true);
        setPublishError(null);
        try {
            await suggestionService.unpublishTrip(id);
            setPublishStatus({ is_published: false });
            setUnpublishDialogOpen(false);
        } catch (err) {
            setPublishError(
                getApiErrorMessage(err, 'Failed to unpublish trip.'),
            );
        } finally {
            setPublishSubmitting(false);
        }
    }, [id]);

    const handleShareOpenChange = useCallback((open: boolean) => {
        setShareOpen(open);
        if (!open) return;

        setInviteAccess('view');
        setInviteExpireChoice('1d');
        setInviteError(null);
        setCreatedInvite(null);
        setCopied(false);
        setInviteHistory([]);
        setInviteHistoryError(null);
        setInviteHistoryLoaded(false);
    }, []);

    const handleOpenLeaveDialog = useCallback(() => {
        setMoreMenuOpen(false);
        setLeaveError(null);
        setLeaveDialogOpen(true);
    }, []);

    const handleLeaveRoom = useCallback(async () => {
        const leaveRoomId = shareRoomId || id;
        if (!leaveRoomId) {
            setLeaveError('Failed to leave room. Missing room id.');
            return;
        }

        setLeaveSubmitting(true);
        setLeaveError(null);

        try {
            await roomService.leaveRoom(leaveRoomId);

            setLeaveDialogOpen(false);
            setShareOpen(false);
            setPlaces([]);
            setSchedule([]);
            setCurrentRole(null);

            emitCacheInvalidation({
                key: 'room-members',
                roomId: leaveRoomId,
                reason: 'remove-member',
            });
            emitCacheInvalidation({
                key: 'room-submissions',
                roomId: leaveRoomId,
                reason: 'remove-member',
            });
            emitCacheInvalidation({
                key: 'user-rooms',
                reason: 'removed-from-room',
            });

            navigate('/your-trips', {
                replace: true,
                state: {
                    leftRoom: true,
                },
            });
        } catch (error) {
            const { message, shouldRedirect } = getLeaveRoomErrorMessage(
                error,
                t,
            );
            setLeaveError(message);

            if (shouldRedirect) {
                setLeaveDialogOpen(false);
                setPlaces([]);
                setSchedule([]);
                emitCacheInvalidation({
                    key: 'user-rooms',
                    reason: 'removed-from-room',
                });
                navigate('/your-trips', {
                    replace: true,
                    state: {
                        removedFromRoom: true,
                    },
                });
            }
        } finally {
            setLeaveSubmitting(false);
        }
    }, [id, navigate, shareRoomId]);

    const handleCreateInviteCode = useCallback(async () => {
        if (!shareRoomId) {
            setInviteError('ไม่พบ room id สำหรับสร้าง invite code');
            return;
        }

        setInviteSubmitting(true);
        setInviteError(null);

        try {
            // Convert string access to integer: 'edit' = 1, 'view' = 2
            const accessValue = inviteAccess === 'edit' ? 1 : 2;

            const payload: CreateInviteCodeRequest = {
                access: accessValue,
            };

            const expireTime = getExpireTimeByChoice(inviteExpireChoice);
            if (expireTime) {
                payload.expire_time = expireTime;
            }

            const invite = await roomService.createInviteCode(
                shareRoomId,
                payload,
            );
            setCreatedInvite(invite);
        } catch (err) {
            setInviteError(
                getApiErrorMessage(err, 'ไม่สามารถสร้าง invite code ได้'),
            );
        } finally {
            setInviteSubmitting(false);
        }
    }, [inviteAccess, inviteExpireChoice, shareRoomId]);

    const handleCopyInviteCode = useCallback(async () => {
        if (!createdInvite?.invite_code) return;

        try {
            await navigator.clipboard.writeText(createdInvite.invite_code);
            setCopied(true);
        } catch {
            setCopied(false);
            setInviteError('คัดลอก invite code ไม่สำเร็จ');
        }
    }, [createdInvite?.invite_code]);

    const handleLoadInviteHistory = useCallback(async () => {
        if (!shareRoomId) {
            setInviteHistoryError(
                'ไม่พบ room id สำหรับโหลดประวัติ invite code',
            );
            return;
        }

        setInviteHistoryLoading(true);
        setInviteHistoryError(null);

        try {
            const history = await roomService.getInviteCodeHistory(shareRoomId);
            const sortedHistory = [...history].sort(
                (a, b) =>
                    new Date(b.created_at).getTime() -
                    new Date(a.created_at).getTime(),
            );
            setInviteHistory(sortedHistory);
            setInviteHistoryLoaded(true);
        } catch (err) {
            setInviteHistoryError(
                getApiErrorMessage(err, 'ไม่สามารถโหลดประวัติ invite code ได้'),
            );
        } finally {
            setInviteHistoryLoading(false);
        }
    }, [shareRoomId]);

    if (loading) {
        return (
            <div className="h-[calc(100dvh-6rem)] w-full flex items-center justify-center">
                <p className="text-foreground/50 text-sm">กำลังโหลดข้อมูล...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="h-[calc(100dvh-6rem)] w-full flex items-center justify-center">
                <p className="text-red-500 text-sm">{error}</p>
            </div>
        );
    }

    let inviteHistoryButtonLabel = 'ดูประวัติ';
    if (inviteHistoryLoading) {
        inviteHistoryButtonLabel = 'กำลังโหลด...';
    } else if (inviteHistoryLoaded) {
        inviteHistoryButtonLabel = 'รีเฟรช';
    }

    return (
        <div className="h-[calc(100dvh-6rem)] w-full flex flex-col gap-6 overflow-hidden">
            <div className="flex flex-row items-end justify-end gap-6 pr-6 shrink-0">
                {canEdit && (
                    <p className="text-sm text-foreground/70 mr-auto px-6">
                        {autoSaveStatusLabel}
                    </p>
                )}
                <Popover open={moreMenuOpen} onOpenChange={setMoreMenuOpen}>
                    <PopoverTrigger asChild>
                        <Button className="h-auto rounded-md font-semibold bg-primary text-primary-foreground hover:bg-primary/90 border-2 border-transparent">
                            <MdMoreHoriz />
                            More
                        </Button>
                    </PopoverTrigger>
                    <PopoverContent align="end" className="w-44 p-1">
                        <Button
                            type="button"
                            variant="ghost"
                            className="w-full justify-start text-red-600 hover:text-red-700 hover:bg-red-50"
                            onClick={handleOpenLeaveDialog}
                        >
                            Leave room
                        </Button>
                    </PopoverContent>
                </Popover>
                {isOwner && publishStatus?.is_published && (
                    <Button
                        className="h-auto rounded-md font-semibold bg-emerald-50 text-emerald-700 border-2 border-emerald-300 hover:bg-emerald-100"
                        onClick={() => {
                            setPublishError(null);
                            setUnpublishDialogOpen(true);
                        }}
                    >
                        {t('tripSuggestions.publish.published')}
                    </Button>
                )}
                {isOwner && !publishStatus?.is_published && (
                    <Button
                        className="h-auto rounded-md font-semibold bg-white text-primary border-2 border-primary hover:bg-muted"
                        onClick={() => {
                            setPublishError(null);
                            setPublishTitle('');
                            setPublishDescription('');
                            setPublishDialogOpen(true);
                        }}
                    >
                        {t('tripSuggestions.publish.publish')}
                    </Button>
                )}
                {isOwner && (
                    <Button
                        className="h-auto rounded-md font-semibold bg-white text-primary border-2 border-primary hover:bg-muted"
                        onClick={() => handleShareOpenChange(true)}
                    >
                        <MdIosShare />
                        Share
                    </Button>
                )}
            </div>

            {!canEdit && (
                <p className="text-sm text-amber-700 px-6">
                    ห้องนี้เป็นโหมดดูอย่างเดียว คุณยังไม่สามารถแก้ไขแผนได้
                </p>
            )}

            {showLifestyleSubmittedNotice && (
                <div className="mx-6 rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">
                    ส่ง Lifestyle สำเร็จแล้ว ข้อมูลสมาชิกถูกอัปเดตเรียบร้อย
                </div>
            )}

            {scheduleReadinessStatus === 'generating' && (
                <div className="mx-6 rounded-lg border border-sky-200 bg-sky-50 px-4 py-3 text-sm text-sky-900">
                    {scheduleReadinessMessage ||
                        'Trip created, scheduling is preparing...'}
                </div>
            )}

            {(scheduleReadinessStatus === 'timeout' ||
                scheduleReadinessStatus === 'poll-error') && (
                <div className="mx-6 rounded-lg border border-amber-300 bg-amber-50 px-4 py-3 text-sm text-amber-900 flex items-center justify-between gap-3">
                    <span>
                        {scheduleReadinessMessage ||
                            'AI suggestions are still preparing.'}
                    </span>
                    <Button
                        type="button"
                        size="sm"
                        variant="outline"
                        onClick={handleRetrySchedulePolling}
                    >
                        รีเฟรชตาราง
                    </Button>
                </div>
            )}

            <Tabs defaultValue="planning" className="flex-1 min-h-0">
                <TabsList
                    variant="line"
                    className="w-full justify-start rounded-lg bg-transparent border-b border-foreground/10 shrink-0 mb-4"
                >
                    <TabsTrigger value="planning" className="text-base">
                        Planning Trip
                    </TabsTrigger>
                    <TabsTrigger value="member" className="text-base">
                        Members
                    </TabsTrigger>
                </TabsList>

                <TabsContent
                    value="planning"
                    className="flex-1 min-h-0 overflow-hidden"
                >
                    <RoomPlanning
                        places={places}
                        setPlaces={setPlaces}
                        schedule={schedule}
                        setSchedule={setSchedule}
                        readOnly={!canEdit}
                    />
                </TabsContent>

                <TabsContent
                    value="member"
                    className="flex-1 min-h-0 overflow-y-auto"
                >
                    <RoomMembers
                        roomId={shareRoomId || id || ''}
                        tripId={id || ''}
                    />
                </TabsContent>
            </Tabs>

            <Dialog open={shareOpen} onOpenChange={handleShareOpenChange}>
                <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle>Create Invite Code</DialogTitle>
                        <DialogDescription>
                            สร้างโค้ดเพื่อเชิญสมาชิกเข้าห้องนี้
                        </DialogDescription>
                    </DialogHeader>

                    {!isOwner && (
                        <p className="text-sm text-red-600">
                            เฉพาะ owner เท่านั้นที่สามารถสร้าง invite code ได้
                        </p>
                    )}

                    {isOwner && (
                        <div className="space-y-4">
                            <div className="space-y-1.5">
                                <Label htmlFor="invite-access">Access</Label>
                                <Select
                                    value={inviteAccess}
                                    onValueChange={(value) =>
                                        setInviteAccess(
                                            value as 'view' | 'edit',
                                        )
                                    }
                                >
                                    <SelectTrigger
                                        id="invite-access"
                                        className="w-full"
                                    >
                                        <SelectValue placeholder="Select access" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="view">
                                            view
                                        </SelectItem>
                                        <SelectItem value="edit">
                                            edit
                                        </SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="space-y-1.5">
                                <Label htmlFor="invite-expire-choice">
                                    Expire Time
                                </Label>
                                <Select
                                    value={inviteExpireChoice}
                                    onValueChange={(value) =>
                                        setInviteExpireChoice(
                                            value as InviteExpireChoice,
                                        )
                                    }
                                >
                                    <SelectTrigger
                                        id="invite-expire-choice"
                                        className="w-full"
                                    >
                                        <SelectValue placeholder="Select expire time" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="12h">
                                            12 hours
                                        </SelectItem>
                                        <SelectItem value="1d">
                                            1 day
                                        </SelectItem>
                                        <SelectItem value="3d">
                                            3 days
                                        </SelectItem>
                                        <SelectItem value="7d">
                                            7 days
                                        </SelectItem>
                                        <SelectItem value="unlimited">
                                            Unlimited
                                        </SelectItem>
                                    </SelectContent>
                                </Select>
                                <p className="text-xs text-foreground/60">
                                    {getExpireChoiceDescription(
                                        inviteExpireChoice,
                                    )}
                                </p>
                            </div>

                            {createdInvite && (
                                <div className="rounded-md border border-emerald-200 bg-emerald-50 p-3 space-y-2">
                                    <p className="text-xs text-emerald-700">
                                        Invite code สร้างสำเร็จ
                                    </p>
                                    <p className="font-semibold tracking-wide text-emerald-900">
                                        {createdInvite.invite_code}
                                    </p>
                                    <p className="text-xs text-emerald-700">
                                        หมดอายุ: {createdInvite.expire_time}
                                    </p>
                                    <Button
                                        variant="outline"
                                        className="w-full"
                                        onClick={handleCopyInviteCode}
                                    >
                                        {copied
                                            ? 'คัดลอกแล้ว'
                                            : 'คัดลอก invite code'}
                                    </Button>
                                </div>
                            )}

                            {inviteError && (
                                <p className="text-sm text-red-600">
                                    {inviteError}
                                </p>
                            )}

                            <div className="space-y-2 rounded-md border border-border bg-muted/40 p-3">
                                <div className="flex items-center justify-between gap-2">
                                    <p className="text-sm font-semibold text-primary">
                                        Invite code history
                                    </p>
                                    <Button
                                        type="button"
                                        size="sm"
                                        variant="outline"
                                        onClick={handleLoadInviteHistory}
                                        disabled={inviteHistoryLoading}
                                    >
                                        {inviteHistoryButtonLabel}
                                    </Button>
                                </div>

                                {inviteHistoryError && (
                                    <p className="text-sm text-red-600">
                                        {inviteHistoryError}
                                    </p>
                                )}

                                {inviteHistoryLoaded &&
                                    !inviteHistoryLoading &&
                                    inviteHistory.length === 0 && (
                                        <p className="text-xs text-muted-foreground">
                                            ยังไม่มีประวัติ invite code
                                        </p>
                                    )}

                                {inviteHistory.length > 0 && (
                                    <div className="max-h-44 space-y-2 overflow-y-auto pr-1">
                                        {inviteHistory.map((item) => (
                                            <div
                                                key={item.room_invite_id}
                                                className="rounded-md border border-border bg-white p-2"
                                            >
                                                <p className="font-semibold tracking-wide text-primary">
                                                    {item.invite_code}
                                                </p>
                                                <div className="mt-1 grid grid-cols-2 gap-2 text-xs text-muted-foreground">
                                                    <p>
                                                        Access:{' '}
                                                        {normalizeInviteAccessLabel(
                                                            item.access,
                                                        )}
                                                    </p>
                                                    <p>
                                                        Expire:{' '}
                                                        {formatInviteDateTime(
                                                            item.expire_time,
                                                        )}
                                                    </p>
                                                    <p className="col-span-2">
                                                        Created:{' '}
                                                        {formatInviteDateTime(
                                                            item.created_at,
                                                        )}
                                                    </p>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    <DialogFooter>
                        <Button
                            variant="outline"
                            onClick={() => setShareOpen(false)}
                        >
                            ปิด
                        </Button>
                        {isOwner && (
                            <Button
                                onClick={handleCreateInviteCode}
                                disabled={inviteSubmitting}
                            >
                                {inviteSubmitting
                                    ? 'กำลังสร้าง...'
                                    : 'สร้าง invite code'}
                            </Button>
                        )}
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            <Dialog open={leaveDialogOpen} onOpenChange={setLeaveDialogOpen}>
                <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle>Leave Room</DialogTitle>
                        <DialogDescription>
                            Are you sure you want to leave this room? You will
                            be removed from room members and your lifestyle
                            submission in this room will be deleted.
                        </DialogDescription>
                    </DialogHeader>

                    {leaveError && (
                        <p className="text-sm text-red-600">{leaveError}</p>
                    )}

                    <DialogFooter>
                        <Button
                            variant="outline"
                            onClick={() => setLeaveDialogOpen(false)}
                            disabled={leaveSubmitting}
                        >
                            Cancel
                        </Button>
                        <Button
                            variant="destructive"
                            onClick={handleLeaveRoom}
                            disabled={leaveSubmitting}
                        >
                            {leaveSubmitting ? 'Leaving...' : 'Leave room'}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Publish dialog */}
            <Dialog
                open={publishDialogOpen}
                onOpenChange={(open) => {
                    if (!publishSubmitting) setPublishDialogOpen(open);
                }}
            >
                <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle>
                            {t('tripSuggestions.publish.publishTitle')}
                        </DialogTitle>
                        <DialogDescription>
                            {t('tripSuggestions.publish.publishDescription')}
                        </DialogDescription>
                    </DialogHeader>

                    <div className="flex flex-col gap-4">
                        <div className="flex flex-col gap-1.5">
                            <Label htmlFor="pub-title">
                                {t('tripSuggestions.publish.titleLabel')}
                            </Label>
                            <input
                                id="pub-title"
                                value={publishTitle}
                                onChange={(e) =>
                                    setPublishTitle(e.target.value)
                                }
                                placeholder={t(
                                    'tripSuggestions.publish.titlePlaceholder',
                                )}
                                className="border-input h-9 w-full rounded-md border bg-transparent px-3 py-1 text-sm shadow-xs outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px]"
                            />
                        </div>

                        <div className="flex flex-col gap-1.5">
                            <Label htmlFor="pub-desc">
                                {t('tripSuggestions.publish.descriptionLabel')}
                            </Label>
                            <textarea
                                id="pub-desc"
                                value={publishDescription}
                                onChange={(e) =>
                                    setPublishDescription(e.target.value)
                                }
                                rows={3}
                                placeholder={t(
                                    'tripSuggestions.publish.descriptionPlaceholder',
                                )}
                                className="border-input w-full rounded-md border bg-transparent px-3 py-2 text-sm shadow-xs outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] resize-none"
                            />
                        </div>

                        {publishError && (
                            <p className="text-sm text-red-600">
                                {publishError}
                            </p>
                        )}
                    </div>

                    <DialogFooter>
                        <Button
                            variant="outline"
                            onClick={() => setPublishDialogOpen(false)}
                            disabled={publishSubmitting}
                        >
                            {t('tripSuggestions.publish.cancel')}
                        </Button>
                        <Button
                            onClick={handlePublish}
                            disabled={publishSubmitting}
                        >
                            {publishSubmitting
                                ? t('tripSuggestions.publish.publishing')
                                : t(
                                      'tripSuggestions.publish.confirmPublish',
                                  )}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Unpublish dialog */}
            <Dialog
                open={unpublishDialogOpen}
                onOpenChange={(open) => {
                    if (!publishSubmitting) setUnpublishDialogOpen(open);
                }}
            >
                <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle>
                            {t('tripSuggestions.publish.unpublishTitle')}
                        </DialogTitle>
                        <DialogDescription>
                            {t(
                                'tripSuggestions.publish.unpublishDescription',
                            )}
                        </DialogDescription>
                    </DialogHeader>

                    {publishError && (
                        <p className="text-sm text-red-600">{publishError}</p>
                    )}

                    <DialogFooter>
                        <Button
                            variant="outline"
                            onClick={() => setUnpublishDialogOpen(false)}
                            disabled={publishSubmitting}
                        >
                            {t('tripSuggestions.publish.cancel')}
                        </Button>
                        <Button
                            variant="destructive"
                            onClick={handleUnpublish}
                            disabled={publishSubmitting}
                        >
                            {publishSubmitting
                                ? t('tripSuggestions.publish.unpublishing')
                                : t(
                                      'tripSuggestions.publish.confirmUnpublish',
                                  )}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
