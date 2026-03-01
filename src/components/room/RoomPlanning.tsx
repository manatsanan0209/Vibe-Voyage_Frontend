import { useState } from 'react';
import type { RefObject } from 'react';
import {
    DndContext,
    DragOverlay,
    PointerSensor,
    useSensor,
    useSensors,
    closestCorners,
} from '@dnd-kit/core';
import type { DragEndEvent, DragStartEvent } from '@dnd-kit/core';
import { arrayMove } from '@dnd-kit/sortable';
import Map from './Column/Map';
import SuggestionList from './Column/SuggestionList';
import YourSchedule from './Column/YourSchedule';
import type { PlaceSuggestion } from '@/types/place';
import type { ScheduleDay, ScheduleItem } from '@/types/schedule';

type RoomPlanningProps = {
    places: PlaceSuggestion[];
    setPlaces: React.Dispatch<React.SetStateAction<PlaceSuggestion[]>>;
    schedule: ScheduleDay[];
    setSchedule: React.Dispatch<React.SetStateAction<ScheduleDay[]>>;
    placeMapRef: RefObject<Record<string, PlaceSuggestion>>;
};

export default function RoomPlanning({
    places,
    setPlaces,
    schedule,
    setSchedule,
    placeMapRef,
}: RoomPlanningProps) {
    const [activeId, setActiveId] = useState<string | null>(null);

    const sensors = useSensors(
        useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    );

    function findContainer(id: string): string | null {
        if (id === 'suggestion-list' || places.some((p) => p.id === id)) {
            return 'suggestion-list';
        }
        for (const day of schedule) {
            if (id === day.id || day.items.some((i) => i.id === id)) return day.id;
        }
        return null;
    }

    function onDragStart(event: DragStartEvent) {
        setActiveId(String(event.active.id));
    }

    function onDragEnd(event: DragEndEvent) {
        const { active, over } = event;
        setActiveId(null);
        if (!over) return;

        const activeId = String(active.id);
        const overId = String(over.id);
        if (activeId === overId) return;

        const activeContainer = findContainer(activeId);
        const overContainer = findContainer(overId);
        if (!activeContainer || !overContainer) return;

        if (activeContainer === overContainer) {
            // Same container — reorder
            if (activeContainer === 'suggestion-list') {
                setPlaces((prev) => {
                    const oldIdx = prev.findIndex((p) => p.id === activeId);
                    const newIdx =
                        overId === 'suggestion-list'
                            ? prev.length - 1
                            : prev.findIndex((p) => p.id === overId);
                    if (oldIdx === -1 || newIdx === -1) return prev;
                    return arrayMove(prev, oldIdx, newIdx);
                });
            } else {
                setSchedule((prev) =>
                    prev.map((day) => {
                        if (day.id !== activeContainer) return day;
                        const oldIdx = day.items.findIndex((i) => i.id === activeId);
                        const newIdx =
                            overId === day.id
                                ? day.items.length - 1
                                : day.items.findIndex((i) => i.id === overId);
                        if (oldIdx === -1 || newIdx === -1) return day;
                        return {
                            ...day,
                            items: arrayMove(day.items, oldIdx, newIdx),
                        };
                    }),
                );
            }
        } else if (activeContainer === 'suggestion-list') {
            // Suggestion → Schedule day
            const place = places.find((p) => p.id === activeId);
            if (!place) return;
            const newItem: ScheduleItem = {
                id: place.id,
                timeRange: '',
                title: place.name,
                subtitle: place.address,
            };
            setPlaces((prev) => prev.filter((p) => p.id !== activeId));
            setSchedule((prev) =>
                prev.map((day) => {
                    if (day.id !== overContainer) return day;
                    const overIdx = day.items.findIndex((i) => i.id === overId);
                    const newItems = [...day.items];
                    if (overIdx >= 0) {
                        newItems.splice(overIdx, 0, newItem);
                    } else {
                        newItems.push(newItem);
                    }
                    return { ...day, items: newItems };
                }),
            );
        } else if (overContainer === 'suggestion-list') {
            // Schedule day → Suggestion
            const sourceDay = schedule.find((d) => d.id === activeContainer);
            const movedItem = sourceDay?.items.find((i) => i.id === activeId);
            if (!movedItem) return;
            const restored: PlaceSuggestion = placeMapRef.current?.[movedItem.id] ?? {
                id: movedItem.id,
                name: movedItem.title,
                address: movedItem.subtitle ?? '',
                location: { lat: 13.7563, lng: 100.5018 },
            };
            setSchedule((prev) =>
                prev.map((day) => {
                    if (day.id !== activeContainer) return day;
                    return {
                        ...day,
                        items: day.items.filter((i) => i.id !== activeId),
                    };
                }),
            );
            setPlaces((prev) => {
                const overIdx = prev.findIndex((p) => p.id === overId);
                const newPlaces = [...prev];
                if (overIdx >= 0) {
                    newPlaces.splice(overIdx, 0, restored);
                } else {
                    newPlaces.push(restored);
                }
                return newPlaces;
            });
        } else {
            // Between two schedule days
            const sourceDay = schedule.find((d) => d.id === activeContainer);
            const movedItem = sourceDay?.items.find((i) => i.id === activeId);
            if (!movedItem) return;
            setSchedule((prev) => {
                const withRemoval = prev.map((day) => {
                    if (day.id !== activeContainer) return day;
                    return {
                        ...day,
                        items: day.items.filter((i) => i.id !== activeId),
                    };
                });
                return withRemoval.map((day) => {
                    if (day.id !== overContainer) return day;
                    const overIdx = day.items.findIndex((i) => i.id === overId);
                    const newItems = [...day.items];
                    if (overIdx >= 0) {
                        newItems.splice(overIdx, 0, movedItem);
                    } else {
                        newItems.push(movedItem);
                    }
                    return { ...day, items: newItems };
                });
            });
        }
    }

    const activePlaceItem = places.find((p) => p.id === activeId);
    const activeScheduleItem = schedule
        .flatMap((d) => d.items)
        .find((i) => i.id === activeId);

    return (
        <DndContext
            sensors={sensors}
            collisionDetection={closestCorners}
            onDragStart={onDragStart}
            onDragEnd={onDragEnd}
        >
            <div className="grid grid-cols-3 gap-2 h-full min-h-0">
                <SuggestionList places={places} />
                <YourSchedule days={schedule} />
                <Map places={places} />
            </div>

            <DragOverlay>
                {activePlaceItem && (
                    <div className="flex flex-row items-center justify-between rounded-xl border-2 border-indigo-600 bg-background px-5 py-4 shadow-lg opacity-90 cursor-grabbing">
                        <div className="flex flex-col my-1">
                            <p className="text-indigo-600 text-sm">
                                {activePlaceItem.name}
                            </p>
                            <p className="text-indigo-600 text-sm">
                                {activePlaceItem.address}
                            </p>
                        </div>
                    </div>
                )}
                {activeScheduleItem && (
                    <div className="flex items-start gap-4 rounded-2xl bg-indigo-100/70 px-5 py-4 shadow-lg opacity-90 cursor-grabbing">
                        <div className="min-w-0">
                            <p className="text-base font-semibold tracking-tight">
                                {activeScheduleItem.timeRange}
                            </p>
                            <p className="mt-1 text-sm text-foreground/80">
                                {activeScheduleItem.title}
                                {activeScheduleItem.subtitle
                                    ? `, ${activeScheduleItem.subtitle}`
                                    : ''}
                            </p>
                        </div>
                    </div>
                )}
            </DragOverlay>
        </DndContext>
    );
}
