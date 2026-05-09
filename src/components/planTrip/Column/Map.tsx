import { useEffect, useMemo, useRef, useState } from 'react';
import { Wrapper, Status } from '@googlemaps/react-wrapper';
import type { ScheduleDay } from '@/types/schedule';

type MapProps = {
    schedule: ScheduleDay[];
};

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
        if (!map) return;

        const markers: google.maps.marker.AdvancedMarkerElement[] = [];
        const geocoder = new google.maps.Geocoder();

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

        let cancelled = false;

        (async () => {
            for (const day of schedule) {
                for (const item of day.items) {
                    if (cancelled) return;
                    try {
                        const position = await resolvePosition(item);

                        if (cancelled) return;

                        const pin = new google.maps.marker.PinElement({
                            glyph: String(item.sequence_order + 1),
                            glyphColor: '#ffffff',
                            background: '#4f46e5',
                            borderColor: '#4338ca',
                        });

                        markers.push(
                            new google.maps.marker.AdvancedMarkerElement({
                                map,
                                position,
                                title: item.place_name,
                                content: pin.element,
                            }),
                        );
                    } catch (e) {
                        console.warn(e);
                    }
                }
            }
        })();

        return () => {
            cancelled = true;
            markers.forEach((marker) => {
                marker.map = null;
            });
        };
    }, [map, schedule]);

    return <div ref={mapRef} className="absolute inset-0" />;
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
