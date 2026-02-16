export interface ApiResponseDTO<T> {
    status: number;
    message: string;
    data: T;
}

export interface ApiErrorResponseDTO {
    status: number;
    message: string;
    error: string;
}
