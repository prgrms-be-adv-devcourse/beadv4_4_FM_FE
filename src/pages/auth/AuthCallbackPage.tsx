import { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { getRolesFromToken } from '../../utils/auth';

const AuthCallbackPage = () => {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();

    useEffect(() => {
        const accessToken = searchParams.get('accessToken');
        const isNewUser = searchParams.get('isNewUser') === 'true';

        console.log('AuthCallbackPage triggered:', { accessToken, isNewUser });

        if (accessToken) {
            // 토큰 저장 (RefreshToken은 HttpOnly 쿠키로 설정됨)
            localStorage.setItem('accessToken', accessToken);

            if (isNewUser) {
                // 신규 유저라면 추가 정보 입력 페이지로 이동
                navigate('/signup/complete', { replace: true });
            } else {
                // Redirect based on role
                const userRoles = getRolesFromToken(accessToken);
                console.log('[AuthCallback] User roles after login:', userRoles);

                if (userRoles.includes('ADMIN') || userRoles.includes('ROLE_ADMIN')) {
                    console.log('[AuthCallback] Admin detected. Redirecting to dashboard.');
                    navigate('/admin/dashboard', { replace: true });
                } else {
                    console.log('[AuthCallback] Not an admin. Redirecting to homepage.');
                    navigate('/', { replace: true });
                }
            }
        } else {
            console.error('AccessToken missing in callback URL');
            // 에러 시 로그인 페이지로 이동 (또는 에러 페이지)
            navigate('/login', { replace: true });
        }
    }, [searchParams, navigate]);

    return (
        <div style={{
            height: '100vh',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            flexDirection: 'column',
            gap: '1rem'
        }}>
            <div className="spinner"></div>
            <p>로그인 처리 중입니다...</p>
        </div>
    );
};

export default AuthCallbackPage;
