export interface LoginRequest {
    username: string;
    password: string;
}

export interface LoginResponse extends LoginRequest{
    id: number;
    email: string;
    access: string;
    refresh: string;
    groups: string[];
}
export interface User {
    id: number;
    username: string;
    email: string;
    groups: string[];
    date_joined: string;
    is_active?: boolean;
    password?: string;
}
export interface ListUsers {
    count: number;
    results: User[];
}
export interface RegisterRequest {
    username: string;
    email: string;
    password: string;
}

export interface RegisterResponse {
    id: string;
    username: string;
    email: string;
    groups: string[];
}


export interface RefreshResponse{
    access_token: string;
    refresh_token: string;
}

export interface Task {
    id: number;
    title: string;
    description: string;
    status: string;
    priority: string;
    created_at: string;
    due_date: string;
    owner: number;
    assignee: number;
}
