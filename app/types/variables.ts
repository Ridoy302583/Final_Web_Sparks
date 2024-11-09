// src/hooks/variables.ts

import { useState } from 'react';

interface VariablesState {
  chatStarted: boolean;
  forgotVerificationEmail: string | null;
  forgotPassCode: string | null;
  verificationEmail: string | null;
  signinOpen: boolean;
  signUpOpen: boolean;
  verficationOpen: boolean;
  enterEmailOpen: boolean;
  forgotVerificationOpen: boolean;
  passwordSetOpen: boolean;
}

interface VariablesStateActions {
  setChatStarted: (value: boolean) => void;
  setForgotVerificationEmail: (value: string | null) => void;
  setForgotPassCode: (value: string | null) => void;
  setVerificationEmail: (value: string | null) => void;
  setSignInOpen: (value: boolean) => void;
  setSignUpOpen: (value: boolean) => void;
  setVerificationOpen: (value: boolean) => void;
  setEnterEmailOpen: (value: boolean) => void;
  setForgotVerificationOpen: (value: boolean) => void;
  setPasswordSetOpen: (value: boolean) => void;
  toggleChatStarted: () => void;
}

export const useVariablesState = (): [VariablesState, VariablesStateActions] => {
  const [chatStarted, setChatStarted] = useState(false);
  const [forgotVerificationEmail, setForgotVerificationEmail] = useState<string | null>(null);
  const [forgotPassCode, setForgotPassCode] = useState<string | null>(null);
  const [verificationEmail, setVerificationEmail] = useState<string | null>(null);
  const [signinOpen, setSignInOpen] = useState(false);
  const [signUpOpen, setSignUpOpen] = useState(false);
  const [verficationOpen, setVerificationOpen] = useState(false);
  const [enterEmailOpen, setEnterEmailOpen] = useState(false);
  const [forgotVerificationOpen, setForgotVerificationOpen] = useState(false);
  const [passwordSetOpen, setPasswordSetOpen] = useState(false);

  const toggleChatStarted = () => setChatStarted(prev => !prev);

  const state: VariablesState = {
    chatStarted,
    forgotVerificationEmail,
    forgotPassCode,
    verificationEmail,
    signinOpen,
    signUpOpen,
    verficationOpen,
    enterEmailOpen,
    forgotVerificationOpen,
    passwordSetOpen,
  };

  const actions: VariablesStateActions = {
    setChatStarted,
    setForgotVerificationEmail,
    setForgotPassCode,
    setVerificationEmail,
    setSignInOpen,
    setSignUpOpen,
    setVerificationOpen,
    setEnterEmailOpen,
    setForgotVerificationOpen,
    setPasswordSetOpen,
    toggleChatStarted,
  };

  return [state, actions];
};