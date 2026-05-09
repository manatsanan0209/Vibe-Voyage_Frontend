import axios from 'axios';
import { Heart, Eye, MapPin, Calendar, Loader2 } from 'lucide-react';
import { differenceInDays, parseISO } from 'date-fns';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
    Card,
    CardContent,
    CardFooter,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { useAuth } from '@/context/AuthContext';
import { useI18n } from '@/hooks/useI18n';
import { suggestionService } from '@/services/suggestion.service';
import type { TripSuggestionSummaryDTO } from '@/types/suggestion';

const POPULAR_TRIPS_LIMIT = 4;
const FEED_PAGE_LIMIT = 50;
const FALLBACK_AVATAR = 'https://picsum.photos/seed/avatar/40/40';

function getInitials(username: string): string {
    return username.trim().slice(0, 2).toUpperCase();
}

function sortTripsByPopularity(
    trips: TripSuggestionSummaryDTO[],
): TripSuggestionSummaryDTO[] {
    return [...trips].sort((a, b) => {
        if (b.like_count !== a.like_count) {
            return b.like_count - a.like_count;
        }
        if (b.view_count !== a.view_count) {
            return b.view_count - a.view_count;
        }
        return (
            new Date(b.published_at).getTime() -
            new Date(a.published_at).getTime()
        );
    });
}

async function getPopularTrips(): Promise<TripSuggestionSummaryDTO[]> {
    const firstPage = await suggestionService.getFeed(1, FEED_PAGE_LIMIT);
    const trips = [...firstPage.trips];

    const totalPages = Math.ceil(firstPage.total / FEED_PAGE_LIMIT);

    for (let page = 2; page <= totalPages; page += 1) {
        const nextPage = await suggestionService.getFeed(page, FEED_PAGE_LIMIT);
        trips.push(...nextPage.trips);
    }

    return sortTripsByPopularity(trips).slice(0, POPULAR_TRIPS_LIMIT);
}

function TripCard({
    trip,
    rank,
    onClick,
    popularTitle,
    daysLabel,
}: {
    trip: TripSuggestionSummaryDTO;
    rank: number;
    onClick: (trip: TripSuggestionSummaryDTO) => void;
    popularTitle: string;
    daysLabel: string;
}) {
    const tripDays =
        differenceInDays(parseISO(trip.end_date), parseISO(trip.start_date)) +
        1;

    return (
        <button
            type="button"
            onClick={() => onClick(trip)}
            className="group h-full w-full text-left"
        >
            <Card className="relative h-full overflow-hidden rounded-[22px] border-border/70 bg-card/95 py-0 shadow-sm transition-all duration-300 group-hover:-translate-y-1 group-hover:border-primary/30 group-hover:shadow-xl group-focus-visible:border-primary/40 group-focus-visible:shadow-xl sm:rounded-[26px]">
                <div className="absolute inset-x-5 top-0 h-px bg-gradient-to-r from-transparent via-primary/40 to-transparent" />

                <CardHeader className="relative min-h-38 overflow-hidden rounded-t-[22px] border-b border-border/50 bg-[linear-gradient(135deg,hsl(var(--primary)/0.18),hsl(var(--background))_50%,rgba(251,191,36,0.18))] px-4 py-4 sm:min-h-44 sm:rounded-t-[26px] sm:px-5 sm:py-5">
                    <div className="absolute right-3 top-3 text-5xl font-black leading-none text-primary/10 transition-transform duration-300 group-hover:scale-110 group-hover:text-primary/15 sm:right-4 sm:top-4 sm:text-[4.5rem]">
                        {rank}
                    </div>
                    <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(255,255,255,0.5),transparent_45%)] opacity-70" />

                    <div className="relative z-10 flex h-full flex-col justify-between gap-4">
                        <div className="flex flex-wrap items-center gap-2">
                            <Badge className="rounded-full bg-primary px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.12em] text-primary-foreground shadow-sm sm:px-3 sm:text-[11px] sm:tracking-[0.2em]">
                                {popularTitle}
                            </Badge>
                            <Badge
                                variant="secondary"
                                className="rounded-full border border-white/60 bg-white/75 px-2.5 py-1 text-[10px] font-semibold text-foreground shadow-sm backdrop-blur sm:px-3 sm:text-[11px]"
                            >
                                Top #{rank}
                            </Badge>
                        </div>

                        <div className="relative max-w-[88%] space-y-2 sm:max-w-[84%]">
                            <CardTitle className="line-clamp-2 text-lg font-extrabold leading-tight text-primary sm:text-xl">
                                {trip.title}
                            </CardTitle>
                            <p className="line-clamp-1 text-sm leading-5 text-foreground/70">
                                {trip.description || trip.destination_name}
                            </p>
                        </div>

                        <div className="flex flex-wrap items-center gap-2">
                            <Badge
                                variant="secondary"
                                className="max-w-full rounded-full border border-white/70 bg-white/80 px-3 py-1 text-xs text-foreground shadow-sm backdrop-blur"
                            >
                                <MapPin className="size-3.5 shrink-0 text-primary" />
                                <span className="truncate">
                                    {trip.destination_name}
                                </span>
                            </Badge>
                            <Badge
                                variant="secondary"
                                className="rounded-full border border-white/70 bg-white/80 px-3 py-1 text-xs text-foreground shadow-sm backdrop-blur"
                            >
                                <Calendar className="size-3.5 shrink-0 text-primary" />
                                {tripDays} {daysLabel}
                            </Badge>
                        </div>
                    </div>
                </CardHeader>

                <CardContent className="px-4 py-3 sm:px-5 sm:py-1">
                    <div className="flex items-center gap-3">
                        <Avatar className="size-11 ring-2 ring-primary/10">
                            <AvatarImage
                                src={
                                    trip.publisher.profile_image ||
                                    FALLBACK_AVATAR
                                }
                                alt={trip.publisher.username}
                            />
                            <AvatarFallback>
                                {getInitials(trip.publisher.username)}
                            </AvatarFallback>
                        </Avatar>

                        <div className="min-w-0 flex-1">
                            <p className="truncate text-sm font-semibold text-foreground">
                                {trip.publisher.username}
                            </p>
                            <p className="mt-1 text-xs text-muted-foreground">
                                {trip.published_at
                                    ? new Date(
                                          trip.published_at,
                                      ).toLocaleDateString()
                                    : ''}
                            </p>
                        </div>
                    </div>
                </CardContent>

                <CardFooter className="mt-auto flex flex-wrap items-center justify-between gap-3 border-t border-border/50 px-4 py-3 sm:px-5 sm:py-3.5">
                    <div className="flex items-center gap-2 text-xs text-muted-foreground sm:gap-3">
                        <Badge
                            variant="outline"
                            className="rounded-full border-red-200 bg-red-50 px-2.5 py-1 text-red-600 sm:px-3"
                        >
                            <Heart className="size-3.5" />
                            {trip.like_count}
                        </Badge>
                        <Badge
                            variant="outline"
                            className="rounded-full border-border/70 bg-background px-2.5 py-1 text-foreground/75 sm:px-3"
                        >
                            <Eye className="size-3.5" />
                            {trip.view_count}
                        </Badge>
                    </div>

                    <span className="ml-auto text-xs font-semibold uppercase tracking-[0.12em] text-primary/70 transition-transform duration-300 group-hover:translate-x-1 sm:tracking-[0.18em]">
                        Top #{rank}
                    </span>
                </CardFooter>
            </Card>
        </button>
    );
}

export default function PopularTrips() {
    const navigate = useNavigate();
    const { user, isAuthenticated } = useAuth();
    const { t } = useI18n();

    const [trips, setTrips] = useState<TripSuggestionSummaryDTO[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        let active = true;

        getPopularTrips()
            .then((result) => {
                if (!active) return;
                setTrips(result);
            })
            .catch((err: unknown) => {
                if (!active) return;
                if (axios.isAxiosError(err)) {
                    setError(
                        err.response?.data?.error ||
                            err.response?.data?.message ||
                            'Failed to load popular trips.',
                    );
                } else {
                    setError('Failed to load popular trips.');
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

    function handleTripClick(trip: TripSuggestionSummaryDTO) {
        if (isAuthenticated && user?.id === trip.publisher.user_id) {
            navigate(`/your-trips/${trip.trip_id}`);
            return;
        }

        navigate(`/trips/${trip.published_trip_id}`);
    }

    return (
        <section className="w-full">
            <div className="relative overflow-hidden rounded-[24px] border border-border/60 bg-[linear-gradient(180deg,hsl(var(--background)),hsl(var(--muted)/0.4))] px-3 py-5 shadow-sm sm:rounded-[32px] sm:px-6 sm:py-8 lg:px-8">
                <div className="absolute inset-x-0 top-0 h-32 bg-[radial-gradient(circle_at_top_left,hsl(var(--primary)/0.12),transparent_55%)]" />
                <div className="relative flex flex-col gap-6 sm:gap-8">
                    <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
                        <div className="max-w-2xl space-y-3">
                            <Badge
                                variant="outline"
                                className="w-fit rounded-full border-primary/20 bg-primary/5 px-3 py-1 text-xs font-bold uppercase tracking-[0.12em] text-primary sm:tracking-[0.22em]"
                            >
                                {t('home.popularTitle')}
                            </Badge>
                            <div className="space-y-2">
                                <h2 className="text-2xl font-extrabold tracking-tight text-primary sm:text-3xl">
                                    {t('home.popularTitle')}
                                </h2>
                            </div>
                        </div>

                        <Button
                            type="button"
                            onClick={() => navigate('/trips')}
                            className="h-11 w-full rounded-full px-6 text-sm font-bold shadow-lg shadow-primary/15 transition-all hover:-translate-y-0.5 hover:shadow-xl hover:shadow-primary/20 sm:w-auto"
                        >
                            {t('home.seeMore')}
                        </Button>
                    </div>

                    {loading && (
                        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-4">
                            {Array.from({ length: POPULAR_TRIPS_LIMIT }).map(
                                (_, i) => (
                                    <Card
                                        key={i}
                                        className="overflow-hidden rounded-[26px] border-border/60 py-0"
                                    >
                                        <div className="space-y-0">
                                            <div className="space-y-3 rounded-t-[26px] bg-muted/40 px-4 py-4 sm:px-5 sm:py-4.5">
                                                <div className="flex gap-2">
                                                    <Skeleton className="h-6 w-24 rounded-full" />
                                                    <Skeleton className="h-6 w-18 rounded-full" />
                                                </div>
                                                <Skeleton className="h-7 w-3/4 rounded-xl" />
                                                <Skeleton className="h-4 w-1/2 rounded-lg" />
                                                <div className="flex gap-2">
                                                    <Skeleton className="h-7 w-28 rounded-full" />
                                                    <Skeleton className="h-7 w-24 rounded-full" />
                                                </div>
                                            </div>
                                            <div className="px-4 py-3 sm:px-5 sm:py-3.5">
                                                <div className="flex items-center gap-3">
                                                    <Skeleton className="size-11 rounded-full" />
                                                    <div className="flex-1 space-y-2">
                                                        <Skeleton className="h-4 w-1/2 rounded-lg" />
                                                        <Skeleton className="h-3 w-1/3 rounded-lg" />
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="flex items-center justify-between border-t border-border/50 px-4 py-3 sm:px-5 sm:py-3.5">
                                                <div className="flex gap-2">
                                                    <Skeleton className="h-8 w-16 rounded-full" />
                                                    <Skeleton className="h-8 w-16 rounded-full" />
                                                </div>
                                                <Skeleton className="h-4 w-16 rounded-lg" />
                                            </div>
                                        </div>
                                    </Card>
                                ),
                            )}
                            <div className="col-span-full flex items-center justify-center gap-2 text-primary">
                                <Loader2 className="size-4 animate-spin" />
                                <span className="text-sm font-medium">
                                    {t('tripSuggestions.loading')}
                                </span>
                            </div>
                        </div>
                    )}

                    {!loading && error && (
                        <Card className="rounded-[28px] border-red-200 bg-red-50/80 py-0 shadow-none">
                            <CardContent className="px-5 py-8 text-center text-sm text-red-600">
                                {error}
                            </CardContent>
                        </Card>
                    )}

                    {!loading && !error && trips.length === 0 && (
                        <Card className="rounded-[28px] border-dashed border-border/70 bg-card/80 py-0 shadow-none">
                            <CardContent className="px-5 py-10 text-center text-sm text-primary">
                                {t('tripSuggestions.empty')}
                            </CardContent>
                        </Card>
                    )}

                    {!loading && !error && trips.length > 0 && (
                        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-4">
                            {trips.map((trip, index) => (
                                <TripCard
                                    key={trip.published_trip_id}
                                    trip={trip}
                                    rank={index + 1}
                                    onClick={handleTripClick}
                                    popularTitle={t('home.popularTitle')}
                                    daysLabel={t('tripSuggestions.days')}
                                />
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </section>
    );
}
