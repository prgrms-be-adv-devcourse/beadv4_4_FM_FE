import client, { type RsData } from './client';

export interface OptionGroup {
    groupId: number;
    name: string;
    values: string[];
}

export interface ProductItem {
    productItemsId: number;
    optionCombination: string;
    additionalPrice: number;
    totalPrice: number;
    quantity: number;
    weight: number;
    status: string;
}

export interface MainProduct {
    productId: number;
    sellerId: number;
    basePrice: number;
    optionGroups: OptionGroup[];
    productItems: ProductItem[];
}

export interface Catalog {
    id: number;
    name: string;
    brand: string;
    description: string;
    images: string[];
    categoryId: number;
    categoryName: string;
}

export interface OtherSeller {
    productId: number;
    sellerId: number;
    minTotalPrice: number;
}

export interface ProductDetailResponse {
    catalog: Catalog;
    mainProduct: MainProduct | null;
    otherSellers: OtherSeller[];
}

export interface ProductResponse {
    id: number;
    name: string;
    brand?: string;
    modelNumber?: string;
    categoryName?: string;
    description?: string;
    thumbnail?: string;
    minPrice: number;
    sellerCount?: number;
    status?: string;
    salesCount?: number;
    reviewCount?: number;
}

export interface Page<T> {
    content: T[];
    totalPages: number;
    totalElements: number;
    size: number;
    number: number;
}

export const marketApi = {
    getProducts: async ({
        page = 0,
        size = 10,
        keyword,
        categoryId,
        order
    }: {
        page?: number;
        size?: number;
        keyword?: string;
        categoryId?: number;
        order?: string;
    } = {}) => {
        const params: any = { page, size };
        if (keyword) params.keyword = keyword;
        if (categoryId) params.categoryId = categoryId;
        if (order) params.order = order;

        const response = await client.get<RsData<Page<ProductResponse>>>('/products/search', {
            params
        });
        return response.data;
    },
    getProduct: async (id: number) => {
        const response = await client.get<RsData<ProductResponse>>(`/products/${id}`);
        return response.data;
    }
};
