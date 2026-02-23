import { createContext, useContext, useState, useCallback } from 'react';
import type { ReactNode } from 'react';
import { STORAGE_KEYS } from '@/lib/constants';
import { authService } from '@/services/auth.service';
import type { SigninRequestDTO, RegisterRequestDTO } from '@/types/auth';

// ── Types ────────────────────────────────────────────────────────────────

interface AuthUser {
    id: number;
    username: string;
}

interface AuthContextValue {
    user: AuthUser | null;
    isAuthenticated: boolean;
    login: (
        credentials: SigninRequestDTO,
        rememberMe: boolean,
    ) => Promise<void>;
    register: (dto: RegisterRequestDTO) => Promise<void>;
    logout: () => void;
}

// ── Context ──────────────────────────────────────────────────────────────

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

// ── Helpers ──────────────────────────────────────────────────────────────

function hydrateUser(): AuthUser | null {
    const token = localStorage.getItem(STORAGE_KEYS.TOKEN);
    const expiresAt = localStorage.getItem(STORAGE_KEYS.EXPIRES_AT);
    const userId = localStorage.getItem(STORAGE_KEYS.USER_ID);
    const username = localStorage.getItem(STORAGE_KEYS.USERNAME);

    if (!token || !expiresAt || !userId || !username) return null;

    const expiresMs = new Date(expiresAt).getTime();
    if (Date.now() >= expiresMs) {
        clearStorage();
        return null;
    }

    return { id: Number(userId), username };
}

function clearStorage(): void {
    localStorage.removeItem(STORAGE_KEYS.TOKEN);
    localStorage.removeItem(STORAGE_KEYS.EXPIRES_AT);
    localStorage.removeItem(STORAGE_KEYS.USER_ID);
    localStorage.removeItem(STORAGE_KEYS.USERNAME);
    localStorage.removeItem(STORAGE_KEYS.REMEMBER_ME);
}

function persistSession(
    token: string,
    expiresAt: string,
    id: number,
    username: string,
    rememberMe: boolean,
): void {
    localStorage.setItem(STORAGE_KEYS.TOKEN, token);
    localStorage.setItem(STORAGE_KEYS.EXPIRES_AT, expiresAt);
    localStorage.setItem(STORAGE_KEYS.USER_ID, String(id));
    localStorage.setItem(STORAGE_KEYS.USERNAME, username);
    localStorage.setItem(STORAGE_KEYS.REMEMBER_ME, String(rememberMe));
}

// ── Provider ─────────────────────────────────────────────────────────────

export function AuthProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<AuthUser | null>(hydrateUser);

    const login = useCallback(
        async (credentials: SigninRequestDTO, rememberMe: boolean) => {
            const payload = await authService.login(credentials);
            persistSession(
                payload.token,
                payload.expires_at,
                payload.id,
                payload.username,
                rememberMe,
            );
            setUser({ id: payload.id, username: payload.username });
        },
        [],
    );

    const register = useCallback(async (dto: RegisterRequestDTO) => {
        const payload = await authService.register(dto);
        persistSession(
            payload.token,
            payload.expires_at,
            payload.id,
            payload.username,
            false,
        );
        setUser({ id: payload.id, username: payload.username });
    }, []);

    const logout = useCallback(() => {
        clearStorage();
        setUser(null);
    }, []);

    const value: AuthContextValue = {
        user,
        isAuthenticated: user !== null,
        login,
        register,
        logout,
    };

    return (
        <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
    );
}

// ── Hook ─────────────────────────────────────────────────────────────────

export function useAuth(): AuthContextValue {
    const ctx = useContext(AuthContext);
    if (!ctx) {
        throw new Error('useAuth must be used within an <AuthProvider>');
    }
    return ctx;
}
