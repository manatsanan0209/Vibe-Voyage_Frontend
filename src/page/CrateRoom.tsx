import { useEffect, useRef, useState } from 'react';
import { MdMoreHoriz } from 'react-icons/md';
import { MdIosShare } from 'react-icons/md';
import { Button } from '@/components/ui/button';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { useSidebar } from '@/components/ui/sidebar';
import RoomMembers from '@/components/room/RoomMembers';
import RoomPlanning from '@/components/room/RoomPlanning';
import { mockPlaces } from '@/lib/mockPlaces';
import { mockSchedule } from '@/lib/mockSchedule';
import type { PlaceSuggestion } from '@/types/place';
import type { ScheduleDay } from '@/types/schedule';

export default function CreateRoom() {
    const { setOpen } = useSidebar();

    const [places, setPlaces] = useState<PlaceSuggestion[]>(mockPlaces);
    const [schedule, setSchedule] = useState<ScheduleDay[]>(mockSchedule);
    const placeMapRef = useRef<Record<string, PlaceSuggestion>>(
        Object.fromEntries(mockPlaces.map(p => [p.id, p]))
    );

    useEffect(() => {
        setOpen(false);
        return () => setOpen(true);
    }, [setOpen]);

    useEffect(() => {
        console.log('[DnD] Data changed:', { places, schedule });
    }, [places, schedule]);

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
                        placeMapRef={placeMapRef}
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
