import axios from 'axios';
import type { ApiResponseDTO } from '@/types/api';
import { STORAGE_KEYS } from '@/lib/constants';
import type {
    ProfileDTO,
    UpdateProfileRequestDTO,
    ProfilePostsResponseDTO,
} from '@/types/profile';

const apiBaseUrl = (import.meta.env.VITE_API_BASE_URL || '').replace(/\/$/, '');

function authHeader() {
    const token = localStorage.getItem(STORAGE_KEYS.TOKEN);
    return { Authorization: `Bearer ${token}` };
}

export const profileService = {
    async getProfile(): Promise<ProfileDTO> {
        const { data } = await axios.get<ApiResponseDTO<ProfileDTO>>(
            `${apiBaseUrl}/profile`,
            { headers: authHeader() },
        );
        return data.data;
    },

    async updateProfile(dto: UpdateProfileRequestDTO): Promise<ProfileDTO> {
        const { data } = await axios.patch<ApiResponseDTO<ProfileDTO>>(
            `${apiBaseUrl}/profile`,
            dto,
            { headers: authHeader() },
        );
        return data.data;
    },

    async getPosts(page = 1, limit = 20): Promise<ProfilePostsResponseDTO> {
        const { data } = await axios.get<ApiResponseDTO<ProfilePostsResponseDTO>>(
            `${apiBaseUrl}/profile/posts?page=${page}&limit=${limit}`,
            { headers: authHeader() },
        );
        return data.data;
    },
};
