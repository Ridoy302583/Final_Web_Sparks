import { useStore } from '@nanostores/react';
import { authActions, authStore } from './authStore';

const useAuth = () => {
    const authState = useStore(authStore);
    
    return {
        authState,
        login: authActions.login,
        register: authActions.register,
        logout: authActions.logout,
    };
};

export default useAuth;