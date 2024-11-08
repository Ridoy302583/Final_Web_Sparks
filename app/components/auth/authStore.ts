import { atom } from 'nanostores';
import { API_BASE_URL } from '~/config';

interface AuthState {
    access_token: string | null;
    default_project_id: number | null;
    user: string | null;
}

interface AuthResponse {
    access_token: string;
    default_project_id: number;
    user: string;
}

interface ErrorResponse {
    message: string;
    code?: string;
}

// Create the auth store
export const authStore = atom<AuthState>({
    access_token: null,
    default_project_id: null,
    user: null,
});

// Helper function for API calls
const handleAuthResponse = async (response: Response): Promise<AuthResponse> => {
    if (!response.ok) {
        const errorData = await response.json() as ErrorResponse;
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
    }
    const data = await response.json() as AuthResponse;
    return data;
};

// Helper function for error handling
const handleError = (error: unknown): string => {
    if (error instanceof Error) {
        return error.message;
    }
    if (typeof error === 'string') {
        return error;
    }
    return 'An unexpected error occurred';
};

// Auth actions
export const authActions = {
    login: async (email: string, password: string): Promise<boolean> => {
        try {
            const response = await fetch(`${API_BASE_URL}/signin`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                },
                body: JSON.stringify({ email, password })
            });

            const data = await handleAuthResponse(response);
            
            authStore.set({
                access_token: data.access_token,
                default_project_id: data.default_project_id,
                user: data.user,
            });
            
            localStorage.setItem('token', data.access_token);
            return true;
        } catch (error) {
            console.error('Error during login:', handleError(error));
            return false;
        }
    },

    register: async (username: string, password: string, email: string): Promise<boolean> => {
        try {
            const response = await fetch(`${API_BASE_URL}/register`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ username, password, email }),
            });

            const data = await handleAuthResponse(response);
            
            authStore.set({
                access_token: data.access_token,
                default_project_id: data.default_project_id,
                user: data.user,
            });
            
            localStorage.setItem('token', data.access_token);
            return true;
        } catch (error) {
            console.error('Error during registration:', handleError(error));
            return false;
        }
    },

    logout: async (tokenData: string): Promise<boolean> => {
        try {
            const response = await fetch(`${API_BASE_URL}/signout`, {
                method: 'POST',
                headers: {
                    'Accept': 'application/json',
                    'Authorization': `Bearer ${tokenData}`,
                },
            });

            if (!response.ok) {
                throw new Error('Failed to log out');
            }

            authStore.set({
                access_token: null,
                default_project_id: null,
                user: null,
            });
            
            localStorage.removeItem('token');
            localStorage.removeItem('default_project');
            window.location.reload();
            return true;
        } catch (error) {
            console.error('Error during logout:', handleError(error));
            return false;
        }
    },

    // Initialize auth state from localStorage on app load
    initializeAuth: () => {
        const token = localStorage.getItem('token');
        if (token) {
            // You might want to validate the token here or fetch user data
            authStore.set({
                access_token: token,
                default_project_id: null, // You might want to store this in localStorage too
                user: null, // You might want to store this in localStorage too
            });
        }
    },
};