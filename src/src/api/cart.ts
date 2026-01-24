import client, { type RsData } from './client';
import { getUserIdFromToken } from '../utils/auth';

export interface CartItem {
    productId: number;
    sellerId: number;
    productName: string;
    categoryName: string;
    price: number;
    weight: number;
    thumbnailUrl: string;
    quantity: number;
}

export interface CartResponse {
    cartId: number;
    buyerName: string;
    buyerAddress: string;
    itemCount: number;
    items: CartItem[];
}

export const cartApi = {
    getCart: async () => {
        const userId = getUserIdFromToken();
        if (!userId) throw new Error("로그인이 필요합니다.");

        const response = await client.get<RsData<CartResponse>>('/cart', {
            params: { userId }
        });
        return response.data;
    },

    addToCart: async (productId: number, quantity: number = 1) => {
        const userId = getUserIdFromToken();
        if (!userId) throw new Error("로그인이 필요합니다.");

        const response = await client.post<RsData<void>>('/cart/items', {
            productId,
            quantity
        }, {
            params: { userId }
        });
        return response.data;
    },

    removeFromCart: async (productId: number) => {
        const userId = getUserIdFromToken();
        if (!userId) throw new Error("로그인이 필요합니다.");

        const response = await client.delete<RsData<void>>(`/cart/items/${productId}`, {
            params: { userId }
        });
        return response.data;
    },

    updateCartItem: async (productId: number, quantity: number) => {
        const userId = getUserIdFromToken();
        if (!userId) throw new Error("로그인이 필요합니다.");

        const response = await client.patch<RsData<void>>('/cart/items', {
            productId,
            quantity
        }, {
            params: { userId }
        });
        return response.data;
    }
};
