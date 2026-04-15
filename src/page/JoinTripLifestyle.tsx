import { useEffect, useState } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import Step2TravelVibe from '@/components/createTrip/Step2TravelVibe';
import Step3Priorities from '@/components/createTrip/Step3Priorities';
import { PreferredDestinations } from '@/components/createTrip/PreferredDestinations';
import { useAuth } from '@/context/AuthContext';
import { emitCacheInvalidation } from '@/lib/cache-events';
import { roomService } from '@/services/room.service';
import { useSubmitRoomLifestyle } from '@/hooks/useSubmitRoomLifestyle';

type LifestyleRouteState = {
    roomId?: string;
    joinedRole?: number;
    fromRoom?: boolean;
    fromJoin?: boolean;
    lifestyleSubmitted?: boolean;
};

type PreferredPlace = {
    value: string;
    label: string;
    lat?: number;
    lng?: number;
};

function toggle(list: string[], id: string): string[] {
    return list.includes(id)
        ? list.filter((value) => value !== id)
        : [...list, id];
}

export default function JoinTripLifestyle() {
    const navigate = useNavigate();
    const location = useLocation();
    const { id } = useParams<{ id: string }>();
    const { user } = useAuth();

    const routeState = (location.state as LifestyleRouteState | null) ?? null;
    const [step, setStep] = useState<1 | 2>(1);
    const [travelVibes, setTravelVibes] = useState<string[]>([]);
    const [voyagePriorities, setVoyagePriorities] = useState<string[]>([]);
    const [foodVibes, setFoodVibes] = useState<string[]>([]);
    const [additionalNotes, setAdditionalNotes] = useState('');
    const [preferredDestinations, setPreferredDestinations] = useState<
        PreferredPlace[]
    >([]);

    const [roomId, setRoomId] = useState<string>(routeState?.roomId ?? '');
    const [role, setRole] = useState<number | null>(
        routeState?.joinedRole ?? null,
    );
    const [resolvingContext, setResolvingContext] = useState(true);
    const [contextError, setContextError] = useState<string | null>(null);

    const { isLoading, error, submit, reset } = useSubmitRoomLifestyle();

    const roomRoute = id ? `/your-trips/${id}` : '/your-trips';

    useEffect(() => {
        const setResolvingAsync = (value: boolean) => {
            queueMicrotask(() => {
                setResolvingContext(value);
            });
        };

        if (!id) {
            queueMicrotask(() => {
                setResolvingContext(false);
                setContextError('Trip id is missing.');
            });
            return;
        }

        if (roomId && role != null) {
            setResolvingAsync(false);
            return;
        }

        if (!user?.id) {
            setResolvingAsync(false);
            return;
        }

        let active = true;
        setResolvingAsync(true);

        roomService
            .getMembers(id)
            .then((members) => {
                if (!active) return;

                const me = members.find((member) => member.user_id === user.id);
                if (me?.role != null) {
                    setRole(me.role);
                }

                const fallbackRoomId = members[0]?.room_id
                    ? String(members[0].room_id)
                    : id;
                setRoomId((prev) => prev || fallbackRoomId);

                if (!me) {
                    setContextError('You are not a member of this room.');
                }
            })
            .catch(() => {
                if (!active) return;
                setRoomId((prev) => prev || id);
            })
            .finally(() => {
                if (!active) return;
                setResolvingContext(false);
            });

        return () => {
            active = false;
        };
    }, [id, role, roomId, user?.id]);

    useEffect(() => {
        if (!id || resolvingContext) return;
        if (role === 3) {
            navigate(roomRoute, {
                replace: true,
                state: {
                    joinedRole: 3,
                },
            });
        }
    }, [id, navigate, resolvingContext, role, roomRoute]);

    function goToRoom(extraState?: Partial<LifestyleRouteState>) {
        navigate(roomRoute, {
            state: {
                joinedRole: role ?? undefined,
                ...extraState,
            },
        });
    }

    function handleSkip() {
        reset();
        goToRoom();
    }

    function handleBackFromStepOne() {
        if (routeState?.fromRoom) {
            goToRoom();
            return;
        }
        navigate('/your-trips');
    }

    async function handleSubmitLifestyle() {
        if (!id || isLoading) return;
        const resolvedRoomId = roomId || id;

        const payload = {
            preferred_destinations: preferredDestinations.map(
                (destination) => ({
                    destination_name: destination.label,
                    destination_id: destination.value,
                    latitude: destination.lat,
                    longitude: destination.lng,
                }),
            ),
            travel_vibes: travelVibes,
            voyage_priorities: voyagePriorities,
            food_vibes: foodVibes,
            additional_notes: additionalNotes,
        };

        try {
            await submit(resolvedRoomId, payload);
            emitCacheInvalidation({
                key: 'room-submissions',
                roomId: resolvedRoomId,
                reason: 'lifestyle-submit',
            });
            goToRoom({
                lifestyleSubmitted: true,
            });
        } catch {
            // Error message is handled by hook state.
        }
    }

    if (resolvingContext) {
        return (
            <div className="h-[calc(100dvh-6rem)] w-full flex items-center justify-center">
                <p className="text-sm text-foreground/60">
                    Preparing lifestyle form...
                </p>
            </div>
        );
    }

    return (
        <main className="w-full min-h-[calc(100dvh-6rem)] bg-white py-6 px-4 sm:px-8">
            <div className="w-full min-h-full rounded-3xl shadow-lg bg-violet-50 py-8 px-6 sm:px-10 space-y-6">
                <div className="flex flex-wrap items-center justify-between gap-3">
                    <div>
                        <h1 className="text-2xl font-semibold text-indigo-950">
                            Your Lifestyle Preferences
                        </h1>
                        <p className="text-sm text-indigo-700 mt-1">
                            Add your style now to personalize planning, or skip
                            and do it later.
                        </p>
                    </div>
                    <Button variant="outline" onClick={handleSkip}>
                        Skip for now
                    </Button>
                </div>

                {contextError && (
                    <p className="text-sm text-amber-700">{contextError}</p>
                )}

                {error && <p className="text-sm text-red-600">{error}</p>}

                {step === 1 ? (
                    <Step2TravelVibe
                        vibes={travelVibes}
                        onChange={(id) =>
                            setTravelVibes((list) => toggle(list, id))
                        }
                        onBack={handleBackFromStepOne}
                        onNext={() => setStep(2)}
                    />
                ) : (
                    <div className="space-y-6">
                        <div className="rounded-xl border border-indigo-200 bg-white p-4">
                            <PreferredDestinations
                                selected={preferredDestinations}
                                onChange={setPreferredDestinations}
                            />
                        </div>

                        <Step3Priorities
                            priorities={voyagePriorities}
                            onPriority={(id) =>
                                setVoyagePriorities((list) => toggle(list, id))
                            }
                            foodVibes={foodVibes}
                            onFood={(id) =>
                                setFoodVibes((list) => toggle(list, id))
                            }
                            extra={additionalNotes}
                            onExtra={setAdditionalNotes}
                            onBack={() => setStep(1)}
                            onSubmit={handleSubmitLifestyle}
                        />

                        {isLoading && (
                            <p className="text-sm text-indigo-700">
                                Submitting lifestyle...
                            </p>
                        )}
                    </div>
                )}
            </div>
        </main>
    );
}
