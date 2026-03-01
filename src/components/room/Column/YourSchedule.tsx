import { useDroppable } from '@dnd-kit/core';
import {
    SortableContext,
    useSortable,
    verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { ImBin } from 'react-icons/im';
import { Button } from '@/components/ui/button';
import type { ScheduleDay, ScheduleItem } from '@/types/schedule';

function SortableScheduleCard({
    item,
    dayIndex,
    index,
}: {
    item: ScheduleItem;
    dayIndex: number;
    index: number;
}) {
    const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
        useSortable({ id: item.id });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.4 : 1,
        animationDelay: `${(dayIndex * 6 + index) * 60}ms`,
        animationFillMode: 'both' as const,
    };

    return (
        <div
            ref={setNodeRef}
            style={style}
            {...attributes}
            {...listeners}
            className="relative motion-safe:animate-in motion-safe:fade-in motion-safe:slide-in-from-bottom-2 cursor-grab active:cursor-grabbing"
        >
            <div className="absolute -left-7 top-1/2 -translate-x-1/2 -translate-y-1/2 size-3 rounded-full bg-indigo-600 ring-4 ring-background" />
            <div className="flex items-start justify-between gap-4 rounded-2xl bg-indigo-100/70 px-5 py-4 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md">
                <div className="min-w-0">
                    <p className="text-base font-semibold tracking-tight">
                        {item.timeRange}
                    </p>
                    <p className="mt-1 text-sm text-foreground/80">
                        {item.title}
                        {item.subtitle ? `, ${item.subtitle}` : ''}
                    </p>
                </div>
                <Button
                    variant="outline"
                    size="icon"
                    className="shrink-0 bg-background border border-border text-destructive hover:bg-destructive/10"
                    type="button"
                    aria-label="Delete"
                    onPointerDown={(e) => e.stopPropagation()}
                >
                    <ImBin />
                </Button>
            </div>
        </div>
    );
}

function DroppableDay({ day, dayIndex }: { day: ScheduleDay; dayIndex: number }) {
    const { setNodeRef } = useDroppable({ id: day.id });

    return (
        <section className="w-10/12 mx-auto">
            <div className="relative">
                <div className="absolute left-3 top-3 bottom-0 border-l-2 border-dotted border-foreground/25" />

                <div className="flex items-start gap-4 pl-10">
                    <div className="absolute left-3 top-0 -translate-x-1/2 z-10 flex size-8 items-center justify-center rounded-full bg-background ring-4 ring-indigo-200">
                        <div className="size-3.5 rounded-full bg-indigo-600" />
                    </div>
                    <div>
                        <p className="text-[10px] font-bold uppercase tracking-[0.15em] text-indigo-500">
                            Day {dayIndex + 1}
                        </p>
                        <h3 className="text-base font-extrabold tracking-tight">
                            {day.dateLabel}
                        </h3>
                    </div>
                </div>

                <SortableContext
                    items={day.items.map((i) => i.id)}
                    strategy={verticalListSortingStrategy}
                >
                    <div
                        ref={setNodeRef}
                        className="mt-5 flex flex-col gap-4 pl-10 min-h-16"
                    >
                        {day.items.map((item, index) => (
                            <SortableScheduleCard
                                key={item.id}
                                item={item}
                                dayIndex={dayIndex}
                                index={index}
                            />
                        ))}
                    </div>
                </SortableContext>
            </div>
        </section>
    );
}

type YourScheduleProps = {
    days: ScheduleDay[];
};

export default function YourSchedule({ days }: YourScheduleProps) {
    return (
        <div className="flex flex-col h-full overflow-hidden">
            <div className="w-10/12 mx-auto mt-4 shrink-0">
                <h2 className="text-base font-bold tracking-tight">Your Schedule</h2>
                <div className="mt-2 h-px w-40 bg-foreground/20" />
            </div>

            <div className="pt-2 mt-2 flex flex-col gap-10 overflow-y-auto flex-1 min-h-0 pb-4">
                {days.map((day, dayIndex) => (
                    <DroppableDay key={day.id} day={day} dayIndex={dayIndex} />
                ))}
            </div>
        </div>
    );
}
