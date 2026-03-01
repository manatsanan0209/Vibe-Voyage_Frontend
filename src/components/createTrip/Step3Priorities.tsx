import { IoArrowBack } from 'react-icons/io5';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

// ---------- data ----------

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

// ---------- CircleCheckItem ----------

interface CheckItemProps {
    id: string;
    label: string;
    labelTH: string;
    checked: boolean;
    onChange: (id: string) => void;
}

function SquareCheckItem({
    id,
    label,
    labelTH,
    checked,
    onChange,
}: CheckItemProps) {
    return (
        <button
            type="button"
            onClick={() => onChange(id)}
            className="flex items-start gap-2.5 text-left py-1 w-full"
        >
            <span
                className={cn(
                    'flex shrink-0 size-4.25 rounded-md mt-0.5 bg-gray-200 border items-center justify-center transition-colors duration-150',
                    checked ? 'border-violet-950' : 'border-transparent',
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
                <span className="text-base font-normal text-gray-900 leading-tight">
                    {label}
                </span>
                <span className="text-sm font-normal text-purple-400 leading-tight">
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
                <span className="text-sm font-light text-pink-500 shrink-0 mt-0.5 whitespace-nowrap">
                    {note}
                </span>
            )}
        </div>
    );
}

// ---------- props ----------

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

// ---------- component ----------

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
        <div className="w-full flex flex-col gap-8">
            {/* Q1 */}
            <div className="flex flex-col gap-4">
                <QuestionHeader
                    question="On your voyage, what matters most to you?"
                    questionTH="ตอนไปเที่ยว สิ่งไหนสำคัญกับคุณที่สุด?"
                    note="* Choose all that match you"
                />
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-0.5">
                    {PRIORITIES.map((p) => (
                        <SquareCheckItem
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
            <div className="flex flex-col gap-4">
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
            <div className="flex flex-col gap-4">
                <div className="flex items-start justify-between gap-4">
                    <div>
                        <p className="text-lg font-semibold text-black leading-tight">
                            Anything to add about your travel lifestyle?
                        </p>
                        <p className="text-base font-light text-gray-500 mt-0.5">
                            มีอะไรอยากเพิ่มเติมเกี่ยวกับสไตล์การท่องเที่ยวของคุณไหม?
                        </p>
                    </div>
                    <span className="text-sm font-light text-pink-500 shrink-0 mt-0.5 whitespace-nowrap">
                        * not required
                    </span>
                </div>
                <textarea
                    value={extra}
                    onChange={(e) => onExtra(e.target.value)}
                    placeholder="Tell us more about your travel lifestyle for this voyage"
                    rows={2}
                    className="w-full rounded-md border border-gray-400 bg-white px-3 py-2.5 text-sm text-black placeholder:text-gray-500 resize-none focus:outline-none focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600"
                />
            </div>

            {/* Actions */}
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
                    onClick={onSubmit}
                    className="w-25 h-10 rounded-lg bg-indigo-600 text-base font-semibold text-white hover:bg-indigo-700 shadow-none"
                >
                    Submit
                </Button>
            </div>
        </div>
    );
}
