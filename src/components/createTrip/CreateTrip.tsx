import { Fragment, useState } from 'react';
import Step1TripInfo from './Step1TripInfo';
import Step2TravelVibe from './Step2TravelVibe';
import Step3Priorities from './Step3Priorities';

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

export default function CreateTrip() {
    const [step, setStep] = useState<1 | 2 | 3>(1);
    const [vibeForm, setVibeForm] = useState<VibeFormData>(INITIAL_VIBE);

    function handleSubmit() {
        console.log('Create Trip — Vibe Form:', vibeForm);
        // TODO: submit full trip + vibe data to API
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
                                    className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-semibold border-2 transition-all duration-300 ${
                                        n < step
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
                                    className={`flex-1 h-0.5 mx-1 transition-all duration-300 ${
                                        n < step
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
                {step === 1 && <Step1TripInfo onNext={() => setStep(2)} />}

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
