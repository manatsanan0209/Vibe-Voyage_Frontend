import { Fragment, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Step1TripInfo from './Step1TripInfo';
import type { Step1Data } from './Step1TripInfo';
import Step2TravelVibe from './Step2TravelVibe';
import Step3Priorities from './Step3Priorities';
import { tripService } from '@/services/trip.service';

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

    async function handleSubmit() {
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
            navigate(`/createroom/${result.trip_id}`);
        } catch (err) {
            console.error('Error creating trip:', err);
        }
    }

    return (
        <div className="w-full flex flex-col gap-8">
            {/* Step indicator */}
            <div className="flex flex-col items-center gap-3">
                <p className="text-2xl font-semibold text-black">
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
                                            ? 'bg-indigo-600 border-indigo-600 text-white'
                                            : n === step
                                                ? 'bg-white border-indigo-600 text-indigo-600 shadow-md shadow-gray-400'
                                                : 'bg-white border-gray-400 text-gray-400'
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
                                            ? 'bg-indigo-600'
                                            : 'bg-gray-400'
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
