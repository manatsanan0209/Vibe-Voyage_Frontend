import axios from 'axios';
import { useEffect, useState, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
    ArrowLeft,
    Heart,
    Bookmark,
    Eye,
    MapPin,
    Calendar,
    Copy,
} from 'lucide-react';
import { Loader2 } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import UseAsTemplateDialog from '@/components/tripSuggestions/UseAsTemplateDialog';
import { suggestionService } from '@/services/suggestion.service';
import type {
    TripSuggestionDetailDTO,
    SuggestionScheduleDayDTO,
} from '@/types/suggestion';
import { useI18n } from '@/hooks/useI18n';
import { useAuth } from '@/context/AuthContext';
import { differenceInDays, parseISO, format } from 'date-fns';

const FALLBACK_AVATAR = 'https://picsum.photos/seed/avatar/40/40';

function typeLabel(type: string): string {
    switch (type.toLowerCase()) {
        case 'restaurant':
            return '🍽️';
        case 'hotel':
            return '🏨';
        default:
            return '📍';
    }
}

function DaySchedule({ day }: { day: SuggestionScheduleDayDTO }) {
    const { t } = useI18n();
    return (
        <div className="flex flex-col gap-2">
            <h3 className="text-sm font-semibold text-primary">
                {t('tripSuggestions.day')} {day.day_number}
            </h3>
            {day.items.length === 0 ? (
                <p className="text-xs text-foreground/50 pl-2">—</p>
            ) : (
                <ol className="flex flex-col gap-1.5">
                    {day.items
                        .sort((a, b) => a.sequence_order - b.sequence_order)
                        .map((item) => (
                            <li
                                key={item.trip_schedule_id}
                                className="flex items-start gap-2 text-sm"
                            >
                                <span className="shrink-0 text-base leading-none mt-0.5">
                                    {typeLabel(item.type)}
                                </span>
                                <div className="flex flex-col">
                                    <span className="font-medium text-foreground/90">
                                        {item.place_name}
                                    </span>
                                    {item.start_time && item.end_time && (
                                        <span className="text-xs text-foreground/50">
                                            {item.start_time} – {item.end_time}
                                        </span>
                                    )}
                                </div>
                            </li>
                        ))}
                </ol>
            )}
        </div>
    );
}

export default function TripSuggestionDetail() {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const { isAuthenticated } = useAuth();
    const { t } = useI18n();

    const [trip, setTrip] = useState<TripSuggestionDetailDTO | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [likeLoading, setLikeLoading] = useState(false);
    const [bookmarkLoading, setBookmarkLoading] = useState(false);
    const [templateOpen, setTemplateOpen] = useState(false);

    useEffect(() => {
        if (!id) return;
        let active = true;
        setLoading(true);
        setError(null);

        suggestionService
            .getDetail(Number(id))
            .then((data) => {
                if (!active) return;
                setTrip(data);
            })
            .catch((err: unknown) => {
                if (!active) return;
                if (axios.isAxiosError(err)) {
                    setError(
                        err.response?.data?.error ||
                            err.response?.data?.message ||
                            'Failed to load trip.',
                    );
                } else {
                    setError('Failed to load trip.');
                }
            })
            .finally(() => {
                if (!active) return;
                setLoading(false);
            });

        return () => {
            active = false;
        };
    }, [id]);

    const handleLike = useCallback(async () => {
        if (!trip) return;
        if (!isAuthenticated) {
            navigate('/signin');
            return;
        }
        if (likeLoading) return;
        setLikeLoading(true);
        try {
            const res = await suggestionService.toggleLike(
                trip.published_trip_id,
            );
            setTrip((prev) =>
                prev
                    ? {
                          ...prev,
                          is_liked: res.liked,
                          like_count: res.liked
                              ? prev.like_count + 1
                              : prev.like_count - 1,
                      }
                    : prev,
            );
        } finally {
            setLikeLoading(false);
        }
    }, [trip, isAuthenticated, likeLoading, navigate]);

    const handleBookmark = useCallback(async () => {
        if (!trip) return;
        if (!isAuthenticated) {
            navigate('/signin');
            return;
        }
        if (bookmarkLoading) return;
        setBookmarkLoading(true);
        try {
            const res = await suggestionService.toggleBookmark(
                trip.published_trip_id,
            );
            setTrip((prev) =>
                prev ? { ...prev, is_bookmarked: res.bookmarked } : prev,
            );
        } finally {
            setBookmarkLoading(false);
        }
    }, [trip, isAuthenticated, bookmarkLoading, navigate]);

    if (loading) {
        return (
            <main className="flex flex-col gap-6 px-4 sm:px-8 pb-12">
                <div className="w-full rounded-4xl bg-muted px-4 sm:px-8 py-6 sm:py-8">
                    <Skeleton className="h-8 w-40 rounded-lg mb-6" />
                    <Skeleton className="h-6 w-64 rounded mb-2" />
                    <Skeleton className="h-4 w-48 rounded mb-6" />
                    <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
                        {Array.from({ length: 5 }).map((_, i) => (
                            <Skeleton key={i} className="h-32 rounded-lg" />
                        ))}
                    </div>
                    <div className="flex items-center justify-center gap-2 text-primary mt-4">
                        <Loader2 className="size-4 animate-spin" />
                        <span className="text-sm font-medium">
                            {t('common.loading')}
                        </span>
                    </div>
                </div>
            </main>
        );
    }

    if (error || !trip) {
        return (
            <main className="flex flex-col gap-6 px-4 sm:px-8 pb-12">
                <div className="w-full rounded-4xl bg-muted px-4 sm:px-8 py-6 sm:py-8">
                    <button
                        type="button"
                        onClick={() => navigate('/trips')}
                        className="flex items-center gap-1.5 text-sm text-foreground/60 hover:text-primary transition-colors mb-6"
                    >
                        <ArrowLeft className="size-4" />
                        {t('tripSuggestions.backToFeed')}
                    </button>
                    <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-8 text-center text-sm text-red-600">
                        {error ?? 'Trip not found.'}
                    </div>
                </div>
            </main>
        );
    }

    const tripDays =
        differenceInDays(
            parseISO(trip.end_date),
            parseISO(trip.start_date),
        ) + 1;

    const formattedStart = format(parseISO(trip.start_date), 'dd MMM yyyy');
    const formattedEnd = format(parseISO(trip.end_date), 'dd MMM yyyy');

    return (
        <main className="flex flex-col gap-6 px-4 sm:px-8 pb-12">
            <div className="w-full rounded-4xl bg-muted px-4 sm:px-8 py-6 sm:py-8">
                {/* Back */}
                <button
                    type="button"
                    onClick={() => navigate('/trips')}
                    className="flex items-center gap-1.5 text-sm text-foreground/60 hover:text-primary transition-colors mb-6"
                >
                    <ArrowLeft className="size-4" />
                    {t('tripSuggestions.backToFeed')}
                </button>

                <div className="flex flex-col lg:flex-row gap-8">
                    {/* Left — trip info */}
                    <div className="flex flex-col gap-5 lg:max-w-sm w-full shrink-0">
                        {/* Header */}
                        <div className="flex flex-col gap-2">
                            <h1 className="text-2xl font-bold text-primary">
                                {trip.title}
                            </h1>

                            <div className="flex flex-wrap items-center gap-3 text-sm text-foreground/60">
                                <span className="flex items-center gap-1">
                                    <MapPin className="size-4 shrink-0" />
                                    {trip.destination_name}
                                </span>
                                <span className="flex items-center gap-1">
                                    <Calendar className="size-4 shrink-0" />
                                    {formattedStart} – {formattedEnd} (
                                    {tripDays} {t('tripSuggestions.days')})
                                </span>
                            </div>

                            {trip.description && (
                                <p className="text-sm text-foreground/70">
                                    {trip.description}
                                </p>
                            )}
                        </div>

                        {/* Stats */}
                        <div className="flex items-center gap-4 text-sm text-foreground/60">
                            <span className="flex items-center gap-1">
                                <Eye className="size-4" />
                                {trip.view_count} {t('tripSuggestions.views')}
                            </span>
                            <span className="flex items-center gap-1">
                                <Heart className="size-4" />
                                {trip.like_count} {t('tripSuggestions.likes')}
                            </span>
                        </div>

                        {/* Publisher */}
                        <div className="flex items-center gap-2">
                            <img
                                src={
                                    trip.publisher.profile_image ||
                                    FALLBACK_AVATAR
                                }
                                alt={trip.publisher.username}
                                className="size-8 rounded-full object-cover"
                            />
                            <div className="flex flex-col text-sm">
                                <span className="text-foreground/50 text-xs">
                                    {t('tripSuggestions.by')}
                                </span>
                                <span className="font-medium text-foreground">
                                    {trip.publisher.username}
                                </span>
                            </div>
                        </div>

                        {/* Actions */}
                        <div className="flex flex-wrap gap-2">
                            <button
                                type="button"
                                onClick={handleLike}
                                disabled={likeLoading}
                                className="flex items-center gap-1.5 rounded-lg border border-border bg-white px-4 py-2 text-sm font-medium text-foreground/70 hover:border-red-300 hover:text-red-500 transition-colors disabled:opacity-50"
                            >
                                <Heart
                                    className="size-4"
                                    fill={
                                        trip.is_liked ? '#ef4444' : 'none'
                                    }
                                    stroke={
                                        trip.is_liked
                                            ? '#ef4444'
                                            : 'currentColor'
                                    }
                                />
                                {trip.is_liked
                                    ? t('tripSuggestions.unlike')
                                    : t('tripSuggestions.like')}
                            </button>

                            <button
                                type="button"
                                onClick={handleBookmark}
                                disabled={bookmarkLoading}
                                className="flex items-center gap-1.5 rounded-lg border border-border bg-white px-4 py-2 text-sm font-medium text-foreground/70 hover:border-primary hover:text-primary transition-colors disabled:opacity-50"
                            >
                                <Bookmark
                                    className="size-4"
                                    fill={
                                        trip.is_bookmarked
                                            ? 'currentColor'
                                            : 'none'
                                    }
                                />
                                {trip.is_bookmarked
                                    ? t('tripSuggestions.unbookmark')
                                    : t('tripSuggestions.bookmark')}
                            </button>

                            <Button
                                onClick={() => {
                                    if (!isAuthenticated) {
                                        navigate('/signin');
                                        return;
                                    }
                                    setTemplateOpen(true);
                                }}
                                className="flex items-center gap-1.5"
                            >
                                <Copy className="size-4" />
                                {t('tripSuggestions.useAsTemplate')}
                            </Button>
                        </div>
                    </div>

                    {/* Right — schedule */}
                    <div className="flex-1 min-w-0">
                        <h2 className="text-base font-semibold text-primary mb-4">
                            {t('tripSuggestions.schedule')}
                        </h2>

                        {trip.schedule_days.length === 0 ? (
                            <p className="text-sm text-foreground/50">
                                {t('tripSuggestions.noSchedule')}
                            </p>
                        ) : (
                            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2">
                                {[...trip.schedule_days]
                                    .sort(
                                        (a, b) => a.day_number - b.day_number,
                                    )
                                    .map((day) => (
                                        <div
                                            key={day.day_number}
                                            className="rounded-lg border border-border bg-white p-4"
                                        >
                                            <DaySchedule day={day} />
                                        </div>
                                    ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {templateOpen && (
                <UseAsTemplateDialog
                    open={templateOpen}
                    onOpenChange={setTemplateOpen}
                    publishedTripId={trip.published_trip_id}
                    destinationName={trip.destination_name}
                    originalDays={tripDays}
                />
            )}
        </main>
    );
}
