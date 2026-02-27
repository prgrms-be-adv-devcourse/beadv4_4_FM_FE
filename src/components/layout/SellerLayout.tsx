import { Outlet, Link, useNavigate, useLocation } from 'react-router-dom';

const SellerLayout = () => {
    const navigate = useNavigate();
    // 만약 상점이름을 저장하고 있다면 가져옵니다. (없으면 임시로 'Mossy 상점'으로 대체)
    const storeName = localStorage.getItem('storeName') || 'Mossy 상점';

    // 기존의 너무 밝은 초록색(#22c55e) 대신, 브랜드 기본 색상(Primary) 사용
    const sidebarBg = 'var(--primary-color)';

    const sidebarNavStyle = {
        padding: '1rem 1.5rem',
        color: '#ffffff',
        cursor: 'pointer',
        fontSize: '0.95rem',
        fontWeight: '500',
        display: 'flex',
        alignItems: 'center',
        gap: '0.75rem',
        transition: 'background-color 0.2s'
    };
    const location = useLocation();

    const menuItems = [
        { name: '상품관리', path: '/myshop/products' },
        { name: '가격관리', path: '/myshop/prices' },
        { name: '판매 목록', path: '/myshop/orders' },
        { name: '정산', path: '/myshop/settlements' },
        { name: '쿠폰 관리', path: '/myshop/coupons' },
        { name: '고객관리', path: '/myshop/customers' },
        { name: '판매자정보', path: '/myshop/info' },
    ];

    return (
        <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', backgroundColor: '#f4f5f7' }}>
            {/* Top Header */}
            <header style={{
                height: '60px',
                backgroundColor: '#ffffff',
                borderBottom: '1px solid #e2e8f0',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '0 2rem',
                position: 'sticky',
                top: 0,
                zIndex: 50
            }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', cursor: 'pointer' }} onClick={() => navigate('/myshop')}>
                    {/* Logo Area */}
                    <div style={{ fontSize: '1.5rem', fontWeight: '800', color: 'var(--primary-color)', letterSpacing: '-0.05em' }}>
                        MOSSY
                    </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', fontSize: '0.9rem', color: '#475569' }}>
                    <span style={{ cursor: 'pointer' }}>한국어 ▾</span>
                    <span style={{ cursor: 'pointer' }}>판매자교육</span>
                    <span style={{ cursor: 'pointer' }}>온라인문의</span>
                    <span style={{ cursor: 'pointer' }}>도움말</span>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: '700', color: '#1e293b', marginLeft: '1rem', cursor: 'pointer' }}>
                        <div style={{ width: '36px', height: '36px', borderRadius: '50%', backgroundColor: '#e2e8f0', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.2rem', color: '#64748b' }}>
                            👤
                        </div>
                        {storeName} 님 ▾
                    </div>
                </div>
            </header>

            <div style={{ display: 'flex', flex: 1 }}>
                {/* Left Sidebar */}
                <aside style={{
                    width: '240px',
                    backgroundColor: sidebarBg,
                    color: '#ffffff',
                    flexShrink: 0,
                    display: 'flex',
                    flexDirection: 'column',
                    paddingTop: '1rem'
                }}>
                    <nav style={{ display: 'flex', flexDirection: 'column' }}>
                        {menuItems.map((item) => {
                            const isActive = location.pathname.startsWith(item.path) || (item.name === '판매 목록' && location.pathname === '/myshop'); // 기본 활성 상태 (임시)

                            return (
                                <Link key={item.name} to={item.path} style={{ textDecoration: 'none' }}>
                                    <div
                                        style={{
                                            ...sidebarNavStyle,
                                            backgroundColor: isActive ? 'rgba(255,255,255,0.15)' : 'transparent',
                                            fontWeight: isActive ? '700' : '500',
                                        }}
                                        onMouseOver={(e) => {
                                            if (!isActive) e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.1)';
                                        }}
                                        onMouseOut={(e) => {
                                            if (!isActive) e.currentTarget.style.backgroundColor = 'transparent';
                                        }}
                                    >
                                        <span style={{ fontSize: '1.05rem', marginLeft: '0.25rem' }}>{item.name}</span>
                                    </div>
                                </Link>
                            )
                        })}
                    </nav>

                    <div style={{ marginTop: 'auto', padding: '1.5rem', borderTop: '1px solid rgba(255,255,255,0.2)' }}>
                        <Link to="/mypage" style={{ color: '#ffffff', textDecoration: 'none', fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <span>←</span> 메인 쇼핑몰로 돌아가기
                        </Link>
                    </div>
                </aside>

                {/* Main Content Area */}
                <main style={{ flex: 1, overflowX: 'hidden', padding: '2rem' }}>
                    <Outlet />
                </main>
            </div>
        </div>
    );
};

export default SellerLayout;
