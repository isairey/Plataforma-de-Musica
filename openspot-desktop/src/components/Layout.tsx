import React, { ReactNode, useEffect, Suspense } from 'react';
import { Box, Drawer, List, ListItem, ListItemIcon, ListItemText } from '@mui/material';
import { Link, useLocation } from 'react-router-dom';
import { Home, Search, Favorite, QueueMusic, Info } from '@mui/icons-material';
import Player from './Player';
import AudioController from './AudioController';
import { useMusic } from '../contexts/MusicContext';

// Lazy load FullScreenPlayer
const FullScreenPlayer = React.lazy(() => import('./FullScreenPlayer'));

// Constants
const drawerWidth = 240;

const menuItems = [
  { text: 'Home', icon: <Home />, path: '/home' },
  { text: 'Search', icon: <Search />, path: '/search' },
  { text: 'Liked Songs', icon: <Favorite />, path: '/liked' },
  { text: 'Recently Played', icon: <QueueMusic />, path: '/recent' },
  { text: 'About', icon: <Info />, path: '/about' },
];

interface LayoutProps {
  children: ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const location = useLocation();
  const { dispatch } = useMusic();

  const isActive = (itemPath: string) =>
    itemPath === '/home' ? (location.pathname === '/home' || location.pathname === '/') : location.pathname.startsWith(itemPath);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement;
      const tagName = target.tagName;

      if (['INPUT', 'TEXTAREA', 'SELECT'].includes(tagName) || target.isContentEditable) return;

      if (e.code === 'Space' || e.code === 'MediaPlayPause') {
        e.preventDefault();
        dispatch({ type: 'TOGGLE_PLAY_PAUSE' });
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [dispatch]);

  return (
    <Box sx={{ display: 'flex', height: '100vh' }}>
      {/* Draggable Top Bar */}
      <Box
        sx={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100vw',
          height: 32,
          zIndex: 2000,
          WebkitAppRegion: 'drag',
          background: 'rgba(0,0,0,0.01)',
          userSelect: 'none',
        }}
      />

      {/* Sidebar */}
      <Drawer
        variant="permanent"
        sx={{
          width: drawerWidth,
          flexShrink: 0,
          '& .MuiDrawer-paper': {
            width: drawerWidth,
            boxSizing: 'border-box',
            backgroundColor: '#000',
            borderRight: '1px solid #2a2a2a',
            paddingTop: '24px',
            userSelect: 'none',
            WebkitAppRegion: 'no-drag',
          },
        }}
      >
        {/* Logo */}
        <Box sx={{ padding: '0 24px', marginBottom: '32px', userSelect: 'none', WebkitAppRegion: 'no-drag' }}>
          <Box
            component="img"
            src="/logo.png"
            alt="OpenSpot"
            sx={{
              height: 32,
              width: 'auto',
              filter: 'brightness(0) invert(1)',
            }}
            onError={(e) => {
              const img = e.currentTarget as HTMLImageElement;
              img.style.display = 'none';
              const next = img.nextElementSibling as HTMLElement;
              if (next) next.style.display = 'block';
            }}
          />
          <Box
            sx={{
              display: 'none',
              fontSize: '24px',
              fontWeight: 'bold',
              color: '#1db954',
              marginTop: '16px',
            }}
          >
            OpenSpot
          </Box>
        </Box>

        {/* Menu Items */}
        <List>
          {menuItems.map((item) => {
            const active = isActive(item.path);
            return (
              <ListItem
                key={item.text}
                component={Link}
                to={item.path}
                sx={{
                  color: active ? '#fff' : '#b3b3b3',
                  textDecoration: 'none',
                  '&:hover': { color: '#fff' },
                  paddingLeft: '24px',
                  paddingRight: '24px',
                  background: active ? 'rgba(29,185,84,0.08)' : 'none',
                  borderRadius: active ? '8px' : 0,
                }}
              >
                <ListItemIcon sx={{ color: 'inherit', minWidth: '40px' }}>{item.icon}</ListItemIcon>
                <ListItemText
                  primary={item.text}
                  sx={{
                    '& .MuiListItemText-primary': { fontSize: '14px', fontWeight: 500 },
                  }}
                />
              </ListItem>
            );
          })}
        </List>
      </Drawer>

      {/* Main Content */}
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          height: '100vh',
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
          position: 'relative',
        }}
      >
        <AudioController />
        <Box
          sx={{
            flexGrow: 1,
            overflow: 'auto',
            backgroundColor: '#121212',
            marginBottom: '90px',
          }}
        >
          {children}
        </Box>

        <Player sx={{ zIndex: 1200, position: 'fixed', left: drawerWidth, right: 0 }} />

        {/* Lazy loaded FullScreenPlayer */}
        <Suspense fallback={null}>
          <FullScreenPlayer />
        </Suspense>
      </Box>
    </Box>
  );
};

export default Layout;

