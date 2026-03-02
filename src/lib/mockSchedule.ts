import type { ScheduleDay } from '@/types/schedule';
import { TIME_SLOTS } from './constants';

/** Assign start_time / end_time to every item based on its sequence_order and the day's date */
export function assignTimes(date: string, items: ScheduleDay['items']): ScheduleDay['items'] {
    return items.map((item, idx) => {
        const slot = TIME_SLOTS[idx];
        if (!slot) return item;
        return {
            ...item,
            sequence_order: idx,
            start_time: `${date}T${slot.start}:00`,
            end_time: `${date}T${slot.end}:00`,
        };
    });
}

export const mockSchedule: ScheduleDay[] = [
    {
        id: 'day-1',
        day_number: 1,
        date: '2025-04-21',
        dateLabel: '21 April 2025',
        items: assignTimes('2025-04-21', [
            {
                id: 'sch-1',
                place_id: 'sch-place-1',
                place_name: 'เดอะคิวบ์ประชาอุทิศ',
                place_address: 'ราษฎร์บูรณะ, กทม',
                location: { lat: 13.6519, lng: 100.5045 },
                day_number: 1,
                sequence_order: 0,
                type: 'Attraction',
            },
            {
                id: 'sch-2',
                place_id: 'sch-place-2',
                place_name: 'แมคโครประชาอุทิศ',
                place_address: 'ราษฎร์บูรณะ, กทม',
                location: { lat: 13.652, lng: 100.506 },
                day_number: 1,
                sequence_order: 1,
                type: 'Attraction',
            },
            {
                id: 'sch-3',
                place_id: 'sch-place-3',
                place_name: 'King Mongkut Food Center',
                place_address: 'บางมด, กทม',
                location: { lat: 13.6509, lng: 100.493 },
                day_number: 1,
                sequence_order: 2,
                type: 'Restaurant',
            },
            {
                id: 'sch-4',
                place_id: 'sch-place-4',
                place_name: 'ตึกวิศวฯ มจธ.',
                place_address: 'บางมด, กทม',
                location: { lat: 13.651, lng: 100.494 },
                day_number: 1,
                sequence_order: 3,
                type: 'Attraction',
            },
        ]),
    },
    {
        id: 'day-2',
        day_number: 2,
        date: '2025-04-22',
        dateLabel: '22 April 2025',
        items: assignTimes('2025-04-22', [
            {
                id: 'sch-5',
                place_id: 'sch-place-5',
                place_name: 'วัดอรุณราชวราราม',
                place_address: 'บางกอกใหญ่, กทม',
                location: { lat: 13.7437, lng: 100.4889 },
                day_number: 2,
                sequence_order: 0,
                type: 'Attraction',
            },
            {
                id: 'sch-6',
                place_id: 'sch-place-6',
                place_name: 'เยาวราช',
                place_address: 'สัมพันธวงศ์, กทม',
                location: { lat: 13.7384, lng: 100.5091 },
                day_number: 2,
                sequence_order: 1,
                type: 'Restaurant',
            },
            {
                id: 'sch-7',
                place_id: 'sch-place-7',
                place_name: 'ICONSIAM',
                place_address: 'คลองสาน, กทม',
                location: { lat: 13.7266, lng: 100.5104 },
                day_number: 2,
                sequence_order: 2,
                type: 'Attraction',
            },
        ]),
    },
];
