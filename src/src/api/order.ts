import client, { type RsData } from './client';

export interface OrderCreatedResponse {
    orderId: number;
    totalAmount: number;
}

export const orderApi = {
    createOrder: async (userId: number, request: any) => {
        const response = await client.post<RsData<OrderCreatedResponse>>('/orders', request, {
            params: { userId }
        });
        return response.data;
    }
};
