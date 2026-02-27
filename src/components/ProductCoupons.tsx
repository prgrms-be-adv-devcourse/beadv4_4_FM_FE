import { useEffect, useState } from 'react';
import { couponApi, type DownloadableCouponResponse } from '../api/coupon';
import { Button } from './Button';
import { FaTicketAlt, FaDownload } from 'react-icons/fa';

interface ProductCouponsProps {
    productItemId?: number;
}

export const ProductCoupons = ({ productItemId }: ProductCouponsProps) => {
    const [coupons, setCoupons] = useState<DownloadableCouponResponse[]>([]);
    const [loading, setLoading] = useState(false);
    const [downloadingId, setDownloadingId] = useState<number | null>(null);

    useEffect(() => {
        const fetchCoupons = async () => {
            if (!productItemId) {
                setCoupons([]);
                return;
            }
            setLoading(true);
            try {
                const response = await couponApi.getDownloadableCoupons(productItemId);
                if (response.data) {
                    setCoupons(response.data);
                } else {
                    setCoupons([]);
                }
            } catch (err) {
                console.error("Failed to fetch coupons:", err);
                setCoupons([]);
            } finally {
                setLoading(false);
            }
        };

        fetchCoupons();
    }, [productItemId]);

    const handleDownload = async (couponId: number) => {
        try {
            setDownloadingId(couponId);
            await couponApi.downloadCoupon(couponId);
            alert("쿠폰이 발급되었습니다! 결제 시 사용 가능합니다.");
        } catch (err: any) {
            console.error("Failed to download coupon", err);
            if (err.message === "로그인이 필요합니다." || err.response?.status === 401) {
                alert("로그인이 필요합니다.");
            } else {
                alert(err.response?.data?.msg || err.message || "쿠폰 발급 중 오류가 발생했습니다.");
            }
        } finally {
            setDownloadingId(null);
        }
    };

    if (!productItemId || loading || coupons.length === 0) {
        return (
            <div className="mt-8 bg-orange-50/20 p-6 rounded-2xl border border-orange-100/50">
                <h3 className="font-bold text-orange-900/60 mb-2 flex items-center gap-2">
                    <FaTicketAlt className="text-orange-500/40" />
                    적용 가능한 쿠폰
                </h3>
                <p className="text-sm text-gray-500">
                    {!productItemId
                        ? '옵션을 선택하시면 적용 가능한 쿠폰을 확인할 수 있습니다.'
                        : loading
                            ? '적용 가능한 쿠폰 확인 중...'
                            : '현재 이 상품에 적용 가능한 쿠폰이 없습니다.'}
                </p>
            </div>
        );
    }

    return (
        <div className="mt-8 bg-orange-50/50 p-6 rounded-2xl border border-orange-100">
            <h3 className="font-bold text-orange-900 mb-4 flex items-center gap-2">
                <FaTicketAlt className="text-orange-500" />
                적용 가능한 쿠폰
            </h3>
            <div className="space-y-3">
                {coupons.map(coupon => (
                    <div key={coupon.couponId} className="flex items-center justify-between bg-white p-4 rounded-xl shadow-sm border border-orange-100/50">
                        <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                                <span className="font-extrabold text-orange-600 text-lg">
                                    {coupon.couponType === 'PERCENTAGE'
                                        ? `${coupon.discountValue}%`
                                        : `${coupon.discountValue.toLocaleString()}원`} 할인
                                </span>
                                {coupon.maxDiscountAmount && coupon.couponType === 'PERCENTAGE' && (
                                    <span className="text-xs text-orange-400 bg-orange-50 px-2 py-0.5 rounded-full">
                                        최대 {coupon.maxDiscountAmount.toLocaleString()}원
                                    </span>
                                )}
                            </div>
                            <p className="font-medium text-gray-800 text-sm mb-1">{coupon.couponName}</p>
                            <p className="text-xs text-gray-400">
                                {new Date(coupon.endAt).toLocaleDateString()}까지 사용 가능
                            </p>
                        </div>
                        <Button
                            variant="primary"
                            size="sm"
                            className="bg-orange-500 hover:bg-orange-600 border-none flex items-center gap-2 shrink-0 ml-4"
                            onClick={() => handleDownload(coupon.couponId)}
                            disabled={downloadingId === coupon.couponId}
                        >
                            {downloadingId === coupon.couponId ? '발급 중...' : (
                                <>
                                    <FaDownload /> 받기
                                </>
                            )}
                        </Button>
                    </div>
                ))}
            </div>
        </div>
    );
};
