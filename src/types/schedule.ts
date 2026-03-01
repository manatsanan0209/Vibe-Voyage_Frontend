export type ScheduleItem = {
    id: string;
    timeRange: string;
    title: string;
    subtitle?: string;
};

export type ScheduleDay = {
    id: string;
    dateLabel: string;
    items: ScheduleItem[];
};
