import { Heart, Bookmark, Eye, MapPin, Calendar } from 'lucide-react';
import { differenceInDays, parseISO } from 'date-fns';
import type { TripSuggestionSummaryDTO } from '@/types/suggestion';
import { useI18n } from '@/hooks/useI18n';

const FALLBACK_IMAGE = 'https://picsum.photos/seed/trip-suggest/400/240';
const FALLBACK_AVATAR = 'https://picsum.photos/seed/avatar/40/40';

interface SuggestionCardProps {
    trip: TripSuggestionSummaryDTO;
    onLike: (publishedTripId: number) => void;
    onBookmark: (publishedTripId: number) => void;
    onClick: (publishedTripId: number) => void;
    likeLoading?: boolean;
    bookmarkLoading?: boolean;
}

export default function SuggestionCard({
    trip,
    onLike,
    onBookmark,
    onClick,
    likeLoading = false,
    bookmarkLoading = false,
}: SuggestionCardProps) {
    const { t } = useI18n();

    const tripDays =
        differenceInDays(parseISO(trip.end_date), parseISO(trip.start_date)) +
        1;

    function handleLike(e: React.MouseEvent) {
        e.stopPropagation();
        onLike(trip.published_trip_id);
    }

    function handleBookmark(e: React.MouseEvent) {
        e.stopPropagation();
        onBookmark(trip.published_trip_id);
    }

    function handleCardKeyDown(e: React.KeyboardEvent<HTMLDivElement>) {
        if (e.key !== 'Enter' && e.key !== ' ') return;
        e.preventDefault();
        onClick(trip.published_trip_id);
    }

    return (
        <div
            role="button"
            tabIndex={0}
            onClick={() => onClick(trip.published_trip_id)}
            onKeyDown={handleCardKeyDown}
            className="w-full rounded-xl border border-border bg-card text-card-foreground overflow-hidden flex flex-col text-left cursor-pointer hover:shadow-md hover:border-ring transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
        >
            {/* Cover image */}
            <div className="relative w-full aspect-video overflow-hidden">
                <img
                    src={FALLBACK_IMAGE}
                    alt={trip.title}
                    className="w-full h-full object-cover"
                />
                {/* View count badge */}
                <div className="absolute top-2 left-2 flex items-center gap-1 bg-black/50 text-white text-xs px-2 py-1 rounded-full">
                    <Eye className="size-3" />
                    <span>{trip.view_count}</span>
                </div>
                {/* Bookmark button */}
                <button
                    type="button"
                    onClick={handleBookmark}
                    disabled={bookmarkLoading}
                    className="absolute top-2 right-2 size-8 flex items-center justify-center rounded-full bg-black/50 text-white hover:bg-black/70 transition-colors disabled:opacity-50"
                    title={
                        trip.is_bookmarked
                            ? t('tripSuggestions.unbookmark')
                            : t('tripSuggestions.bookmark')
                    }
                >
                    <Bookmark
                        className="size-4"
                        fill={trip.is_bookmarked ? 'currentColor' : 'none'}
                    />
                </button>
            </div>

            {/* Content */}
            <div className="flex flex-col gap-2 p-3 flex-1">
                {/* Title */}
                <p className="text-sm font-bold text-primary leading-tight line-clamp-2">
                    {trip.title}
                </p>

                {/* Destination + duration */}
                <div className="flex items-center gap-3 text-xs text-foreground/60">
                    <span className="flex items-center gap-1">
                        <MapPin className="size-3 shrink-0" />
                        {trip.destination_name}
                    </span>
                    <span className="flex items-center gap-1">
                        <Calendar className="size-3 shrink-0" />
                        {tripDays} {t('tripSuggestions.days')}
                    </span>
                </div>

                {/* Description */}
                {trip.description && (
                    <p className="text-xs text-foreground/70 line-clamp-2">
                        {trip.description}
                    </p>
                )}

                {/* Footer: publisher + like */}
                <div className="flex items-center justify-between mt-auto pt-1">
                    {/* Publisher */}
                    <div className="flex items-center gap-1.5 min-w-0">
                        <img
                            src={
                                trip.publisher.profile_image || FALLBACK_AVATAR
                            }
                            alt={trip.publisher.username}
                            className="size-5 rounded-full object-cover shrink-0"
                        />
                        <span className="text-xs text-foreground/60 truncate">
                            {trip.publisher.username}
                        </span>
                    </div>

                    {/* Like button */}
                    <button
                        type="button"
                        onClick={handleLike}
                        disabled={likeLoading}
                        className="flex items-center gap-1 text-xs text-foreground/60 hover:text-red-500 transition-colors disabled:opacity-50 shrink-0"
                        title={
                            trip.is_liked
                                ? t('tripSuggestions.unlike')
                                : t('tripSuggestions.like')
                        }
                    >
                        <Heart
                            className="size-4"
                            fill={trip.is_liked ? '#ef4444' : 'none'}
                            stroke={trip.is_liked ? '#ef4444' : 'currentColor'}
                        />
                        <span>{trip.like_count}</span>
                    </button>
                </div>
            </div>
        </div>
    );
}
