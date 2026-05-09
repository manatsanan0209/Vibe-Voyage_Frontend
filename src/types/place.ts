export type LatLngLiteral = {
    lat: number;
    lng: number;
};

export type PlaceType = 'Attraction' | 'Restaurant' | 'Hotel';

export type PlaceDetailStatus = 'cached' | 'pending' | 'unavailable';

export type PlaceOpeningHours = {
    weekday_text?: string[];
    open_now?: boolean;
};

export type PlaceDetail = {
    rating?: number | null;
    user_rating_count?: number | null;
    opening_hours?: PlaceOpeningHours | null;
    photo_url?: string | null;
    google_maps_uri?: string | null;
    editorial_summary?: string | null;
};

export type PlaceSuggestion = {
    id: string; // client DnD id
    place_id: string; // local/internal place id from backend
    name: string; // display name from backend
    address: string; // display address
    location: LatLngLiteral;
    type: PlaceType; // DB type ENUM
    place_detail_status?: PlaceDetailStatus;
    place_detail?: PlaceDetail | null;
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
    latitude?: number;
    longitude?: number;
}
