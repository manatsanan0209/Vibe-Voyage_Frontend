export type SupportedLanguage = 'en' | 'th';

interface Dict {
    [key: string]: string | Dict;
}

const DICT: Record<SupportedLanguage, Dict> = {
    en: {
        nav: {
            home: 'Home',
            tripSuggestions: 'Trip Suggestions',
            aboutUs: 'About Us',
            settings: 'Settings',
            yourTrips: 'Your Trips',
            logout: 'Log out',
        },
        auth: {
            hi: 'Hi',
            signIn: 'Sign in',
            signUp: 'Sign up',
        },
        common: {
            loading: 'Loading…',
            back: 'Back',
            user: 'User',
            to: 'To',
        },
        authForm: {
            username: 'Username',
            usernamePlaceholder: 'Enter your username',
            password: 'Password',
            passwordPlaceholder: 'Enter your password',
            rememberMe: 'Remember me',
            showPassword: 'Show password',
            hidePassword: 'Hide password',

            signIn: 'Sign In',
            signingIn: 'Signing In...',
            signInMissing: 'Please enter username and password.',
            signInFailed: 'Login failed. Please check your credentials.',
            noAccount: "Don't have an account?",
            signUpLink: 'Sign Up',

            fullName: 'Full Name',
            fullNamePlaceholder: 'Enter your full name',
            email: 'Email',
            emailPlaceholder: 'Enter your email',
            confirmPassword: 'Confirm Password',
            confirmPasswordPlaceholder: 'Confirm your password',

            signUp: 'Sign Up',
            signingUp: 'Signing Up...',
            signUpMissing: 'Please fill in all fields.',
            signUpPasswordMismatch: 'Passwords do not match.',
            signUpFailed: 'Sign up failed. Please try again.',
            haveAccount: 'Already have an account?',
            signInLink: 'Sign In',
        },
        authLogo: {
            welcome: 'Welcome to Vibe Voyage',
            taglinePrefix: 'Turn your',
            vibe: 'vibe',
            taglineSuffix: 'into unforgettable adventures.',
        },
        profile: {
            title: 'Profile',
            welcome: 'Welcome',
            signOut: 'Sign Out',
        },
        home: {
            planTitle: 'Plan your new trip',
            planSubtitle:
                'Curate moments. Create your vibe. Begin your voyage.',
            whereTo: 'Where to?',
            day: 'Day',
            startDate: 'Start date',
            endDate: 'End date',
            chooseDestinationError: '* Choose a destination to start planning',
            plan: 'Plan',
            popularTitle: 'Popular Trip',
            seeMore: 'See more',
        },
        destinationSelect: {
            loading: 'Loading...',
            placeholderExample: 'e.g. Bangkok, Mueang Chiang Mai, Chiang Mai',
            searchPlaceholder: 'Search districts...',
            empty: 'No results found',
        },
        settings: {
            title: 'Settings',
            appearance: 'Appearance',
            theme: 'Theme',
            themeDesc: 'Changes apply immediately — no save needed',
            language: 'Language',
            languageDesc: 'Select your preferred display language',
            languageOptionEn: 'English',
            languageOptionTh: 'Thai',
            dateFormat: 'Date Format',
            dateFormatDesc: 'How dates are displayed across the app',
            timeFormat: 'Time Format',
            timeFormatDesc: 'Choose between 12-hour and 24-hour clock',
            preview: 'Preview',
            notifications: 'Notifications',
            guideTitle: 'Notification Guide',
            saveChanges: 'Save Changes',
            saving: 'Saving…',
            loadFail: 'Cannot load settings. Please try again.',
            saveSuccess: 'Settings saved successfully',
            saveFail: 'Failed to save settings. Please try again.',
            themeLight: 'Light',
            themeDark: 'Dark',
            themeSystem: 'System (follows OS)',
            lang12h: '12-hour',
            lang24h: '24-hour',
            notify: {
                roomInvite: 'Room Invite',
                roomInviteDesc: 'When someone adds you directly to a room',
                memberJoined: 'Member Joined',
                memberJoinedDesc: 'When a new member joins your room',
                memberLeft: 'Member Left',
                memberLeftDesc:
                    'When a member leaves or is removed from your room',
                tripCreated: 'Trip Created',
                tripCreatedDesc:
                    'When the AI finishes generating your trip schedule',
                lifestyleAnalyzed: 'Lifestyle Analyzed',
                lifestyleAnalyzedDesc:
                    'When the AI finishes analyzing your lifestyle preferences',
                scheduleUpdated: 'Schedule Updated',
                scheduleUpdatedDesc:
                    'When someone edits the trip schedule in your room',
            },
            guide: {
                roomInvite: 'Direct room additions by the owner',
                memberJoined: 'Via direct add or invite link',
                memberLeft: 'Left voluntarily or removed',
                tripCreated: 'AI schedule ready (async)',
                lifestyleAnalyzed: 'AI analysis complete',
                scheduleUpdated: 'Any edit to trip schedule',
            },
        },
        schedule: {
            yourSchedule: 'Your Schedule',
            day: 'Day',
            full: 'Full',
            noTimeSet: 'No time set',
        },
        map: {
            map: 'Map',
        },
        myTrips: {
            title: 'My Trip',
            loadingYourTrips: 'Loading your trips…',
            empty: "You don't have any trips yet. Create a new trip to get started.",
            backendMissingTripId:
                'Some trips are temporarily unavailable because the backend has not returned trip_id for all items.',
        },
        room: {
            leftRoom: 'You left the room.',
            notMember: 'You are no longer in this room.',
            failedToLeave: 'Failed to leave room.',
            ownerCannotLeave:
                'Room owner cannot leave this room. Owner must transfer or remove members using owner actions first.',
            unauthorized: 'Unauthorized. Please sign in again.',
        },
        datePicker: {
            pickDate: 'Pick a date',
        },
    },
    th: {
        nav: {
            home: 'หน้าแรก',
            tripSuggestions: 'แนะนำทริป',
            aboutUs: 'เกี่ยวกับเรา',
            settings: 'ตั้งค่า',
            yourTrips: 'ทริปของคุณ',
            logout: 'ออกจากระบบ',
        },
        auth: {
            hi: 'สวัสดี',
            signIn: 'เข้าสู่ระบบ',
            signUp: 'สมัครสมาชิก',
        },
        common: {
            loading: 'กำลังโหลด…',
            back: 'ย้อนกลับ',
            user: 'ผู้ใช้',
            to: 'ถึง',
        },
        authForm: {
            username: 'ชื่อผู้ใช้',
            usernamePlaceholder: 'กรอกชื่อผู้ใช้',
            password: 'รหัสผ่าน',
            passwordPlaceholder: 'กรอกรหัสผ่าน',
            rememberMe: 'จดจำฉัน',
            showPassword: 'แสดงรหัสผ่าน',
            hidePassword: 'ซ่อนรหัสผ่าน',

            signIn: 'เข้าสู่ระบบ',
            signingIn: 'กำลังเข้าสู่ระบบ...',
            signInMissing: 'กรุณากรอกชื่อผู้ใช้และรหัสผ่าน',
            signInFailed: 'เข้าสู่ระบบไม่สำเร็จ กรุณาตรวจสอบข้อมูลอีกครั้ง',
            noAccount: 'ยังไม่มีบัญชีใช่ไหม?',
            signUpLink: 'สมัครสมาชิก',

            fullName: 'ชื่อ-นามสกุล',
            fullNamePlaceholder: 'กรอกชื่อ-นามสกุล',
            email: 'อีเมล',
            emailPlaceholder: 'กรอกอีเมล',
            confirmPassword: 'ยืนยันรหัสผ่าน',
            confirmPasswordPlaceholder: 'กรอกรหัสผ่านอีกครั้ง',

            signUp: 'สมัครสมาชิก',
            signingUp: 'กำลังสมัครสมาชิก...',
            signUpMissing: 'กรุณากรอกข้อมูลให้ครบถ้วน',
            signUpPasswordMismatch: 'รหัสผ่านไม่ตรงกัน',
            signUpFailed: 'สมัครสมาชิกไม่สำเร็จ กรุณาลองใหม่อีกครั้ง',
            haveAccount: 'มีบัญชีอยู่แล้วใช่ไหม?',
            signInLink: 'เข้าสู่ระบบ',
        },
        authLogo: {
            welcome: 'ยินดีต้อนรับสู่ Vibe Voyage',
            taglinePrefix: 'เปลี่ยน',
            vibe: 'vibe',
            taglineSuffix: 'ให้กลายเป็นการผจญภัยที่น่าจดจำ',
        },
        profile: {
            title: 'โปรไฟล์',
            welcome: 'ยินดีต้อนรับ',
            signOut: 'ออกจากระบบ',
        },
        home: {
            planTitle: 'วางแผนทริปใหม่ของคุณ',
            planSubtitle: 'คัดสรรช่วงเวลา สร้าง vibe เริ่มต้นการเดินทาง',
            whereTo: 'ไปที่ไหนดี?',
            day: 'วัน',
            startDate: 'วันเริ่มต้น',
            endDate: 'วันสิ้นสุด',
            chooseDestinationError: '* กรุณาเลือกปลายทางเพื่อเริ่มวางแผน',
            plan: 'วางแผน',
            popularTitle: 'ทริปยอดนิยม',
            seeMore: 'ดูเพิ่มเติม',
        },
        destinationSelect: {
            loading: 'กำลังโหลด...',
            placeholderExample: 'เช่น กรุงเทพมหานคร, เมืองเชียงใหม่, เชียงใหม่',
            searchPlaceholder: 'ค้นหาอำเภอ...',
            empty: 'ไม่พบอำเภอที่ค้นหา',
        },
        settings: {
            title: 'ตั้งค่า',
            appearance: 'การแสดงผล',
            theme: 'ธีม',
            themeDesc: 'เปลี่ยนแปลงทันที ไม่ต้องกดบันทึก',
            language: 'ภาษา',
            languageDesc: 'เลือกภาษาที่ต้องการแสดงผล',
            languageOptionEn: 'English',
            languageOptionTh: 'ภาษาไทย',
            dateFormat: 'รูปแบบวันที่',
            dateFormatDesc: 'วิธีแสดงวันที่ในแอปพลิเคชัน',
            timeFormat: 'รูปแบบเวลา',
            timeFormatDesc: 'เลือกระหว่างนาฬิกา 12 ชั่วโมง หรือ 24 ชั่วโมง',
            preview: 'ตัวอย่าง',
            notifications: 'การแจ้งเตือน',
            guideTitle: 'คู่มือการแจ้งเตือน',
            saveChanges: 'บันทึกการเปลี่ยนแปลง',
            saving: 'กำลังบันทึก…',
            loadFail: 'ไม่สามารถโหลด settings ได้ กรุณาลองใหม่อีกครั้ง',
            saveSuccess: 'บันทึกการตั้งค่าสำเร็จ',
            saveFail: 'บันทึกไม่สำเร็จ กรุณาลองใหม่อีกครั้ง',
            themeLight: 'สว่าง',
            themeDark: 'มืด',
            themeSystem: 'ตามระบบ (OS)',
            lang12h: '12 ชั่วโมง',
            lang24h: '24 ชั่วโมง',
            notify: {
                roomInvite: 'คำเชิญเข้า Room',
                roomInviteDesc: 'เมื่อมีคนเพิ่มคุณเข้า room โดยตรง',
                memberJoined: 'สมาชิกใหม่เข้าร่วม',
                memberJoinedDesc: 'เมื่อมีสมาชิกใหม่เข้า room ของคุณ',
                memberLeft: 'สมาชิกออกจาก Room',
                memberLeftDesc: 'เมื่อสมาชิกออกจาก room หรือถูกลบออก',
                tripCreated: 'สร้าง Trip สำเร็จ',
                tripCreatedDesc: 'เมื่อ AI สร้างตารางการเดินทางเสร็จแล้ว',
                lifestyleAnalyzed: 'วิเคราะห์ Lifestyle แล้ว',
                lifestyleAnalyzedDesc:
                    'เมื่อ AI วิเคราะห์ความชอบส่วนตัวของคุณเสร็จแล้ว',
                scheduleUpdated: 'อัปเดตตารางเดินทาง',
                scheduleUpdatedDesc:
                    'เมื่อมีการแก้ไขตารางการเดินทางใน room ของคุณ',
            },
            guide: {
                roomInvite: 'เจ้าของ room เพิ่มสมาชิกโดยตรง',
                memberJoined: 'เข้าผ่าน direct add หรือ invite link',
                memberLeft: 'ออกเองหรือถูกลบออก',
                tripCreated: 'AI สร้างตาราง trip เสร็จแล้ว (async)',
                lifestyleAnalyzed: 'AI วิเคราะห์เสร็จแล้ว',
                scheduleUpdated: 'มีการแก้ไข trip schedule ใด ๆ',
            },
        },
        schedule: {
            yourSchedule: 'ตารางของคุณ',
            day: 'วันที่',
            full: 'เต็ม',
            noTimeSet: 'ยังไม่ได้ตั้งเวลา',
        },
        map: {
            map: 'แผนที่',
        },
        myTrips: {
            title: 'ทริปของฉัน',
            loadingYourTrips: 'กำลังโหลดทริปของคุณ...',
            empty: 'ยังไม่มีทริปในตอนนี้ ลองกดสร้างทริปใหม่ได้เลย',
            backendMissingTripId:
                'บางทริปยังไม่สามารถเข้าได้ชั่วคราว เนื่องจาก backend ยังไม่ส่ง trip_id ครบทุกรายการ',
        },
        room: {
            leftRoom: 'คุณออกจากห้องเรียบร้อยแล้ว',
            notMember: 'คุณไม่ได้อยู่ในห้องนี้แล้ว',
            failedToLeave: 'ออกจากห้องไม่สำเร็จ',
            ownerCannotLeave:
                'เจ้าของห้องไม่สามารถออกจากห้องได้ ต้องโอนสิทธิ์หรือจัดการสมาชิกก่อน',
            unauthorized: 'ไม่มีสิทธิ์ใช้งาน กรุณาเข้าสู่ระบบใหม่',
        },
        datePicker: {
            pickDate: 'เลือกวันที่',
        },
    },
};

function getNested(dict: Dict, parts: string[]): string | Dict | undefined {
    let current: string | Dict | undefined = dict;
    for (const part of parts) {
        if (typeof current !== 'object' || current == null) return undefined;
        current = (current as Dict)[part];
    }
    return current;
}

export function t(lang: SupportedLanguage, key: string): string {
    const parts = key.split('.');
    const value = getNested(DICT[lang], parts);
    if (typeof value === 'string') return value;

    const fallback = getNested(DICT.en, parts);
    if (typeof fallback === 'string') return fallback;

    return key;
}
