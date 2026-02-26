import { useEffect, useState } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { getStatusColor, getStatusText } from '../../utils/status';
import { orderApi, type OrderDetailResponse } from '../../api/order';
import { paymentApi } from '../../api/payment';
import Pagination from '../../components/Pagination';

const OrderDetailPage = () => {
    const { id } = useParams();
    const location = useLocation();
    const navigate = useNavigate();

    // Retrieve the order skeleton data passed from OrdersPage
    const order = location.state?.order;
    const [items, setItems] = useState<OrderDetailResponse[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedItems, setSelectedItems] = useState<number[]>([]);

    // Payment History State
    const [payments, setPayments] = useState<any[]>([]);
    const [paymentPage, setPaymentPage] = useState(0);
    const [paymentTotalPages, setPaymentTotalPages] = useState(0);

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

    // Fetch Payment History
    useEffect(() => {
        if (!order || !order.orderNo) return;
        const fetchPayments = async () => {
            try {
                const res = await paymentApi.getPaymentsByOrder(order.orderNo, paymentPage, 5);
                if (res) {
                    // 최신순 정렬
                    const sorted = [...(res.content || [])].sort((a: any, b: any) =>
                        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
                    );
                    setPayments(sorted);
                    setPaymentTotalPages(res.totalPages || 0);
                }
            } catch (err: any) {
                if (err.response?.status === 404) {
                    setPayments([]);
                    setPaymentTotalPages(0);
                } else {
                    console.error("Failed to fetch payments", err);
                }
            }
        };
        fetchPayments();
    }, [order, paymentPage]);

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

    const isSingleItem = items.length === 1;

    const handleCancelSelected = () => {
        if (!isSingleItem && selectedItems.length === 0) {
            alert('취소할 상품을 선택해주세요.');
            return;
        }

        // Open Modal
        setCancelReason('');
        setIsCancelModalOpen(true);
    };

    // 상품 1개일 때 전체 취소 버튼 클릭
    const handleFullCancel = () => {
        setCancelReason('');
        setIsCancelModalOpen(true);
    };

    const executeCancel = async () => {
        if (!cancelReason.trim()) {
            alert('취소 사유를 입력해주세요.');
            return;
        }

        try {
            // Calculate cancel items and amount
            const targetItems = isSingleItem ? items.map(i => i.orderItemId) : selectedItems;
            const cancelAmount = targetItems.reduce((total, itemId) => {
                const item = items.find(i => i.orderItemId === itemId);
                if (item) {
                    return total + (item.finalPrice || 0);
                }
                return total;
            }, 0);

            // If single item, ids should be empty for a full cancel
            // Otherwise, send the selected items for partial cancel
            const cancelIds = isSingleItem ? [] : selectedItems;

            await paymentApi.cancelPayment({
                orderId: order.orderNo,
                cancelReason: cancelReason,
                ids: cancelIds,
                cancelAmount: cancelAmount
            });

            alert(isSingleItem ? '주문 전체 취소가 완료되었습니다.' : '주문 부분 취소가 성공적으로 완료되었습니다.');
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
            <div style={{ padding: '2rem', marginBottom: '2rem', backgroundColor: '#fff', borderRadius: '12px', border: '1px solid #d1d5db', boxShadow: '0 1px 3px rgba(0,0,0,0.08)' }}>
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
            <div style={{ padding: '0', overflow: 'hidden', border: '1px solid #d1d5db', backgroundColor: '#fff', borderRadius: '12px', boxShadow: '0 1px 3px rgba(0,0,0,0.08)' }}>
                <div style={{ padding: '1.25rem 1.5rem', backgroundColor: '#f8fafc', borderBottom: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                        <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 700, color: '#1e293b' }}>주문 상품 ({order.itemCount}개)</h3>
                    </div>
                    {cancellableItems.length > 0 && (
                        isSingleItem ? (
                            <button
                                onClick={handleFullCancel}
                                className="btn"
                                style={{
                                    padding: '0.5rem 1.2rem',
                                    fontSize: '0.85rem',
                                    color: '#fff',
                                    backgroundColor: '#ef4444',
                                    border: 'none',
                                    borderRadius: '8px',
                                    cursor: 'pointer',
                                    fontWeight: 600,
                                }}
                            >
                                주문 전체 취소
                            </button>
                        ) : (
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
                        )
                    )}
                </div>

                <div style={{ padding: '0 1.5rem' }}>
                    {loading ? (
                        <div style={{ padding: '2rem', textAlign: 'center', color: '#64748b' }}>상품 정보를 불러오는 중...</div>
                    ) : items.length === 0 ? (
                        <div style={{ padding: '2rem', textAlign: 'center', color: '#64748b' }}>상품 정보가 없습니다.</div>
                    ) : (
                        items.map((item: OrderDetailResponse, itemIdx: number) => {
                            // Use item.status if available, otherwise fall back to order.state
                            const itemStatus = item.status || order.state;
                            const isCancellable = itemStatus === 'PAID';
                            const isSelected = selectedItems.includes(item.orderItemId);

                            return (
                                <div key={`item-${item.productItemId}-${itemIdx}`} style={{
                                    padding: '1.5rem 0',
                                    borderBottom: itemIdx !== items.length - 1 ? '1px solid #f1f5f9' : 'none',
                                    display: 'flex', gap: '1.5rem', alignItems: 'center'
                                }}>
                                    {/* 상품 1개면 체크박스 숨김 */}
                                    {!isSingleItem && isCancellable ? (
                                        <input
                                            type="checkbox"
                                            checked={isSelected}
                                            onChange={(e) => handleSelectItem(item.orderItemId, e.target.checked)}
                                            style={{ width: '1.2rem', height: '1.2rem', cursor: 'pointer', accentColor: 'var(--primary-color)', flexShrink: 0 }}
                                        />
                                    ) : !isSingleItem ? (
                                        <div style={{ width: '1.2rem', height: '1.2rem', flexShrink: 0 }}></div>
                                    ) : null}

                                    {/* Product Image Placeholder */}
                                    <div style={{ width: '80px', height: '80px', backgroundColor: '#f1f5f9', borderRadius: '8px', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#cbd5e1', fontSize: '2rem' }}>
                                        📦
                                    </div>

                                    <div style={{ flex: 1 }}>
                                        <div style={{ display: 'flex', alignItems: 'center', marginBottom: '0.5rem', gap: '0.5rem' }}>
                                            <span style={{
                                                fontSize: '0.85rem', fontWeight: 600, padding: '0.15rem 0.5rem', borderRadius: '4px',
                                                backgroundColor: getStatusColor(itemStatus).bg || '#f1f5f9',
                                                color: getStatusColor(itemStatus).text
                                            }}>
                                                {getStatusText(itemStatus)}
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
                                                        {(item.originalPrice || 0).toLocaleString()}원
                                                    </div>
                                                    <div style={{ fontSize: '0.85rem', color: '#ef4444', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                                                        <span style={{ backgroundColor: '#fee2e2', padding: '0.1rem 0.4rem', borderRadius: '4px', fontWeight: 600 }}>쿠폰 적용</span>
                                                        {item.couponName && <span>{item.couponName}</span>}
                                                        <span style={{ fontWeight: 600 }}>(-{item.discountAmount.toLocaleString()}원)</span>
                                                    </div>
                                                </>
                                            ) : (
                                                <div style={{ fontSize: '0.9rem', color: '#94a3b8' }}>
                                                    {(item.originalPrice || 0).toLocaleString()}원
                                                </div>
                                            )}
                                            <div style={{ fontSize: '1.2rem', fontWeight: 800, color: '#0f172a', marginTop: '0.25rem' }}>
                                                {(item.finalPrice || 0).toLocaleString()}원
                                            </div>
                                        </div>
                                    </div>

                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', minWidth: '110px', alignItems: 'flex-end' }}>
                                        {order.state === 'DELIVERED' && (
                                            <button className="btn btn-primary" style={{ padding: '0.45rem 0.9rem', fontSize: '0.8rem', borderRadius: '6px' }}>리뷰 작성</button>
                                        )}
                                    </div>
                                </div>
                            );
                        })
                    )}
                </div>
            </div>

            {/* Payment History Section */}
            <div style={{ padding: '0', overflow: 'hidden', border: '1px solid #d1d5db', backgroundColor: '#fff', borderRadius: '12px', marginTop: '2rem', boxShadow: '0 1px 3px rgba(0,0,0,0.08)' }}>
                <div style={{ padding: '1.25rem 1.5rem', backgroundColor: '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>
                    <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 700, color: '#1e293b' }}>결제 내역</h3>
                </div>
                <div style={{ padding: '1.5rem' }}>
                    {payments.length === 0 ? (
                        <div style={{ textAlign: 'center', color: '#64748b', padding: '1rem 0' }}>결제 내역이 없습니다.</div>
                    ) : (
                        <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                            {payments.map((payment, idx) => (
                                <li key={payment.paymentId || idx} style={{ padding: '1rem', border: '1px solid #e2e8f0', borderRadius: '8px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <div>
                                        <div style={{ fontSize: '0.85rem', color: '#94a3b8', marginBottom: '0.25rem' }}>
                                            {payment.createdAt ? new Date(payment.createdAt).toLocaleString() : ''}
                                        </div>
                                        <div style={{ fontSize: '1.05rem', fontWeight: 600, color: '#1e293b', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                            {payment.payMethod === 'TOSS' ? '토스 페이' : '예치금'}
                                            <span style={{
                                                fontSize: '0.8rem', padding: '0.1rem 0.5rem', borderRadius: '4px', fontWeight: 600,
                                                backgroundColor: payment.status === 'DONE' ? '#dcfce7' : (payment.status === 'CANCELED' || payment.status === 'PARTIAL_CANCELED' ? '#fee2e2' : '#f1f5f9'),
                                                color: payment.status === 'DONE' ? '#166534' : (payment.status === 'CANCELED' || payment.status === 'PARTIAL_CANCELED' ? '#ef4444' : '#64748b')
                                            }}>
                                                {payment.status === 'DONE' ? '결제 완료' : payment.status === 'CANCELED' ? '결제 취소' : payment.status === 'PARTIAL_CANCELED' ? '부분 취소' : payment.status}
                                            </span>
                                        </div>
                                    </div>
                                    <div style={{ textAlign: 'right' }}>
                                        <div style={{ fontSize: '1.1rem', fontWeight: 700, color: payment.status.includes('CANCEL') ? '#ef4444' : 'var(--primary-color)' }}>
                                            {payment.status.includes('CANCEL') ? '-' : ''}{payment.amount?.toLocaleString()}원
                                        </div>
                                        {payment.failReason && (
                                            <div style={{ fontSize: '0.85rem', color: '#ef4444', marginTop: '0.25rem' }}>{payment.failReason}</div>
                                        )}
                                    </div>
                                </li>
                            ))}
                        </ul>
                    )}

                    {/* Pagination for Payments */}
                    <Pagination currentPage={paymentPage} totalPages={paymentTotalPages} onPageChange={setPaymentPage} />
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
