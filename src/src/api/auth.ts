import client from './client';

export interface LoginRequest {
    email: string; // Adjusted based on backend DTO usually usually it's email/username
    password: string;
}

export interface LoginResponse {
    accessToken: string;
    refreshToken: string;
}

export interface RsData<T> {
    resultCode: string;
    msg: string;
    data: T;
}

export interface SignupRequest {
    email: string;
    password: string;
    name: string;
    nickname: string;
    phoneNum: string;
    address: string;
    rrn: string;
    latitude: number;
    longitude: number;
}

export const authApi = {
    login: async (data: LoginRequest) => {
        const response = await client.post<RsData<LoginResponse>>('/auth/login', data);
        return response.data;
    },
    signup: async (data: SignupRequest) => {
        const response = await client.post<RsData<number>>('/auth/signup', data); // Returns userId
        return response.data;
    },
    logout: async (refreshToken: string) => {
        const response = await client.post<RsData<void>>('/auth/logout', null, {
            headers: { RefreshToken: refreshToken }
        });
        return response.data;
    }
};
