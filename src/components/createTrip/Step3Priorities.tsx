import { Check, Leaf, Sparkles, UtensilsCrossed } from 'lucide-react';
import { IoArrowBack } from 'react-icons/io5';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import { cn } from '@/lib/utils';
import beautifulAtmosphereIcon from '@/assets/createTrip/step_3/beautiful_atmosphere.png';
import cafeDessertIcon from '@/assets/createTrip/step_3/cafe_dessert.png';
import ecoFriendlySustainableIcon from '@/assets/createTrip/step_3/eco_friendly_sustainable.png';
import funActivitiesIcon from '@/assets/createTrip/step_3/fun_activities.png';
import goodFoodLocalDishesIcon from '@/assets/createTrip/step_3/good_food_local_dishes.png';
import greatPhotoVibesIcon from '@/assets/createTrip/step_3/great_photo_vibes.png';
import halalMuslimFoodIcon from '@/assets/createTrip/step_3/halal_muslim_food.png';
import localStoriesCultureIcon from '@/assets/createTrip/step_3/local_stories_culture.png';
import thaiFoodIcon from '@/assets/createTrip/step_3/thai_food.png';
import thaiLocalFoodIcon from '@/assets/createTrip/step_3/thai_local_food.png';
import westernFoodIcon from '@/assets/createTrip/step_3/western_food.png';
import asianFood from '@/assets/createTrip/step_3/asian_food.png';

const PRIORITIES = [
    {
        id: 'beautiful_atmosphere',
        label: 'Beautiful atmosphere',
        labelTH: 'บรรยากาศสวย',
        icon: beautifulAtmosphereIcon,
    },
    {
        id: 'local_stories_culture',
        label: 'Local stories & culture',
        labelTH: 'เรื่องราวและวัฒนธรรมท้องถิ่น',
        icon: localStoriesCultureIcon,
    },
    {
        id: 'great_photo_vibes',
        label: 'Great photo vibes',
        labelTH: 'มุมถ่ายรูปสวย',
        icon: greatPhotoVibesIcon,
    },
    {
        id: 'eco_friendly_sustainable',
        label: 'Eco-friendly & sustainable',
        labelTH: 'การท่องเที่ยวแบบใส่ใจสิ่งแวดล้อม',
        icon: ecoFriendlySustainableIcon,
    },
    {
        id: 'good_food_local_dishes',
        label: 'Good food & local dishes',
        labelTH: 'อาหารอร่อยและอาหารพื้นเมือง',
        icon: goodFoodLocalDishesIcon,
    },
    {
        id: 'fun_activities',
        label: 'Fun activities',
        labelTH: 'กิจกรรมสนุก ๆ',
        icon: funActivitiesIcon,
    },
];

const FOOD_VIBES = [
    {
        id: 'thai_food',
        label: 'Thai Food',
        labelTH: 'อาหารไทย',
        icon: thaiFoodIcon,
    },
    {
        id: 'asian_food',
        label: 'Asian Food',
        labelTH: 'อาหารเอเชีย',
        icon: asianFood,
    },
    {
        id: 'thai_local_food',
        label: 'Thai Local Food',
        labelTH: 'อาหารท้องถิ่นของไทย',
        icon: thaiLocalFoodIcon,
    },
    {
        id: 'halal_muslim_food',
        label: 'Halal / Muslim Food',
        labelTH: 'อาหารฮาลาล',
        icon: halalMuslimFoodIcon,
    },
    {
        id: 'western_food',
        label: 'Western Food',
        labelTH: 'อาหารตะวันตก',
        icon: westernFoodIcon,
    },
    {
        id: 'cafe_dessert',
        label: 'Cafe and Dessert',
        labelTH: 'คาเฟ่และของหวาน',
        icon: cafeDessertIcon,
    },
];

interface CheckItemProps {
    id: string;
    label: string;
    labelTH: string;
    icon?: string;
    checked: boolean;
    onChange: (id: string) => void;
}

function PreferenceOption({
    id,
    label,
    labelTH,
    icon,
    checked,
    onChange,
}: CheckItemProps) {
    return (
        <button
            type="button"
            aria-pressed={checked}
            onClick={() => onChange(id)}
            className={cn(
                'group flex min-h-[60px] w-full items-start gap-2 rounded-xl border px-3.5 py-2 text-left transition-all duration-200',
                checked
                    ? 'border-primary/30 bg-linear-to-br from-primary/12 via-white to-secondary/70 shadow-[0_16px_36px_-28px_rgba(76,61,121,0.9)]'
                    : 'border-white/70 bg-white/75 hover:border-primary/20 hover:bg-white',
            )}
        >
            <span
                className={cn(
                    'my-auto flex size-8 shrink-0 items-center justify-center rounded-lg border transition-colors',
                    checked
                        ? 'border-primary/20 bg-primary text-primary-foreground'
                        : 'border-border bg-muted/80 text-muted-foreground group-hover:border-primary/20',
                )}
            >
                <Check className="size-4" />
            </span>

            <span className="my-auto flex size-8 shrink-0 items-center justify-center overflow-hidden rounded-lg bg-muted/60">
                {icon ? (
                    <img src={icon} alt="" className="size-7 object-contain" />
                ) : (
                    <span className="size-2 rounded-full bg-primary/35" />
                )}
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

function PreferenceCard({
    title,
    subtitle,
    note,
    icon,
    selectedCount,
    options,
    selected,
    onChange,
    accentClassName,
}: {
    title: string;
    subtitle: string;
    note: string;
    icon: React.ReactNode;
    selectedCount: number;
    options: Array<{
        id: string;
        label: string;
        labelTH: string;
        icon?: string;
    }>;
    selected: string[];
    onChange: (id: string) => void;
    accentClassName: string;
}) {
    return (
        <Card className="gap-0 overflow-hidden rounded-[24px] border-white/70 bg-white/70 shadow-[0_18px_46px_-34px_rgba(76,61,121,0.55)] backdrop-blur-sm">
            <CardHeader className="gap-1 border-b border-white/70 px-4.5 pb-0.5 pt-0.5">
                <div className="flex items-start justify-between gap-3">
                    <div
                        className={cn(
                            'flex size-7 items-center justify-center rounded-xl border',
                            accentClassName,
                        )}
                    >
                        {icon}
                    </div>

                    <Badge
                        variant="secondary"
                        className="rounded-full bg-white/80 px-2.5 py-1 text-[10px] font-semibold text-primary"
                    >
                        {selectedCount} selected
                    </Badge>
                </div>

                <div className="space-y-0">
                    <CardTitle className="text-base text-foreground">
                        {title}
                    </CardTitle>
                    <CardDescription className="text-xs leading-relaxed text-muted-foreground sm:text-sm">
                        {subtitle}
                    </CardDescription>
                </div>

                <Badge
                    variant="outline"
                    className="w-fit rounded-full border-primary/15 bg-primary/6 px-2.5 py-1 text-[10px] font-medium text-primary"
                >
                    {note}
                </Badge>
            </CardHeader>

            <CardContent className="px-4 py-1">
                <div className="grid gap-2 sm:grid-cols-2">
                    {options.map((option) => (
                        <PreferenceOption
                            key={option.id}
                            id={option.id}
                            label={option.label}
                            labelTH={option.labelTH}
                            icon={option.icon}
                            checked={selected.includes(option.id)}
                            onChange={onChange}
                        />
                    ))}
                </div>
            </CardContent>
        </Card>
    );
}

interface Step3PrioritiesProps {
    priorities: string[];
    onPriority: (id: string) => void;
    foodVibes: string[];
    onFood: (id: string) => void;
    extra: string;
    onExtra: (v: string) => void;
    onBack: () => void;
    onSubmit: () => void;
}

export default function Step3Priorities({
    priorities,
    onPriority,
    foodVibes,
    onFood,
    extra,
    onExtra,
    onBack,
    onSubmit,
}: Step3PrioritiesProps) {
    return (
        <div className="flex w-full flex-col gap-2.5">
            <div className="grid gap-2.5 xl:grid-cols-2">
                <PreferenceCard
                    title="What matters most on your trip?"
                    subtitle="ตอนไปเที่ยว สิ่งไหนสำคัญกับคุณที่สุด?"
                    note="Choose all that match you"
                    icon={<Sparkles className="size-4.5" />}
                    selectedCount={priorities.length}
                    options={PRIORITIES}
                    selected={priorities}
                    onChange={onPriority}
                    accentClassName="border-rose-100 bg-rose-50 text-rose-500"
                />

                <PreferenceCard
                    title="What food vibe fits your travels?"
                    subtitle="อาหารอะไรที่คุณชอบเวลาเที่ยว?"
                    note="Choose all that match you"
                    icon={<UtensilsCrossed className="size-4.5" />}
                    selectedCount={foodVibes.length}
                    options={FOOD_VIBES}
                    selected={foodVibes}
                    onChange={onFood}
                    accentClassName="border-amber-100 bg-amber-50 text-amber-500"
                />
            </div>

            <Card className="gap-0 rounded-[24px] border-white/70 bg-white/75 shadow-[0_18px_44px_-36px_rgba(76,61,121,0.7)] backdrop-blur-sm">
                <CardHeader className="gap-1 border-b border-white/70 px-4.5 py-0.5">
                    <div className="flex items-start justify-between gap-3">
                        <div className="flex size-7 items-center justify-center rounded-xl border border-emerald-100 bg-emerald-50 text-emerald-500">
                            <Leaf className="size-4.5" />
                        </div>
                        <Badge
                            variant="outline"
                            className="rounded-full border-primary/15 bg-primary/6 px-2.5 py-1 text-[10px] font-medium text-primary"
                        >
                            Optional
                        </Badge>
                    </div>

                    <div className="space-y-0">
                        <CardTitle className="text-base text-foreground">
                            Anything else about your travel lifestyle?
                        </CardTitle>
                        <CardDescription className="text-xs leading-relaxed text-muted-foreground sm:text-sm">
                            มีอะไรอยากเพิ่มเติมเกี่ยวกับสไตล์การท่องเที่ยวของคุณไหม?
                        </CardDescription>
                    </div>
                </CardHeader>

                <CardContent className="px-4.5 py-3">
                    <textarea
                        value={extra}
                        onChange={(e) => onExtra(e.target.value)}
                        placeholder="Tell us more about your travel lifestyle for this voyage"
                        rows={2}
                        className="w-full resize-none rounded-[18px] border border-primary/10 bg-[linear-gradient(to_bottom_right,#fff,rgba(245,243,255,0.4))] px-4 py-2 text-sm text-slate-950 caret-slate-950 placeholder:text-slate-500 focus:border-primary/30 focus:outline-none focus:ring-2 focus:ring-primary/10"
                    />
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
                        onClick={onSubmit}
                        className="w-25 h-10 rounded-lg bg-primary text-base font-semibold text-primary-foreground hover:bg-primary/90 shadow-none"
                    >
                        Submit
                    </Button>
                </CardFooter>
            </Card>
        </div>
    );
}
