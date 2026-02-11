// API client for Spring Boot backend

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8081/api';

export class ApiClient {
    // Tokens are now managed via HTTP-only cookies by the backend

    static setToken(token: string) {
        // Token is now set as HTTP-only cookie by backend
        // This method is kept for backward compatibility but does nothing
    }

    static getToken(): string | null {
        // Tokens are in HTTP-only cookies, inaccessible to JavaScript
        return null;
    }

    static clearToken() {
        // Cookies are cleared by backend on logout
    }

    private static getHeaders(): HeadersInit {
        // No Authorization header needed - browser sends cookies automatically
        return {
            'Content-Type': 'application/json',
        };
    }

    static async request<T>(
        endpoint: string,
        options: RequestInit = {}
    ): Promise<T> {
        const url = `${API_BASE_URL}${endpoint}`;
        const response = await fetch(url, {
            ...options,
            headers: this.getHeaders(),
            credentials: 'include', // Include cookies in all requests
        });

        if (!response.ok) {
            const error = await response.json().catch(() => ({ message: 'Unknown error' }));
            throw new Error(error.message || `HTTP ${response.status}`);
        }

        // Handle empty responses (e.g., DELETE requests that return 204 or 200 with no body)
        const contentLength = response.headers.get('content-length');
        if (response.status === 204 || contentLength === '0' || response.body === null) {
            return {} as T;
        }

        // Try to parse JSON if content is available
        const text = await response.text();
        if (!text) {
            return {} as T;
        }

        try {
            return JSON.parse(text);
        } catch (e) {
            // If not JSON, return empty object
            return {} as T;
        }
    }

    static async get<T>(endpoint: string): Promise<T> {
        return this.request<T>(endpoint, { method: 'GET' });
    }

    static async post<T>(endpoint: string, data: any): Promise<T> {
        return this.request<T>(endpoint, {
            method: 'POST',
            body: JSON.stringify(data),
        });
    }

    static async put<T>(endpoint: string, data: any): Promise<T> {
        return this.request<T>(endpoint, {
            method: 'PUT',
            body: JSON.stringify(data),
        });
    }

    static async delete<T>(endpoint: string): Promise<T> {
        return this.request<T>(endpoint, { method: 'DELETE' });
    }

    static async patch<T>(endpoint: string, data?: any): Promise<T> {
        return this.request<T>(endpoint, {
            method: 'PATCH',
            body: data ? JSON.stringify(data) : undefined,
        });
    }
}

// Auth API
export const authApi = {
    async signUp(email: string, password: string, fullName: string) {
        return ApiClient.post('/auth/signup', { email, password, fullName });
    },

    async signIn(email: string, password: string) {
        const response = await ApiClient.post<{
            token: string;
            user: any;
        }>('/auth/signin', { email, password });
        ApiClient.setToken(response.token);
        return response;
    },

    async signOut() {
        ApiClient.clearToken();
        return ApiClient.post('/auth/signout', {});
    },
};

// Delivery Requests API
export const deliveryRequestApi = {
    async create(data: any) {
        return ApiClient.post('/delivery-requests', data);
    },

    async getAll() {
        return ApiClient.get('/delivery-requests');
    },

    async getById(id: string) {
        return ApiClient.get(`/delivery-requests/${id}`);
    },

    async getByStatus(status: string) {
        return ApiClient.get(`/delivery-requests/status/${status}`);
    },

    async getByDriver(driverId: string) {
        return ApiClient.get(`/delivery-requests/driver/${driverId}`);
    },

    async update(id: string, data: any) {
        return ApiClient.put(`/delivery-requests/${id}`, data);
    },

    async delete(id: string) {
        return ApiClient.delete(`/delivery-requests/${id}`);
    },

    async confirmDelivery(trackingNumber: string) {
        return ApiClient.post(`/delivery-requests/confirm-delivery/${trackingNumber}`, {});
    },
};

// Drivers API
export const driverApi = {
    async create(data: any) {
        return ApiClient.post('/admin/drivers', data);
    },

    async getAll() {
        return ApiClient.get('/admin/drivers');
    },

    async getActive() {
        return ApiClient.get('/admin/drivers/active');
    },

    async getById(id: string) {
        return ApiClient.get(`/admin/drivers/${id}`);
    },

    async update(id: string, data: any) {
        return ApiClient.put(`/admin/drivers/${id}`, data);
    },

    async toggleActive(id: string) {
        return ApiClient.patch(`/admin/drivers/${id}/toggle-active`);
    },

    async delete(id: string) {
        return ApiClient.delete(`/admin/drivers/${id}`);
    },

    // Driver endpoints (for drivers)
    async getMyProfile() {
        return ApiClient.get('/driver/me');
    },

    async getByUserId(userId: string) {
        return ApiClient.get(`/driver/by-user/${userId}`);
    },
};

// Contact Messages API
export const contactApi = {
    async create(data: any) {
        return ApiClient.post('/contact', data);
    },

    async getAll() {
        return ApiClient.get('/admin/messages');
    },

    async getUnread() {
        return ApiClient.get('/admin/messages/unread');
    },

    async getById(id: string) {
        return ApiClient.get(`/admin/messages/${id}`);
    },

    async markAsRead(id: string) {
        return ApiClient.patch(`/admin/messages/${id}/read`);
    },

    async respond(id: string, responseText: string) {
        return ApiClient.patch(`/admin/messages/${id}/respond`, { responseText });
    },

    async delete(id: string) {
        return ApiClient.delete(`/admin/messages/${id}`);
    },
};

// Users API
export const usersApi = {
    async create(data: any) {
        return ApiClient.post('/users/create', data);
    },

    async getAll() {
        return ApiClient.get('/users/all');
    },

    async getById(id: string) {
        return ApiClient.get(`/users/${id}`);
    },

    async delete(id: string) {
        return ApiClient.delete(`/users/${id}`);
    },
};

// Notifications API
export const notificationsApi = {
    async getActive() {
        return ApiClient.get('/notifications/active');
    },

    async getAll() {
        return ApiClient.get('/notifications');
    },

    async getUnreadCount() {
        return ApiClient.get<{ count: number }>('/notifications/unread/count');
    },

    async markAsRead(notificationId: string) {
        return ApiClient.post(`/notifications/${notificationId}/read`, {});
    },

    async markAllAsRead() {
        return ApiClient.post('/notifications/read-all', {});
    },

    async dismiss(notificationId: string) {
        return ApiClient.post(`/notifications/${notificationId}/dismiss`, {});
    },

    async delete(notificationId: string) {
        return ApiClient.delete(`/notifications/${notificationId}`);
    },
};
