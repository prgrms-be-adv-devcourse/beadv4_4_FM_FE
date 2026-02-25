import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { adminApi, type SellerRequestItem } from '../../../api/admin';
import { adminUserApi, type AdminBuyerResponse, type AdminSellerResponse } from '../../../api/adminUser';
import { authApi } from '../../../api/auth';
import Modal from '../../../components/Modal';

const AdminPage = () => {
    type MenuType = 'requests' | 'buyers' | 'sellers';
    const [activeMenu, setActiveMenu] = useState<MenuType>('requests');
    const [page, setPage] = useState(0);

    const [requests, setRequests] = useState<SellerRequestItem[]>([]);
    const [buyers, setBuyers] = useState<AdminBuyerResponse[]>([]);
    const [sellers, setSellers] = useState<AdminSellerResponse[]>([]);
    const [totalPages, setTotalPages] = useState(0);

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    // Modal states
    const [modalData, setModalData] = useState<{ isOpen: boolean; title: string; message: string; action: () => void }>({
        isOpen: false,
        title: '',
        message: '',
        action: () => { }
    });

    const navigate = useNavigate();

    const handleLogout = async () => {
        try {
            await authApi.logout();
        } catch (e) {
            console.error('Logout error:', e);
        } finally {
            localStorage.removeItem('accessToken');
            localStorage.removeItem('nickname');
            navigate('/');
        }
    };

    const fetchRequests = async () => {
        try {
            setLoading(true);
            const response = await adminApi.getSellerRequests();
            if (response.resultCode.startsWith('S-')) {
                setRequests(response.data);
            } else {
                setError(response.msg);
            }
        } catch (err: any) {
            setError(err.message || '목록을 불러오는 데 실패했습니다.');
        } finally {
            setLoading(false);
        }
    };

    const fetchBuyers = async (pageNum: number) => {
        try {
            setLoading(true);
            const res = await adminUserApi.getBuyers(pageNum, 10);
            if (res.resultCode.startsWith('200')) {
                setBuyers(res.data.content);
                setTotalPages(res.data.totalPages);
            } else {
                setError(res.msg);
            }
        } catch (err: any) {
            setError(err.message || '목록을 불러오는 데 실패했습니다.');
        } finally {
            setLoading(false);
        }
    };

    const fetchSellers = async (pageNum: number) => {
        try {
            setLoading(true);
            const res = await adminUserApi.getSellers(pageNum, 10);
            if (res.resultCode.startsWith('200')) {
                setSellers(res.data.content);
                setTotalPages(res.data.totalPages);
            } else {
                setError(res.msg);
            }
        } catch (err: any) {
            setError(err.message || '목록을 불러오는 데 실패했습니다.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        setPage(0);
        setError('');
        if (activeMenu === 'requests') {
            fetchRequests();
        } else if (activeMenu === 'buyers') {
            fetchBuyers(0);
        } else if (activeMenu === 'sellers') {
            fetchSellers(0);
        }
    }, [activeMenu]);

    useEffect(() => {
        if (activeMenu === 'buyers') {
            fetchBuyers(page);
        } else if (activeMenu === 'sellers') {
            fetchSellers(page);
        }
    }, [page]);

    const handleApprove = (id: number, storeName: string) => {
        setModalData({
            isOpen: true,
            title: '신청 승인',
            message: `${storeName}의 판매자 신청을 승인하시겠습니까?`,
            action: async () => {
                try {
                    setModalData(prev => ({ ...prev, isOpen: false }));
                    const res = await adminApi.approveSellerRequest(id);
                    if (res.resultCode.startsWith('S-')) {
                        alert('승인되었습니다.');
                        window.location.reload();
                    } else {
                        alert('승인 실패: ' + res.msg);
                    }
                } catch (e: any) {
                    alert('승인 중 오류 발생: ' + (e.response?.data?.msg || e.message));
                }
            }
        });
    };

    const handleReject = (id: number, storeName: string) => {
        setModalData({
            isOpen: true,
            title: '신청 반려',
            message: `${storeName}의 판매자 신청을 반려하시겠습니까?`,
            action: async () => {
                try {
                    setModalData(prev => ({ ...prev, isOpen: false }));
                    const res = await adminApi.rejectSellerRequest(id);
                    if (res.resultCode.startsWith('S-')) {
                        alert('반려되었습니다.');
                        fetchRequests();
                    } else {
                        alert('반려 실패: ' + res.msg);
                    }
                } catch (e: any) {
                    alert('반려 중 오류 발생: ' + (e.response?.data?.msg || e.message));
                }
            }
        });
    };

    const handleSuspend = (userId: number, name: string) => {
        setModalData({
            isOpen: true,
            title: '회원 정지',
            message: `${name} 회원을 정지하시겠습니까?`,
            action: async () => {
                try {
                    setModalData(prev => ({ ...prev, isOpen: false }));
                    const res = await adminUserApi.suspendUser(userId);
                    if (res.resultCode.startsWith('200')) {
                        alert('정지 처리되었습니다.');
                        if (activeMenu === 'buyers') fetchBuyers(page);
                        if (activeMenu === 'sellers') fetchSellers(page);
                    } else {
                        alert('정지 실패: ' + res.msg);
                    }
                } catch (e: any) {
                    alert('오류 발생: ' + (e.response?.data?.msg || e.message));
                }
            }
        });
    };

    const handleActivate = (userId: number, name: string) => {
        setModalData({
            isOpen: true,
            title: '회원 정지 해제',
            message: `${name} 회원의 정지를 해제하시겠습니까?`,
            action: async () => {
                try {
                    setModalData(prev => ({ ...prev, isOpen: false }));
                    const res = await adminUserApi.activateUser(userId);
                    if (res.resultCode.startsWith('200')) {
                        alert('정지 해제되었습니다.');
                        if (activeMenu === 'buyers') fetchBuyers(page);
                        if (activeMenu === 'sellers') fetchSellers(page);
                    } else {
                        alert('정지 해제 실패: ' + res.msg);
                    }
                } catch (e: any) {
                    alert('오류 발생: ' + (e.response?.data?.msg || e.message));
                }
            }
        });
    };

    return (
        <div style={{ display: 'flex', minHeight: '100vh', paddingTop: '0', backgroundColor: '#f4f5f7' }}>
            {/* Sidebar (Dark gray theme as requested) */}
            <aside style={{ width: '250px', backgroundColor: '#333', color: '#fff', padding: '2rem 1rem', display: 'flex', flexDirection: 'column' }}>
                <div style={{ paddingBottom: '2rem', borderBottom: '1px solid #444', marginBottom: '1rem' }}>
                    <h2 style={{ color: '#fff', fontSize: '1.2rem', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        🛡️ 관리자 메뉴
                    </h2>
                </div>
                <nav style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                    <div
                        onClick={() => setActiveMenu('requests')}
                        style={{
                            padding: '1rem',
                            backgroundColor: activeMenu === 'requests' ? '#444' : 'transparent',
                            color: activeMenu === 'requests' ? '#fff' : '#aaa',
                            borderRadius: '16px',
                            cursor: 'pointer',
                            fontWeight: activeMenu === 'requests' ? 'bold' : '500'
                        }}>
                        판매자 신청 목록
                    </div>
                    <div
                        onClick={() => setActiveMenu('buyers')}
                        style={{
                            padding: '1rem',
                            backgroundColor: activeMenu === 'buyers' ? '#444' : 'transparent',
                            color: activeMenu === 'buyers' ? '#fff' : '#aaa',
                            borderRadius: '16px',
                            cursor: 'pointer',
                            fontWeight: activeMenu === 'buyers' ? 'bold' : '500'
                        }}>
                        구매자 관리
                    </div>
                    <div
                        onClick={() => setActiveMenu('sellers')}
                        style={{
                            padding: '1rem',
                            backgroundColor: activeMenu === 'sellers' ? '#444' : 'transparent',
                            color: activeMenu === 'sellers' ? '#fff' : '#aaa',
                            borderRadius: '16px',
                            cursor: 'pointer',
                            fontWeight: activeMenu === 'sellers' ? 'bold' : '500'
                        }}>
                        판매자 관리
                    </div>
                    {/* Placeholder for future menus */}
                    <div style={{ padding: '1rem', color: '#666', cursor: 'not-allowed' }}>게시글 관리 (준비중)</div>
                    <div style={{ padding: '1rem', color: '#999', cursor: 'pointer' }}>게시글 관리 (준비중)</div>
                </nav>
            </aside>

            {/* Main Content */}
            <main style={{ flex: 1, padding: '2rem 3rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                    <h1 style={{ fontSize: '1.8rem', fontWeight: 'bold', color: '#333' }}>
                        {activeMenu === 'requests' ? '판매자 신청 관리' : activeMenu === 'buyers' ? '구매자 관리' : '판매자 관리'}
                    </h1>
                    <button
                        onClick={handleLogout}
                        style={{
                            padding: '0.5rem 1rem',
                            backgroundColor: '#fff',
                            border: '1px solid #ddd',
                            borderRadius: '50px',
                            color: '#555',
                            fontWeight: '500',
                            cursor: 'pointer',
                            transition: 'all 0.2s'
                        }}
                        onMouseOver={(e) => { e.currentTarget.style.backgroundColor = '#f9f9f9'; e.currentTarget.style.color = '#333'; }}
                        onMouseOut={(e) => { e.currentTarget.style.backgroundColor = '#fff'; e.currentTarget.style.color = '#555'; }}
                    >
                        로그아웃
                    </button>
                </div>

                <div style={{ backgroundColor: '#fff', borderRadius: '24px', boxShadow: '0 4px 6px rgba(0,0,0,0.05)', padding: '2rem' }}>
                    {activeMenu === 'requests' && (
                        <>
                            <h3 style={{ fontSize: '1.2rem', fontWeight: 'bold', marginBottom: '1.5rem', borderBottom: '2px solid #eee', paddingBottom: '0.5rem' }}>
                                대기 중인 요청서 ({requests.length}건)
                            </h3>

                            {loading ? (
                                <div style={{ textAlign: 'center', padding: '3rem', color: '#666' }}>로딩 중...</div>
                            ) : error ? (
                                <div style={{ textAlign: 'center', padding: '3rem', color: 'red' }}>{error}</div>
                            ) : requests.length === 0 ? (
                                <div style={{ textAlign: 'center', padding: '4rem', color: '#999', backgroundColor: '#fafafa', borderRadius: '16px' }}>
                                    현재 대기 중인 판매자 신청이 없습니다.
                                </div>
                            ) : (
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                                    {requests.map((req) => (
                                        <div key={req.id} style={{
                                            border: '1px solid #eaeaea',
                                            borderRadius: '20px',
                                            padding: '1.5rem',
                                            display: 'flex',
                                            justifyContent: 'space-between',
                                            alignItems: 'center',
                                            backgroundColor: '#fff',
                                            transition: 'all 0.2s',
                                            boxShadow: '0 2px 4px rgba(0,0,0,0.02)'
                                        }}>
                                            <div style={{ flex: 1 }}>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '0.75rem' }}>
                                                    <span style={{
                                                        fontSize: '0.8rem',
                                                        padding: '0.2rem 0.6rem',
                                                        backgroundColor: req.sellerType === 'BUSINESS' ? '#eef2ff' : '#f0fdf4',
                                                        color: req.sellerType === 'BUSINESS' ? '#4f46e5' : '#16a34a',
                                                        borderRadius: '20px',
                                                        fontWeight: 'bold'
                                                    }}>
                                                        {req.sellerType === 'BUSINESS' ? '법인판매자' : '개인판매자'}
                                                    </span>
                                                    <strong style={{ fontSize: '1.2rem' }}>{req.storeName}</strong>
                                                    {req.businessNum && <span style={{ color: '#666', fontSize: '0.9rem' }}>(사업자번호: {req.businessNum})</span>}
                                                </div>

                                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem', fontSize: '0.95rem', color: '#555' }}>
                                                    <div><strong>대표자:</strong> {req.representativeName}</div>
                                                    <div><strong>연락처:</strong> {req.contactPhone}</div>
                                                    <div><strong>이메일:</strong> {req.contactEmail}</div>
                                                    <div style={{ gridColumn: '1 / -1' }}><strong>주소:</strong> {req.address1} {req.address2}</div>
                                                    <div style={{ gridColumn: '1 / -1', color: '#999', fontSize: '0.85rem', marginTop: '0.25rem' }}>
                                                        <strong>신청일시:</strong> {new Date(req.createdAt).toLocaleString()}
                                                    </div>
                                                </div>
                                            </div>

                                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginLeft: '2rem' }}>
                                                <button
                                                    onClick={() => handleApprove(req.id, req.storeName)}
                                                    style={{
                                                        backgroundColor: '#f0fdf4',
                                                        color: '#16a34a',
                                                        border: '1px solid #bbf7d0',
                                                        padding: '0.6rem 2rem',
                                                        borderRadius: '50px',
                                                        fontWeight: 'bold',
                                                        cursor: 'pointer',
                                                        transition: 'all 0.2s'
                                                    }}
                                                    onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#dcfce7'}
                                                    onMouseOut={(e) => e.currentTarget.style.backgroundColor = '#f0fdf4'}
                                                >
                                                    승인
                                                </button>
                                                <button
                                                    onClick={() => handleReject(req.id, req.storeName)}
                                                    style={{
                                                        backgroundColor: '#fef2f2',
                                                        color: '#dc2626',
                                                        border: '1px solid #fecaca',
                                                        padding: '0.6rem 2rem',
                                                        borderRadius: '50px',
                                                        fontWeight: 'bold',
                                                        cursor: 'pointer',
                                                        transition: 'all 0.2s'
                                                    }}
                                                    onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#fee2e2'}
                                                    onMouseOut={(e) => e.currentTarget.style.backgroundColor = '#fef2f2'}
                                                >
                                                    반려
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </>
                    )}

                    {activeMenu === 'buyers' && (
                        <>
                            <h3 style={{ fontSize: '1.2rem', fontWeight: 'bold', marginBottom: '1.5rem', borderBottom: '2px solid #eee', paddingBottom: '0.5rem' }}>구매자 목록</h3>
                            {loading ? (
                                <div style={{ textAlign: 'center', padding: '3rem', color: '#666' }}>로딩 중...</div>
                            ) : error ? (
                                <div style={{ textAlign: 'center', padding: '3rem', color: 'red' }}>{error}</div>
                            ) : buyers.length === 0 ? (
                                <div style={{ textAlign: 'center', padding: '4rem', color: '#999', backgroundColor: '#fafafa', borderRadius: '16px' }}>구매자가 없습니다.</div>
                            ) : (
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                                    {buyers.map((buyer) => (
                                        <div key={buyer.userId} style={{ border: '1px solid #eaeaea', borderRadius: '16px', padding: '1.2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: buyer.status === 'SUSPENDED' ? '#fff1f2' : '#fff' }}>
                                            <div style={{ flex: 1 }}>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem', marginBottom: '0.5rem' }}>
                                                    <span style={{ fontSize: '0.8rem', padding: '0.2rem 0.5rem', backgroundColor: buyer.status === 'ACTIVE' ? '#dcfce7' : buyer.status === 'SUSPENDED' ? '#fee2e2' : '#f1f5f9', color: buyer.status === 'ACTIVE' ? '#166534' : buyer.status === 'SUSPENDED' ? '#991b1b' : '#475569', borderRadius: '12px', fontWeight: 'bold' }}>
                                                        {buyer.status === 'ACTIVE' ? '정상' : buyer.status === 'SUSPENDED' ? '정지됨' : buyer.status === 'PENDING' ? '대기중' : '탈퇴'}
                                                    </span>
                                                    <strong style={{ fontSize: '1.1rem' }}>{buyer.name} ({buyer.nickname})</strong>
                                                </div>
                                                <div style={{ fontSize: '0.9rem', color: '#555' }}>
                                                    <div><strong>이메일:</strong> {buyer.email}</div>
                                                    <div style={{ marginTop: '0.2rem', color: '#999', fontSize: '0.8rem' }}><strong>가입일:</strong> {new Date(buyer.createdAt).toLocaleString()}</div>
                                                </div>
                                            </div>
                                            <div>
                                                {buyer.status === 'ACTIVE' && (
                                                    <button onClick={() => handleSuspend(buyer.userId, buyer.name)} style={{ padding: '0.5rem 1.2rem', backgroundColor: '#fef2f2', color: '#dc2626', border: '1px solid #fecaca', borderRadius: '8px', cursor: 'pointer', fontWeight: 600 }}>정지</button>
                                                )}
                                                {buyer.status === 'SUSPENDED' && (
                                                    <button onClick={() => handleActivate(buyer.userId, buyer.name)} style={{ padding: '0.5rem 1.2rem', backgroundColor: '#f0fdf4', color: '#16a34a', border: '1px solid #bbf7d0', borderRadius: '8px', cursor: 'pointer', fontWeight: 600 }}>정지 해제</button>
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                    {/* Pagination */}
                                    {totalPages > 1 && (
                                        <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem', marginTop: '1.5rem' }}>
                                            <button onClick={() => setPage(p => Math.max(0, p - 1))} disabled={page === 0} style={{ padding: '0.4rem 1rem', border: '1px solid #ddd', borderRadius: '6px', background: page === 0 ? '#f0f0f0' : '#fff', cursor: page === 0 ? 'not-allowed' : 'pointer' }}>이전</button>
                                            <span style={{ alignSelf: 'center' }}>{page + 1} / {totalPages}</span>
                                            <button onClick={() => setPage(p => Math.min(totalPages - 1, p + 1))} disabled={page >= totalPages - 1} style={{ padding: '0.4rem 1rem', border: '1px solid #ddd', borderRadius: '6px', background: page >= totalPages - 1 ? '#f0f0f0' : '#fff', cursor: page >= totalPages - 1 ? 'not-allowed' : 'pointer' }}>다음</button>
                                        </div>
                                    )}
                                </div>
                            )}
                        </>
                    )}

                    {activeMenu === 'sellers' && (
                        <>
                            <h3 style={{ fontSize: '1.2rem', fontWeight: 'bold', marginBottom: '1.5rem', borderBottom: '2px solid #eee', paddingBottom: '0.5rem' }}>판매자 목록</h3>
                            {loading ? (
                                <div style={{ textAlign: 'center', padding: '3rem', color: '#666' }}>로딩 중...</div>
                            ) : error ? (
                                <div style={{ textAlign: 'center', padding: '3rem', color: 'red' }}>{error}</div>
                            ) : sellers.length === 0 ? (
                                <div style={{ textAlign: 'center', padding: '4rem', color: '#999', backgroundColor: '#fafafa', borderRadius: '16px' }}>판매자가 없습니다.</div>
                            ) : (
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                                    {sellers.map((seller) => (
                                        <div key={seller.sellerId} style={{ border: '1px solid #eaeaea', borderRadius: '16px', padding: '1.2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: seller.userStatus === 'SUSPENDED' ? '#fff1f2' : '#fff' }}>
                                            <div style={{ flex: 1 }}>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem', marginBottom: '0.5rem' }}>
                                                    <span style={{ fontSize: '0.8rem', padding: '0.2rem 0.5rem', backgroundColor: seller.userStatus === 'ACTIVE' ? '#dcfce7' : seller.userStatus === 'SUSPENDED' ? '#fee2e2' : '#f1f5f9', color: seller.userStatus === 'ACTIVE' ? '#166534' : seller.userStatus === 'SUSPENDED' ? '#991b1b' : '#475569', borderRadius: '12px', fontWeight: 'bold' }}>
                                                        {seller.userStatus === 'ACTIVE' ? '정상' : seller.userStatus === 'SUSPENDED' ? '정지됨' : seller.userStatus === 'PENDING' ? '대기중' : '탈퇴'}
                                                    </span>
                                                    <span style={{ fontSize: '0.8rem', padding: '0.2rem 0.5rem', backgroundColor: seller.sellerType === 'BUSINESS' ? '#eef2ff' : '#f8fafc', color: seller.sellerType === 'BUSINESS' ? '#4f46e5' : '#475569', borderRadius: '12px', fontWeight: 'bold' }}>
                                                        {seller.sellerType === 'BUSINESS' ? '법인' : '개인'}
                                                    </span>
                                                    <strong style={{ fontSize: '1.1rem' }}>{seller.storeName}</strong>
                                                </div>
                                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.3rem', fontSize: '0.9rem', color: '#555' }}>
                                                    <div><strong>대표자:</strong> {seller.name} ({seller.nickname})</div>
                                                    <div><strong>계정 이메일:</strong> {seller.email}</div>
                                                    <div><strong>상점 연락처:</strong> {seller.contactPhone}</div>
                                                    <div><strong>상점 이메일:</strong> {seller.contactEmail}</div>
                                                    <div style={{ gridColumn: '1 / -1', marginTop: '0.2rem', color: '#999', fontSize: '0.8rem' }}><strong>가입일:</strong> {new Date(seller.createdAt).toLocaleString()}</div>
                                                </div>
                                            </div>
                                            <div>
                                                {seller.userStatus === 'ACTIVE' && (
                                                    <button onClick={() => handleSuspend(seller.userId, seller.storeName)} style={{ padding: '0.5rem 1.2rem', backgroundColor: '#fef2f2', color: '#dc2626', border: '1px solid #fecaca', borderRadius: '8px', cursor: 'pointer', fontWeight: 600 }}>정지</button>
                                                )}
                                                {seller.userStatus === 'SUSPENDED' && (
                                                    <button onClick={() => handleActivate(seller.userId, seller.storeName)} style={{ padding: '0.5rem 1.2rem', backgroundColor: '#f0fdf4', color: '#16a34a', border: '1px solid #bbf7d0', borderRadius: '8px', cursor: 'pointer', fontWeight: 600 }}>정지 해제</button>
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                    {/* Pagination */}
                                    {totalPages > 1 && (
                                        <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem', marginTop: '1.5rem' }}>
                                            <button onClick={() => setPage(p => Math.max(0, p - 1))} disabled={page === 0} style={{ padding: '0.4rem 1rem', border: '1px solid #ddd', borderRadius: '6px', background: page === 0 ? '#f0f0f0' : '#fff', cursor: page === 0 ? 'not-allowed' : 'pointer' }}>이전</button>
                                            <span style={{ alignSelf: 'center' }}>{page + 1} / {totalPages}</span>
                                            <button onClick={() => setPage(p => Math.min(totalPages - 1, p + 1))} disabled={page >= totalPages - 1} style={{ padding: '0.4rem 1rem', border: '1px solid #ddd', borderRadius: '6px', background: page >= totalPages - 1 ? '#f0f0f0' : '#fff', cursor: page >= totalPages - 1 ? 'not-allowed' : 'pointer' }}>다음</button>
                                        </div>
                                    )}
                                </div>
                            )}
                        </>
                    )}
                </div>
            </main>

            <Modal
                isOpen={modalData.isOpen}
                title={modalData.title}
                message={modalData.message}
                onConfirm={modalData.action}
            />
        </div>
    );
};

export default AdminPage;
