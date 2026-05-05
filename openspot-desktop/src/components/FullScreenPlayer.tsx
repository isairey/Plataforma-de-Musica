import React, { useState } from 'react';
import { Box, Modal, IconButton, Typography, Stack, CardMedia, Button } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import DownloadIcon from '@mui/icons-material/Download';
import Player from './Player';
import { useMusic } from '../contexts/MusicContext';
import { getStreamUrl } from '../lib/music-api';

const FullScreenPlayer: React.FC = () => {
  const { state, dispatch } = useMusic();
  const open = state.isFullScreenPlayerOpen;
  const track = state.currentTrack;
  const [downloading, setDownloading] = useState(false);

  if (!track) return null;

 // Download song handler
 const handleDownload = async () => {
  setDownloading(true);
  try {
    const url = await getStreamUrl(track.id);
    const response = await fetch(url);
    const blob = await response.blob();
    const a = document.createElement('a');
    a.href = window.URL.createObjectURL(blob);
    a.download = `${track.title} - ${track.artist}.flac`;
    document.body.appendChild(a);
    a.click();
    a.remove();
  } catch (err) {
    alert('Failed to download song.');
  } finally {
    setDownloading(false);
  }
};

  return (
    <Modal open={open} onClose={() => dispatch({ type: 'CLOSE_FULLSCREEN_PLAYER' })}>
      <Box
        sx={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100vw',
          height: '100vh',
          zIndex: 2000,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          overflow: 'auto',
        }}
      >
        {/* Spotify-like gradient background */}
        <Box
          sx={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100vw',
            height: '100vh',
            zIndex: 0,
            background: `linear-gradient(135deg, #1db954 0%, #191414 100%)`,
            backgroundRepeat: 'no-repeat',
            backgroundSize: 'cover',
            filter: 'blur(0px)',
            opacity: 0.95,
          }}
        />
        {/* Overlay for darkening */}
        <Box
          sx={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100vw',
            height: '100vh',
            zIndex: 1,
            background: 'linear-gradient(180deg, rgba(25,20,20,0.7) 0%, rgba(25,20,20,0.95) 100%)',
          }}
        />
        <IconButton
          onClick={() => dispatch({ type: 'CLOSE_FULLSCREEN_PLAYER' })}
          sx={{ position: 'absolute', top: 24, right: 24, color: '#fff', zIndex: 2100 }}
        >
          <CloseIcon fontSize="large" />
        </IconButton>
        <Stack spacing={4} alignItems="center" justifyContent="center" sx={{ width: '100%', maxWidth: 600, zIndex: 2 }}>
          <CardMedia
            component="img"
            image={track.coverUrl}
            alt={track.title}
            sx={{ width: 320, height: 320, borderRadius: 4, boxShadow: 6, mb: 2 }}
          />
          <Box sx={{ textAlign: 'center', width: '100%' }}>
            <Typography variant="h4" sx={{ color: '#fff', fontWeight: 700, mb: 1, textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }}>{track.title}</Typography>
            <Typography variant="h6" sx={{ color: '#b3b3b3', mb: 2, textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }}>{track.artist}</Typography>
          </Box>
          <Button
            variant="contained"
            color="success"
            startIcon={<DownloadIcon />}
            onClick={handleDownload}
            disabled={downloading}
            sx={{ borderRadius: 20, fontWeight: 600, mb: 2 }}
          >
            {downloading ? 'Downloading...' : 'Download'}
          </Button>
          {/* Player controls (reuse Player, but disable open full screen) */}
          <Player disableOpenFullScreen sx={{ position: 'static', left: 0, right: 0, width: '100%', boxShadow: 0, borderTop: 'none', background: 'transparent', height: 'auto', zIndex: 2100 }} />
        </Stack>
      </Box>
    </Modal>
  );
};

export default FullScreenPlayer; 
