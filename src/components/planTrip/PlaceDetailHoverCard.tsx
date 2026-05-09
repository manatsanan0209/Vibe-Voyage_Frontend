import {
    cloneElement,
    isValidElement,
    useState,
    type MouseEvent,
    type ReactElement,
    type ReactNode,
} from 'react';
import { HoverCard as HoverCardPrimitive } from 'radix-ui';
import {
    Clock3,
    ExternalLink,
    ImageOff,
    Loader2,
    MapPin,
    Star,
} from 'lucide-react';
import type { PlaceDetail, PlaceDetailStatus, PlaceType } from '@/types/place';
import { cn } from '@/lib/utils';
import { useIsMobile } from '@/hooks/use-mobile';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';

type PlaceDetailHoverCardProps = {
    children: ReactNode;
    placeName: string;
    type: PlaceType;
    status?: PlaceDetailStatus;
    detail?: PlaceDetail | null;
};

function isDetailSupported(type: PlaceType): boolean {
    return type === 'Attraction' || type === 'Restaurant';
}

function formatReviewCount(value?: number | null): string {
    if (typeof value !== 'number') return 'No reviews yet';
    return `${new Intl.NumberFormat().format(value)} reviews`;
}

function getWeekdayLines(detail?: PlaceDetail | null): string[] {
    return (
        detail?.opening_hours?.weekday_text?.filter(Boolean).slice(0, 2) ?? []
    );
}

function PlaceImage({
    photoUrl,
    placeName,
}: {
    photoUrl?: string | null;
    placeName: string;
}) {
    return (
        <div className="relative aspect-[16/9] w-full overflow-hidden rounded-md bg-muted">
            {photoUrl ? (
                <img
                    src={photoUrl}
                    alt={placeName}
                    className="size-full object-cover"
                    loading="lazy"
                />
            ) : (
                <div className="flex size-full items-center justify-center text-muted-foreground">
                    <ImageOff className="size-6" aria-hidden="true" />
                </div>
            )}
        </div>
    );
}

function CachedDetailContent({
    placeName,
    detail,
}: {
    placeName: string;
    detail?: PlaceDetail | null;
}) {
    const weekdayLines = getWeekdayLines(detail);
    const hasRating = typeof detail?.rating === 'number';
    const openNow = detail?.opening_hours?.open_now;

    return (
        <div className="space-y-3">
            <PlaceImage photoUrl={detail?.photo_url} placeName={placeName} />

            <div className="space-y-1">
                <p className="line-clamp-2 text-sm font-semibold text-foreground">
                    {placeName}
                </p>
                <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                    <span className="inline-flex items-center gap-1">
                        <Star
                            className={cn(
                                'size-3.5',
                                hasRating
                                    ? 'fill-amber-400 text-amber-500'
                                    : 'text-muted-foreground',
                            )}
                            aria-hidden="true"
                        />
                        {hasRating ? detail?.rating?.toFixed(1) : 'No rating'}
                    </span>
                    <span>{formatReviewCount(detail?.user_rating_count)}</span>
                </div>
            </div>

            {(openNow != null || weekdayLines.length > 0) && (
                <div className="space-y-1 rounded-md bg-muted/70 px-3 py-2 text-xs text-foreground/80">
                    <div className="flex items-center gap-1.5 font-medium">
                        <Clock3 className="size-3.5" aria-hidden="true" />
                        {openNow == null
                            ? 'Opening hours'
                            : openNow
                              ? 'Open now'
                              : 'Closed now'}
                    </div>
                    {weekdayLines.map((line) => (
                        <p
                            key={line}
                            className="line-clamp-1 text-muted-foreground"
                        >
                            {line}
                        </p>
                    ))}
                </div>
            )}

            {detail?.editorial_summary && (
                <p className="line-clamp-3 text-xs leading-5 text-muted-foreground">
                    {detail.editorial_summary}
                </p>
            )}

            {detail?.google_maps_uri && (
                <a
                    href={detail.google_maps_uri}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1.5 text-xs font-semibold text-indigo-600 hover:text-indigo-700"
                >
                    <MapPin className="size-3.5" aria-hidden="true" />
                    Open in Google Maps
                    <ExternalLink className="size-3" aria-hidden="true" />
                </a>
            )}
        </div>
    );
}

function PendingContent({ placeName }: { placeName: string }) {
    return (
        <div className="space-y-3">
            <div className="flex items-center gap-2">
                <Loader2 className="size-4 animate-spin text-indigo-600" />
                <div className="min-w-0">
                    <p className="truncate text-sm font-semibold text-foreground">
                        {placeName}
                    </p>
                    <p className="text-xs text-muted-foreground">
                        Loading details
                    </p>
                </div>
            </div>
            <div className="space-y-2">
                <div className="h-20 rounded-md bg-muted" />
                <div className="h-2.5 w-5/6 rounded-full bg-muted" />
                <div className="h-2.5 w-2/3 rounded-full bg-muted" />
            </div>
        </div>
    );
}

function UnavailableContent({ placeName }: { placeName: string }) {
    return (
        <div className="space-y-2">
            <p className="line-clamp-2 text-sm font-semibold text-foreground">
                {placeName}
            </p>
            <p className="text-xs leading-5 text-muted-foreground">
                No place details available
            </p>
        </div>
    );
}

function DetailContent({
    placeName,
    status,
    detail,
}: {
    placeName: string;
    status?: PlaceDetailStatus;
    detail?: PlaceDetail | null;
}) {
    if (status === 'pending') {
        return <PendingContent placeName={placeName} />;
    }

    if (status === 'unavailable' || !detail) {
        return <UnavailableContent placeName={placeName} />;
    }

    return <CachedDetailContent placeName={placeName} detail={detail} />;
}

function isInteractiveTarget(target: EventTarget | null): boolean {
    return (
        target instanceof HTMLElement &&
        Boolean(
            target.closest(
                'button,a,input,select,textarea,[role="button"],[data-no-place-detail]',
            ),
        )
    );
}

export default function PlaceDetailHoverCard({
    children,
    placeName,
    type,
    status,
    detail,
}: PlaceDetailHoverCardProps) {
    const isMobile = useIsMobile();
    const [open, setOpen] = useState(false);

    if (!isDetailSupported(type) || (!status && !detail)) {
        return <>{children}</>;
    }

    if (isMobile) {
        const trigger = isValidElement(children)
            ? cloneElement(children as ReactElement<{ onClick?: unknown }>, {
                  onClick: (event: MouseEvent<HTMLElement>) => {
                      const originalOnClick = (
                          children as ReactElement<{
                              onClick?: (
                                  event: MouseEvent<HTMLElement>,
                              ) => void;
                          }>
                      ).props.onClick;

                      originalOnClick?.(event);
                      if (
                          event.defaultPrevented ||
                          isInteractiveTarget(event.target)
                      ) {
                          return;
                      }

                      setOpen(true);
                  },
              })
            : children;

        return (
            <>
                {trigger}
                <Dialog open={open} onOpenChange={setOpen}>
                    <DialogContent className="max-h-[85dvh] w-[calc(100vw-2rem)] overflow-y-auto rounded-2xl p-4 sm:max-w-md">
                        <DialogHeader>
                            <DialogTitle className="line-clamp-2 text-left text-base">
                                {placeName}
                            </DialogTitle>
                        </DialogHeader>
                        <DetailContent
                            placeName={placeName}
                            status={status}
                            detail={detail}
                        />
                    </DialogContent>
                </Dialog>
            </>
        );
    }

    return (
        <HoverCardPrimitive.Root openDelay={250} closeDelay={100}>
            <HoverCardPrimitive.Trigger asChild>
                {children}
            </HoverCardPrimitive.Trigger>
            <HoverCardPrimitive.Portal>
                <HoverCardPrimitive.Content
                    side="right"
                    align="start"
                    sideOffset={10}
                    collisionPadding={12}
                    className="z-50 w-[min(340px,calc(100vw-32px))] rounded-lg border border-border bg-background p-3 text-foreground shadow-xl outline-none data-[state=open]:animate-in data-[state=open]:fade-in-0 data-[state=open]:zoom-in-95"
                >
                    <DetailContent
                        placeName={placeName}
                        status={status}
                        detail={detail}
                    />
                    <HoverCardPrimitive.Arrow className="size-2.5 rotate-45 rounded-[2px] border-l border-t border-border bg-background" />
                </HoverCardPrimitive.Content>
            </HoverCardPrimitive.Portal>
        </HoverCardPrimitive.Root>
    );
}
