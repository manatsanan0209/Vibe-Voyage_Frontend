export type LatLngLiteral = {
    lat: number;
    lng: number;
};

export type PlaceType = 'Attraction' | 'Restaurant' | 'Hotel';

export type PlaceSuggestion = {
    id: string; // client DnD id
    place_id: string; // Google Places API id → DB place_id
    name: string; // display name → DB place_name
    address: string; // display address
    location: LatLngLiteral;
    type: PlaceType; // DB type ENUM
};
export interface Region {
    region_id: string;
    region_name_th: string;
}

export interface Province {
    province_id: string;
    province_name_th: string;
    region_id: string;
    region: Region;
}

export interface District {
    district_id: string;
    district_name_th: string;
    province_id: string;
    province: Province;
}

export interface Attraction {
    id: string;
    name_th: string;
}
