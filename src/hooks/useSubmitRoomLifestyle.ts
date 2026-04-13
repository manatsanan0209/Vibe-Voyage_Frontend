import axios from 'axios';
import { useCallback, useState } from 'react';
import {
    roomService,
    type SubmitRoomLifestyleRequestDTO,
    type SubmitRoomLifestyleResponseDTO,
} from '@/services/room.service';
import type { ApiErrorResponseDTO } from '@/types/api';

function getApiErrorMessage(error: unknown): string {
    if (axios.isAxiosError<ApiErrorResponseDTO>(error)) {
        return (
            error.response?.data?.error ||
            error.response?.data?.message ||
            'Unable to save lifestyle right now.'
        );
    }

    return 'Unable to save lifestyle right now.';
}

export function useSubmitRoomLifestyle() {
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [data, setData] = useState<SubmitRoomLifestyleResponseDTO | null>(null);

    const submit = useCallback(
        async (roomId: string, payload: SubmitRoomLifestyleRequestDTO) => {
            setIsLoading(true);
            setError(null);

            try {
                const response = await roomService.submitLifestyle(roomId, payload);
                setData(response);
                return response;
            } catch (err) {
                const message = getApiErrorMessage(err);
                setError(message);
                throw err;
            } finally {
                setIsLoading(false);
            }
        },
        [],
    );

    const reset = useCallback(() => {
        setIsLoading(false);
        setError(null);
        setData(null);
    }, []);

    return {
        isLoading,
        error,
        data,
        submit,
        reset,
    };
}
