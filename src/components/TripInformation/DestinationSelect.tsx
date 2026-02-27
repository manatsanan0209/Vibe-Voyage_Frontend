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
    isLoading?: boolean;
};

export function DestinationSelect({
    destinations,
    value,
    onChange,
    isLoading = false,
}: DestinationSelectProps) {
    const [open, setOpen] = useState(false);

    const selectedLabel = destinations.find((d) => d.value === value)?.label;

    return (
        <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
                <Button
                    variant="outline"
                    role="combobox"
                    aria-expanded={open}
                    disabled={isLoading}
                    className="w-full h-10 bg-white justify-between font-normal"
                >
                    {isLoading ? (
                        <span className="text-muted-foreground">Loading...</span>
                    ) : selectedLabel ? (
                        selectedLabel
                    ) : (
                        <span className="text-muted-foreground">
                            เช่น กรุงเทพมหานคร, เมืองเชียงใหม่, เชียงใหม่
                        </span>
                    )}
                    <ChevronsUpDown className="opacity-50" />
                </Button>
            </PopoverTrigger>
            <PopoverContent>
                <Command>
                    <CommandInput
                        placeholder="ค้นหาอำเภอ..."
                        className="h-9"
                    />
                    <CommandList>
                        <CommandEmpty>ไม่พบอำเภอที่ค้นหา</CommandEmpty>
                        <CommandGroup>
                            {destinations.map((d) => (
                                <CommandItem
                                    key={d.value}
                                    value={d.label}
                                    onSelect={(selectedLabel) => {
                                        const found = destinations.find(
                                            (dest) =>
                                                dest.label === selectedLabel,
                                        );
                                        onChange(
                                            found?.value === value
                                                ? ''
                                                : (found?.value ?? ''),
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
