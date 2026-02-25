import client from './client';

export interface LoginRequest {
    email: string;
    password: string;
}

export interface LoginResponse {
    accessToken: string;
    refreshToken: string;
    isNewUser?: boolean;
    role?: string;
    nickname?: string;
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
    adminLogin: async (data: LoginRequest) => {
        const response = await client.post<RsData<LoginResponse>>('/admin/login', data);
        return response.data;
    },
    signup: async (data: SignupRequest, profileImage?: File | null) => {
        const formData = new FormData();
        formData.append('data', new Blob([JSON.stringify(data)], { type: 'application/json' }));
        if (profileImage) {
            formData.append('profileImage', profileImage);
        }

        const response = await client.post<RsData<number>>('/users/signup', formData); // Returns userId
        return response.data;
    },
    logout: async () => {
        const response = await client.post<RsData<void>>('/auth/logout', null);
        return response.data;
    }
};
