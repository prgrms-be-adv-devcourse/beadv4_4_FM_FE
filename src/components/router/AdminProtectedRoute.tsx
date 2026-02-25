import { Navigate, Outlet } from 'react-router-dom';
import { getRoleFromToken } from '../../utils/auth';

const AdminProtectedRoute = () => {
    const token = localStorage.getItem('accessToken');

    if (!token) {
        return <Navigate to="/login" replace />;
    }

    const role = getRoleFromToken();

    if (role !== 'ADMIN' && role !== 'ROLE_ADMIN') {
        alert('관리자 권한이 없습니다.');
        return <Navigate to="/" replace />;
    }

    // 권한이 관리자이면 렌더링
    return <Outlet />;
};

export default AdminProtectedRoute;
