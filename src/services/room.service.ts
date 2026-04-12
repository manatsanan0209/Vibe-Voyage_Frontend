import axios from 'axios';
import type { ApiResponseDTO } from '@/types/api';
import { STORAGE_KEYS } from '@/lib/constants';

const apiBaseUrl = (import.meta.env.VITE_API_BASE_URL || '').replace(/\/$/, '');

export interface RoomMember {
    room_member_id: number;
    room_id: number;
    user_id: number;
    username: string;
    role: number;
    role_name: 'owner' | 'member' | 'spectator' | 'unknown';
    created_at: string;
}

export interface UserRoomSummary {
    room_id: number;
    trip_id?: string;
    room_name: string;
    room_image: string;
    owner_id: number;
    owner_username: string;
    role: number;
    role_name: 'owner' | 'member' | 'unknown';
    joined_at: string;
    members_count: number;
}

export interface RoomInviteCode {
    room_invite_id: number;
    room_id: number;
    invite_code_creator_id: number;
    invite_code: string;
    access: 'view' | 'edit';
    expire_time: string;
    created_at: string;
}

export interface CreateInviteCodeRequest {
    access?: 'view' | 'edit';
    expire_time?: string;
}

export interface JoinByInviteCodeRequest {
    invite_code: string;
}

function authHeader() {
    const token = localStorage.getItem(STORAGE_KEYS.TOKEN);
    return { Authorization: `Bearer ${token}` };
}

export const roomService = {
    async getUserRooms(userId: number): Promise<UserRoomSummary[]> {
        const { data } = await axios.get<ApiResponseDTO<UserRoomSummary[]>>(
            `${apiBaseUrl}/rooms/user/${userId}`,
            { headers: authHeader() },
        );
        return data.data;
    },

    async getMembers(roomId: string): Promise<RoomMember[]> {
        const { data } = await axios.get<ApiResponseDTO<RoomMember[]>>(
            `${apiBaseUrl}/rooms/${roomId}/members`,
            { headers: authHeader() },
        );
        return data.data;
    },

    async removeMember(roomId: string, room_member_id: number): Promise<void> {
        await axios.delete(
            `${apiBaseUrl}/rooms/${roomId}/members/${room_member_id}`,
            {
                headers: authHeader(),
            },
        );
    },

    async createInviteCode(
        roomId: string,
        payload: CreateInviteCodeRequest,
    ): Promise<RoomInviteCode> {
        const { data } = await axios.post<ApiResponseDTO<RoomInviteCode>>(
            `${apiBaseUrl}/rooms/${roomId}/invite-codes`,
            payload,
            {
                headers: authHeader(),
            },
        );
        return data.data;
    },

    async getInviteCodes(roomId: string): Promise<RoomInviteCode[]> {
        const { data } = await axios.get<ApiResponseDTO<RoomInviteCode[]>>(
            `${apiBaseUrl}/rooms/${roomId}/invite-codes`,
            {
                headers: authHeader(),
            },
        );
        return data.data;
    },

    async joinByInviteCode(
        payload: JoinByInviteCodeRequest,
    ): Promise<RoomMember> {
        const { data } = await axios.post<ApiResponseDTO<RoomMember>>(
            `${apiBaseUrl}/rooms/join-by-invite-code`,
            payload,
            {
                headers: authHeader(),
            },
        );
        return data.data;
    },
};
