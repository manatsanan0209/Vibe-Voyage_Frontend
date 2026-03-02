import { useCallback, useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { MdMoreHoriz, MdIosShare, MdSave } from 'react-icons/md';
import { Button } from '@/components/ui/button';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { useSidebar } from '@/components/ui/sidebar';
import RoomMembers from '@/components/room/RoomMembers';
import RoomPlanning from '@/components/room/RoomPlanning';
import { tripService } from '@/services/trip.service';
import type { PlaceSuggestion } from '@/types/place';
import type { ScheduleDay } from '@/types/schedule';

function formatDateLabel(dateStr: string): string {
    if (!dateStr) return '';
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return '';
    return d.toLocaleDateString('en-GB', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
    });
}

export default function CreateRoom() {
    const { tripId } = useParams<{ tripId: string }>();
    const { setOpen } = useSidebar();

    const [places, setPlaces] = useState<PlaceSuggestion[]>([]);
    const [schedule, setSchedule] = useState<ScheduleDay[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        setOpen(false);
        return () => setOpen(true);
    }, [setOpen]);

    useEffect(() => {
        if (!tripId) return;
        tripService
            .getSchedule(tripId)
            .then(({ suggestions, days }) => {
                setPlaces(suggestions);
                const mapped: ScheduleDay[] = days.map((day) => ({
                    id: `day-${day.day_number}`,
                    day_number: day.day_number,
                    date: day.date,
                    dateLabel: formatDateLabel(day.date),
                    items: day.schedules,
                }));
                setSchedule(mapped);
            })
            .catch((err) => {
                console.error('[CreateRoom] Failed to load schedule:', err);
                setError('ไม่สามารถโหลดข้อมูลตารางเดินทางได้');
            })
            .finally(() => setLoading(false));
    }, [tripId]);

    useEffect(() => {
        console.log('[DnD] Data changed:', { places, schedule });
    }, [places, schedule]);

    // Build DB-ready payload from current state
    const buildPayload = useCallback(() => {
        const schedules = schedule.flatMap((day) =>
            day.items.map((item) => ({
                day_number: item.day_number,
                sequence_order: item.sequence_order,
                place_name: item.place_name,
                place_id: item.place_id,
                start_time: item.start_time ?? null,
                end_time: item.end_time ?? null,
                type: item.type,
            })),
        );
        return { schedules };
    }, [schedule]);

    const handleSavePlan = useCallback(() => {
        const payload = buildPayload();
        console.log('[SavePlan] payload:', JSON.stringify(payload, null, 2));
        // TODO: call POST /trips and POST /trip-schedules with payload
    }, [buildPayload]);

    if (loading) {
        return (
            <div className="h-[calc(100dvh-6rem)] w-full flex items-center justify-center">
                <p className="text-foreground/50 text-sm">กำลังโหลดข้อมูล...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="h-[calc(100dvh-6rem)] w-full flex items-center justify-center">
                <p className="text-red-500 text-sm">{error}</p>
            </div>
        );
    }

    return (
        <div className="h-[calc(100dvh-6rem)] w-full flex flex-col overflow-hidden">
            <div className="flex flex-row items-end justify-end gap-6 pr-6 shrink-0">
                <Button className="h-auto rounded-md font-semibold bg-indigo-600 text-white hover:bg-indigo-700 border-2 border-transparent">
                    <MdMoreHoriz />
                    More
                </Button>
                <Button className="h-auto rounded-md font-semibold bg-white text-indigo-600 border-2 border-indigo-600 hover:bg-indigo-50">
                    <MdIosShare />
                    Share
                </Button>
                <Button
                    className="h-auto rounded-md font-semibold bg-indigo-600 text-white hover:bg-indigo-700 border-2 border-transparent"
                    onClick={handleSavePlan}
                >
                    <MdSave />
                    Save Plan
                </Button>
            </div>

            <Tabs defaultValue="planning" className="flex-1 min-h-0">
                <TabsList
                    variant="line"
                    className="w-full justify-start rounded-lg bg-transparent border-b border-foreground/10 shrink-0"
                >
                    <TabsTrigger value="planning" className="text-base">
                        Planning Trip
                    </TabsTrigger>
                    <TabsTrigger value="member" className="text-base">
                        Members
                    </TabsTrigger>
                </TabsList>

                <TabsContent
                    value="planning"
                    className="flex-1 min-h-0 overflow-hidden"
                >
                    <RoomPlanning
                        places={places}
                        setPlaces={setPlaces}
                        schedule={schedule}
                        setSchedule={setSchedule}
                    />
                </TabsContent>
                <TabsContent
                    value="member"
                    className="flex-1 min-h-0 overflow-y-auto"
                >
                    <RoomMembers />
                </TabsContent>
            </Tabs>
        </div>
    );
}
