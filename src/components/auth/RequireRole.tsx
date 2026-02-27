import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { getRolesFromToken } from '../../utils/auth';

interface RequireRoleProps {
    children: React.ReactNode;
    allowedRoles: string[];
    requireAll?: boolean;
}

const RequireRole = ({ children, allowedRoles, requireAll = false }: RequireRoleProps) => {
    const location = useLocation();
    const userRoles = getRolesFromToken();

    // 1. Not logged in (no roles found) -> Redirect to login
    if (userRoles.length === 0) {
        return <Navigate to="/login" state={{ from: location }} replace />;
    }

    // Helper to check for role with or without 'ROLE_' prefix
    const hasRole = (requiredRole: string) => {
        const strictRole = requiredRole.toUpperCase();
        const roleWithPrefix = strictRole.startsWith('ROLE_') ? strictRole : `ROLE_${strictRole}`;
        const roleWithoutPrefix = strictRole.startsWith('ROLE_') ? strictRole.replace('ROLE_', '') : strictRole;
        return userRoles.includes(roleWithPrefix) || userRoles.includes(roleWithoutPrefix);
    };

    // 2. Logged in but check if roles match allowedRoles based on requireAll
    const isAuthorized = requireAll
        ? allowedRoles.every(role => hasRole(role))
        : allowedRoles.some(role => hasRole(role));

    if (!isAuthorized) {
        return <Navigate to="/unauthorized" replace />;
    }

    // 3. Authorized -> Render children
    return <>{children}</>;
};

export default RequireRole;
