import type {
    LatLngLiteral,
    PlaceDetail,
    PlaceDetailStatus,
    PlaceType,
} from './place';

export type ScheduleItem = {
    id: string; // client DnD id
    place_id: string; // DB: local/internal place id
    place_name: string; // DB: place_name
    place_address?: string; // display only
    location?: LatLngLiteral; // display only (for map pins)
    day_number: number; // DB: day_number (1-based)
    sequence_order: number; // DB: sequence_order (auto-managed, 0-based)
    start_time?: string; // DB: start_time (ISO datetime, auto-assigned by slot)
    end_time?: string; // DB: end_time (ISO datetime, auto-assigned by slot)
    type: PlaceType; // DB: type ENUM
    place_detail_status?: PlaceDetailStatus;
    place_detail?: PlaceDetail | null;
};

export type ScheduleDay = {
    id: string; // DnD container id (e.g. "day-1")
    day_number: number; // 1-based, maps to DB day_number
    date: string; // YYYY-MM-DD, used to generate ISO times
    dateLabel?: string;
    items: ScheduleItem[];
};
