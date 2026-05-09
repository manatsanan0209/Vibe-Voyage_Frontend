import axios from 'axios';
import type { ApiResponseDTO } from '@/types/api';
import type {
    PlaceDetail,
    PlaceDetailStatus,
    PlaceSuggestion,
    PlaceType,
} from '@/types/place';
import type { PublishCheckResponseDTO } from '@/types/suggestion';
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

function normalizePlaceDetailStatus(
    raw?: string,
): PlaceDetailStatus | undefined {
    if (raw === 'cached' || raw === 'pending' || raw === 'unavailable') {
        return raw;
    }
    return undefined;
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
    place_detail_status?: PlaceDetailStatus;
    place_detail?: PlaceDetail | null;
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
    place_detail_status?: string;
    place_detail?: PlaceDetail | null;
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
    suggestions?: RawScheduleItem[];
    days: RawScheduleDay[];
}

export interface MappedScheduleResponseData {
    suggestions: PlaceSuggestion[];
    days: ScheduleDayResponseDTO[];
}

export type PlanTripRole = 1 | 2 | 3;
export type PlanTripRoleName = 'owner' | 'member' | 'spectator';

export interface PlanTripCurrentUser {
    user_id: number;
    room_member_id: number;
    role: PlanTripRole;
    role_name: PlanTripRoleName;
    can_edit: boolean;
    can_manage_room: boolean;
}

export interface PlanTripMember {
    room_member_id: number;
    room_id: number;
    user_id: number;
    username: string;
    profile_image: string | null;
    role: PlanTripRole;
    role_name: PlanTripRoleName;
    has_submitted_lifestyle: boolean;
    has_analyzed_lifestyle: boolean;
    lifestyle_id?: number | null;
}

export interface RescheduleReadinessWaitingMember {
    room_member_id?: number;
    user_id: number;
    username: string;
    profile_image?: string | null;
    lifestyle_id?: number | null;
}

export interface RescheduleReadinessDTO {
    status: 'not_owner' | 'waiting_for_member_analysis' | 'ready_to_reschedule';
    waiting_members: RescheduleReadinessWaitingMember[];
}

export interface PlanTripBootstrapDTO {
    trip_id: number;
    room_id: number;
    current_user: PlanTripCurrentUser;
    schedule: GetScheduleResponseData;
    members: PlanTripMember[];
    reschedule_readiness: RescheduleReadinessDTO;
    publish_status: PublishCheckResponseDTO | null;
    polling?: {
        schedule_poll_after_ms?: number;
        schedule_readiness_poll_after_ms?: number;
    };
}

export interface RescheduleScoreboardItemDTO {
    user_id: number;
    username: string;
    score: number;
    effective_score: number;
    times_served: number;
    deferred_count: number;
}

export interface RescheduleTripSuccessDTO {
    trip_id: number;
    scheduled_count: number;
    suggestions_count: number;
    round_count: number;
    selected_place_ids: string[];
    scoreboard: RescheduleScoreboardItemDTO[];
}

export interface RescheduleNotReadyMemberDTO {
    user_id: number;
    username: string;
    lifestyle_id: number | null;
}

export interface RescheduleConflictDataDTO {
    not_ready_members: RescheduleNotReadyMemberDTO[];
}

export interface ReplaceTripScheduleItemDTO {
    trip_schedule_id?: number;
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

const SLOT_TIMES = [
    { start: '08:30', end: '10:30' },
    { start: '10:30', end: '12:30' },
    { start: '12:30', end: '14:30' },
    { start: '14:30', end: '16:30' },
];

function mapScheduleResponse(
    raw: GetScheduleResponseData,
): MappedScheduleResponseData {
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
            place_detail_status: normalizePlaceDetailStatus(
                item.place_detail_status,
            ),
            place_detail: item.place_detail ?? null,
        };
    };

    const dayZeroSuggestions = raw.days
        .filter((day) => day.day_number === 0)
        .flatMap((day) => day.items);
    const mergedSuggestionsRaw = [
        ...(raw.suggestions ?? []),
        ...dayZeroSuggestions,
    ];

    const uniqueSuggestionsRaw = mergedSuggestionsRaw.filter(
        (item, index, arr) => {
            const key = `${item.trip_schedule_id}:${item.place_id}:${item.place_name}`;
            return (
                index ===
                arr.findIndex(
                    (candidate) =>
                        `${candidate.trip_schedule_id}:${candidate.place_id}:${candidate.place_name}` ===
                        key,
                )
            );
        },
    );

    const suggestions: PlaceSuggestion[] = uniqueSuggestionsRaw
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
            place_detail_status: normalizePlaceDetailStatus(
                item.place_detail_status,
            ),
            place_detail: item.place_detail ?? null,
        }));

    const startDate = new Date(raw.start_date);
    if (isNaN(startDate.getTime())) {
        throw new Error(`Invalid start_date from API: ${raw.start_date}`);
    }

    const days: ScheduleDayResponseDTO[] = [...raw.days]
        .filter((day) => day.day_number > 0)
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

        return mapScheduleResponse(data.data);
    },

    async getPlanTripBootstrap(
        tripId: string,
    ): Promise<
        Omit<PlanTripBootstrapDTO, 'schedule'> & {
            schedule: MappedScheduleResponseData;
        }
    > {
        const { data } = await axios.get<ApiResponseDTO<PlanTripBootstrapDTO>>(
            `${apiBaseUrl}/trip/${tripId}/plan-trip-bootstrap`,
            {
                headers: authHeader(),
            },
        );

        return {
            ...data.data,
            schedule: mapScheduleResponse(data.data.schedule),
        };
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

    async rescheduleTrip(tripId: string): Promise<RescheduleTripSuccessDTO> {
        const { data } = await axios.post<ApiResponseDTO<RescheduleTripSuccessDTO>>(
            `${apiBaseUrl}/trip/${tripId}/reschedule`,
            {},
            {
                headers: authHeader(),
            },
        );

        return data.data;
    },
};
