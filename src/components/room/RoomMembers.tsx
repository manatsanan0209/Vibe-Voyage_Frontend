import { useCallback, useEffect, useState } from 'react';
import axios from 'axios';
import { Crown, Trash2, User } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import {
    roomService,
    type RoomMemberLifestyleSubmission,
} from '@/services/room.service';
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
}

const AVATAR_COLORS = [
    'bg-indigo-500',
    'bg-pink-500',
    'bg-emerald-500',
    'bg-amber-500',
    'bg-cyan-500',
    'bg-purple-500',
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

export default function RoomMembers({ roomId, tripId }: RoomMembersProps) {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [members, setMembers] = useState<RoomMemberLifestyleSubmission[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [removing, setRemoving] = useState<number | null>(null);
    const [confirmMember, setConfirmMember] =
        useState<RoomMemberLifestyleSubmission | null>(null);

    const fetchMembers = useCallback(() => {
        if (!roomId) return;
        setError(null);
        roomService
            .getMembersLifestyleSubmissions(roomId)
            .then(setMembers)
            .catch((err) => setError(getApiErrorMessage(err)))
            .finally(() => setLoading(false));
    }, [roomId]);

    useEffect(() => {
        setLoading(true);
        fetchMembers();
    }, [fetchMembers]);

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
        setConfirmMember(null);
        setRemoving(room_member_id);
        try {
            await roomService.removeMember(roomId, room_member_id);
            fetchMembers();
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
                            className="bg-indigo-600 text-white hover:bg-indigo-700"
                            onClick={handleOpenLifestyle}
                        >
                            Submit Lifestyle
                        </Button>
                    )}
                </div>

                <div className="rounded-xl border border-foreground/8 overflow-hidden">
                    <div className="grid grid-cols-[1fr_auto_auto] items-center gap-4 bg-indigo-50/80 px-4 py-2.5 text-xs font-semibold text-indigo-700">
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
                                        <Badge className="bg-indigo-50 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300 border-transparent">
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
                                    disabled={removing === member.room_member_id}
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
                            ออกจากห้องนี้ใช่ไหม? การกระทำนี้ไม่สามารถยกเลิกได้
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
