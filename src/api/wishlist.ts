import client, { type RsData } from './client';

export interface WishlistResponse {
    wishlistId: number;
    productId: number;
    productName: string;
    categoryName: string;
    totalPrice: number;
    thumbnailUrl: string;
}

export const wishlistApi = {
    getMyWishlist: async () => {
        const response = await client.get<RsData<WishlistResponse[]>>('/wishlist');
        return response.data;
    },

    addWishlist: async (productId: number) => {
        const response = await client.post<RsData<number>>(`/wishlist?productId=${productId}`);
        return response.data;
    },

    deleteWishlist: async (productId: number) => {
        const response = await client.delete<RsData<void>>(`/wishlist?productId=${productId}`);
        return response.data;
    },

    checkWishList: async (productId: number) => {
        const response = await client.get<RsData<boolean>>(`/wishlist/check?productId=${productId}`);
        return response.data;
    }
};
