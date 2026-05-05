import React, { useState, useEffect } from 'react';
import {
  Box,
  IconButton,
  Typography,
  Slider,
  Stack,
  CardMedia,
} from '@mui/material';
import {
  PlayArrow,
  Pause,
  SkipNext,
  SkipPrevious,
  VolumeUp,
  VolumeDown,
  Favorite,
  FavoriteBorder,
  OpenInFull as OpenInFullIcon,
} from '@mui/icons-material';
import { useMusic } from '../contexts/MusicContext';
import { SxProps } from '@mui/system';

interface PlayerProps {
  sx?: SxProps;
  disableOpenFullScreen?: boolean;
}

const Player: React.FC<PlayerProps> = ({ sx, disableOpenFullScreen }) => {
  const { state, dispatch } = useMusic();
  const [isSeeking, setIsSeeking] = useState(false);
  const [seekValue, setSeekValue] = useState(0);

  // Sync seekValue with state.currentTime unless user is seeking
  useEffect(() => {
    if (!isSeeking) {
      setSeekValue(state.currentTime);
    }
  }, [state.currentTime, isSeeking]);

  const handlePlayPause = () => {
    dispatch({ type: 'TOGGLE_PLAY_PAUSE' });
  };

  const handleNextTrack = () => {
    dispatch({ type: 'NEXT_TRACK' });
  };

  const handlePreviousTrack = () => {
    dispatch({ type: 'PREVIOUS_TRACK' });
  };

  const handleVolumeChange = (event: Event, newValue: number | number[]) => {
    const volume = Array.isArray(newValue) ? newValue[0] : newValue;
    dispatch({ type: 'SET_VOLUME', payload: volume / 100 });
  };

  const handleSeek = (event: Event, newValue: number | number[]) => {
    setIsSeeking(true);
    setSeekValue(Array.isArray(newValue) ? newValue[0] : newValue);
  };

  const handleSeekCommit = (event: Event | React.SyntheticEvent, newValue: number | number[]) => {
    const time = Array.isArray(newValue) ? newValue[0] : newValue;
    setIsSeeking(false);
    dispatch({ type: 'SET_CURRENT_TIME', payload: time });
  };

  const handleToggleLike = () => {
    if (state.currentTrack) {
      dispatch({ type: 'TOGGLE_LIKE_TRACK', payload: state.currentTrack });
    }
  };

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  if (!state.currentTrack) {
    return null;
  }

  const isLiked = state.likedTracks.some(track => track.id === state.currentTrack?.id);

  return (
    <Box
      sx={{
        position: 'fixed',
        bottom: 0,
        left: 0,
        right: 0,
        height: '90px',
        backgroundColor: '#181818',
        borderTop: '1px solid #2a2a2a',
        display: 'flex',
        alignItems: 'center',
        padding: '0 16px',
        zIndex: 1200,
        ...sx,
      }}
    >
      {/* Track Info + Open Fullscreen */}
      <Box sx={{ display: 'flex', alignItems: 'center', minWidth: '180px', width: '30%', position: 'relative' }}>
        <Box sx={{ position: 'relative', cursor: disableOpenFullScreen ? 'default' : 'pointer' }}>
          <CardMedia
            component="img"
            sx={{
              width: 56,
              height: 56,
              borderRadius: '4px',
              marginRight: '12px',
            }}
            image={state.currentTrack.coverUrl}
            alt={state.currentTrack.title}
            onClick={() => {
              if (!disableOpenFullScreen) {
                dispatch({ type: 'OPEN_FULLSCREEN_PLAYER' });
              }
            }}
          />
          {!disableOpenFullScreen && (
            <IconButton
              size="small"
              sx={{ position: 'absolute', bottom: 2, right: 2, color: '#fff', background: 'rgba(0,0,0,0.4)' }}
              onClick={e => {
                e.stopPropagation();
                dispatch({ type: 'OPEN_FULLSCREEN_PLAYER' });
              }}
            >
              <OpenInFullIcon fontSize="small" />
            </IconButton>
          )}
        </Box>
        <Box sx={{ minWidth: 0 }}>
          <Typography
            variant="body2"
            sx={{
              color: '#ffffff',
              fontWeight: 500,
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
            }}
          >
            {state.currentTrack.title}
          </Typography>
          <Typography
            variant="caption"
            sx={{
              color: '#b3b3b3',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
            }}
          >
            {state.currentTrack.artist}
          </Typography>
        </Box>
        <IconButton
          size="small"
          onClick={handleToggleLike}
          sx={{ color: isLiked ? '#1db954' : '#b3b3b3', marginLeft: '8px' }}
        >
          {isLiked ? <Favorite /> : <FavoriteBorder />}
        </IconButton>
      </Box>

      {/* Player Controls */}
      <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flex: 1 }}>
        <Stack direction="row" spacing={1} alignItems="center" sx={{ marginBottom: '8px' }}>
          <IconButton size="small" onClick={handlePreviousTrack} sx={{ color: '#ffffff' }}>
            <SkipPrevious />
          </IconButton>
          <IconButton
            onClick={handlePlayPause}
            sx={{
              backgroundColor: '#ffffff',
              color: '#000000',
              '&:hover': { backgroundColor: '#f0f0f0' },
              width: 32,
              height: 32,
            }}
          >
            {state.isPlaying ? <Pause /> : <PlayArrow />}
          </IconButton>
          <IconButton size="small" onClick={handleNextTrack} sx={{ color: '#ffffff' }}>
            <SkipNext />
          </IconButton>
        </Stack>

        <Stack direction="row" spacing={1} alignItems="center" sx={{ width: '100%', maxWidth: '600px' }}>
          <Typography variant="caption" sx={{ color: '#b3b3b3', minWidth: '40px' }}>
            {formatTime(isSeeking ? seekValue : state.currentTime)}
          </Typography>
          <Slider
            size="small"
            value={isSeeking ? seekValue : state.currentTime}
            max={isNaN(state.duration) || state.duration === 0 ? 0 : state.duration}
            onChange={handleSeek}
            onChangeCommitted={handleSeekCommit}
            sx={{
              color: '#1db954',
              '& .MuiSlider-thumb': {
                width: 12,
                height: 12,
                '&:hover': { boxShadow: '0 0 0 8px rgba(29, 185, 84, 0.16)' },
              },
              '& .MuiSlider-track': {
                border: 'none',
              },
              '& .MuiSlider-rail': {
                backgroundColor: '#4a4a4a',
              },
            }}
          />
          <Typography variant="caption" sx={{ color: '#b3b3b3', minWidth: '40px' }}>
            {formatTime(isNaN(state.duration) || state.duration === 0 ? 0 : state.duration)}
          </Typography>
        </Stack>
      </Box>

      {/* Volume Controls */}
      <Box sx={{ display: 'flex', alignItems: 'center', minWidth: '180px', width: '30%', justifyContent: 'flex-end' }}>
        <VolumeDown sx={{ color: '#b3b3b3', marginRight: '8px' }} />
        <Slider
          size="small"
          value={state.volume * 100}
          onChange={handleVolumeChange}
          sx={{
            width: 100,
            color: '#1db954',
            '& .MuiSlider-thumb': {
              width: 12,
              height: 12,
              '&:hover': { boxShadow: '0 0 0 8px rgba(29, 185, 84, 0.16)' },
            },
            '& .MuiSlider-track': {
              border: 'none',
            },
            '& .MuiSlider-rail': {
              backgroundColor: '#4a4a4a',
            },
          }}
        />
        <VolumeUp sx={{ color: '#b3b3b3', marginLeft: '8px' }} />
      </Box>
    </Box>
  );
};

export default Player;