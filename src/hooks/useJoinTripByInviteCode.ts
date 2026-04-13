import axios from 'axios';
import { useCallback, useState } from 'react';
import {
    tripService,
    type JoinTripByInviteCodeDataDTO,
} from '@/services/trip.service';
import type { ApiErrorResponseDTO } from '@/types/api';

function getApiErrorMessage(error: unknown): string {
    if (axios.isAxiosError<ApiErrorResponseDTO>(error)) {
        return (
            error.response?.data?.error ||
            error.response?.data?.message ||
            'Unable to join trip right now.'
        );
    }

    return 'Unable to join trip right now.';
}

export function useJoinTripByInviteCode() {
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [data, setData] = useState<JoinTripByInviteCodeDataDTO | null>(null);

    const submit = useCallback(async (inviteCode: string) => {
        const normalizedCode = inviteCode.trim();

        if (!normalizedCode) {
            const requiredMessage = 'invite_code is required';
            setError(requiredMessage);
            throw new Error(requiredMessage);
        }

        setIsLoading(true);
        setError(null);

        try {
            const payload =
                await tripService.joinTripByInviteCode(normalizedCode);
            setData(payload);
            return payload;
        } catch (err) {
            const message = getApiErrorMessage(err);
            setError(message);
            throw err;
        } finally {
            setIsLoading(false);
        }
    }, []);

    const reset = useCallback(() => {
        setError(null);
        setData(null);
        setIsLoading(false);
    }, []);

    return {
        isLoading,
        error,
        data,
        submit,
        reset,
    };
}
