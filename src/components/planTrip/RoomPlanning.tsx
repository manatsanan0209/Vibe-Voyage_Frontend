import { useState } from 'react';
import { MdMap, MdClose } from 'react-icons/md';
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
import { MAX_SLOTS_PER_DAY } from '@/lib/constants';
import { useSettings } from '@/context/SettingsContext';
import { useI18n } from '@/hooks/useI18n';

const SLOT_TIMES = [
    { start: '08:30', end: '10:30' },
    { start: '10:30', end: '12:30' },
    { start: '12:30', end: '14:30' },
    { start: '14:30', end: '16:30' },
];

function reorderItems(items: ScheduleDay['items']): ScheduleDay['items'] {
    return items.map((item, idx) => {
        const slot = SLOT_TIMES[idx] ?? SLOT_TIMES[SLOT_TIMES.length - 1];
        return {
            ...item,
            sequence_order: idx,
            start_time: slot.start,
            end_time: slot.end,
        };
    });
}

type RoomPlanningProps = {
    places: PlaceSuggestion[];
    setPlaces: React.Dispatch<React.SetStateAction<PlaceSuggestion[]>>;
    schedule: ScheduleDay[];
    setSchedule: React.Dispatch<React.SetStateAction<ScheduleDay[]>>;
    readOnly?: boolean;
};

export default function RoomPlanning({
    places,
    setPlaces,
    schedule,
    setSchedule,
    readOnly = false,
}: RoomPlanningProps) {
    const { formatTime } = useSettings();
    const formatTimeSafe = (value?: string) =>
        value ? formatTime(value) : '?';
    const { t } = useI18n();
    const [activeId, setActiveId] = useState<string | null>(null);
    const [showMap, setShowMap] = useState(false);

    const sensors = useSensors(
        useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    );

    function findContainer(id: string): string | null {
        if (id === 'suggestion-list' || places.some((p) => p.id === id)) {
            return 'suggestion-list';
        }
        for (const day of schedule) {
            if (id === day.id || day.items.some((i) => i.id === id))
                return day.id;
        }
        return null;
    }

    function onDragStart(event: DragStartEvent) {
        if (readOnly) return;
        setActiveId(String(event.active.id));
    }

    function onDragEnd(event: DragEndEvent) {
        if (readOnly) {
            setActiveId(null);
            return;
        }
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
                        const oldIdx = day.items.findIndex(
                            (i) => i.id === activeId,
                        );
                        const newIdx =
                            overId === day.id
                                ? day.items.length - 1
                                : day.items.findIndex((i) => i.id === overId);
                        if (oldIdx === -1 || newIdx === -1) return day;
                        const reordered = arrayMove(day.items, oldIdx, newIdx);
                        return {
                            ...day,
                            items: reorderItems(reordered),
                        };
                    }),
                );
            }
        } else if (activeContainer === 'suggestion-list') {
            // Suggestion → Schedule day
            const place = places.find((p) => p.id === activeId);
            if (!place) return;
            const targetDay = schedule.find((d) => d.id === overContainer);
            if (!targetDay) return;

            // ✅ Block if day is full
            if (targetDay.items.length >= MAX_SLOTS_PER_DAY) return;

            const newItem: ScheduleItem = {
                id: place.id,
                place_id: place.place_id,
                place_name: place.name,
                place_address: place.address,
                location: place.location,
                day_number: targetDay.day_number,
                sequence_order: 0,
                type: place.type,
                place_detail_status: place.place_detail_status,
                place_detail: place.place_detail,
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
                    return { ...day, items: reorderItems(newItems) };
                }),
            );
        } else if (overContainer === 'suggestion-list') {
            // Schedule day → Suggestion
            const sourceDay = schedule.find((d) => d.id === activeContainer);
            const movedItem = sourceDay?.items.find((i) => i.id === activeId);
            if (!movedItem) return;
            const restored: PlaceSuggestion = {
                id: movedItem.id,
                place_id: movedItem.place_id,
                name: movedItem.place_name,
                address: movedItem.place_address ?? '',
                location: movedItem.location ?? { lat: 13.7563, lng: 100.5018 },
                type: movedItem.type,
                place_detail_status: movedItem.place_detail_status,
                place_detail: movedItem.place_detail,
            };
            setSchedule((prev) =>
                prev.map((day) => {
                    if (day.id !== activeContainer) return day;
                    return {
                        ...day,
                        items: reorderItems(
                            day.items.filter((i) => i.id !== activeId),
                        ),
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

            const targetDay = schedule.find((d) => d.id === overContainer);
            if (!targetDay) return;

            // ✅ Block if target day is full (count after removing from source)
            const targetCountAfterMove =
                activeContainer === overContainer
                    ? targetDay.items.length // reorder, not adding
                    : targetDay.items.length;
            if (targetCountAfterMove >= MAX_SLOTS_PER_DAY) return;

            setSchedule((prev) => {
                const withRemoval = prev.map((day) => {
                    if (day.id !== activeContainer) return day;
                    return {
                        ...day,
                        items: reorderItems(
                            day.items.filter((i) => i.id !== activeId),
                        ),
                    };
                });
                return withRemoval.map((day) => {
                    if (day.id !== overContainer) return day;
                    const overIdx = day.items.findIndex((i) => i.id === overId);
                    const newItems = [...day.items];
                    const updatedItem: ScheduleItem = {
                        ...movedItem,
                        day_number: day.day_number,
                    };
                    if (overIdx >= 0) {
                        newItems.splice(overIdx, 0, updatedItem);
                    } else {
                        newItems.push(updatedItem);
                    }
                    return { ...day, items: reorderItems(newItems) };
                });
            });
        }
    }

    const activePlaceItem = places.find((p) => p.id === activeId);
    const activeScheduleItem = schedule
        .flatMap((d) => d.items)
        .find((i) => i.id === activeId);
    const dayOptions = schedule.map((day, index) => ({
        id: day.id,
        label: `${t('schedule.day')} ${index + 1}`,
        isFull: day.items.length >= MAX_SLOTS_PER_DAY,
    }));

    function addPlaceToDay(placeId: string, dayId: string) {
        if (readOnly) return;
        const place = places.find((p) => p.id === placeId);
        const targetDay = schedule.find((day) => day.id === dayId);
        if (!place || !targetDay || targetDay.items.length >= MAX_SLOTS_PER_DAY)
            return;

        const newItem: ScheduleItem = {
            id: place.id,
            place_id: place.place_id,
            place_name: place.name,
            place_address: place.address,
            location: place.location,
            day_number: targetDay.day_number,
            sequence_order: targetDay.items.length,
            type: place.type,
            place_detail_status: place.place_detail_status,
            place_detail: place.place_detail,
        };

        setPlaces((prev) => prev.filter((p) => p.id !== placeId));
        setSchedule((prev) =>
            prev.map((day) =>
                day.id === dayId
                    ? { ...day, items: reorderItems([...day.items, newItem]) }
                    : day,
            ),
        );
    }

    function moveScheduleItem(itemId: string, direction: -1 | 1) {
        if (readOnly) return;

        setSchedule((prev) =>
            prev.map((day) => {
                const currentIndex = day.items.findIndex(
                    (item) => item.id === itemId,
                );
                if (currentIndex === -1) return day;

                const nextIndex = currentIndex + direction;
                if (nextIndex < 0 || nextIndex >= day.items.length) return day;

                return {
                    ...day,
                    items: reorderItems(
                        arrayMove(day.items, currentIndex, nextIndex),
                    ),
                };
            }),
        );
    }

    function moveScheduleItemToDay(itemId: string, dayId: string) {
        if (readOnly) return;
        const sourceDay = schedule.find((day) =>
            day.items.some((item) => item.id === itemId),
        );
        const targetDay = schedule.find((day) => day.id === dayId);
        const item = sourceDay?.items.find(
            (scheduleItem) => scheduleItem.id === itemId,
        );

        if (
            !sourceDay ||
            !targetDay ||
            !item ||
            sourceDay.id === targetDay.id ||
            targetDay.items.length >= MAX_SLOTS_PER_DAY
        ) {
            return;
        }

        setSchedule((prev) =>
            prev.map((day) => {
                if (day.id === sourceDay.id) {
                    return {
                        ...day,
                        items: reorderItems(
                            day.items.filter(
                                (scheduleItem) => scheduleItem.id !== itemId,
                            ),
                        ),
                    };
                }

                if (day.id === targetDay.id) {
                    return {
                        ...day,
                        items: reorderItems([
                            ...day.items,
                            {
                                ...item,
                                day_number: day.day_number,
                            },
                        ]),
                    };
                }

                return day;
            }),
        );
    }

    function moveScheduleItemToSuggestions(itemId: string) {
        if (readOnly) return;
        const sourceDay = schedule.find((day) =>
            day.items.some((item) => item.id === itemId),
        );
        const movedItem = sourceDay?.items.find((item) => item.id === itemId);
        if (!sourceDay || !movedItem) return;

        const restored: PlaceSuggestion = {
            id: movedItem.id,
            place_id: movedItem.place_id,
            name: movedItem.place_name,
            address: movedItem.place_address ?? '',
            location: movedItem.location ?? { lat: 13.7563, lng: 100.5018 },
            type: movedItem.type,
            place_detail_status: movedItem.place_detail_status,
            place_detail: movedItem.place_detail,
        };

        setSchedule((prev) =>
            prev.map((day) =>
                day.id === sourceDay.id
                    ? {
                          ...day,
                          items: reorderItems(
                              day.items.filter((item) => item.id !== itemId),
                          ),
                      }
                    : day,
            ),
        );
        setPlaces((prev) => [...prev, restored]);
    }

    return (
        <DndContext
            sensors={sensors}
            collisionDetection={closestCorners}
            onDragStart={onDragStart}
            onDragEnd={onDragEnd}
        >
            <div className="grid h-full min-h-0 grid-cols-1 grid-rows-[minmax(12rem,0.85fr)_minmax(16rem,1.15fr)] gap-3 px-3 pb-20 md:grid-cols-2 md:grid-rows-none md:gap-2 md:px-0 md:pb-0 lg:grid-cols-3">
                <SuggestionList
                    places={places}
                    onDelete={(id) => {
                        if (readOnly) return;
                        setPlaces((prev) => prev.filter((p) => p.id !== id));
                    }}
                    onAdd={(place) => {
                        if (readOnly) return;
                        setPlaces((prev) => [...prev, place]);
                    }}
                    days={dayOptions}
                    onAddToDay={addPlaceToDay}
                    readOnly={readOnly}
                />
                <YourSchedule
                    days={schedule}
                    onDelete={(id) => {
                        if (readOnly) return;
                        setSchedule((prev) =>
                            prev.map((day) => ({
                                ...day,
                                items: reorderItems(
                                    day.items.filter((i) => i.id !== id),
                                ),
                            })),
                        );
                    }}
                    onMoveItem={moveScheduleItem}
                    onMoveItemToDay={moveScheduleItemToDay}
                    onMoveItemToSuggestions={moveScheduleItemToSuggestions}
                    dayOptions={dayOptions}
                    readOnly={readOnly}
                />
                {/* Map column — always visible on lg+, hidden on smaller screens */}
                <div className="hidden lg:block w-full h-full min-h-0">
                    <Map schedule={schedule} />
                </div>
            </div>

            {/* Map overlay for md and below */}
            {showMap && (
                <div className="fixed inset-0 z-50 lg:hidden">
                    <div
                        className="absolute inset-0 bg-black/50"
                        onClick={() => setShowMap(false)}
                    />
                    <div className="absolute inset-4 rounded-2xl overflow-hidden shadow-2xl">
                        <Map schedule={schedule} />
                        <button
                            onClick={() => setShowMap(false)}
                            className="absolute top-3 right-3 z-10 bg-white rounded-full p-1.5 shadow-md hover:bg-gray-100 transition-colors"
                        >
                            <MdClose className="w-5 h-5 text-gray-700" />
                        </button>
                    </div>
                </div>
            )}

            {/* Floating Map button — only on smaller than lg */}
            <button
                onClick={() => setShowMap(true)}
                className="fixed right-4 bottom-4 z-40 flex items-center gap-1.5 rounded-full bg-primary px-4 py-3 text-primary-foreground shadow-lg transition-all hover:bg-primary/90 active:scale-95 md:right-6 md:bottom-6 lg:hidden"
            >
                <MdMap className="w-5 h-5" />
                <span className="text-sm font-semibold">{t('map.map')}</span>
            </button>

            <DragOverlay>
                {activePlaceItem && (
                    <div className="flex flex-row items-center justify-between rounded-xl border-2 border-primary bg-background px-5 py-4 shadow-lg opacity-90 cursor-grabbing">
                        <div className="flex flex-col my-1">
                            <p className="text-primary text-sm">
                                {activePlaceItem.name}
                            </p>
                            <p className="text-primary text-sm">
                                {activePlaceItem.address}
                            </p>
                        </div>
                    </div>
                )}
                {activeScheduleItem && (
                    <div className="flex items-start gap-4 rounded-2xl bg-secondary/70 px-5 py-4 shadow-lg opacity-90 cursor-grabbing">
                        <div className="min-w-0">
                            <p className="text-base font-semibold tracking-tight">
                                {activeScheduleItem.start_time
                                    ? `${formatTimeSafe(activeScheduleItem.start_time)} – ${formatTimeSafe(activeScheduleItem.end_time)}`
                                    : t('schedule.noTimeSet')}
                            </p>
                            <p className="mt-1 text-sm text-foreground/80">
                                {activeScheduleItem.place_name}
                                {activeScheduleItem.place_address
                                    ? `, ${activeScheduleItem.place_address}`
                                    : ''}
                            </p>
                        </div>
                    </div>
                )}
            </DragOverlay>
        </DndContext>
    );
}
