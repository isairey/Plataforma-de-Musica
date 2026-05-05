import React, { useEffect, useState } from 'react';
import { Box, Typography, Button, CardMedia, Stack, Alert, CircularProgress } from '@mui/material';
import { GitHub, Update, CheckCircle } from '@mui/icons-material';

const APP_VERSION = '2.0.3';
const RELEASES_URL = 'https://github.com/BlackHatDevX/openspot-music-app/releases';
const GITHUB_REPO_URL = 'https://github.com/BlackHatDevX/openspot-music-app';

const About: React.FC = () => {
  const [latestVersion, setLatestVersion] = useState(APP_VERSION);
  const [updateAvailable, setUpdateAvailable] = useState(false);
  const [checkingUpdate, setCheckingUpdate] = useState(false);
  const [updateError, setUpdateError] = useState<string | null>(null);

  useEffect(() => {
    // Fetch latest release from GitHub
    const checkForUpdates = async () => {
      try {
        setCheckingUpdate(true);
        setUpdateError(null);
        
        const response = await fetch('https://api.github.com/repos/BlackHatDevX/openspot-music-app/releases/latest');
        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }
        
        const data = await response.json();
        if (data && data.tag_name) {
          setLatestVersion(data.tag_name);
          if (data.tag_name !== "v"+APP_VERSION) {
            setUpdateAvailable(true);
          }
        }
      } catch (error) {
        console.error('Failed to check for updates:', error);
        setUpdateError(error instanceof Error ? error.message : 'Failed to check for updates');
      } finally {
        setCheckingUpdate(false);
      }
    };

    checkForUpdates();
  }, []);

  const handleUpdateClick = () => {
    window.open(RELEASES_URL, '_blank', 'noopener,noreferrer');
  };

  const handleGitHubClick = () => {
    window.open(GITHUB_REPO_URL, '_blank', 'noopener,noreferrer');
  };

  return (
    <Box sx={{ p: 4, display: 'flex', flexDirection: 'column', alignItems: 'center', minHeight: '100vh', background: '#181818' }}>
      <CardMedia
        component="img"
        image="https://i.postimg.cc/LsLmXZTb/main.png"
        alt="OpenSpot Icon"
        sx={{ width: 120, height: 120, borderRadius: 4, mb: 3, boxShadow: 6 }}
      />



      <Typography variant="h4" sx={{ color: '#fff', fontWeight: 700, mb: 2 }}>
        OpenSpot
      </Typography>



      {/* Version Information */}
      <Stack direction="column" spacing={2} alignItems="center" sx={{ mb: 4, width: '100%', maxWidth: 400 }}>
        <Box sx={{ 
          display: 'flex', 
          alignItems: 'center', 
          gap: 2, 
          padding: '16px', 
          backgroundColor: 'rgba(255, 255, 255, 0.05)', 
          borderRadius: '12px',
          width: '100%',
          justifyContent: 'space-between'
        }}>
          <Typography variant="body2" sx={{ color: '#b3b3b3' }}>
            Current Version:
          </Typography>
          <Typography variant="body2" sx={{ color: '#1db954', fontWeight: 600 }}>
            {"v"+APP_VERSION}
          </Typography>
        </Box>

        <Box sx={{ 
          display: 'flex', 
          alignItems: 'center', 
          gap: 2, 
          padding: '16px', 
          backgroundColor: 'rgba(255, 255, 255, 0.05)', 
          borderRadius: '12px',
          width: '100%',
          justifyContent: 'space-between'
        }}>
          <Typography variant="body2" sx={{ color: '#b3b3b3' }}>
            Latest Version:
          </Typography>
          <Typography variant="body2" sx={{ 
            color: updateAvailable ? '#ff4444' : '#1db954', 
            fontWeight: 600,
            display: 'flex',
            alignItems: 'center',
            gap: 1
          }}>
            {checkingUpdate ? (
              <>
                <CircularProgress size={16} sx={{ color: '#1db954' }} />
                Checking...
              </>
            ) : (
              <>
                {updateAvailable && <Update sx={{ fontSize: 16 }} />}
                {!updateAvailable && <CheckCircle sx={{ fontSize: 16 }} />}
                {latestVersion}
              </>
            )}
          </Typography>
        </Box>

        {/* Update Status Alert */}
        {updateAvailable && (
          <Alert 
            severity="info" 
            sx={{ 
              width: '100%', 
              backgroundColor: 'rgba(29, 185, 84, 0.1)', 
              border: '1px solid rgba(29, 185, 84, 0.3)',
              '& .MuiAlert-icon': { color: '#1db954' },
              '& .MuiAlert-message': { color: '#1db954' }
            }}
          >
            A new version is available! Click the update button below to download.
          </Alert>
        )}

        {/* Error Alert */}
        {updateError && (
          <Alert 
            severity="warning" 
            sx={{ 
              width: '100%', 
              backgroundColor: 'rgba(255, 193, 7, 0.1)', 
              border: '1px solid rgba(255, 193, 7, 0.3)'
            }}
          >
            {updateError}
          </Alert>
        )}
      </Stack>

      {/* Action Buttons */}
      <Stack direction="row" spacing={2} sx={{ mb: 4 }}>
        {updateAvailable ? (
          <Button
            variant="contained"
            color="success"
            startIcon={<Update />}
            onClick={handleUpdateClick}
            sx={{ 
              borderRadius: 20, 
              fontWeight: 600,
              backgroundColor: '#ff4444',
              '&:hover': { backgroundColor: '#ff3333' }
            }}
          >
            Update Available
          </Button>
        ) : (
          <Button
            variant="contained"
            color="success"
            startIcon={<CheckCircle />}
            onClick={handleUpdateClick}
            sx={{ borderRadius: 20, fontWeight: 600 }}
          >
            Check for Updates
          </Button>
        )}
        
        <Button
          variant="outlined"
          startIcon={<GitHub />}
          onClick={handleGitHubClick}
          sx={{ 
            borderRadius: 20, 
            fontWeight: 600,
            borderColor: '#b3b3b3',
            color: '#b3b3b3',
            '&:hover': { 
              borderColor: '#fff',
              backgroundColor: 'rgba(255, 255, 255, 0.08)'
            }
          }}
        >
          View on GitHub
        </Button>
      </Stack>

      {/* Credits Section */}
      <Box sx={{ 
        width: '100%', 
        maxWidth: 500, 
        padding: '24px', 
        backgroundColor: 'rgba(29, 185, 84, 0.05)', 
        borderRadius: '16px',
        border: '1px solid rgba(29, 185, 84, 0.2)',
        textAlign: 'center'
      }}>
        <Typography variant="h6" sx={{ color: '#1db954', fontWeight: 600, mb: 2 }}>
          Special Thanks
        </Typography>
        <Typography variant="body2" sx={{ color: '#b3b3b3', mb: 3, lineHeight: 1.6 }}>
          OpenSpot wouldn't be possible without the amazing music streaming API provided by{' '}
          <Box
            component="span"
            sx={{ 
              color: '#1db954', 
              fontWeight: 600,
              display: 'inline-flex',
              alignItems: 'center',
              gap: 0.5
            }}
          >
            <Box
              component="img"
              alt="king"
              sx={{ 
                width: 20, 
                height: 20, 
                borderRadius: '4px',
                verticalAlign: 'middle'
              }}
            />
            king
          </Box>
          . Their service provides high-quality audio streaming and comprehensive music metadata that powers the entire OpenSpot experience.
        </Typography>
      </Box>
    </Box>
  );
};

export default About;
