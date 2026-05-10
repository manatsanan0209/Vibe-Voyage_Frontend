import { Compass } from 'lucide-react';
import { IoArrowBack } from 'react-icons/io5';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
    CardDescription,
    CardFooter,
} from '@/components/ui/card';
import { cn } from '@/lib/utils';
import beachImg from '@/assets/createTrip/beach.png';
import localCultureImg from '@/assets/createTrip/local_culture.png';
import adventureImg from '@/assets/createTrip/adventure.png';
import photoCafeImg from '@/assets/createTrip/photo_spot.png';
import natureImg from '@/assets/createTrip/nature.png';
import slowLifeImg from '@/assets/createTrip/slow_life.png';
import shoppingImg from '@/assets/createTrip/shopping.png';
import mountainImg from '@/assets/createTrip/mountain.png';

const VIBES = [
    {
        id: 'beach_island_chill',
        label: 'Beach & island chill',
        labelTH: 'ทะเลและเกาะชิล ๆ',
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
        label: 'Photo spots & cafe',
        labelTH: 'ถ่ายรูปและคาเฟ่',
        image: photoCafeImg,
    },
    {
        id: 'nature_peaceful',
        label: 'Nature & peaceful',
        labelTH: 'ธรรมชาติและเงียบสงบ',
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
        labelTH: 'ช้อปปิ้งและตลาด',
        image: shoppingImg,
    },
    {
        id: 'mountain_scenic_view',
        label: 'Mountain & scenic-view',
        labelTH: 'ภูเขาและวิวธรรมชาติ',
        image: mountainImg,
    },
];

interface VibeCardProps {
    id: string;
    label: string;
    labelTH: string;
    image: string;
    checked: boolean;
    onChange: (id: string) => void;
}

function VibeCard({
    id,
    label,
    labelTH,
    image,
    checked,
    onChange,
}: VibeCardProps) {
    return (
        <button
            type="button"
            aria-pressed={checked}
            onClick={() => onChange(id)}
            className={cn(
                'group flex min-h-[84px] w-full items-center gap-3 rounded-2xl border px-4 py-3 text-left transition-all duration-200',
                checked
                    ? 'border-primary/30 bg-linear-to-br from-primary/12 via-white to-secondary/70 shadow-[0_16px_40px_-28px_rgba(76,61,121,0.9)]'
                    : 'border-white/70 bg-white/75 hover:border-primary/20 hover:bg-white',
            )}
        >
            <span
                className={cn(
                    'flex size-9 shrink-0 items-center justify-center rounded-xl border transition-colors',
                    checked
                        ? 'border-primary/20 bg-primary text-primary-foreground'
                        : 'border-border bg-muted/80 text-muted-foreground group-hover:border-primary/20',
                )}
            >
                <span
                    className={cn(
                        'size-2 rounded-full transition-colors',
                        checked ? 'bg-white' : 'bg-primary/35',
                    )}
                />
            </span>

            <span className="flex size-12 shrink-0 items-center justify-center overflow-hidden rounded-2xl bg-muted/60">
                <img
                    src={image}
                    alt={label}
                    className="size-10 object-cover"
                />
            </span>

            <span className="min-w-0 space-y-0.5">
                <span className="block text-sm font-semibold leading-snug text-foreground">
                    {label}
                </span>
                <span className="block text-xs leading-snug text-muted-foreground">
                    {labelTH}
                </span>
            </span>
        </button>
    );
}

interface Step2TravelVibeProps {
    vibes: string[];
    onChange: (id: string) => void;
    onBack: () => void;
    onNext: () => void;
}

export default function Step2TravelVibe({
    vibes,
    onChange,
    onBack,
    onNext,
}: Step2TravelVibeProps) {
    return (
        <div className="flex w-full flex-col gap-3">
            <Card className="gap-0 overflow-hidden rounded-[24px] border-white/70 bg-white/70 shadow-[0_18px_46px_-34px_rgba(76,61,121,0.55)] backdrop-blur-sm">
                <CardHeader className="gap-1 border-b border-white/70 px-4.5 py-1.5">
                    <div className="flex items-start justify-between gap-3">
                        <div className="flex size-7 items-center justify-center rounded-xl border border-sky-100 bg-sky-50 text-sky-500">
                            <Compass className="size-4.5" />
                        </div>

                        <Badge
                            variant="secondary"
                            className="rounded-full bg-white/80 px-2.5 py-1 text-[10px] font-semibold text-primary"
                        >
                            {vibes.length} selected
                        </Badge>
                    </div>

                    <div className="space-y-0">
                        <CardTitle className="text-base text-foreground">
                            What&apos;s your travel vibe on this voyage?
                        </CardTitle>
                        <CardDescription className="text-xs leading-relaxed text-muted-foreground sm:text-sm">
                            การเดินทางครั้งนี้ของคุณอยากได้บรรยากาศแบบไหน?
                        </CardDescription>
                    </div>

                    <Badge
                        variant="outline"
                        className="w-fit rounded-full border-primary/15 bg-primary/6 px-2.5 py-1 text-[10px] font-medium text-primary"
                    >
                        Choose all that match you
                    </Badge>
                </CardHeader>

                <CardContent className="px-4 py-2">
                    <div className="grid gap-2.5 sm:grid-cols-2">
                        {VIBES.map((vibe) => (
                            <VibeCard
                                key={vibe.id}
                                id={vibe.id}
                                label={vibe.label}
                                labelTH={vibe.labelTH}
                                image={vibe.image}
                                checked={vibes.includes(vibe.id)}
                                onChange={onChange}
                            />
                        ))}
                    </div>
                </CardContent>

                <CardFooter className="justify-between gap-3 border-t border-white/70 px-4.5 py-1.5">
                    <Button
                        type="button"
                        onClick={onBack}
                        variant="outline"
                        className="w-32 h-10 border-primary/25 bg-background/80 text-foreground font-semibold hover:bg-primary/10 hover:text-primary dark:border-primary/35 dark:bg-white/10 dark:text-white dark:hover:bg-primary/20 dark:hover:text-white backdrop-blur-sm"
                    >
                        <IoArrowBack className="size-5" />
                        Back
                    </Button>
                    <Button
                        type="button"
                        onClick={onNext}
                        className="w-25 h-10 rounded-lg bg-primary text-base font-semibold text-primary-foreground hover:bg-primary/90 shadow-none"
                    >
                        Next
                    </Button>
                </CardFooter>
            </Card>
        </div>
    );
}
