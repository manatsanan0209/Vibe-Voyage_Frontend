import { useState } from 'react';
import { Plus, X } from 'lucide-react';
import {
    Command,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
    CommandList,
} from '@/components/ui/command';
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from '@/components/ui/popover';
import { placeService } from '@/services/place.service';

type Place = {
    value: string;
    label: string;
};

type PreferredDestinationsProps = {
    selected: Place[];
    onChange: (places: Place[]) => void;
};

export function PreferredDestinations({
    selected,
    onChange,
}: PreferredDestinationsProps) {
    const [open, setOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState<Place[]>([]);
    const [isLoading, setIsLoading] = useState(false);

    const handleSearch = async (query: string) => {
        if (!query.trim()) return;
        setIsLoading(true);
        try {
            const results = await placeService.searchAttractions(query);
            setSearchResults(results);
        } catch (err) {
            console.error('Failed to fetch attractions:', err);
            setSearchResults([]);
        } finally {
            setIsLoading(false);
        }
    };

    const handleSelect = (place: Place) => {
        if (!selected.find((s) => s.value === place.value)) {
            onChange([...selected, place]);
        }
        setOpen(false);
    };

    const handleRemove = (value: string) => {
        onChange(selected.filter((s) => s.value !== value));
    };

    const handleOpenChange = (nextOpen: boolean) => {
        setOpen(nextOpen);
        if (!nextOpen) {
            setSearchQuery('');
            setSearchResults([]);
        }
    };

    const available = searchResults.filter(
        (p) => !selected.find((s) => s.value === p.value),
    );

    const showEmpty =
        !isLoading && searchQuery.trim() !== '' && available.length === 0;
    const showHint = !isLoading && searchQuery.trim() === '';

    return (
        <div className="flex flex-col gap-3">
            {/* Header row */}
            <div className="flex items-center gap-2">
                <Popover open={open} onOpenChange={handleOpenChange}>
                    <PopoverTrigger asChild>
                        <button
                            type="button"
                            className="w-8 h-8 rounded-md bg-indigo-600 text-white flex items-center justify-center hover:bg-indigo-700 transition-colors shrink-0"
                        >
                            <Plus size={18} />
                        </button>
                    </PopoverTrigger>
                    <PopoverContent className="p-0 w-96" align="start">
                        <Command shouldFilter={false}>
                            <CommandInput
                                placeholder="Type a place name and press 'Enter' to search"
                                value={searchQuery}
                                onValueChange={setSearchQuery}
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter') {
                                        e.preventDefault();
                                        handleSearch(searchQuery);
                                    }
                                }}
                            />
                            <CommandList>
                                {isLoading && (
                                    <div className="py-6 text-center text-sm text-muted-foreground">
                                        Searching
                                    </div>
                                )}
                                {showHint && (
                                    <CommandEmpty>
                                        Press 'Enter' to search for attractions
                                    </CommandEmpty>
                                )}
                                {showEmpty && (
                                    <CommandEmpty>No places found</CommandEmpty>
                                )}
                                {!isLoading && available.length > 0 && (
                                    <CommandGroup>
                                        {available.map((place) => (
                                            <CommandItem
                                                key={place.value}
                                                value={place.value}
                                                onSelect={() =>
                                                    handleSelect(place)
                                                }
                                            >
                                                {place.label}
                                            </CommandItem>
                                        ))}
                                    </CommandGroup>
                                )}
                            </CommandList>
                        </Command>
                    </PopoverContent>
                </Popover>

                <p className="text-base font-semibold">
                    Add preferred destination
                </p>
                <span className="text-pink-500 font-light text-sm ">
                    * not required
                </span>
            </div>

            {/* Selected place chips */}
            {selected.length > 0 && (
                <div className="flex flex-wrap gap-2">
                    {selected.map((place) => (
                        <div
                            key={place.value}
                            className="flex items-center gap-3 border-indigo-500 rounded-md px-3 py-1.5 bg-white border-2"
                        >
                            <span className="text-sm">{place.label}</span>
                            <button
                                type="button"
                                onClick={() => handleRemove(place.value)}
                                className="text-pink-500 hover:text-pink-700 transition-colors"
                            >
                                <X size={14} />
                            </button>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
