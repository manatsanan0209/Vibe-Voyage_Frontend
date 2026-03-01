import * as React from 'react';
import { CalendarIcon } from 'lucide-react';
import { type DateRange } from 'react-day-picker';
import { Calendar } from '@/components/ui/calendar';
import { Button } from '@/components/ui/button';
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from '@/components/ui/popover';
import { cn } from '@/lib/utils';

function formatDate(date: Date | undefined) {
    if (!date) return '';
    return date.toLocaleDateString('en-US', {
        day: '2-digit',
        month: 'long',
        year: 'numeric',
    });
}

type DatePickerInputProps = {
    placeholder?: string;
    value?: Date;
    onChange?: (date: Date | undefined) => void;
    className?: string;
    disablePast?: boolean;
    minDate?: Date;
    rangeFrom?: Date;
};

export function DatePickerInput({
    placeholder = 'Pick a date',
    value,
    onChange,
    className,
    disablePast = false,
    minDate,
    rangeFrom,
}: DatePickerInputProps) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const [open, setOpen] = React.useState(false);

    const disabledDays = minDate
        ? { before: minDate }
        : disablePast
          ? { before: today }
          : undefined;

    return (
        <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
                <Button
                    variant="outline"
                    className={cn(
                        'w-44 h-10 bg-white justify-start font-normal',
                        !value && 'text-muted-foreground',
                        className,
                    )}
                >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {value ? formatDate(value) : placeholder}
                </Button>
            </PopoverTrigger>
            <PopoverContent
                className="w-auto p-0"
                align="start"
                side="bottom"
                avoidCollisions={false}
            >
                {rangeFrom ? (
                    <Calendar
                        key={
                            open
                                ? (value ?? rangeFrom)?.toISOString()
                                : undefined
                        }
                        mode="range"
                        selected={{ from: rangeFrom, to: value }}
                        defaultMonth={value ?? rangeFrom}
                        disabled={disabledDays}
                        onSelect={(range: DateRange | undefined) => {
                            onChange?.(range?.to);
                            if (range?.to) setOpen(false);
                        }}
                    />
                ) : (
                    <Calendar
                        key={open ? value?.toISOString() : undefined}
                        mode="single"
                        selected={value}
                        defaultMonth={value}
                        disabled={disabledDays}
                        onSelect={(date) => {
                            onChange?.(date);
                            setOpen(false);
                        }}
                    />
                )}
            </PopoverContent>
        </Popover>
    );
}
