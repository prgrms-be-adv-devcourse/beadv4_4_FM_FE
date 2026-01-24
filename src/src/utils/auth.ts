export const getUserIdFromToken = (): number | null => {
    const token = localStorage.getItem('accessToken');
    if (!token) return null;

    try {
        const base64Url = token.split('.')[1];
        const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
        const jsonPayload = decodeURIComponent(window.atob(base64).split('').map(function (c) {
            return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
        }).join(''));

        const payload = JSON.parse(jsonPayload);
        return payload.sub ? Number(payload.sub) : null;
    } catch (e) {
        console.error("Failed to decode token", e);
        return null;
    }
};
