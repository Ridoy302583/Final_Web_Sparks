import { Box, Chip, Dialog, Divider, Grid, Link, TextField, Typography, useTheme } from '@mui/material';
import React, { useEffect, useRef, useState } from 'react';
import Logo from '../../../../icons/roundedlogo.svg'

interface PassResetProps {
    forgotVerificationOpen: boolean;
    handlePasswordSetOpen: (email:string, code:string) => void;
    email: string | null;
}

const ForgetVerficationCode: React.FC<PassResetProps> = ({ forgotVerificationOpen, email, handlePasswordSetOpen }) => {

    const [verificationCode, setVerificationCode] = useState(['', '', '', '', '', '']);
    const [errors, setErrors] = useState<boolean[]>(new Array(6).fill(false));
    const [lengthError, setLengthError] = useState<string>('');
    const [responseError, setResponseError] = useState<string>('');
    const inputRefs = useRef<(HTMLInputElement | null)[]>([]);
    const [loading, setLoading] = useState(false);
    const [isButtonDisabled, setIsButtonDisabled] = useState(true);

    useEffect(() => {
        const isFilled = verificationCode.every(digit => digit !== '');
        setIsButtonDisabled(!isFilled);
    }, [verificationCode]);

    const handleVerificationChange = (index: number, value: string) => {
        const newVerificationCode = [...verificationCode];
        newVerificationCode[index] = value.toUpperCase(); // Convert to uppercase to maintain consistency
        setVerificationCode(newVerificationCode);

        if (value) {
            const newErrors = [...errors];
            newErrors[index] = false;
            setErrors(newErrors);
        }

        if (value && index < 5) {
            inputRefs.current[index + 1]?.focus();
        }
    };

    const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Backspace' && !verificationCode[index] && index > 0) {
            inputRefs.current[index - 1]?.focus();
        }
    };

    const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
        e.preventDefault();
        const pastedData = e.clipboardData.getData('text').toUpperCase(); // Convert pasted data to uppercase
        const pastedChars = pastedData.split('').slice(0, 6);

        const newVerificationCode = [...verificationCode];
        pastedChars.forEach((char, index) => {
            if (index < 6) {
                newVerificationCode[index] = char;
            }
        });

        setVerificationCode(newVerificationCode);
        const newErrors = [...errors];
        pastedChars.forEach((_, index) => {
            newErrors[index] = false;
        });
        setErrors(newErrors);
        const nextEmptyIndex = newVerificationCode.findIndex(char => char === '');
        const focusIndex = nextEmptyIndex === -1 ? 5 : nextEmptyIndex;
        inputRefs.current[focusIndex]?.focus();
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault(); // Prevent default form submission
        const enteredCode = verificationCode.join('');

        if (enteredCode.length < 6) {
            setLengthError('Verification code must be 6 digits.');
            return; // Early return if the code is invalid
        }

        // try {
        //     setLoading(true);
        //     const payload = { email: email, fp_code: enteredCode };

        //     const response = await fetch(`${API_BASE_URL}/otp-verify`, {
        //         method: 'POST',
        //         headers: {
        //             'Accept': 'application/json',
        //             'Content-Type': 'application/json',
        //         },
        //         body: JSON.stringify(payload),
        //     });

        //     if (!response.ok) {
        //         throw new Error('Network response was not ok');
        //     }

        //     const data = await response.json();
        //     if (data) {
        //         if (email) {
        //             handlePasswordSetOpen(email, enteredCode);
        //             setVerificationCode(['', '', '', '', '', '']);
        //             inputRefs.current[0]?.focus();
        //         } else {
        //             setResponseError('Email is not provided.');
        //         }
        //     }
        //     console.log(data);
        // } catch (error) {
        //     setResponseError('An unexpected error occurred. Please try again.');
        // } finally {
        //     setLoading(false); 
        // }
        handlePasswordSetOpen('okoer', enteredCode);
    };

    const handleResendCode = async () => {
        console.log('Resending verification code to:', email);
    };

    return (
        <Dialog
            open={forgotVerificationOpen}
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
                    <Typography fontFamily={'Montserrat'} fontSize={24} fontWeight={700} textAlign={'center'} id="dialog-title">
                        Verification Code for Password Reset 
                    </Typography>
                    <Typography fontFamily={'Montserrat'} textAlign={'center'} id="dialog-description">
                        Enter the 6 digits code sent to your email {email}.
                    </Typography>
                    
                </Box>
                <Box my={2}>
                    <Divider>
                        <Chip label="Or" size="small" sx={{fontFamily:'Montserrat'}} />
                    </Divider>
                </Box>
                <form onSubmit={handleSubmit}>
                    <Box>
                        <Grid container spacing={1} justifyContent="center">
                            {verificationCode.map((digit, index) => (
                                <Grid item key={index} xs={2}>
                                    <TextField
                                        inputRef={el => inputRefs.current[index] = el}
                                        id={`verification-${index}`}
                                        type="text"
                                        inputProps={{ maxLength: 1 }}
                                        value={digit}
                                        onChange={(e) => handleVerificationChange(index, e.target.value)}
                                        onKeyDown={(e) => handleKeyDown(index, e as React.KeyboardEvent<HTMLInputElement>)}
                                        onPaste={handlePaste}
                                        error={errors[index]}
                                        helperText={errors[index] ? 'Invalid code' : ''}
                                        sx={{
                                            width: '100%',
                                            height: '100%',
                                            textAlign: 'center',
                                            '.MuiInputBase-input': {
                                                textAlign: 'center',
                                                background: 'transparent',
                                                fontWeight: 700,
                                            },
                                            borderRadius: 1,
                                            border: `1px solid #d0d0d0`,
                                        }}
                                    />
                                </Grid>
                            ))}
                        </Grid>
                        <Box mt={2}>
                            {lengthError && (
                                <Typography fontFamily={'Montserrat'} fontWeight={700} color="red" textAlign="center">{lengthError}</Typography>
                            )}
                            {responseError && (
                                <Typography fontFamily={'Montserrat'} fontWeight={700} color="red" textAlign="center">{responseError}</Typography>
                            )}
                        </Box>
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
                                    {loading ? 'Verifying...' : 'Verify Code'}
                                </Typography>
                                <i className="bi bi-arrow-right"></i>
                            </Box>
                            <Box display={'flex'} justifyContent={'center'} alignItems={'center'} my={3}>
                                <Link onClick={handleResendCode} underline="hover" color="inherit">
                                    <Typography fontFamily={'Montserrat'} fontWeight={700}>Resend Verification Code</Typography>
                                </Link>
                            </Box>
                            <Box my={2}>
                                <Divider />
                            </Box>
                            <Box display={'flex'} justifyContent={'center'} alignItems={'center'}>
                                <span> Secure by <span style={{fontWeight:700}}>Websparks</span> </span>
                            </Box>
                        </Box>
                    </Box>
                </form>
            </Box>
        </Dialog>
    );
};

export default ForgetVerficationCode;
