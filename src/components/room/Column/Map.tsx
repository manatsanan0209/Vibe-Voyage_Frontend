import { useEffect, useMemo, useRef, useState } from 'react';
import { Wrapper, Status } from '@googlemaps/react-wrapper';
import { FiRepeat } from 'react-icons/fi';
import type { PlaceSuggestion } from '@/types/place';
import { Button } from '@/components/ui/button';

type MapProps = {
    places: PlaceSuggestion[];
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
    places,
}: {
    center: google.maps.LatLngLiteral;
    zoom: number;
    places: PlaceSuggestion[];
}) {
    const mapRef = useRef<HTMLDivElement | null>(null);
    const [map, setMap] = useState<google.maps.Map | null>(null);

    useEffect(() => {
        if (!mapRef.current || map) return;
        setMap(
            new google.maps.Map(mapRef.current, {
                center,
                zoom,
                clickableIcons: false,
                mapTypeControl: false,
                fullscreenControl: false,
                streetViewControl: false,
                // Allow scroll wheel / trackpad to zoom the map without modifier keys.
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

        const markers = places.map(
            (place) =>
                new google.maps.Marker({
                    map,
                    position: place.location,
                    title: place.name,
                }),
        );

        return () => {
            markers.forEach((marker) => marker.setMap(null));
        };
    }, [map, places]);

    return <div ref={mapRef} className="absolute inset-0" />;
}

export default function Map({ places }: MapProps) {
    const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY as
        | string
        | undefined;

    const center = useMemo<google.maps.LatLngLiteral>(() => {
        if (places.length > 0) return places[0].location;
        return { lat: 13.7563, lng: 100.5018 };
    }, [places]);

    if (!apiKey) {
        return (
            <div className="flex flex-col h-full min-h-0">
                <Button className="bg-sky-800 w-1/2 ml-auto mr-4 my-1">
                    <FiRepeat />
                    Re-gennerate
                </Button>
                <div className="relative w-11/12 mx-auto rounded-lg border overflow-hidden flex-1 min-h-0">
                    <div className="p-4">Missing API Key in `.env`</div>
                </div>
            </div>
        );
    }

    return (
        <div className="flex flex-col h-full min-h-0 pb-3">
            <Button className="bg-sky-800 w-1/2 ml-auto mr-4 my-1">
                <FiRepeat />
                Re-gennerate
            </Button>
            <div className="relative w-11/12 mx-auto rounded-lg border overflow-hidden flex-1 min-h-0">
                <Wrapper apiKey={apiKey} render={render}>
                    <GoogleMapCanvas
                        center={center}
                        zoom={12}
                        places={places}
                    />
                </Wrapper>
            </div>
        </div>
    );
}
