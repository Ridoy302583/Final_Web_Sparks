import { useStore } from '@nanostores/react';
import { ClientOnly } from 'remix-utils/client-only';
import { Box, Link, Typography } from '@mui/material';
import Logo from 'icons/logo.svg'
import { chatStore } from '~/lib/stores/chat';
import { classNames } from '~/utils/classNames';
import { HeaderActionButtons } from './HeaderActionButtons.client';
import { ChatDescription } from '~/lib/persistence/ChatDescription.client';
import Login from '../auth/Login';
import { useState } from 'react';
import SignUp from '../auth/SignUp';
import VerificationCode from '../auth/VerificationCode';
import EnterEmail from '../auth/ForgotPass/EnterEmail';
import ForgetVerficationCode from '../auth/ForgotPass/ForgetVerficationCode';
import PasswordSet from '../auth/ForgotPass/PasswordSet';
import useAuth from '../auth/useAuth';
import useUser from '~/types/user';

interface HeaderProps {
  // Email verification states
  forgotVerificationEmail: string | null;
  setForgotVerificationEmail: (email: string | null) => void;
  verificationEmail: string | null;
  setVerificationEmail: (email: string | null) => void;

  // Verification code state
  forgotPassCode: string | null;
  setForgotPassCode: (code: string | null) => void;

  // Modal open/close states
  isStreaming: boolean;
  signinOpen: boolean;
  setSignInOpen: (open: boolean) => void;
  signUpOpen: boolean;
  setSignUpOpen: (open: boolean) => void;
  verficationOpen: boolean;
  setVerificationOpen: (open: boolean) => void;
  enterEmailOpen: boolean;
  setEnterEmailOpen: (open: boolean) => void;
  forgotVerificationOpen: boolean;
  setForgotVerificationOpen: (open: boolean) => void;
  passwordSetOpen: boolean;
  setPasswordSetOpen: (open: boolean) => void;
}
export const Header = ({
  forgotVerificationEmail,
  setForgotVerificationEmail,
  forgotPassCode,
  setForgotPassCode,
  verificationEmail,
  setVerificationEmail,
  isStreaming,
  signinOpen,
  setSignInOpen,
  signUpOpen,
  setSignUpOpen,
  verficationOpen,
  setVerificationOpen,
  enterEmailOpen,
  setEnterEmailOpen,
  forgotVerificationOpen,
  setForgotVerificationOpen,
  passwordSetOpen,
  setPasswordSetOpen
}: HeaderProps) => {
  const chat = useStore(chatStore);
  const { authState, logout } = useAuth();
  const { user, loading, error, getStoredToken } = useUser();
  const tokendata = getStoredToken();

  const handleSignInOpen = () => {
    setSignInOpen(true);
  }

  const handleSignInClose = () => {
    setSignUpOpen(false);
    setSignInOpen(false);
  };
  const handleSignUpOpen = () => {
    setSignUpOpen(true);
    setSignInOpen(false);
  };
  const handleSignUpClose = () => {
    setSignInOpen(false);
    setSignUpOpen(false);
  };

  const handleEnterEmailOpen = () => {
    setEnterEmailOpen(true);
    setSignInOpen(false);
  };

  const handleForgotVerificationOpen = (email: string) => {
    setForgotVerificationEmail(email)
    setForgotVerificationOpen(true);
    setEnterEmailOpen(false);
  };

  const handlePasswordSetOpen = (email: string, code: string) => {
    setForgotVerificationEmail(email);
    setForgotPassCode(code);
    setPasswordSetOpen(true);
    setEnterEmailOpen(false);
    setForgotVerificationOpen(false)
  };

  const handleEnterEmailClose = () => {
    setEnterEmailOpen(false);
    setSignInOpen(false);
  };

  const handleVerficationOpen = (email: string) => {
    setVerificationEmail(email);
    setVerificationOpen(true);
    setSignUpOpen(false);
  };
  const handleVerficationClose = () => {
    setVerificationOpen(false);
    setSignUpOpen(false);
    setSignInOpen(false);
  };

  console.log(authState)
  console.log("Streanibg:",isStreaming)
  console.log(getStoredToken())

  return (
    <>
      <header
        className={classNames(
          'flex items-center bg-bolt-elements-background-depth-1 p-5 border-b h-[var(--header-height)]',
          {
            'border-transparent': !chat.started,
            'border-bolt-elements-borderColor': chat.started,
          },
        )}
      >
        <div className="flex items-center gap-2 z-logo text-bolt-elements-textPrimary cursor-pointer">
          {/* <Box component={'div'} onClick={()=>handleChatStatus()} className="i-ph:sidebar-simple-duotone text-xl" style={{ display: chat.started ? 'block':'none' }} /> */}
          <a href="/" className="text-2xl font-semibold text-accent flex items-center">
            <Box display={'flex'} gap={1} alignItems={'center'}>
              <Box component={'img'} src={Logo} width={30} height={40} />
              <Typography fontFamily={'Montserrat'} fontWeight={700}>Websparks</Typography>
            </Box>
          </a>
        </div>
        <span className="flex-1 px-4 truncate text-center text-bolt-elements-textPrimary">
          <ClientOnly>{() => <ChatDescription />}</ClientOnly>
        </span>
        {chat.started && (
          <ClientOnly>
            {() => (
              <div className="mr-1">
                <HeaderActionButtons />
              </div>
            )}
          </ClientOnly>
        )}
        {!authState.access_token && !tokendata && (
          <Box display={'flex'} gap={1} alignItems={'center'}>
            <Box onClick={() => handleSignInOpen()} sx={{ cursor: 'pointer' }}>
              <Box border={'1px solid'} borderRadius={2} py={0.5} px={2} className={'border border-bolt-elements-borderColor'}>
                <Typography fontFamily={'Montserrat'} className='text-bolt-elements-textPrimary'>Login</Typography>
              </Box>
            </Box>
            <Box onClick={() => handleSignUpOpen()} sx={{ cursor: 'pointer' }}>
              <Box border={'1px solid'} borderRadius={2} py={0.5} px={2} className={'border border-bolt-elements-textPrimary bg-bolt-elements-textPrimary'}>
                <Typography fontFamily={'Montserrat'} className={'text-bolt-elements-bg-depth-1'}>Sign Up</Typography>
              </Box>
            </Box>
          </Box>
        )}
      </header>
      <Login
        signinOpen={signinOpen}
        handleSignInClose={handleSignInClose}
        handleSignUpOpen={handleSignUpOpen}
        handleEnterEmailOpen={handleEnterEmailOpen}
      />
      <SignUp
        signUpOpen={signUpOpen}
        handleSignUpClose={handleSignUpClose}
        handleSignInOpen={handleSignInOpen}
        handleVerficationOpen={handleVerficationOpen}
      />
      <VerificationCode
        verificationOpen={verficationOpen}
        handleVerificationOpen={handleVerficationOpen}
        email={verificationEmail}
        handleSignInOpen={handleSignInOpen}
        handleVerficationClose={handleVerficationClose}
      />
      <EnterEmail
        enterEmailOpen={enterEmailOpen}
        handleEnterEmailClose={handleEnterEmailClose}
        handleForgotVerificationOpen={handleForgotVerificationOpen}
      />

      <ForgetVerficationCode
        forgotVerificationOpen={forgotVerificationOpen}
        email={forgotVerificationEmail}
        handlePasswordSetOpen={handlePasswordSetOpen}
      />

      <PasswordSet
        passwordSetOpen={passwordSetOpen}
        email={forgotVerificationEmail}
        code={forgotPassCode}
        handleSignInOpen={handleSignInOpen}
      />
    </>
  );
}
