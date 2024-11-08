import { Box, Chip, CircularProgress, Dialog, Divider, IconButton, InputAdornment, InputLabel, Link, TextField, Typography, useTheme } from '@mui/material';
import React, { useState } from 'react';
// import SocialLogin from './SocialLogin';
import Logo from '../../../icons/roundedlogo.svg'
import SocialLogin from './SocialLogin';

interface SignUpProps {
    signUpOpen: boolean;
    handleSignUpClose: () => void;
    handleSignInOpen: () => void;
    handleVerficationOpen: (email: string) => void;
}

interface FormData {
    name: string;
    email: string;
    password: string;
    city?:string;
}

interface FormErrors {
    name?: string;
    email?: string;
    password?: string;
}

const SignUp: React.FC<SignUpProps> = ({ signUpOpen, handleSignUpClose, handleSignInOpen, handleVerficationOpen }) => {
    const [formData, setFormData] = useState<FormData>({
        name: '',
        email: '',
        password: '',
    });

    const [formErrors, setFormErrors] = useState<FormErrors>({});
    const [error, setError] = useState<string>();
    const [isValid, setIsValid] = useState<boolean>(false);
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [showPassword, setShowPassword] = useState(false);

    const validateName = (name: string) => {
        if (!name) return 'Name is required';
        return '';
    };

    const validateEmail = (email: string) => {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!email) return 'Email is required';
        if (!emailRegex.test(email)) return 'Enter a valid email address';
        return '';
    };

    const validatePassword = (password: string) => {
        const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{6,}$/;
        if (!password) return 'Password is required';
        if (!passwordRegex.test(password)) {
            return 'Password must contain at least 6 characters, 1 lowercase, 1 uppercase, 1 number, and 1 special character';
        }
        return '';
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { id, value } = e.target;
    
        setFormData((prevState) => ({
            ...prevState,
            [id]: value,
        }));
    
        // Live validation
        let nameError = '';
        let emailError = '';
        let passwordError = '';
    
        if (id === 'name') {
            nameError = validateName(value);
        } else if (id === 'email') {
            emailError = validateEmail(value);
        } else if (id === 'password') {
            passwordError = validatePassword(value);
        }
    
        setFormErrors((prevErrors) => ({
            ...prevErrors,
            name: id === 'name' ? nameError : prevErrors.name,
            email: id === 'email' ? emailError : prevErrors.email,
            password: id === 'password' ? passwordError : prevErrors.password,
        }));
    
        // Check if all fields are valid
        const isFormValid = !nameError && !emailError && !passwordError;
        setIsValid(isFormValid);
    };

    const handleTogglePasswordVisibility = () => {
        setShowPassword((prev) => !prev);
    };

    // const generateAvatar = async (email: string, full_name: string) => {
    //     const { toSvg } = await import('jdenticon');
    //     const uniqueValue = `${email}-${full_name}`;
    //     const svgString = toSvg(uniqueValue, 512);
    //     const base64 = btoa(unescape(encodeURIComponent(svgString)));
    //     return `data:image/svg+xml;base64,${base64}`;
    // };
    

    // const registerCustomer = async ({ fullName, Email, PassCode, CityLocation }: { fullName: string; Email: string; PassCode: string; CityLocation: string; }) => {
        
    //     const url = `${API_BASE_URL}/register-customer`;
    //     const avatarBase64 = await generateAvatar(Email, fullName);
    //     const data = {
    //         full_name: fullName,
    //         profile_pic:avatarBase64,
    //         email: Email,
    //         password: PassCode,
    //         city: CityLocation,
    //     };

    //     console.log(data);
    
    //     try {
    //         const response = await fetch(url, {
    //             method: 'POST',
    //             headers: {
    //                 'Accept': 'application/json',
    //                 'Content-Type': 'application/json',
    //             },
    //             body: JSON.stringify(data),
    //         });
    //         if (!response.ok) {
    //             const errorMessage = await response.json();
    //             setIsLoading(false);
    //             setError(errorMessage.detail);
    //             throw new Error(`HTTP error! status: ${response.status}, message: ${errorMessage}`);
    //         }
    //         const result = await response.json();
            
    //         return result;
    //     } catch (error) {
    //         console.error('Error registering customer:', error);
    //     }
    // };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true)
        const nameError = validateName(formData.name);
        const emailError = validateEmail(formData.email);
        const passwordError = validatePassword(formData.password);

        if (nameError || emailError || passwordError) {
            setFormErrors({
                name: nameError,
                email: emailError,
                password: passwordError,
            });
            setIsLoading(false);
            return;
        }
        handleVerficationOpen(formData.email)
        // const result = await registerCustomer({ fullName: formData.name, Email: formData.email, PassCode: formData.password, CityLocation: 'Dhaka', });
        // console.log(result);
        // if(result){
        //     setIsLoading(false);
        //     handleVerficationOpen(formData.email);
        // }
    };

    return (
        <Dialog
            open={signUpOpen}
            onClose={handleSignUpClose}
            maxWidth={'lg'}
            sx={{
                '& .MuiDialog-paper': {
                    borderRadius: '25px',
                    width: 600,
                    border: `1px solid `,
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
                        Create your account
                    </Typography>
                    <Typography fontFamily={'Montserrat'}  textAlign={'center'} id="dialog-description">
                        Welcome! Please fill in the details to get started.
                    </Typography>
                </Box>
                <Box>
                    <SocialLogin />
                </Box>
                <Box my={2}>
                    <Divider>
                        <Chip sx={{fontFamily:'Montserrat' }} label={`Or`} size="small" />
                    </Divider>
                </Box>
                <form onSubmit={handleSubmit}>
                    <Box>
                        <TextField
                            required
                            type="text"
                            id="name"
                            placeholder={`Enter Your Full Name`}
                            fullWidth
                            variant="outlined"
                            value={formData.name}
                            onChange={handleChange}
                            error={!!formErrors.name}
                            sx={{
                                '& .MuiOutlinedInput-root': {
                                    '& fieldset': {
                                        borderColor: '#d0d0d0',
                                        borderRadius: '15px',
                                    },
                                    '&:hover fieldset': {
                                        borderColor: '#d0d0d0',
                                    },
                                    '& input': {  // Input text font
                                        fontFamily: '"Montserrat", sans-serif'
                                    },
                                    '& input::placeholder': {  // Placeholder font
                                        fontFamily: '"Montserrat", serif',
                                        opacity: 0.7  // Optional: adjust placeholder opacity
                                    },
                                    '&.Mui-focused fieldset': {
                                        borderColor: '#d0d0d0',
                                    },
                                    '& .MuiFormHelperText-root': {
                                        color: !!formErrors.name ? 'green' : 'default',
                                    },
                                },
                            }}
                        />
                        <InputLabel sx={{fontSize:12, color:'red', ml:2}}>{formErrors.name}</InputLabel>
                        <TextField
                            required
                            type="email"
                            id="email"
                            placeholder={`Enter Your Email`}
                            fullWidth
                            variant="outlined"
                            value={formData.email}
                            onChange={handleChange}
                            error={!!formErrors.email}
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
                        />
                        <InputLabel sx={{fontSize:12, color:'red', ml:2}}>{formErrors.email}</InputLabel>
                        <TextField
                            required
                            type={showPassword ? 'text' : 'password'}
                            id="password"
                            placeholder={`Enter Your Password`}
                            fullWidth
                            variant="outlined"
                            value={formData.password}
                            onChange={handleChange}
                            error={!!formErrors.password}
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
                                            onClick={handleTogglePasswordVisibility}
                                            edge="end"
                                        >
                                            {showPassword ? <i className="bi bi-eye-slash"></i> : <i className="bi bi-eye"></i>}
                                        </IconButton>
                                    </InputAdornment>
                                ),
                            }}
                        />
                        <InputLabel sx={{fontSize:12, color:'red', ml:2, textWrap:'wrap', fontFamily:'Montserrat' }}>{formErrors.password}</InputLabel>
                        <Box mt={2}>
                            {error && (
                                <Typography fontFamily={'Montserrat'}  textAlign={'center'} color={'red'} fontWeight={700}>
                                    {error}
                                </Typography>
                            )}
                        </Box>
                        <Box mt={2}>
                            <Box onClick={handleSubmit} display={'flex'} justifyContent={'center'} alignItems={'center'} p={1} border={`1px solid  #000`} borderRadius={3} sx={{ background: '#000', cursor: 'pointer' }}>
                                {isLoading && (
                                    <CircularProgress color="success" size={20} />
                                )}
                                <Typography fontFamily={'Montserrat'}  component={'span'} mx={1} color='#FFF'>{`Continue`}</Typography>
                                <i className="bi bi-arrow-right" style={{color:'#FFF'}}></i>
                            </Box>
                        </Box>
                    </Box>
                </form>
                <Box display={'flex'} justifyContent={'center'} alignItems={'center'} mt={2}>
                    <Box>
                        <span> Already have an Account? </span>
                        <Link onClick={handleSignInOpen} sx={{ cursor: 'pointer' }}>
                            <span>Login</span>
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
    );
};

export default SignUp;
