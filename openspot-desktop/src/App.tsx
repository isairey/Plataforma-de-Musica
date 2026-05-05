import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useNavigate, useLocation } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import { CssBaseline, Box } from '@mui/material';
import './App.css';

import Layout from './components/Layout';
import Home from './pages/Home';
import Search from './pages/Search';
import LikedSongs from './pages/LikedSongs';
import RecentlyPlayed from './pages/RecentlyPlayed';
import About from './pages/About';
import { MusicProvider } from './contexts/MusicContext';

// Component to handle default route redirection
const DefaultRouteHandler: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    console.log('DefaultRouteHandler: Current pathname:', location.pathname);
    console.log('DefaultRouteHandler: Running on platform:', navigator.platform);
    
    if (location.pathname === '/') {
      console.log('DefaultRouteHandler: Redirecting from / to /home');
      try {
        navigate('/home', { replace: true });
        console.log('DefaultRouteHandler: Redirect successful');
      } catch (error) {
        console.error('DefaultRouteHandler: Redirect failed:', error);
        // Fallback: try to force navigation
        window.location.href = '/home';
      }
    } else {
      console.log('DefaultRouteHandler: No redirect needed, current path:', location.pathname);
    }
  }, [navigate, location.pathname]);

  // Also handle the case where we're at root but the redirect didn't work
  useEffect(() => {
    if (location.pathname === '/') {
      console.log('DefaultRouteHandler: Still at root, forcing redirect...');
      const timer = setTimeout(() => {
        if (location.pathname === '/') {
          console.log('DefaultRouteHandler: Force redirect after timeout');
          navigate('/home', { replace: true });
        }
      }, 100);
      
      return () => clearTimeout(timer);
    }
  }, [location.pathname, navigate]);

  // Force redirect if we're still at root after a longer delay (for Electron builds)
  useEffect(() => {
    if (location.pathname === '/') {
      const forceTimer = setTimeout(() => {
        if (location.pathname === '/') {
          console.log('DefaultRouteHandler: Force redirect after long timeout (Electron fallback)');
          navigate('/home', { replace: true });
        }
      }, 500);
      
      return () => clearTimeout(forceTimer);
    }
  }, [location.pathname, navigate]);

  return null;
};

const darkTheme = createTheme({
  palette: {
    mode: 'dark',
    primary: {
      main: '#1db954',
    },
    secondary: {
      main: '#535353',
    },
    background: {
      default: '#121212',
      paper: '#1e1e1e',
    },
    text: {
      primary: '#ffffff',
      secondary: '#b3b3b3',
    },
  },
  typography: {
    fontFamily: [
      'Roboto',
      '-apple-system',
      'BlinkMacSystemFont',
      '"Segoe UI"',
      'Arial',
      'sans-serif',
    ].join(','),
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 20,
          textTransform: 'none',
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          backgroundColor: '#2a2a2a',
          '&:hover': {
            backgroundColor: '#3a3a3a',
          },
        },
      },
    },
  },
});

const App: React.FC = () => {
  // Detect if we're running in Electron
  const isElectron = typeof window !== 'undefined' && window.process ;
  console.log('App: Running in Electron:', isElectron);
  console.log('App: Current location:', window.location.href);
  
  return (
    <ThemeProvider theme={darkTheme}>
      <CssBaseline />
      <MusicProvider>
        <Router basename={isElectron ? undefined : '/'}>
          <Box sx={{ display: 'flex', height: '100vh', flexDirection: 'column' }}>
            <Layout>
              <DefaultRouteHandler />
              <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/home" element={<Home />} />
                <Route path="/search" element={<Search />} />
                <Route path="/liked" element={<LikedSongs />} />
                <Route path="/recent" element={<RecentlyPlayed />} />
                <Route path="/about" element={<About />} />
                <Route path="*" element={<Home />} />
              </Routes>
              {/* Fallback: Always render Home component if routing fails */}
              {window.location.pathname === '/' && <Home />}
            </Layout>
          </Box>
        </Router>
      </MusicProvider>
    </ThemeProvider>
  );
};

export default App; 