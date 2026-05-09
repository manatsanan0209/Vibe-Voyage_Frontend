import { useCallback, useEffect, useState } from 'react';
import axios from 'axios';
import { Crown, Trash2, User } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import {
    emitCacheInvalidation,
    subscribeCacheInvalidation,
} from '@/lib/cache-events';
import {
    roomService,
    type RoomMemberLifestyleSubmission,
} from '@/services/room.service';
import type { PlanTripMember } from '@/services/trip.service';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import type { ApiErrorResponseDTO } from '@/types/api';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';

interface RoomMembersProps {
    roomId: string;
    tripId: string;
    initialMembers?: PlanTripMember[];
}

type RoomMemberRow = RoomMemberLifestyleSubmission | PlanTripMember;

const AVATAR_COLORS = [
    'bg-primary',
    'bg-accent-foreground',
    'bg-emerald-500',
    'bg-amber-500',
    'bg-cyan-500',
    'bg-ring',
];

function avatarColor(userId: number) {
    return AVATAR_COLORS[userId % AVATAR_COLORS.length];
}

function getApiErrorMessage(error: unknown): string {
    if (axios.isAxiosError<ApiErrorResponseDTO>(error)) {
        return (
            error.response?.data?.error ||
            error.response?.data?.message ||
            'ไม่สามารถโหลดข้อมูลสมาชิกได้'
        );
    }
    return 'ไม่สามารถโหลดข้อมูลสมาชิกได้';
}

function isOwnerMember(member: { role: number; role_name: string }): boolean {
    return (
        member.role === 1 ||
        member.role_name === 'owner' ||
        member.role_name === 'room_owner'
    );
}

export default function RoomMembers({
    roomId,
    tripId,
    initialMembers,
}: RoomMembersProps) {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [members, setMembers] = useState<RoomMemberRow[]>(
        initialMembers ?? [],
    );
    const [loading, setLoading] = useState(initialMembers === undefined);
    const [error, setError] = useState<string | null>(null);
    const [removing, setRemoving] = useState<number | null>(null);
    const [confirmMember, setConfirmMember] = useState<RoomMemberRow | null>(
        null,
    );

    const fetchMembers = useCallback(async () => {
        if (!roomId) return;
        setError(null);
        try {
            const data =
                await roomService.getMembersLifestyleSubmissions(roomId);
            setMembers(data);

            if (
                user?.id &&
                !data.some((member) => member.user_id === user.id)
            ) {
                setMembers([]);
                emitCacheInvalidation({
                    key: 'user-rooms',
                    reason: 'removed-from-room',
                });
                navigate('/your-trips', {
                    replace: true,
                    state: {
                        removedFromRoom: true,
                    },
                });
            }
        } catch (err) {
            setError(getApiErrorMessage(err));
        } finally {
            setLoading(false);
        }
    }, [navigate, roomId, user?.id]);

    useEffect(() => {
        if (initialMembers !== undefined) {
            setMembers(initialMembers);
            setLoading(false);
            setError(null);
            return;
        }

        setLoading(true);
        void fetchMembers();
    }, [fetchMembers, initialMembers]);

    useEffect(() => {
        if (!roomId) return;

        return subscribeCacheInvalidation((event) => {
            if (
                (event.key === 'room-members' ||
                    event.key === 'room-submissions') &&
                event.roomId === roomId
            ) {
                void fetchMembers();
            }
        });
    }, [fetchMembers, roomId]);

    const isOwner = members.some(
        (m) => m.user_id === user?.id && isOwnerMember(m),
    );
    const myMember = members.find((member) => member.user_id === user?.id);
    const canSubmitLifestyle = Boolean(
        myMember && !myMember.has_submitted_lifestyle && myMember.role !== 3,
    );

    const handleOpenLifestyle = () => {
        if (!tripId || !myMember || myMember.role === 3) {
            return;
        }

        navigate(`/your-trips/${tripId}/lifestyle`, {
            state: {
                roomId: roomId || String(myMember.room_id),
                joinedRole: myMember.role,
                fromRoom: true,
            },
        });
    };

    const handleRemove = async () => {
        if (!confirmMember) return;
        const room_member_id = confirmMember.room_member_id;
        const removedUserId = confirmMember.user_id;
        setConfirmMember(null);
        setRemoving(room_member_id);
        try {
            await roomService.removeMember(roomId, room_member_id);
            setMembers((prev) =>
                prev.filter(
                    (member) => member.room_member_id !== room_member_id,
                ),
            );

            emitCacheInvalidation({
                key: 'room-members',
                roomId,
                reason: 'remove-member',
            });
            emitCacheInvalidation({
                key: 'room-submissions',
                roomId,
                reason: 'remove-member',
            });

            if (removedUserId === user?.id) {
                setMembers([]);
                emitCacheInvalidation({
                    key: 'user-rooms',
                    reason: 'removed-from-room',
                });
                navigate('/your-trips', {
                    replace: true,
                    state: {
                        removedFromRoom: true,
                    },
                });
                return;
            }

            void fetchMembers();
        } catch (error) {
            console.error('Failed to remove member:', error);
            setError(getApiErrorMessage(error));
        } finally {
            setRemoving(null);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-48">
                <p className="text-foreground/50 text-sm">กำลังโหลดสมาชิก...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex items-center justify-center h-48">
                <p className="text-red-500 text-sm">{error}</p>
            </div>
        );
    }

    return (
        <>
            <div className="p-6 max-w-3xl mx-auto">
                <div className="mb-4 flex items-center justify-between gap-3">
                    <h2 className="text-base font-semibold text-foreground">
                        Members{' '}
                        <span className="text-foreground/40 font-normal">
                            ({members.length})
                        </span>
                    </h2>

                    {canSubmitLifestyle && (
                        <Button
                            type="button"
                            size="sm"
                            className="bg-primary text-primary-foreground hover:bg-primary/90"
                            onClick={handleOpenLifestyle}
                        >
                            Submit Lifestyle
                        </Button>
                    )}
                </div>

                <div className="rounded-xl border border-foreground/8 overflow-hidden">
                    <div className="grid grid-cols-[1fr_auto_auto] items-center gap-4 bg-muted/80 px-4 py-2.5 text-xs font-semibold text-primary">
                        <p>Name</p>
                        <p>Status</p>
                        <p className="w-8" />
                    </div>

                    {members.map((member) => (
                        <div
                            key={member.user_id}
                            className="grid grid-cols-[1fr_auto_auto] items-center gap-4 border-t border-foreground/6 px-4 py-3"
                        >
                            <div className="flex items-center gap-3 min-w-0">
                                <Avatar>
                                    <AvatarFallback
                                        className={`text-white text-sm font-semibold ${avatarColor(member.user_id)}`}
                                    >
                                        {(
                                            member.username?.[0] ?? '?'
                                        ).toUpperCase()}
                                    </AvatarFallback>
                                </Avatar>

                                <div className="min-w-0 flex items-center gap-2">
                                    <span className="text-sm font-medium text-foreground truncate">
                                        {member.username}
                                        {member.user_id === user?.id && (
                                            <span className="ml-1.5 text-foreground/40 font-normal">
                                                (you)
                                            </span>
                                        )}
                                    </span>

                                    {isOwnerMember(member) ? (
                                        <Badge className="bg-muted text-primary border-transparent">
                                            <Crown className="size-3" />
                                            Owner
                                        </Badge>
                                    ) : member.role === 3 ? (
                                        <Badge className="bg-amber-50 text-amber-700 dark:bg-amber-950 dark:text-amber-300 border-transparent">
                                            <User className="size-3" />
                                            Spectator
                                        </Badge>
                                    ) : (
                                        <Badge className="bg-gray-50 text-gray-500 dark:bg-gray-900 dark:text-gray-400 border-transparent">
                                            <User className="size-3" />
                                            Member
                                        </Badge>
                                    )}
                                </div>
                            </div>

                            <p
                                className={`text-sm font-medium ${member.has_submitted_lifestyle
                                        ? 'text-emerald-600'
                                        : 'text-amber-600'
                                    }`}
                            >
                                {member.has_submitted_lifestyle
                                    ? 'Vibe Submitted'
                                    : 'Vibe pending'}
                            </p>

                            {/* Remove button — owner only, can't remove themselves */}
                            {isOwner && member.role !== 1 && (
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    className="size-8 text-foreground/30 hover:text-red-500 hover:bg-red-50 shrink-0"
                                    disabled={
                                        removing === member.room_member_id
                                    }
                                    onClick={() => setConfirmMember(member)}
                                >
                                    <Trash2 className="size-4" />
                                </Button>
                            )}

                            {(!isOwner || member.role === 1) && (
                                <span className="w-8" />
                            )}
                        </div>
                    ))}
                </div>
            </div>

            {/* Confirm remove dialog */}
            <Dialog
                open={!!confirmMember}
                onOpenChange={(open) => !open && setConfirmMember(null)}
            >
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>นำสมาชิกออก</DialogTitle>
                        <DialogDescription>
                            คุณต้องการนำ{' '}
                            <span className="font-semibold text-foreground">
                                {confirmMember?.username}
                            </span>{' '}
                            ออกจากห้องนี้ใช่ไหม? สมาชิกที่ถูกนำออกจะเสียข้อมูล
                            Lifestyle ในห้องนี้และต้องส่งใหม่หากเข้าร่วมอีกครั้ง
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                        <Button
                            variant="outline"
                            onClick={() => setConfirmMember(null)}
                        >
                            ยกเลิก
                        </Button>
                        <Button
                            variant="destructive"
                            disabled={removing !== null}
                            onClick={handleRemove}
                        >
                            นำออก
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </>
    );
}
