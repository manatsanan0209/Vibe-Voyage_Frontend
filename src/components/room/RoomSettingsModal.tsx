import { useCallback, useEffect, useRef, useState } from 'react';
import axios from 'axios';
import { Crown, Loader2, Shield, User } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import {
    roomService,
    type RoomMember,
    type UpdateRoomSettingsRequest,
} from '@/services/room.service';
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
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Label } from '@/components/ui/label';
import type { ApiErrorResponseDTO } from '@/types/api';

interface RoomSettingsModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    roomId: string;
    onSettingsSaved?: (name: string, image: string) => void;
}

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

function getApiError(error: unknown, fallback: string): string {
    if (axios.isAxiosError<ApiErrorResponseDTO>(error)) {
        return (
            error.response?.data?.error ||
            error.response?.data?.message ||
            fallback
        );
    }
    return fallback;
}

function isOwnerMember(member: RoomMember): boolean {
    return (
        member.role === 1 ||
        member.role_name === 'owner' ||
        member.role_name === 'room_owner'
    );
}

export default function RoomSettingsModal({
    open,
    onOpenChange,
    roomId,
    onSettingsSaved,
}: RoomSettingsModalProps) {
    const { user } = useAuth();

    // General tab state
    const [roomName, setRoomName] = useState('');
    const [roomImage, setRoomImage] = useState('');
    const initialRoomName = useRef('');
    const initialRoomImage = useRef('');
    const [generalLoading, setGeneralLoading] = useState(false);
    const [generalSaving, setGeneralSaving] = useState(false);
    const [generalError, setGeneralError] = useState<string | null>(null);

    // Members tab state
    const [members, setMembers] = useState<RoomMember[]>([]);
    const [membersLoading, setMembersLoading] = useState(false);
    const [membersError, setMembersError] = useState<string | null>(null);
    const [roleUpdating, setRoleUpdating] = useState<number | null>(null);
    const [transferTarget, setTransferTarget] = useState<RoomMember | null>(null);
    const [transferConfirmOpen, setTransferConfirmOpen] = useState(false);
    const [transferring, setTransferring] = useState(false);
    const [transferError, setTransferError] = useState<string | null>(null);

    // Unsaved changes warning
    const [warnOpen, setWarnOpen] = useState(false);
    const [warnSaving, setWarnSaving] = useState(false);

    const isDirty =
        roomName !== initialRoomName.current ||
        roomImage !== initialRoomImage.current;

    const fetchRoomInfo = useCallback(async () => {
        if (!user?.id || !roomId) return;
        setGeneralLoading(true);
        setGeneralError(null);
        try {
            const rooms = await roomService.getUserRooms(user.id);
            const room = rooms.find((r) => String(r.room_id) === String(roomId));
            if (room) {
                setRoomName(room.room_name);
                setRoomImage(room.room_image ?? '');
                initialRoomName.current = room.room_name;
                initialRoomImage.current = room.room_image ?? '';
            }
        } catch (err) {
            setGeneralError(getApiError(err, 'ไม่สามารถโหลดข้อมูลห้องได้'));
        } finally {
            setGeneralLoading(false);
        }
    }, [roomId, user?.id]);

    const fetchMembers = useCallback(async () => {
        if (!roomId) return;
        setMembersLoading(true);
        setMembersError(null);
        try {
            const data = await roomService.getMembers(roomId);
            setMembers(data);
        } catch (err) {
            setMembersError(getApiError(err, 'ไม่สามารถโหลดข้อมูลสมาชิกได้'));
        } finally {
            setMembersLoading(false);
        }
    }, [roomId]);

    useEffect(() => {
        if (!open) return;
        void fetchRoomInfo();
        void fetchMembers();
    }, [open, fetchRoomInfo, fetchMembers]);

    const handleSave = useCallback(async (): Promise<boolean> => {
        if (!isDirty) return true;

        const trimmedName = roomName.trim();
        if (trimmedName === '') {
            setGeneralError('ชื่อห้องต้องไม่เป็นค่าว่าง');
            return false;
        }

        const payload: UpdateRoomSettingsRequest = {};
        if (roomName !== initialRoomName.current) payload.room_name = trimmedName;
        if (roomImage !== initialRoomImage.current) payload.room_image = roomImage;

        setGeneralSaving(true);
        setGeneralError(null);
        try {
            const updated = await roomService.updateSettings(roomId, payload);
            initialRoomName.current = updated.room_name;
            initialRoomImage.current = updated.room_image;
            setRoomName(updated.room_name);
            setRoomImage(updated.room_image);
            onSettingsSaved?.(updated.room_name, updated.room_image);
            return true;
        } catch (err) {
            setGeneralError(getApiError(err, 'บันทึกไม่สำเร็จ'));
            return false;
        } finally {
            setGeneralSaving(false);
        }
    }, [isDirty, roomId, roomName, roomImage, onSettingsSaved]);

    function handleCloseRequest(nextOpen: boolean) {
        if (!nextOpen && isDirty) {
            setWarnOpen(true);
            return;
        }
        onOpenChange(nextOpen);
    }

    function handleDiscard() {
        setRoomName(initialRoomName.current);
        setRoomImage(initialRoomImage.current);
        setGeneralError(null);
        setWarnOpen(false);
        onOpenChange(false);
    }

    async function handleWarnSave() {
        setWarnSaving(true);
        const ok = await handleSave();
        setWarnSaving(false);
        if (ok) {
            setWarnOpen(false);
            onOpenChange(false);
        }
    }

    async function handleRoleChange(member: RoomMember, newRole: string) {
        const roleNum = Number(newRole);
        setRoleUpdating(member.room_member_id);
        try {
            const updated = await roomService.updateMemberRole(
                roomId,
                member.room_member_id,
                roleNum,
            );
            setMembers((prev) =>
                prev.map((m) =>
                    m.room_member_id === updated.room_member_id
                        ? { ...m, role: updated.role, role_name: updated.role_name as RoomMember['role_name'] }
                        : m,
                ),
            );
        } catch {
            // silently fail — UI stays as-is
        } finally {
            setRoleUpdating(null);
        }
    }

    function handleTransferClick(member: RoomMember) {
        setTransferTarget(member);
        setTransferError(null);
        setTransferConfirmOpen(true);
    }

    async function handleTransferConfirm() {
        if (!transferTarget) return;
        setTransferring(true);
        setTransferError(null);
        try {
            await roomService.transferOwnership(roomId, transferTarget.user_id);
            setTransferConfirmOpen(false);
            setTransferTarget(null);
            onOpenChange(false);
        } catch (err) {
            setTransferError(getApiError(err, 'โอน ownership ไม่สำเร็จ'));
        } finally {
            setTransferring(false);
        }
    }

    const myId = user?.id;
    const nonOwnerMembers = members.filter((m) => !isOwnerMember(m));

    return (
        <>
            <Dialog open={open} onOpenChange={handleCloseRequest}>
                <DialogContent className="sm:max-w-lg">
                    <DialogHeader>
                        <DialogTitle>Room Settings</DialogTitle>
                        <DialogDescription>
                            จัดการชื่อ รูปปก และสมาชิกในห้องนี้
                        </DialogDescription>
                    </DialogHeader>

                    <Tabs defaultValue="general" className="mt-1">
                        <TabsList className="w-full">
                            <TabsTrigger value="general" className="flex-1">
                                General
                            </TabsTrigger>
                            <TabsTrigger value="members" className="flex-1">
                                Members
                            </TabsTrigger>
                        </TabsList>

                        {/* ── General ─────────────────────────────── */}
                        <TabsContent value="general" className="mt-4 space-y-4">
                            {generalLoading ? (
                                <div className="flex items-center justify-center py-8">
                                    <Loader2 className="size-5 animate-spin text-muted-foreground" />
                                </div>
                            ) : (
                                <>
                                    <div className="space-y-1.5">
                                        <Label htmlFor="settings-room-name">
                                            ชื่อห้อง
                                        </Label>
                                        <input
                                            id="settings-room-name"
                                            value={roomName}
                                            onChange={(e) => {
                                                setRoomName(e.target.value);
                                                setGeneralError(null);
                                            }}
                                            placeholder="ชื่อห้อง"
                                            className="border-input h-9 w-full rounded-md border bg-transparent px-3 py-1 text-sm shadow-xs outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px]"
                                        />
                                    </div>

                                    <div className="space-y-1.5">
                                        <Label htmlFor="settings-room-image">
                                            รูปปก (URL)
                                        </Label>
                                        <input
                                            id="settings-room-image"
                                            value={roomImage}
                                            onChange={(e) =>
                                                setRoomImage(e.target.value)
                                            }
                                            placeholder="https://example.com/cover.jpg"
                                            className="border-input h-9 w-full rounded-md border bg-transparent px-3 py-1 text-sm shadow-xs outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px]"
                                        />
                                        {roomImage && (
                                            <img
                                                src={roomImage}
                                                alt="cover preview"
                                                className="mt-2 h-24 w-full rounded-md object-cover"
                                                onError={(e) => {
                                                    (e.target as HTMLImageElement).style.display = 'none';
                                                }}
                                            />
                                        )}
                                    </div>

                                    {generalError && (
                                        <p className="text-sm text-red-600">
                                            {generalError}
                                        </p>
                                    )}
                                </>
                            )}
                        </TabsContent>

                        {/* ── Members ─────────────────────────────── */}
                        <TabsContent value="members" className="mt-4">
                            {membersLoading ? (
                                <div className="flex items-center justify-center py-8">
                                    <Loader2 className="size-5 animate-spin text-muted-foreground" />
                                </div>
                            ) : membersError ? (
                                <p className="text-sm text-red-600">
                                    {membersError}
                                </p>
                            ) : (
                                <div className="max-h-72 space-y-2 overflow-y-auto pr-1">
                                    {members.map((member) => {
                                        const isOwner = isOwnerMember(member);
                                        const isMe = member.user_id === myId;
                                        const isUpdating =
                                            roleUpdating === member.room_member_id;

                                        return (
                                            <div
                                                key={member.room_member_id}
                                                className="flex items-center gap-3 rounded-lg border border-border p-3"
                                            >
                                                <Avatar className="size-8 shrink-0">
                                                    <AvatarFallback
                                                        className={`text-white text-xs ${avatarColor(member.user_id)}`}
                                                    >
                                                        {member.username
                                                            .slice(0, 2)
                                                            .toUpperCase()}
                                                    </AvatarFallback>
                                                </Avatar>

                                                <div className="min-w-0 flex-1">
                                                    <p className="truncate text-sm font-medium">
                                                        {member.username}
                                                        {isMe && (
                                                            <span className="ml-1 text-xs text-muted-foreground">
                                                                (you)
                                                            </span>
                                                        )}
                                                    </p>
                                                </div>

                                                {isOwner ? (
                                                    <Badge
                                                        variant="outline"
                                                        className="shrink-0 border-amber-300 text-amber-700 bg-amber-50 gap-1"
                                                    >
                                                        <Crown className="size-3" />
                                                        Owner
                                                    </Badge>
                                                ) : (
                                                    <div className="flex items-center gap-2 shrink-0">
                                                        <Select
                                                            value={String(member.role)}
                                                            onValueChange={(v) =>
                                                                void handleRoleChange(member, v)
                                                            }
                                                            disabled={isUpdating}
                                                        >
                                                            <SelectTrigger className="h-8 w-30 text-xs">
                                                                {isUpdating ? (
                                                                    <Loader2 className="size-3 animate-spin" />
                                                                ) : (
                                                                    <SelectValue />
                                                                )}
                                                            </SelectTrigger>
                                                            <SelectContent>
                                                                <SelectItem value="2">
                                                                    <span className="flex items-center gap-1.5">
                                                                        <User className="size-3" />
                                                                        Member
                                                                    </span>
                                                                </SelectItem>
                                                                <SelectItem value="3">
                                                                    <span className="flex items-center gap-1.5">
                                                                        <Shield className="size-3" />
                                                                        Spectator
                                                                    </span>
                                                                </SelectItem>
                                                            </SelectContent>
                                                        </Select>

                                                        <Button
                                                            type="button"
                                                            size="sm"
                                                            variant="outline"
                                                            className="h-8 text-xs border-amber-300 text-amber-700 hover:bg-amber-50"
                                                            onClick={() =>
                                                                handleTransferClick(member)
                                                            }
                                                        >
                                                            <Crown className="size-3" />
                                                            โอน Owner
                                                        </Button>
                                                    </div>
                                                )}
                                            </div>
                                        );
                                    })}

                                    {nonOwnerMembers.length === 0 && !membersLoading && (
                                        <p className="py-6 text-center text-sm text-muted-foreground">
                                            ไม่มีสมาชิกอื่นในห้องนี้
                                        </p>
                                    )}
                                </div>
                            )}
                        </TabsContent>
                    </Tabs>

                    <DialogFooter className="mt-2">
                        <Button
                            variant="outline"
                            onClick={() => handleCloseRequest(false)}
                            disabled={generalSaving}
                        >
                            ปิด
                        </Button>
                        <Button
                            onClick={() => void handleSave()}
                            disabled={!isDirty || generalSaving}
                        >
                            {generalSaving ? (
                                <>
                                    <Loader2 className="mr-2 size-4 animate-spin" />
                                    กำลังบันทึก...
                                </>
                            ) : (
                                'Save Changes'
                            )}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Unsaved changes warning */}
            <Dialog open={warnOpen} onOpenChange={(o) => !warnSaving && setWarnOpen(o)}>
                <DialogContent className="sm:max-w-sm">
                    <DialogHeader>
                        <DialogTitle>Unsaved Changes</DialogTitle>
                        <DialogDescription>
                            คุณมีการเปลี่ยนแปลงที่ยังไม่ได้บันทึก ต้องการบันทึกก่อนปิดไหม?
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter className="flex-col gap-2 sm:flex-row">
                        <Button
                            variant="outline"
                            onClick={() => setWarnOpen(false)}
                            disabled={warnSaving}
                        >
                            Stay
                        </Button>
                        <Button
                            variant="ghost"
                            onClick={handleDiscard}
                            disabled={warnSaving}
                        >
                            Discard
                        </Button>
                        <Button onClick={() => void handleWarnSave()} disabled={warnSaving}>
                            {warnSaving ? (
                                <Loader2 className="mr-2 size-4 animate-spin" />
                            ) : null}
                            Save Changes
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Transfer ownership confirm */}
            <Dialog
                open={transferConfirmOpen}
                onOpenChange={(o) => !transferring && setTransferConfirmOpen(o)}
            >
                <DialogContent className="sm:max-w-sm">
                    <DialogHeader>
                        <DialogTitle>โอน Ownership</DialogTitle>
                        <DialogDescription>
                            คุณแน่ใจไหมที่จะโอน ownership ให้{' '}
                            <span className="font-semibold">
                                {transferTarget?.username}
                            </span>
                            ? คุณจะกลายเป็น member ทันทีและไม่สามารถ undo ได้
                        </DialogDescription>
                    </DialogHeader>

                    {transferError && (
                        <p className="text-sm text-red-600">{transferError}</p>
                    )}

                    <DialogFooter>
                        <Button
                            variant="outline"
                            onClick={() => setTransferConfirmOpen(false)}
                            disabled={transferring}
                        >
                            Cancel
                        </Button>
                        <Button
                            variant="destructive"
                            onClick={() => void handleTransferConfirm()}
                            disabled={transferring}
                        >
                            {transferring ? (
                                <Loader2 className="mr-2 size-4 animate-spin" />
                            ) : null}
                            โอน Ownership
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </>
    );
}
