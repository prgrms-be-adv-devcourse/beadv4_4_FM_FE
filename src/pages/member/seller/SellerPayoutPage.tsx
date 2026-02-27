import { useEffect, useState } from 'react';
import { payoutApi, type PayoutListResponseDto } from '../../../api/payout';

const SellerPayoutPage = () => {
    const today = new Date();
    const [selectedYear, setSelectedYear] = useState(today.getFullYear());
    const [selectedMonth, setSelectedMonth] = useState(today.getMonth() + 1);

    const [loading, setLoading] = useState(false);
    const [payoutData, setPayoutData] = useState<PayoutListResponseDto | null>(null);

    const fetchPayouts = async (year: number, month: number) => {
        setLoading(true);
        try {
            const response = await payoutApi.getMonthlyPayouts(year, month);
            if (response && response.data) {
                setPayoutData(response.data);
            } else {
                setPayoutData(null);
            }
        } catch (error) {
            console.error('Failed to fetch payouts:', error);
            setPayoutData(null);
            // Optionally handle 401/error state
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchPayouts(selectedYear, selectedMonth);
    }, [selectedYear, selectedMonth]);

    const handlePrevMonth = () => {
        if (selectedMonth === 1) {
            setSelectedMonth(12);
            setSelectedYear((prev) => prev - 1);
        } else {
            setSelectedMonth((prev) => prev - 1);
        }
    };

    const handleNextMonth = () => {
        if (selectedYear === today.getFullYear() && selectedMonth === today.getMonth() + 1) {
            return; // 못 넘어가게 막기 (미래 달 조회 불가)
        }
        if (selectedMonth === 12) {
            setSelectedMonth(1);
            setSelectedYear((prev) => prev + 1);
        } else {
            setSelectedMonth((prev) => prev + 1);
        }
    };

    const isNextMonthDisabled = selectedYear === today.getFullYear() && selectedMonth === today.getMonth() + 1;

    return (
        <div style={{ maxWidth: '1200px', margin: '0 auto', fontFamily: '"Noto Sans KR", sans-serif' }}>
            <h1 style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#1e293b', marginBottom: '1.5rem' }}>정산 내역</h1>

            {/* Month Selector */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '1.5rem', marginBottom: '2rem' }}>
                <button
                    onClick={handlePrevMonth}
                    style={{ background: 'white', border: '1px solid #e2e8f0', width: '36px', height: '36px', borderRadius: '50%', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 2px 4px rgba(0,0,0,0.02)' }}
                >
                    &lt;
                </button>
                <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#1e293b', minWidth: '120px', textAlign: 'center' }}>
                    {selectedYear}. {String(selectedMonth).padStart(2, '0')}
                </div>
                <button
                    onClick={handleNextMonth}
                    disabled={isNextMonthDisabled}
                    style={{ background: isNextMonthDisabled ? '#f8fafc' : 'white', border: '1px solid #e2e8f0', width: '36px', height: '36px', borderRadius: '50%', cursor: isNextMonthDisabled ? 'not-allowed' : 'pointer', color: isNextMonthDisabled ? '#cbd5e1' : '#000', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 2px 4px rgba(0,0,0,0.02)' }}
                >
                    &gt;
                </button>
            </div>

            {/* Summary Cards */}
            <div style={{ display: 'flex', gap: '1rem', marginBottom: '2rem' }}>
                <div style={{ flex: 1, backgroundColor: '#ffffff', borderRadius: '16px', padding: '1.5rem', border: '1px solid #e2e8f0', boxShadow: '0 4px 12px rgba(0,0,0,0.02)' }}>
                    <div style={{ color: '#64748b', fontSize: '0.95rem', fontWeight: '500', marginBottom: '0.5rem' }}>총 정산 예정 금액</div>
                    <div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#1e293b' }}>
                        {payoutData?.summary.totalAmount.toLocaleString() || 0}원
                    </div>
                </div>

                <div style={{ flex: 1, backgroundColor: '#f0fdf4', borderRadius: '16px', padding: '1.5rem', border: '1px solid #bbf7d0', boxShadow: '0 4px 12px rgba(0,0,0,0.02)' }}>
                    <div style={{ color: '#166534', fontSize: '0.95rem', fontWeight: '500', marginBottom: '0.5rem' }}>입금 완료 금액 (지갑)</div>
                    <div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#15803d' }}>
                        {payoutData?.summary.creditedAmount.toLocaleString() || 0}원
                    </div>
                </div>

                <div style={{ flex: 1, backgroundColor: '#fffbeb', borderRadius: '16px', padding: '1.5rem', border: '1px solid #fef08a', boxShadow: '0 4px 12px rgba(0,0,0,0.02)' }}>
                    <div style={{ color: '#854d0e', fontSize: '0.95rem', fontWeight: '500', marginBottom: '0.5rem' }}>입금 대기 금액</div>
                    <div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#ca8a04' }}>
                        {payoutData?.summary.pendingCreditAmount.toLocaleString() || 0}원
                    </div>
                </div>
            </div>

            {/* Payout List */}
            <div style={{ backgroundColor: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '16px', overflow: 'hidden' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr 2fr 1.5fr 1.5fr', backgroundColor: '#f8fafc', padding: '1rem 1.5rem', fontWeight: 'bold', color: '#64748b', fontSize: '0.85rem', borderBottom: '1px solid #e2e8f0' }}>
                    <div>상태</div>
                    <div>주문/정산 확정일</div>
                    <div>지갑 입금일</div>
                    <div style={{ textAlign: 'right' }}>정산 금액</div>
                    <div style={{ textAlign: 'right' }}>액션</div>
                </div>

                {loading ? (
                    <div style={{ padding: '4rem 0', textAlign: 'center', color: '#94a3b8' }}>정산 데이터를 불러오는 중...</div>
                ) : payoutData?.payouts && payoutData.payouts.length > 0 ? (
                    payoutData.payouts.map((payout, idx) => (
                        <div key={payout.id || idx} style={{ display: 'grid', gridTemplateColumns: '1fr 2fr 2fr 1.5fr 1.5fr', padding: '1.25rem 1.5rem', borderBottom: '1px solid #f1f5f9', alignItems: 'center', fontSize: '0.95rem', color: '#1e293b' }}>
                            <div>
                                {payout.status === 'CREDITED' ? (
                                    <span style={{ backgroundColor: '#dcfce7', color: '#166534', padding: '0.25rem 0.5rem', borderRadius: '4px', fontSize: '0.75rem', fontWeight: 'bold' }}>입금완료</span>
                                ) : (
                                    <span style={{ backgroundColor: '#fef3c7', color: '#b45309', padding: '0.25rem 0.5rem', borderRadius: '4px', fontSize: '0.75rem', fontWeight: 'bold' }}>입금대기</span>
                                )}
                            </div>
                            <div style={{ color: '#475569' }}>
                                {payout.payoutDate ? new Date(payout.payoutDate).toLocaleString('ko-KR') : '-'}
                            </div>
                            <div style={{ color: '#475569' }}>
                                {payout.creditDate ? new Date(payout.creditDate).toLocaleString('ko-KR') : '-'}
                            </div>
                            <div style={{ textAlign: 'right', fontWeight: 'bold', color: '#0f172a' }}>
                                {payout.amount.toLocaleString()}원
                            </div>
                            <div style={{ textAlign: 'right' }}>
                                {/* Example action if needed (e.g. view details) */}
                                <button style={{ backgroundColor: 'transparent', border: '1px solid #cbd5e1', padding: '0.4rem 0.75rem', borderRadius: '6px', fontSize: '0.8rem', cursor: 'pointer', color: '#475569' }}>상세 보기</button>
                            </div>
                        </div>
                    ))
                ) : (
                    <div style={{ padding: '6rem 0', textAlign: 'center', color: '#94a3b8', fontSize: '1rem', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem' }}>
                        <div style={{ fontSize: '3rem', opacity: 0.5 }}>💰</div>
                        <div>해당 월의 정산 내역이 없습니다.</div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default SellerPayoutPage;
