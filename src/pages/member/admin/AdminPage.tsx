import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { adminApi, type SellerRequestItem } from '../../../api/admin';
import { authApi } from '../../../api/auth';
import Modal from '../../../components/Modal';

const AdminPage = () => {
    const [requests, setRequests] = useState<SellerRequestItem[]>([]);
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

    useEffect(() => {
        fetchRequests();
    }, []);

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
                        // 중요: 판매자 승인이 완료되면 새로운 권한(SELLER)이 포함된 토큰이 발급됩니다.
                        if (res.data.accessToken) {
                            localStorage.setItem('accessToken', res.data.accessToken);
                            alert('승인되었습니다. 이제 판매자 권한이 부여되었습니다.');
                            window.location.reload(); // 토큰 갱신 및 UI 반영을 위한 리로드
                        } else {
                            alert('승인되었습니다.');
                            window.location.reload();
                        }
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
                        window.location.reload();
                    } else {
                        alert('반려 실패: ' + res.msg);
                    }
                } catch (e: any) {
                    alert('반려 중 오류 발생: ' + (e.response?.data?.msg || e.message));
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
                    <div style={{
                        padding: '1rem',
                        backgroundColor: '#444',
                        borderRadius: '16px',
                        cursor: 'pointer',
                        fontWeight: '500'
                    }}>
                        판매자 신청 목록
                    </div>
                    {/* Placeholder for future menus */}
                    <div style={{ padding: '1rem', color: '#999', cursor: 'pointer' }}>사용자 관리 (준비중)</div>
                    <div style={{ padding: '1rem', color: '#999', cursor: 'pointer' }}>게시글 관리 (준비중)</div>
                </nav>
            </aside>

            {/* Main Content */}
            <main style={{ flex: 1, padding: '2rem 3rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                    <h1 style={{ fontSize: '1.8rem', fontWeight: 'bold', color: '#333' }}>판매자 신청 관리</h1>
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
