import { Button } from '@/components/ui/button';
import { useI18n } from '@/hooks/useI18n';

interface PopularTrip {
    id: number;
    rank: number;
    title: string;
    views: string;
    author: string;
    images: string[];
    avatar: string;
}

const dummyTrips: PopularTrip[] = [
    {
        id: 1,
        rank: 1,
        title: 'เชียงใหม่สุดฟิน',
        views: 'viewed 3.4 k',
        author: 'Wave Kanit',
        images: [
            'https://picsum.photos/seed/chiangmai1/183/125',
            'https://picsum.photos/seed/chiangmai2/183/125',
            'https://picsum.photos/seed/chiangmai3/183/125',
            'https://picsum.photos/seed/chiangmai4/183/125',
        ],
        avatar: 'https://picsum.photos/seed/avatar1/23/23',
    },
    {
        id: 2,
        rank: 2,
        title: 'ที่เที่ยวภูเก็ต',
        views: 'viewed 3.1 k',
        author: 'Wave PPP',
        images: [
            'https://picsum.photos/seed/phuket1/183/125',
            'https://picsum.photos/seed/phuket2/183/125',
            'https://picsum.photos/seed/phuket3/183/125',
            'https://picsum.photos/seed/phuket4/183/125',
        ],
        avatar: 'https://picsum.photos/seed/avatar2/23/23',
    },
    {
        id: 3,
        rank: 3,
        title: 'ทริปเที่ยวภูเก็ต',
        views: 'viewed 3.0 k',
        author: 'Kanit AAA',
        images: [
            'https://picsum.photos/seed/phuket5/183/125',
            'https://picsum.photos/seed/phuket6/183/125',
            'https://picsum.photos/seed/phuket7/183/125',
            'https://picsum.photos/seed/phuket8/183/125',
        ],
        avatar: 'https://picsum.photos/seed/avatar3/23/23',
    },
    {
        id: 4,
        rank: 4,
        title: 'ที่เที่ยวขอนแก่น',
        views: 'viewed 3.0 k',
        author: 'Wave MMM',
        images: [
            'https://picsum.photos/seed/khon1/183/125',
            'https://picsum.photos/seed/khon2/183/125',
            'https://picsum.photos/seed/khon3/183/125',
            'https://picsum.photos/seed/khon4/183/125',
        ],
        avatar: 'https://picsum.photos/seed/avatar4/23/23',
    },
];

function TripCard({ trip }: { trip: PopularTrip }) {
    return (
        <div className="flex flex-col gap-2 w-full">
            {/* Image grid */}
            <div className="grid grid-cols-2 gap-1 rounded-lg overflow-hidden w-full aspect-[183/125]">
                {trip.images.map((src, i) => (
                    <img
                        key={i}
                        src={src}
                        alt={`${trip.title} ${i + 1}`}
                        className="w-full h-full object-cover"
                    />
                ))}
            </div>

            {/* Rank + title row */}
            <div className="flex items-baseline gap-1">
                <span className="text-5xl font-bold leading-none text-ring">
                    {trip.rank}.
                </span>
                <span className="text-xl font-bold text-primary leading-tight">
                    {trip.title}
                </span>
            </div>

            {/* Avatar + author + views — all within 183px */}
            <div className="flex items-center gap-1.5">
                <img
                    src={trip.avatar}
                    alt={trip.author}
                    className="size-5.75 rounded-full object-cover shrink-0"
                />
                <span className="text-xs text-gray-500 flex-1 truncate">
                    {trip.author}
                </span>
                <span className="text-xs text-gray-500 shrink-0">
                    {trip.views}
                </span>
            </div>
        </div>
    );
}

export default function PopularTrips() {
    const { t } = useI18n();

    return (
        <div className="w-full flex flex-col gap-6">
            {/* Title */}
            <h2 className="text-2xl font-bold text-primary">
                {t('home.popularTitle')}
            </h2>

            {/* Trip cards */}
            <div className="grid grid-cols-2 gap-x-6 gap-y-8 sm:gap-x-10 md:grid-cols-4">
                {dummyTrips.map((trip) => (
                    <TripCard key={trip.id} trip={trip} />
                ))}
            </div>

            {/* See more button */}
            <div className="flex justify-center">
                <Button className="w-full sm:w-53.5 h-8.25 rounded-lg bg-primary font-extrabold text-sm text-primary-foreground shadow-[0px_4px_4px_0px_rgba(93,93,93,0.25)] hover:rounded-4xl hover:bg-primary/90 hover:shadow-none">
                    {t('home.seeMore')}
                </Button>
            </div>
        </div>
    );
}
