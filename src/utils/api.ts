export const getApiUrl = (endpoint: string): string => {
    const baseUrl = import.meta.env.VITE_API_URL || 'https://neuroengage.onrender.com';
    const cleanEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
    return `${baseUrl}${cleanEndpoint}`;
};

export const getAuthToken = (): string | null => {
    return localStorage.getItem('neuro_token');
};

export const setAuthToken = (token: string): void => {
    localStorage.setItem('neuro_token', token);
};

export const clearAuth = (): void => {
    localStorage.removeItem('neuro_token');
    localStorage.removeItem('neuro_user');
    localStorage.removeItem('neuro_username');
    localStorage.removeItem('neuro_role');
    localStorage.removeItem('neuro_pairing_code');
    localStorage.removeItem('neuro_doctor_code');
};

export const getAuthHeaders = (): Record<string, string> => {
    const token = getAuthToken();
    const headers: Record<string, string> = {
        'Content-Type': 'application/json',
    };
    if (token) {
        headers['Authorization'] = `Bearer ${token}`;
    }
    return headers;
};

export const authFetch = async (url: string, options: RequestInit = {}): Promise<Response> => {
    const fullUrl = url.startsWith('http') ? url : getApiUrl(url);

    const headers = {
        ...getAuthHeaders(),
        ...(options.headers as Record<string, string> || {}),
    };

    const response = await fetch(fullUrl, {
        ...options,
        headers,
    });

    if (response.status === 401) {
        clearAuth();
        if (window.location.pathname !== '/') {
            window.location.href = '/';
        }
    }

    return response;
};
