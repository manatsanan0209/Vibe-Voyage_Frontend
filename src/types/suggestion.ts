export interface PublisherDTO {
    user_id: number;
    username: string;
    profile_image: string;
}

export interface TripSuggestionSummaryDTO {
    published_trip_id: number;
    trip_id: number;
    title: string;
    description?: string;
    destination_name: string;
    destination_id: string;
    start_date: string;
    end_date: string;
    view_count: number;
    like_count: number;
    publisher: PublisherDTO;
    is_liked: boolean;
    is_bookmarked: boolean;
    published_at: string;
}

export interface TripSuggestionFeedResponseDTO {
    total: number;
    page: number;
    limit: number;
    trips: TripSuggestionSummaryDTO[];
}

export interface SuggestionScheduleItemDTO {
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

export interface SuggestionScheduleDayDTO {
    day_number: number;
    items: SuggestionScheduleItemDTO[];
}

export interface TripSuggestionDetailDTO extends TripSuggestionSummaryDTO {
    schedule_days: SuggestionScheduleDayDTO[];
}

export interface LikeResponseDTO {
    liked: boolean;
}

export interface BookmarkResponseDTO {
    bookmarked: boolean;
}

export interface UseAsTemplateRequestDTO {
    room_name: string;
    room_image?: string;
    start_date: string;
    end_date: string;
}

export interface UseAsTemplateResponseDTO {
    room_id: number;
    trip_id: number;
    room_name: string;
    destination_name: string;
    start_date: string;
    end_date: string;
}

export interface PublishNotPublishedDTO {
    is_published: false;
}

export interface PublishedInfoDTO {
    is_published: true;
    published_trip_id: number;
    title: string;
    description?: string;
    view_count: number;
    like_count: number;
    published_at: string;
}

export type PublishCheckResponseDTO = PublishNotPublishedDTO | PublishedInfoDTO;

export interface PublishTripRequestDTO {
    title?: string;
    description?: string;
}

export interface PublishTripResponseDTO {
    published_trip_id: number;
    trip_id: number;
    title: string;
    description?: string;
    published_at: string;
}
