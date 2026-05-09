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
    role_name: 'owner' | 'room_owner' | 'member' | 'spectator' | 'unknown';
    created_at: string;
}

export interface RoomMemberLifestyleSubmission {
    room_member_id: number;
    room_id: number;
    user_id: number;
    username: string;
    profile_image?: string | null;
    role: number;
    role_name: 'owner' | 'room_owner' | 'member' | 'spectator' | 'unknown';
    has_submitted_lifestyle: boolean;
    has_analyzed_lifestyle: boolean;
    lifestyle_id: number | null;
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
    access: 'view' | 'edit' | 1 | 2;
    expire_time: string;
    created_at: string;
}

export interface CreateInviteCodeRequest {
    access?: number; // 1 = edit, 2 = view
    expire_time?: string;
}

export interface JoinByInviteCodeRequest {
    invite_code: string;
}

export interface RoomLifestylePreferredDestinationDTO {
    destination_name: string;
    destination_id: string;
    latitude?: number;
    longitude?: number;
}

export interface SubmitRoomLifestyleRequestDTO {
    preferred_destinations: RoomLifestylePreferredDestinationDTO[];
    travel_vibes: string[];
    voyage_priorities: string[];
    food_vibes: string[];
    additional_notes: string;
}

export interface SubmitRoomLifestyleResponseDTO {
    status: number;
    message: string;
}

export interface LeaveRoomResponseDTO {
    status: number;
    message: string;
}

export interface UpdateRoomSettingsRequest {
    room_name?: string;
    room_image?: string;
}

export interface UpdateRoomSettingsData {
    room_id: number;
    owner_id: number;
    room_name: string;
    room_image: string;
    updated_at: string;
}

export interface UpdateMemberRoleData {
    room_member_id: number;
    room_id: number;
    user_id: number;
    username: string;
    role: number;
    role_name: string;
    created_at: string;
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

    async getMembersLifestyleSubmissions(
        roomId: string,
    ): Promise<RoomMemberLifestyleSubmission[]> {
        const { data } = await axios.get<
            ApiResponseDTO<RoomMemberLifestyleSubmission[]>
        >(`${apiBaseUrl}/rooms/${roomId}/members/lifestyle-submissions`, {
            headers: authHeader(),
        });
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

    async getInviteCodeHistory(roomId: string): Promise<RoomInviteCode[]> {
        const { data } = await axios.get<ApiResponseDTO<RoomInviteCode[]>>(
            `${apiBaseUrl}/rooms/${roomId}/invite-codes/history`,
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

    async submitLifestyle(
        roomId: string,
        payload: SubmitRoomLifestyleRequestDTO,
    ): Promise<SubmitRoomLifestyleResponseDTO> {
        const { data } = await axios.post<SubmitRoomLifestyleResponseDTO>(
            `${apiBaseUrl}/rooms/${roomId}/lifestyle`,
            payload,
            {
                headers: authHeader(),
            },
        );
        return data;
    },

    async leaveRoom(roomId: string): Promise<LeaveRoomResponseDTO> {
        const { data } = await axios.delete<LeaveRoomResponseDTO>(
            `${apiBaseUrl}/rooms/${roomId}/leave`,
            {
                headers: authHeader(),
            },
        );
        return data;
    },

    async updateSettings(
        roomId: string,
        payload: UpdateRoomSettingsRequest,
    ): Promise<UpdateRoomSettingsData> {
        const { data } = await axios.patch<ApiResponseDTO<UpdateRoomSettingsData>>(
            `${apiBaseUrl}/rooms/${roomId}/settings`,
            payload,
            { headers: authHeader() },
        );
        return data.data;
    },

    async updateMemberRole(
        roomId: string,
        memberID: number,
        role: number,
    ): Promise<UpdateMemberRoleData> {
        const { data } = await axios.patch<ApiResponseDTO<UpdateMemberRoleData>>(
            `${apiBaseUrl}/rooms/${roomId}/members/${memberID}/role`,
            { role },
            { headers: authHeader() },
        );
        return data.data;
    },

    async transferOwnership(
        roomId: string,
        newOwnerUserId: number,
    ): Promise<void> {
        await axios.patch(
            `${apiBaseUrl}/rooms/${roomId}/transfer-ownership`,
            { new_owner_user_id: newOwnerUserId },
            { headers: authHeader() },
        );
    },
};
