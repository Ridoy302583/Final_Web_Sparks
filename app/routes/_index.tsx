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
  return (
    <div className="flex flex-col h-full w-full">
      <Header chatStarted={chatStarted} onChatStatusChange={() => setChatStarted(prev => !prev)} />
      <ClientOnly fallback={<BaseChat chatStarted = {chatStarted} onChatStatusChange={() => setChatStarted(prev => !prev)} />}>{() => <Chat />}</ClientOnly>
    </div>
  );
}
