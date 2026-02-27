import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { orderApi, type OrderResponse } from '../../api/order';
import { paymentApi } from '../../api/payment';
import { getStatusColor, getStatusText } from '../../utils/status';

interface OrdersPageProps {
    isEmbedded?: boolean;
    startDate?: string;
    endDate?: string;
    statusFilter?: string;
}

const OrdersPage = ({ isEmbedded = false, startDate, endDate, statusFilter }: OrdersPageProps) => {
    const navigate = useNavigate();
    const [orders, setOrders] = useState<any[]>([]); // Grouped orders from backend
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    // Cancel Modal State
    const [isCancelModalOpen, setIsCancelModalOpen] = useState(false);
    const [cancelReason, setCancelReason] = useState('');
    const [selectedOrderToCancel, setSelectedOrderToCancel] = useState<any>(null);

    useEffect(() => {
        const fetchOrders = async () => {
            try {
                // Map frontend status to backend Enum for API
                let apiState: string | undefined = undefined;
                if (statusFilter && statusFilter !== '전체 상태') {
                    const statusMap: Record<string, string> = {
                        '주문완료': 'PAYMENT_COMPLETED',
                        '주문확정': 'DELIVERED',
                        '주문취소': 'CANCELED'
                    };
                    apiState = statusMap[statusFilter];
                }

                // Fetch group orders from API using filter params
                const res = await orderApi.getMyOrders(0, 50, apiState, startDate, endDate);
                let groupedOrders: OrderResponse[] = [];

                if (res?.data?.content) {
                    groupedOrders = res.data.content;
                } else if (res?.data?.data?.content) {
                    groupedOrders = res.data.data.content;
                } else if (Array.isArray(res?.data)) {
                    groupedOrders = res.data;
                } else if (Array.isArray(res?.content)) {
                    groupedOrders = res.content;
                }

                // Remove duplicate orders (by orderId) since the backend might return multiple rows for the same checkout
                const uniqueOrders = Array.from(new Map(groupedOrders.map((o: any) => [o.orderId, o])).values());

                // Sort orders by creation date (descending)
                uniqueOrders.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

                setOrders(uniqueOrders);

            } catch (err: any) {
                console.error('Failed to fetch orders:', err);
                setError('주문 내역을 불러오는 중 오류가 발생했습니다.');
            } finally {
                setLoading(false);
            }
        };

        fetchOrders();
    }, [startDate, endDate, statusFilter]);

    const handleOpenCancelModal = (order: any) => {
        setSelectedOrderToCancel(order);
        setCancelReason('');
        setIsCancelModalOpen(true);
    };

    const executeCancel = async () => {
        if (!cancelReason.trim()) {
            alert('취소 사유를 입력해주세요.');
            return;
        }

        if (selectedOrderToCancel && window.confirm('정말 이 주문을 전체 취소하시겠습니까?')) {
            try {
                await paymentApi.cancelPayment({
                    orderId: selectedOrderToCancel.orderNo,
                    cancelReason: cancelReason
                });

                alert(`주문 전체 취소가 성공적으로 완료되었습니다.`);
                setIsCancelModalOpen(false);
                setCancelReason('');
                setSelectedOrderToCancel(null);
                // Refresh the page
                window.location.reload();
            } catch (err: any) {
                console.error('Cancellation failed:', err);
                alert(err.response?.data?.message || '주문 취소에 실패했습니다.');
            }
        }
    };



    if (loading) return <div className="container" style={{ textAlign: 'center', marginTop: '6rem' }}>로딩 중...</div>;

    if (error) {
        return (
            <div className="container" style={{ textAlign: 'center', marginTop: '6rem' }}>
                <p style={{ color: 'var(--danger-color)' }}>{error}</p>
                <button onClick={() => navigate('/mypage')} className="btn btn-primary">돌아가기</button>
            </div>
        );
    }

    return (
        <div className={isEmbedded ? "" : "container"} style={isEmbedded ? {} : { maxWidth: '800px', margin: '2rem auto', marginTop: '120px' }}>
            {!isEmbedded && (
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                    <h1 style={{ fontSize: '2rem', fontWeight: 700, color: 'var(--primary-color)' }}>주문 내역</h1>
                    <button onClick={() => navigate('/mypage')} className="btn btn-outline">마이페이지</button>
                </div>
            )}

            {orders.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '4rem 0', color: '#94a3b8' }}>
                    주문 내역이 없습니다.
                </div>
            ) : (
                <div style={{
                    display: 'flex', flexDirection: 'column', gap: '1rem',
                    maxHeight: isEmbedded ? '500px' : 'none', overflowY: isEmbedded ? 'auto' : 'visible',
                    paddingRight: isEmbedded ? '0.5rem' : '0'
                }}>
                    {orders.map((order, orderIdx) => {
                        return (
                            <div key={`order-${order.orderId}-${orderIdx}`} className="card" style={{ padding: '0', overflow: 'hidden', border: '1px solid #e2e8f0', backgroundColor: '#fff', borderRadius: '12px' }}>
                                {/* Order Header - Displayed ONCE per order group */}
                                <div style={{ padding: '1.25rem 1.5rem', backgroundColor: '#f8fafc', borderBottom: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <div>
                                        <span style={{ fontSize: '1rem', fontWeight: 600, color: '#1e293b', marginRight: '0.75rem' }}>
                                            {new Date(order.createdAt).toLocaleDateString('ko-KR', { year: 'numeric', month: 'long', day: 'numeric' })}
                                        </span>
                                        <span style={{ fontSize: '0.9rem', color: '#64748b' }}>주문번호: {order.orderNo}</span>
                                    </div>
                                    <div
                                        onClick={() => navigate(`/orders/${order.orderId}`, { state: { order } })}
                                        style={{ fontSize: '0.9rem', fontWeight: 600, color: '#64748b', cursor: 'pointer' }}
                                    >
                                        주문 상세 <span style={{ fontSize: '0.8rem' }}>{'>'}</span>
                                    </div>
                                </div>

                                {/* Order Items inside the group */}
                                <div style={{ padding: '0 1.5rem' }}>
                                    <div style={{
                                        padding: '1.5rem 0',
                                        display: 'flex', gap: '1.5rem', alignItems: 'center'
                                    }}>
                                        {/* Order Icon Placeholder */}
                                        <div style={{ width: '80px', height: '80px', backgroundColor: '#f1f5f9', borderRadius: '8px', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#cbd5e1', fontSize: '2rem' }}>
                                            📦
                                        </div>

                                        <div style={{ flex: 1 }}>
                                            <div style={{ display: 'flex', alignItems: 'center', marginBottom: '0.5rem', gap: '0.5rem' }}>
                                                <span style={{ fontSize: '0.9rem', fontWeight: 700, color: getStatusColor(order.state).text }}>
                                                    {getStatusText(order.state)}
                                                </span>
                                            </div>
                                            <div style={{ fontSize: '1rem', fontWeight: 600, color: '#1e293b', marginBottom: '0.25rem' }}>
                                                총 {order.itemCount}개의 상품
                                            </div>
                                            <div style={{ fontSize: '0.9rem', color: '#64748b', marginBottom: '0.5rem' }}>
                                                배송지: {order.address || '정보 없음'}
                                            </div>
                                            <div style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--primary-color)' }}>
                                                {order.totalPrice.toLocaleString()}원
                                            </div>
                                        </div>

                                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', minWidth: '110px' }}>
                                            {(order.state === 'PAYMENT_COMPLETED' || order.state === 'PAID' || order.state === 'PREPARE' || order.state === 'PARTIAL_CANCELED') && (
                                                <button
                                                    onClick={() => handleOpenCancelModal(order)}
                                                    className="btn btn-outline"
                                                    style={{ padding: '0.5rem 1rem', fontSize: '0.85rem', color: '#ef4444', borderColor: '#ef4444' }}
                                                >
                                                    주문 취소
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}

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
                        <h3 style={{ margin: '0 0 1rem 0', fontSize: '1.25rem', fontWeight: 700, color: '#1e293b' }}>주문 전체 취소</h3>
                        <p style={{ margin: '0 0 1rem 0', fontSize: '0.9rem', color: '#64748b' }}>
                            주문번호 {selectedOrderToCancel?.orderNo}을(를) 취소합니다.<br />
                            취소 사유를 입력해주세요.
                        </p>

                        <textarea
                            value={cancelReason}
                            onChange={(e) => setCancelReason(e.target.value)}
                            placeholder="취소 사유를 자세히 적어주세요 (예: 단순 변심, 배송 지연 등)"
                            style={{
                                width: '100%', minHeight: '100px', padding: '0.75rem', borderRadius: '8px',
                                border: '1px solid #cbd5e1', marginBottom: '1.5rem', fontSize: '0.95rem',
                                resize: 'vertical'
                            }}
                        />

                        <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end' }}>
                            <button
                                onClick={() => {
                                    setIsCancelModalOpen(false);
                                    setSelectedOrderToCancel(null);
                                }}
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

export default OrdersPage;
