import { useState } from 'react';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

// ---------- data ----------

const VIBES = [
    { id: 'beach', label: 'Beach & island chill', labelTH: 'ทะเลและเกาะชิลๆ' },
    {
        id: 'local-culture',
        label: 'Local culture & old-town',
        labelTH: 'วัฒนธรรมท้องถิ่นและเมืองเก่า',
    },
    {
        id: 'adventure',
        label: 'Adventure & activity',
        labelTH: 'ผจญภัยและกิจกรรม',
    },
    {
        id: 'photo-cafe',
        label: 'Photo spots & café',
        labelTH: 'ถ่ายรูปและคาเฟ่',
    },
    {
        id: 'nature',
        label: 'Nature & peaceful',
        labelTH: 'ธรรมชาติ & เงียบสงบ',
    },
    {
        id: 'slow-life',
        label: 'Slow-life & relaxing',
        labelTH: 'สโลว์ไลฟ์และพักผ่อน',
    },
    { id: 'shopping', label: 'Shopping & market', labelTH: 'ซื้อของและตลาด' },
    {
        id: 'mountain',
        label: 'Mountain & scenic-view',
        labelTH: 'ภูเขาและวิวธรรมชาติ',
    },
];

const PRIORITIES = [
    { id: 'atmosphere', label: 'Beautiful atmosphere', labelTH: 'บรรยากาศสวย' },
    {
        id: 'culture',
        label: 'Local stories & culture',
        labelTH: 'เรื่องราวและวัฒนธรรมท้องถิ่น',
    },
    { id: 'photo', label: 'Great photo vibes', labelTH: 'มุมถ่ายรูปสวย' },
    {
        id: 'eco',
        label: 'Eco-friendly & sustainable',
        labelTH: 'การท่องเที่ยวแบบใส่ใจสิ่งแวดล้อม',
    },
    {
        id: 'food',
        label: 'Good food & local dishes',
        labelTH: 'อาหารอร่อยและอาหารพื้นเมือง',
    },
    { id: 'activities', label: 'Fun activities', labelTH: 'กิจกรรมสนุก ๆ' },
];

const FOOD_VIBES = [
    { id: 'thai', label: 'Thai Food', labelTH: 'อาหารไทย' },
    { id: 'asian', label: 'Asian Food', labelTH: 'อาหารเอเชีย' },
    {
        id: 'thai-local',
        label: 'Thai Local Food',
        labelTH: 'อาหารท้องถิ่นของไทย',
    },
    { id: 'halal', label: 'Halal / Muslim Food', labelTH: 'อาหารฮาลาล' },
    { id: 'western', label: 'Western Food', labelTH: 'อาหารตะวันตก' },
    {
        id: 'cafe-dessert',
        label: 'Café and Dessert',
        labelTH: 'คาเฟ่และของหวาน',
    },
];

// ---------- VibeCard ----------

interface CardProps {
    id: string;
    label: string;
    labelTH: string;
    checked: boolean;
    onChange: (id: string) => void;
}

function VibeCard({ id, label, labelTH, checked, onChange }: CardProps) {
    return (
        <button
            type="button"
            onClick={() => onChange(id)}
            className={cn(
                'flex items-center gap-3 w-full rounded-xl border-2 px-5 py-3 text-left transition-colors duration-150',
                checked
                    ? 'bg-violet-50 border-indigo-400'
                    : 'bg-white border-gray-300 hover:border-indigo-400',
            )}
        >
            <span className="size-6.25 rounded-full bg-gray-300 shrink-0" />
            <span className="flex flex-col min-w-0">
                <span className="text-sm font-normal text-gray-900 leading-tight truncate">
                    {label}
                </span>
                <span className="text-xs font-normal text-purple-400 leading-tight truncate">
                    {labelTH}
                </span>
            </span>
        </button>
    );
}

// ---------- CircleCheckItem ----------

function CircleCheckItem({ id, label, labelTH, checked, onChange }: CardProps) {
    return (
        <button
            type="button"
            onClick={() => onChange(id)}
            className="flex items-start gap-2.5 text-left py-1 w-full"
        >
            <span
                className={cn(
                    'flex shrink-0 size-3.75 rounded-full mt-0.5 items-center justify-center border-2 transition-all duration-150',
                    checked
                        ? 'bg-white border-purple-500 shadow-[0px_2px_2px_0px_rgba(0,0,0,0.25)]'
                        : 'bg-gray-300 border-transparent',
                )}
            >
                {checked && (
                    <span className="size-2.25 rounded-full bg-indigo-600" />
                )}
            </span>
            <span className="flex flex-col min-w-0">
                <span className="text-sm font-normal text-gray-900 leading-tight">
                    {label}
                </span>
                <span className="text-xs font-normal text-purple-400 leading-tight">
                    {labelTH}
                </span>
            </span>
        </button>
    );
}

// ---------- SquareCheckItem ----------

function SquareCheckItem({ id, label, labelTH, checked, onChange }: CardProps) {
    return (
        <button
            type="button"
            onClick={() => onChange(id)}
            className="flex items-start gap-2.5 text-left py-1 w-full"
        >
            <span
                className={cn(
                    'flex shrink-0 size-4.25 rounded-md mt-0.5 bg-gray-300 border items-center justify-center transition-colors duration-150',
                    checked ? 'border-purple-800' : 'border-transparent',
                )}
            >
                {checked && (
                    <svg
                        width="10"
                        height="8"
                        viewBox="0 0 10 8"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                    >
                        <path
                            d="M1 4L3.5 6.5L9 1"
                            stroke="#4C3D79"
                            strokeWidth="1.5"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                        />
                    </svg>
                )}
            </span>
            <span className="flex flex-col min-w-0">
                <span className="text-sm font-normal text-gray-900 leading-tight">
                    {label}
                </span>
                <span className="text-xs font-normal text-purple-400 leading-tight">
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
                <p className="text-sm font-semibold text-gray-900 leading-tight">
                    {question}
                </p>
                <p className="text-xs font-light text-gray-500 mt-0.5">
                    {questionTH}
                </p>
            </div>
            {note && (
                <span className="text-xs font-light text-red-500 shrink-0 mt-0.5 whitespace-nowrap">
                    {note}
                </span>
            )}
        </div>
    );
}

// ---------- toggle helper ----------

function toggle(list: string[], id: string): string[] {
    return list.includes(id) ? list.filter((v) => v !== id) : [...list, id];
}

// ---------- form state ----------

export interface VibeFormData {
    vibes: string[];
    priorities: string[];
    foodVibes: string[];
    extra: string;
}

const INITIAL: VibeFormData = {
    vibes: [],
    priorities: [],
    foodVibes: [],
    extra: '',
};

// ---------- TravelVibeStep props ----------

interface TravelVibeStepProps {
    /** Called when user clicks Back on vibe page 1 → returns to trip info step */
    onBack: () => void;
    /** Called when user submits the completed questionnaire */
    onSubmit: (form: VibeFormData) => void;
}

// ---------- main component ----------

export default function TravelVibeStep({
    onBack,
    onSubmit,
}: TravelVibeStepProps) {
    const [page, setPage] = useState<1 | 2>(1);
    const [form, setForm] = useState<VibeFormData>(INITIAL);

    function handleSubmit() {
        onSubmit(form);
    }

    return (
        <div className="w-full flex flex-col gap-6">
            {/* Title */}
            <p className="text-center text-xl font-semibold text-gray-900">
                Vibe Voyage — Your Travel Style
            </p>

            {page === 1 ? (
                <VibePage1
                    vibes={form.vibes}
                    onChange={(id) =>
                        setForm((f) => ({
                            ...f,
                            vibes: toggle(f.vibes, id),
                        }))
                    }
                    onBack={onBack}
                    onNext={() => setPage(2)}
                />
            ) : (
                <VibePage2
                    priorities={form.priorities}
                    onPriority={(id) =>
                        setForm((f) => ({
                            ...f,
                            priorities: toggle(f.priorities, id),
                        }))
                    }
                    foodVibes={form.foodVibes}
                    onFood={(id) =>
                        setForm((f) => ({
                            ...f,
                            foodVibes: toggle(f.foodVibes, id),
                        }))
                    }
                    extra={form.extra}
                    onExtra={(v) => setForm((f) => ({ ...f, extra: v }))}
                    onBack={() => setPage(1)}
                    onSubmit={handleSubmit}
                />
            )}
        </div>
    );
}

// ---------- VibePage1 ----------

interface VibePage1Props {
    vibes: string[];
    onChange: (id: string) => void;
    onBack: () => void;
    onNext: () => void;
}

function VibePage1({ vibes, onChange, onBack, onNext }: VibePage1Props) {
    return (
        <div className="flex flex-col gap-6">
            <QuestionHeader
                question="What's your travel vibe on this voyage?"
                questionTH="การเที่ยวของคุณในการเดินทางครั้งนี้เป็นแบบไหน"
                note="* Choose all that match you"
            />

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-4">
                {VIBES.map((v) => (
                    <VibeCard
                        key={v.id}
                        id={v.id}
                        label={v.label}
                        labelTH={v.labelTH}
                        checked={vibes.includes(v.id)}
                        onChange={onChange}
                    />
                ))}
            </div>

            <div className="flex items-center justify-between pt-1">
                <button
                    type="button"
                    onClick={onBack}
                    className="flex items-center gap-1 text-purple-500 hover:text-indigo-600 transition-colors focus:outline-none"
                >
                    <ArrowLeft className="size-4" />
                    <span className="text-xs font-medium">Back</span>
                </button>
                <Button
                    onClick={onNext}
                    className="w-29 h-7.5 rounded-lg bg-indigo-600 text-sm font-semibold text-white hover:bg-indigo-700 shadow-none"
                >
                    Next
                </Button>
            </div>
        </div>
    );
}

// ---------- VibePage2 ----------

interface VibePage2Props {
    priorities: string[];
    onPriority: (id: string) => void;
    foodVibes: string[];
    onFood: (id: string) => void;
    extra: string;
    onExtra: (v: string) => void;
    onBack: () => void;
    onSubmit: () => void;
}

function VibePage2({
    priorities,
    onPriority,
    foodVibes,
    onFood,
    extra,
    onExtra,
    onBack,
    onSubmit,
}: VibePage2Props) {
    return (
        <div className="flex flex-col gap-6">
            {/* Q1 */}
            <div className="flex flex-col gap-2">
                <QuestionHeader
                    question="On your voyage, what matters most to you?"
                    questionTH="ตอนไปเที่ยว สิ่งไหนสำคัญกับคุณที่สุด?"
                    note="* Choose all that match you"
                />
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-0.5">
                    {PRIORITIES.map((p) => (
                        <CircleCheckItem
                            key={p.id}
                            id={p.id}
                            label={p.label}
                            labelTH={p.labelTH}
                            checked={priorities.includes(p.id)}
                            onChange={onPriority}
                        />
                    ))}
                </div>
            </div>

            {/* Q2 */}
            <div className="flex flex-col gap-2">
                <QuestionHeader
                    question="What food vibe do you enjoy when you travel?"
                    questionTH="อาหารอะไรที่คุณชอบเวลาเที่ยว?"
                    note="* Choose all that match you"
                />
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-0.5">
                    {FOOD_VIBES.map((f) => (
                        <SquareCheckItem
                            key={f.id}
                            id={f.id}
                            label={f.label}
                            labelTH={f.labelTH}
                            checked={foodVibes.includes(f.id)}
                            onChange={onFood}
                        />
                    ))}
                </div>
            </div>

            {/* Q3 */}
            <div className="flex flex-col gap-1.5">
                <div className="flex items-start justify-between gap-4">
                    <div>
                        <p className="text-sm font-semibold text-gray-900 leading-tight">
                            Anything to add about your travel lifestyle?
                        </p>
                        <p className="text-xs font-light text-gray-500 mt-0.5">
                            มีอะไรอยากเพิ่มเติมเกี่ยวกับสไตล์การท่องเที่ยวของคุณไหม?
                        </p>
                    </div>
                    <span className="text-xs font-light text-red-500 shrink-0 mt-0.5 whitespace-nowrap">
                        * not required
                    </span>
                </div>
                <textarea
                    value={extra}
                    onChange={(e) => onExtra(e.target.value)}
                    placeholder="Tell us more about your travel lifestyle for this voyage"
                    rows={2}
                    className="w-full rounded-md border border-gray-400 bg-white px-3 py-2.5 text-sm text-gray-900 placeholder:text-gray-500 resize-none focus:outline-none focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600"
                />
            </div>

            {/* Submit */}
            <div className="flex items-center justify-between pt-1">
                <button
                    type="button"
                    onClick={onBack}
                    className="flex items-center gap-1 text-purple-500 hover:text-indigo-600 transition-colors focus:outline-none"
                >
                    <ArrowLeft className="size-4" />
                    <span className="text-xs font-medium">Back</span>
                </button>
                <Button
                    onClick={onSubmit}
                    className="w-29 h-7.5 rounded-lg bg-indigo-600 text-sm font-semibold text-white hover:bg-indigo-700 shadow-none"
                >
                    Submit
                </Button>
            </div>
        </div>
    );
}
