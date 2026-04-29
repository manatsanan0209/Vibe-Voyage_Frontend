import type { TripSuggestionSummaryDTO } from './suggestion';

export interface ProfileDTO {
    user_id: number;
    username: string;
    full_name: string;
    email: string;
    profile_image: string;
}

export interface UpdateProfileRequestDTO {
    username?: string;
    full_name?: string;
    profile_image?: string;
}

export interface ProfilePostsResponseDTO {
    total: number;
    page: number;
    limit: number;
    posts: TripSuggestionSummaryDTO[];
}
