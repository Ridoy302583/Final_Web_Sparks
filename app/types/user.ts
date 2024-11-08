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
    profile_pic:string;
    email: string;
    ev_code_expire: string | null;
    login_ip: string;
    email_verified: boolean;
    fp_code: string | null;
}

const UserMe = async (tokenData: string): Promise<User | null> => {
    const token = tokenData;
    try {
        const response = await fetch(`${API_BASE_URL}/user/me`, {
            method: 'GET',
            headers: {
                'Accept': 'application/json',
                'Authorization': `Bearer ${token}`,
            },
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data: User = await response.json();
        return data;
    } catch (error) {
        console.error('Error fetching user data:', error);
        return null; // Return null in case of error
    }
};

const useUser = (token: string) => {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchUserData = async () => {
            setLoading(true);
            setError(null);
            const result = await UserMe(token);
            if (result) {
                setUser(result);
            } else {
                setError('Failed to fetch user data.');
            }
            setLoading(false);
        };

        if (token) {
            fetchUserData();
        }
    }, [token]);
    return { user, loading, error };
};

export default useUser;
