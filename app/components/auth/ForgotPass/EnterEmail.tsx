import { Box, Chip, Dialog, Divider, TextField, Typography, useTheme } from '@mui/material'
import React, { useState } from 'react'
import Logo from '../../../../icons/roundedlogo.svg'

interface LoginProps {
    enterEmailOpen: boolean;
    handleEnterEmailClose: () => void;
    handleForgotVerificationOpen: (email: string) => void;
}

interface FormData {
    email: string;
}

const EnterEmail: React.FC<LoginProps> = ({ enterEmailOpen, handleEnterEmailClose, handleForgotVerificationOpen }) => {
    const [formData, setFormData] = useState<FormData>({
        email: '',
    });
    const [error, setError] = useState<string>();

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { id, value } = e.target;
        setFormData((prevState) => ({
            ...prevState,
            [id]: value,
        }));
    };

    const SendVerification = async (Email: string) => {
        const data = {
            email: Email
        };
        // try {
        //     const response = await fetch(`${API_BASE_URL}/send-forgot-password-otp`, {
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
        const result = await SendVerification(formData.email);
        handleForgotVerificationOpen(formData.email)
        // if(result){
        //     handleForgotVerificationOpen(formData.email);
        //     setFormData({email :''})
        // }
        // console.log(result);
    };

    return (
        <Dialog
            open={enterEmailOpen}
            onClose={handleEnterEmailClose}
            maxWidth={'lg'}
            sx={{
                '& .MuiDialog-paper': {
                    borderRadius: '25px',
                    width: 600,
                    border: `1px solid #d0d0d0`,
                    background: '#FFF',
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
                        Forget Password
                    </Typography>
                    <Typography fontFamily={'Montserrat'}  textAlign={'center'} id="dialog-description">
                        Welcome back! Please sign in to continue
                    </Typography>
                </Box>
                <Box my={2}>
                    <Divider>
                        <Chip label="Or" size="small" sx={{fontFamily: '"Montserrat", sans-serif'}}/>
                    </Divider>
                </Box>
                <form onSubmit={handleSubmit}>
                    <Box>
                        <TextField
                            required
                            type="email"
                            id="email"
                            placeholder="Enter Your Email"
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
                        {error && (
                            <Box mt={2}>
                                <Typography fontFamily={'Montserrat'}  fontWeight={700} textAlign={'center'} color='red'>{error}</Typography>
                            </Box>
                        )}
                        <Box mt={2}>
                            <Box onClick={handleSubmit} display={'flex'} justifyContent={'center'} alignItems={'center'} p={1} border={`1px solid #000`} borderRadius={3} sx={{ background: '#000', cursor:'pointer' }}>
                                <Typography fontFamily={'Montserrat'}  component={'span'} mr={1} color={'#FFF'}>Continue</Typography>
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
    )
}
export default EnterEmail;