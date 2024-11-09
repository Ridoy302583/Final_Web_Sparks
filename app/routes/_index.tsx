import { json, type MetaFunction } from '@remix-run/cloudflare';
import { useState } from 'react';
import { ClientOnly } from 'remix-utils/client-only';
import { BaseChat } from '~/components/chat/BaseChat';
import { Chat } from '~/components/chat/Chat.client';
import { Header } from '~/components/header/Header';

export const meta: MetaFunction = () => {
  return [{ title: 'Websparks AI Agent' }, { name: 'description', content: 'Talk with Websparks AI Agent, an AI assistant from Websparks Corporations' }];
};

export const loader = () => json({});

export default function Index() {
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
  const [isStreaming, setIsStreaming] = useState(false);

  return (
    <div className="flex flex-col h-full w-full">
      <Header 
        forgotVerificationEmail={forgotVerificationEmail}
        setForgotVerificationEmail={setForgotVerificationEmail}
        forgotPassCode={forgotPassCode}
        setForgotPassCode={setForgotPassCode}
        verificationEmail={verificationEmail}
        setVerificationEmail={setVerificationEmail}
        signinOpen={signinOpen}
        setSignInOpen={setSignInOpen}
        signUpOpen={signUpOpen}
        setSignUpOpen={setSignUpOpen}
        verficationOpen={verficationOpen}
        setVerificationOpen={setVerificationOpen}
        enterEmailOpen={enterEmailOpen}
        setEnterEmailOpen={setEnterEmailOpen}
        forgotVerificationOpen={forgotVerificationOpen}
        setForgotVerificationOpen={setForgotVerificationOpen}
        passwordSetOpen = {passwordSetOpen}
        setPasswordSetOpen={setPasswordSetOpen}
        isStreaming = {isStreaming}
      />
      <ClientOnly fallback={
        <BaseChat setIsStreaming={setIsStreaming} setSignInOpen={setSignInOpen} chatStarted = {chatStarted} onChatStatusChange={() => setChatStarted(prev => !prev)} />}>{() => 
        <Chat setSignInOpen={setSignInOpen} />
        }
      </ClientOnly>
    </div>
  );
}
