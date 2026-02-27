import axios from 'axios';
import { isTokenExpired } from '../utils/auth';

const client = axios.create({
    baseURL: '/api/v1',
    headers: {
        'Content-Type': 'application/json',
    },
    withCredentials: true,
});

// 간단한 JWT 디코드 헬퍼 함수
// const parseJwt = (token: string) => {
//     try {
//         const base64Url = token.split('.')[1];
//         const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
//         const jsonPayload = decodeURIComponent(atob(base64).split('').map(function (c) {
//             return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
//         }).join(''));

//         return JSON.parse(jsonPayload);
//     } catch (e) {
//         return null;
//     }
// };

// Request interceptor to add token and custom headers
client.interceptors.request.use(
    (config) => {
        let token = localStorage.getItem('accessToken');

        // Handle common string traps from local storage
        if (token === 'null' || token === 'undefined') {
            token = null;
            localStorage.removeItem('accessToken');
        }

        const url = config.url || '';
        const isAuthRequest = url.includes('/auth/') || url.includes('/users/signup');
        // Public routes that don't REQUIRE a token (but will use one if available)
        const isPublicGetRequest = config.method === 'get' && (
            url.includes('/products') ||
            url.includes('/categories') ||
            url.includes('/market') ||
            url.includes('/reviews')
        );
        const isPublicRoute = isAuthRequest || isPublicGetRequest || url === '/' || url === '';

        if (token) {
            if (isTokenExpired(token)) {
                console.warn("[Auth] Token expired in interceptor. Redirecting to login.");
                localStorage.removeItem('accessToken');
                localStorage.removeItem('nickname');
                window.location.href = '/login';
                return Promise.reject(new Error('Token expired'));
            }

            // Ensure headers object exists and add Authorization
            config.headers = config.headers || {};
            config.headers['Authorization'] = `Bearer ${token.trim()}`;
            console.log(`[Auth] Header added to ${url}`);
        } else if (!isPublicRoute) {
            console.warn(`[Auth] Missing token for private route: ${url}. Blocking request.`);
            // If we are already on login/signup, don't redirect again in a loop
            if (!window.location.pathname.includes('/login') && !window.location.pathname.includes('/signup')) {
                window.location.href = '/login';
            }
            return Promise.reject(new Error('Authentication required'));
        }

        // If data is FormData, let the browser set the Content-Type with boundary
        if (config.data instanceof FormData) {
            delete config.headers['Content-Type'];
        }

        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Response interceptor to handle auth errors
client.interceptors.response.use(
    (response) => {
        console.log('✅ API Response:', {
            url: response.config.url,
            status: response.status,
            data: response.data
        });
        return response;
    },
    (error) => {
        console.error('❌ API Error:', {
            url: error.config?.url,
            status: error.response?.status,
            data: error.response?.data,
            message: error.message
        });

        const status = error.response?.status;
        const errorMsg = error.response?.data?.msg || error.response?.data?.message || error.response?.data || error.message || '';

        // 게이트웨이나 멤버 서버가 꺼져있어서 Network Error가 났을 때
        if (!error.response) {
            console.error("Network Error: 서버에 연결할 수 없습니다.");
            return Promise.reject(error);
        }

        const isExpired = typeof errorMsg === 'string' && (errorMsg.includes('JWT expired') || errorMsg.includes('토큰'));

        // 401 Unauthorized 또는 명시적인 토큰 만료 메시지만 로그아웃 처리
        // 403 Forbidden (권한 없음)일 때는 단순히 에러만 반환하고 로그아웃시키지 않음
        if (status === 401 || (status !== 403 && isExpired)) {
            console.warn("Unauthorized error or Token Expired. Token cleared.");
            localStorage.removeItem('accessToken');
            localStorage.removeItem('nickname');
            // Use replace to avoid browser popup state if possible
            window.location.replace('/login');
        }
        return Promise.reject(error);
    }
);

export interface RsData<T> {
    resultCode: string;
    msg: string;
    data: T;
}

export default client;
