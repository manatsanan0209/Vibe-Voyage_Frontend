import { useEffect, useMemo, useRef, useState } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { Wrapper, Status } from '@googlemaps/react-wrapper';
import PlaceDetailHoverCard from '@/components/planTrip/PlaceDetailHoverCard';
import type { ScheduleDay, ScheduleItem } from '@/types/schedule';

type MapProps = {
    schedule: ScheduleDay[];
};

type SelectedRouteDay = number | 'all';

type DayColor = {
    marker: string;
    markerBorder: string;
    route: string;
};

type ResolvedScheduleDay = {
    dayIndex: number;
    color: DayColor;
    stops: {
        item: ScheduleItem;
        order: number;
        position: google.maps.LatLngLiteral;
    }[];
};

type RoutePolyline = google.maps.Polyline;

type ComputedRoute = {
    createPolylines: (options?: {
        polylineOptions?: google.maps.PolylineOptions;
    }) => RoutePolyline[];
};

type RoutesLibrary = {
    Route: {
        computeRoutes: (request: {
            origin: google.maps.LatLngLiteral;
            destination: google.maps.LatLngLiteral;
            intermediates?: { location: google.maps.LatLngLiteral }[];
            optimizeWaypointOrder?: boolean;
            travelMode?: 'DRIVING';
            fields: string[];
        }) => Promise<{ routes?: ComputedRoute[] }>;
    };
};

const DAY_COLORS: DayColor[] = [
    { marker: '#4f46e5', markerBorder: '#3730a3', route: '#4f46e5' },
    { marker: '#dc2626', markerBorder: '#991b1b', route: '#dc2626' },
    { marker: '#059669', markerBorder: '#047857', route: '#059669' },
    { marker: '#d97706', markerBorder: '#92400e', route: '#d97706' },
    { marker: '#0891b2', markerBorder: '#0e7490', route: '#0891b2' },
    { marker: '#9333ea', markerBorder: '#6b21a8', route: '#9333ea' },
    { marker: '#e11d48', markerBorder: '#9f1239', route: '#e11d48' },
    { marker: '#2563eb', markerBorder: '#1d4ed8', route: '#2563eb' },
];

function getDayColor(dayIndex: number): DayColor {
    return DAY_COLORS[dayIndex % DAY_COLORS.length];
}

function render(status: Status) {
    switch (status) {
        case Status.LOADING:
            return <div className="p-4">Loading map...</div>;
        case Status.FAILURE:
            return <div className="p-4">Failed to load map</div>;
        case Status.SUCCESS:
            return <></>;
        default:
            return <div className="p-4">Loading map...</div>;
    }
}

function sortedScheduleItems(day: ScheduleDay) {
    return [...day.items].sort((a, b) => a.sequence_order - b.sequence_order);
}

function MapMarkerHoverPin({
    item,
    order,
    color,
}: {
    item: ScheduleItem;
    order: number;
    color: DayColor;
}) {
    return (
        <PlaceDetailHoverCard
            placeName={item.place_name}
            type={item.type}
            status={item.place_detail_status}
            detail={item.place_detail}
        >
            <div className="relative flex h-11 w-9 cursor-pointer items-start justify-center bg-transparent p-0 outline-none transition-transform duration-150 hover:-translate-y-1 focus-visible:-translate-y-1">
                <span
                    className="z-10 flex size-8 items-center justify-center rounded-full border-2 text-sm font-bold text-white shadow-md ring-2 ring-white/90"
                    style={{
                        backgroundColor: color.marker,
                        borderColor: color.markerBorder,
                    }}
                >
                    {order}
                </span>
                <span
                    className="absolute left-1/2 top-6 h-3.5 w-3.5 -translate-x-1/2 rotate-45 border-b-2 border-r-2 shadow-sm"
                    style={{
                        backgroundColor: color.marker,
                        borderColor: color.markerBorder,
                    }}
                    aria-hidden="true"
                />
            </div>
        </PlaceDetailHoverCard>
    );
}

function createMarkerContent(
    item: ScheduleItem,
    color: DayColor,
    order: number,
) {
    const content = document.createElement('div');
    const root = createRoot(content);

    root.render(<MapMarkerHoverPin item={item} order={order} color={color} />);

    return { content, root };
}

function RouteDaySelector({
    schedule,
    selectedRouteDay,
    onSelect,
}: {
    schedule: ScheduleDay[];
    selectedRouteDay: SelectedRouteDay;
    onSelect: (day: SelectedRouteDay) => void;
}) {
    if (schedule.length < 2) return null;

    return (
        <div
            className="absolute left-3 right-14 top-3 z-10 flex items-center gap-1.5 overflow-x-auto rounded-lg border border-border/80 bg-background/95 p-1.5 shadow-md backdrop-blur [scrollbar-width:none] sm:right-3 [&::-webkit-scrollbar]:hidden"
            onPointerDown={(event) => event.stopPropagation()}
        >
            {schedule.map((day, dayIndex) => {
                const color = getDayColor(dayIndex);
                const selected = selectedRouteDay === dayIndex;

                return (
                    <button
                        key={day.id}
                        type="button"
                        className={`inline-flex h-8 shrink-0 items-center gap-1.5 rounded-md px-2.5 text-xs font-semibold transition ${
                            selected
                                ? 'bg-foreground text-background shadow-sm'
                                : 'text-foreground/75 hover:bg-muted'
                        }`}
                        onClick={() => onSelect(dayIndex)}
                    >
                        <span
                            className="size-2 rounded-full"
                            style={{ backgroundColor: color.route }}
                            aria-hidden="true"
                        />
                        Day {dayIndex + 1}
                    </button>
                );
            })}
            <button
                type="button"
                className={`inline-flex h-8 shrink-0 items-center rounded-md px-2.5 text-xs font-semibold transition ${
                    selectedRouteDay === 'all'
                        ? 'bg-foreground text-background shadow-sm'
                        : 'text-foreground/75 hover:bg-muted'
                }`}
                onClick={() => onSelect('all')}
            >
                All
            </button>
        </div>
    );
}

function GoogleMapCanvas({
    center,
    zoom,
    schedule,
}: {
    center: google.maps.LatLngLiteral;
    zoom: number;
    schedule: ScheduleDay[];
}) {
    const mapRef = useRef<HTMLDivElement | null>(null);
    const [map, setMap] = useState<google.maps.Map | null>(null);
    const [resolvedDays, setResolvedDays] = useState<ResolvedScheduleDay[]>([]);
    const [selectedRouteDay, setSelectedRouteDay] =
        useState<SelectedRouteDay>(0);

    useEffect(() => {
        if (!mapRef.current || map) return;
        setMap(
            new google.maps.Map(mapRef.current, {
                center,
                zoom,
                // mapId is required for AdvancedMarkerElement
                mapId: import.meta.env.VITE_GOOGLE_MAPS_MAP_ID ?? 'DEMO_MAP_ID',
                clickableIcons: false,
                mapTypeControl: false,
                fullscreenControl: false,
                streetViewControl: false,
                gestureHandling: 'greedy',
            }),
        );
    }, [center, zoom, map]);

    useEffect(() => {
        if (!map) return;
        map.setOptions({ center, zoom });
    }, [map, center, zoom]);

    useEffect(() => {
        if (
            typeof selectedRouteDay === 'number' &&
            selectedRouteDay >= schedule.length
        ) {
            let cancelled = false;
            queueMicrotask(() => {
                if (!cancelled) setSelectedRouteDay(0);
            });
            return () => {
                cancelled = true;
            };
        }
    }, [schedule.length, selectedRouteDay]);

    useEffect(() => {
        if (!map) return;

        const markers: google.maps.marker.AdvancedMarkerElement[] = [];
        const markerRoots: Root[] = [];
        const geocoder = new google.maps.Geocoder();
        let cancelled = false;

        queueMicrotask(() => {
            if (!cancelled) setResolvedDays([]);
        });

        const resolvePosition = (
            item: ScheduleDay['items'][number],
        ): Promise<google.maps.LatLngLiteral> => {
            if (item.location) return Promise.resolve(item.location);

            return new Promise((resolve, reject) => {
                const request: google.maps.GeocoderRequest = item.place_id
                    ? { placeId: item.place_id }
                    : { address: item.place_name };

                geocoder.geocode(request, (results, status) => {
                    if (
                        status === google.maps.GeocoderStatus.OK &&
                        results?.[0]?.geometry?.location
                    ) {
                        const loc = results[0].geometry.location;
                        resolve({ lat: loc.lat(), lng: loc.lng() });
                    } else {
                        reject(
                            new Error(
                                `Geocode failed for "${item.place_name}": ${status}`,
                            ),
                        );
                    }
                });
            });
        };

        (async () => {
            const resolvedDays: ResolvedScheduleDay[] = [];
            const bounds = new google.maps.LatLngBounds();
            let hasBounds = false;

            for (const [dayIndex, day] of schedule.entries()) {
                const color = getDayColor(dayIndex);
                const stops: ResolvedScheduleDay['stops'] = [];

                for (const [itemIndex, item] of sortedScheduleItems(
                    day,
                ).entries()) {
                    if (cancelled) return;
                    try {
                        const position = await resolvePosition(item);

                        if (cancelled) return;

                        const { content, root } = createMarkerContent(
                            item,
                            color,
                            itemIndex + 1,
                        );
                        markerRoots.push(root);

                        markers.push(
                            new google.maps.marker.AdvancedMarkerElement({
                                map,
                                position,
                                title: item.place_name,
                                content,
                                gmpClickable: true,
                            }),
                        );

                        bounds.extend(position);
                        hasBounds = true;
                        stops.push({ item, order: itemIndex + 1, position });
                    } catch (e) {
                        console.warn(e);
                    }
                }

                if (stops.length > 0) {
                    resolvedDays.push({ dayIndex, color, stops });
                }
            }

            if (cancelled) return;

            if (hasBounds) {
                map.fitBounds(bounds, 56);
            }

            setResolvedDays(resolvedDays);
        })();

        return () => {
            cancelled = true;
            markers.forEach((marker) => {
                marker.map = null;
            });
            markerRoots.forEach((root) => {
                queueMicrotask(() => {
                    root.unmount();
                });
            });
        };
    }, [map, schedule]);

    useEffect(() => {
        if (!map || resolvedDays.length === 0) return;

        const routePolylines: RoutePolyline[] = [];
        let cancelled = false;

        (async () => {
            const { Route } = (await google.maps.importLibrary(
                'routes',
            )) as unknown as RoutesLibrary;

            if (cancelled) return;

            const routeDays =
                selectedRouteDay === 'all'
                    ? resolvedDays
                    : resolvedDays.filter(
                          (day) => day.dayIndex === selectedRouteDay,
                      );

            for (const resolvedDay of routeDays) {
                if (cancelled) return;

                const routeStops = resolvedDay.stops.map(
                    (stop) => stop.position,
                );

                if (routeStops.length < 2) continue;

                try {
                    const { routes } = await Route.computeRoutes({
                        origin: routeStops[0],
                        destination: routeStops[routeStops.length - 1],
                        intermediates: routeStops
                            .slice(1, -1)
                            .map((position) => ({
                                location: position,
                            })),
                        optimizeWaypointOrder: false,
                        travelMode: 'DRIVING',
                        fields: ['path'],
                    });

                    if (cancelled) return;

                    const polylines =
                        routes?.[0]?.createPolylines({
                            polylineOptions: {
                                strokeColor: resolvedDay.color.route,
                                strokeOpacity: 0.82,
                                strokeWeight: 5,
                            },
                        }) ?? [];

                    polylines.forEach((polyline) => {
                        polyline.setMap(map);
                        routePolylines.push(polyline);
                    });
                } catch (e) {
                    console.warn(
                        `Directions failed for day ${resolvedDay.dayIndex + 1}`,
                        e,
                    );
                }
            }
        })();

        return () => {
            cancelled = true;
            routePolylines.forEach((polyline) => {
                polyline.setMap(null);
            });
        };
    }, [map, resolvedDays, selectedRouteDay]);

    return (
        <>
            <div ref={mapRef} className="absolute inset-0" />
            <RouteDaySelector
                schedule={schedule}
                selectedRouteDay={selectedRouteDay}
                onSelect={setSelectedRouteDay}
            />
        </>
    );
}

export default function Map({ schedule }: MapProps) {
    const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY as
        | string
        | undefined;

    const center = useMemo<google.maps.LatLngLiteral>(() => {
        for (const day of schedule) {
            for (const item of day.items) {
                if (item.location) return item.location;
            }
        }
        return { lat: 13.7563, lng: 100.5018 };
    }, [schedule]);

    if (!apiKey) {
        return (
            <div className="flex flex-col h-full min-h-0">
                <div className="relative w-11/12 mx-auto rounded-lg border overflow-hidden flex-1 min-h-0">
                    <div className="p-4">Missing API Key in `.env`</div>
                </div>
            </div>
        );
    }

    return (
        <div className="flex flex-col h-full min-h-0 pb-3 gap-3">
            <div className="relative w-11/12 mx-auto rounded-lg border overflow-hidden flex-1 min-h-0">
                <Wrapper apiKey={apiKey} libraries={['marker']} render={render}>
                    <GoogleMapCanvas
                        center={center}
                        zoom={12}
                        schedule={schedule}
                    />
                </Wrapper>
            </div>
        </div>
    );
}
