import client, { type RsData } from './client';

export interface AdminBuyerResponse {
    userId: number;
    email: string;
    name: string;
    nickname: string;
    profileImage: string | null;
    status: string; // ACTIVE, SUSPENDED, PENDING, DELETED
    createdAt: string;
}

export interface AdminSellerResponse {
    sellerId: number;
    userId: number;
    email: string;
    name: string;
    nickname: string;
    storeName: string;
    sellerType: string; // INDIVIDUAL, BUSINESS
    contactEmail: string;
    contactPhone: string;
    userStatus: string; // ACTIVE, SUSPENDED, PENDING, DELETED
    createdAt: string;
}

export interface PaginatedAdminBuyerResponse {
    content: AdminBuyerResponse[];
    totalElements: number;
    totalPages: number;
    size: number;
    number: number;
}

export interface PaginatedAdminSellerResponse {
    content: AdminSellerResponse[];
    totalElements: number;
    totalPages: number;
    size: number;
    number: number;
}

export const adminUserApi = {
    getBuyers: async (page = 0, size = 20) => {
        const response = await client.get<RsData<PaginatedAdminBuyerResponse>>(`/admin/users/buyers?page=${page}&size=${size}`);
        return response.data;
    },

    getSellers: async (page = 0, size = 20) => {
        const response = await client.get<RsData<PaginatedAdminSellerResponse>>(`/admin/users/sellers?page=${page}&size=${size}`);
        return response.data;
    },

    suspendUser: async (userId: number) => {
        const response = await client.patch<RsData<void>>(`/admin/users/${userId}/suspend`);
        return response.data;
    },

    activateUser: async (userId: number) => {
        const response = await client.patch<RsData<void>>(`/admin/users/${userId}/activate`);
        return response.data;
    }
};
