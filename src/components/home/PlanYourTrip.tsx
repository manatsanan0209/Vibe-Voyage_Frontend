import { useState } from 'react';
import { MapPin, CalendarDays } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface TripPlan {
    destination: string;
    startDate: string;
    endDate: string;
}

export default function PlanYourTrip() {
    const [plan, setPlan] = useState<TripPlan>({
        destination: '',
        startDate: '',
        endDate: '',
    });
    const [showError, setShowError] = useState(false);

    const handlePlan = () => {
        if (!plan.destination.trim()) {
            setShowError(true);
            return;
        }
        setShowError(false);
        console.log('Trip Plan:', plan);
    };

    return (
        <div className="w-full rounded-4xl bg-violet-50 px-4 sm:px-8 py-6 sm:py-8 flex flex-col items-center gap-3">
            {/* Heading */}
            <h2 className="text-2xl font-bold leading-tight text-indigo-950">
                Plan your new trip
            </h2>
            <p className="text-sm font-normal text-purple-800">
                Curate moments. Create your vibe. Begin your voyage.
            </p>

            {/* Form inputs */}
            <div className="mt-2 flex flex-col gap-6 sm:gap-10 w-full max-w-full sm:max-w-115.25">
                {/* Destination row */}
                <div className="flex items-center gap-3 sm:gap-4">
                    {/* Label column — fixed width so both rows align */}
                    <div className="w-18 sm:w-22 shrink-0 flex flex-col items-center gap-0.5">
                        <MapPin className="size-5 text-indigo-600" />
                        <span className="text-sm font-semibold text-gray-900">
                            Where to ?
                        </span>
                    </div>
                    <div className="flex-1">
                        <input
                            type="text"
                            value={plan.destination}
                            onChange={(e) => {
                                setPlan((p) => ({
                                    ...p,
                                    destination: e.target.value,
                                }));
                                if (e.target.value.trim()) setShowError(false);
                            }}
                            placeholder="e.g. Phetchaburi , pattaya"
                            className="w-full h-10.5 rounded-md border border-gray-400 bg-white px-4 text-xs text-gray-500 placeholder:text-gray-500 focus:outline-none focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600"
                        />
                    </div>
                </div>

                {/* Date row */}
                <div className="flex items-start sm:items-center gap-3 sm:gap-4">
                    {/* Label column — same width as destination row */}
                    <div className="w-18 sm:w-22 shrink-0 flex flex-col items-center gap-0.5 pt-3 sm:pt-0">
                        <CalendarDays className="size-5 text-indigo-600" />
                        <span className="text-sm font-semibold text-gray-900">
                            Day
                        </span>
                    </div>
                    <div className="flex flex-col sm:flex-row flex-1 gap-3">
                        {/* Start date */}
                        <div className="relative flex-1">
                            <label className="absolute -top-2.5 left-3 bg-violet-50 px-1 text-xs text-gray-500 leading-none">
                                Start date
                            </label>
                            <input
                                type="date"
                                value={plan.startDate}
                                onChange={(e) =>
                                    setPlan((p) => ({
                                        ...p,
                                        startDate: e.target.value,
                                    }))
                                }
                                className="w-full h-10.5 rounded-md border border-gray-400 bg-white px-3 text-sm font-semibold text-gray-900 focus:outline-none focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600"
                            />
                        </div>

                        <span className="text-sm font-semibold text-gray-900 shrink-0 self-center">
                            To
                        </span>

                        {/* End date */}
                        <div className="relative flex-1">
                            <label className="absolute -top-2.5 left-3 bg-violet-50 px-1 text-xs text-gray-500 leading-none">
                                End date
                            </label>
                            <input
                                type="date"
                                value={plan.endDate}
                                onChange={(e) =>
                                    setPlan((p) => ({
                                        ...p,
                                        endDate: e.target.value,
                                    }))
                                }
                                className="w-full h-10.5 rounded-md border border-gray-400 bg-white px-3 text-sm font-semibold text-gray-900 focus:outline-none focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600"
                            />
                        </div>
                    </div>
                </div>
            </div>

            {/* Error message */}
            {showError && (
                <p className="text-xs font-light text-red-500">
                    * Choose a destination to start planning
                </p>
            )}

            {/* Plan button */}
            <Button
                onClick={handlePlan}
                className="mt-5 w-full sm:w-53.5 h-8.25 rounded-lg bg-indigo-600 font-extrabold text-sm text-white shadow-[0px_4px_4px_0px_rgba(93,93,93,0.25)] hover:rounded-4xl hover:bg-indigo-700 hover:shadow-none"
            >
                Plan
            </Button>
        </div>
    );
}
