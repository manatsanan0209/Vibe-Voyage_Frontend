// ─── Room Planning ───────────────────────────────────────────────────────────

/** Maximum number of places allowed per day in the schedule */
export const MAX_SLOTS_PER_DAY = 7;

/**
 * Fixed time windows for each slot index (0-based).
 * start/end are "HH:MM" in 24-hour format.
 * Combined with a ScheduleDay.date to produce ISO datetime strings.
 */
export const TIME_SLOTS: { start: string; end: string }[] = [
    { start: '07:30', end: '08:30' },
    { start: '08:30', end: '10:30' },
    { start: '10:30', end: '12:30' },
    { start: '12:30', end: '13:30' },
    { start: '13:30', end: '15:30' },
    { start: '15:30', end: '17:30' },
    { start: '17:30', end: '18:30' },
];

// ─── Auth ─────────────────────────────────────────────────────────────────────

export const STORAGE_KEYS = {
    TOKEN: 'token',
    EXPIRES_AT: 'expires_at',
    USER_ID: 'user_id',
    USERNAME: 'username',
    REMEMBER_ME: 'remember_me',
} as const;
