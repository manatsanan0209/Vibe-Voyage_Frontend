import { useEffect, useState } from 'react';
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
import type { ApiResponseDTO } from '@/types/api';
import type { District } from '@/types/place';

type Destination = {
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
}

export default function Step1TripInfo({
    onNext,
    initialData,
}: Step1TripInfoProps) {
    const [tripName, setTripName] = useState('');
    const [destination, setDestination] = useState(initialData?.destination ?? '');
    const [destinations, setDestinations] = useState<Destination[]>([]);
    const [isLoadingDestinations, setIsLoadingDestinations] = useState(false);
    const [startDate, setStartDate] = useState<Date | undefined>(
        initialData?.startDate ? new Date(initialData.startDate) : undefined,
    );
    const [endDate, setEndDate] = useState<Date | undefined>(
        initialData?.endDate ? new Date(initialData.endDate) : undefined,
    );
    const [preferredPlaces, setPreferredPlaces] = useState<Place[]>([]);
    const [districtToProvince, setDistrictToProvince] = useState<Map<string, string>>(
        new Map(),
    );

    useEffect(() => {
        const fetchDestinations = async () => {
            setIsLoadingDestinations(true);
            try {
                const res = await fetch('http://localhost:8080/api/places/districts');
                const json: ApiResponseDTO<District[]> = await res.json();

                const seenProvinces = new Map<string, string>();
                json.data.forEach((district) => {
                    if (!seenProvinces.has(district.province.province_id)) {
                        seenProvinces.set(
                            district.province.province_id,
                            district.province.province_name_th,
                        );
                    }
                });

                const provinceEntries: Destination[] = Array.from(
                    seenProvinces.entries(),
                )
                    .sort((a, b) => a[1].localeCompare(b[1], 'th'))
                    .map(([id, name]) => ({
                        value: `province_${id}`,
                        label: name,
                    }));

                const districtEntries: Destination[] = json.data.map((district) => ({
                    value: district.district_id,
                    label: `${district.district_name_th}, ${district.province.province_name_th}`,
                }));

                const dpMap = new Map<string, string>();
                json.data.forEach((district) =>
                    dpMap.set(district.district_id, district.province_id),
                );
                setDistrictToProvince(dpMap);
                setDestinations([...provinceEntries, ...districtEntries]);
            } catch (err) {
                console.error('Failed to fetch districts:', err);
            } finally {
                setIsLoadingDestinations(false);
            }
        };

        fetchDestinations();
    }, []);

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
                    <div className="w-full max-w-xl mx-auto flex flex-col gap-4 sm:grid sm:grid-cols-[max-content_1fr] sm:items-center sm:gap-x-8 sm:gap-y-8">
                        <p className="text-base font-semibold text-foreground sm:text-right">
                            Trip Name
                        </p>
                        <Input
                            type="text"
                            value={tripName}
                            onChange={(e) => setTripName(e.target.value)}
                            className="h-10 w-full border-white/70 bg-white/90 shadow-none"
                            placeholder="Your Trip Name"
                        />

                        <div className="flex items-center gap-1 sm:flex-col sm:items-end sm:gap-0.5">
                            <img
                                src={location}
                                alt="Location"
                                className="w-5 h-5 object-cover"
                            />
                            <p className="text-base font-semibold text-foreground sm:text-right">
                                Where to ?
                            </p>
                        </div>
                        <DestinationSelect
                            destinations={destinations}
                            value={destination}
                            onChange={setDestination}
                            isLoading={isLoadingDestinations}
                        />

                        <p className="text-base font-semibold text-foreground sm:text-right">
                            Day
                        </p>
                        <div className="flex items-center gap-2 w-full">
                            <DatePickerInput
                                placeholder="Start date"
                                value={startDate}
                                onChange={setStartDate}
                                disablePast
                                className="flex-1 w-auto min-w-0"
                            />
                            <p className="text-base font-semibold text-foreground shrink-0">
                                To
                            </p>
                            <DatePickerInput
                                placeholder="End date"
                                value={endDate}
                                onChange={setEndDate}
                                minDate={startDate}
                                rangeFrom={startDate}
                                className="flex-1 w-auto min-w-0"
                            />
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
                        onClick={() => {
                            const resolvedId = destination.startsWith('province_')
                                ? destination.slice('province_'.length)
                                : (districtToProvince.get(destination) ?? destination);

                            onNext({
                                tripName,
                                destinationId: resolvedId,
                                destinationName:
                                    destinations.find((item) => item.value === destination)
                                        ?.label ?? '',
                                startDate,
                                endDate,
                                preferredDestinations: preferredPlaces.map((place) => ({
                                    destination_id: place.value,
                                    destination_name: place.label,
                                    latitude: place.lat,
                                    longitude: place.lng,
                                })),
                            });
                        }}
                        className="w-25 h-10 rounded-lg bg-primary text-base font-semibold text-primary-foreground hover:bg-primary/90 shadow-none"
                    >
                        Next
                    </Button>
                </CardFooter>
            </Card>
        </div>
    );
}
