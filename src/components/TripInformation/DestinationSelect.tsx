import { useState } from 'react';
import { Check, ChevronsUpDown } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
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

type Destination = {
    value: string;
    label: string;
};

type DestinationSelectProps = {
    destinations: Destination[];
    value: string;
    onChange: (value: string) => void;
};

export function DestinationSelect({
    destinations,
    value,
    onChange,
}: DestinationSelectProps) {
    const [open, setOpen] = useState(false);

    return (
        <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
                <Button
                    variant="outline"
                    role="combobox"
                    aria-expanded={open}
                    className="w-full h-10 bg-white justify-between font-normal"
                >
                    {value ? (
                        destinations.find((d) => d.value === value)?.label
                    ) : (
                        <span className="text-muted-foreground">
                            e.g. Phetchaburi, Pattaya, etc.
                        </span>
                    )}
                    <ChevronsUpDown className="opacity-50" />
                </Button>
            </PopoverTrigger>
            <PopoverContent>
                <Command>
                    <CommandInput
                        placeholder="Search destination..."
                        className="h-9"
                    />
                    <CommandList>
                        <CommandEmpty>No destination found.</CommandEmpty>
                        <CommandGroup>
                            {destinations.map((d) => (
                                <CommandItem
                                    key={d.value}
                                    value={d.value}
                                    onSelect={(current) => {
                                        onChange(
                                            current === value ? '' : current,
                                        );
                                        setOpen(false);
                                    }}
                                >
                                    {d.label}
                                    <Check
                                        className={cn(
                                            'ml-auto',
                                            value === d.value
                                                ? 'opacity-100'
                                                : 'opacity-0',
                                        )}
                                    />
                                </CommandItem>
                            ))}
                        </CommandGroup>
                    </CommandList>
                </Command>
            </PopoverContent>
        </Popover>
    );
}
