import { useLocation, useNavigate } from 'react-router-dom';
import { type OrderListSellerResponse } from '../../../api/order';

const SellerOrderDetailPage = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const orderData = location.state?.orderData as OrderListSellerResponse;

    if (!orderData) {
        return (
            <div style={{ maxWidth: '800px', margin: '4rem auto', textAlign: 'center' }}>
                <h3>주문 정보를 불러올 수 없습니다.</h3>
                <button onClick={() => navigate(-1)} style={{ padding: '0.5rem 1rem', marginTop: '1rem', cursor: 'pointer' }}>뒤로가기</button>
            </div>
        );
    }

    return (
        <div style={{ maxWidth: '800px', margin: '0 auto', fontFamily: '"Noto Sans KR", sans-serif', paddingBottom: '4rem' }}>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                <h1 style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#1e293b', margin: 0 }}>주문 정보</h1>
                <button
                    onClick={() => navigate(-1)}
                    style={{
                        padding: '0.4rem 1rem',
                        backgroundColor: '#ffffff',
                        border: '1px solid #cbd5e1',
                        borderRadius: '6px',
                        color: '#475569',
                        fontSize: '0.9rem',
                        cursor: 'pointer',
                        fontWeight: 500
                    }}
                    onMouseOver={(e) => {
                        e.currentTarget.style.backgroundColor = '#f8fafc';
                        e.currentTarget.style.color = '#0f172a';
                    }}
                    onMouseOut={(e) => {
                        e.currentTarget.style.backgroundColor = '#ffffff';
                        e.currentTarget.style.color = '#475569';
                    }}
                >
                    &larr; 목록으로
                </button>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                <div style={{ fontSize: '0.95rem', color: '#64748b' }}>
                    <span style={{ marginRight: '1rem' }}>주문번호 #{orderData.orderNo}</span>
                    <span style={{ color: '#cbd5e1' }}>|</span>
                    <span style={{ marginLeft: '1rem' }}>주문일시 {new Date(orderData.createdAt).toLocaleDateString('ko-KR', { year: '2-digit', month: '2-digit', day: '2-digit' }).replace(/\./g, '.')} {new Date(orderData.createdAt).toLocaleTimeString('ko-KR', { hour12: false, hour: '2-digit', minute: '2-digit' })}</span>
                </div>
            </div>

            {/* Card 1: 판매한 상품 */}
            <div style={{ backgroundColor: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '8px', padding: '1.5rem', marginBottom: '1.5rem', boxShadow: '0 1px 2px rgba(0,0,0,0.02)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                    <h3 style={{ fontSize: '1.1rem', fontWeight: 'bold', margin: 0, color: '#1e293b' }}>판매한 상품</h3>
                </div>

                <div style={{ display: 'flex', gap: '1.5rem', alignItems: 'center' }}>
                    <div style={{ width: '100px', height: '100px', backgroundColor: '#f1f5f9', borderRadius: '8px', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <div style={{ fontSize: '2rem' }}>🎨</div>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                        <div style={{ fontSize: '1.05rem', fontWeight: '600', color: '#1e293b' }}>
                            프리미엄 로고 디자인 제작
                        </div>
                        <div style={{ fontSize: '0.85rem', color: '#64748b', display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                            <span style={{ backgroundColor: '#f1f5f9', padding: '0.2rem 0.5rem', borderRadius: '4px' }}>디자인</span>
                            <span>|</span>
                            <span>옵션: 스탠다드 패키지 (+ 50,000원)</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Card 3: 결제 정보 */}
            <div style={{ backgroundColor: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '8px', padding: '1.5rem', marginBottom: '1.5rem', boxShadow: '0 1px 2px rgba(0,0,0,0.02)' }}>
                <h3 style={{ fontSize: '1.1rem', fontWeight: 'bold', margin: 0, marginBottom: '1.5rem', color: '#1e293b' }}>상세 결제 내역</h3>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginBottom: '1.5rem', fontSize: '0.95rem', color: '#475569' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <span>상품 단가</span>
                        <span style={{ color: '#1e293b' }}>{(orderData.orderPrice / orderData.quantity).toLocaleString()}원</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <span>구매 수량</span>
                        <span style={{ color: '#1e293b' }}>{orderData.quantity}개</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <span>상품 총 금액</span>
                        <span style={{ color: '#1e293b', fontWeight: 600 }}>{orderData.orderPrice.toLocaleString()}원</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <span>쿠폰 할인</span>
                        <span style={{ color: '#ef4444' }}>- 10,000원</span>
                    </div>
                </div>

                <div style={{ borderTop: '1px solid #e2e8f0', margin: '0 -1.5rem 1.5rem -1.5rem' }}></div>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '1.1rem', fontWeight: 'bold' }}>
                    <span style={{ color: '#1e293b' }}>최종 결제 금액</span>
                    <span style={{ color: '#3b82f6', fontSize: '1.25rem' }}>{orderData.orderPrice.toLocaleString()}원</span>
                </div>
                <div style={{ backgroundColor: '#f8fafc', padding: '1rem', borderRadius: '8px', fontSize: '0.9rem', color: '#475569', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <span>결제 수단</span>
                        <span style={{ color: '#1e293b', fontWeight: 500 }}>신용카드 (현대 1234-****-****)</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <span>결제 일시</span>
                        <span style={{ color: '#1e293b', fontWeight: 500 }}>2022.11.20 13:40:15</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <span>승인 번호</span>
                        <span style={{ color: '#1e293b', fontWeight: 500 }}>74839210</span>
                    </div>
                </div>
            </div>

        </div>
    );
};

export default SellerOrderDetailPage;
