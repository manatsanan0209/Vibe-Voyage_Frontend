import axios from 'axios';
import type { ApiResponseDTO } from '@/types/api';
import type {
    SigninRequestDTO,
    SigninResponseDTO,
    RegisterRequestDTO,
    RegisterResponseDTO,
} from '@/types/auth';

const apiBaseUrl = (import.meta.env.VITE_API_BASE_URL || '').replace(/\/$/, '');

export const authService = {
    async login(dto: SigninRequestDTO): Promise<SigninResponseDTO> {
        const { data } = await axios.post<ApiResponseDTO<SigninResponseDTO>>(
            `${apiBaseUrl}/auth/login`,
            dto,
        );
        return data.data;
    },

    async register(dto: RegisterRequestDTO): Promise<RegisterResponseDTO> {
        const { data } = await axios.post<ApiResponseDTO<RegisterResponseDTO>>(
            `${apiBaseUrl}/auth/register`,
            dto,
        );
        return data.data;
    },
};
