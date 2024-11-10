// Preventing TS checks with files presented in the video for a better presentation.
import type { Message } from 'ai';
import React, { type RefCallback, useRef, useEffect } from 'react';
import { ClientOnly } from 'remix-utils/client-only';
import { MenuComponent } from '~/components/sidebar/Menu.client';
import { IconButton } from '~/components/ui/IconButton';
import { Workbench } from '~/components/workbench/Workbench.client';
import { classNames } from '~/utils/classNames';
import useUser from '~/types/user';
import { useVariablesState } from '~/types/variables';
import { MODEL_LIST, DEFAULT_PROVIDER } from '~/utils/constants';
import { Messages } from './Messages.client';
import { SendButton } from './SendButton.client';
import { useState } from 'react';
import styles from './BaseChat.module.scss';
import { Box, Link, Typography, Tooltip, Grid, Menu, Dialog, Slide } from '@mui/material';
// import { TransitionProps } from "@mui/material/transitions";
import WhiteBoard from './other/WhiteBoard';
import Crawler from './other/Crawler';

const EXAMPLE_PROMPTS = [
  { text: 'Build a todo app in React using Tailwind' },
  { text: 'Build a simple blog using Astro' },
  { text: 'Create a cookie consent form using Material UI' },
];

const TEXTAREA_MIN_HEIGHT = 76;

interface BaseChatProps {
  textareaRef?: React.RefObject<HTMLTextAreaElement> | undefined;

  fileInputRef?: React.RefObject<HTMLInputElement> | undefined;
  fileInputs?: FileList | null;
  removeFile?: (index: number) => void;
  handleFileInputChange?: (event: React.ChangeEvent<HTMLInputElement>) => void;

  messageRef?: RefCallback<HTMLDivElement> | undefined;
  scrollRef?: RefCallback<HTMLDivElement> | undefined;
  showChat?: boolean;
  chatStarted?: boolean;
  onChatStatusChange: () => void;
  isStreaming?: boolean;
  messages?: Message[];
  enhancingPrompt?: boolean;
  promptEnhanced?: boolean;
  input?: string;
  model: string;
  setModel: (model: string) => void;
  handleStop?: () => void;
  setSignInOpen: (open: boolean) => void;
  setIsStreaming: (open: boolean) => void;
  sendMessage?: (event: React.UIEvent, messageInput?: string) => void;
  handleInputChange?: (event: React.ChangeEvent<HTMLTextAreaElement>) => void;
  enhancePrompt?: () => void;
}

const footerLinks = [
  {
    label: `Pricing`,
    url: '/pricing'
  },
  {
    label: `Enterprice`,
    url: '#'
  },
  {
    label: `FAQ`,
    url: '#'
  },
  {
    label: `Terms`,
    url: '#'
  },
  {
    label: `Privacy`,
    url: '#'
  },
  {
    label: 'Websparks',
    url: '#',
    external: true
  },
];


import type { SlideProps } from "@mui/material/Slide";
import Icon from '@mdi/react';
import { mdiImageSizeSelectActual, mdiLinkBoxVariant, mdiPencilBox } from '@mdi/js';
import MediaFile from './MediaFile';
import PricingPlans from '../others/pricing';

// Update the type definition
type TransitionProps = Omit<SlideProps, 'direction'>;

const Transition = React.forwardRef(function Transition(
  props: TransitionProps & {
    children: React.ReactElement<unknown>;
  },
  ref: React.Ref<unknown>,
) {
  return <Slide direction="up" ref={ref} {...props} />;
});

export const BaseChat = React.forwardRef<HTMLDivElement, BaseChatProps>(
  (
    {
      textareaRef,
      messageRef,
      scrollRef,

      fileInputRef,
      fileInputs,
      removeFile,
      handleFileInputChange,

      showChat = true,
      chatStarted = false,
      onChatStatusChange,
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
      setSignInOpen,
      setIsStreaming,
    },
    ref,
  ) => {
    const TEXTAREA_MAX_HEIGHT = chatStarted ? 400 : 200;
    const { getStoredToken } = useUser();
    const [state, actions] = useVariablesState();
    const [drawImage, setDrawImage] = React.useState<string | null>(null);
    const [pricingOpen, setPricingOpen] = React.useState(false);
    const [crawlerOpen, setCrawlerOpen] = React.useState(false);
    const [isCrawlerLoading, setIsCrawlerLoading] = useState<boolean>(false);
    const [openWhiteBoard, setOpenWhiteBoard] = React.useState(false);
    const [crawlerImage, setCrawlerImage] = React.useState<string | null>(null);
    const buttonRef = useRef(null);
    const [micon, setMikeon] = useState(false);
    const [stopListening, setstoplistening] = useState(false);
    const recognition = useRef<globalThis.SpeechRecognition | null>(null);
    const vst = useRef(false);
    const trns = useRef<string>('');
    const trnsindx = useRef(0);
    const [isListening, setIsListening] = useState(false);
    const [startmicListening, setStartmicListening] = useState(false);
    const [speechRecognition, setSpeechRecognition] = useState(null);
    const mikeof = false;
    const token = getStoredToken();
    const [anchorE2, setAnchorE2] = React.useState<null | HTMLElement>(null);
    const open = Boolean(anchorE2);

    useEffect(() => {
      if (setIsStreaming) {
        setIsStreaming(isStreaming);
      }
      else {
        console.warn('prop is not provided');
      }

    }, [isStreaming])

    const handleSelectClick = (event: React.MouseEvent<HTMLElement>) => {
      if(token){
        setAnchorE2(event.currentTarget);
      }
      else{
        setSignInOpen(true)
      }
    };
    const handleClose = () => {
      setAnchorE2(null);
    };

    const handleClickOpenWhiteBoard = () => {
      setOpenWhiteBoard(true);
    };

    const handleWhiteBoardClose = () => {
      setOpenWhiteBoard(false);
      setAnchorE2(null);
    };
    const handlePricingClose = () => {
      setPricingOpen(false);
      setAnchorE2(null);
    };

    const handleCrawlerOpen = () => {
      setCrawlerOpen(true);
    };

    const handleCrawlerClose = () => {
      setCrawlerOpen(false);
      setAnchorE2(null);
    };

    const handleRemoveDrawFile = () => {
      setDrawImage(null);
    };

    const handleRemoveCrawlerFile = () => {
      setCrawlerImage(null);
    };

    useEffect(() => {
      if ('SpeechRecognition' in window || 'webkitSpeechRecognition' in window) {
        const sp = window.SpeechRecognition || window.webkitSpeechRecognition;
        if (recognition.current === null) {
          recognition.current = new sp();
        }
        console.log('Speech recognition initialized');
      } else {
        console.log('Speech recognition not supported');
      }

      return () => {
        if (recognition.current) {
          recognition.current.stop();
        }
      };
    }, []);

    const startListeningwk = () => {
      if (recognition.current == null) {
        return;
      }
      if (recognition.current && vst.current) {
        console.log('Recognition already started');
        return;
      }
      console.log("started")
      recognition.current.onstart = function () {
        console.log("We are listening. Try speaking into the microphone.");
      };

      recognition.current.onspeechend = function () {
        if (recognition.current !== null) {
          recognition.current.stop();
          vst.current = false;
          trns.current = '';
          trnsindx.current = 0;
        }
      }
      recognition.current.onresult = function (event) {
        const speechResult = event.results[event.results.length - 1][0].transcript;

        // Create a synthetic event to match the textarea change event structure
        const syntheticEvent = {
          target: {
            value: trns.current + speechResult
          }
        } as React.ChangeEvent<HTMLTextAreaElement>;

        // Update the input through the provided handler
        handleInputChange(syntheticEvent);

        if (event.results[event.results.length - 1].isFinal) {
          // Update the accumulated transcript
          trns.current = trns.current + speechResult;

          // Update the input one final time with the complete transcript
          const finalEvent = {
            target: {
              value: trns.current
            }
          } as React.ChangeEvent<HTMLTextAreaElement>;

          handleInputChange(finalEvent);
          console.log('Final transcript:', trns.current);
        }

        console.log('Current speech result:', speechResult);
      };
      recognition.current.continuous = true;
      recognition.current.interimResults = true;
      recognition.current.lang = 'en';
      recognition.current.start();
      trnsindx.current = 0;
      vst.current = true;
    };
    const stopListeningwk = () => {
      if (recognition.current !== null) {
        recognition.current.stop();
        // vst.current = false;
        // trns.current = '';
        // trnsindx.current = 0;
      }
    };

    const startlist = startListeningwk
    const stoplist = stopListeningwk

    useEffect(() => {
      if (mikeof) {
        stoplist();
        setstoplistening(false);
        setMikeon(false);
        console.log('transcript reset done')
      }
    }, [mikeof]);
    
    useEffect(() => {
      if (micon && startmicListening) {
        startlist();
        setStartmicListening(false);
      }
    }, [micon]);

    useEffect(() => {
      if (stopListening) {
        stoplist();
        setstoplistening(false);

      }
    }, [stopListening])

    const handleMicClick = () => {
      if(token){
        if (!speechRecognition) {
          startListeningwk();
          setIsListening(!isListening);
        }
  
        if (isListening) {
          stopListeningwk();
        } else {
          startListeningwk()
          setIsListening(!isListening);
        }
      }
      else{
        setSignInOpen(true)
      }
    };

    const handleChatClick = () => {
      console.log("Clicked")
      chatStarted = false;
      console.log("Clicked", chatStarted)
    }

    return (
      <div
        ref={ref}
        className={classNames(
          styles.BaseChat,
          'relative flex h-full w-full overflow-hidden bg-bolt-elements-background-depth-1',
        )}
        data-chat-visible={showChat}
      >
        <Box position={'absolute'} height={'100vh'} display={'flex'} alignItems={'center'}>
          <Box onClick={handleChatClick} width={20} height={20} display={token ? 'flex' : 'none'} justifyContent={'center'} alignItems={'center'} borderRadius={25} sx={{ cursor: 'pointer' }}>
            <i className="bi bi-chevron-right text-bolt-elements-textPrimary"></i>
          </Box>
        </Box>
        <ClientOnly>{() => <MenuComponent isStreaming={isStreaming} setPricingOpen={setPricingOpen}/>}</ClientOnly>
        <div ref={scrollRef} className="flex overflow-y-auto w-full h-full">
          <div className={classNames(styles.Chat, 'flex flex-col flex-grow min-w-[var(--chat-min-width)] h-full')}>
            {!chatStarted && (
              <MediaFile setSignInOpen={setSignInOpen}
              //  setFiles={setFiles} 
               handleClickOpenWhiteBoard={handleClickOpenWhiteBoard} handleCrawlerOpen={handleCrawlerOpen} />
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
              {!chatStarted && (
                <div id="examples" style={{ maxWidth: 900 }} className="relative w-full mx-auto mt-2 mb-6 flex justify-center">
                  <div className="flex flex-wrap gap-1 justify-center">
                    {EXAMPLE_PROMPTS.map((examplePrompt, index) => {
                      return (
                        <button
                          key={index}
                          onClick={(event) => {
                            sendMessage?.(event, examplePrompt.text);
                          }}
                          className="group border border-bolt-elements-textTertiary hover:border-bolt-elements-textPrimary flex items-center gap-2 px-3 rounded-full justify-center bg-transparent text-bolt-elements-textTertiary hover:text-bolt-elements-textPrimary transition-theme"
                        >
                          {examplePrompt.text}
                          <div className="i-ph:arrow-bend-down-left" />
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}
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
                  {fileInputs && (
                    <div className="flex flex-col gap-5 bg-bolt-elements-background-depth-1 p-4">
                      <div className="px-5 flex gap-5">
                        {Array.from(fileInputs).map((file, index) => {
                          return (
                            <div className="relative" key={index}>
                              <div
                                className="relative flex rounded-lg border border-bolt-elements-borderColor overflow-hidden">
                                
                                    <button className="h-20 w-20 bg-transparent outline-none">
                                      {file.type.includes('image') ? (
                                        <img
                                          className="object-cover w-full h-full"
                                          src={URL.createObjectURL(file)}
                                          alt={file.name}
                                        />
                                      ) : (
                                        <div className="flex items-center justify-center w-full h-full text-bolt-elements-textTertiary">
                                          <div className="i-ph:file" />
                                        </div>
                                      )}
                                    </button>
                                    <span className="text-xs text-bolt-elements-textTertiary">
                                      {file.name}
                                    </span>
                              </div>
                              <button
                                className="absolute top-0 right-0 -translate-y-1/2 translate-x-1/2 rounded-full w-[18px] h-[18px] flex items-center justify-center z-1 bg-bolt-elements-background-depth-1 hover:bg-bolt-elements-background-depth-3 border border-bolt-elements-borderColor text-bolt-elements-button-secondary-text"
                                onClick={() => removeFile?.(index)}
                              >
                                <div className="i-ph:x scale-70"></div>
                              </button>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )
                  }
                  <div style={{ position: 'relative' }}>
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
                  </div>
                  <div className="flex justify-between text-sm p-4 pt-2">
                    <div className="flex gap-1 items-center">
                      {/* <IconButton
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
                      </IconButton> */}
                      <div>
                        <Tooltip
                          title={
                            <Typography fontSize={16}>Mic</Typography>
                          }
                          arrow
                          placement="top"
                        >
                          <button
                            className="flex items-center border border-bolt-elements-borderColor text-bolt-elements-item-contentDefault bg-transparent enabled:hover:text-bolt-elements-item-contentActive rounded-md enabled:hover:bg-bolt-elements-item-backgroundActive disabled:cursor-not-allowed p-1"
                            onClick={() => handleMicClick()}
                          >
                            <i className={`bi ${isListening ? 'bi-pause' : 'bi-mic'}`}
                              style={{
                                fontSize: 20
                              }}
                            ></i>
                          </button>
                        </Tooltip>
                      </div>
                      <div style={{ position: 'relative' }}>
                        <Tooltip
                          title={
                            <Typography fontSize={16}>Attachments</Typography>
                          }
                          arrow
                          placement="top"
                        >
                          <button
                            ref={buttonRef}
                            onClick={handleSelectClick }
                            className="flex items-center border border-bolt-elements-borderColor text-bolt-elements-item-contentDefault bg-transparent enabled:hover:text-bolt-elements-item-contentActive rounded-md enabled:hover:bg-bolt-elements-item-backgroundActive disabled:cursor-not-allowed p-1"
                          >
                            <div className="i-ph:link-simple text-xl"></div>
                          </button>
                        </Tooltip>

                      </div>

                    </div>
                    {input.length > 3 ? (
                      <div className="flex items-center">
                        <div className="text-xs text-gray-500">
                          Use{' '}
                          <kbd className="kdb">
                            Shift
                          </kbd>
                          {' + '}
                          <kbd className="kdb">
                            Return
                          </kbd>
                          {' for a new line'}
                        </div>
                      </div>
                    ) : null}

                  </div>
                </div>
                <div className="bg-bolt-elements-background-depth-1 pb-6">{/* Ghost Element */}</div>
              </div>
              <Menu
                anchorEl={anchorE2}
                open={open}
                onClose={handleClose}
                anchorOrigin={{ horizontal: 'center', vertical: 'bottom' }}
                transformOrigin={{ horizontal: 'center', vertical: 'top' }}
              >
                <Box px={2} py={1} display={'flex'} alignItems={'center'} gap={1}>
                  <Box onClick={() => fileInputRef?.current?.click()} border={`1px solid #d3d3d3`} borderRadius={2} p={2} sx={{ cursor: 'pointer' }}>
                    <Box display={'flex'} justifyContent={'center'}>
                      <Icon path={mdiImageSizeSelectActual} size={2} />
                    </Box>
                    <Typography>from-image</Typography>
                    <input type="file"
                      ref={fileInputRef}
                      aria-hidden="true"
                      accept=".jpg,.jpeg,.png,.gif,.webp,.svg,.pdf,.txt,.doc,.docx,.py,.ipynb,.js,.mjs,.cjs,.jsx,.html,.css,.scss,.sass,.ts,.tsx,.java,.cs,.php,.c,.cc,.cpp,.cxx,.h,.hh,.hpp,.rs,.swift,.go,.rb,.kt,.kts,.scala,.sh,.bash,.zsh,.bat,.csv,.log,.ini,.cfg,.config,.json,.yaml,.yml,.toml,.lua,.sql,.md,.tex,.latex,.asm,.ino,.s"
                      multiple
                      style={{display: 'none', visibility: 'hidden'}}
                      onChange={handleFileInputChange}
                      />
                  </Box>
                  <Box
                    onClick={handleClickOpenWhiteBoard}
                    border={`1px solid #d3d3d3`} borderRadius={2} p={2} sx={{ cursor: 'pointer' }}>
                    <Box display={'flex'} justifyContent={'center'}>
                      <Icon path={mdiPencilBox} size={2} />
                    </Box>
                    <Typography>from-whiteboard</Typography>
                  </Box>
                  <Box
                    onClick={handleCrawlerOpen}
                    border={`1px solid #d3d3d3`} borderRadius={2} p={2} sx={{ cursor: 'pointer' }}>
                    <Box display={'flex'} justifyContent={'center'}>
                      <Icon path={mdiLinkBoxVariant} size={2} />
                    </Box>
                    <Typography>from-crawler</Typography>
                  </Box>
                </Box>
              </Menu>
            </div>
          </div>
          <ClientOnly>{() => <Workbench chatStarted={chatStarted} isStreaming={isStreaming} />}</ClientOnly>
          <Box position={'absolute'} bottom={0} width={'100%'} zIndex={9999} display={'flex'} justifyContent={'center'}>
            <Box display={{ xs: 'none', sm: 'flex' }} gap={1} alignItems="center">
              {footerLinks.map((link, index) => (
                <Box key={link.label} display="flex" alignItems="center">
                  <Link href={link.url} underline="hover" color="inherit">
                    <Typography className={'text-bolt-elements-textPrimary'} fontSize={{ xs: 7, sm: 12 }} fontFamily={`"Montserrat", serif;`}>
                      {link.label}
                    </Typography>
                  </Link>
                  {link.external && <i className="bi bi-box-arrow-up-right" style={{ fontSize: 12, marginLeft: 5 }}></i>}
                  {index < footerLinks.length - 1 && (
                    <Typography mx={1} className={'text-bolt-elements-borderColor'} fontFamily={`"Montserrat", serif;`}>
                      |
                    </Typography>
                  )}
                </Box>
              ))}
            </Box>
          </Box>
        </div>
        <Dialog
          fullScreen
          open={openWhiteBoard}
          onClose={handleWhiteBoardClose}
          TransitionComponent={Transition}
        >
          <WhiteBoard setDrawImage={setDrawImage} handleWhiteBoardClose={handleWhiteBoardClose} />
        </Dialog>
        <Dialog
          open={crawlerOpen}
          onClose={isCrawlerLoading ? undefined : handleCrawlerClose}
          maxWidth={'lg'}
          sx={{
            '& .MuiDialog-paper': {
              borderRadius: '25px',
              width: 600,
              border: `1px solid #d3d3d3`,
              background: '#FFF'
            },
          }}
          BackdropProps={{
            sx: {
              backgroundColor: 'rgba(0, 0, 0, 0.5)',
              backdropFilter: 'blur(8px)',
            },
          }}
        >
          <Crawler handleCrawlerClose={handleCrawlerClose} setCrawlerImage={setCrawlerImage} isCrawlerLoading={isCrawlerLoading} setIsCrawlerLoading={setIsCrawlerLoading} />
        </Dialog>
        <Dialog 
          open={pricingOpen}
          onClose={handlePricingClose}
          maxWidth={'xl'}
          sx={{
            '& .MuiDialog-paper': {
              borderRadius: '25px',
              // width: 600,
              border: `1px solid #d3d3d3`,
              background: '#FFF'
            },
          }}
          BackdropProps={{
            sx: {
              backgroundColor: 'rgba(0, 0, 0, 0.5)',
              backdropFilter: 'blur(8px)',
            },
          }}
        >
          <PricingPlans />
        </Dialog>
      </div>
    );
  },
);
