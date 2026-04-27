import { useLocation } from 'react-router-dom';
import CreateTrip from '@/components/createTrip/CreateTrip';
import type { InitialTripData } from '@/components/createTrip/CreateTrip';

export default function CreateTripPage() {
    const { state } = useLocation();
    const initialData: InitialTripData | undefined =
        state?.destination || state?.startDate || state?.endDate
            ? {
                destination: state.destination,
                startDate: state.startDate,
                endDate: state.endDate,
            }
            : undefined;

    return (
        <div className="w-full min-h-11/12 bg-background py-6 px-4 sm:px-8">
            <div className="w-full min-h-full rounded-3xl shadow-lg bg-muted py-10 px-6 sm:px-12">
                <CreateTrip initialData={initialData} />
            </div>
        </div>
    );
}
