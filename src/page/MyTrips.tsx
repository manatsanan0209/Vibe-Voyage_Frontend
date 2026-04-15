import axios from 'axios';
import { useEffect, useState } from 'react';
import { Loader2 } from 'lucide-react';
import { useLocation, useNavigate } from 'react-router-dom';
import NewTripCard from '@/components/myTrips/NewTripCard';
import TripCard, { type Collaborator } from '@/components/myTrips/TripCard';
import { Skeleton } from '@/components/ui/skeleton';
import { useAuth } from '@/context/AuthContext';
import { subscribeCacheInvalidation } from '@/lib/cache-events';
import { roomService, type UserRoomSummary } from '@/services/room.service';
import type { ApiErrorResponseDTO } from '@/types/api';

const FALLBACK_TRIP_IMAGE = 'https://picsum.photos/seed/mytrip/366/240';

function formatJoinedAgo(joinedAt: string): string {
    const joinedDate = new Date(joinedAt);
    if (isNaN(joinedDate.getTime())) return 'Joined recently';

    const diffMs = Date.now() - joinedDate.getTime();
    if (diffMs < 0) return 'Joined recently';

    const hourMs = 60 * 60 * 1000;
    const dayMs = 24 * hourMs;

    if (diffMs < hourMs) {
        const minutes = Math.max(1, Math.floor(diffMs / (60 * 1000)));
        return `Joined ${minutes} minute${minutes > 1 ? 's' : ''} ago`;
    }

    if (diffMs < dayMs) {
        const hours = Math.floor(diffMs / hourMs);
        return `Joined ${hours} hour${hours > 1 ? 's' : ''} ago`;
    }

    const days = Math.floor(diffMs / dayMs);
    return `Joined ${days} day${days > 1 ? 's' : ''} ago`;
}

function buildCollaborators(
    roomId: number,
    membersCount: number,
): Collaborator[] {
    const safeCount = Math.max(0, Math.floor(membersCount));

    return Array.from({ length: safeCount }, (_, index) => ({
        id: `${roomId}-member-${index + 1}`,
        avatarUrl: `https://picsum.photos/seed/room-${roomId}-member-${index + 1}/46/46`,
    }));
}

function getApiErrorMessage(error: unknown): string {
    if (axios.isAxiosError<ApiErrorResponseDTO>(error)) {
        return (
            error.response?.data?.error ||
            error.response?.data?.message ||
            'ไม่สามารถโหลดทริปได้'
        );
    }
    return 'ไม่สามารถโหลดทริปได้';
}

type MyTripsRouteState = {
    leftRoom?: boolean;
    removedFromRoom?: boolean;
    message?: string;
};

export default function MyTrips() {
    const navigate = useNavigate();
    const location = useLocation();
    const { user } = useAuth();
    const [rooms, setRooms] = useState<UserRoomSummary[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [notice, setNotice] = useState<{
        text: string;
        tone: 'success' | 'info';
    } | null>(null);
    const showNewTripCard = !loading && !error;

    useEffect(() => {
        const routeState = (location.state as MyTripsRouteState | null) ??
            null;
        if (!routeState) return;

        if (routeState.message) {
            setNotice({
                text: routeState.message,
                tone: routeState.leftRoom ? 'success' : 'info',
            });
        } else if (routeState.leftRoom) {
            setNotice({ text: 'You left the room.', tone: 'success' });
        } else if (routeState.removedFromRoom) {
            setNotice({
                text: 'You are no longer in this room.',
                tone: 'info',
            });
        } else {
            return;
        }

        navigate(location.pathname, { replace: true, state: null });
    }, [location.pathname, location.state, navigate]);

    useEffect(() => {
        if (!notice) return;

        const timeoutId = window.setTimeout(() => {
            setNotice(null);
        }, 6000);

        return () => {
            window.clearTimeout(timeoutId);
        };
    }, [notice]);

    useEffect(() => {
        if (!user?.id) return;

        let active = true;

        queueMicrotask(() => {
            if (!active) return;
            setLoading(true);
            setError(null);

            roomService
                .getUserRooms(user.id)
                .then((data) => {
                    if (!active) return;
                    setRooms(data);
                })
                .catch((err: unknown) => {
                    if (!active) return;
                    console.error('[MyTrips] Failed to fetch rooms:', err);
                    setError(getApiErrorMessage(err));
                })
                .finally(() => {
                    if (!active) return;
                    setLoading(false);
                });
        });

        return () => {
            active = false;
        };
    }, [user?.id]);

    useEffect(() => {
        if (!user?.id) return;

        return subscribeCacheInvalidation((event) => {
            if (event.key !== 'user-rooms') return;

            roomService
                .getUserRooms(user.id)
                .then((data) => {
                    setRooms(data);
                    setError(null);
                })
                .catch((err: unknown) => {
                    console.error('[MyTrips] Failed to refresh rooms:', err);
                    setError(getApiErrorMessage(err));
                });
        });
    }, [user?.id]);

    return (
        <main className="flex flex-col gap-6 sm:gap-8 px-4 sm:px-8 pb-12">
            <div className="w-full rounded-4xl bg-violet-50 px-4 sm:px-8 py-6 sm:py-8">
                <h1 className="text-2xl font-bold text-indigo-950 mb-6">
                    My Trip
                </h1>

                {notice && (
                    <div
                        className={`mb-4 rounded-lg border px-4 py-3 text-sm ${notice.tone === 'success'
                            ? 'border-emerald-200 bg-emerald-50 text-emerald-800'
                            : 'border-amber-200 bg-amber-50 text-amber-800'
                            }`}
                    >
                        {notice.text}
                    </div>
                )}

                <div className="grid gap-10 grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4">
                    {showNewTripCard && <NewTripCard />}

                    {loading && (
                        <div
                            className={`rounded-lg border border-dashed border-indigo-200 bg-white p-4 sm:p-6 ${showNewTripCard
                                ? 'sm:col-span-1 md:col-span-2 xl:col-span-3'
                                : 'sm:col-span-2 md:col-span-3 xl:col-span-4'
                                }`}
                        >
                            <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 xl:grid-cols-3">
                                <Skeleton className="h-52 w-full rounded-xl" />
                                <Skeleton className="h-52 w-full rounded-xl" />
                                <Skeleton className="h-52 w-full rounded-xl" />
                            </div>
                            <div className="mt-5 flex items-center justify-center gap-2 text-indigo-700">
                                <Loader2 className="size-4 animate-spin" />
                                <span className="text-sm font-medium">
                                    กำลังโหลดทริปของคุณ...
                                </span>
                            </div>
                        </div>
                    )}

                    {!loading && error && (
                        <div
                            className={`rounded-lg border border-red-200 bg-red-50 px-4 py-8 text-center text-sm text-red-600 ${showNewTripCard
                                ? 'sm:col-span-1 md:col-span-2 xl:col-span-3'
                                : 'sm:col-span-2 md:col-span-3 xl:col-span-4'
                                }`}
                        >
                            {error}
                        </div>
                    )}

                    {!loading && !error && rooms.length === 0 && (
                        <div
                            className={`rounded-lg border border-dashed border-indigo-200 bg-white px-4 py-8 text-center text-sm text-indigo-700 ${showNewTripCard
                                ? 'sm:col-span-1 md:col-span-2 xl:col-span-3'
                                : 'sm:col-span-2 md:col-span-3 xl:col-span-4'
                                }`}
                        >
                            ยังไม่มีทริปในตอนนี้ ลองกดสร้างทริปใหม่ได้เลย
                        </div>
                    )}

                    {!loading &&
                        !error &&
                        rooms.map((room) => (
                            <TripCard
                                key={room.room_id}
                                name={room.room_name}
                                imageUrl={
                                    room.room_image || FALLBACK_TRIP_IMAGE
                                }
                                lastEdited={formatJoinedAgo(room.joined_at)}
                                collaborators={buildCollaborators(
                                    room.room_id,
                                    room.members_count,
                                )}
                                clickable={Boolean(room.trip_id)}
                                onClick={() => {
                                    if (!room.trip_id) return;
                                    navigate(`/your-trips/${room.trip_id}`);
                                }}
                            />
                        ))}
                </div>

                {!loading && !error && rooms.some((room) => !room.trip_id) && (
                    <p className="mt-4 text-xs text-amber-700">
                        บางทริปยังไม่สามารถเข้าได้ชั่วคราว เนื่องจาก backend
                        ยังไม่ส่ง trip_id ครบทุกรายการ
                    </p>
                )}
            </div>
        </main>
    );
}
