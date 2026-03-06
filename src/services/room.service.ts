import axios from 'axios';
import type { ApiResponseDTO } from '@/types/api';
import { STORAGE_KEYS } from '@/lib/constants';

const apiBaseUrl = (import.meta.env.VITE_API_BASE_URL || '').replace(/\/$/, '');

export interface RoomMember {
    room_member_id: number;
    room_id: number;
    user_id: number;
    username: string;
    role_name: 'owner' | 'member';
}

function authHeader() {
    const token = localStorage.getItem(STORAGE_KEYS.TOKEN);
    return { Authorization: `Bearer ${token}` };
}

export const roomService = {
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
};
