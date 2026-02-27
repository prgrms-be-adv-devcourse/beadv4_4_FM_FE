import client, { type RsData } from './client';

export interface OrderCreatedResponse {
    orderId: number;
    orderNo: string;
    totalPrice: number;
}

export interface OrderItemRequest {
    productId: number;
    sellerId: number;
    productName: string;
    categoryName: string;
    price: number;
    weight: number;
    thumbnailUrl: string;
    quantity: number;
}

export interface CreateOrderRequest {
    totalPrice: number;
    paymentType: string;
    items: OrderItemRequest[];
}

export interface OrderResponse {
    orderId: number;
    orderNo: string;
    totalPrice: number;
    state: string; // OrderState
    itemCount: number;
    address: string;
    createdAt: string;
}

export interface OrderDetailResponse {
    orderItemId: number;
    productItemId: number;
    quantity: number;
    originalPrice: number;
    discountAmount: number;
    finalPrice: number;
    couponName?: string;
    couponType?: string;
    sellerName: string;
    status: string; // OrderState
}

export interface OrderListSellerResponse {
    orderItemId: number;
    orderNo: string;
    productItemId: number;
    quantity: number;
    orderPrice: number;
    state: string; // ENUM: OrderState
    createdAt: string;
    buyerName: string;
    deliveryAddress: string;
}

export const orderApi = {
    createOrder: async (request: CreateOrderRequest) => {
        const response = await client.post<RsData<OrderCreatedResponse>>('/orders', request);
        return response.data;
    },

    getMyOrders: async (page = 0, size = 5, state?: string, startDate?: string, endDate?: string) => {
        const queryParams = new URLSearchParams({
            page: page.toString(),
            size: size.toString(),
            ...(state && state !== '전체 상태' && { state }),
            ...(startDate && { startDate }),
            ...(endDate && { endDate })
        });
        const response = await client.get<any>(`/orders?${queryParams.toString()}`);
        return response.data;
    },

    getOrderDetails: async (orderId: number) => {
        const response = await client.get<RsData<OrderDetailResponse[]>>(`/orders/${orderId}`);
        return response.data;
    },

    getSellerOrders: async (page = 0, size = 10, state?: string) => {
        const queryParams = new URLSearchParams({
            page: page.toString(),
            size: size.toString(),
            ...(state && state !== 'ALL' && { state })
        });
        const response = await client.get<RsData<{ content: OrderListSellerResponse[], totalPages: number }>>(`/seller/orders?${queryParams.toString()}`);
        return response.data;
    }
};
