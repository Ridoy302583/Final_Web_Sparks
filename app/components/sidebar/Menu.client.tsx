import { motion, type Variants } from 'framer-motion';
import { useCallback, useEffect, useRef, useState } from 'react';
import { toast } from 'react-toastify';
import { Dialog, DialogButton, DialogDescription, DialogRoot, DialogTitle } from '~/components/ui/Dialog';
import { ThemeSwitch } from '~/components/ui/ThemeSwitch';
import { db, deleteById, getAll, chatId, type ChatHistoryItem } from '~/lib/persistence';
import { cubicEasingFn } from '~/utils/easings';
import { logger } from '~/utils/logger';
import { HistoryItem } from './HistoryItem';
import { binDates } from './date-binning';
import { Box, Divider, FormControl, Menu, MenuItem, OutlinedInput, Select, Typography } from '@mui/material';
import { Link } from '@remix-run/react';
import React from 'react';
import useAuth from '../auth/useAuth';
import useUser from '~/types/user';
import { authStore } from '../auth/authStore';

const menuVariants = {
  closed: {
    opacity: 0,
    visibility: 'hidden',
    left: '-150px',
    transition: {
      duration: 0.2,
      ease: cubicEasingFn,
    },
  },
  open: {
    opacity: 1,
    visibility: 'initial',
    left: 0,
    transition: {
      duration: 0.2,
      ease: cubicEasingFn,
    },
  },
} satisfies Variants;

type DialogContent = { type: 'delete'; item: ChatHistoryItem } | null;

export function MenuComponent({ chatStarted }: { chatStarted: boolean }) {
  const menuRef = useRef<HTMLDivElement>(null);
  const { authState, logout } = useAuth();
  const [list, setList] = useState<ChatHistoryItem[]>([]);
  const [open, setOpen] = useState<boolean>(true);
  const [dialogContent, setDialogContent] = useState<DialogContent>(null);
  const [isExpanded, setIsExpanded] = useState(!chatStarted);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [language, setLanguage] = useState('en');

  // Use the useUser hook
  const { user, loading, error } = useUser(authState.access_token || '');

  const openMenu = Boolean(anchorEl);

  const handleClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleLanguageChange = (event: any) => {
    setLanguage(event.target.value);
  };

  const loadEntries = useCallback(() => {
    if (db) {
      getAll(db)
        .then((list) => list.filter((item) => item.urlId && item.description))
        .then(setList)
        .catch((error) => toast.error(error.message));
    }
  }, []);

  const deleteItem = useCallback((event: React.UIEvent, item: ChatHistoryItem) => {
    event.preventDefault();

    if (db) {
      deleteById(db, item.id)
        .then(() => {
          loadEntries();
          if (chatId.get() === item.id) {
            window.location.pathname = '/';
          }
        })
        .catch((error) => {
          toast.error('Failed to delete conversation');
          logger.error(error);
        });
    }
  }, [loadEntries]);

  // Effect for chat started state
  useEffect(() => {
    setIsExpanded(!chatStarted);
  }, [chatStarted]);

  // Effect for loading entries
  useEffect(() => {
    if (chatStarted) {
      setOpen(false);
    }
    if (open) {
      loadEntries();
    }
  }, [open, chatStarted, loadEntries]);

  // Effect for mouse movement
  useEffect(() => {
    const enterThreshold = 40;
    const exitThreshold = 40;

    function onMouseMove(event: MouseEvent) {
      if (event.pageX < enterThreshold) {
        // Commented out as per original code
        // setOpen(true);
      }

      if (menuRef.current && event.clientX > menuRef.current.getBoundingClientRect().right + exitThreshold) {
        // Commented out as per original code
        // setOpen(true);
      }
    }

    window.addEventListener('mousemove', onMouseMove);
    return () => window.removeEventListener('mousemove', onMouseMove);
  }, []);

  const closeDialog = () => {
    setDialogContent(null);
  };

  // Early return for loading and error states
  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <Typography>Loading...</Typography>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-full">
        <Typography color="error">Error loading user data</Typography>
      </div>
    );
  }

  const handleClickLogout=()=>{
    logout(authState.access_token || "")
  }

  return (
    <motion.div
      ref={menuRef}
      initial="open"
      animate={open ? 'open' : 'closed'}
      variants={menuVariants}
      className="flex flex-col side-menu fixed top-0 w-[350px] h-full bg-bolt-elements-background-depth-2 border-r rounded-r-3xl border-bolt-elements-borderColor z-sidebar shadow-xl shadow-bolt-elements-sidebar-dropdownShadow text-sm"
    >
      <div className="flex items-center h-[var(--header-height)]" />
      <div className="flex-1 flex flex-col h-full w-full overflow-hidden">
        <div className="p-4">
          <a
            href="/"
            className="flex gap-2 items-center bg-bolt-elements-sidebar-buttonBackgroundDefault text-bolt-elements-sidebar-buttonText hover:bg-bolt-elements-sidebar-buttonBackgroundHover rounded-md p-2 transition-theme"
          >
            <span className="inline-block i-bolt:chat scale-110" />
            Start new chat
          </a>
        </div>
        <div className="text-bolt-elements-textPrimary font-medium pl-6 pr-5 my-2">Your Chats</div>
        <div className="flex-1 overflow-scroll pl-4 pr-5 pb-5">
          {list.length === 0 && <div className="pl-2 text-bolt-elements-textTertiary">No previous conversations</div>}
          <DialogRoot open={dialogContent !== null}>
            {binDates(list).map(({ category, items }) => (
              <div key={category} className="mt-4 first:mt-0 space-y-1">
                <div className="text-bolt-elements-textTertiary sticky top-0 z-1 bg-bolt-elements-background-depth-2 pl-2 pt-2 pb-1">
                  {category}
                </div>
                {items.map((item) => (
                  <HistoryItem key={item.id} item={item} onDelete={() => setDialogContent({ type: 'delete', item })} />
                ))}
              </div>
            ))}
            <Dialog onBackdrop={closeDialog} onClose={closeDialog}>
              {dialogContent?.type === 'delete' && (
                <>
                  <DialogTitle>Delete Chat?</DialogTitle>
                  <DialogDescription asChild>
                    <div>
                      <p>
                        You are about to delete <strong>{dialogContent.item.description}</strong>.
                      </p>
                      <p className="mt-1">Are you sure you want to delete this chat?</p>
                    </div>
                  </DialogDescription>
                  <div className="px-5 pb-4 bg-bolt-elements-background-depth-2 flex gap-2 justify-end">
                    <DialogButton type="secondary" onClick={closeDialog}>
                      Cancel
                    </DialogButton>
                    <DialogButton
                      type="danger"
                      onClick={(event) => {
                        deleteItem(event, dialogContent.item);
                        closeDialog();
                      }}
                    >
                      Delete
                    </DialogButton>
                  </div>
                </>
              )}
            </Dialog>
          </DialogRoot>
        </div>
        <div className="flex items-center border-t border-bolt-elements-borderColor p-4">
          <Box onClick={handleClick}>
            <Box display="flex" alignItems="center">
              {user?.profile_pic && (
                <Box
                  component="img"
                  height={40}
                  width={40}
                  borderRadius={2}
                  src={user.profile_pic}
                  alt={user.full_name}
                />
              )}
              <Box ml={1}>
                <Typography fontFamily="Montserrat" fontWeight={700}>
                  {user?.full_name || 'User'}
                </Typography>
                <Typography fontFamily="Montserrat" fontSize={12}>
                  Free
                </Typography>
              </Box>
            </Box>
          </Box>
          <ThemeSwitch className="ml-auto" />
          <Box component="button" onClick={handleClick} className="ml-2">
            <i className="bi bi-three-dots-vertical"></i>
          </Box>
          <Menu
            anchorEl={anchorEl}
            id="account-menu"
            open={openMenu}
            onClose={handleClose}
            slotProps={{
              paper: {
                elevation: 0,
                sx: {
                  overflow: 'visible',
                  filter: 'drop-shadow(0px 2px 8px rgba(0,0,0,0.32))',
                  mt: -1.5,
                  borderRadius: 3,
                  border: '1px solid #d0d0d0',
                  '& .MuiAvatar-root': {
                    width: 32,
                    height: 32,
                    ml: -0.5,
                    mr: 1,
                  },
                  minWidth: 400,
                },
              },
            }}
            transformOrigin={{ horizontal: 'center', vertical: 'bottom' }}
            anchorOrigin={{ horizontal: 'center', vertical: 'top' }}
          >
            <Box>
              <Box display="flex" alignItems="center">
                <Typography fontFamily="Montserrat" px={2} py={0.5}>
                  {user?.email}
                </Typography>
                <Box
                  display="flex"
                  alignItems="center"
                  border="1px solid #d0d0d0"
                  borderRadius={25}
                  py={0.2}
                  px={1}
                  sx={{
                    background:'green'
                  }}
                >
                  <i className="bi bi-shield-check" style={{ fontSize: 10, color: '#FFF' }}></i>
                  <Typography fontFamily="Montserrat" fontSize={10} ml={0.5} color="#FFF">
                    Verified
                  </Typography>
                </Box>
              </Box>
              <Box display="flex" alignItems="center" my={2} px={2} py={0.5}>
                <Box borderRadius={2}>
                  {user?.profile_pic && (
                    <Box
                      component="img"
                      src={user.profile_pic}
                      width={40}
                      height={40}
                      borderRadius={2}
                      sx={{
                        objectFit: 'cover',
                      }}
                    />
                  )}
                </Box>
                <Box ml={1.5}>
                  <Typography fontFamily="Montserrat" fontWeight={600} fontSize={16}>
                    {user?.full_name}
                  </Typography>
                  <Typography fontFamily="Montserrat" fontWeight={400} fontSize={14}>
                    Free
                  </Typography>
                </Box>
              </Box>
              <Box
                width="auto"
                height={35}
                mx={2}
                mt={0.5}
                mb={1.5}
                display="flex"
                justifyContent="center"
                alignItems="center"
                border="1px dashed #d0d0d0"
                borderRadius={2}
                sx={{
                  cursor: 'pointer',
                }}
              >
                <i className="bi bi-arrow-repeat"></i>
                <Typography fontFamily="Montserrat" component="span" mx={1}>
                  Switch Team
                </Typography>
              </Box>
              <Divider />
              <Box px={2} py={0.5} pb={2}>
                <Link
                  to="/pricing"
                  target="_blank"
                  style={{
                    textDecoration: 'none',
                    color: '#000',
                  }}
                >
                  <Box pt={1.5} sx={{ cursor: 'pointer' }}>
                    <i className="bi bi-credit-card"></i>
                    <Typography fontFamily="Montserrat" component="span" mx={1}>
                      Billing
                    </Typography>
                  </Box>
                </Link>
                <Box pt={1.5} sx={{ cursor: 'pointer' }}>
                  <i className="bi bi-arrow-repeat"></i>
                  <Typography fontFamily="Montserrat" component="span" mx={1}>
                    Change Password
                  </Typography>
                </Box>
                <Box onClick={handleClickLogout} pt={1.5} sx={{ cursor: 'pointer' }}>
                  <i className="bi bi-box-arrow-right"></i>
                  <Typography fontFamily="Montserrat" component="span" mx={1}>
                    Logout
                  </Typography>
                </Box>
              </Box>
              <Divider />
              <Box p={2}>
                <Typography fontFamily="Montserrat" fontSize={14} fontWeight={600}>
                  Preferences
                </Typography>
                <Box display="flex" justifyContent="space-between" alignItems="center" mt={1}>
                  <p>Language</p>
                  <FormControl
                    sx={{
                      minWidth: 100,
                      height: '30px',
                      '& .MuiOutlinedInput-root': {
                        borderRadius: '10px',
                        '& fieldset': {
                          borderColor: '#d0d0d0',
                        },
                        '&:hover fieldset': {
                          borderColor: '#d0d0d0',
                        },
                        '&.Mui-focused fieldset': {
                          borderColor: '#d0d0d0',
                          borderRadius: '10px',
                        },
                      },
                    }}
                  >
                    <Select
                      value={language}
                      onChange={handleLanguageChange}
                      input={<OutlinedInput />}
                      sx={{
                        height: '30px',
                        fontSize: '12px',
                        color: '#000',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        '& .MuiSvgIcon-root': {
                          color: '#000',
                        },
                        '& .MuiSelect-select': {
                          padding: '0 10px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                        },
                      }}
                    >
                      <MenuItem value="en" sx={{ fontSize: '12px', textAlign: 'center' }}>
                        English
                      </MenuItem>
                      <MenuItem value="bn" sx={{ fontSize: '12px', textAlign: 'center' }}>
                        Bangla
                      </MenuItem>
                      <MenuItem value="cn" sx={{ fontSize: '12px', textAlign: 'center' }}>
                        Chinese
                      </MenuItem>
                      <MenuItem value="ar" sx={{ fontSize: '12px', textAlign: 'center' }}>
                        Arabic
                      </MenuItem>
                      <MenuItem value="in" sx={{ fontSize: '12px', textAlign: 'center' }}>
                        Hindi
                      </MenuItem>
                    </Select>
                  </FormControl>
                </Box>
              </Box>
            </Box>
          </Menu>
        </div>
      </div>
    </motion.div>
  );
}