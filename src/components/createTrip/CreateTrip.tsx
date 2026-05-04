import { Fragment, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Step1TripInfo from './Step1TripInfo';
import type { Step1Data, Destination } from './Step1TripInfo';
import Step2TravelVibe from './Step2TravelVibe';
import Step3Priorities from './Step3Priorities';
import { tripService } from '@/services/trip.service';
import { emitCacheInvalidation } from '@/lib/cache-events';
import type { ApiResponseDTO } from '@/types/api';
import type { District } from '@/types/place';

// ---------- toggle helper ----------

function toggle(list: string[], id: string): string[] {
    return list.includes(id) ? list.filter((v) => v !== id) : [...list, id];
}

// ---------- vibe form state ----------

interface VibeFormData {
    vibes: string[];
    priorities: string[];
    foodVibes: string[];
    extra: string;
}

const INITIAL_VIBE: VibeFormData = {
    vibes: [],
    priorities: [],
    foodVibes: [],
    extra: '',
};

// ---------- step labels ----------

const STEP_TITLES: Record<number, string> = {
    1: 'Trip Information',
    2: 'Your Travel Vibe',
    3: 'Your Priorities',
};

// ---------- component ----------

export interface InitialTripData {
    destination?: string;
    startDate?: string;
    endDate?: string;
}

interface CreateTripProps {
    initialData?: InitialTripData;
}

function toDateStr(d: Date | undefined): string {
    if (!d) return '';
    return d.toISOString().slice(0, 10);
}

export default function CreateTrip({ initialData }: CreateTripProps) {
    const navigate = useNavigate();
    const [step, setStep] = useState<1 | 2 | 3>(1);
    const [step1Data, setStep1Data] = useState<Step1Data | null>(null);
    const [vibeForm, setVibeForm] = useState<VibeFormData>(INITIAL_VIBE);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [submitError, setSubmitError] = useState<string | null>(null);
    const [destinations, setDestinations] = useState<Destination[]>([]);
    const [districtToProvince, setDistrictToProvince] = useState<Map<string, string>>(new Map());
    const [isLoadingDestinations, setIsLoadingDestinations] = useState(false);

    useEffect(() => {
        let cancelled = false;
        const fetchDestinations = async () => {
            setIsLoadingDestinations(true);
            try {
                const res = await fetch('http://localhost:8080/api/places/districts');
                const json: ApiResponseDTO<District[]> = await res.json();
                if (cancelled) return;

                const seenProvinces = new Map<string, string>();
                json.data.forEach((district) => {
                    if (!seenProvinces.has(district.province.province_id)) {
                        seenProvinces.set(
                            district.province.province_id,
                            district.province.province_name_th,
                        );
                    }
                });

                const provinceEntries: Destination[] = Array.from(seenProvinces.entries())
                    .sort((a, b) => a[1].localeCompare(b[1], 'th'))
                    .map(([id, name]) => ({ value: `province_${id}`, label: name }));

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
                if (!cancelled) setIsLoadingDestinations(false);
            }
        };
        void fetchDestinations();
        return () => { cancelled = true; };
    }, []);

    async function handleSubmit() {
        setIsSubmitting(true);
        setSubmitError(null);
        try {
            const result = await tripService.createTrip({
                room_name: step1Data?.tripName ?? '',
                room_image: '',
                destination_name: step1Data?.destinationName ?? '',
                destination_id: step1Data?.destinationId ?? '',
                start_date: toDateStr(step1Data?.startDate),
                end_date: toDateStr(step1Data?.endDate),
                preferred_destinations: step1Data?.preferredDestinations ?? [],
                voyage_vibes: vibeForm.vibes,
                voyage_priorities: vibeForm.priorities,
                food_vibes: vibeForm.foodVibes,
                additional_notes: vibeForm.extra,
            });

            emitCacheInvalidation({
                key: 'user-rooms',
                reason: 'create-trip',
            });
            emitCacheInvalidation({
                key: 'trip-schedule',
                tripId: String(result.trip_id),
                reason: 'create-trip',
            });

            navigate(`/your-trips/${result.trip_id}`, {
                state: {
                    fromCreateTrip: true,
                    createdAt: Date.now(),
                },
            });
        } catch (err) {
            console.error('Error creating trip:', err);
            setSubmitError(
                'ไม่สามารถสร้างทริปได้ในขณะนี้ กรุณาลองใหม่อีกครั้ง',
            );
            setIsSubmitting(false);
        }
    }

    return (
        <div className="w-full flex flex-col gap-8">
            {isSubmitting && (
                <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-black/50">
                    <div className="w-12 h-12 rounded-full border-4 border-primary/30 border-t-primary animate-spin" />
                    <p className="mt-4 text-white font-medium">
                        กำลังสร้างทริปของคุณ...
                    </p>
                </div>
            )}

            {submitError && (
                <p className="text-sm text-destructive text-center" role="alert">
                    {submitError}
                </p>
            )}
            {/* Step indicator */}
            <div className="flex flex-col items-center gap-3">
                <p className="text-2xl font-semibold text-foreground">
                    {STEP_TITLES[step]}
                </p>

                {/* Circle-line-circle progress bar */}
                <div className="flex items-center w-full max-w-xs sm:max-w-sm md:max-w-md">
                    {([1, 2, 3] as const).map((n, i) => (
                        <Fragment key={n}>
                            {/* Circle */}
                            <div className="flex flex-col items-center gap-1 shrink-0">
                                <span
                                    className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-semibold border-2 transition-all duration-300 ${n < step
                                            ? 'bg-primary border-primary text-primary-foreground'
                                            : n === step
                                                ? 'bg-card border-primary text-primary shadow-sm'
                                                : 'bg-card border-border text-muted-foreground'
                                        }`}
                                >
                                    {n < step ? (
                                        <svg
                                            width="12"
                                            height="10"
                                            viewBox="0 0 12 10"
                                            fill="none"
                                        >
                                            <path
                                                d="M1 5L4.5 8.5L11 1"
                                                stroke="white"
                                                strokeWidth="1.8"
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                            />
                                        </svg>
                                    ) : (
                                        n
                                    )}
                                </span>
                            </div>

                            {/* Connecting line (not after last) */}
                            {i < 2 && (
                                <div
                                    className={`flex-1 h-0.5 mx-1 transition-all duration-300 ${n < step
                                            ? 'bg-primary'
                                            : 'bg-border'
                                        }`}
                                />
                            )}
                        </Fragment>
                    ))}
                </div>
            </div>

            {/* Step content — constrained width, centered */}
            <div className="w-full max-w-7xl mx-auto">
                {step === 1 && (
                    <Step1TripInfo
                        onNext={(data) => {
                            setStep1Data(data);
                            setStep(2);
                        }}
                        initialData={initialData}
                        defaultValues={step1Data ?? undefined}
                        destinations={destinations}
                        districtToProvince={districtToProvince}
                        isLoadingDestinations={isLoadingDestinations}
                    />
                )}

                {step === 2 && (
                    <Step2TravelVibe
                        vibes={vibeForm.vibes}
                        onChange={(id) =>
                            setVibeForm((f) => ({
                                ...f,
                                vibes: toggle(f.vibes, id),
                            }))
                        }
                        onBack={() => setStep(1)}
                        onNext={() => setStep(3)}
                    />
                )}

                {step === 3 && (
                    <Step3Priorities
                        priorities={vibeForm.priorities}
                        onPriority={(id) =>
                            setVibeForm((f) => ({
                                ...f,
                                priorities: toggle(f.priorities, id),
                            }))
                        }
                        foodVibes={vibeForm.foodVibes}
                        onFood={(id) =>
                            setVibeForm((f) => ({
                                ...f,
                                foodVibes: toggle(f.foodVibes, id),
                            }))
                        }
                        extra={vibeForm.extra}
                        onExtra={(v) =>
                            setVibeForm((f) => ({ ...f, extra: v }))
                        }
                        onBack={() => setStep(2)}
                        onSubmit={handleSubmit}
                    />
                )}
            </div>
        </div>
    );
}
