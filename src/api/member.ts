import client, { type RsData } from './client';

export interface SellerRequestCreateRequest {
    sellerType: "INDIVIDUAL" | "BUSINESS";
    storeName: string;
    businessNum?: string;
    representativeName: string;
    contactEmail: string;
    contactPhone: string;
    address1: string;
    address2: string;
    latitude: number;
    longitude: number;
}

export interface UserProfile {
    id: number;
    email: string;
    username: string; // login id
    name: string; // real name
    nickname: string;
    profileImage: string | null;
    createdAt: string;
}

export interface MeResponse {
    userId: number;
    nickname: string;
    username: string; // This maps to principal.getUser().getName() from backend
    status?: string | null; // SellerRequestStatus (nullable)
    hasPassword?: boolean; // Indicates if the user has a password set (false for social-only accounts)
    rrn?: string;
    phoneNum?: string;
    address?: string;
    email?: string;
}

export interface UserDetail {
    id: number;
    email: string;
    name: string;
    nickname: string;
    address: string;
    latitude: number;
    longitude: number;
    phoneNum?: string;
}

export interface ProfileUpdateRequest {
    nickname: string;
    phoneNum: string;
    address: string;
    rrn: string;
    latitude: number;
    longitude: number;
}

export const memberApi = {
    getMe: async () => {
        // Supports both legacy (number) and new (MeResponse) format
        const response = await client.get<RsData<number | MeResponse>>('/users/me');
        return response.data;
    },
    requestSeller: async (data: SellerRequestCreateRequest, profileImage?: File | null) => {
        const formData = new FormData();
        formData.append('data', new Blob([JSON.stringify(data)], { type: 'application/json' }));
        if (profileImage) {
            formData.append('profileImage', profileImage);
        }
        const response = await client.post<RsData<number>>('/users/seller-request', formData);
        return response.data;
    },
    updateProfile: async (data: ProfileUpdateRequest) => {
        const response = await client.patch<RsData<void>>('/users/profile', data);
        return response.data;
    },
    changePassword: async (data: any) => {
        const response = await client.patch<RsData<void>>('/users/password', data);
        return response.data;
    },
    changeAddress: async (data: any) => {
        const response = await client.patch<RsData<void>>('/users/address', data);
        return response.data;
    },
    changePhoneNum: async (data: any) => {
        const response = await client.patch<RsData<void>>('/users/phone', data);
        return response.data;
    },
    setPassword: async (data: any) => {
        const response = await client.post<RsData<void>>('/users/set-password', data);
        return response.data;
    },
    changeProfileImage: async (file: File) => {
        const formData = new FormData();
        formData.append('profileImage', file);
        const response = await client.patch<RsData<string>>('/users/profile-image', formData);
        return response.data; // Will return the new image URL in data
    }
};
