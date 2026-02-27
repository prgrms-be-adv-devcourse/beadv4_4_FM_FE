import client, { type RsData } from './client';

export interface ReviewRequest {
    content: string;
    rating: number;
}

export interface ReviewResponse {
    id: number;
    orderItemId: number;
    productId: number;
    productName: string;
    imageUrl: string;
    userId: number;
    content: string;
    rating: number;
    status: string;
    createdAt: string;
}

export interface WritableReviewResponse {
    orderItemId: number;
    productId: number;
    productName: string;
    imageUrl: string;
    sellerId: number;
    createdAt: string;
}

export interface PaginatedReviewResponse {
    content: ReviewResponse[];
    pageNumber: number;
    pageSize: number;
    totalElements: number;
    totalPages: number;
    first: boolean;
    last: boolean;
}

export const reviewApi = {
    // 리뷰 작성
    createReview: async (orderItemId: number, data: ReviewRequest) => {
        const response = await client.post<RsData<ReviewResponse>>(`/reviews/${orderItemId}`, data);
        return response.data;
    },

    // 단건 조회
    getReview: async (reviewId: number) => {
        const response = await client.get<RsData<ReviewResponse>>(`/reviews/${reviewId}`);
        return response.data;
    },

    // 상품별 리뷰 조회
    getProductReviews: async (productId: number, page = 0, size = 10) => {
        const response = await client.get<RsData<PaginatedReviewResponse>>(`/reviews?productId=${productId}&page=${page}&size=${size}`);
        return response.data;
    },

    // 작성 가능한 리뷰 목록 (마이페이지)
    getPendings: async () => {
        const response = await client.get<RsData<WritableReviewResponse[]>>('/reviews/me/pending');
        return response.data;
    },

    // 내가 작성한 리뷰 목록 (마이페이지)
    getMyReviews: async (page = 0, size = 10) => {
        const response = await client.get<RsData<PaginatedReviewResponse>>(`/reviews/me?page=${page}&size=${size}`);
        return response.data;
    }
};
