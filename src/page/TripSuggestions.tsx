import axios from 'axios';
import { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Loader2 } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import SuggestionCard from '@/components/tripSuggestions/SuggestionCard';
import { suggestionService } from '@/services/suggestion.service';
import type { TripSuggestionSummaryDTO } from '@/types/suggestion';
import { useI18n } from '@/hooks/useI18n';
import { useAuth } from '@/context/AuthContext';

const PAGE_LIMIT = 20;

export default function TripSuggestions() {
    const navigate = useNavigate();
    const { isAuthenticated } = useAuth();
    const { t } = useI18n();

    const [trips, setTrips] = useState<TripSuggestionSummaryDTO[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [page, setPage] = useState(1);
    const [total, setTotal] = useState(0);
    const [loadingMore, setLoadingMore] = useState(false);

    const [likeLoadingIds, setLikeLoadingIds] = useState<Set<number>>(
        new Set(),
    );
    const [bookmarkLoadingIds, setBookmarkLoadingIds] = useState<Set<number>>(
        new Set(),
    );

    useEffect(() => {
        let active = true;
        setLoading(true);
        setError(null);

        suggestionService
            .getFeed(1, PAGE_LIMIT)
            .then((res) => {
                if (!active) return;
                setTrips(res.trips);
                setTotal(res.total);
                setPage(1);
            })
            .catch((err: unknown) => {
                if (!active) return;
                if (axios.isAxiosError(err)) {
                    setError(
                        err.response?.data?.error ||
                            err.response?.data?.message ||
                            'Failed to load trips.',
                    );
                } else {
                    setError('Failed to load trips.');
                }
            })
            .finally(() => {
                if (!active) return;
                setLoading(false);
            });

        return () => {
            active = false;
        };
    }, []);

    async function loadMore() {
        const nextPage = page + 1;
        setLoadingMore(true);
        try {
            const res = await suggestionService.getFeed(nextPage, PAGE_LIMIT);
            setTrips((prev) => [...prev, ...res.trips]);
            setPage(nextPage);
        } catch {
            /* silently fail on load-more */
        } finally {
            setLoadingMore(false);
        }
    }

    const handleLike = useCallback(
        async (publishedTripId: number) => {
            if (!isAuthenticated) {
                navigate('/signin');
                return;
            }
            if (likeLoadingIds.has(publishedTripId)) return;

            setLikeLoadingIds((prev) => new Set(prev).add(publishedTripId));
            try {
                const res = await suggestionService.toggleLike(publishedTripId);
                setTrips((prev) =>
                    prev.map((t) =>
                        t.published_trip_id === publishedTripId
                            ? {
                                  ...t,
                                  is_liked: res.liked,
                                  like_count: res.liked
                                      ? t.like_count + 1
                                      : t.like_count - 1,
                              }
                            : t,
                    ),
                );
            } finally {
                setLikeLoadingIds((prev) => {
                    const next = new Set(prev);
                    next.delete(publishedTripId);
                    return next;
                });
            }
        },
        [isAuthenticated, likeLoadingIds, navigate],
    );

    const handleBookmark = useCallback(
        async (publishedTripId: number) => {
            if (!isAuthenticated) {
                navigate('/signin');
                return;
            }
            if (bookmarkLoadingIds.has(publishedTripId)) return;

            setBookmarkLoadingIds((prev) =>
                new Set(prev).add(publishedTripId),
            );
            try {
                const res =
                    await suggestionService.toggleBookmark(publishedTripId);
                setTrips((prev) =>
                    prev.map((t) =>
                        t.published_trip_id === publishedTripId
                            ? { ...t, is_bookmarked: res.bookmarked }
                            : t,
                    ),
                );
            } finally {
                setBookmarkLoadingIds((prev) => {
                    const next = new Set(prev);
                    next.delete(publishedTripId);
                    return next;
                });
            }
        },
        [isAuthenticated, bookmarkLoadingIds, navigate],
    );

    const hasMore = trips.length < total;

    return (
        <main className="flex flex-col gap-6 sm:gap-8 px-4 sm:px-8 pb-12">
            <div className="w-full rounded-4xl bg-muted px-4 sm:px-8 py-6 sm:py-8">
                <div className="mb-6">
                    <h1 className="text-2xl font-bold text-primary">
                        {t('tripSuggestions.title')}
                    </h1>
                    <p className="text-sm text-foreground/60 mt-1">
                        {t('tripSuggestions.subtitle')}
                    </p>
                </div>

                {loading && (
                    <div className="grid gap-5 grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4">
                        {Array.from({ length: 8 }).map((_, i) => (
                            <Skeleton
                                key={i}
                                className="h-64 w-full rounded-xl"
                            />
                        ))}
                        <div className="col-span-full flex items-center justify-center gap-2 text-primary mt-2">
                            <Loader2 className="size-4 animate-spin" />
                            <span className="text-sm font-medium">
                                {t('tripSuggestions.loading')}
                            </span>
                        </div>
                    </div>
                )}

                {!loading && error && (
                    <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-8 text-center text-sm text-red-600">
                        {error}
                    </div>
                )}

                {!loading && !error && trips.length === 0 && (
                    <div className="rounded-lg border border-dashed border-border bg-white px-4 py-12 text-center text-sm text-primary">
                        {t('tripSuggestions.empty')}
                    </div>
                )}

                {!loading && !error && trips.length > 0 && (
                    <>
                        <div className="grid gap-5 grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4">
                            {trips.map((trip) => (
                                <SuggestionCard
                                    key={trip.published_trip_id}
                                    trip={trip}
                                    onLike={handleLike}
                                    onBookmark={handleBookmark}
                                    onClick={(id) =>
                                        navigate(`/trips/${id}`)
                                    }
                                    likeLoading={likeLoadingIds.has(
                                        trip.published_trip_id,
                                    )}
                                    bookmarkLoading={bookmarkLoadingIds.has(
                                        trip.published_trip_id,
                                    )}
                                />
                            ))}
                        </div>

                        {hasMore && (
                            <div className="flex justify-center mt-8">
                                <button
                                    type="button"
                                    onClick={loadMore}
                                    disabled={loadingMore}
                                    className="flex items-center gap-2 rounded-lg border border-border bg-white px-6 py-2 text-sm font-medium text-primary hover:bg-muted transition-colors disabled:opacity-50"
                                >
                                    {loadingMore && (
                                        <Loader2 className="size-4 animate-spin" />
                                    )}
                                    {loadingMore ? t('common.loading') : 'Load more'}
                                </button>
                            </div>
                        )}
                    </>
                )}
            </div>
        </main>
    );
}
