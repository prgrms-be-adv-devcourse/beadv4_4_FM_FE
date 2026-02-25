import { useState, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { authApi } from '../../api/auth';

const LoginPage = () => {
    const navigate = useNavigate();
    const [searchParams, setSearchParams] = useSearchParams();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');

    useEffect(() => {
        if (searchParams.get('status') === 'error') {
            alert('다시 시도해주세요');
            searchParams.delete('status');
            setSearchParams(searchParams, { replace: true });
        }
    }, [searchParams, setSearchParams]);

    const handleLogin = async () => {
        if (email === 'admin' && password === 'admin') {
            navigate('/admin/login');
            return;
        }

        try {
            const response = await authApi.login({ email, password });

            // Support both wrapped `RsData` and flat response formats
            const isSuccess = response.resultCode ? (response.resultCode.startsWith('S-200') || response.resultCode.startsWith('200')) : true;
            const responseData = response.data || (response as any);
            const token = responseData.accessToken || (response as any).accessToken;

            if (isSuccess && token) {
                localStorage.setItem('accessToken', token);
                // refreshToken is now handled by HttpOnly cookie
                if (responseData.nickname) {
                    localStorage.setItem('nickname', responseData.nickname);
                }

                const role = responseData.role || (response as any).role;
                if (role) {
                    localStorage.setItem('role', role);
                }

                // Redirect admin users to the admin dashboard
                const upperRole = role ? role.toUpperCase() : '';
                if (upperRole === 'ADMIN' || upperRole === 'ROLE_ADMIN') {
                    navigate('/admin');
                } else {
                    navigate('/');
                }
            } else {
                setError('로그인 실패: ' + (response.msg || '토큰을 받지 못했습니다.'));
            }
        } catch (err: any) {
            console.error('Login error details:', err);
            console.error('Response data:', err.response?.data);

            const errorMsg = err.response?.data?.msg || err.response?.data?.message || err.message || '로그인 중 오류가 발생했습니다.';
            setError(`로그인 실패: ${errorMsg}`);
        }
    };

    return (
        <div style={{ maxWidth: '400px', margin: '4rem auto', marginTop: '140px' }}>
            <h1 style={{ textAlign: 'center', marginBottom: '2rem' }}>로그인</h1>

            <div className="card">
                <form style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }} onSubmit={(e) => { e.preventDefault(); handleLogin(); }}>
                    <div>
                        <label style={{ display: 'block', marginBottom: '0.5rem' }}>이메일</label>
                        <input
                            type="text"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="이메일을 입력하세요"
                            style={{ width: '100%', padding: '0.75rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)' }}
                        />
                    </div>

                    <div>
                        <label style={{ display: 'block', marginBottom: '0.5rem' }}>비밀번호</label>
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="비밀번호를 입력하세요"
                            style={{ width: '100%', padding: '0.75rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)' }}
                        />
                    </div>

                    {error && <div style={{ color: 'var(--danger-color)', fontSize: '0.9rem' }}>{error}</div>}

                    <button type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: '1rem', borderRadius: '50px' }}>
                        로그인
                    </button>
                </form>

                <div style={{ marginTop: '1rem', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                    <button
                        type="button"
                        onClick={() => window.location.href = 'http://localhost:8086/oauth2/authorization/google'}
                        style={{
                            width: '100%',
                            padding: '0.75rem',
                            borderRadius: '50px',
                            border: '1px solid #ddd',
                            backgroundColor: '#fff',
                            color: '#333',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '0.5rem',
                            cursor: 'pointer',
                            fontWeight: '500'
                        }}
                    >
                        <svg width="18" height="18" viewBox="0 0 18 18" xmlns="http://www.w3.org/2000/svg">
                            <path d="M17.64 9.20455C17.64 8.56636 17.5827 7.95273 17.4764 7.36364H9V10.845H13.8436C13.635 11.97 13.0009 12.9232 12.0477 13.5614V15.8195H14.9564C16.6582 14.2527 17.64 11.9455 17.64 9.20455Z" fill="#4285F4" />
                            <path d="M9 18C11.43 18 13.4673 17.1941 14.9564 15.8195L12.0477 13.5614C11.2418 14.1014 10.2109 14.4205 9 14.4205C6.65591 14.4205 4.67182 12.8373 3.96409 10.71H0.957275V13.0418C2.43818 15.9832 5.48182 18 9 18Z" fill="#34A853" />
                            <path d="M3.96409 10.71C3.78409 10.17 3.68182 9.59318 3.68182 9C3.68182 8.40682 3.78409 7.83 3.96409 7.29V4.95818H0.957275C0.347727 6.17318 0 7.54773 0 9C0 10.4523 0.347727 11.8268 0.957275 13.0418L3.96409 10.71Z" fill="#FBBC05" />
                            <path d="M9 3.57955C10.3214 3.57955 11.5077 4.03364 12.4405 4.92545L15.0218 2.34409C13.4632 0.891818 11.4259 0 9 0C5.48182 0 2.43818 2.01682 0.957275 4.95818L3.96409 7.29C4.67182 5.16273 6.65591 3.57955 9 3.57955Z" fill="#EA4335" />
                        </svg>
                        Google로 시작하기
                    </button>
                    <button
                        type="button"
                        onClick={() => window.location.href = 'http://localhost:8086/oauth2/authorization/kakao'}
                        style={{
                            width: '100%',
                            padding: '0.75rem',
                            borderRadius: '50px',
                            border: 'none',
                            backgroundColor: '#FEE500',
                            color: '#191919',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '0.5rem',
                            cursor: 'pointer',
                            fontWeight: '500'
                        }}
                    >
                        <svg width="18" height="18" viewBox="0 0 18 18" xmlns="http://www.w3.org/2000/svg">
                            <path d="M9 2C4.029 2 0 5.15 0 9.038c0 2.508 1.637 4.706 4.12 5.922-.142.482-.519 1.83-.553 1.968-.043.167.06.162.128.118.053-.035 1.705-1.144 2.39-1.613.626.084 1.258.125 1.915.125 4.971 0 9-3.15 9-7.038C18 5.15 13.971 2 9 2z" fill="#000000" />
                        </svg>
                        카카오로 시작하기
                    </button>
                </div>

                <div style={{ marginTop: '1.5rem', textAlign: 'center', fontSize: '0.9rem' }}>
                    계정이 없으신가요? <Link to="/signup" style={{ color: 'var(--primary-color)', fontWeight: 'bold' }}>회원가입</Link>
                </div>
            </div>
        </div>
    );
};

export default LoginPage;
