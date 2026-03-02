import axios from 'axios';
import { getAccessToken, getRefreshToken, setTokens, clearTokens } from '../utils/storage';

const API_URL = "http://localhost:8001/api";

export const api = axios.create({
    baseURL: API_URL,
});

// Request interceptor - thêm access token vào header
api.interceptors.request.use((config) => {
    const token = getAccessToken();

    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

// Response interceptor - tự động refresh token khi 401
api.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config;

        // Nếu lỗi 401 và chưa retry
        if (error.response?.status === 401 && !originalRequest._retry) {
            originalRequest._retry = true;

            const refreshToken = getRefreshToken();
            if (!refreshToken) {
                clearTokens();
                window.location.href = '/login';
                return Promise.reject(error);
            }

            try {
                // Gọi API refresh token
                const response = await axios.post(`${API_URL}/token/refresh`, {
                    refresh: refreshToken
                });

                const newAccessToken = response.data.access;
                const newRefreshToken = response.data.refresh || refreshToken;
                
                // Lưu token mới
                setTokens(newAccessToken, newRefreshToken);

                // Retry request gốc với token mới
                originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
                return api(originalRequest);
            } catch (refreshError) {
                // Refresh thất bại -> logout
                clearTokens();
                window.location.href = '/login';
                return Promise.reject(refreshError);
            }
        }

        return Promise.reject(error);
    }
);
