// ─── Room Planning ───────────────────────────────────────────────────────────

/** Maximum number of places allowed per day in the schedule */
export const MAX_SLOTS_PER_DAY = 7;

/**
 * Fixed time windows for each slot index (0-based).
 * start/end are "HH:MM" in 24-hour format.
 * Combined with a ScheduleDay.date to produce ISO datetime strings.
 */
export const TIME_SLOTS: { start: string; end: string }[] = [
    { start: '08:00', end: '10:00' },
    { start: '10:30', end: '12:00' },
    { start: '12:30', end: '14:30' },
    { start: '15:00', end: '17:00' },
];

// ─── Auth ─────────────────────────────────────────────────────────────────────

export const STORAGE_KEYS = {
    TOKEN: 'token',
    EXPIRES_AT: 'expires_at',
    USER_ID: 'user_id',
    USERNAME: 'username',
    REMEMBER_ME: 'remember_me',
} as const;
