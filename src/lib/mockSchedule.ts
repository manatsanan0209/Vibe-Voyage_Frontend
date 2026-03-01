import type { ScheduleDay } from '@/types/schedule';

export const mockSchedule: ScheduleDay[] = [
    {
        id: 'day-2025-04-21',
        dateLabel: '21 April 2025',
        items: [
            {
                id: 'sch-1',
                timeRange: '08:00 AM - 10:00 AM',
                title: 'เดอะคิวบ์ประชาอุทิศ',
                subtitle: 'ราษฎร์บูรณะ, กทม',
            },
            {
                id: 'sch-2',
                timeRange: '10:30 AM - 12:00 PM',
                title: 'แมคโครประชาอุทิศ',
                subtitle: 'ราษฎร์บูรณะ, กทม',
            },
            {
                id: 'sch-3',
                timeRange: '12:30 PM - 01:00 PM',
                title: 'King Mongkut Food Center',
                subtitle: 'บางมด, กทม',
            },
            {
                id: 'sch-4',
                timeRange: '01:30 PM - 04:00 PM',
                title: 'ตึกวิศวฯ มจธ.',
                subtitle: 'บางมด, กทม',
            },
        ],
    },
    {
        id: 'day-2025-04-22',
        dateLabel: '22 April 2025',
        items: [
            {
                id: 'sch-5',
                timeRange: '09:00 AM - 11:00 AM',
                title: 'วัดอรุณราชวราราม',
                subtitle: 'บางกอกใหญ่, กทม',
            },
            {
                id: 'sch-6',
                timeRange: '12:00 PM - 02:00 PM',
                title: 'เยาวราช',
                subtitle: 'สัมพันธวงศ์, กทม',
            },
            {
                id: 'sch-7',
                timeRange: '03:00 PM - 05:00 PM',
                title: 'ICONSIAM',
                subtitle: 'คลองสาน, กทม',
            },
        ],
    },
];
