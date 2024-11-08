// @ts-nocheck
// Preventing TS checks with files presented in the video for a better presentation.
import type { Message } from 'ai';
import React, { type RefCallback, useRef } from 'react';
import { ClientOnly } from 'remix-utils/client-only';
import { Menu } from '~/components/sidebar/Menu.client';
import { IconButton } from '~/components/ui/IconButton';
import { Workbench } from '~/components/workbench/Workbench.client';
import { classNames } from '~/utils/classNames';
import { MODEL_LIST, DEFAULT_PROVIDER } from '~/utils/constants';
import { Messages } from './Messages.client';
import { SendButton } from './SendButton.client';
import { useState } from 'react';

import styles from './BaseChat.module.scss';
import { Box, Link, Typography, Tooltip, Grid } from '@mui/material';

const EXAMPLE_PROMPTS = [
  { text: 'Build a todo app in React using Tailwind' },
  { text: 'Build a simple blog using Astro' },
  { text: 'Create a cookie consent form using Material UI' },
  { text: 'Make a space invaders game' },
  { text: 'How do I center a div?' },
];

const providerList = [...new Set(MODEL_LIST.map((model) => model.provider))]

const ModelSelector = ({ model, setModel, modelList, providerList }) => {
  const [provider, setProvider] = useState(DEFAULT_PROVIDER);
  return (
    <div className="mb-2">
      <select
        value={provider}
        onChange={(e) => {
          setProvider(e.target.value);
          const firstModel = [...modelList].find(m => m.provider == e.target.value);
          setModel(firstModel ? firstModel.name : '');
        }}
        className="w-full p-2 rounded-lg border border-bolt-elements-borderColor bg-bolt-elements-prompt-background text-bolt-elements-textPrimary focus:outline-none"
      >
        {providerList.map((provider) => (
          <option key={provider} value={provider}>
            {provider}
          </option>
        ))}
        <option key="Ollama" value="Ollama">
          Ollama
        </option>
        <option key="OpenAILike" value="OpenAILike">
          OpenAILike
        </option>
      </select>
      <select
        value={model}
        onChange={(e) => setModel(e.target.value)}
        className="w-full p-2 rounded-lg border border-bolt-elements-borderColor bg-bolt-elements-prompt-background text-bolt-elements-textPrimary focus:outline-none"
      >
        {[...modelList].filter(e => e.provider == provider && e.name).map((modelOption) => (
          <option key={modelOption.name} value={modelOption.name}>
            {modelOption.label}
          </option>
        ))}
      </select>
    </div>
  );
};



const TEXTAREA_MIN_HEIGHT = 76;

interface BaseChatProps {
  textareaRef?: React.RefObject<HTMLTextAreaElement> | undefined;
  messageRef?: RefCallback<HTMLDivElement> | undefined;
  scrollRef?: RefCallback<HTMLDivElement> | undefined;
  showChat?: boolean;
  chatStarted?: boolean;
  isStreaming?: boolean;
  messages?: Message[];
  enhancingPrompt?: boolean;
  promptEnhanced?: boolean;
  input?: string;
  model: string;
  setModel: (model: string) => void;
  handleStop?: () => void;
  sendMessage?: (event: React.UIEvent, messageInput?: string) => void;
  handleInputChange?: (event: React.ChangeEvent<HTMLTextAreaElement>) => void;
  enhancePrompt?: () => void;
}

const footerLinks = [
  {
    label: `pricing`,
    url: '/pricing'
  },
  {
    label: `enterprice`,
    url: '#'
  },
  {
    label: `faq`,
    url: '#'
  },
  {
    label: `terms`,
    url: '#'
  },
  {
    label: `privacy`,
    url: '#'
  },
  {
    label: 'Websparks',
    url: '#',
    external: true
  },
];

const ProcessingCard = ({ title, subtitle, children }) => (
  <div className="relative rounded-3xl p-6 w-64 bg-bolt-elements-background-depth-2">
    <div className="space-y-1 mb-8">
      <p className="text-xs text-zinc-500">{subtitle}</p>
      <p className="font-medium text-bolt-elements-textPrimary">{title}</p>
    </div>

    <div className="flex items-center justify-center h-40">
      {children}
    </div>

    <div className="absolute bottom-6 left-6 right-6">
      <div className="flex items-center justify-between text-xs text-zinc-500">
        <span>time</span>
        <span>Processing 90%</span>
      </div>
    </div>
  </div>
);

export const BaseChat = React.forwardRef<HTMLDivElement, BaseChatProps>(
  (
    {
      textareaRef,
      messageRef,
      scrollRef,
      showChat = true,
      chatStarted = false,
      isStreaming = false,
      enhancingPrompt = false,
      promptEnhanced = false,
      messages,
      input = '',
      model,
      setModel,
      sendMessage,
      handleInputChange,
      enhancePrompt,
      handleStop,
    },
    ref,
  ) => {
    const TEXTAREA_MAX_HEIGHT = chatStarted ? 400 : 200;
    const fileInputRef = useRef<HTMLInputElement | null>(null);
    const [anchorE2, setAnchorE2] = React.useState<null | HTMLElement>(null);
    const open = Boolean(anchorE2);
    const handleSelectClick = (event: React.MouseEvent<HTMLElement>) => {
      console.log("Ok")
      setAnchorE2(event.currentTarget);
    };
    const handleClose = () => {
      setAnchorE2(null);
    };
    const handleClick = () => {
      if (fileInputRef.current) {
        fileInputRef.current.click();
      }
    };
    const Menu = ({
      anchorE2,
      open,
      onClose,
      children
    }) => {
      if (!open) return null;

      // Get the anchor element's position
      const anchorRect = anchorE2?.getBoundingClientRect();

      return (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 z-40"
            onClick={onClose}
          />

          {/* Menu */}
          <div
            className="absolute z-50 bg-white rounded-lg shadow-lg transform -translate-x-1/2"
            style={{
              top: anchorRect ? `${anchorRect.bottom + 8}px` : '0',
              left: anchorRect ? `${anchorRect.left + anchorRect.width / 2}px` : '0'
            }}
          >
            {children}
          </div>
        </>
      );
    };
    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
      const selectedFiles = event.target.files;
      if (selectedFiles && selectedFiles.length > 0) {
        const selectedFile = selectedFiles[0];
        if (selectedFile.type.startsWith("image/")) {
          const reader = new FileReader();

          reader.onloadend = () => {
            const base64String = reader.result as string;
            setFiles(base64String);
            setAnchorE2(null);
          };

          reader.readAsDataURL(selectedFile);
        } else {
          setFiles(null)
          setAnchorE2(null);
        }
      }
    };
    return (
      <div
        ref={ref}
        className={classNames(
          styles.BaseChat,
          'relative flex h-full w-full overflow-hidden bg-bolt-elements-background-depth-1',
        )}
        data-chat-visible={showChat}
      >
        <ClientOnly>{() => <Menu />}</ClientOnly>
        <div ref={scrollRef} className="flex overflow-y-auto w-full h-full">
          <div className={classNames(styles.Chat, 'flex flex-col flex-grow min-w-[var(--chat-min-width)] h-full')}>
            {!chatStarted && (
              <>
                <div id="intro" className="mt-[5vh] max-w-chat mx-auto">
                  <h1 className="text-5xl text-center font-bold text-bolt-elements-textPrimary mb-2">
                    Where ideas begin
                  </h1>
                  <p className="mb-4 text-center text-bolt-elements-textSecondary">
                    Bring ideas to life in seconds or get help on existing projects.
                  </p>
                </div>
                <div className="flex flex-wrap gap-4 justify-center">
                  <ProcessingCard title="From Figma/Image" subtitle="From Figma/Image">
                    <svg className="w-24 h-24 text-white/80" viewBox="0 0 100 100" stroke="currentColor" fill="none">
                      <path d="M30,30 Q50,10 70,30 Q90,50 70,70 Q50,90 30,70 Q10,50 30,30" strokeWidth="2" />
                      <path d="M40,40 Q50,30 60,40 Q70,50 60,60 Q50,70 40,60 Q30,50 40,40" strokeWidth="2" />
                    </svg>
                  </ProcessingCard>

                  <ProcessingCard title="From Sketch" subtitle="From Sketch">
                    <svg className="w-24 h-24 text-white/80" viewBox="0 0 100 100" stroke="currentColor" fill="none">
                      <path d="M30,50 L70,50" strokeWidth="2" />
                      <path d="M65,45 L70,50 L65,55" strokeWidth="2" />
                    </svg>
                  </ProcessingCard>

                  <ProcessingCard title="From Crawler" subtitle="From Crawler">
                    <svg className="w-24 h-24 text-white/80" viewBox="0 0 100 100" stroke="currentColor" fill="none">
                      <circle cx="50" cy="50" r="30" strokeWidth="2" />
                      <path d="M20,50 L80,50" strokeWidth="2" />
                      <path d="M50,20 L50,80" strokeWidth="2" />
                      <circle cx="50" cy="50" r="40" strokeWidth="2" />
                    </svg>
                  </ProcessingCard>
                </div>
              </>
            )}
            <div
              className={classNames('pt-6 px-6', {
                'h-full flex flex-col': chatStarted,
              })}
            >
              <ClientOnly>
                {() => {
                  return chatStarted ? (
                    <Messages
                      ref={messageRef}
                      className="flex flex-col w-full flex-1 max-w-chat px-4 pb-6 mx-auto z-1"
                      messages={messages}
                      isStreaming={isStreaming}
                    />
                  ) : null;
                }}
              </ClientOnly>
              <div
                className={classNames('relative w-full mx-auto z-prompt', {
                  'sticky bottom-0': chatStarted,
                })}
                style={{
                  maxWidth: 900
                }}
              >
                {/* <ModelSelector
                  model={model}
                  setModel={setModel}
                  modelList={MODEL_LIST}
                  providerList={providerList}
                /> */}
                <div
                  className={classNames(
                    'shadow-sm border border-bolt-elements-borderColor bg-bolt-elements-prompt-background backdrop-filter backdrop-blur-[8px] rounded-lg overflow-hidden',
                  )}
                >
                  <Box
                    width={'100%'}
                    p={2}
                    className={'border-b border-bolt-elements-borderColor'}
                  >
                    <Grid container spacing={2}>
                      <Grid item xs={6} sm={3}>
                        <Box
                          position="relative"
                          width="auto"
                          className={'border border-bolt-elements-borderColor'}
                          borderRadius={2}
                          display="flex"
                          alignItems="center"
                        >
                          <Box
                            component="img"
                            src={""}
                            width={40}
                            height={40}
                            borderRadius={2}
                            m={0.5}
                            sx={{ objectFit: 'cover' }}
                          />

                          <Box>
                            <Typography
                              fontSize={14}
                              sx={{
                                display: '-webkit-box',
                                overflow: 'hidden',
                                WebkitBoxOrient: 'vertical',
                                WebkitLineClamp: 1,
                              }}
                              className={'text-bolt-elements-textPrimary'}
                            >
                              Crawler Image'
                            </Typography>
                            <Typography fontSize={14} className={'text-bolt-elements-textPrimary'}>
                              {/* {((files?.length || 0) / 1024).toFixed(2)} KB */}
                              34 KB
                            </Typography>
                          </Box>
                          <Box
                            position="absolute"
                            width={20}
                            height={20}
                            top={-10}
                            right={-10}
                            display="flex"
                            justifyContent="center"
                            alignItems="center"
                            p={0.3}
                            className={'border border-bolt-elements-borderColor'}
                            borderRadius={25}
                            sx={{
                              background: '#FFF',
                              cursor: 'pointer',
                            }}
                            onClick={() => {
                              // files ? handleRemoveFile() : drawImage ? handleRemoveDrawFile() : handleRemoveCrawlerFile();
                            }}
                          >
                            <i className="bi bi-x"></i>
                          </Box>
                        </Box>
                      </Grid>
                    </Grid>
                  </Box>
                  <textarea
                    ref={textareaRef}
                    className={`w-full pl-4 pt-4 pr-16 focus:outline-none resize-none text-md text-bolt-elements-textPrimary placeholder-bolt-elements-textTertiary bg-transparent`}
                    onKeyDown={(event) => {
                      if (event.key === 'Enter') {
                        if (event.shiftKey) {
                          return;
                        }

                        event.preventDefault();

                        sendMessage?.(event);
                      }
                    }}
                    value={input}
                    onChange={(event) => {
                      handleInputChange?.(event);
                    }}
                    style={{
                      minHeight: TEXTAREA_MIN_HEIGHT,
                      maxHeight: TEXTAREA_MAX_HEIGHT,
                    }}
                    placeholder="Hey! What you want to Build?"
                    translate="no"
                  />
                  <ClientOnly>
                    {() => (
                      <SendButton
                        show={input.length > 0 || isStreaming}
                        isStreaming={isStreaming}
                        onClick={(event) => {
                          if (isStreaming) {
                            handleStop?.();
                            return;
                          }

                          sendMessage?.(event);
                        }}
                      />
                    )}
                  </ClientOnly>
                  <div className="flex justify-between text-sm p-4 pt-2">
                    <div className="flex gap-1 items-center">
                      <IconButton
                        title="Enhance prompt"
                        disabled={input.length === 0 || enhancingPrompt}
                        className={classNames({
                          'opacity-100!': enhancingPrompt,
                          'text-bolt-elements-item-contentAccent! pr-1.5 enabled:hover:bg-bolt-elements-item-backgroundAccent!':
                            promptEnhanced,
                        })}
                        onClick={() => enhancePrompt?.()}
                      >
                        {enhancingPrompt ? (
                          <>
                            <div className="i-svg-spinners:90-ring-with-bg text-bolt-elements-loader-progress text-xl"></div>
                            <div className="ml-1.5">Enhancing prompt...</div>
                          </>
                        ) : (
                          <>
                            <div className="i-bolt:stars text-xl"></div>
                            {promptEnhanced && <div className="ml-1.5">Prompt enhanced</div>}
                          </>
                        )}
                      </IconButton>
                      <button onClick={() => handleSelectClick} className="flex items-center text-bolt-elements-item-contentDefault bg-transparent enabled:hover:text-bolt-elements-item-contentActive rounded-md enabled:hover:bg-bolt-elements-item-backgroundActive disabled:cursor-not-allowed p-1" title="Upload files">
                        <div className="i-ph:link-simple text-xl"></div>
                      </button>
                      <Menu
                        anchorE2={anchorE2}
                        open={Boolean(anchorE2)}
                        onClose={handleClose}
                      >
                        <div className="px-4 py-2 flex items-center gap-4">
                          {/* From Image Option */}
                          <div
                            onClick={handleClick}
                            className="rounded-lg p-4 cursor-pointer hover:bg-gray-100 transition-colors"
                          >
                            <div className="flex justify-center">
                              <span></span>
                            </div>
                            <p className="text-sm mt-2">From Image</p>
                            <input
                              type="file"
                              className="hidden"
                              ref={fileInputRef}
                              onChange={handleFileChange}
                            />
                          </div>

                          {/* From Whiteboard Option */}
                          <div
                            className="rounded-lg p-4 cursor-pointer hover:bg-gray-100 transition-colors"
                          >
                            <div className="flex justify-center">
                              <span></span>
                            </div>
                            <p className="text-sm mt-2">From WhiteBoard</p>
                          </div>

                          {/* From Crawler Option */}
                          <div
                            className="rounded-lg p-4 cursor-pointer hover:bg-gray-100 transition-colors"
                          >
                            <div className="flex justify-center">
                              <span></span>
                            </div>
                            <p className="text-sm mt-2">From Crawler</p>
                          </div>
                        </div>
                      </Menu>
                    </div>
                    {input.length > 3 ? (
                      <div className="text-xs text-bolt-elements-textTertiary">
                        Use <kbd className="kdb">Shift</kbd> + <kbd className="kdb">Return</kbd> for a new line
                      </div>
                    ) : null}
                  </div>
                </div>
                <div className="bg-bolt-elements-background-depth-1 pb-6">{/* Ghost Element */}</div>
              </div>
            </div>
            {!chatStarted && (
              <div id="examples" style={{ maxWidth: 900 }} className="relative w-full mx-auto mt-8 flex justify-center">
                <div className="flex flex-wrap [mask-image:linear-gradient(to_bottom,black_0%,transparent_180%)] hover:[mask-image:none]">
                  {EXAMPLE_PROMPTS.map((examplePrompt, index) => {
                    return (
                      <button
                        key={index}
                        onClick={(event) => {
                          sendMessage?.(event, examplePrompt.text);
                        }}
                        className="group flex items-center gap-2 justify-center bg-transparent text-bolt-elements-textTertiary hover:text-bolt-elements-textPrimary transition-theme"
                      >
                        {examplePrompt.text}
                        <div className="i-ph:arrow-bend-down-left" />
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
          <ClientOnly>{() => <Workbench chatStarted={chatStarted} isStreaming={isStreaming} />}</ClientOnly>
          <Box position={'absolute'} bottom={0} width={'100%'} zIndex={9999} display={'flex'} justifyContent={'center'}>
            <Box display={{ xs: 'none', sm: 'flex' }} gap={1} alignItems="center">
              {footerLinks.map((link, index) => (
                <Box key={link.label} display="flex" alignItems="center">
                  <Link href={link.url} underline="hover" color="inherit">
                    <Typography fontSize={{ xs: 7, sm: 12 }} fontFamily={`"Montserrat", serif;`}>
                      {link.label}
                    </Typography>
                  </Link>
                  {link.external && <i className="bi bi-box-arrow-up-right" style={{ fontSize: 12, marginLeft: 5 }}></i>}
                  {index < footerLinks.length - 1 && (
                    <Typography mx={1} color={``} fontFamily={`"Montserrat", serif;`}>
                      |
                    </Typography>
                  )}
                </Box>
              ))}
            </Box>
          </Box>
        </div>

      </div>
    );
  },
);
