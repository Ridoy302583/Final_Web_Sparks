import { Box, Grid, Typography, useTheme } from '@mui/material';
import { useEffect, useState } from 'react';
import Google from '../../../icons/google.png';
import Github from '../../../icons/github.png';
// import { useNavigate } from 'react-router-dom';
import { useGoogleLogin } from '@react-oauth/google';
interface CodeResponse {
    access_token: string;
}

interface GithubData {
    fullName: string;
    Email: string;
    ProfilePicture:string;
}

const SocialLogin = () => {
    const theme = useTheme();
    const [user, setUser] = useState<CodeResponse | null>(null);
    const [guthubData, setGithubData] = useState<GithubData | null>(null)

    const googleLogin = useGoogleLogin({
        onSuccess: (codeResponse: CodeResponse) => {
            console.log(codeResponse);
            setUser(codeResponse);
        },
        onError: (error: unknown) => console.log('Login Failed:', error),
    });

    // Create a separate click handler that uses the googleLogin function
    const handleGoogleLogin = () => {
        console.log("Clicked");
        googleLogin(); // Call the function returned by useGoogleLogin/
    };

    // const GITHUB_CLIENT_ID = 'Ov23lidS8sgRLAPkYCCh';
    // const REDIRECT_URI = `http://localhost:5173/auth/github`;
    
    // useEffect(() => {
    //     if (user) {
    //         axios
    //             .get(`https://www.googleapis.com/oauth2/v1/userinfo?access_token=${user.access_token}`, {
    //                 headers: {
    //                     Authorization: `Bearer ${user.access_token}`,
    //                     Accept: 'application/json',
    //                 },
    //             })
    //             .then((res) => {
    //                 console.log(res.data)
    //                 sendLogin(res.data.name, res.data.picture, res.data.email, '');
    //             })
    //             .catch((err) => console.log(err));
    //     }
    // }, [user]);

    // const sendLogin = async (full_name: string, profile_pic: string, email: string, password: string | null) => {
    //     try {
    //         const response = await fetch(`${API_BASE_URL}/google-sign`, {
    //             method: 'POST',
    //             headers: {
    //                 'Accept': 'application/json',
    //                 'Content-Type': 'application/json',
    //             },
    //             body: JSON.stringify({ full_name, profile_pic, email, password }),
    //         });
    //         if (!response.ok) {
    //             const errorData = await response.json();
    //             console.log(errorData.detail)
    //             throw new Error(errorData.detail || 'Something went wrong');
    //         }
    //         const result = await response.json();
    //         console.log(result);
    //         const access_token = result.access_token;
    //         localStorage.setItem('token', access_token);
    //         localStorage.setItem('default_project', result.default_project_id);
    //         if (access_token) {
    //             window.location.reload();
    //         }
    //         return result;
    //     } catch (error) {
    //         throw error;
    //     }
    // };


    // const handleGitHubLogin = () => {
    //     const githubAuthUrl = `https://github.com/login/oauth/authorize?client_id=${GITHUB_CLIENT_ID}&redirect_uri=${encodeURIComponent(
    //         REDIRECT_URI
    //     )}&scope=user`;
    //     window.location.href = githubAuthUrl;
    // };

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
                    // onClick={handleGitHubLogin}
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
        </Grid>
    );
};

export default SocialLogin;
