import { useEffect, useState } from 'react';
import { reviewApi, type PaginatedReviewResponse, type ReviewResponse } from '../api/review';
import { Button } from './Button';
import { FaStar } from 'react-icons/fa';

interface ProductReviewsProps {
    productId: number;
}

export const ProductReviews = ({ productId }: ProductReviewsProps) => {
    const [reviewsData, setReviewsData] = useState<PaginatedReviewResponse | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [page, setPage] = useState(0);

    useEffect(() => {
        const fetchReviews = async () => {
            setLoading(true);
            try {
                const response = await reviewApi.getProductReviews(productId, page, 5);
                setReviewsData(response.data as unknown as PaginatedReviewResponse);
            } catch (err: any) {
                console.error("Failed to fetch reviews:", err);
                setError("리뷰를 불러오는데 실패했습니다.");
            } finally {
                setLoading(false);
            }
        };

        if (productId) {
            fetchReviews();
        }
    }, [productId, page]);

    if (loading && page === 0) {
        return <div className="py-8 text-center text-gray-500 animate-pulse">리뷰를 불러오는 중...</div>;
    }

    if (error) {
        return <div className="py-8 text-center text-red-500">{error}</div>;
    }

    const reviews = reviewsData?.content || [];
    const totalElements = reviewsData?.totalElements || 0;
    const totalPages = reviewsData?.totalPages || 0;

    return (
        <div className="mt-16 border-t border-[var(--border-color)] pt-12">
            <h2 className="text-2xl font-bold text-[var(--text-main)] mb-8 flex items-center gap-2">
                상품 후기
                <span className="text-[var(--primary-color)] text-lg font-normal">({totalElements})</span>
            </h2>

            {reviews.length === 0 ? (
                <div className="bg-gray-50 rounded-2xl p-12 text-center border border-gray-100">
                    <p className="text-gray-500">아직 작성된 리뷰가 없습니다.</p>
                    <p className="text-sm text-gray-400 mt-2">첫 번째 리뷰를 작성해 보세요!</p>
                </div>
            ) : (
                <div className="space-y-6">
                    {reviews.map((review: ReviewResponse) => (
                        <div key={review.id} className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
                            <div className="flex justify-between items-start mb-4">
                                <div>
                                    {/* TODO: Add logic to partially mask user names if needed */}
                                    <span className="font-semibold text-gray-800 mr-3">
                                        고객명 (ID: {review.userId})
                                    </span>
                                    <span className="text-sm text-gray-400">
                                        {new Date(review.createdAt).toLocaleDateString()}
                                    </span>
                                </div>
                                <div className="flex text-yellow-400 text-sm">
                                    {[...Array(5)].map((_, i) => (
                                        <FaStar key={i} className={i < review.rating ? 'text-yellow-400' : 'text-gray-200'} />
                                    ))}
                                </div>
                            </div>
                            <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">{review.content}</p>
                        </div>
                    ))}
                </div>
            )}

            {/* Pagination controls */}
            {totalPages > 1 && (
                <div className="flex justify-center items-center gap-4 mt-8">
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setPage(p => Math.max(0, p - 1))}
                        disabled={page === 0}
                    >
                        이전
                    </Button>
                    <span className="text-sm text-gray-600 font-medium">
                        {page + 1} / {totalPages}
                    </span>
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setPage(p => Math.min(totalPages - 1, p + 1))}
                        disabled={page >= totalPages - 1}
                    >
                        다음
                    </Button>
                </div>
            )}
        </div>
    );
};
