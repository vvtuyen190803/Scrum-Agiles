import { createContext, ReactNode, useEffect, useState } from 'react';
import {
    setTokens,
    getAccessToken,
    getRefreshToken,
    clearTokens,
    clearCurrentUser,
} from "../utils/storage";
import { refreshTokenApi } from '../api/auth.api';

interface AuthContextType {
    isAuthenticated: boolean;
    login: (accessToken: string, refreshToken: string) => void;
    logout: () => void;
}

export const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider = ({ children }: { children: ReactNode}) => {
    const [isAuthenticated, setIsAuthenticated] = useState<boolean>(
        Boolean(getAccessToken())
    );
    const login = (accessToken: string, refreshToken: string) => {
        setTokens(accessToken, refreshToken);
        setIsAuthenticated(true);
    }
    const logout = () => {
        clearTokens();
        clearCurrentUser();
        setIsAuthenticated(false);
    }

    useEffect(() => {
        const tryRefresh = async () => {
            const refreshToken = getRefreshToken();
            if (!refreshToken) return logout();

            try {
                const response = await refreshTokenApi(refreshToken); 
                setTokens(response.data.access_token, refreshToken);
                setIsAuthenticated(true);
            } catch {
                logout();
            }
        };
        if (!getAccessToken()) {
            tryRefresh();
        }
    }, []);

    return (
        <AuthContext.Provider value={{ isAuthenticated, login, logout }}>
            {children}
        </AuthContext.Provider>
    );
}
