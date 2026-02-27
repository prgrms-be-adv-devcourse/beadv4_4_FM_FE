import client, { type RsData } from './client';
import type { ProductResponse, Page } from './market';

export interface ProductCreateRequest {
    name: string;
    brand?: string;
    modelNumber?: string;
    categoryId?: number;
    description?: string;
    thumbnailUrl?: string;
    minPrice: number;
    basePrice?: number;
    weight?: number;
    status: 'ACTIVE' | 'OUT_OF_STOCK' | 'DISCONTINUED' | 'DRAFT' | 'INACTIVE' | 'SUSPENDED';
    quantity: number;
}

export interface ProductUpdateRequest extends Partial<ProductCreateRequest> { }

export const sellerProductApi = {
    // 상품 등록
    createProduct: async (sellerId: number, data: ProductCreateRequest) => {
        const response = await client.post<RsData<any>>('/products', data, {
            headers: {
                'X-Seller-Id': sellerId.toString()
            }
        });
        return response.data;
    },

    // 상품 수정
    updateProduct: async (sellerId: number, productId: number, data: ProductUpdateRequest) => {
        const response = await client.put<RsData<any>>(`/products/${productId}`, data, {
            headers: {
                'X-Seller-Id': sellerId.toString()
            }
        });
        return response.data;
    },

    // 상품 상태 변경 (예: 품절, 판매중지 등)
    changeStatus: async (sellerId: number, productId: number, status: string) => {
        const response = await client.patch<RsData<any>>(`/products/${productId}/status`, { status }, {
            headers: {
                'X-Seller-Id': sellerId.toString()
            }
        });
        return response.data;
    },

    // 상품 삭제 (소프트 딜리트)
    deleteProduct: async (sellerId: number, productId: number) => {
        const response = await client.delete<RsData<any>>(`/products/${productId}`, {
            headers: {
                'X-Seller-Id': sellerId.toString()
            }
        });
        return response.data;
    },

    // 판매자의 상품 목록 조회
    // * API 명세에서 /api/v1/products/search 를 범용으로 사용한다고 했으므로,
    // * 일단 이쪽을 호출하되 헤더와 쿼리를 조합하여 백엔드에서 처리한다고 가정.
    getMyProducts: async (sellerId: number, page = 0, size = 10, keyword?: string) => {
        const params: any = { page, size };
        if (keyword) params.keyword = keyword;

        // X-Seller-Id 헤더를 보내면 게이트웨이나 컨트롤러에서 내 상품들만 필터링 해준다고 가정합니다.
        const response = await client.get<RsData<Page<ProductResponse>>>('/products/search', {
            params,
            headers: {
                'X-Seller-Id': sellerId.toString()
            }
        });
        return response.data;
    }
};
