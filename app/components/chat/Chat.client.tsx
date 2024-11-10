//
// Preventing TS checks with files presented in the video for a better presentation.
import { useStore } from '@nanostores/react';
import type { Message } from 'ai';
import { useChat } from 'ai/react';
import { useAnimate } from 'framer-motion';
import { memo, useEffect, useRef, useState } from 'react';
import { cssTransition, toast, ToastContainer } from 'react-toastify';
import { useMessageParser, usePromptEnhancer, useShortcuts, useSnapScroll } from '~/lib/hooks';
import { useChatHistory } from '~/lib/persistence';
import { chatStore } from '~/lib/stores/chat';
import { workbenchStore } from '~/lib/stores/workbench';
import { fileModificationsToHTML } from '~/utils/diff';
import { DEFAULT_MODEL, DEFAULT_PROVIDER, type Provider } from '~/utils/constants';
import { cubicEasingFn } from '~/utils/easings';
import { createScopedLogger, renderLogger } from '~/utils/logger';
import { BaseChat } from './BaseChat';
import useUser from '~/types/user';
import { isValidFileType } from '~/utils/fileValidation';
import { eventBus, type WebcontainerErrorEvent } from '~/lib/event';
import { webcontainer } from '~/lib/webcontainer';

const toastAnimation = cssTransition({
  enter: 'animated fadeInRight',
  exit: 'animated fadeOutRight',
});

const logger = createScopedLogger('Chat');

interface Props{
  setSignInOpen: (open: boolean) => void;
}

export const Chat:React.FC <Props> =({setSignInOpen})=> {
  renderLogger.trace('Chat');

  const { ready, initialMessages, storeMessageHistory } = useChatHistory();

  return (
    <>
      {ready && <ChatImpl setSignInOpen={setSignInOpen} initialMessages={initialMessages} storeMessageHistory={storeMessageHistory} />}
      <ToastContainer
        closeButton={({ closeToast }) => {
          return (
            <button className="Toastify__close-button" onClick={closeToast}>
              <div className="i-ph:x text-lg" />
            </button>
          );
        }}
        icon={({ type }) => {
          /**
           * @todo Handle more types if we need them. This may require extra color palettes.
           */
          switch (type) {
            case 'success': {
              return <div className="i-ph:check-bold text-bolt-elements-icon-success text-2xl" />;
            }
            case 'error': {
              return <div className="i-ph:warning-circle-bold text-bolt-elements-icon-error text-2xl" />;
            }
          }

          return undefined;
        }}
        position="bottom-right"
        pauseOnFocusLoss
        transition={toastAnimation}
      />
    </>
  );
}

interface ChatProps {
  initialMessages: Message[];
  storeMessageHistory: (messages: Message[]) => Promise<void>;
  setSignInOpen: (open: boolean) => void;
}

export const ChatImpl = memo(({ initialMessages, storeMessageHistory, setSignInOpen }: ChatProps) => {
  useShortcuts();

  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [chatStarted, setChatStarted] = useState(initialMessages.length > 0);
  const [model, setModel] = useState(DEFAULT_MODEL);

  const { showChat } = useStore(chatStore);

  const [animationScope, animate] = useAnimate();

  const [fileInputs, setFileInputs] = useState<FileList | null>(null);

  const addFiles = (files: FileList) => {
    const isValid = Array.from(files).every(isValidFileType);
    if (!isValid) {
      toast.error("Unsupported file type. Only images, text, pdf, csv, json, xml, and code files are supported.");
      return;
    }

    setFileInputs((prev) => {
      if (prev === null) {
        return files;
      }

      const merged = new DataTransfer();

      for (let i = 0; i < prev.length; i++) {
        merged.items.add(prev[i]);
      }

      for (let i = 0; i < files.length; i++) {
        merged.items.add(files[i]);
      }

      return merged.files;
    });
  }
  const handleFileInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { files } = event.target;
    console.log(files);
    if (files) {
      addFiles(files);
    }
  }

  const removeFile = (index: number) => {
    setFileInputs((prev) => {
      if (prev === null) {
        return null;
      }

      const copy = new DataTransfer();

      for (let i = 0; i < prev.length; i++) {
        if (i !== index) {
          copy.items.add(prev[i]);
        }
      }

      if (copy.items.length === 0) {
        return null;
      }
      return copy.files;
    });
  }

  const { messages, isLoading, input, handleInputChange, setInput, stop, append } = useChat({
    api: '/api/chat',
    onError: (error) => {
      logger.error('Request failed\n\n', error);
      toast.error('There was an error processing your request');
    },
    onFinish: () => {
      logger.debug('Finished streaming');
    },
    initialMessages,
  });

  const { enhancingPrompt, promptEnhanced, enhancePrompt, resetEnhancer } = usePromptEnhancer();
  const { parsedMessages, parseMessages } = useMessageParser();
  const { getStoredToken } = useUser();

  const TEXTAREA_MAX_HEIGHT = chatStarted ? 400 : 200;

  useEffect(() => {
    chatStore.setKey('started', initialMessages.length > 0);
  }, []);

  useEffect(() => {
    parseMessages(messages, isLoading);

    if (messages.length > initialMessages.length) {
      storeMessageHistory(messages).catch((error) => toast.error(error.message));
    }
  }, [messages, isLoading, parseMessages]);

  const scrollTextArea = () => {
    const textarea = textareaRef.current;

    if (textarea) {
      textarea.scrollTop = textarea.scrollHeight;
    }
  };

  const abort = () => {
    stop();
    chatStore.setKey('aborted', true);
    workbenchStore.abortAllActions();
  };

  useEffect(() => {
    const textarea = textareaRef.current;

    if (textarea) {
      textarea.style.height = 'auto';

      const scrollHeight = textarea.scrollHeight;

      textarea.style.height = `${Math.min(scrollHeight, TEXTAREA_MAX_HEIGHT)}px`;
      textarea.style.overflowY = scrollHeight > TEXTAREA_MAX_HEIGHT ? 'auto' : 'hidden';
    }
  }, [input, textareaRef]);

  const runAnimation = async () => {
    if (chatStarted) {
      return;
    }

    await Promise.all([
      animate('#examples', { opacity: 0, display: 'none' }, { duration: 0.1 }),
      animate('#intro', { opacity: 0, flex: 1 }, { duration: 0.2, ease: cubicEasingFn }),
    ]);

    chatStore.setKey('started', true);

    setChatStarted(true);
  };

  const sendMessage = async (_event: React.UIEvent, messageInput?: string) => {
    const _input = messageInput || input;
    const token = getStoredToken();
    
    if (_input.length === 0 || isLoading) {
      return;
    }

    if (!token) {
      console.log('Error: Authentication token not found. Please login to send messages.');
      toast.error('Please login to send messages');
      return;
    }

    try {
      await workbenchStore.saveAllFiles();

      const fileModifications = workbenchStore.getFileModifcations();

      chatStore.setKey('aborted', false);

      runAnimation();

      // Check if the message contains an image
      const hasImage = _input.includes('[Image:');
      let messageContent = `[Model: ${model}]\n\n`;
      
      if (fileModifications !== undefined) {
        const diff = fileModificationsToHTML(fileModifications);
        messageContent += `${diff}\n\n`;
        workbenchStore.resetAllFileModifications();
      }
      else {

        const filePromises: Promise<{
          name?: string;
          contentType?: string;
          url: string;
        }>[] = Array.from(fileInputs || []).map((file) => {
          return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.readAsDataURL(file);
            reader.onload = () => {
              let contentType = file.type || 'text/plain';
              if (contentType === 'application/octet-stream') {
                contentType = 'text/plain';
              }
              if (reader.result === null || typeof reader.result !== 'string') {
                reject(new Error('Failed to read file'));
                return;
              }
              resolve({
                name: file.name,
                contentType: contentType,
                url: reader.result
              });
            };
            reader.onerror = reject;
          });
        });
  
        const experimental_attachments: {
          name?: string;
          contentType?: string;
          url: string;
        }[] = await Promise.all(filePromises);
        append({
          role: 'user',
          content: `[Model: ${model}]\n\n${_input}`,
          experimental_attachments: experimental_attachments
        });
      }

      // console.log("messageContent: ", messageContent)

      // append({ 
      //   role: 'user', 
      //   content: messageContent
      // });
      setFileInputs(null);
      setInput('');
      resetEnhancer();
      textareaRef.current?.blur();
      
    } catch (error) {
      console.error('Error sending message:', error);
      toast.error('Failed to send message');
    }
  };

  const [messageRef, scrollRef] = useSnapScroll();

  useEffect(() => {
    const sentErrors = new Set<string>();
    let currentToastId: Id = -1;

    const handleWebcontainerError = (event: WebcontainerErrorEvent) => {
      const newErrors = event.messages.filter((msg: string) => !sentErrors.has(msg));
      if (newErrors.length === 0) return;
      newErrors.forEach((msg: string) => sentErrors.add(msg));

      const joinedErrors = Array.from(sentErrors).join('\n');
      const errorElement = <div className="flex flex-col gap-2">
        <div>Ran into errors while executing the command:</div>
        <div className="text-sm text-bolt-elements-textSecondary">
          {newErrors[0].slice(0, 100)}
          {newErrors[0].length > 100 && '...'}

          {newErrors.length > 1 && ` (+${newErrors.length - 1} more)`}
        </div>
        <button
          onClick={() => {
            const errorMessage = `The following errors occurred while running the command:\n${joinedErrors}\n\nHow can we fix these errors?`;
            sentErrors.clear();
            toast.dismiss(currentToastId);
            currentToastId = -1;
            append({
              role: 'user',
              content: `[Model: ${provider}-${model}]\n\n${errorMessage}`
            });
          }}
          className="px-3 py-1.5 bg-bolt-elements-button-primary-background hover:bg-bolt-elements-button-primary-backgroundHover text-bolt-elements-button-primary-text rounded-md text-sm font-medium"
        >
          Fix errors
        </button>
      </div>;

      if (currentToastId !== -1) {
        toast.update(currentToastId, {
          render: errorElement
        });
        return;
      } else {
        currentToastId = toast.error(
          errorElement,
          {
            autoClose: false,
            closeOnClick: false
          }
        );
      }
    };

    webcontainer.then(() => {
      eventBus.on('webcontainer-error', handleWebcontainerError);
    });

    return () => {
      webcontainer.then(() => {
        eventBus.off('webcontainer-error', handleWebcontainerError);
      });
    };
  }, [append]);

  const [provider, setProvider] = useState(DEFAULT_PROVIDER);

  const setProviderModel = (provider: string, model: string) => {
    setProvider(provider as Provider);
    setModel(model);
  }

  return (
    <BaseChat
      ref={animationScope}

      fileInputRef={fileInputRef}
      fileInputs={fileInputs}
      removeFile={removeFile}
      handleFileInputChange={handleFileInputChange}

      textareaRef={textareaRef}
      input={input}
      showChat={showChat}
      chatStarted={chatStarted}
      isStreaming={isLoading}
      enhancingPrompt={enhancingPrompt}
      promptEnhanced={promptEnhanced}
      sendMessage={sendMessage}
      setSignInOpen={setSignInOpen}
      model={model}
      setModel={setModel}
      messageRef={messageRef}
      scrollRef={scrollRef}
      handleInputChange={handleInputChange}
      handleStop={abort}
      messages={messages.map((message, i) => {
        if (message.role === 'user') {
          return message;
        }

        return {
          ...message,
          content: parsedMessages[i] || '',
        };
      })}
      enhancePrompt={() => {
        enhancePrompt(input, (input) => {
          setInput(input);
          scrollTextArea();
        });
      }}
    />
  );
});