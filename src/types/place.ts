export type LatLngLiteral = {
    lat: number;
    lng: number;
};

export type PlaceSuggestion = {
    id: string;
    name: string;
    address: string;
    location: LatLngLiteral;
};
