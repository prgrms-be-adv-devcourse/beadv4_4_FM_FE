import { jwtDecode } from 'jwt-decode';

interface DecodedToken {
    sub?: string;
    role?: string | string[];
    roles?: string[];
    authorities?: string[];
    auth?: string | string[];
    exp?: number;
    iat?: number;
    [key: string]: any;
}

export const isTokenExpired = (token: string): boolean => {
    try {
        const decoded = jwtDecode<DecodedToken>(token);
        if (!decoded.exp) return false;

        const now = Math.floor(Date.now() / 1000);
        const buffer = 300; // 5 minute buffer for clock skew

        const isExpired = decoded.exp < (now + buffer);
        if (isExpired) {
            console.warn(`[Auth] Token expired check: exp(${decoded.exp}) < now(${now}) + buffer(${buffer})`);
        }
        return isExpired;
    } catch {
        return true;
    }
};

export const getUserIdFromToken = (): number | null => {
    const token = localStorage.getItem('accessToken');
    if (!token) return null;

    if (isTokenExpired(token)) return null;

    try {
        const decoded = jwtDecode<DecodedToken>(token);
        return decoded.sub ? Number(decoded.sub) : null;
    } catch (e) {
        console.error("Failed to decode token", e);
        return null;
    }
};

export const getRolesFromToken = (providedToken?: string): string[] => {
    const token = providedToken || localStorage.getItem('accessToken');
    if (!token) return [];

    // Check if token is expired
    if (isTokenExpired(token)) {
        console.warn("[Auth] Token is expired. Clearing local storage.");
        localStorage.removeItem('accessToken');
        localStorage.removeItem('nickname');
        return [];
    }

    try {
        const decoded = jwtDecode<DecodedToken>(token);
        console.log("[Auth] Decoded Token Payload:", decoded);

        // Search in multiple common keys for roles
        const rawRoles = decoded.roles || decoded.role || decoded.authorities || decoded.auth || [];

        const rolesArray = Array.isArray(rawRoles) ? rawRoles : [rawRoles];
        const normalizedRoles = rolesArray
            .filter(r => r != null)
            .map(r => String(r).toUpperCase());

        console.log("[Auth] Extracted Roles:", normalizedRoles);
        return normalizedRoles;
    } catch (e) {
        console.error("[Auth] Failed to decode token", e);
        return [];
    }
};

// Legacy support or for simple checks
export const hasRole = (role: string): boolean => {
    const roles = getRolesFromToken();
    const searchRole = role.toUpperCase();
    return roles.includes(searchRole) || roles.includes(`ROLE_${searchRole}`);
};
