import { api } from './axios';
import {
    LoginRequest,
    LoginResponse,
    RefreshResponse,
    RegisterRequest,
    ListUsers,
    User,
    Task,
} from "../types/auth.types";

const API_URL = "http://localhost:8001/api";

export const loginApi = (payload: {"user": LoginRequest}) => {
    return api.post<{"user":LoginResponse}>(`${API_URL}/login`, payload);
}

export const registerApi = (payload: {"user": RegisterRequest}) => {
    return api.post(`${API_URL}/register`, payload);
}

export const refreshTokenApi = (refreshToken: string) => {
    return api.post<RefreshResponse>(`${API_URL}/token/refresh`, {
         refresh_token: refreshToken 
    });
};

export const getAllUsers = () => {
    return api.get<ListUsers>(`${API_URL}/users`);
}

export const getProfileUser = () => {
    return api.get<LoginResponse>(`${API_URL}/profile`);
}
export const updateUser = (payload: any) => {
    return api.put(`${API_URL}/user/update`, payload);
}

export const getTasks = () => {
    return api.get<any>(`${API_URL}/task`);
}

export const createTask = (taskData: Task) => {
    return api.post(`${API_URL}/task/`, taskData);
}

export const updateTask = (taskId: string, taskData: {}) => {
    return api.put(`${API_URL}/task/${taskId}/`, taskData);
}

export const deleteTask = (taskId: string) => {
    return api.delete(`${API_URL}/task/${taskId}`);
}
export const getTaskStats = () => {
    return api.get<any>(`${API_URL}/task/stats/`);
}
