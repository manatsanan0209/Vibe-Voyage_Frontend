import axios from 'axios';
import type { ApiResponseDTO } from '@/types/api';
import { STORAGE_KEYS } from '@/lib/constants';

const apiBaseUrl = (import.meta.env.VITE_API_BASE_URL || '').replace(/\/$/, '');

// ---------- request / response DTOs ----------

export interface PreferredDestinationDTO {
    destination_id: string;
    destination_name: string;
    latitude?: number;
    longitude?: number;
}

export interface CreateTripRequestDTO {
    room_name: string;
    room_image: string;
    destination_name: string;
    destination_id: string;
    start_date: string;
    end_date: string;
    preferred_destinations: PreferredDestinationDTO[];
    voyage_vibes: string[];
    voyage_priorities: string[];
    food_vibes: string[];
    additional_notes: string;
}

export interface CreateTripResponseDTO {
    trip_id: string;
}

// ---------- service ----------

export const tripService = {
    async createTrip(
        dto: CreateTripRequestDTO,
    ): Promise<CreateTripResponseDTO> {
        const token = localStorage.getItem(STORAGE_KEYS.TOKEN);
        const { data } = await axios.post<
            ApiResponseDTO<CreateTripResponseDTO>
        >(`${apiBaseUrl}/trip`, dto, {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        });
        return data.data;
    },
};
