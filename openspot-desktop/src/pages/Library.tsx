import React, { useState } from 'react';
import {
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  CardMedia,
  Tabs,
  Tab,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Button,
  Chip,
} from '@mui/material';
import { Favorite, PlayArrow, QueueMusic } from '@mui/icons-material';
import { useMusic, Track } from '../contexts/MusicContext';
import { useLocation } from 'react-router-dom';

const Library: React.FC = () => {
  const { state, dispatch } = useMusic();
  const location = useLocation();
  const initialTab = location.state?.tab ?? 0;
  const [tabValue, setTabValue] = useState(initialTab);

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  const handlePlayTrack = (track: Track) => {
    dispatch({ type: 'SET_CURRENT_TRACK', payload: track });
    dispatch({ type: 'SET_QUEUE', payload: state.likedTracks });
    dispatch({ type: 'ADD_TO_RECENTLY_PLAYED', payload: track });
  };

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const playAllLikedSongs = () => {
    if (state.likedTracks.length > 0) {
      dispatch({ type: 'SET_CURRENT_TRACK', payload: state.likedTracks[0] });
      dispatch({ type: 'SET_QUEUE', payload: state.likedTracks });
      dispatch({ type: 'ADD_TO_RECENTLY_PLAYED', payload: state.likedTracks[0] });
    }
  };

  return (
    <Box sx={{ padding: '24px', paddingBottom: '100px' }}>
      {/* Header */}
      <Box sx={{ marginBottom: '32px' }}>
        <Typography
          variant="h3"
          sx={{
            color: '#ffffff',
            fontWeight: 700,
            marginBottom: '16px',
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
          }}
        >
          Your Library
        </Typography>
        <Typography
          variant="h6"
          sx={{
            color: '#b3b3b3',
            marginBottom: '32px',
          }}
        >
          Your music collection
        </Typography>
      </Box>

      {/* Tabs */}
      <Box sx={{ marginBottom: '32px' }}>
        <Tabs
          value={tabValue}
          onChange={handleTabChange}
          sx={{
            '& .MuiTabs-indicator': {
              backgroundColor: '#1db954',
            },
            '& .MuiTab-root': {
              color: '#b3b3b3',
              textTransform: 'none',
              fontSize: '16px',
              fontWeight: 500,
              '&.Mui-selected': {
                color: '#ffffff',
              },
            },
          }}
        >
          <Tab label="Liked Songs" />
          <Tab label="Recently Played" />
        </Tabs>
      </Box>

      {/* Liked Songs Tab */}
      {tabValue === 0 && (
        <Box>
          {state.likedTracks.length > 0 ? (
            <Box>
              {/* Liked Songs Header */}
              <Box sx={{ display: 'flex', alignItems: 'center', marginBottom: '32px' }}>
                <Box
                  sx={{
                    width: 232,
                    height: 232,
                    background: 'linear-gradient(135deg, #450af5, #c93aed)',
                    borderRadius: '8px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    marginRight: '32px',
                  }}
                >
                  <Favorite sx={{ fontSize: 80, color: '#ffffff' }} />
                </Box>
                <Box>
                  <Typography
                    variant="caption"
                    sx={{
                      color: '#b3b3b3',
                      textTransform: 'uppercase',
                      fontWeight: 700,
                      letterSpacing: '1px',
                    }}
                  >
                    Playlist
                  </Typography>
                  <Typography
                    variant="h2"
                    sx={{
                      color: '#ffffff',
                      fontWeight: 700,
                      margin: '8px 0',
                    }}
                  >
                    Liked Songs
                  </Typography>
                  <Typography
                    variant="body1"
                    sx={{
                      color: '#b3b3b3',
                      marginBottom: '16px',
                    }}
                  >
                    {state.likedTracks.length} songs
                  </Typography>
                  <Button
                    variant="contained"
                    startIcon={<PlayArrow />}
                    onClick={playAllLikedSongs}
                    sx={{
                      backgroundColor: '#1db954',
                      color: '#ffffff',
                      borderRadius: '20px',
                      textTransform: 'none',
                      fontWeight: 600,
                      padding: '8px 24px',
                      '&:hover': {
                        backgroundColor: '#1ed760',
                      },
                    }}
                  >
                    Play All
                  </Button>
                </Box>
              </Box>

              {/* Liked Songs List */}
              <List>
                {state.likedTracks.map((track, index) => (
                  <ListItem
                    key={track.id}
                    sx={{
                      cursor: 'pointer',
                      borderRadius: '4px',
                      marginBottom: '4px',
                      '&:hover': {
                        backgroundColor: '#2a2a2a',
                      },
                    }}
                    onClick={() => handlePlayTrack(track)}
                  >
                    <ListItemIcon sx={{ minWidth: '40px' }}>
                      <Typography
                        variant="body2"
                        sx={{
                          color: '#b3b3b3',
                          fontWeight: 500,
                          width: '16px',
                          textAlign: 'center',
                        }}
                      >
                        {index + 1}
                      </Typography>
                    </ListItemIcon>
                    <Box sx={{ display: 'flex', alignItems: 'center', minWidth: 0, flex: 1 }}>
                      <CardMedia
                        component="img"
                        sx={{
                          width: 40,
                          height: 40,
                          borderRadius: '4px',
                          marginRight: '16px',
                        }}
                        image={track.coverUrl}
                        alt={track.title}
                      />
                      <Box sx={{ minWidth: 0, flex: 1 }}>
                        <Typography
                          variant="body1"
                          sx={{
                            color: '#ffffff',
                            fontWeight: 500,
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            whiteSpace: 'nowrap',
                          }}
                        >
                          {track.title}
                        </Typography>
                        <Typography
                          variant="body2"
                          sx={{
                            color: '#b3b3b3',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            whiteSpace: 'nowrap',
                          }}
                        >
                          {track.artist}
                        </Typography>
                      </Box>
                    </Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                      <Typography
                        variant="body2"
                        sx={{
                          color: '#b3b3b3',
                          minWidth: '40px',
                          textAlign: 'right',
                        }}
                      >
                        {formatTime(track.duration)}
                      </Typography>
                      <Favorite sx={{ color: '#1db954', fontSize: '16px' }} />
                    </Box>
                  </ListItem>
                ))}
              </List>
            </Box>
          ) : (
            <Box
              sx={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                height: '300px',
                textAlign: 'center',
              }}
            >
              <Favorite sx={{ fontSize: 80, color: '#535353', marginBottom: '16px' }} />
              <Typography
                variant="h6"
                sx={{
                  color: '#ffffff',
                  fontWeight: 600,
                  marginBottom: '8px',
                }}
              >
                No liked songs yet
              </Typography>
              <Typography
                variant="body1"
                sx={{
                  color: '#b3b3b3',
                  marginBottom: '24px',
                }}
              >
                Start exploring and like songs to see them here
              </Typography>
            </Box>
          )}
        </Box>
      )}

      {/* Recently Played Tab */}
      {tabValue === 1 && (
        <Box>
          {state.recentlyPlayed.length > 0 ? (
            <Box>
              <Typography
                variant="h5"
                sx={{
                  color: '#ffffff',
                  fontWeight: 700,
                  marginBottom: '24px',
                }}
              >
                Recently Played
              </Typography>
              <List>
                {state.recentlyPlayed.map((track, index) => (
                  <ListItem
                    key={`recent-${track.id}-${index}`}
                    sx={{
                      cursor: 'pointer',
                      borderRadius: '4px',
                      marginBottom: '4px',
                      '&:hover': {
                        backgroundColor: '#2a2a2a',
                      },
                    }}
                    onClick={() => handlePlayTrack(track)}
                  >
                    <ListItemIcon sx={{ minWidth: '40px' }}>
                      <Typography
                        variant="body2"
                        sx={{
                          color: '#b3b3b3',
                          fontWeight: 500,
                          width: '16px',
                          textAlign: 'center',
                        }}
                      >
                        {index + 1}
                      </Typography>
                    </ListItemIcon>
                    <Box sx={{ display: 'flex', alignItems: 'center', minWidth: 0, flex: 1 }}>
                      <CardMedia
                        component="img"
                        sx={{
                          width: 40,
                          height: 40,
                          borderRadius: '4px',
                          marginRight: '16px',
                        }}
                        image={track.coverUrl}
                        alt={track.title}
                      />
                      <Box sx={{ minWidth: 0, flex: 1 }}>
                        <Typography
                          variant="body1"
                          sx={{
                            color: '#ffffff',
                            fontWeight: 500,
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            whiteSpace: 'nowrap',
                          }}
                        >
                          {track.title}
                        </Typography>
                        <Typography
                          variant="body2"
                          sx={{
                            color: '#b3b3b3',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            whiteSpace: 'nowrap',
                          }}
                        >
                          {track.artist}
                        </Typography>
                      </Box>
                    </Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                      <Typography
                        variant="body2"
                        sx={{
                          color: '#b3b3b3',
                          minWidth: '40px',
                          textAlign: 'right',
                        }}
                      >
                        {formatTime(track.duration)}
                      </Typography>
                      <PlayArrow sx={{ color: '#b3b3b3', fontSize: '16px' }} />
                    </Box>
                  </ListItem>
                ))}
              </List>
            </Box>
          ) : (
            <Box
              sx={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                height: '300px',
                textAlign: 'center',
              }}
            >
              <QueueMusic sx={{ fontSize: 80, color: '#535353', marginBottom: '16px' }} />
              <Typography
                variant="h6"
                sx={{
                  color: '#ffffff',
                  fontWeight: 600,
                  marginBottom: '8px',
                }}
              >
                No recently played songs
              </Typography>
              <Typography
                variant="body1"
                sx={{
                  color: '#b3b3b3',
                  marginBottom: '24px',
                }}
              >
                Start listening to music to see your history here
              </Typography>
            </Box>
          )}
        </Box>
      )}
    </Box>
  );
};

export default Library; 