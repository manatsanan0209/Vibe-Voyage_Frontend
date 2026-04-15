export const CACHE_INVALIDATION_EVENT_NAME = 'vibe-voyage:cache-invalidation';

export type TripScheduleInvalidationReason =
    | 'create-trip'
    | 'replace-schedule'
    | 'manual-retry';

export type RoomMembersInvalidationReason = 'remove-member';

export type RoomSubmissionsInvalidationReason =
    | 'lifestyle-submit'
    | 'remove-member';

export type UserRoomsInvalidationReason =
    | 'create-trip'
    | 'removed-from-room'
    | 'member-updated';

export type CacheInvalidationEventPayload =
    | {
          key: 'trip-schedule';
          tripId: string;
          reason: TripScheduleInvalidationReason;
      }
    | {
          key: 'room-members';
          roomId: string;
          reason: RoomMembersInvalidationReason;
      }
    | {
          key: 'room-submissions';
          roomId: string;
          reason: RoomSubmissionsInvalidationReason;
      }
    | {
          key: 'user-rooms';
          reason: UserRoomsInvalidationReason;
      };

export function emitCacheInvalidation(payload: CacheInvalidationEventPayload) {
    if (typeof window === 'undefined') return;

    window.dispatchEvent(
        new CustomEvent<CacheInvalidationEventPayload>(
            CACHE_INVALIDATION_EVENT_NAME,
            {
                detail: payload,
            },
        ),
    );
}

export function subscribeCacheInvalidation(
    listener: (payload: CacheInvalidationEventPayload) => void,
) {
    if (typeof window === 'undefined') {
        return () => {};
    }

    const handler = (event: Event) => {
        const customEvent = event as CustomEvent<CacheInvalidationEventPayload>;
        listener(customEvent.detail);
    };

    window.addEventListener(CACHE_INVALIDATION_EVENT_NAME, handler);

    return () => {
        window.removeEventListener(CACHE_INVALIDATION_EVENT_NAME, handler);
    };
}
