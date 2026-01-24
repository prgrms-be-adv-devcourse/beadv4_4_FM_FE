import client, { type RsData } from './client';

export interface ProductResponse {
    productId: number;
    name: string;
    price: number;
    description?: string;
    imageUrls?: string[];
    // Add other fields based on backend response
    status?: string;
    quantity?: number;
}

export interface Page<T> {
    content: T[];
    totalPages: number;
    totalElements: number;
    size: number;
    number: number;
}

export const marketApi = {
    getProducts: async (page = 0, size = 10) => {
        const response = await client.get<RsData<Page<ProductResponse>>>('/product/products', {
            params: { page, size }
        });
        return response.data;
    },
    getProduct: async (id: number) => {
        const response = await client.get<RsData<ProductResponse>>(`/product/products/${id}`);
        return response.data;
    }
};
