import { useStore } from '@nanostores/react';
import { ClientOnly } from 'remix-utils/client-only';
import { Box, Link, Typography } from '@mui/material';
import Logo from 'icons/logo.svg'
import { chatStore } from '~/lib/stores/chat';
import { classNames } from '~/utils/classNames';
import { HeaderActionButtons } from './HeaderActionButtons.client';
import { ChatDescription } from '~/lib/persistence/ChatDescription.client';

export function Header() {
  const chat = useStore(chatStore);

  return (
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
        <Box component={'div'} className="i-ph:sidebar-simple-duotone text-xl" style={{display:'none'}} />
        <a href="/" className="text-2xl font-semibold text-accent flex items-center">
          <Box display={'flex'} gap={1} alignItems={'center'}>
            <Box component={'img'} src={Logo} width={30} height={40} />
            <Typography>Websparks</Typography>
          </Box>
        </a>
      </div>
      <span className="flex-1 px-4 truncate text-center text-bolt-elements-textPrimary">
        <ClientOnly>{() => <ChatDescription />}</ClientOnly>
      </span>
      {chat.started ? (
        <ClientOnly>
          {() => (
            <div className="mr-1">
              <HeaderActionButtons />
            </div>
          )}
        </ClientOnly>
      ):(
        <Box display={'flex'} gap={1} alignItems={'center'}>
          <Link href="/" underline='none'>
            <Box border={'1px solid'} borderRadius={2} py={0.5} px={2} className={'border border-bolt-elements-borderColor'}>
              <Typography className='text-bolt-elements-textPrimary'>Login</Typography>
            </Box>
          </Link>
          <Link href="/" underline='none'>
            <Box border={'1px solid'} borderRadius={2} py={0.5} px={2} className={'border border-bolt-elements-textPrimary bg-bolt-elements-textPrimary'}>
              <Typography className={'text-bolt-elements-bg-depth-1'}>Sign Up</Typography>
            </Box>
          </Link>
        </Box>
      )}

    </header>
  );
}
