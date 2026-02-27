import { Link } from 'react-router-dom';

const SellerDashboardPage = () => {
    // 임시 상태 값들 (API 연동 후 실제 값으로 대체)
    const pendingCount = 0;
    const itemSentCount = 0;
    const issueCount = 0;

    const delayedCount = 0;
    const completedCount = 0;
    const canceledCount = 0;

    const unwrittenRequestCount = 0; // 작업 전 요청사항 미작성 주문

    // 오늘 날짜와 이번 달 1일 계산 (YYYY-MM-DD 형식)
    const today = new Date();
    const firstDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);

    const formatDate = (date: Date) => {
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    };

    const startDate = formatDate(firstDayOfMonth);
    const endDate = formatDate(today);

    return (
        <div style={{ maxWidth: '1200px', margin: '0 auto', fontFamily: '"Noto Sans KR", sans-serif' }}>

            <h1 style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#1e293b', marginBottom: '1.5rem' }}>주문/배송</h1>

            {/* Top Dashboard Banner Area */}
            <div style={{
                backgroundColor: '#ffffff',
                borderRadius: '16px',
                padding: '2rem',
                marginBottom: '1.5rem',
                boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
                display: 'flex',
                gap: '2rem'
            }}>
                {/* 3 Main Status Cards */}
                <div style={{ display: 'flex', gap: '1rem', flex: 1 }}>
                    <div style={{ flex: 1, backgroundColor: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '16px', padding: '1.5rem', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', boxShadow: '0 2px 4px rgba(0,0,0,0.02)', cursor: 'pointer', transition: 'box-shadow 0.2s', minWidth: '150px' }} onMouseOver={(e) => e.currentTarget.style.boxShadow = '0 4px 8px rgba(0,0,0,0.05)'} onMouseOut={(e) => e.currentTarget.style.boxShadow = '0 2px 4px rgba(0,0,0,0.02)'}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#475569', fontWeight: '600', whiteSpace: 'nowrap' }}>
                            <div style={{ width: '24px', height: '24px', backgroundColor: '#eff6ff', borderRadius: '4px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#3b82f6' }}>⚙️</div>
                            진행중
                        </div>
                        <div style={{ fontSize: '2rem', fontWeight: '800', color: '#1e293b', textAlign: 'right', marginTop: '1rem' }}>{pendingCount}</div>
                    </div>

                    <div style={{ flex: 1, backgroundColor: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '16px', padding: '1.5rem', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', boxShadow: '0 2px 4px rgba(0,0,0,0.02)', cursor: 'pointer', transition: 'box-shadow 0.2s', minWidth: '150px' }} onMouseOver={(e) => e.currentTarget.style.boxShadow = '0 4px 8px rgba(0,0,0,0.05)'} onMouseOut={(e) => e.currentTarget.style.boxShadow = '0 2px 4px rgba(0,0,0,0.02)'}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#475569', fontWeight: '600', whiteSpace: 'nowrap' }}>
                            <div style={{ width: '24px', height: '24px', backgroundColor: '#f0fdf4', borderRadius: '4px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#22c55e' }}>📁</div>
                            작업물 발송
                        </div>
                        <div style={{ fontSize: '2rem', fontWeight: '800', color: '#1e293b', textAlign: 'right', marginTop: '1rem' }}>{itemSentCount}</div>
                    </div>

                    <div style={{ flex: 1, backgroundColor: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '16px', padding: '1.5rem', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', boxShadow: '0 2px 4px rgba(0,0,0,0.02)', cursor: 'pointer', transition: 'box-shadow 0.2s', minWidth: '150px' }} onMouseOver={(e) => e.currentTarget.style.boxShadow = '0 4px 8px rgba(0,0,0,0.05)'} onMouseOut={(e) => e.currentTarget.style.boxShadow = '0 2px 4px rgba(0,0,0,0.02)'}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#475569', fontWeight: '600', whiteSpace: 'nowrap', fontSize: '0.95rem' }}>
                            <div style={{ width: '24px', height: '24px', backgroundColor: '#fef2f2', borderRadius: '4px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#ef4444' }}>❗</div>
                            취소 · 문제 해결
                        </div>
                        <div style={{ fontSize: '2rem', fontWeight: '800', color: '#1e293b', textAlign: 'right', marginTop: '1rem' }}>{issueCount}</div>
                    </div>
                </div>

                {/* Right Summary List */}
                <div style={{ width: '200px', display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: '0.75rem', borderLeft: '1px solid #e2e8f0', paddingLeft: '2rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', color: '#475569', fontSize: '0.95rem' }}>
                        <span>발송 지연</span>
                        <strong style={{ color: '#1e293b', fontSize: '1.1rem' }}>{delayedCount}</strong>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', color: '#475569', fontSize: '0.95rem' }}>
                        <span>거래 완료</span>
                        <strong style={{ color: '#1e293b', fontSize: '1.1rem' }}>{completedCount}</strong>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', color: '#475569', fontSize: '0.95rem' }}>
                        <span>주문 취소</span>
                        <strong style={{ color: '#1e293b', fontSize: '1.1rem' }}>{canceledCount}</strong>
                    </div>
                </div>
            </div>

            {/* Red Alert Banner (Only show if there are unwritten requests) */}
            {unwrittenRequestCount > 0 && (
                <div style={{
                    backgroundColor: '#fef2f2',
                    border: '1px solid #fca5a5',
                    borderRadius: '12px',
                    padding: '1rem 1.5rem',
                    marginBottom: '2rem',
                    color: '#1e293b',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    fontSize: '0.95rem'
                }}>
                    <strong style={{ color: '#ef4444' }}>꼭 확인해 주세요!</strong>
                    <span>작업 전 요청사항을 작성하지 않은 주문이 <strong style={{ color: '#ef4444' }}>{unwrittenRequestCount}건</strong> 있습니다.</span>
                </div>
            )}

            {/* Filter and Search Area */}
            <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.5rem', alignItems: 'center' }}>
                <select style={{ padding: '0.6rem', border: 'none', borderBottom: '1px solid #cbd5e1', backgroundColor: 'transparent', outline: 'none', color: '#475569', fontWeight: 500, minWidth: '120px' }}>
                    <option>전체 상태</option>
                    <option>진행중</option>
                    <option>완료</option>
                </select>

                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <input type="date" defaultValue={startDate} style={{ padding: '0.6rem', border: 'none', borderBottom: '1px solid #cbd5e1', backgroundColor: 'transparent', outline: 'none', color: '#475569' }} />
                    <span style={{ color: '#94a3b8' }}>~</span>
                    <input type="date" defaultValue={endDate} style={{ padding: '0.6rem', border: 'none', borderBottom: '1px solid #cbd5e1', backgroundColor: 'transparent', outline: 'none', color: '#475569' }} />
                </div>

                <select style={{ padding: '0.6rem', border: 'none', borderBottom: '1px solid #cbd5e1', backgroundColor: 'transparent', outline: 'none', color: '#475569', fontWeight: 500, minWidth: '100px' }}>
                    <option>닉네임</option>
                    <option>주문번호</option>
                </select>

                <div style={{ position: 'relative', flex: 1, maxWidth: '400px' }}>
                    <input type="text" placeholder="검색어를 입력하세요" style={{ width: '100%', padding: '0.6rem 2rem 0.6rem 1rem', border: 'none', borderBottom: '1px solid #cbd5e1', backgroundColor: 'transparent', outline: 'none' }} />
                    <span style={{ position: 'absolute', right: '0.5rem', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8', cursor: 'pointer' }}>🔍</span>
                </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', fontSize: '0.9rem', color: '#64748b' }}>
                <div style={{ display: 'flex', gap: '1rem' }}>
                    <label style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', cursor: 'pointer' }}>
                        <input type="radio" name="sort" defaultChecked style={{ accentColor: '#eab308' }} /> 업데이트 순
                    </label>
                    <label style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', cursor: 'pointer' }}>
                        <input type="radio" name="sort" style={{ accentColor: '#eab308' }} /> 발송 예정일 순
                    </label>
                </div>
                <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                    <label style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', cursor: 'pointer' }}>
                        <input type="checkbox" /> 세금계산서 신청
                    </label>
                    <button style={{ padding: '0.5rem 1rem', border: '1px solid #cbd5e1', backgroundColor: '#ffffff', borderRadius: '4px', color: '#475569', fontWeight: 500, display: 'flex', alignItems: 'center', gap: '0.25rem', cursor: 'pointer' }}>
                        엑셀 다운로드 📥
                    </button>
                </div>
            </div>

            {/* Orders List Placeholder */}
            <div style={{ backgroundColor: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '16px', minHeight: '300px' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '100px 2fr 1fr 1fr 1fr 1fr', borderBottom: '1px solid #e2e8f0', padding: '1rem 1.5rem', fontSize: '0.85rem', fontWeight: 'bold', color: '#64748b', backgroundColor: '#f8fafc', borderRadius: '16px 16px 0 0' }}>
                    <div>주문번호</div>
                    <div>주문내역</div>
                    <div>닉네임</div>
                    <div>진행상태</div>
                    <div>남은 기간</div>
                    <div>금액</div>
                </div>

                {pendingCount > 0 ? (
                    <Link to="/myshop/orders/123456789" style={{ display: 'grid', gridTemplateColumns: '100px 2fr 1fr 1fr 1fr 1fr', borderBottom: '1px solid #f1f5f9', padding: '1rem 1.5rem', fontSize: '0.9rem', color: '#1e293b', alignItems: 'center', textDecoration: 'none', transition: 'background-color 0.2s' }} onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#f8fafc'} onMouseOut={(e) => e.currentTarget.style.backgroundColor = 'transparent'}>
                        <div style={{ color: '#3b82f6', fontWeight: 500 }}>#123456789</div>
                        <div style={{ fontWeight: 500 }}>[리뉴얼] 쇼핑몰 웹사이트 제작</div>
                        <div>Mossy Client</div>
                        <div style={{ color: '#10b981', fontWeight: 'bold' }}>진행중</div>
                        <div style={{ color: '#ef4444' }}>-1일</div>
                        <div style={{ fontWeight: 'bold' }}>150,000원</div>
                    </Link>
                ) : (
                    <div style={{ padding: '6rem 0', textAlign: 'center', color: '#94a3b8', fontSize: '1rem', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem' }}>
                        <div style={{ fontSize: '3rem', opacity: 0.5 }}>📥</div>
                        <div>현재 진행 중이거나 대기 중인 주문 내역이 없습니다.</div>
                    </div>
                )}
            </div>

        </div>
    );
};

export default SellerDashboardPage;
