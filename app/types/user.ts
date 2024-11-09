import { useEffect, useState } from 'react';
import { API_BASE_URL } from '~/config';

interface User {
    full_name: string;
    fp_code_expire: string | null;
    hashed_password: string;
    access_token: string;
    role: string;
    created_at: string;
    status: string;
    theme: string;
    register_type: string;
    language: string;
    ev_code: string | null;
    register_ip: string;
    id: number;
    profile_pic: string;
    email: string;
    ev_code_expire: string | null;
    login_ip: string;
    email_verified: boolean;
    fp_code: string | null;
}

const getStoredToken = (): string | null => {
    try {
        return localStorage.getItem('token');
    } catch (error) {
        console.error('Error accessing localStorage:', error);
        return null;
    }
};

const UserMe = async (token: string): Promise<User | null> => {
    if (!token) {
        console.error('No token provided');
        return null;
    }

    try {
        const response = await fetch(`${API_BASE_URL}/user/me`, {
            method: 'GET',
            headers: {
                'Accept': 'application/json',
                'Authorization': `Bearer ${token}`,
            },
        });

        if (!response.ok) {
            if (response.status === 401) {
                // Token is invalid or expired
                localStorage.removeItem('token');
                localStorage.removeItem('default_project');
                window.location.reload();
                return null;
            }
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data: User = await response.json();
        return data;
    } catch (error) {
        console.error('Error fetching user data:', error);
        return null;
    }
};

const useUser = () => {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        let isMounted = true;
        const token = getStoredToken();

        const fetchUserData = async () => {
            if (!token) {
                setLoading(false);
                setError('No authentication token found.');
                return;
            }

            try {
                setLoading(true);
                setError(null);
                const result = await UserMe(token);
                
                if (isMounted) {
                    if (result) {
                        setUser(result);
                    } else {
                        setError('Failed to fetch user data.');
                    }
                }
            } catch (err) {
                if (isMounted) {
                    setError('An error occurred while fetching user data.');
                }
            } finally {
                if (isMounted) {
                    setLoading(false);
                }
            }
        };

        fetchUserData();

        // Cleanup function
        return () => {
            isMounted = false;
        };
    }, []); // Empty dependency array since we're getting token inside the effect

    const refetchUser = async () => {
        const token = getStoredToken();
        if (!token) {
            setError('No authentication token found.');
            return;
        }

        setLoading(true);
        try {
            const result = await UserMe(token);
            if (result) {
                setUser(result);
                setError(null);
            } else {
                setError('Failed to fetch user data.');
            }
        } catch (err) {
            setError('An error occurred while fetching user data.');
        } finally {
            setLoading(false);
        }
    };

    return { 
        getStoredToken,
        user, 
        loading, 
        error,
        refetchUser
    };
};

export default useUser;