import axios from 'axios';
import type { ApiResponseDTO } from '@/types/api';
import type { PlaceSuggestion, PlaceType } from '@/types/place';
import { STORAGE_KEYS } from '@/lib/constants';

function normalizeType(raw: string): PlaceType {
    const map: Record<string, PlaceType> = {
        attraction: 'Attraction',
        restaurant: 'Restaurant',
        hotel: 'Hotel',
        shopping: 'Attraction',
    };
    return map[raw.toLowerCase()] ?? 'Attraction';
}

const apiBaseUrl = (import.meta.env.VITE_API_BASE_URL || '').replace(/\/$/, '');

function authHeader() {
    const token = localStorage.getItem(STORAGE_KEYS.TOKEN);
    return { Authorization: `Bearer ${token}` };
}

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

export interface JoinTripByInviteCodeRequestDTO {
    invite_code: string;
}

export interface JoinTripByInviteCodeDataDTO {
    trip_id: number;
    room_id: number;
    destination_name: string;
    start_date: string;
    end_date: string;
    room_member_id: number;
    user_id: number;
    username: string;
    role: number;
    role_name: 'owner' | 'member' | 'unknown';
    joined_at: string;
}

export interface ScheduleItemResponseDTO {
    id: string;
    place_id: string;
    place_name: string;
    place_address?: string;
    location?: { lat: number; lng: number };
    day_number: number;
    sequence_order: number;
    start_time?: string;
    end_time?: string;
    type: PlaceType;
}

export interface ScheduleDayResponseDTO {
    day_number: number;
    date: string;
    schedules: ScheduleItemResponseDTO[];
}

interface RawScheduleItem {
    trip_schedule_id: number;
    day_number: number;
    sequence_order: number;
    place_name: string;
    place_id: string;
    latitude?: number;
    longitude?: number;
    place_address?: string;
    start_time?: string;
    end_time?: string;
    type: string;
}

interface RawScheduleDay {
    day_number: number;
    items: RawScheduleItem[];
}

interface GetScheduleResponseData {
    trip_id: number;
    destination_name: string;
    start_date: string;
    end_date: string;
    suggestions: RawScheduleItem[];
    days: RawScheduleDay[];
}

export interface ReplaceTripScheduleItemDTO {
    day_number: number;
    sequence_order: number;
    place_name: string;
    place_id: string;
    latitude: number;
    longitude: number;
    start_time: string;
    end_time: string;
    type: string;
}

export interface ReplaceTripScheduleRequestDTO {
    items: ReplaceTripScheduleItemDTO[];
}

export interface TripScheduleItemResponseDTO {
    trip_schedule_id: number;
    day_number: number;
    sequence_order: number;
    place_name: string;
    place_id: string;
    latitude: number;
    longitude: number;
    start_time: string;
    end_time: string;
    type: string;
}

// ---------- service ----------

export const tripService = {
    async createTrip(
        dto: CreateTripRequestDTO,
    ): Promise<CreateTripResponseDTO> {
        const { data } = await axios.post<
            ApiResponseDTO<CreateTripResponseDTO>
        >(`${apiBaseUrl}/trip`, dto, {
            headers: authHeader(),
        });
        return data.data;
    },

    async joinTripByInviteCode(
        inviteCode: string,
    ): Promise<JoinTripByInviteCodeDataDTO> {
        const payload: JoinTripByInviteCodeRequestDTO = {
            invite_code: inviteCode,
        };
        const { data } = await axios.post<
            ApiResponseDTO<JoinTripByInviteCodeDataDTO>
        >(`${apiBaseUrl}/trip/join-by-invite-code`, payload, {
            headers: authHeader(),
        });
        return data.data;
    },

    async getSchedule(tripId: string): Promise<{
        suggestions: PlaceSuggestion[];
        days: ScheduleDayResponseDTO[];
    }> {
        const { data } = await axios.get<
            ApiResponseDTO<GetScheduleResponseData>
        >(`${apiBaseUrl}/trip/${tripId}/schedule`, {
            headers: authHeader(),
        });

        console.log('[getSchedule] raw response data:', data.data);

        const SLOT_TIMES = [
            { start: '08:30', end: '10:30' },
            { start: '10:30', end: '12:30' },
            { start: '12:30', end: '14:30' },
            { start: '14:30', end: '16:30' },
        ];

        const mapItem = (item: RawScheduleItem): ScheduleItemResponseDTO => {
            const slot =
                SLOT_TIMES[item.sequence_order - 1] ??
                SLOT_TIMES[SLOT_TIMES.length - 1];
            return {
                id: String(item.trip_schedule_id),
                place_id: item.place_id,
                place_name: item.place_name,
                place_address: item.place_address,
                location:
                    item.latitude != null && item.longitude != null
                        ? { lat: item.latitude, lng: item.longitude }
                        : undefined,
                day_number: item.day_number,
                sequence_order: item.sequence_order,
                start_time: slot.start,
                end_time: slot.end,
                type: normalizeType(item.type),
            };
        };

        const suggestions: PlaceSuggestion[] = data.data.suggestions
            .filter((item) => item.place_id !== '')
            .map((item) => ({
                id: String(item.trip_schedule_id),
                place_id: item.place_id,
                name: item.place_name,
                address: item.place_address ?? '',
                location:
                    item.latitude != null && item.longitude != null
                        ? { lat: item.latitude, lng: item.longitude }
                        : { lat: 0, lng: 0 },
                type: normalizeType(item.type),
            }));

        const startDate = new Date(data.data.start_date);
        if (isNaN(startDate.getTime())) {
            throw new Error(
                `Invalid start_date from API: ${data.data.start_date}`,
            );
        }
        const days: ScheduleDayResponseDTO[] = [...data.data.days]
            .sort((a, b) => a.day_number - b.day_number)
            .map((day) => {
                const d = new Date(startDate);
                d.setDate(startDate.getDate() + (day.day_number - 1));
                return {
                    day_number: day.day_number,
                    date: d.toISOString().split('T')[0],
                    schedules: [...day.items]
                        .filter((item) => item.place_id !== '')
                        .sort((a, b) => a.sequence_order - b.sequence_order)
                        .map(mapItem),
                };
            });

        return { suggestions, days };
    },

    async replaceSchedule(
        tripId: string,
        dto: ReplaceTripScheduleRequestDTO,
    ): Promise<TripScheduleItemResponseDTO[]> {
        const { data } = await axios.put<
            ApiResponseDTO<TripScheduleItemResponseDTO[]>
        >(`${apiBaseUrl}/trip/${tripId}/schedule`, dto, {
            headers: authHeader(),
        });

        return data.data;
    },
};
