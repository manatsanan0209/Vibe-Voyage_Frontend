import PlanYourTrip from '@/components/home/PlanYourTrip';
import PopularTrips from '@/components/home/PopularTrips';

export default function Home() {
    return (
        <main className="flex flex-col gap-6 sm:gap-8 px-4 sm:px-8 pb-12">
            <PlanYourTrip />
            <PopularTrips />
        </main>
    );
}
