import { useEffect, useState } from 'react';
import { Input } from '../ui/input';
import { Button } from '../ui/button';
import { DatePickerInput } from './DatePickerInput';
import { DestinationSelect } from './DestinationSelect';
import { PreferredDestinations } from './PreferredDestinations';
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

export default function InformationForm() {
    const [destination, setDestination] = useState('');
    const [destinations, setDestinations] = useState<Destination[]>([]);
    const [isLoadingDestinations, setIsLoadingDestinations] = useState(false);
    const [startDate, setStartDate] = useState<Date | undefined>(undefined);
    const [endDate, setEndDate] = useState<Date | undefined>(undefined);
    const [preferredPlaces, setPreferredPlaces] = useState<Place[]>([]);

    useEffect(() => {
        const fetchDestinations = async () => {
            setIsLoadingDestinations(true);
            try {
                const res = await fetch(
                    'http://localhost:8080/api/places/districts',
                );
                const json: ApiResponseDTO<District[]> = await res.json();

                // Deduplicate provinces for province-only entries
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

                // District entries formatted as "district, province"
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
        <div className="w-full h-full flex items-center justify-center flex-col px-4">
            <div className="flex flex-col items-center gap-2">
                <img
                    src={map}
                    alt="Map"
                    className="w-10 h-10 object-cover bg-neutral-200 rounded-full border-2 border-indigo-600 shadow-md shadow-gray-400"
                />
                <p className="text-md text-purple-950 font-semibold">
                    Trip Information
                </p>
            </div>
            <div className="w-full h-1/12"></div>
            <div className="w-full max-w-xl flex flex-col gap-4 sm:grid sm:grid-cols-[max-content_1fr] sm:items-center sm:gap-x-8 sm:gap-y-8">
                <p className="text-base font-semibold sm:text-right">
                    Trip Name
                </p>
                <Input
                    type="text"
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

            <div className="w-full flex justify-end mt-10">
                <Button
                    type="submit"
                    className="w-1/12 h-10 rounded-md font-semibold bg-indigo-600 text-white hover:bg-indigo-700"
                >
                    Next step
                </Button>
            </div>
        </div>
    );
}
