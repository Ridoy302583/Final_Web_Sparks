import { Box, Chip, Dialog, Divider, IconButton, InputAdornment, TextField, Typography, useTheme } from '@mui/material';
import React, { useState } from 'react';
import Logo from '../../../../icons/roundedlogo.svg'

interface PasswordSetProps {
    passwordSetOpen: boolean;
    email: string | null;
    code: string | null;
    handleSignInOpen: () => void;
}

interface FormData {
    newpassword: string;
    confirmpassword: string;
}

const PasswordSet: React.FC<PasswordSetProps> = ({ passwordSetOpen, email, code, handleSignInOpen }) => {

    const [formData, setFormData] = useState<FormData>({
        newpassword: '',
        confirmpassword: '',
    });
    const [error, setError] = useState<string>();
    const [showNewPassword, setShowNewPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({
            ...formData,
            [event.target.id]: event.target.value,
        });
    };

    const handleToggleNewPasswordVisibility = () => {
        setShowNewPassword((prev) => !prev);
    };

    const handleToggleConfirmPasswordVisibility = () => {
        setShowConfirmPassword((prev) => !prev);
    };

    const validatePassword = (password: string) => {
        const regex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{6,}$/;
        return regex.test(password);
    };

    const PassChange = async (Email: string, Code: string, PassCode: string) => {
        const data = {
            email: Email,
            fp_code: Code,
            new_password: PassCode
        };
        // try {
        //     const response = await fetch(`${API_BASE_URL}/reset-password`, {
        //         method: 'POST',
        //         headers: {
        //             'Accept': 'application/json',
        //             'Content-Type': 'application/json',
        //         },
        //         body: JSON.stringify(data),
        //     });

        //     if (!response.ok) {
        //         const errorMessage = await response.json();
        //         setError(errorMessage.detail);
        //         throw new Error(`HTTP error! status: ${response.status}, message: ${errorMessage.detail}`);
        //     }
        //     const responseData = await response.json();
        //     return responseData;
        // } catch (error) {
        //     console.error('Error during sign in:', error);
        // }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!validatePassword(formData.newpassword)) {
            setError('Password must be at least 6 characters long, include an uppercase letter, a lowercase letter, a number, and a special character.');
            return; 
        }

        if (formData.newpassword !== formData.confirmpassword) {
            setError('New password and confirm password must match.');
            return;
        }

        if (email && code) {
            // const result = await PassChange(email, code, formData.newpassword);
            // if(result){
            //     handleSignInOpen();
            //     setFormData({ newpassword: '', confirmpassword: '' }); 
            // }
        } else {
            setError('Email or code cannot be null');
        }
    };

    return (
        <Dialog
            open={passwordSetOpen}
            maxWidth={'lg'}
            sx={{
                '& .MuiDialog-paper': {
                    borderRadius: '25px',
                    width: 600,
                    border: `1px solid #d0d0d0`,
                    background:'#FFF'
                },
            }}
            BackdropProps={{
                sx: {
                    backgroundColor: 'rgba(0, 0, 0, 0.5)',
                    backdropFilter: 'blur(8px)',
                },
            }}
        >
            <Box p={3}>
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
                        Setting For New Password
                    </Typography>
                    <Typography fontFamily={'Montserrat'} textAlign={'center'} id="dialog-description">
                        Welcome back! Please sign in to continue
                    </Typography>
                </Box>
                <Box my={2}>
                    <Divider>
                        <Chip label="Or" size="small" sx={{fontFamily: '"Montserrat", sans-serif'}} />
                    </Divider>
                </Box>
                <form onSubmit={handleSubmit}>
                    <Box>
                        <TextField
                            required
                            type={showNewPassword ? 'text' : 'password'}
                            id="newpassword"
                            placeholder="Enter Your New Password"
                            fullWidth
                            variant="outlined"
                            value={formData.newpassword}
                            onChange={handleChange}
                            sx={{
                                mt: 2,
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
                                        borderColor: '#d0d0d0',
                                    },
                                    '&.Mui-focused fieldset': {
                                        borderColor: '#d0d0d0',
                                    },
                                },
                            }}
                            InputProps={{
                                endAdornment: (
                                    <InputAdornment position="end">
                                        <IconButton
                                            onClick={handleToggleNewPasswordVisibility}
                                            edge="end"
                                        >
                                            {showNewPassword ? <i className="bi bi-eye-slash"></i> : <i className="bi bi-eye"></i>}
                                        </IconButton>
                                    </InputAdornment>
                                ),
                            }}
                        />
                        <TextField
                            required
                            type={showConfirmPassword ? 'text' : 'password'}
                            id="confirmpassword"
                            placeholder="Enter Your Confirm Password"
                            fullWidth
                            variant="outlined"
                            value={formData.confirmpassword}
                            onChange={handleChange}
                            sx={{
                                mt: 2,
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
                                        borderColor: '#d0d0d0',
                                    },
                                    '&.Mui-focused fieldset': {
                                        borderColor: '#d0d0d0',
                                    },
                                },
                            }}
                            InputProps={{
                                endAdornment: (
                                    <InputAdornment position="end">
                                        <IconButton
                                            onClick={handleToggleConfirmPasswordVisibility}
                                            edge="end"
                                        >
                                            {showConfirmPassword ? <i className="bi bi-eye-slash"></i> : <i className="bi bi-eye"></i>}
                                        </IconButton>
                                    </InputAdornment>
                                ),
                            }}
                        />
                        {error && (
                            <Box mt={2}>
                                <Typography fontFamily={'Montserrat'} fontWeight={700} textAlign={'center'} color='red'>{error}</Typography>
                            </Box>
                        )}
                        <Box mt={2}>
                            <Box
                                onClick={handleSubmit}
                                display={'flex'}
                                justifyContent={'center'}
                                alignItems={'center'}
                                p={1}
                                border={`1px solid #000`}
                                borderRadius={3}
                                sx={{ background: '#000', cursor: 'pointer' }}
                            >
                                <Typography fontFamily={'Montserrat'} component={'span'} mr={1} color={'#FFF'}>
                                    Continue
                                </Typography>
                                <i className="bi bi-arrow-right"></i>
                            </Box>
                        </Box>
                        <Box my={2}>
                            <Divider />
                        </Box>
                        <Box display={'flex'} justifyContent={'center'} alignItems={'center'}>
                            <span> Secure by <span style={{fontWeight:700}}>Websparks</span> </span>
                        </Box>
                    </Box>
                </form>
            </Box>
        </Dialog>
    );
};

export default PasswordSet;
