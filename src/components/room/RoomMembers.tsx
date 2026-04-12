import { useCallback, useEffect, useState } from 'react';
import { Crown, Trash2, User } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { roomService, type RoomMember } from '@/services/room.service';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';

interface RoomMembersProps {
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

export default function RoomMembers({ tripId }: RoomMembersProps) {
    const { user } = useAuth();
    const [members, setMembers] = useState<RoomMember[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [removing, setRemoving] = useState<number | null>(null);
    const [confirmMember, setConfirmMember] = useState<RoomMember | null>(null);

    const fetchMembers = useCallback(() => {
        if (!tripId) return;
        roomService
            .getMembers(tripId)
            .then(setMembers)
            .catch(() => setError('ไม่สามารถโหลดข้อมูลสมาชิกได้'))
            .finally(() => setLoading(false));
    }, [tripId]);

    useEffect(() => {
        setLoading(true);
        fetchMembers();
    }, [fetchMembers]);

    const isOwner = members.some(
        (m) => m.user_id === user?.id && (m.role === 1 || m.role_name === 'owner'),
    );

    const handleRemove = async () => {
        if (!confirmMember) return;
        const room_member_id = confirmMember.room_member_id;
        setConfirmMember(null);
        setRemoving(room_member_id);
        try {
            await roomService.removeMember(tripId, room_member_id);
            fetchMembers();
        } catch (error) {
            console.error('Failed to remove member:', error);
            setError('ไม่สามารถนำสมาชิกออกได้ กรุณาลองใหม่อีกครั้ง');
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
            <div className="p-6 max-w-2xl mx-auto">
                <h2 className="text-base font-semibold text-foreground mb-4">
                    Members{' '}
                    <span className="text-foreground/40 font-normal">
                        ({members.length})
                    </span>
                </h2>

                <ul className="space-y-2">
                    {members.map((member) => (
                        <li
                            key={member.user_id}
                            className="flex items-center gap-3 rounded-xl px-4 py-3 bg-foreground/3 border border-foreground/6"
                        >
                            {/* Avatar */}
                            <Avatar>
                                <AvatarFallback
                                    className={`text-white text-sm font-semibold ${avatarColor(member.user_id)}`}
                                >
                                    {(
                                        member.username?.[0] ?? '?'
                                    ).toUpperCase()}
                                </AvatarFallback>
                            </Avatar>

                            {/* Username */}
                            <span className="flex-1 text-sm font-medium text-foreground">
                                {member.username}
                                {member.user_id === user?.id && (
                                    <span className="ml-1.5 text-foreground/40 font-normal">
                                        (you)
                                    </span>
                                )}
                            </span>

                            {/* Role badge */}
                            {member.role === 1 || member.role_name === 'owner' ? (
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
                        </li>
                    ))}
                </ul>
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
