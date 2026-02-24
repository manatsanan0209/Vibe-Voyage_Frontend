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

type Place = {
    value: string;
    label: string;
};

// TODO: replace with API call when backend is ready
const MOCK_PLACES: Place[] = [
    { value: 'hat-jomtien', label: 'หาดจอมเทียน' },
    { value: 'walking-street', label: 'Walking Street พัทยา' },
    { value: 'koh-larn', label: 'เกาะล้าน' },
    { value: 'nong-nooch', label: 'สวนนงนุช' },
    { value: 'art-in-paradise', label: 'Art in Paradise พัทยา' },
    { value: 'pattaya-beach', label: 'หาดพัทยา' },
    { value: 'sanctuary-of-truth', label: 'ปราสาทสัจธรรม' },
    { value: 'cartoon-network', label: 'Cartoon Network Amazone' },
    { value: 'terminal-21', label: 'Terminal 21 พัทยา' },
    { value: 'big-buddha', label: 'วัดพระใหญ่บนเขาชีโอน' },
    { value: 'silverlake', label: 'Silverlake Vineyard' },
    { value: 'tiger-park', label: 'Tiger Park Pattaya' },
];

type PreferredDestinationsProps = {
    selected: Place[];
    onChange: (places: Place[]) => void;
};

export function PreferredDestinations({
    selected,
    onChange,
}: PreferredDestinationsProps) {
    const [open, setOpen] = useState(false);

    const handleSelect = (place: Place) => {
        if (!selected.find((s) => s.value === place.value)) {
            onChange([...selected, place]);
        }
        setOpen(false);
    };

    const handleRemove = (value: string) => {
        onChange(selected.filter((s) => s.value !== value));
    };

    const available = MOCK_PLACES.filter(
        (p) => !selected.find((s) => s.value === p.value),
    );

    return (
        <div className="flex flex-col gap-3">
            {/* Header row */}
            <div className="flex items-center gap-2">
                <Popover open={open} onOpenChange={setOpen}>
                    <PopoverTrigger asChild>
                        <button
                            type="button"
                            className="w-8 h-8 rounded-md bg-indigo-600 text-white flex items-center justify-center hover:bg-indigo-700 transition-colors shrink-0"
                        >
                            <Plus size={18} />
                        </button>
                    </PopoverTrigger>
                    <PopoverContent className="p-0 w-72" align="start">
                        <Command>
                            <CommandInput placeholder="Search place..." />
                            <CommandList>
                                <CommandEmpty>No place found.</CommandEmpty>
                                <CommandGroup>
                                    {available.map((place) => (
                                        <CommandItem
                                            key={place.value}
                                            value={place.label}
                                            onSelect={() => handleSelect(place)}
                                        >
                                            {place.label}
                                        </CommandItem>
                                    ))}
                                </CommandGroup>
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
