import axios from 'axios';
import type { ApiResponseDTO } from '@/types/api';
import { STORAGE_KEYS } from '@/lib/constants';
import type {
    TripSuggestionFeedResponseDTO,
    TripSuggestionDetailDTO,
    TripSuggestionSummaryDTO,
    LikeResponseDTO,
    BookmarkResponseDTO,
    UseAsTemplateRequestDTO,
    UseAsTemplateResponseDTO,
    PublishCheckResponseDTO,
    PublishTripRequestDTO,
    PublishTripResponseDTO,
} from '@/types/suggestion';

const apiBaseUrl = (import.meta.env.VITE_API_BASE_URL || '').replace(/\/$/, '');

function authHeader() {
    const token = localStorage.getItem(STORAGE_KEYS.TOKEN);
    return { Authorization: `Bearer ${token}` };
}

export const suggestionService = {
    async getFeed(
        page = 1,
        limit = 20,
    ): Promise<TripSuggestionFeedResponseDTO> {
        const { data } = await axios.get<
            ApiResponseDTO<TripSuggestionFeedResponseDTO>
        >(`${apiBaseUrl}/trip-suggestions?page=${page}&limit=${limit}`, {
            headers: authHeader(),
        });
        return data.data;
    },

    async getDetail(publishedTripId: number): Promise<TripSuggestionDetailDTO> {
        const { data } = await axios.get<
            ApiResponseDTO<TripSuggestionDetailDTO>
        >(`${apiBaseUrl}/trip-suggestions/${publishedTripId}`, {
            headers: authHeader(),
        });
        return data.data;
    },

    async toggleLike(publishedTripId: number): Promise<LikeResponseDTO> {
        const { data } = await axios.post<ApiResponseDTO<LikeResponseDTO>>(
            `${apiBaseUrl}/trip-suggestions/${publishedTripId}/like`,
            {},
            { headers: authHeader() },
        );
        return data.data;
    },

    async toggleBookmark(
        publishedTripId: number,
    ): Promise<BookmarkResponseDTO> {
        const { data } = await axios.post<ApiResponseDTO<BookmarkResponseDTO>>(
            `${apiBaseUrl}/trip-suggestions/${publishedTripId}/bookmark`,
            {},
            { headers: authHeader() },
        );
        return data.data;
    },

    async getBookmarks(): Promise<TripSuggestionSummaryDTO[]> {
        const { data } = await axios.get<
            ApiResponseDTO<TripSuggestionSummaryDTO[]>
        >(`${apiBaseUrl}/trip-suggestions/bookmarks`, {
            headers: authHeader(),
        });
        return data.data;
    },

    async useAsTemplate(
        publishedTripId: number,
        dto: UseAsTemplateRequestDTO,
    ): Promise<UseAsTemplateResponseDTO> {
        const { data } = await axios.post<
            ApiResponseDTO<UseAsTemplateResponseDTO>
        >(
            `${apiBaseUrl}/trip-suggestions/${publishedTripId}/use-as-template`,
            dto,
            { headers: authHeader() },
        );
        return data.data;
    },

    async checkPublishStatus(
        tripId: string,
    ): Promise<PublishCheckResponseDTO> {
        const { data } = await axios.get<
            ApiResponseDTO<PublishCheckResponseDTO>
        >(`${apiBaseUrl}/trip/${tripId}/publish`, {
            headers: authHeader(),
        });
        return data.data;
    },

    async publishTrip(
        tripId: string,
        dto: PublishTripRequestDTO,
    ): Promise<PublishTripResponseDTO> {
        const { data } = await axios.post<
            ApiResponseDTO<PublishTripResponseDTO>
        >(`${apiBaseUrl}/trip/${tripId}/publish`, dto, {
            headers: authHeader(),
        });
        return data.data;
    },

    async unpublishTrip(tripId: string): Promise<void> {
        await axios.delete(`${apiBaseUrl}/trip/${tripId}/publish`, {
            headers: authHeader(),
        });
    },
};
