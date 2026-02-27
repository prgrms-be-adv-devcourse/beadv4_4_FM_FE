import { Navigate, Outlet } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode';

interface DecodedToken {
    sub: string;
    iat: number;
    exp: number;
    roles?: string[]; // Made optional just in case it's missing on older tokens
    role?: string;    // Legacy support
    seller_id?: number;
}

const SellerProtectedRoute = () => {
    const token = localStorage.getItem('accessToken');

    if (!token) {
        return <Navigate to="/login" replace />;
    }

    try {
        const decoded = jwtDecode<DecodedToken>(token);

        // 권한 체크 로직:
        // 1. roles 배열이 있다면 'SELLER'가 포함되어 있는지 확인
        // 2. 과거 호환성을 위해 role 속성이 'SELLER'인지도 확인
        const isSeller =
            (decoded.roles && decoded.roles.includes('SELLER')) ||
            decoded.role === 'SELLER';

        if (!isSeller) {
            alert('판매자 권한이 없습니다. 마이페이지에서 판매자 신청을 해주세요.');
            return <Navigate to="/mypage" replace />;
        }

        // 권한이 SELLER (혹은 다른 허용된 롤) 라면 렌더링
        return <Outlet />;
    } catch (error) {
        console.error('Invalid token format:', error);
        // 토큰 디코딩 실패 시 로그인 페이지로
        localStorage.removeItem('accessToken');
        return <Navigate to="/login" replace />;
    }
};

export default SellerProtectedRoute;
