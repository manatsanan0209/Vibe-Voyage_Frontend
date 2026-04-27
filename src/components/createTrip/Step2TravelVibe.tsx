import { IoArrowBack } from 'react-icons/io5';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import beachImg from '@/assets/createTrip/beach.png';
import localCultureImg from '@/assets/createTrip/local_culture.png';
import adventureImg from '@/assets/createTrip/adventure.png';
import photoCafeImg from '@/assets/createTrip/photo_spot.png';
import natureImg from '@/assets/createTrip/nature.png';
import slowLifeImg from '@/assets/createTrip/slow_life.png';
import shoppingImg from '@/assets/createTrip/shopping.png';
import mountainImg from '@/assets/createTrip/mountain.png';

// ---------- data ----------

const VIBES = [
    {
        id: 'beach_island_chill',
        label: 'Beach & island chill',
        labelTH: 'ทะเลและเกาะชิลๆ',
        image: beachImg,
    },
    {
        id: 'local_culture_old_town',
        label: 'Local culture & old-town',
        labelTH: 'วัฒนธรรมท้องถิ่นและเมืองเก่า',
        image: localCultureImg,
    },
    {
        id: 'adventure_activity',
        label: 'Adventure & activity',
        labelTH: 'ผจญภัยและกิจกรรม',
        image: adventureImg,
    },
    {
        id: 'photo_spots_cafe',
        label: 'Photo spots & café',
        labelTH: 'ถ่ายรูปและคาเฟ่',
        image: photoCafeImg,
    },
    {
        id: 'nature_peaceful',
        label: 'Nature & peaceful',
        labelTH: 'ธรรมชาติ & เงียบสงบ',
        image: natureImg,
    },
    {
        id: 'slow_life_relaxing',
        label: 'Slow-life & relaxing',
        labelTH: 'สโลว์ไลฟ์และพักผ่อน',
        image: slowLifeImg,
    },
    {
        id: 'shopping_market',
        label: 'Shopping & market',
        labelTH: 'ซื้อของและตลาด',
        image: shoppingImg,
    },
    {
        id: 'mountain_scenic_view',
        label: 'Mountain & scenic-view',
        labelTH: 'ภูเขาและวิวธรรมชาติ',
        image: mountainImg,
    },
];

// ---------- VibeCard ----------

interface CardProps {
    id: string;
    label: string;
    labelTH: string;
    image: string;
    checked: boolean;
    onChange: (id: string) => void;
}

function VibeCard({ id, label, labelTH, image, checked, onChange }: CardProps) {
    return (
        <button
            type="button"
            onClick={() => onChange(id)}
            className={cn(
                'flex items-center gap-3 w-full rounded-xl border-2 px-5 py-3 text-left transition-colors duration-150',
                checked
                    ? 'bg-secondary border-ring'
                    : 'bg-white border-gray-300 hover:border-ring',
            )}
        >
            <img
                src={image}
                alt={label}
                className="size-12 rounded-full shrink-0 object-cover"
            />
            <span className="flex flex-col min-w-0">
                <span className="text-base font-semibold text-black leading-tight truncate">
                    {label}
                </span>
                <span className="text-sm text-muted-foreground font-light leading-tight truncate">
                    {labelTH}
                </span>
            </span>
        </button>
    );
}

// ---------- QuestionHeader ----------

function QuestionHeader({
    question,
    questionTH,
    note,
}: {
    question: string;
    questionTH: string;
    note?: string;
}) {
    return (
        <div className="flex items-start justify-between gap-4">
            <div>
                <p className="text-lg font-semibold text-black leading-tight">
                    {question}
                </p>
                <p className="text-base font-light text-gray-500 mt-0.5">
                    {questionTH}
                </p>
            </div>
            {note && (
                <span className="text-sm font-light text-accent-foreground shrink-0 mt-0.5 whitespace-nowrap">
                    {note}
                </span>
            )}
        </div>
    );
}

// ---------- props ----------

interface Step2TravelVibeProps {
    vibes: string[];
    onChange: (id: string) => void;
    onBack: () => void;
    onNext: () => void;
}

// ---------- component ----------

export default function Step2TravelVibe({
    vibes,
    onChange,
    onBack,
    onNext,
}: Step2TravelVibeProps) {
    return (
        <div className="w-full flex flex-col gap-6">
            <QuestionHeader
                question="What's your travel vibe on this voyage?"
                questionTH="การเที่ยวของคุณในการเดินทางครั้งนี้เป็นแบบไหน"
                note="* Choose all that match you"
            />

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-12 gap-y-8">
                {VIBES.map((v) => (
                    <VibeCard
                        key={v.id}
                        id={v.id}
                        label={v.label}
                        labelTH={v.labelTH}
                        image={v.image}
                        checked={vibes.includes(v.id)}
                        onChange={onChange}
                    />
                ))}
            </div>

            <div className="flex items-center justify-between pt-1">
                <Button
                    type="button"
                    onClick={onBack}
                    className="w-32 h-10 text-black font-semibold bg-gray-400/30 hover:bg-gray-400/20 backdrop-blur-sm"
                >
                    {' '}
                    <IoArrowBack className="size-5" />
                    Back
                </Button>
                <Button
                    onClick={onNext}
                    className="w-25 h-10 rounded-lg bg-primary text-base font-semibold text-primary-foreground hover:bg-primary/90 shadow-none"
                >
                    Next
                </Button>
            </div>
        </div>
    );
}
