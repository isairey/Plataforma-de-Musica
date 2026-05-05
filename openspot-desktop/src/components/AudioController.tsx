import React, { useEffect, useRef, useState } from 'react';
import { useMusic } from '../contexts/MusicContext';
import { getStreamUrl } from '../lib/music-api';

const AudioController: React.FC = () => {
  const { state, dispatch } = useMusic();
  const audioRef = useRef<HTMLAudioElement>(null);
  const [streamUrl, setStreamUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch stream URL when track changes
  useEffect(() => {
    const fetchStream = async () => {
      if (state.currentTrack) {
        setLoading(true);
        setError(null);
        try {
          const url = await getStreamUrl(state.currentTrack.id);
          setStreamUrl(url);
        } catch (err: any) {
          setError('Failed to load stream.');
          setStreamUrl(null);
        } finally {
          setLoading(false);
        }
      } else {
        setStreamUrl(null);
      }
    };
    fetchStream();
  }, [state.currentTrack]);

  // Set audio src when streamUrl changes and start streaming immediately
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    
    if (streamUrl) {
      try {
        // Download the entire file first, then play locally (avoids streaming connection issues)
        const downloadAndPlay = async () => {
          try {
            console.log('🎵 Downloading audio file to avoid streaming connection issues');
            
            // Fetch the entire file as a blob
            const response = await fetch(streamUrl, {
              method: 'GET',
              headers: {
                'Connection': 'close',
                'Cache-Control': 'no-cache'
              }
            });
            
            if (!response.ok) throw new Error(`HTTP ${response.status}`);
            
            // Convert to blob and create local URL
            const blob = await response.blob();
            const localUrl = URL.createObjectURL(blob);
            
            // Set local URL and play
            audio.src = localUrl;
            audio.preload = 'auto';
            audio.load();
            
            // If already playing, start immediately
            if (state.isPlaying) {
              audio.play().catch(err => console.error('Play failed:', err));
            }
            
            console.log('🎵 Audio downloaded and playing locally - network connection released');
            
            // Clean up the blob URL after a delay
            setTimeout(() => {
              URL.revokeObjectURL(localUrl);
            }, 5000);
            
          } catch (error) {
            console.error('Download failed, falling back to streaming:', error);
            // Fallback to streaming if download fails
            audio.src = streamUrl;
            audio.preload = 'auto';
            audio.load();
            
            if (state.isPlaying) {
              audio.play().catch(err => console.error('Play failed:', err));
            }
          }
        };
        
        downloadAndPlay();
        
      } catch (error) {
        console.error('Streaming setup failed:', error);
        setError('Streaming failed.');
      }
    } else {
      audio.src = '';
    }
  }, [streamUrl]);
  
  // Add event listeners for better streaming experience (only once)
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    
    const onCanPlay = () => {
      console.log('🎵 Audio can start playing - buffering sufficient');
      // Don't auto-play here - let the main play/pause useEffect handle it
    };
    
    const onCanPlayThrough = () => {
      console.log('🎵 Audio can play through without interruption');
    };
    
    const onWaiting = () => {
      console.log('🎵 Audio buffering...');
    };
    
    const onPlaying = () => {
      console.log('🎵 Audio is now playing');
    };
    
    audio.addEventListener('canplay', onCanPlay);
    audio.addEventListener('canplaythrough', onCanPlayThrough);
    audio.addEventListener('waiting', onWaiting);
    audio.addEventListener('playing', onPlaying);
    
    return () => {
      audio.removeEventListener('canplay', onCanPlay);
      audio.removeEventListener('canplaythrough', onCanPlayThrough);
      audio.removeEventListener('waiting', onWaiting);
      audio.removeEventListener('playing', onPlaying);
    };
  }, []); // Remove state.isPlaying dependency
  
  // Play/pause
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    
    console.log('🎵 Play/Pause state change:', {
      isPlaying: state.isPlaying,
      hasSrc: !!audio.src,
      readyState: audio.readyState,
      currentTime: audio.currentTime,
      paused: audio.paused,
      audioElement: audio
    });
    
    if (state.isPlaying) {
      if (audio.src && audio.readyState >= 2) { // HAVE_CURRENT_DATA or higher
        console.log('🎵 Attempting to play audio');
        audio.play().catch(err => console.error('Play failed:', err));
      } else {
        console.log('🎵 Audio not ready to play yet');
      }
    } else {
      console.log('🎵 Pausing audio - calling audio.pause()');
      try {
        audio.pause();
        console.log('🎵 Audio paused successfully, paused state:', audio.paused);
      } catch (error) {
        console.error('🎵 Error pausing audio:', error);
      }
    }
  }, [state.isPlaying]);

  // Volume
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    audio.volume = state.volume;
  }, [state.volume]);

  // Seek
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    if (Math.abs(audio.currentTime - state.currentTime) > 1) {
      audio.currentTime = state.currentTime;
    }
  }, [state.currentTime]);

  // Listen for time updates and duration
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    
    const updateTime = () => {
      dispatch({ type: 'SET_CURRENT_TIME', payload: audio.currentTime });
    };
    
    const updateDuration = () => {
      dispatch({ type: 'SET_DURATION', payload: audio.duration || 0 });
    };
    
    const onEnded = () => {
      if (state.repeatMode === 'track') {
        audio.currentTime = 0;
        audio.play().catch(err => console.error('Replay failed:', err));
      } else {
        dispatch({ type: 'NEXT_TRACK' });
      }
    };
    
    const onError = (e: Event) => {
      console.error('Audio error:', e);
      setError('Audio playback error');
      
      // Clean up network resources on error immediately
      if (audioRef.current) {
        audioRef.current.src = '';
        audioRef.current.load();
        console.log('🎵 AudioController: Network resources cleaned up due to error');
      }
    };
    
    audio.addEventListener('timeupdate', updateTime);
    audio.addEventListener('loadedmetadata', updateDuration);
    audio.addEventListener('ended', onEnded);
    audio.addEventListener('error', onError);
    
    return () => {
      audio.removeEventListener('timeupdate', updateTime);
      audio.removeEventListener('loadedmetadata', updateDuration);
      audio.removeEventListener('ended', onEnded);
      audio.removeEventListener('error', onError);
    };
  }, [dispatch, state.repeatMode]);

  // Cleanup network resources when component unmounts or track changes
  useEffect(() => {
    return () => {
      if (audioRef.current) {
        audioRef.current.src = '';
        audioRef.current.load();
        console.log('🎵 AudioController: Network resources cleaned up');
      }
    };
  }, [state.currentTrack?.id]);

  // Aggressive network cleanup function
  const forceNetworkCleanup = () => {
    if (audioRef.current) {
      console.log('🎵 AudioController: Force cleaning up network resources');
      
      // Completely break the streaming connection
      audioRef.current.src = '';
      audioRef.current.load();
      
      // Force garbage collection hint
      if (window.gc) {
        window.gc();
      }
      
      // Clear any remaining network requests
      if ('caches' in window) {
        caches.keys().then(names => {
          names.forEach(name => {
            if (name.includes('audio') || name.includes('stream')) {
              caches.delete(name);
            }
          });
        });
      }
    }
  };

  // Add network cleanup on play state change
  useEffect(() => {
    if (!state.isPlaying && audioRef.current) {
      // Force cleanup when pausing
      setTimeout(forceNetworkCleanup, 100);
    }
  }, [state.isPlaying]);

  return <audio ref={audioRef} preload="none" style={{ display: 'none' }} />;
};

export default AudioController; 