import React from 'react';
import { Box, Typography, Grid, Card, CardContent, CardMedia, IconButton } from '@mui/material';
import { PlayArrow, Pause, Favorite, FavoriteBorder } from '@mui/icons-material';
import { useMusic } from '../contexts/MusicContext';

const RecentlyPlayed: React.FC = () => {
  const { state, dispatch } = useMusic();
  const recentTracks = state.recentlyPlayed;
  const isCurrent = (track: any) => state.currentTrack?.id === track.id;
  const isPlaying = state.isPlaying;

  const handlePlayPauseTrack = (track: any) => {
    if (isCurrent(track)) {
      dispatch({ type: 'TOGGLE_PLAY_PAUSE' });
    } else {
      dispatch({ type: 'SET_CURRENT_TRACK', payload: track });
      dispatch({ type: 'SET_QUEUE', payload: recentTracks });
      dispatch({ type: 'ADD_TO_RECENTLY_PLAYED', payload: track });
    }
  };
  const handleToggleLike = (track: any) => {
    dispatch({ type: 'TOGGLE_LIKE_TRACK', payload: track });
  };
  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };
  return (
    <Box sx={{ p: 4 }}>
      <Typography variant="h4" sx={{ color: '#fff', fontWeight: 700, mb: 3 }}>
        Recently Played
      </Typography>
      <Grid container spacing={2}>
        {recentTracks.length === 0 && (
          <Typography sx={{ color: '#b3b3b3', ml: 2 }}>No recently played songs yet.</Typography>
        )}
        {recentTracks.map(track => (
          <Grid item xs={12} key={track.id}>
            <Card sx={{ backgroundColor: '#1a1a1a', display: 'flex', alignItems: 'center', p: 1 }}>
              <IconButton size="small" onClick={() => handleToggleLike(track)} sx={{ color: state.likedTracks.some(t => t.id === track.id) ? '#1db954' : '#b3b3b3', mr: 1 }}>
                {state.likedTracks.some(t => t.id === track.id) ? <Favorite /> : <FavoriteBorder />}
              </IconButton>
              <CardMedia
                component="img"
                sx={{ width: 64, height: 64, borderRadius: '4px', mr: 2 }}
                image={track.coverUrl}
                alt={track.title}
              />
              <CardContent sx={{ flex: 1, p: 0 }}>
                <Typography variant="body1" sx={{ color: '#fff', fontWeight: 500 }}>{track.title}</Typography>
                <Typography variant="body2" sx={{ color: '#b3b3b3' }}>{track.artist} • {track.album}</Typography>
                <Typography variant="caption" sx={{ color: '#666' }}>{formatTime(track.duration)}</Typography>
              </CardContent>
              <IconButton
                size="medium"
                onClick={() => handlePlayPauseTrack(track)}
                sx={{ background: isCurrent(track) && isPlaying ? '#1db954' : '#232323', color: '#fff', ml: 2 }}
              >
                {isCurrent(track) && isPlaying ? <Pause /> : <PlayArrow />}
              </IconButton>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
};
export default RecentlyPlayed;
