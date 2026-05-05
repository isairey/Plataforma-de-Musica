import React, { useState } from 'react';
import {
  Box,
  Typography,
  TextField,
  Grid,
  Card,
  CardContent,
  CardMedia,
  InputAdornment,
  CircularProgress,
  IconButton,
} from '@mui/material';
import { Search as SearchIcon, PlayArrow, Pause, Favorite, FavoriteBorder } from '@mui/icons-material';
import { useMusic, Track } from '../contexts/MusicContext';
import { searchTracks, convertAPITrackToTrack, APITrack } from '../lib/music-api';

const Search: React.FC = () => {
  const { state, dispatch } = useMusic();
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<Track[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const recentSearches = ['Queen', 'Beatles', 'Pink Floyd', 'Led Zeppelin'];

  // Only search when this is called (Enter or button)
  const handleSearch = async (query: string) => {
    setError(null);
    if (query.trim()) {
      setLoading(true);
      try {
        const data = await searchTracks(query);
        // Map API response to Track type using the helper function
        const tracks = data.tracks.map((track: APITrack) => {
          const convertedTrack = convertAPITrackToTrack(track);
          // Check if this track is already liked
          convertedTrack.liked = state.likedTracks.some(t => t.id === convertedTrack.id);
          return convertedTrack;
        });
        setSearchResults(tracks);
      } catch (err: any) {
        setError('Failed to fetch search results.');
        setSearchResults([]);
      } finally {
        setLoading(false);
      }
    } else {
      setSearchResults([]);
    }
  };

  // Handle Enter key
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleSearch(searchQuery);
    }
  };

  // Handle Search button click
  const handleSearchButton = () => {
    handleSearch(searchQuery);
  };

  // Handle input change (just update value, don't search)
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };

  const handlePlayPauseTrack = (track: Track) => {
    if (state.currentTrack?.id === track.id) {
      dispatch({ type: 'TOGGLE_PLAY_PAUSE' });
    } else {
      dispatch({ type: 'SET_CURRENT_TRACK', payload: track });
      dispatch({ type: 'SET_QUEUE', payload: searchResults });
      dispatch({ type: 'ADD_TO_RECENTLY_PLAYED', payload: track });
    }
  };

  const handleToggleLike = (track: Track) => {
    dispatch({ type: 'TOGGLE_LIKE_TRACK', payload: track });
  };

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  return (
    <Box sx={{
      display: 'flex',
      flexDirection: 'column',
      height: '100%',
      minHeight: 0,
      padding: 0,
      flex: 1,
    }}>
      {/* Header + Search Bar (fixed) */}
      <Box sx={{
        padding: '24px',
        paddingBottom: 0,
        flexShrink: 0,
        background: 'inherit',
        zIndex: 1,
      }}>
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
            Search
          </Typography>
          <Typography
            variant="h6"
            sx={{
              color: '#b3b3b3',
              marginBottom: '32px',
            }}
          >
            Find your favorite music
          </Typography>
        </Box>
        {/* Search Input + Button */}
        <Box sx={{ marginBottom: '16px', display: 'flex', alignItems: 'center', gap: 2 }}>
          <TextField
            fullWidth
            variant="outlined"
            placeholder="What do you want to listen to?"
            value={searchQuery}
            onChange={handleInputChange}
            onKeyDown={handleKeyDown}
            sx={{
              maxWidth: '500px',
              '& .MuiOutlinedInput-root': {
                backgroundColor: '#2a2a2a',
                borderRadius: '20px',
                '& fieldset': {
                  borderColor: 'transparent',
                },
                '&:hover fieldset': {
                  borderColor: '#1db954',
                },
                '&.Mui-focused fieldset': {
                  borderColor: '#1db954',
                },
              },
              '& .MuiInputBase-input': {
                color: '#ffffff',
                padding: '12px 16px',
              },
            }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon sx={{ color: '#b3b3b3' }} />
                </InputAdornment>
              ),
            }}
          />
          <IconButton
            color="primary"
            sx={{ background: '#1db954', color: '#fff', ml: 1, '&:hover': { background: '#1ed760' } }}
            onClick={handleSearchButton}
          >
            <SearchIcon />
          </IconButton>
        </Box>
      </Box>

      {/* Results Area (scrollable) */}
      <Box sx={{
        flex: 1,
        minHeight: 0,
        overflowY: 'auto',
        padding: '24px',
        paddingTop: 0,
        paddingBottom: '100px',
      }}>
        {/* Loading/Error State */}
        {loading && (
          <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
            <CircularProgress color="success" />
          </Box>
        )}
        {error && (
          <Box sx={{ color: 'red', mb: 2 }}>{error}</Box>
        )}

        {/* Search Results */}
        {searchResults.length > 0 && !loading && (
          <Box>
            <Typography
              variant="h6"
              sx={{
                color: '#ffffff',
                fontWeight: 600,
                marginBottom: '16px',
              }}
            >
              Search Results ({searchResults.length})
            </Typography>
            <Grid container spacing={2}>
              {searchResults.map((track) => (
                <Grid item xs={12} key={track.id}>
                  <Card
                    sx={{
                      backgroundColor: '#1a1a1a',
                      transition: 'all 0.2s',
                      display: 'flex',
                      alignItems: 'center',
                      padding: '8px',
                      '&:hover': {
                        backgroundColor: '#2a2a2a',
                      },
                    }}
                  >
                    <CardMedia
                      component="img"
                      sx={{
                        width: 64,
                        height: 64,
                        borderRadius: '4px',
                        marginRight: '16px',
                      }}
                      image={track.coverUrl}
                      alt={track.title}
                    />
                    <CardContent sx={{ flex: 1, padding: '0 !important' }}>
                      <Typography
                        variant="body1"
                        sx={{
                          color: '#ffffff',
                          fontWeight: 500,
                          marginBottom: '4px',
                        }}
                      >
                        {track.title}
                      </Typography>
                      <Typography
                        variant="body2"
                        sx={{
                          color: '#b3b3b3',
                          marginBottom: '4px',
                        }}
                      >
                        {track.artist} • {track.album}
                      </Typography>
                      <Typography
                        variant="caption"
                        sx={{
                          color: '#666',
                        }}
                      >
                        {formatTime(track.duration)}
                      </Typography>
                    </CardContent>
                    <Box sx={{ padding: '0 16px' }}>
                      {/* Like Button */}
                      <IconButton
                        size="small"
                        onClick={e => { e.stopPropagation(); handleToggleLike(track); }}
                        sx={{ color: state.likedTracks.some(t => t.id === track.id) ? '#1db954' : '#b3b3b3', marginRight: '8px' }}
                        disabled={false}
                      >
                        {state.likedTracks.some(t => t.id === track.id) ? <Favorite /> : <FavoriteBorder />}
                      </IconButton>
                      <IconButton
                        size="medium"
                        onClick={e => { e.stopPropagation(); handlePlayPauseTrack(track); }}
                        sx={{ background: state.currentTrack?.id === track.id && state.isPlaying ? '#1db954' : '#232323', color: '#fff', '&:hover': { background: '#1ed760' } }}
                      >
                        {state.currentTrack?.id === track.id && state.isPlaying ? <Pause /> : <PlayArrow />}
                      </IconButton>
                    </Box>
                  </Card>
                </Grid>
              ))}
            </Grid>
          </Box>
        )}
      </Box>
    </Box>
  );
};

export default Search; 