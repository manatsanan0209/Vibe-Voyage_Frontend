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
        <div className="w-full rounded-4xl border border-white/70 bg-linear-to-br from-muted via-white/70 to-muted px-4 py-6 sm:px-8 sm:py-8 shadow-[0_20px_60px_-40px_rgba(76,61,121,0.55)] backdrop-blur-sm flex flex-col items-center gap-1">
            <div className="flex flex-col items-center gap-2">
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

            <div className="flex w-full max-w-full flex-col sm:max-w-115.25">
                <div className="flex items-center gap-3 rounded-[22px] border border-white/70 bg-white/70 px-3 py-2.5 sm:gap-4">
                    <div className="w-18 sm:w-22 shrink-0 flex flex-col items-center gap-0.5">
                        <div className="flex size-8 items-center justify-center rounded-xl border border-violet-100 bg-violet-50 text-violet-500">
                            <img
                                src={location}
                                alt="Map"
                                className="w-4.5 h-4.5 object-cover"
                            />
                        </div>
                        <span className="text-sm font-semibold text-gray-900">
                            {t('home.whereTo')}
                        </span>
                    </div>

                    <div className="flex-1">
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

                <div className="flex items-center gap-3 rounded-[22px] border border-white/70 bg-white/70 px-3 py-2.5 sm:gap-4">
                    <div className="w-18 sm:w-22 shrink-0 flex flex-col items-center gap-0.5">
                        <div className="flex size-8 items-center justify-center rounded-xl border border-sky-100 bg-sky-50 text-sky-500">
                            <CalendarDays className="size-4.5" />
                        </div>
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

            {showError && (
                <p className="text-xs font-light text-red-500">
                    {t('home.chooseDestinationError')}
                </p>
            )}

            <Button
                onClick={handlePlan}
                className="mt-4 w-full sm:w-53.5 h-8.25 rounded-lg bg-primary font-extrabold text-sm text-primary-foreground shadow-[0px_4px_4px_0px_rgba(93,93,93,0.25)] hover:rounded-4xl hover:bg-primary/90 hover:shadow-none"
            >
                <Compass className="size-4" />
                {t('home.plan')}
            </Button>
        </div>
    );
}
