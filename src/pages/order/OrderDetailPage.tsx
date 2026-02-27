import { useEffect, useState } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { getStatusColor, getStatusText } from '../../utils/status';
import { orderApi, type OrderDetailResponse } from '../../api/order';
import { paymentApi } from '../../api/payment';

const OrderDetailPage = () => {
    const { id } = useParams();
    const location = useLocation();
    const navigate = useNavigate();

    // Retrieve the order skeleton data passed from OrdersPage
    const order = location.state?.order;
    const [items, setItems] = useState<OrderDetailResponse[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedItems, setSelectedItems] = useState<number[]>([]);

    // Cancel Modal State
    const [isCancelModalOpen, setIsCancelModalOpen] = useState(false);
    const [cancelReason, setCancelReason] = useState('');

    useEffect(() => {
        if (!order || !id) return;

        const fetchDetails = async () => {
            try {
                const resData = await orderApi.getOrderDetails(Number(id));
                if (resData && Array.isArray(resData.data)) {
                    setItems(resData.data);
                } else if (Array.isArray(resData)) {
                    // Fallback if interceptor unpacks it
                    setItems(resData as unknown as OrderDetailResponse[]);
                }
            } catch (error) {
                console.error('Failed to fetch order details:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchDetails();
    }, [id, order]);

    if (!order) {
        return (
            <div className="container" style={{ marginTop: '6rem', textAlign: 'center' }}>
                <p style={{ color: '#64748b' }}>잘못된 접근이거나 주문 정보를 불러올 수 없습니다.</p>
                <button className="btn btn-primary" onClick={() => navigate('/mypage')} style={{ marginTop: '1rem' }}>
                    마이페이지로 돌아가기
                </button>
            </div>
        );
    }

    // Selection Logic
    const cancellableItems = items.filter(item => item.status === 'PAID');

    const handleSelectItem = (orderItemId: number, checked: boolean) => {
        if (checked) {
            setSelectedItems(prev => [...prev, orderItemId]);
        } else {
            setSelectedItems(prev => prev.filter(id => id !== orderItemId));
        }
    };

    const handleCancelSelected = () => {
        if (selectedItems.length === 0) {
            alert('취소할 상품을 선택해주세요.');
            return;
        }

        if (selectedItems.length === cancellableItems.length) {
            alert('부분 취소는 전체 상품을 선택할 수 없습니다. 전체 취소를 원하시면 [주문 전체 취소] 기능을 이용해주세요.');
            return;
        }

        // Open Modal instead of confirm
        setCancelReason('');
        setIsCancelModalOpen(true);
    };

    const executeCancel = async () => {
        if (!cancelReason.trim()) {
            alert('취소 사유를 입력해주세요.');
            return;
        }

        try {
            // Calculate total cancel amount for selected items
            const cancelAmount = selectedItems.reduce((total, itemId) => {
                const item = items.find(i => i.orderItemId === itemId);
                if (item) {
                    return total + Math.max(0, ((item.originalPrice || 0) * item.quantity) - (item.discountAmount || 0));
                }
                return total;
            }, 0);

            await paymentApi.cancelPayment({
                orderId: order.orderNo,
                cancelReason: cancelReason,
                ids: selectedItems,
                cancelAmount: cancelAmount
            });

            alert(`주문 부분 취소가 성공적으로 완료되었습니다.`);
            setIsCancelModalOpen(false);
            setCancelReason('');

            // Go back to the order list (MyPage)
            navigate('/mypage');
        } catch (error: any) {
            console.error('Cancellation failed', error);
            alert(error.response?.data?.message || '주문 부분 취소에 실패했습니다.');
        }
    };

    return (
        <div className="container" style={{ marginTop: '6rem', padding: '0 1rem', maxWidth: '800px' }}>
            <div style={{ display: 'flex', alignItems: 'center', marginBottom: '2rem' }}>
                <button
                    onClick={() => navigate(-1)}
                    style={{ background: 'none', border: 'none', fontSize: '1.25rem', cursor: 'pointer', padding: '0.5rem', marginRight: '1rem', color: '#64748b' }}
                >
                    ←
                </button>
                <h2 style={{ margin: 0, fontWeight: 700, color: '#1e293b' }}>주문 내역</h2>
            </div>

            {/* Order Info Section */}
            <div className="card" style={{ padding: '2rem', marginBottom: '2rem', backgroundColor: '#fff', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
                <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '1rem', color: '#1e293b', borderBottom: '1px solid #e2e8f0', paddingBottom: '0.75rem' }}>
                    주문 정보
                </h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <span style={{ color: '#64748b' }}>주문일자</span>
                        <span style={{ fontWeight: 600, color: '#1e293b' }}>
                            {new Date(order.createdAt).toLocaleDateString('ko-KR', { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                        </span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <span style={{ color: '#64748b' }}>주문번호</span>
                        <span style={{ fontWeight: 600, color: '#1e293b' }}>{order.orderNo}</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <span style={{ color: '#64748b' }}>배송지</span>
                        <span style={{ fontWeight: 600, color: '#1e293b', textAlign: 'right', maxWidth: '60%' }}>{order.address || '배송지 정보 없음'}</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '0.5rem', paddingTop: '1rem', borderTop: '1px dashed #e2e8f0' }}>
                        <span style={{ color: '#0f172a', fontWeight: 700 }}>총 결제금액</span>
                        <span style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--primary-color)' }}>
                            {order.totalPrice.toLocaleString()}원
                        </span>
                    </div>
                </div>
            </div>

            {/* Order Items Section */}
            <div className="card" style={{ padding: '0', overflow: 'hidden', border: '1px solid #e2e8f0', backgroundColor: '#fff', borderRadius: '12px' }}>
                <div style={{ padding: '1.25rem 1.5rem', backgroundColor: '#f8fafc', borderBottom: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                        <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 700, color: '#1e293b' }}>주문 상품 ({order.itemCount}개)</h3>
                    </div>
                    {cancellableItems.length > 0 && (
                        <button
                            onClick={handleCancelSelected}
                            className="btn btn-outline"
                            style={{
                                padding: '0.4rem 1rem',
                                fontSize: '0.85rem',
                                color: selectedItems.length > 0 ? '#ef4444' : '#94a3b8',
                                borderColor: selectedItems.length > 0 ? '#ef4444' : '#cbd5e1',
                                transition: 'all 0.2s',
                                cursor: selectedItems.length > 0 ? 'pointer' : 'not-allowed'
                            }}
                            disabled={selectedItems.length === 0}
                        >
                            선택 상품 취소 {selectedItems.length > 0 ? `(${selectedItems.length})` : ''}
                        </button>
                    )}
                </div>

                <div style={{ padding: '0 1.5rem' }}>
                    {loading ? (
                        <div style={{ padding: '2rem', textAlign: 'center', color: '#64748b' }}>상품 정보를 불러오는 중...</div>
                    ) : items.length === 0 ? (
                        <div style={{ padding: '2rem', textAlign: 'center', color: '#64748b' }}>상품 정보가 없습니다.</div>
                    ) : (
                        items.map((item: OrderDetailResponse, itemIdx: number) => {
                            // Check if the individual item is PAID
                            const isCancellable = item.status === 'PAID';
                            const isSelected = selectedItems.includes(item.orderItemId);

                            return (
                                <div key={`item-${item.productItemId}-${itemIdx}`} style={{
                                    padding: '1.5rem 0',
                                    borderBottom: itemIdx !== items.length - 1 ? '1px solid #f1f5f9' : 'none',
                                    display: 'flex', gap: '1.5rem', alignItems: 'center'
                                }}>
                                    {isCancellable ? (
                                        <input
                                            type="checkbox"
                                            checked={isSelected}
                                            onChange={(e) => handleSelectItem(item.orderItemId, e.target.checked)}
                                            style={{ width: '1.2rem', height: '1.2rem', cursor: 'pointer', accentColor: 'var(--primary-color)', flexShrink: 0 }}
                                        />
                                    ) : (
                                        <div style={{ width: '1.2rem', height: '1.2rem', flexShrink: 0 }}></div>
                                    )}

                                    {/* Product Image Placeholder */}
                                    <div style={{ width: '80px', height: '80px', backgroundColor: '#f1f5f9', borderRadius: '8px', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#cbd5e1', fontSize: '2rem' }}>
                                        📦
                                    </div>

                                    <div style={{ flex: 1 }}>
                                        <div style={{ display: 'flex', alignItems: 'center', marginBottom: '0.5rem', gap: '0.5rem' }}>
                                            {/* Use item.status instead of order.state */}
                                            <span style={{ fontSize: '0.9rem', fontWeight: 700, color: getStatusColor(item.status).text }}>
                                                {getStatusText(item.status)}
                                            </span>
                                        </div>
                                        <div style={{ fontSize: '0.9rem', color: '#64748b', marginBottom: '0.5rem' }}>
                                            판매자: {item.sellerName || '당근상회'} <span style={{ margin: '0 0.5rem', color: '#cbd5e1' }}>・</span> 수량: {item.quantity}개
                                        </div>

                                        {/* Price and Coupon Information */}
                                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                                            {item.discountAmount > 0 ? (
                                                <>
                                                    <div style={{ fontSize: '0.9rem', color: '#94a3b8', textDecoration: 'line-through' }}>
                                                        {((item.originalPrice || 0) * item.quantity).toLocaleString()}원
                                                    </div>
                                                    <div style={{ fontSize: '0.85rem', color: '#ef4444', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                                                        <span style={{ backgroundColor: '#fee2e2', padding: '0.1rem 0.4rem', borderRadius: '4px', fontWeight: 600 }}>쿠폰 적용</span>
                                                        {item.couponName && <span>{item.couponName}</span>}
                                                        <span style={{ fontWeight: 600 }}>(-{item.discountAmount.toLocaleString()}원)</span>
                                                    </div>
                                                </>
                                            ) : (
                                                <div style={{ fontSize: '0.9rem', color: '#94a3b8' }}>
                                                    {((item.originalPrice || 0) * item.quantity).toLocaleString()}원
                                                </div>
                                            )}
                                            <div style={{ fontSize: '1.2rem', fontWeight: 800, color: '#0f172a', marginTop: '0.25rem' }}>
                                                {Math.max(0, ((item.originalPrice || 0) * item.quantity) - (item.discountAmount || 0)).toLocaleString()}원
                                            </div>
                                        </div>
                                    </div>

                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', minWidth: '110px' }}>
                                        {order.state === 'DELIVERED' && (
                                            <button className="btn btn-primary" style={{ padding: '0.5rem 1rem', fontSize: '0.85rem' }}>리뷰 작성</button>
                                        )}
                                    </div>
                                </div>
                            );
                        })
                    )}
                </div>
            </div>

            <div style={{ paddingBottom: '3rem' }}></div>

            {/* Cancel Reason Modal */}
            {isCancelModalOpen && (
                <div style={{
                    position: 'fixed', top: 0, left: 0, width: '100%', height: '100%',
                    backgroundColor: 'rgba(0, 0, 0, 0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000
                }}>
                    <div style={{
                        backgroundColor: '#fff', borderRadius: '12px', padding: '2rem', width: '90%', maxWidth: '400px',
                        boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)'
                    }}>
                        <h3 style={{ margin: '0 0 1rem 0', fontSize: '1.25rem', fontWeight: 700, color: '#1e293b' }}>주문 부분 취소</h3>
                        <p style={{ margin: '0 0 1rem 0', fontSize: '0.9rem', color: '#64748b' }}>
                            선택한 {selectedItems.length}개의 상품을 취소합니다.<br />
                            취소 사유를 입력해주세요.
                        </p>

                        <textarea
                            value={cancelReason}
                            onChange={(e) => setCancelReason(e.target.value)}
                            placeholder="취소 사유를 자세히 적어주세요 (예: 단순 변심, 상품 파손 등)"
                            style={{
                                width: '100%', minHeight: '100px', padding: '0.75rem', borderRadius: '8px',
                                border: '1px solid #cbd5e1', marginBottom: '1.5rem', fontSize: '0.95rem',
                                resize: 'vertical'
                            }}
                        />

                        <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end' }}>
                            <button
                                onClick={() => setIsCancelModalOpen(false)}
                                className="btn btn-outline"
                                style={{ padding: '0.5rem 1rem' }}
                            >
                                닫기
                            </button>
                            <button
                                onClick={executeCancel}
                                className="btn btn-primary"
                                style={{ padding: '0.5rem 1rem', backgroundColor: '#ef4444', borderColor: '#ef4444' }}
                            >
                                취소 실행
                            </button>
                        </div>
                    </div>
                </div>
            )}

        </div>
    );
};

export default OrderDetailPage;
