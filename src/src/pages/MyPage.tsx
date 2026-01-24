import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { memberApi } from '../api/member';
import { walletApi, type UserWalletResponseDto } from '../api/wallet';

const MyPage = () => {
    const navigate = useNavigate();
    const [walletInfo, setWalletInfo] = useState<UserWalletResponseDto | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchInfo = async () => {
            const token = localStorage.getItem('accessToken');
            if (!token) {
                alert('로그인이 필요합니다.');
                navigate('/login');
                return;
            }

            try {
                // 1. Get User ID
                const meResponse = await memberApi.getMe();
                // Check success code (S-200 or 200)
                if (meResponse.resultCode.startsWith('S-200') || meResponse.resultCode.startsWith('200')) {
                    const userId = meResponse.data;

                    // 2. Get User Wallet & Info
                    const walletResponse = await walletApi.getUserWallet(userId);
                    if (walletResponse.resultCode.startsWith('S-200') || walletResponse.resultCode.startsWith('200')) {
                        setWalletInfo(walletResponse.data);
                    }
                }
            } catch (e) {
                console.error('Failed to fetch user info', e);
            } finally {
                setLoading(false);
            }
        };

        fetchInfo();
    }, [navigate]);

    if (loading) return <div className="container" style={{ textAlign: 'center', marginTop: '3rem' }}>로딩 중...</div>;

    if (!walletInfo) return (
        <div className="container" style={{ textAlign: 'center', marginTop: '3rem' }}>
            <p>정보를 불러올 수 없습니다. 다시 로그인해주세요.</p>
            <button onClick={() => navigate('/login')} className="btn btn-primary">로그인 페이지로</button>
        </div>
    );

    const { user, balance } = walletInfo;

    return (
        <div className="container" style={{ maxWidth: '600px', margin: '3rem auto' }}>
            <h1 style={{ marginBottom: '2rem', textAlign: 'center' }}>마이 페이지</h1>

            <div className="card">
                <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', marginBottom: '2rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '2rem' }}>
                    <div style={{
                        width: '80px', height: '80px', borderRadius: '50%', backgroundColor: '#e2e8f0',
                        display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '2rem', color: '#94a3b8'
                    }}>
                        {user.profileImage !== 'default.png' && user.profileImage ? <img src={user.profileImage} alt="Profile" style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover' }} /> : '👤'}
                    </div>
                    <div>
                        <h2 style={{ fontSize: '1.5rem', marginBottom: '0.25rem' }}>{user.nickname} <span style={{ fontSize: '1rem', color: 'var(--text-muted)', fontWeight: 'normal' }}>({user.name})</span></h2>
                        <p style={{ color: 'var(--text-muted)' }}>{user.email}</p>
                    </div>
                </div>

                <div style={{ display: 'grid', gap: '1.5rem' }}>
                    <div>
                        <h3 style={{ fontSize: '1.1rem', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            👛 내 지갑
                        </h3>
                        <div style={{
                            backgroundColor: 'white', border: '1px solid var(--border-color)', padding: '1.5rem', borderRadius: 'var(--radius-md)',
                            display: 'flex', justifyContent: 'space-between', alignItems: 'center'
                        }}>
                            <span style={{ color: 'var(--text-muted)' }}>보유 잔액</span>
                            <span style={{ fontSize: '1.5rem', fontWeight: 'bold', color: 'var(--primary-color)' }}>{balance.toLocaleString()} 원</span>
                        </div>
                    </div>

                    {/* Placeholder for future Order History */}
                    <div>
                        <h3 style={{ fontSize: '1.1rem', marginBottom: '0.5rem' }}>📦 주문 내역</h3>
                        <div style={{ padding: '1rem', backgroundColor: '#f8fafc', borderRadius: 'var(--radius-md)', color: 'var(--text-muted)', textAlign: 'center' }}>
                            아직 주문 내역이 없습니다.
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default MyPage;
