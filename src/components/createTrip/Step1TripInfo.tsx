import { useEffect, useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { DatePickerInput } from '@/components/createTrip/DatePickerInput';
import { DestinationSelect } from '@/components/createTrip/DestinationSelect';
import { PreferredDestinations } from '@/components/createTrip/PreferredDestinations';
import map from '@/assets/map.png';
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
};

export interface Step1Data {
    tripName: string;
    destinationId: string;
    destinationName: string;
    startDate: Date | undefined;
    endDate: Date | undefined;
    preferredDestinations: { destination_id: string; destination_name: string }[];
}

interface Step1TripInfoProps {
    onNext: (data: Step1Data) => void;
    initialData?: {
        destination?: string;
        startDate?: string;
        endDate?: string;
    };
}

export default function Step1TripInfo({ onNext, initialData }: Step1TripInfoProps) {
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

    useEffect(() => {
        const fetchDestinations = async () => {
            setIsLoadingDestinations(true);
            try {
                const res = await fetch(
                    'http://localhost:8080/api/places/districts',
                );
                const json: ApiResponseDTO<District[]> = await res.json();

                const seenProvinces = new Map<string, string>();
                json.data.forEach((d) => {
                    if (!seenProvinces.has(d.province.province_id)) {
                        seenProvinces.set(
                            d.province.province_id,
                            d.province.province_name_th,
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

                const districtEntries: Destination[] = json.data.map((d) => ({
                    value: d.district_id,
                    label: `${d.district_name_th}, ${d.province.province_name_th}`,
                }));

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
            {/* Header */}
            <div className="flex flex-col items-center gap-2">
                <img
                    src={map}
                    alt="Map"
                    className="w-10 h-10 object-cover bg-neutral-200 rounded-full border-2 border-indigo-600 shadow-md shadow-gray-400"
                />
                <p className="text-lg text-purple-950 font-semibold">
                    Trip Information
                </p>
            </div>

            {/* Form fields */}
            <div className="w-full max-w-xl mx-auto flex flex-col gap-4 sm:grid sm:grid-cols-[max-content_1fr] sm:items-center sm:gap-x-8 sm:gap-y-8">
                <p className="text-base font-semibold sm:text-right">
                    Trip Name
                </p>
                <Input
                    type="text"
                    value={tripName}
                    onChange={(e) => setTripName(e.target.value)}
                    className="h-10 bg-white w-full"
                    placeholder="Your Trip Name"
                />

                <div className="flex items-center gap-1 sm:flex-col sm:items-end sm:gap-0.5">
                    <img
                        src={location}
                        alt="Map"
                        className="w-5 h-5 object-cover"
                    />
                    <p className="text-base font-semibold sm:text-right">
                        Where to ?
                    </p>
                </div>
                <DestinationSelect
                    destinations={destinations}
                    value={destination}
                    onChange={setDestination}
                    isLoading={isLoadingDestinations}
                />

                <p className="text-base font-semibold sm:text-right">Day</p>
                <div className="flex items-center gap-2 w-full">
                    <DatePickerInput
                        placeholder="Start date"
                        value={startDate}
                        onChange={setStartDate}
                        disablePast
                        className="flex-1 w-auto min-w-0"
                    />
                    <p className="text-base font-semibold shrink-0">To</p>
                    <DatePickerInput
                        placeholder="End date"
                        value={endDate}
                        onChange={setEndDate}
                        minDate={startDate}
                        rangeFrom={startDate}
                        className="flex-1 w-auto min-w-0"
                    />
                </div>

                <div className="sm:col-span-2 w-full">
                    <PreferredDestinations
                        selected={preferredPlaces}
                        onChange={setPreferredPlaces}
                    />
                </div>
            </div>

            {/* Actions */}
            <div className="w-full max-w-xl mx-auto flex items-center justify-between mt-4">
                <div />
                <Button
                    onClick={() =>
                        onNext({
                            tripName,
                            destinationId: destination,
                            destinationName:
                                destinations.find((d) => d.value === destination)
                                    ?.label ?? '',
                            startDate,
                            endDate,
                            preferredDestinations: preferredPlaces.map((p) => ({
                                destination_id: p.value,
                                destination_name: p.label,
                            })),
                        })
                    }
                    className="w-25 h-10 rounded-lg bg-indigo-600 text-base font-semibold text-white hover:bg-indigo-700 shadow-none"
                >
                    Next
                </Button>
            </div>
        </div>
    );
}
