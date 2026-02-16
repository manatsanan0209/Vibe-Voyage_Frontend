export interface SigninRequestDTO {
    username: string;
    password: string;
}

export interface SigninResponseDTO {
    id: number;
    username: string;
    token: string;
    expires_at: string;
}

export interface RegisterRequestDTO {
    username: string;
    email: string;
    password: string;
    full_name: string;
}

export interface RegisterResponseDTO {
    id: number;
    username: string;
    email: string;
    full_name: string;
    token: string;
    expires_at: string;
}
