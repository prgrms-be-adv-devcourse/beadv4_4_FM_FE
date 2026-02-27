import client, { type RsData } from './client';

export interface SellerRequestItem {
    id: number;
    userId: number;
    sellerType: "INDIVIDUAL" | "BUSINESS";
    storeName: string;
    businessNum: string | null;
    representativeName: string;
    contactEmail: string;
    contactPhone: string;
    address1: string;
    address2: string;
    latitude: number;
    longitude: number;
    status: string;
    createdAt: string;
    updatedAt: string;
}

export interface SellerApproveResponse {
    sellerId: number;
    accessToken: string;
    refreshToken: string;
}

export const adminApi = {
    getSellerRequests: async () => {
        // GET /api/v1/admin/seller-requests
        const response = await client.get<RsData<SellerRequestItem[]>>('/admin/seller-requests');
        return response.data;
    },
    approveSellerRequest: async (id: number) => {
        // PATCH /api/v1/admin/seller-requests/{id}/approve
        const response = await client.patch<RsData<SellerApproveResponse>>(`/admin/seller-requests/${id}/approve`);
        return response.data;
    },
    rejectSellerRequest: async (id: number) => {
        // PATCH /api/v1/admin/seller-requests/{id}/reject
        const response = await client.patch<RsData<void>>(`/admin/seller-requests/${id}/reject`);
        return response.data;
    }
};
