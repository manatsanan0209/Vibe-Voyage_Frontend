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
import { useSettings } from '@/context/SettingsContext';
import { useI18n } from '@/hooks/useI18n';

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
    placeholder,
    value,
    onChange,
    className,
    disablePast = false,
    minDate,
    rangeFrom,
}: DatePickerInputProps) {
    const { formatDate } = useSettings();
    const { t } = useI18n();
    const resolvedPlaceholder = placeholder ?? t('datePicker.pickDate');
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
                        'h-10 w-44 max-w-full justify-start bg-white font-normal',
                        !value && 'text-muted-foreground',
                        className,
                    )}
                >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    <span className="min-w-0 truncate">
                        {value ? formatDate(value) : resolvedPlaceholder}
                    </span>
                </Button>
            </PopoverTrigger>
            <PopoverContent
                className="max-w-[calc(100vw-1rem)] overflow-auto p-0"
                align="start"
                side="bottom"
                collisionPadding={8}
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
