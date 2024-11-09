import { Box, Grid, Typography, useTheme } from '@mui/material';
import { useEffect, useState } from 'react';
import Google from '../../../icons/google.png';
import Github from '../../../icons/github.png';
import { useGoogleLogin } from '@react-oauth/google';
import axios from 'axios';
import { API_BASE_URL } from '~/config';

interface CodeResponse {
    access_token: string;
    credential?: string;
}

interface GoogleUserInfo {
    name: string;
    picture: string;
    email: string;
}

declare global {
    interface Window {
        google?: {
            accounts: {
                id: {
                    initialize: (config: any) => void;
                    renderButton: (element: HTMLElement, config: any) => void;
                    prompt: () => void;
                };
            };
        };
    }
}

const SocialLogin = () => {
    const theme = useTheme();
    const [user, setUser] = useState<CodeResponse | null>(null);

    // Initialize GSI client
    useEffect(() => {
        // Load GSI script
        const loadGoogleScript = () => {
            const script = document.createElement('script');
            script.src = 'https://accounts.google.com/gsi/client';
            script.async = true;
            script.defer = true;
            document.head.appendChild(script);

            script.onload = () => {
                if (window.google) {
                    initializeGSI();
                }
            };
        };

        const initializeGSI = () => {
            window.google?.accounts.id.initialize({
                client_id: import.meta.env.VITE_GOOGLE_CLIENT_ID,
                callback: handleGoogleCallback,
                auto_select: false,
                cancel_on_tap_outside: true,
            });
        };

        loadGoogleScript();
    }, []);

    const handleGoogleCallback = async (response: any) => {
        console.log('Google response:', response);
        if (response.credential) {
            try {
                // Decode the JWT token to get user info
                const decoded = JSON.parse(atob(response.credential.split('.')[1]));
                console.log('Decoded token:', decoded);
                
                // Send to your backend
                await sendLogin(
                    decoded.name,
                    decoded.picture,
                    decoded.email,
                    null,
                    response.credential
                );
            } catch (error) {
                console.error('Error processing Google response:', error);
            }
        }
    };

    // Regular OAuth login as backup
    const googleLogin = useGoogleLogin({
        onSuccess: (response: CodeResponse) => {
            console.log('OAuth Success:', response);
            setUser(response);
        },
        onError: (error) => console.error('OAuth Error:', error),
        scope: 'email profile',
        flow: 'implicit',
    });

    useEffect(() => {
        if (user?.access_token) {
            axios.get(
                'https://www.googleapis.com/oauth2/v1/userinfo',
                {
                    headers: {
                        Authorization: `Bearer ${user.access_token}`,
                        Accept: 'application/json',
                    },
                }
            )
            .then((res) => {
                console.log('User Info:', res.data);
                sendLogin(
                    res.data.name,
                    res.data.picture,
                    res.data.email,
                    null,
                    user.credential
                );
            })
            .catch((err) => console.error('Error fetching user info:', err));
        }
    }, [user]);

    const sendLogin = async (
        full_name: string, 
        profile_pic: string, 
        email: string, 
        password: string | null,
        credential?: string
    ) => {
        try {
            console.log('Sending login request:', { full_name, email });
            
            const response = await fetch(`${API_BASE_URL}/google-sign`, {
                method: 'POST',
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ 
                    full_name, 
                    profile_pic, 
                    email, 
                    password,
                    credential // Include Google credential if available
                }),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.detail || 'Login failed');
            }

            const result = await response.json();
            console.log('Login success:', result);

            localStorage.setItem('token', result.access_token);
            localStorage.setItem('default_project', result.default_project_id);
            
            window.location.reload();
            return result;
        } catch (error) {
            console.error('Login error:', error);
            throw error;
        }
    };

    const handleGoogleLogin = () => {
        console.log('Initiating Google login...');
        // Try GSI first, fall back to OAuth
        if (window.google?.accounts.id) {
            window.google.accounts.id.prompt();
        } else {
            googleLogin();
        }
    };

    return (
        <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
                <Box
                    onClick={handleGoogleLogin}
                    p={1}
                    display="flex"
                    justifyContent={'center'}
                    alignItems="center"
                    border={`1px solid ${theme.palette.secondary.main}`}
                    borderRadius={2}
                    sx={{ cursor: 'pointer' }}
                >
                    <Box component="img" src={Google} width={20} height={20} alt="Google Logo" />
                    <Typography ml={1}>Google</Typography>
                </Box>
            </Grid>
            <Grid item xs={12} sm={6}>
                <Box
                    p={1}
                    display="flex"
                    justifyContent={'center'}
                    alignItems="center"
                    border={`1px solid ${theme.palette.secondary.main}`}
                    borderRadius={2}
                    sx={{ cursor: 'pointer' }}
                >
                    <Box component="img" src={Github} width={20} height={20} alt="Github Logo" />
                    <Typography ml={1}>Github</Typography>
                </Box>
            </Grid>
            {/* Hidden div for GSI button */}
            <div id="google-signin-button" style={{ display: 'none' }}></div>
        </Grid>
    );
};

export default SocialLogin;