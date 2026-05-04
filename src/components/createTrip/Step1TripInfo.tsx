import { useState } from 'react';
import { MapPinned, Route } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import { DatePickerInput } from '@/components/createTrip/DatePickerInput';
import { DestinationSelect } from '@/components/createTrip/DestinationSelect';
import { PreferredDestinations } from '@/components/createTrip/PreferredDestinations';
import location from '@/assets/location.png';

export type Destination = {
    value: string;
    label: string;
};

type Place = {
    value: string;
    label: string;
    lat?: number;
    lng?: number;
};

export interface Step1Data {
    tripName: string;
    destinationId: string;
    destinationName: string;
    destinationValue: string;
    startDate: Date | undefined;
    endDate: Date | undefined;
    preferredDestinations: {
        destination_id: string;
        destination_name: string;
        latitude?: number;
        longitude?: number;
    }[];
}

interface Step1TripInfoProps {
    onNext: (data: Step1Data) => void;
    initialData?: {
        destination?: string;
        startDate?: string;
        endDate?: string;
    };
    defaultValues?: Step1Data;
    destinations: Destination[];
    districtToProvince: Map<string, string>;
    isLoadingDestinations: boolean;
}

export default function Step1TripInfo({
    onNext,
    initialData,
    defaultValues,
    destinations,
    districtToProvince,
    isLoadingDestinations,
}: Step1TripInfoProps) {
    const [tripName, setTripName] = useState(defaultValues?.tripName ?? '');
    const [destination, setDestination] = useState(
        defaultValues?.destinationValue ?? initialData?.destination ?? '',
    );
    const [startDate, setStartDate] = useState<Date | undefined>(
        defaultValues?.startDate ??
            (initialData?.startDate ? new Date(initialData.startDate) : undefined),
    );
    const [endDate, setEndDate] = useState<Date | undefined>(
        defaultValues?.endDate ??
            (initialData?.endDate ? new Date(initialData.endDate) : undefined),
    );
    const [preferredPlaces, setPreferredPlaces] = useState<Place[]>(
        defaultValues?.preferredDestinations.map((d) => ({
            value: d.destination_id,
            label: d.destination_name,
            lat: d.latitude,
            lng: d.longitude,
        })) ?? [],
    );
    const [errors, setErrors] = useState<{
        tripName?: string;
        destination?: string;
        startDate?: string;
        endDate?: string;
    }>({});

    function handleNext() {
        const newErrors: typeof errors = {};
        if (!tripName.trim()) newErrors.tripName = 'กรุณาระบุชื่อทริป';
        if (!destination) newErrors.destination = 'กรุณาเลือกจุดหมายปลายทาง';
        if (!startDate) newErrors.startDate = 'กรุณาเลือกวันเริ่มต้น';
        if (!endDate) newErrors.endDate = 'กรุณาเลือกวันสิ้นสุด';

        if (Object.keys(newErrors).length > 0) {
            setErrors(newErrors);
            return;
        }

        const resolvedId = destination.startsWith('province_')
            ? destination.slice('province_'.length)
            : (districtToProvince.get(destination) ?? destination);

        onNext({
            tripName,
            destinationId: resolvedId,
            destinationName:
                destinations.find((item) => item.value === destination)?.label ?? '',
            destinationValue: destination,
            startDate,
            endDate,
            preferredDestinations: preferredPlaces.map((place) => ({
                destination_id: place.value,
                destination_name: place.label,
                latitude: place.lat,
                longitude: place.lng,
            })),
        });
    }

    return (
        <div className="w-full flex flex-col gap-6">
            <Card className="w-full gap-0 rounded-[24px] border-white/70 bg-white/72 shadow-[0_18px_46px_-34px_rgba(76,61,121,0.55)] backdrop-blur-sm">
                <CardHeader className="gap-1 border-b border-white/70 px-5 py-3">
                    <div className="flex items-start justify-between gap-3">
                        <div className="flex size-7 items-center justify-center rounded-xl border border-violet-100 bg-violet-50 text-violet-500">
                            <Route className="size-4.5" />
                        </div>
                        <Badge
                            variant="secondary"
                            className="rounded-full bg-white/80 px-2.5 py-1 text-[10px] font-semibold text-primary"
                        >
                            Basic details
                        </Badge>
                    </div>

                    <div className="space-y-0">
                        <CardTitle className="text-base text-foreground">
                            Set the foundation for your voyage
                        </CardTitle>
                        <CardDescription className="text-xs leading-relaxed text-muted-foreground sm:text-sm">
                            Fill in the essentials first. Layout and flow stay the
                            same, with a softer look to match the next steps.
                        </CardDescription>
                    </div>
                </CardHeader>

                <CardContent className="px-5 py-5">
                    <div className="w-full max-w-xl mx-auto flex flex-col gap-4 sm:grid sm:grid-cols-[max-content_1fr] sm:items-start sm:gap-x-8 sm:gap-y-6">
                        <p className="text-base font-semibold text-foreground sm:text-right sm:pt-2">
                            Trip Name
                        </p>
                        <div className="flex flex-col gap-1">
                            <Input
                                type="text"
                                value={tripName}
                                onChange={(e) => {
                                    setTripName(e.target.value);
                                    if (e.target.value.trim()) setErrors((prev) => ({ ...prev, tripName: undefined }));
                                }}
                                className={`h-10 w-full border-white/70 bg-white/90 shadow-none ${errors.tripName ? 'border-red-400' : ''}`}
                                placeholder="Your Trip Name"
                            />
                            {errors.tripName && (
                                <p className="text-xs text-red-500">{errors.tripName}</p>
                            )}
                        </div>

                        <div className="flex items-center gap-1 sm:flex-col sm:items-end sm:gap-0.5 sm:pt-2">
                            <img
                                src={location}
                                alt="Location"
                                className="w-5 h-5 object-cover"
                            />
                            <p className="text-base font-semibold text-foreground sm:text-right">
                                Where to ?
                            </p>
                        </div>
                        <div className="flex flex-col gap-1">
                            <DestinationSelect
                                destinations={destinations}
                                value={destination}
                                onChange={(v) => {
                                    setDestination(v);
                                    if (v) setErrors((prev) => ({ ...prev, destination: undefined }));
                                }}
                                isLoading={isLoadingDestinations}
                            />
                            {errors.destination && (
                                <p className="text-xs text-red-500">{errors.destination}</p>
                            )}
                        </div>

                        <p className="text-base font-semibold text-foreground sm:text-right sm:pt-2">
                            Day
                        </p>
                        <div className="flex flex-col gap-1">
                            <div className="flex items-center gap-2 w-full">
                                <DatePickerInput
                                    placeholder="Start date"
                                    value={startDate}
                                    onChange={(d) => {
                                        setStartDate(d);
                                        if (d) setErrors((prev) => ({ ...prev, startDate: undefined }));
                                    }}
                                    disablePast
                                    className="flex-1 w-auto min-w-0"
                                />
                                <p className="text-base font-semibold text-foreground shrink-0">
                                    To
                                </p>
                                <DatePickerInput
                                    placeholder="End date"
                                    value={endDate}
                                    onChange={(d) => {
                                        setEndDate(d);
                                        if (d) setErrors((prev) => ({ ...prev, endDate: undefined }));
                                    }}
                                    minDate={startDate}
                                    rangeFrom={startDate}
                                    className="flex-1 w-auto min-w-0"
                                />
                            </div>
                            {(errors.startDate || errors.endDate) && (
                                <p className="text-xs text-red-500">
                                    {errors.startDate ?? errors.endDate}
                                </p>
                            )}
                        </div>

                        <div className="sm:col-span-2 w-full rounded-[20px] border border-white/70 bg-primary/3 px-4 py-3">
                            <div className="mb-3 flex items-center gap-2 text-primary">
                                <MapPinned className="size-4" />
                                <span className="text-xs font-semibold uppercase tracking-[0.16em]">
                                    Bonus picks
                                </span>
                            </div>
                            <PreferredDestinations
                                selected={preferredPlaces}
                                onChange={setPreferredPlaces}
                            />
                        </div>
                    </div>
                </CardContent>

                <CardFooter className="flex items-center justify-between border-t border-white/70 px-5 py-4">
                    <div className="w-32 shrink-0" />
                    <Button
                        type="button"
                        onClick={handleNext}
                        className="w-25 h-10 rounded-lg bg-primary text-base font-semibold text-primary-foreground hover:bg-primary/90 shadow-none"
                    >
                        Next
                    </Button>
                </CardFooter>
            </Card>
        </div>
    );
}
