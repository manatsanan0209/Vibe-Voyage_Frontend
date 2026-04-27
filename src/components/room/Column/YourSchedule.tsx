import { useDroppable } from '@dnd-kit/core';
import {
    SortableContext,
    useSortable,
    verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { ImBin } from 'react-icons/im';
import { Button } from '@/components/ui/button';
import type { PlaceType } from '@/types/place';
import type { ScheduleDay, ScheduleItem } from '@/types/schedule';
import { MAX_SLOTS_PER_DAY } from '@/lib/constants';
import { useSettings } from '@/context/SettingsContext';
import { useI18n } from '@/hooks/useI18n';

const TYPE_STYLE: Record<PlaceType, string> = {
    Attraction: 'bg-blue-100 text-blue-700',
    Restaurant: 'bg-orange-100 text-orange-700',
    Hotel: 'bg-green-100 text-green-700',
};

function SortableScheduleCard({
    item,
    dayIndex,
    index,
    onDelete,
    readOnly,
}: {
    item: ScheduleItem;
    dayIndex: number;
    index: number;
    onDelete: (id: string) => void;
    readOnly: boolean;
}) {
    const { formatTime } = useSettings();
    const { t } = useI18n();

    const formatTimeSafe = (value?: string) =>
        value ? formatTime(value) : '?';
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging,
    } = useSortable({ id: item.id });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.4 : 1,
        animationDelay: `${(dayIndex * 6 + index) * 60}ms`,
        animationFillMode: 'both' as const,
    };

    const timeLabel = item.start_time
        ? `${formatTimeSafe(item.start_time)} – ${formatTimeSafe(item.end_time)}`
        : t('schedule.noTimeSet');

    return (
        <div
            ref={setNodeRef}
            style={style}
            {...(!readOnly ? attributes : {})}
            {...(!readOnly ? listeners : {})}
            className={`relative motion-safe:animate-in motion-safe:fade-in motion-safe:slide-in-from-bottom-2 ${
                readOnly
                    ? 'cursor-default'
                    : 'cursor-grab active:cursor-grabbing'
            }`}
        >
            <div className="absolute -left-7 top-1/2 -translate-x-1/2 -translate-y-1/2 size-3 rounded-full bg-primary ring-4 ring-background" />
            <div className="flex items-start justify-between gap-4 rounded-2xl bg-secondary/70 px-5 py-4 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md">
                <div className="min-w-0 flex-1">
                    <p className="text-base font-semibold tracking-tight">
                        {timeLabel}
                    </p>
                    <p className="mt-1 text-sm text-foreground/80">
                        {item.place_name}
                        {item.place_address ? `, ${item.place_address}` : ''}
                    </p>
                    <span
                        className={`inline-block w-fit text-xs px-2 py-0.5 rounded-full font-medium mt-1.5 ${
                            TYPE_STYLE[item.type]
                        }`}
                    >
                        {item.type}
                    </span>
                </div>
                {!readOnly && (
                    <Button
                        variant="outline"
                        size="icon"
                        className="shrink-0 bg-background border border-border text-destructive hover:bg-destructive/10"
                        type="button"
                        aria-label="Delete"
                        onPointerDown={(e) => e.stopPropagation()}
                        onClick={() => onDelete(item.id)}
                    >
                        <ImBin />
                    </Button>
                )}
            </div>
        </div>
    );
}

function DroppableDay({
    day,
    dayIndex,
    onDelete,
    readOnly,
}: {
    day: ScheduleDay;
    dayIndex: number;
    onDelete: (id: string) => void;
    readOnly: boolean;
}) {
    const { formatDate } = useSettings();
    const { t } = useI18n();
    const { setNodeRef } = useDroppable({ id: day.id });
    const isFull = day.items.length >= MAX_SLOTS_PER_DAY;

    return (
        <section className="w-10/12 mx-auto">
            <div className="relative">
                <div className="absolute left-3 top-3 bottom-0 border-l-2 border-dotted border-foreground/25" />

                <div className="flex items-start gap-4 pl-10">
                    <div className="absolute left-3 top-0 -translate-x-1/2 z-10 flex size-8 items-center justify-center rounded-full bg-background ring-4 ring-border">
                        <div className="size-3.5 rounded-full bg-primary" />
                    </div>
                    <div className="flex items-center gap-2">
                        <div>
                            <p className="text-[10px] font-bold uppercase tracking-[0.15em] text-muted-foreground">
                                {t('schedule.day')} {dayIndex + 1}
                            </p>
                            <h3 className="text-base font-extrabold tracking-tight">
                                {formatDate(day.date)}
                            </h3>
                        </div>
                        {isFull && (
                            <span className="ml-1 text-xs font-semibold px-2 py-0.5 rounded-full bg-red-100 text-red-600">
                                {t('schedule.full')}
                            </span>
                        )}
                        {!isFull && (
                            <span className="ml-1 text-xs font-medium px-2 py-0.5 rounded-full bg-foreground/8 text-foreground/50">
                                {day.items.length}/{MAX_SLOTS_PER_DAY}
                            </span>
                        )}
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
                                onDelete={onDelete}
                                readOnly={readOnly}
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
    onDelete: (id: string) => void;
    readOnly?: boolean;
};

export default function YourSchedule({
    days,
    onDelete,
    readOnly = false,
}: YourScheduleProps) {
    const { t } = useI18n();
    return (
        <div className="flex flex-col h-full overflow-hidden">
            <div className="w-10/12 mx-auto mt-4 shrink-0">
                <h2 className="text-base font-bold tracking-tight">
                    {t('schedule.yourSchedule')}
                </h2>
                <div className="mt-2 h-px w-40 bg-foreground/20" />
            </div>

            <div className="pt-2 mt-2 flex flex-col gap-10 overflow-y-auto flex-1 min-h-0 pb-4">
                {days.map((day, dayIndex) => (
                    <DroppableDay
                        key={day.id}
                        day={day}
                        dayIndex={dayIndex}
                        onDelete={onDelete}
                        readOnly={readOnly}
                    />
                ))}
            </div>
        </div>
    );
}
