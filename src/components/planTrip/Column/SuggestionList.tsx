import { useState } from 'react';
import { useDroppable } from '@dnd-kit/core';
import {
    SortableContext,
    useSortable,
    verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { ImBin } from 'react-icons/im';
import { MdAdd } from 'react-icons/md';
import { Search, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import PlaceDetailHoverCard from '@/components/planTrip/PlaceDetailHoverCard';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog';
import { placeService } from '@/services/place.service';
import type { PlaceSuggestion, PlaceType } from '@/types/place';

const TYPE_STYLE: Record<PlaceType, string> = {
    Attraction: 'bg-blue-100 text-blue-700',
    Restaurant: 'bg-orange-100 text-orange-700',
    Hotel: 'bg-green-100 text-green-700',
};

const ALL_TYPES: PlaceType[] = ['Attraction', 'Restaurant', 'Hotel'];

type SuggestionListProps = {
    places: PlaceSuggestion[];
    onDelete: (id: string) => void;
    onAdd: (place: PlaceSuggestion) => void;
    readOnly?: boolean;
};

function AddPlaceDialog({
    onAdd,
    readOnly,
}: {
    onAdd: (place: PlaceSuggestion) => void;
    readOnly: boolean;
}) {
    const [open, setOpen] = useState(false);
    const [query, setQuery] = useState('');
    const [results, setResults] = useState<{ value: string; label: string }[]>(
        [],
    );
    const [isLoading, setIsLoading] = useState(false);
    const [selectedType, setSelectedType] = useState<PlaceType>('Attraction');

    const handleSearch = async () => {
        if (!query.trim()) return;
        setIsLoading(true);
        try {
            const res = await placeService.searchAttractions(query);
            setResults(res);
        } catch (err) {
            console.error('Search failed:', err);
            setResults([]);
        } finally {
            setIsLoading(false);
        }
    };

    const handleAdd = (item: { value: string; label: string }) => {
        const newPlace: PlaceSuggestion = {
            id: `place-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
            place_id: item.value,
            name: item.label,
            address: '',
            location: { lat: 0, lng: 0 },
            type: selectedType,
        };
        onAdd(newPlace);
        setOpen(false);
        setQuery('');
        setResults([]);
    };

    const handleOpenChange = (next: boolean) => {
        setOpen(next);
        if (!next) {
            setQuery('');
            setResults([]);
        }
    };

    return (
        <Dialog open={open} onOpenChange={handleOpenChange}>
            <DialogTrigger asChild>
                <Button
                    size="icon"
                    className="h-7 w-7 rounded-md bg-indigo-600 text-white hover:bg-indigo-700 shrink-0"
                    type="button"
                    aria-label="Add place"
                    disabled={readOnly}
                >
                    <MdAdd className="size-4" />
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle>Add Place</DialogTitle>
                </DialogHeader>

                {/* Type selector */}
                <div className="flex gap-2">
                    {ALL_TYPES.map((t) => (
                        <button
                            key={t}
                            type="button"
                            onClick={() => setSelectedType(t)}
                            className={`flex-1 py-1.5 text-xs font-semibold rounded-full border transition-colors ${
                                selectedType === t
                                    ? TYPE_STYLE[t] + ' border-transparent'
                                    : 'bg-white text-gray-500 border-gray-300 hover:border-gray-400'
                            }`}
                        >
                            {t}
                        </button>
                    ))}
                </div>

                {/* Search input */}
                <div className="flex gap-2">
                    <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-gray-400" />
                        <input
                            type="text"
                            value={query}
                            onChange={(e) => setQuery(e.target.value)}
                            onKeyDown={(e) =>
                                e.key === 'Enter' && handleSearch()
                            }
                            placeholder="Search place name..."
                            className="w-full h-10 pl-9 pr-3 rounded-md border border-gray-300 bg-white text-sm focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                        />
                    </div>
                    <Button
                        type="button"
                        onClick={handleSearch}
                        disabled={readOnly || isLoading || !query.trim()}
                        className="h-10 px-4 bg-indigo-600 text-white hover:bg-indigo-700"
                    >
                        {isLoading ? (
                            <Loader2 className="size-4 animate-spin" />
                        ) : (
                            'Search'
                        )}
                    </Button>
                </div>

                {/* Results */}
                <div className="max-h-64 overflow-y-auto flex flex-col gap-2 mt-1">
                    {results.length === 0 && !isLoading && (
                        <p className="text-sm text-gray-400 text-center py-6">
                            {query.trim()
                                ? 'No results found'
                                : 'Type a name and press Search'}
                        </p>
                    )}
                    {results.map((item) => (
                        <div
                            key={item.value}
                            className="flex items-center justify-between gap-3 rounded-lg border border-gray-200 px-3 py-2.5 hover:bg-gray-50"
                        >
                            <div className="flex flex-col min-w-0">
                                <p className="text-sm font-medium truncate">
                                    {item.label}
                                </p>
                                <span
                                    className={`text-xs px-1.5 py-0.5 rounded-full w-fit mt-0.5 ${TYPE_STYLE[selectedType]}`}
                                >
                                    {selectedType}
                                </span>
                            </div>
                            <Button
                                type="button"
                                size="sm"
                                onClick={() => handleAdd(item)}
                                className="shrink-0 h-8 px-3 bg-indigo-600 text-white hover:bg-indigo-700"
                                disabled={readOnly}
                            >
                                Add
                            </Button>
                        </div>
                    ))}
                </div>
            </DialogContent>
        </Dialog>
    );
}

function SortablePlaceCard({
    place,
    index,
    onDelete,
    readOnly,
}: {
    place: PlaceSuggestion;
    index: number;
    onDelete: (id: string) => void;
    readOnly: boolean;
}) {
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging,
    } = useSortable({ id: place.id });

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
            {...(!readOnly ? attributes : {})}
            {...(!readOnly ? listeners : {})}
            className={`motion-safe:animate-in motion-safe:fade-in motion-safe:slide-in-from-left-2 ${
                readOnly
                    ? 'cursor-default'
                    : 'cursor-grab active:cursor-grabbing'
            }`}
        >
            <PlaceDetailHoverCard
                placeName={place.name}
                type={place.type}
                status={place.place_detail_status}
                detail={place.place_detail}
            >
                <div
                    className={`flex flex-row items-center justify-between gap-3 rounded-xl border-2 border-indigo-600 bg-background px-3 py-3 shadow-sm transition-all duration-200 md:px-5 md:py-4 ${
                        readOnly ? '' : 'hover:-translate-y-0.5 hover:shadow-md'
                    }`}
                >
                    <div className="flex flex-col gap-1 my-1 min-w-0">
                        <p className="text-sm font-semibold text-foreground truncate">
                            {place.name}
                        </p>
                        <p className="text-xs text-foreground/60 truncate">
                            {place.address}
                        </p>
                        <span
                            className={`inline-block w-fit text-xs px-2 py-0.5 rounded-full font-medium mt-0.5 ${
                                TYPE_STYLE[place.type]
                            }`}
                        >
                            {place.type}
                        </span>
                    </div>
                    {!readOnly && (
                        <Button
                            variant="outline"
                            size="icon"
                            className="size-8 shrink-0 border border-border bg-background text-destructive hover:bg-destructive/10 md:size-9"
                            type="button"
                            aria-label="Delete"
                            onPointerDown={(e) => e.stopPropagation()}
                            onClick={() => onDelete(place.id)}
                        >
                            <ImBin />
                        </Button>
                    )}
                </div>
            </PlaceDetailHoverCard>
        </div>
    );
}

export default function SuggestionList({
    places,
    onDelete,
    onAdd,
    readOnly = false,
}: SuggestionListProps) {
    const { setNodeRef } = useDroppable({ id: 'suggestion-list' });

    return (
        <div className="flex h-full min-h-0 flex-col overflow-hidden rounded-2xl border border-border/70 bg-white/80 shadow-sm md:rounded-none md:border-0 md:bg-transparent md:shadow-none">
            <div className="mx-auto mt-3 w-11/12 shrink-0 md:mt-4 md:w-10/12">
                <div className="flex items-center justify-between">
                    <h2 className="text-sm font-bold tracking-tight md:text-base">
                        Suggestion List
                    </h2>
                    <AddPlaceDialog onAdd={onAdd} readOnly={readOnly} />
                </div>
                <div className="mt-2 h-px w-28 bg-foreground/20 md:w-40" />
            </div>
            <SortableContext
                items={places.map((p) => p.id)}
                strategy={verticalListSortingStrategy}
            >
                <div
                    ref={setNodeRef}
                    className="mx-auto mt-2 flex min-h-0 w-full flex-1 flex-col gap-3 overflow-y-auto px-3 pt-2 pb-4 md:gap-4 md:px-8"
                >
                    {places.map((place, index) => (
                        <SortablePlaceCard
                            key={place.id}
                            place={place}
                            index={index}
                            onDelete={onDelete}
                            readOnly={readOnly}
                        />
                    ))}
                </div>
            </SortableContext>
        </div>
    );
}
