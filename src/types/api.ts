export interface ApiResponseDTO<T> {
    status: number;
    message: string;
    data: T;
}

export interface ApiErrorResponseDTO<T = unknown> {
    status: number;
    message: string;
    error: string;
    data?: T;
}
