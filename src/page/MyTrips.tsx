import NewTripCard from '@/components/myTrips/NewTripCard';
import TripCard, { type Collaborator } from '@/components/myTrips/TripCard';

interface MockTrip {
    id: string;
    name: string;
    imageUrl: string;
    lastEdited: string;
    collaborators: Collaborator[];
}

const mockTrips: MockTrip[] = [
    {
        id: 'trip-1',
        name: 'เชียงใหม่สุดฟิน',
        imageUrl: 'https://picsum.photos/seed/mytrip1/366/240',
        lastEdited: 'Edit 20 days ago',
        collaborators: [
            { id: 'u1', avatarUrl: 'https://picsum.photos/seed/av1/46/46' },
            { id: 'u2', avatarUrl: 'https://picsum.photos/seed/av2/46/46' },
            { id: 'u3', avatarUrl: 'https://picsum.photos/seed/av3/46/46' },
            { id: 'u4', avatarUrl: 'https://picsum.photos/seed/av4/46/46' },
            { id: 'u5', avatarUrl: 'https://picsum.photos/seed/av5/46/46' },
            { id: 'u6', avatarUrl: 'https://picsum.photos/seed/av6/46/46' },
            { id: 'u7', avatarUrl: 'https://picsum.photos/seed/av7/46/46' },
        ],
    },
    {
        id: 'trip-2',
        name: 'ที่เที่ยวภูเก็ต',
        imageUrl: 'https://picsum.photos/seed/mytrip2/366/240',
        lastEdited: 'Edit 3 days ago',
        collaborators: [
            { id: 'u2', avatarUrl: 'https://picsum.photos/seed/av2/46/46' },
            { id: 'u3', avatarUrl: 'https://picsum.photos/seed/av3/46/46' },
        ],
    },
    {
        id: 'trip-3',
        name: 'ทริปเที่ยวเกาะสมุย',
        imageUrl: 'https://picsum.photos/seed/mytrip3/366/240',
        lastEdited: 'Edit 1 month ago',
        collaborators: [
            { id: 'u4', avatarUrl: 'https://picsum.photos/seed/av4/46/46' },
            { id: 'u5', avatarUrl: 'https://picsum.photos/seed/av5/46/46' },
            { id: 'u6', avatarUrl: 'https://picsum.photos/seed/av6/46/46' },
        ],
    },
    {
        id: 'trip-4',
        name: 'ที่เที่ยวขอนแก่น',
        imageUrl: 'https://picsum.photos/seed/mytrip4/366/240',
        lastEdited: 'Edit 5 days ago',
        collaborators: [
            { id: 'u1', avatarUrl: 'https://picsum.photos/seed/av1/46/46' },
        ],
    },
    {
        id: 'trip-5',
        name: 'กรุงเทพฯ วันเดียว',
        imageUrl: 'https://picsum.photos/seed/mytrip5/366/240',
        lastEdited: 'Edit 2 hours ago',
        collaborators: [
            { id: 'u7', avatarUrl: 'https://picsum.photos/seed/av7/46/46' },
            { id: 'u8', avatarUrl: 'https://picsum.photos/seed/av8/46/46' },
        ],
    },
    {
        id: 'trip-6',
        name: 'ทะเลน่าน',
        imageUrl: 'https://picsum.photos/seed/mytrip6/366/240',
        lastEdited: 'Edit 10 days ago',
        collaborators: [
            { id: 'u3', avatarUrl: 'https://picsum.photos/seed/av3/46/46' },
            { id: 'u4', avatarUrl: 'https://picsum.photos/seed/av4/46/46' },
            { id: 'u5', avatarUrl: 'https://picsum.photos/seed/av5/46/46' },
        ],
    },
];

export default function MyTrips() {
    return (
        <main className="flex flex-col gap-6 sm:gap-8 px-4 sm:px-8 pb-12">
            <div className="w-full rounded-[20px] bg-[#F9F8FD] px-4 sm:px-8 py-6 sm:py-8">
                <h1 className="text-[24px] font-bold text-[#160350] mb-6">
                    My Trip
                </h1>

                <div className="grid gap-10 grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4">
                    <NewTripCard />
                    {mockTrips.map((trip) => (
                        <TripCard
                            key={trip.id}
                            name={trip.name}
                            imageUrl={trip.imageUrl}
                            lastEdited={trip.lastEdited}
                            collaborators={trip.collaborators}
                        />
                    ))}
                </div>
            </div>
        </main>
    );
}
