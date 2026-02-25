import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { authApi } from '../../api/auth';

const AdminLoginPage = () => {
    const navigate = useNavigate();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');

    const handleAdminLogin = async () => {
        try {
            const response = await authApi.adminLogin({ email, password });

            // Support both wrapped `RsData` and flat response formats
            const isSuccess = response.resultCode ? (response.resultCode.startsWith('S-200') || response.resultCode.startsWith('200')) : true;
            const responseData = response.data || (response as any);
            const token = responseData.accessToken || (response as any).accessToken;

            if (isSuccess && token) {
                localStorage.setItem('accessToken', token);
                if (responseData.nickname) {
                    localStorage.setItem('nickname', responseData.nickname);
                }

                const role = responseData.role || (response as any).role;
                if (role) {
                    localStorage.setItem('role', role);
                }

                // Check role explicitly
                const upperRole = role ? role.toUpperCase() : '';
                if (upperRole === 'ADMIN' || upperRole === 'ROLE_ADMIN') {
                    navigate('/admin');
                } else {
                    setError(`관리자 권한이 없는 계정입니다. (role: ${role || '없음'})`);
                    localStorage.removeItem('accessToken');
                    localStorage.removeItem('nickname');
                    localStorage.removeItem('role');
                }
            } else {
                setError('로그인 실패: ' + (response.msg || '토큰을 받지 못했습니다.'));
            }
        } catch (err: any) {
            const errorMsg = err.response?.data?.msg || err.response?.data?.message || err.message || '로그인 중 오류가 발생했습니다.';
            setError(`로그인 실패: ${errorMsg}`);
        }
    };

    return (
        <div style={{ maxWidth: '450px', margin: '4rem auto', marginTop: '140px', backgroundColor: '#222', padding: '2.5rem', borderRadius: '16px', color: '#fff', boxShadow: '0 10px 25px rgba(0,0,0,0.5)' }}>
            <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
                <h1 style={{ fontSize: '1.8rem', fontWeight: 'bold', margin: 0, color: '#f87171' }}>🛡️ 관리자 전용 로그인</h1>
                <p style={{ color: '#aaa', marginTop: '0.5rem', fontSize: '0.9rem' }}>관리자 계정 정보를 입력해주세요.</p>
            </div>

            <form style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem' }} onSubmit={(e) => { e.preventDefault(); handleAdminLogin(); }}>
                <div>
                    <label style={{ display: 'block', marginBottom: '0.5rem', color: '#ddd' }}>관리자 이메일</label>
                    <input
                        type="text"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="이메일을 입력하세요"
                        style={{ width: '100%', padding: '0.8rem', borderRadius: '8px', border: '1px solid #444', backgroundColor: '#333', color: '#fff', outline: 'none' }}
                    />
                </div>

                <div>
                    <label style={{ display: 'block', marginBottom: '0.5rem', color: '#ddd' }}>관리자 비밀번호</label>
                    <input
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="비밀번호를 입력하세요"
                        style={{ width: '100%', padding: '0.8rem', borderRadius: '8px', border: '1px solid #444', backgroundColor: '#333', color: '#fff', outline: 'none' }}
                    />
                </div>

                {error && <div style={{ color: '#ef4444', fontSize: '0.9rem', textAlign: 'center' }}>{error}</div>}

                <button
                    type="submit"
                    style={{
                        width: '100%',
                        marginTop: '1rem',
                        padding: '1rem',
                        borderRadius: '8px',
                        backgroundColor: '#dc2626',
                        color: '#fff',
                        border: 'none',
                        fontWeight: 'bold',
                        fontSize: '1rem',
                        cursor: 'pointer',
                        transition: 'background-color 0.2s'
                    }}
                    onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#b91c1c'}
                    onMouseOut={(e) => e.currentTarget.style.backgroundColor = '#dc2626'}
                >
                    관리자 로그인
                </button>
            </form>

            <div style={{ marginTop: '2rem', textAlign: 'center' }}>
                <button
                    onClick={() => navigate('/login')}
                    style={{ background: 'none', border: 'none', color: '#888', textDecoration: 'underline', cursor: 'pointer', fontSize: '0.9rem' }}
                >
                    일반 로그인으로 돌아가기
                </button>
            </div>
        </div>
    );
};

export default AdminLoginPage;
