import type { Message } from 'ai';
import React from 'react';
import { classNames } from '~/utils/classNames';
import { AssistantMessage } from './AssistantMessage';
import { UserMessage } from './UserMessage';
import useUser from '~/types/user';
import { Box, CircularProgress } from '@mui/material';

interface MessagesProps {
  id?: string;
  className?: string;
  isStreaming?: boolean;
  messages?: Message[];
}

export const Messages = React.forwardRef<HTMLDivElement, MessagesProps>((props: MessagesProps, ref) => {
  const { id, isStreaming = false, messages = [] } = props;
  const { user, loading, error, getStoredToken } = useUser();
  return (
    <div id={id} ref={ref} className={props.className} >
      {messages.length > 0
        ? messages.map((message, index) => {
            const { role, content } = message;
            const isUserMessage = role === 'user';
            const isFirst = index === 0;
            const isLast = index === messages.length - 1;

            return (
              <div
                key={index}
                className={classNames('flex gap-4 p-6 w-full rounded-[calc(0.75rem-1px)]', {
                  'bg-bolt-elements-messages-background': isUserMessage || !isStreaming || (isStreaming && !isLast),
                  'bg-gradient-to-b from-bolt-elements-messages-background from-30% to-transparent':
                    isStreaming && isLast,
                  'mt-4': !isFirst,
                })}
              >
                {isUserMessage && (
                  <div className="mt-1.5 flex items-center justify-center w-[20px] h-[20px] overflow-hidden bg-white text-gray-600 rounded-full shrink-0 self-start">
                    {user?.profile_pic && (
                      <Box
                        component="img"
                        height={20}
                        width={20}
                        borderRadius={2}
                        src={user.profile_pic}
                        alt={user.full_name}
                      />
                    )}
                    {/* <div className="i-ph:user-fill text-xl"></div> */}
                  </div>
                )}
                <div className="grid grid-col-1 w-full">
                  {isUserMessage ? <UserMessage content={content} /> : <AssistantMessage content={content} />}
                </div>
              </div>
            );
          })
        : null}
      {isStreaming && (
        <div className="text-center w-full text-bolt-elements-textSecondary i-svg-spinners:3-dots-fade text-4xl mt-4"></div>
        // <CircularProgress size={18} thickness={2} color='success' />
      )}
    </div>
  );
});
