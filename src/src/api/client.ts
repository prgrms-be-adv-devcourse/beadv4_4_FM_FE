import axios from 'axios';

const client = axios.create({
    baseURL: '/api/v1',
    headers: {
        'Content-Type': 'application/json',
    },
});

// Request interceptor to add token
client.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('accessToken');
        if (token) {
            config.headers['Authorization'] = `Bearer ${token}`; // Adjust if backend expects different format
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
        return response;
    },
    (error) => {
        if (error.response && error.response.status === 401) {
            console.warn("Unauthorized error. Token cleared.");
            localStorage.removeItem('accessToken');
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
