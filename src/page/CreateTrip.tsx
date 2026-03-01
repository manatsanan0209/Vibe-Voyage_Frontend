import CreateTrip from '@/components/createTrip/CreateTrip';

export default function CreateTripPage() {
    return (
        <div className="w-full min-h-11/12 bg-white py-6 px-4 sm:px-8">
            <div className="w-full min-h-full rounded-3xl shadow-lg bg-violet-50 py-10 px-6 sm:px-12">
                <CreateTrip />
            </div>
        </div>
    );
}
