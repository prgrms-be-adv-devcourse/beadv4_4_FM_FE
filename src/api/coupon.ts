import client, { type RsData } from './client';

export type CouponType = 'PERCENTAGE' | 'FIXED';

export interface UserCouponResponse {
    userCouponId: number;
    couponId: number;
    couponName: string;
    couponType: CouponType;
    discountValue: number;
    maxDiscountAmount: number | null;
    endAt: string;
    status: 'UNUSED' | 'USED' | 'EXPIRED';
}

export interface DownloadableCouponResponse {
    couponId: number;
    couponName: string;
    couponType: CouponType;
    discountValue: number;
    maxDiscountAmount: number | null;
    startAt: string;
    endAt: string;
}

export interface SellerCouponListResponse {
    couponId: number;
    productItemId: number;
    couponName: string;
    couponType: CouponType;
    discountValue: number;
    maxDiscountAmount: number | null;
    startAt: string;
    endAt: string;
    status: 'ACTIVE' | 'INACTIVE' | 'EXPIRED';
    createdAt: string;
}

export interface SellerCouponSummary {
    totalCount: number;
    activeCount: number;
    inactiveCount: number;
    expiredCount: number;
}

export interface SellerCouponPageResponse {
    summary: SellerCouponSummary;
    coupons: PageData<SellerCouponListResponse>;
}

export interface CouponUpdateRequest {
    couponName?: string;
    discountValue?: number;
    maxDiscountAmount?: number;
    endAt?: string;
}
export interface CouponCreateRequest {
    productItemId: number;
    couponName: string;
    couponType: CouponType;
    discountValue: number;
    maxDiscountAmount: number | null;
    startAt: string;
    endAt: string;
}

export interface PageData<T> {
    content: T[];
    pageable: {
        pageNumber: number;
        pageSize: number;
        sort: { empty: boolean; sorted: boolean; unsorted: boolean };
        offset: number;
        paged: boolean;
        unpaged: boolean;
    };
    last: boolean;
    totalPages: number;
    totalElements: number;
    size: number;
    number: number;
    sort: { empty: boolean; sorted: boolean; unsorted: boolean };
    first: boolean;
    numberOfElements: number;
    empty: boolean;
}

export const couponApi = {
    getMyCoupons: async (page: number = 0, size: number = 20, status?: 'UNUSED' | 'USED' | 'EXPIRED', couponType?: 'FIXED' | 'PERCENTAGE') => {
        const response = await client.get<RsData<PageData<UserCouponResponse>>>('/coupons/me', {
            params: {
                page,
                size,
                status,
                couponType,
                sort: 'createdAt,desc'
            }
        });
        return response.data;
    },

    // 상품 상세: 다운로드 가능한 쿠폰 목록 조회
    getDownloadableCoupons: async (productItemId: number) => {
        const response = await client.get<RsData<DownloadableCouponResponse[]>>('/coupons', {
            params: { productItemId }
        });
        return response.data;
    },

    // 쿠폰 다운로드
    downloadCoupon: async (couponId: number) => {
        const response = await client.post<RsData<void>>(`/coupons/${couponId}/download`);
        return response.data;
    },

    // 판매자 쿠폰 생성
    createSellerCoupon: async (data: CouponCreateRequest) => {
        const response = await client.post<RsData<number>>('/coupons/seller', data);
        return response.data;
    },

    // 판매자 쿠폰 목록 페이징 및 필터링 조회
    getSellerCoupons: async (page: number, size: number = 10, status?: string, couponType?: string) => {
        const response = await client.get<RsData<SellerCouponPageResponse>>('/coupons/seller/my', {
            params: {
                page,
                size,
                status: status === 'ALL' ? undefined : status,
                couponType: couponType === 'ALL' ? undefined : couponType
            }
        });
        return response.data;
    },

    // 판매자 쿠폰 수정
    updateSellerCoupon: async (couponId: number, request: CouponUpdateRequest) => {
        const response = await client.patch<RsData<void>>(`/coupons/seller/${couponId}`, request);
        return response.data;
    },

    // 판매자 쿠폰 비활성화
    deactivateSellerCoupon: async (couponId: number) => {
        const response = await client.patch<RsData<void>>(`/coupons/seller/${couponId}/deactivate`);
        return response.data;
    },

    // 판매자 쿠폰 삭제
    deleteSellerCoupon: async (couponId: number) => {
        const response = await client.delete<RsData<void>>(`/coupons/seller/${couponId}`);
        return response.data;
    }
};
