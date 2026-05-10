import {
    Compass,
    Mail,
    Scale,
    Sparkles,
    UsersRound,
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import bgImage from '@/assets/bg.jpeg';
import logoImage from '@/assets/Vibe-voyage-Logo.png';
import photoSpotImage from '@/assets/createTrip/photo_spot.png';
import mountainImage from '@/assets/createTrip/mountain.png';
import natureImage from '@/assets/createTrip/nature.png';
import localCultureImage from '@/assets/createTrip/local_culture.png';
import { useI18n } from '@/hooks/useI18n';

type Member = {
    thaiName: string;
    englishName: string;
    email: string;
    roleEn: string;
    roleTh: string;
    image: string;
    accentClassName: string;
};

const MEMBERS: Member[] = [
    {
        thaiName: 'กณิศ บุญยิ่งกูล',
        englishName: 'kanit bunyinkgool',
        email: 'kanit.buny@kmutt.ac.th',
        roleEn: 'Experience design & trip intelligence',
        roleTh: 'ออกแบบประสบการณ์และระบบแนะนำทริป',
        image: photoSpotImage,
        accentClassName: 'bg-emerald-50 text-emerald-600 border-emerald-100',
    },
    {
        thaiName: 'มนัสนันท์ นิลเรือง',
        englishName: 'manassanan nilruang',
        email: 'manatsanan.ninr@kmutt.ac.th',
        roleEn: 'Frontend craft & product experience',
        roleTh: 'พัฒนา Frontend และประสบการณ์การใช้งาน',
        image: mountainImage,
        accentClassName: 'bg-amber-50 text-amber-600 border-amber-100',
    },
];

const HIGHLIGHTS = [
    {
        icon: <Compass className="size-5" />,
        titleEn: 'Attraction Recommend',
        titleTh: 'แนะนำสถานที่ท่องเที่ยว',
        textEn: 'AI analyzes each traveler lifestyle to recommend destinations, cafes, activities, and places that match the trip mood.',
        textTh: 'AI วิเคราะห์ไลฟ์สไตล์ของผู้ร่วมทริป เพื่อแนะนำสถานที่ คาเฟ่ กิจกรรม และจุดเที่ยวที่เข้ากับบรรยากาศของทริป',
        className: 'border-sky-100 bg-sky-50 text-sky-700',
    },
    {
        icon: <Scale className="size-5" />,
        titleEn: 'Equitable Itinerary',
        titleTh: 'จัดตารางเที่ยวอย่างเท่าเทียม',
        textEn: 'The system creates a fair group itinerary by mixing personalized recommendations from every member.',
        textTh: 'ระบบผสมผสานความชอบของสมาชิกทุกคนให้เป็นตารางเที่ยวที่ลงตัว เพื่อให้ทุกคนมีส่วนร่วมในแผนทริปอย่างเท่าเทียม',
        className: 'border-violet-100 bg-violet-50 text-violet-700',
    },
    {
        icon: <UsersRound className="size-5" />,
        titleEn: 'Collaborative Trip Room',
        titleTh: 'ห้องวางแผนทริปร่วมกัน',
        textEn: 'Plan together in one room with drag-and-drop schedules, shared members, and real-time trip coordination.',
        textTh: 'วางแผนร่วมกันในห้องทริปเดียว ลากวางตารางได้ แชร์สมาชิกได้ และช่วยกันจัดรายละเอียดทริปให้ลงตัว',
        className: 'border-rose-100 bg-rose-50 text-rose-700',
    },
];

const COPY = {
    en: {
        eyebrow: 'About us',
        team: 'Vibe Voyage Team',
        badge: 'Made by 2 travelers',
        heroTitle: 'Travel planning that feels like your own vibe.',
        heroText:
            'Vibe Voyage is built for people who want a trip plan that understands mood, lifestyle, food, friends, and the little details that make a journey memorable.',
        teamMembers: 'team members',
        tripSuggestions: 'trip planning',
        creators: 'creators',
        storyBadge: 'Our story',
        storyTitle: 'Built to make trip planning less stiff and more alive.',
        storyText:
            'We designed Vibe Voyage around the way people really travel: mixing practical routes with personal taste, shared decisions, and beautiful little discoveries along the way.',
        featuresEyebrow: 'Features',
        featuresTitle: 'Three core features for smarter group travel.',
        featuresText:
            'From personal recommendations to fair schedules and collaborative planning, these are the main ideas behind Vibe Voyage.',
        creatorsEyebrow: 'The creators',
        creatorsTitle: 'Meet the team',
        creatorsText:
            'Two creators shaping the product, interface, and planning experience behind Vibe Voyage.',
        memberBadge: 'Team member',
        natureAlt: 'Nature travel style',
        cultureAlt: 'Local culture travel style',
        bgAlt: 'Vibe Voyage travel background',
    },
    th: {
        eyebrow: 'เกี่ยวกับเรา',
        team: 'ทีม Vibe Voyage',
        badge: 'สร้างโดยนักเดินทาง 2 คน',
        heroTitle: 'วางแผนทริปให้เข้ากับสไตล์ของคุณจริง ๆ',
        heroText:
            'Vibe Voyage ถูกสร้างขึ้นสำหรับคนที่อยากได้แผนเที่ยวที่เข้าใจอารมณ์ ไลฟ์สไตล์ อาหาร เพื่อนร่วมทริป และรายละเอียดเล็ก ๆ ที่ทำให้การเดินทางน่าจดจำ',
        teamMembers: 'สมาชิกทีม',
        tripSuggestions: 'วางแผนทริป',
        creators: 'ผู้พัฒนา',
        storyBadge: 'เรื่องราวของเรา',
        storyTitle:
            'เราอยากทำให้การวางแผนเที่ยวไม่แข็งทื่อ แต่สนุกและมีชีวิตมากขึ้น',
        storyText:
            'เราออกแบบ Vibe Voyage จากวิธีที่ผู้คนเที่ยวกันจริง ๆ ทั้งเส้นทางที่ใช้งานได้ รสนิยมส่วนตัว การตัดสินใจร่วมกัน และการค้นพบสถานที่เล็ก ๆ ที่ทำให้ทริปพิเศษขึ้น',
        featuresEyebrow: 'ฟีเจอร์',
        featuresTitle: '3 ฟีเจอร์หลักสำหรับการจัดทริปกลุ่มให้ฉลาดขึ้น',
        featuresText:
            'ตั้งแต่การแนะนำสถานที่ตามไลฟ์สไตล์ การจัดตารางอย่างเท่าเทียม ไปจนถึงห้องวางแผนทริปร่วมกัน ทั้งหมดคือแกนหลักของ Vibe Voyage',
        creatorsEyebrow: 'ผู้สร้าง',
        creatorsTitle: 'สมาชิกทีม',
        creatorsText:
            'สองผู้พัฒนาที่ร่วมกันออกแบบผลิตภัณฑ์ หน้าตาแอป และประสบการณ์การวางแผนทริปของ Vibe Voyage',
        memberBadge: 'สมาชิกทีม',
        natureAlt: 'สไตล์ท่องเที่ยวธรรมชาติ',
        cultureAlt: 'สไตล์ท่องเที่ยววัฒนธรรมท้องถิ่น',
        bgAlt: 'ภาพพื้นหลังการท่องเที่ยว Vibe Voyage',
    },
};

function MemberCard({
    member,
    memberBadge,
    isThai,
}: {
    member: Member;
    memberBadge: string;
    isThai: boolean;
}) {
    return (
        <article className="overflow-hidden rounded-lg border border-border bg-card text-card-foreground shadow-sm transition-transform duration-200 hover:-translate-y-1 hover:shadow-lg">
            <div className="relative aspect-[16/10] overflow-hidden bg-muted">
                <img
                    src={member.image}
                    alt={member.thaiName}
                    className="h-full w-full object-cover"
                />
                <div className="absolute inset-x-0 bottom-0 h-20 bg-linear-to-t from-black/50 to-transparent" />
                <Badge
                    variant="outline"
                    className={`absolute left-4 top-4 border ${member.accentClassName}`}
                >
                    {memberBadge}
                </Badge>
            </div>

            <div className="flex flex-col gap-4 p-5 sm:p-6">
                <div className="space-y-1">
                    <h2 className="text-xl font-bold text-foreground">
                        {member.thaiName}
                    </h2>
                    <p className="text-sm font-medium capitalize text-primary">
                        {member.englishName}
                    </p>
                    <p className="text-sm text-muted-foreground">
                        {isThai ? member.roleTh : member.roleEn}
                    </p>
                </div>

                <a
                    href={`mailto:${member.email}`}
                    className="flex min-w-0 items-center gap-2 rounded-lg border border-border bg-background px-3 py-2 text-sm font-medium text-foreground transition-colors hover:border-primary/35 hover:text-primary"
                >
                    <Mail className="size-4 shrink-0" />
                    <span className="min-w-0 truncate">{member.email}</span>
                </a>
            </div>
        </article>
    );
}

export default function AboutUs() {
    const { lang } = useI18n();
    const isThai = lang === 'th';
    const copy = isThai ? COPY.th : COPY.en;

    return (
        <main className="flex flex-col gap-6 px-4 pb-12 sm:gap-8 sm:px-8">
            <section className="relative min-h-[460px] overflow-hidden rounded-4xl bg-card text-white shadow-[0_24px_80px_-48px_rgba(76,61,121,0.9)] sm:min-h-[520px]">
                <img
                    src={bgImage}
                    alt={copy.bgAlt}
                    className="absolute inset-0 h-full w-full object-cover"
                />
                <div className="absolute inset-0 bg-linear-to-br from-[#171328]/92 via-[#2d2552]/72 to-[#0f766e]/60" />

                <div className="relative flex min-h-[460px] flex-col justify-between gap-10 p-6 sm:min-h-[520px] sm:p-10 lg:p-12">
                    <div className="flex items-center justify-between gap-4">
                        <div className="flex items-center gap-3">
                            <span className="flex size-14 items-center justify-center rounded-2xl bg-white/92 shadow-lg">
                                <img
                                    src={logoImage}
                                    alt="Vibe Voyage"
                                    className="size-10 object-contain"
                                />
                            </span>
                            <div>
                                <p className="text-sm font-semibold uppercase tracking-[0.2em] text-white/70">
                                    {copy.eyebrow}
                                </p>
                                <p className="text-sm text-white/80">
                                    {copy.team}
                                </p>
                            </div>
                        </div>

                        <Badge className="hidden border-white/20 bg-white/12 text-white backdrop-blur-sm sm:inline-flex">
                            <Sparkles className="size-3.5" />
                            {copy.badge}
                        </Badge>
                    </div>

                    <div className="max-w-4xl">
                        <h1 className="max-w-3xl text-4xl font-black leading-tight text-white sm:text-6xl lg:text-7xl">
                            {copy.heroTitle}
                        </h1>
                        <p className="mt-5 max-w-2xl text-base leading-7 text-white/82 sm:text-lg">
                            {copy.heroText}
                        </p>
                    </div>

                    <div className="grid gap-3 sm:grid-cols-3">
                        <div className="rounded-lg border border-white/16 bg-white/12 p-4 backdrop-blur-md">
                            <p className="text-3xl font-black">2</p>
                            <p className="mt-1 text-sm text-white/72">
                                {copy.teamMembers}
                            </p>
                        </div>
                        <div className="rounded-lg border border-white/16 bg-white/12 p-4 backdrop-blur-md">
                            <p className="text-3xl font-black">AI</p>
                            <p className="mt-1 text-sm text-white/72">
                                {copy.tripSuggestions}
                            </p>
                        </div>
                        <div className="rounded-lg border border-white/16 bg-white/12 p-4 backdrop-blur-md">
                            <p className="text-3xl font-black">KMUTT</p>
                            <p className="mt-1 text-sm text-white/72">
                                {copy.creators}
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            <section className="grid gap-5 lg:grid-cols-[0.9fr_1.1fr]">
                <div className="flex flex-col justify-between gap-6 rounded-4xl bg-muted p-6 sm:p-8">
                    <div>
                        <Badge
                            variant="outline"
                            className="border-primary/15 bg-primary/6 text-primary"
                        >
                            <UsersRound className="size-3.5" />
                            {copy.storyBadge}
                        </Badge>
                        <h2 className="mt-5 text-3xl font-black text-primary sm:text-4xl">
                            {copy.storyTitle}
                        </h2>
                        <p className="mt-4 text-sm leading-7 text-muted-foreground sm:text-base">
                            {copy.storyText}
                        </p>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                        <img
                            src={natureImage}
                            alt={copy.natureAlt}
                            className="aspect-square rounded-lg bg-card object-cover p-3 shadow-sm"
                        />
                        <img
                            src={localCultureImage}
                            alt={copy.cultureAlt}
                            className="aspect-square rounded-lg bg-card object-cover p-3 shadow-sm"
                        />
                    </div>
                </div>

                <div className="flex flex-col gap-4">
                    <div className="rounded-4xl bg-primary/8 p-5 sm:p-6">
                        <Badge
                            variant="outline"
                            className="border-primary/15 bg-card/80 text-primary"
                        >
                            <Sparkles className="size-3.5" />
                            {copy.featuresEyebrow}
                        </Badge>
                        <h2 className="mt-4 text-2xl font-black text-primary sm:text-3xl">
                            {copy.featuresTitle}
                        </h2>
                        <p className="mt-3 text-sm leading-6 text-muted-foreground">
                            {copy.featuresText}
                        </p>
                    </div>

                    <div className="grid gap-4 sm:grid-cols-3">
                        {HIGHLIGHTS.map((item) => (
                            <article
                                key={isThai ? item.titleTh : item.titleEn}
                                className="rounded-lg border border-border bg-card p-5 shadow-sm transition-transform duration-200 hover:-translate-y-1 hover:shadow-md"
                            >
                                <span
                                    className={`flex size-11 items-center justify-center rounded-lg border ${item.className}`}
                                >
                                    {item.icon}
                                </span>
                                <h3 className="mt-5 text-lg font-bold text-foreground">
                                    {isThai ? item.titleTh : item.titleEn}
                                </h3>
                                <p className="mt-2 text-sm leading-6 text-muted-foreground">
                                    {isThai ? item.textTh : item.textEn}
                                </p>
                            </article>
                        ))}
                    </div>
                </div>
            </section>

            <section className="rounded-4xl bg-muted p-5 sm:p-8">
                <div className="mb-6 flex flex-col justify-between gap-3 sm:flex-row sm:items-end">
                    <div>
                        <p className="text-sm font-semibold uppercase tracking-[0.18em] text-primary/70">
                            {copy.creatorsEyebrow}
                        </p>
                        <h2 className="mt-2 text-3xl font-black text-primary sm:text-4xl">
                            {copy.creatorsTitle}
                        </h2>
                    </div>
                    <p className="max-w-lg text-sm leading-6 text-muted-foreground">
                        {copy.creatorsText}
                    </p>
                </div>

                <div className="grid gap-5 md:grid-cols-2">
                    {MEMBERS.map((member) => (
                        <MemberCard
                            key={member.email}
                            member={member}
                            memberBadge={copy.memberBadge}
                            isThai={isThai}
                        />
                    ))}
                </div>
            </section>
        </main>
    );
}
