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
import { useI18n } from '@/hooks/useI18n';

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
    const { t } = useI18n();

    const selectedLabel = destinations.find((d) => d.value === value)?.label;

    return (
        <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
                <Button
                    variant="outline"
                    role="combobox"
                    aria-expanded={open}
                    disabled={isLoading}
                    className="h-10 w-full min-w-0 justify-between bg-white font-normal"
                >
                    <span className="min-w-0 flex-1 truncate text-left">
                        {isLoading ? (
                            <span className="text-muted-foreground">
                                {t('destinationSelect.loading')}
                            </span>
                        ) : selectedLabel ? (
                            selectedLabel
                        ) : (
                            <span className="text-muted-foreground">
                                {t('destinationSelect.placeholderExample')}
                            </span>
                        )}
                    </span>
                    <ChevronsUpDown className="shrink-0 opacity-50" />
                </Button>
            </PopoverTrigger>
            <PopoverContent
                align="start"
                collisionPadding={8}
                className="w-[min(22rem,calc(100vw-1rem))] p-0"
            >
                <Command>
                    <CommandInput
                        placeholder={t('destinationSelect.searchPlaceholder')}
                        className="h-9"
                    />
                    <CommandList>
                        <CommandEmpty>
                            {t('destinationSelect.empty')}
                        </CommandEmpty>
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
