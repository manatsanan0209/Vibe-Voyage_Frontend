import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { CalendarDays, Compass } from 'lucide-react';
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

                const districtEntries: Destination[] = json.data.map(
                    (district) => ({
                        value: district.district_id,
                        label: `${district.district_name_th}, ${district.province.province_name_th}`,
                    }),
                );

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
        <div className="flex w-full flex-col items-center gap-2 rounded-[24px] border border-white/70 bg-linear-to-br from-muted via-white/70 to-muted px-3 py-5 shadow-[0_20px_60px_-40px_rgba(76,61,121,0.55)] backdrop-blur-sm sm:gap-1 sm:rounded-4xl sm:px-8 sm:py-8">
            <div className="flex max-w-full flex-col items-center gap-2 text-center">
                <h2 className="text-balance text-xl font-bold leading-tight text-primary sm:text-2xl">
                    {t('home.planTitle')}
                </h2>

                <p className="max-w-prose text-pretty text-xs font-normal leading-5 text-primary sm:text-sm">
                    {lang === 'th' ? (
                        <>
                            คัดสรรช่วงเวลา สร้าง{' '}
                            <span className="text-accent-foreground">vibe</span>{' '}
                            เริ่มต้นการเดินทาง
                        </>
                    ) : (
                        <>
                            Curate moments. Create your{' '}
                            <span className="text-accent-foreground">vibe</span>
                            . Begin your{' '}
                            <span className="text-accent-foreground">
                                voyage
                            </span>
                            .
                        </>
                    )}
                </p>
            </div>

            <div className="flex w-full max-w-full flex-col gap-3 sm:max-w-115.25 sm:gap-0">
                <div className="flex flex-col gap-3 rounded-[22px] border border-white/70 bg-white/70 px-3 py-3 sm:flex-row sm:items-center sm:gap-4 sm:py-2.5">
                    <div className="flex shrink-0 items-center gap-2 sm:w-22 sm:flex-col sm:gap-0.5">
                        <div className="flex size-8 items-center justify-center rounded-xl border border-violet-100 bg-violet-50 text-violet-500">
                            <img
                                src={location}
                                alt="Map"
                                className="w-4.5 h-4.5 object-cover"
                            />
                        </div>
                        <span className="text-sm font-semibold text-gray-900 sm:text-center">
                            {t('home.whereTo')}
                        </span>
                    </div>

                    <div className="min-w-0 flex-1">
                        <DestinationSelect
                            destinations={destinations}
                            value={destination}
                            onChange={(value) => {
                                setDestination(value);
                                if (value) setShowError(false);
                            }}
                            isLoading={isLoadingDestinations}
                        />
                    </div>
                </div>

                <div className="flex flex-col gap-3 rounded-[22px] border border-white/70 bg-white/70 px-3 py-3 sm:flex-row sm:items-center sm:gap-4 sm:py-2.5">
                    <div className="flex shrink-0 items-center gap-2 sm:w-22 sm:flex-col sm:gap-0.5">
                        <div className="flex size-8 items-center justify-center rounded-xl border border-sky-100 bg-sky-50 text-sky-500">
                            <CalendarDays className="size-4.5" />
                        </div>
                        <span className="text-sm font-semibold text-gray-900 sm:text-center">
                            {t('home.day')}
                        </span>
                    </div>

                    <div className="flex min-w-0 flex-1 flex-col gap-3 md:flex-row">
                        <DatePickerInput
                            placeholder={t('home.startDate')}
                            value={startDate}
                            onChange={setStartDate}
                            disablePast
                            className="w-full min-w-0 max-w-full shrink md:flex-1"
                        />
                        <span className="shrink-0 self-center text-sm font-semibold text-gray-900">
                            {t('common.to')}
                        </span>
                        <DatePickerInput
                            placeholder={t('home.endDate')}
                            value={endDate}
                            onChange={setEndDate}
                            minDate={startDate}
                            rangeFrom={startDate}
                            className="w-full min-w-0 max-w-full shrink md:flex-1"
                        />
                    </div>
                </div>
            </div>

            {showError && (
                <p className="text-xs font-light text-red-500">
                    {t('home.chooseDestinationError')}
                </p>
            )}

            <Button
                onClick={handlePlan}
                className="mt-3 h-9 w-full rounded-lg bg-primary text-sm font-extrabold text-primary-foreground shadow-[0px_4px_4px_0px_rgba(93,93,93,0.25)] hover:rounded-4xl hover:bg-primary/90 hover:shadow-none sm:mt-4 sm:h-8.25 sm:w-53.5"
            >
                <Compass className="size-4" />
                {t('home.plan')}
            </Button>
        </div>
    );
}
