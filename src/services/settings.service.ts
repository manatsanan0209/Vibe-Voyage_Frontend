import axios from 'axios';
import type { ApiResponseDTO } from '@/types/api';
import { STORAGE_KEYS } from '@/lib/constants';

const apiBaseUrl = (import.meta.env.VITE_API_BASE_URL || '').replace(/\/$/, '');

export interface UserSettings {
    settings_id: number;
    theme: 'light' | 'dark' | 'system';
    language: 'th' | 'en';
    date_format: 'DD/MM/YYYY' | 'MM/DD/YYYY' | 'YYYY-MM-DD';
    time_format: '12h' | '24h';
    notify_room_invite: boolean;
    notify_member_joined: boolean;
    notify_member_left: boolean;
    notify_trip_created: boolean;
    notify_lifestyle_analyzed: boolean;
    notify_schedule_updated: boolean;
}

export type UpdateSettingsRequest = Partial<Omit<UserSettings, 'settings_id'>>;

function authHeader() {
    const token = localStorage.getItem(STORAGE_KEYS.TOKEN);
    return { Authorization: `Bearer ${token}` };
}

export const settingsService = {
    async getSettings(): Promise<UserSettings> {
        const { data } = await axios.get<ApiResponseDTO<UserSettings>>(
            `${apiBaseUrl}/settings`,
            { headers: authHeader() },
        );
        return data.data;
    },

    async updateSettings(payload: UpdateSettingsRequest): Promise<UserSettings> {
        const { data } = await axios.patch<ApiResponseDTO<UserSettings>>(
            `${apiBaseUrl}/settings`,
            payload,
            { headers: authHeader() },
        );
        return data.data;
    },
};
