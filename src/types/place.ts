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
