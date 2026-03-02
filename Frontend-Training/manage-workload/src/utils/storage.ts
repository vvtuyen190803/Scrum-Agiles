const ACCESS_TOKEN_KEY = 'access_token';
const REFRESH_TOKEN_KEY = 'refresh_token';
const CURRENT_USER_KEY = 'current_user';

export const setTokens = (
    accessToken: string,
    refreshToken: string
) => {
    localStorage.setItem(ACCESS_TOKEN_KEY, accessToken);
    localStorage.setItem(REFRESH_TOKEN_KEY, refreshToken);
}

export const getAccessToken = (): string | null => {
    return localStorage.getItem(ACCESS_TOKEN_KEY);
}

export const getRefreshToken = (): string | null => {
    return localStorage.getItem(REFRESH_TOKEN_KEY);
}

export const clearTokens = () => {
    localStorage.removeItem(ACCESS_TOKEN_KEY);
    localStorage.removeItem(REFRESH_TOKEN_KEY);
}

export const setCurrentUser = (user: unknown) => {
    localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(user));
}

export const getCurrentUser = <T = unknown>(): T | null => {
    const raw = localStorage.getItem(CURRENT_USER_KEY);
    if (!raw) return null;
    try {
        return JSON.parse(raw) as T;
    } catch {
        return null;
    }
}

export const clearCurrentUser = () => {
    localStorage.removeItem(CURRENT_USER_KEY);
}
