import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { CalendarDays } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { DestinationSelect } from '@/components/createTrip/DestinationSelect';
import { DatePickerInput } from '@/components/createTrip/DatePickerInput';
import { useI18n } from '@/hooks/useI18n';
import type { ApiResponseDTO } from '@/types/api';
import type { District } from '@/types/place';
import location from '@/assets/location.png';


type Destination = {
    value: string;
    label: string;
};

export default function PlanYourTrip() {
    const navigate = useNavigate();
    const { t, lang } = useI18n();
    const [destination, setDestination] = useState('');
    const [startDate, setStartDate] = useState<Date | undefined>(undefined);
    const [endDate, setEndDate] = useState<Date | undefined>(undefined);
    const [destinations, setDestinations] = useState<Destination[]>([]);
    const [isLoadingDestinations, setIsLoadingDestinations] = useState(false);
    const [showError, setShowError] = useState(false);

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

    const handlePlan = () => {
        if (!destination) {
            setShowError(true);
            return;
        }
        setShowError(false);
        navigate('/create-trip', {
            state: {
                destination,
                startDate: startDate?.toISOString(),
                endDate: endDate?.toISOString(),
            },
        });
    };

    return (
        <div className="w-full rounded-4xl bg-muted px-4 sm:px-8 py-6 sm:py-8 flex flex-col items-center gap-3">
            {/* Heading */}
            <h2 className="text-2xl font-bold leading-tight text-primary">
                {t('home.planTitle')}
            </h2>
            <p className="text-sm font-normal text-primary">
                {lang === 'th' ? (
                    <>
                        คัดสรรช่วงเวลา สร้าง{' '}
                        <span className="text-accent-foreground">vibe</span>{' '}
                        เริ่มต้นการเดินทาง
                    </>
                ) : (
                    <>
                        Curate moments. Create your{' '}
                        <span className="text-accent-foreground">vibe</span>.
                        Begin your{' '}
                        <span className="text-accent-foreground">voyage</span>.
                    </>
                )}
            </p>

            {/* Form inputs */}
            <div className="mt-2 flex flex-col gap-6 sm:gap-10 w-full max-w-full sm:max-w-115.25">
                {/* Destination row */}
                <div className="flex items-center gap-3 sm:gap-4">
                    <div className="w-18 sm:w-22 shrink-0 flex flex-col items-center gap-0.5">
                        <img
                            src={location}
                            alt="Map"
                            className="w-5 h-5 object-cover"
                        />{' '}
                        <span className="text-sm font-semibold text-gray-900">
                            {t('home.whereTo')}
                        </span>
                    </div>
                    <div className="flex-1">
                        <DestinationSelect
                            destinations={destinations}
                            value={destination}
                            onChange={(val) => {
                                setDestination(val);
                                if (val) setShowError(false);
                            }}
                            isLoading={isLoadingDestinations}
                        />
                    </div>
                </div>

                {/* Date row */}
                <div className="flex items-center gap-3 sm:gap-4">
                    <div className="w-18 sm:w-22 shrink-0 flex flex-col items-center gap-0.5">
                        <CalendarDays className="size-5 text-primary" />
                        <span className="text-sm font-semibold text-gray-900">
                            {t('home.day')}
                        </span>
                    </div>
                    <div className="flex flex-col sm:flex-row flex-1 gap-3">
                        <DatePickerInput
                            placeholder={t('home.startDate')}
                            value={startDate}
                            onChange={setStartDate}
                            disablePast
                            className="flex-1 w-auto min-w-0"
                        />
                        <span className="text-sm font-semibold text-gray-900 shrink-0 self-center">
                            {t('common.to')}
                        </span>
                        <DatePickerInput
                            placeholder={t('home.endDate')}
                            value={endDate}
                            onChange={setEndDate}
                            minDate={startDate}
                            rangeFrom={startDate}
                            className="flex-1 w-auto min-w-0"
                        />
                    </div>
                </div>
            </div>

            {/* Error message */}
            {showError && (
                <p className="text-xs font-light text-red-500">
                    {t('home.chooseDestinationError')}
                </p>
            )}

            {/* Plan button */}
            <Button
                onClick={handlePlan}
                className="mt-5 w-full sm:w-53.5 h-8.25 rounded-lg bg-primary font-extrabold text-sm text-primary-foreground shadow-[0px_4px_4px_0px_rgba(93,93,93,0.25)] hover:rounded-4xl hover:bg-primary/90 hover:shadow-none"
            >
                {t('home.plan')}
            </Button>
        </div>
    );
}
