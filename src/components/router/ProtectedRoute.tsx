import { Navigate, Outlet } from 'react-router-dom';

const ProtectedRoute = () => {
    // Check if the user is authenticated by looking for the accessToken in localStorage
    const isAuthenticated = !!localStorage.getItem('accessToken');

    // If not authenticated, redirect to the login page
    if (!isAuthenticated) {
        return <Navigate to="/login" replace />;
    }

    // If authenticated, render the child routes (Outlet)
    return <Outlet />;
};

export default ProtectedRoute;
