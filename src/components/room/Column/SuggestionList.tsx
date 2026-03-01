import { useDroppable } from '@dnd-kit/core';
import { SortableContext, useSortable, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { ImBin } from 'react-icons/im';
import { Button } from '@/components/ui/button';
import type { PlaceSuggestion } from '@/types/place';

type SuggestionListProps = {
    places: PlaceSuggestion[];
};

function SortablePlaceCard({ place, index }: { place: PlaceSuggestion; index: number }) {
    const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
        useSortable({ id: place.id });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.4 : 1,
        animationDelay: `${index * 40}ms`,
        animationFillMode: 'both' as const,
    };

    return (
        <div
            ref={setNodeRef}
            style={style}
            {...attributes}
            {...listeners}
            className="flex flex-row items-center justify-between rounded-xl border-2 border-indigo-600 bg-background px-5 py-4 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md motion-safe:animate-in motion-safe:fade-in motion-safe:slide-in-from-left-2 cursor-grab active:cursor-grabbing"
        >
            <div className="flex flex-col my-1">
                <p className="text-indigo-600 text-sm">{place.name}</p>
                <p className="text-indigo-600 text-sm">{place.address}</p>
            </div>
            <Button
                variant="outline"
                size="icon"
                className="bg-background border border-border text-destructive hover:bg-destructive/10"
                type="button"
                aria-label="Delete"
                onPointerDown={(e) => e.stopPropagation()}
            >
                <ImBin />
            </Button>
        </div>
    );
}

export default function SuggestionList({ places }: SuggestionListProps) {
    const { setNodeRef } = useDroppable({ id: 'suggestion-list' });

    return (
        <div className="flex flex-col h-full overflow-hidden">
            <div className="w-10/12 mx-auto mt-4 shrink-0">
                <h2 className="text-base font-bold tracking-tight">Suggestion List</h2>
                <div className="mt-2 h-px w-40 bg-foreground/20" />
            </div>
            <SortableContext
                items={places.map((p) => p.id)}
                strategy={verticalListSortingStrategy}
            >
                <div
                    ref={setNodeRef}
                    className="w-full px-8 mx-auto pt-2 mt-2 flex flex-col gap-4 overflow-y-auto flex-1 min-h-0 pb-4"
                >
                    {places.map((place, index) => (
                        <SortablePlaceCard key={place.id} place={place} index={index} />
                    ))}
                </div>
            </SortableContext>
        </div>
    );
}
