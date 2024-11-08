import { Box, Chip, Dialog, Divider, IconButton, InputAdornment, Link, TextField, Typography, useTheme } from '@mui/material'
import React, { useState } from 'react'
// import SocialLogin from './SocialLogin'
import Logo from '../../../icons/roundedlogo.svg'
import SocialLogin from './SocialLogin';

interface LoginProps {
    signinOpen: boolean;
    handleSignInClose: () => void;
    handleSignUpOpen: () => void;
    handleEnterEmailOpen: () => void;
}

interface FormData {
    email: string;
    password: string;
}

const Login: React.FC<LoginProps> = ({ signinOpen, handleSignInClose, handleSignUpOpen, handleEnterEmailOpen }) => {
    const theme = useTheme();

    const [formData, setFormData] = useState<FormData>({
        email: '',
        password: '',
    });
    const [error, setError] = useState<string>();
    const [showPassword, setShowPassword] = useState(false);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { id, value } = e.target;
        setFormData((prevState) => ({
            ...prevState,
            [id]: value,
        }));
    };

    const handleTogglePasswordVisibility = () => {
        setShowPassword((prev) => !prev);
    };

    const SignIn = async (Email: string, PassCode: string) => {
        const data = {
            email: Email,
            password: PassCode
        };
        try {
            const response = await fetch(`$/signin`, {
                method: 'POST',
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(data),
            });
    
            if (!response.ok) {
                const errorMessage = await response.json();
                // setError(errorMessage.detail);
                // throw new Error(`HTTP error! status: ${response.status}, message: ${errorMessage.detail}`);
            }
            const responseData = await response.json();
            return responseData;
        } catch (error) {
            console.error('Error during sign in:', error);
        }
    };    

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const result = await SignIn(formData.email, formData.password);
        console.log(result)
        // if(result){
        //     localStorage.setItem('token', result.access_token);
        //     localStorage.setItem('default_project', result.default_project_id);
        //     window.location.reload();
        // }
    };

    return (
        <Dialog
            open={signinOpen}
            onClose={handleSignInClose}
            maxWidth={'lg'}
            sx={{
                '& .MuiDialog-paper': {
                    borderRadius: '25px',
                    width: 600,
                    border: `1px solid ${'#d0d0d0'}`,
                    background: '#FFF'
                },
            }}
            BackdropProps={{
                sx: {
                    backgroundColor: 'rgba(0, 0, 0, 0.5)',
                    backdropFilter: 'blur(8px)',
                },
            }}
        >
            <Box
                p={3}
            >
                <Box width={'100%'} display={'flex'} justifyContent={'center'}>
                    <Box
                        component={'img'}
                        src={Logo}
                        height={60}
                        width={'auto'}
                    />
                </Box>
                <Box my={3}>
                    <Typography
                        fontSize={24}
                        fontWeight={700}
                        textAlign={'center'}
                        id="dialog-title"
                        fontFamily={'Montserrat'}
                    >
                        Sign in to Websparks
                    </Typography>
                    <Typography fontFamily={'Montserrat'} textAlign={'center'} id="dialog-description">
                        Welcome back! Please sign in to continue
                    </Typography>
                </Box>
                <Box>
                    <SocialLogin />
                </Box>
                <Box my={2}>
                    <Divider>
                        <Chip label={`Or`} size="small" sx={{fontFamily: '"Montserrat", sans-serif'}} />
                    </Divider>
                </Box>
                <form onSubmit={handleSubmit}>
                    <Box>
                        <TextField
                            required
                            type="email"
                            id="email"
                            placeholder={`Enter Your Email`}
                            fullWidth
                            variant="outlined"
                            value={formData.email}
                            onChange={handleChange}
                            sx={{
                                '& .MuiOutlinedInput-root': {
                                    '& fieldset': {
                                        borderColor: '#d0d0d0',
                                        borderRadius: '15px',
                                    },
                                    '& input': {  // Input text font
                                        fontFamily: '"Montserrat", sans-serif'
                                    },
                                    '& input::placeholder': {  // Placeholder font
                                        fontFamily: '"Montserrat", serif',
                                        opacity: 0.7  // Optional: adjust placeholder opacity
                                    },
                                    '&:hover fieldset': {
                                        borderColor: '#d0d0d0', // Hover border color
                                    },
                                    '&.Mui-focused fieldset': {
                                        borderColor: '#d0d0d0', // Focus border color
                                    },
                                },
                            }}
                        />
                        <TextField
                            required
                            type={showPassword ? 'text' : 'password'}
                            id="password"
                            placeholder={`Enter Your Password`}
                            fullWidth
                            variant="outlined"
                            value={formData.password}
                            onChange={handleChange}
                            sx={{
                                mt:2,
                                '& .MuiOutlinedInput-root': {
                                    '& fieldset': {
                                        borderColor: '#d0d0d0',
                                        borderRadius: '15px',
                                    },
                                    '& input': {  // Input text font
                                        fontFamily: '"Montserrat", sans-serif'
                                    },
                                    '& input::placeholder': {  // Placeholder font
                                        fontFamily: '"Montserrat", serif',
                                        opacity: 0.7  // Optional: adjust placeholder opacity
                                    },
                                    '&:hover fieldset': {
                                        borderColor: '#d0d0d0', // Hover border color
                                    },
                                    '&.Mui-focused fieldset': {
                                        borderColor: '#d0d0d0', // Focus border color
                                    },
                                },
                            }}
                            InputProps={{
                                endAdornment: (
                                    <InputAdornment position="end">
                                        <IconButton
                                            onClick={handleTogglePasswordVisibility}
                                            edge="end"
                                        >
                                            {showPassword ? <i className="bi bi-eye-slash"></i> : <i className="bi bi-eye"></i>}
                                        </IconButton>
                                    </InputAdornment>
                                ),
                            }}
                        />
                        <Box display={'flex'} justifyContent={'end'} mt={1}>
                            <Link sx={{cursor:'pointer'}} onClick={handleEnterEmailOpen}>
                                <p>Forgot Password?</p>
                            </Link>
                        </Box>
                        {error && (
                            <Box mt={2}>
                                <Typography fontFamily={'Montserrat'} fontWeight={700} textAlign={'center'} color='red'>{error}</Typography>
                            </Box>
                        )}
                        <Box mt={2}>
                            <Box onClick={handleSubmit} display={'flex'} justifyContent={'center'} alignItems={'center'} p={1} border={`1px solid `} borderRadius={3} sx={{background:'#000', color:'#FFF', cursor:'pointer' }}>
                                <span style={{marginRight:'5px'}}>Login</span>
                                <i className="bi bi-arrow-right"></i>
                            </Box>
                        </Box>
                    </Box>
                </form>
                <Box display={'flex'} justifyContent={'center'} alignItems={'center'} mt={2}>
                    <Box>
                        <span>Don't have An Account? </span>
                        <Link onClick={handleSignUpOpen} sx={{ cursor: 'pointer' }}>
                            <span>Signup</span>
                        </Link>
                    </Box>
                </Box>
                <Box my={2}>
                    <Divider />
                </Box>
                <Box display={'flex'} justifyContent={'center'} alignItems={'center'}>
                    <span> Secure by <span style={{fontWeight:700}}>Websparks</span> </span>
                </Box>
            </Box>
        </Dialog>
    )
}

export default Login;