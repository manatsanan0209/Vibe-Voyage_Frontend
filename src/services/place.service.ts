import axios from 'axios';
import type { ApiResponseDTO } from '@/types/api';
import type { District, Attraction } from '@/types/place';

const apiBaseUrl = (import.meta.env.VITE_API_BASE_URL || '').replace(/\/$/, '');

export type DestinationOption = {
    value: string;
    label: string;
};

export type AttractionOption = {
    value: string;
    label: string;
    lat?: number;
    lng?: number;
};

export const placeService = {
    async fetchDistrictData(): Promise<District[]> {
        const { data } = await axios.get<ApiResponseDTO<District[]>>(
            `${apiBaseUrl}/places/districts`,
        );

        return data.data;
    },

    async fetchDistricts(): Promise<DestinationOption[]> {
        const districts = await this.fetchDistrictData();

        const seenProvinces = new Map<string, string>();
        districts.forEach((d) => {
            if (!seenProvinces.has(d.province.province_id)) {
                seenProvinces.set(
                    d.province.province_id,
                    d.province.province_name_th,
                );
            }
        });

        const provinceEntries: DestinationOption[] = Array.from(
            seenProvinces.entries(),
        )
            .sort((a, b) => a[1].localeCompare(b[1], 'th'))
            .map(([id, name]) => ({
                value: `province_${id}`,
                label: name,
            }));

        const districtEntries: DestinationOption[] = districts.map((d) => ({
            value: d.district_id,
            label: `${d.district_name_th}, ${d.province.province_name_th}`,
        }));

        return [...provinceEntries, ...districtEntries];
    },

    async searchAttractions(query: string): Promise<AttractionOption[]> {
        const { data } = await axios.get<ApiResponseDTO<Attraction[]>>(
            `${apiBaseUrl}/attractions/search`,
            {
                params: {
                    name: query,
                    fields: 'name_th,id,latitude,longitude',
                },
            },
        );

        return data.data.map((a) => ({
            value: a.id,
            label: a.name_th,
            lat: a.latitude,
            lng: a.longitude,
        }));
    },
};
