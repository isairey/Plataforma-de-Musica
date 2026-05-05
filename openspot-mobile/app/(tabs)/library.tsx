import React, { useState, useEffect, useContext } from 'react';
import { View, StyleSheet, StatusBar, ScrollView, TouchableOpacity, Text, Modal, TextInput, FlatList, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useSearch } from '@/hooks/useSearch';
import { TopBar } from '@/components/TopBar';
import { PlaylistList } from '@/components/PlaylistList';
import { PlaylistCard } from '@/components/PlaylistCard';
import { useLikedSongs } from '@/hooks/useLikedSongs';
import { MusicPlayerContext } from './_layout';
import { Ionicons } from '@expo/vector-icons';
import { PlaylistStorage, Playlist } from '@/lib/playlist-storage';
import { MusicAPI } from '@/lib/music-api';
import { useFocusEffect } from 'expo-router';

export default function LibraryScreen() {
  const [currentView, setCurrentView] = useState<'home' | 'search'>('home');
  const searchState = useSearch();
  const { handleTrackSelect, isPlaying, currentTrack } = useContext(MusicPlayerContext);
  const { getLikedSongsAsTrack, isLiked, toggleLike } = useLikedSongs();
  const likedTracks = getLikedSongsAsTrack();

  const [playlists, setPlaylists] = useState<Playlist[]>([]);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newPlaylistName, setNewPlaylistName] = useState('');
  const [newPlaylistCover, setNewPlaylistCover] = useState('https://misc.scdn.co/liked-songs/liked-songs-640.png');
  const [selectedPlaylist, setSelectedPlaylist] = useState<Playlist | null>(null);
  const [playlistTracks, setPlaylistTracks] = useState<any[]>([]);
  const [showLikedSongs, setShowLikedSongs] = useState(false);

  useEffect(() => {
    fetchPlaylists();
  }, []);

  
  useEffect(() => {
    const refreshTracks = async () => {
      if (selectedPlaylist) {
        const updated = (await PlaylistStorage.getPlaylists()).find(pl => pl.name === selectedPlaylist.name);
        if (updated) {
          setSelectedPlaylist(updated);
          const tracks = await PlaylistStorage.getPlaylistTracks(updated);
          setPlaylistTracks(tracks);
        }
      } else {
        
        setPlaylistTracks([]);
      }
    };
    refreshTracks();
  }, [playlists, selectedPlaylist?.name]); 

  useFocusEffect(
    React.useCallback(() => {
      fetchPlaylists();
    }, [])
  );

  const fetchPlaylists = async () => {
    const pls = await PlaylistStorage.getPlaylists();
    
    const filteredPlaylists = pls.filter(pl => pl.name !== 'offline');
    setPlaylists(filteredPlaylists);
  };

  const handleViewChange = (view: 'home' | 'search') => {
    setCurrentView(view);
    if (view === 'home') {
      searchState.clearResults();
    }
  };

  const handleSearchClick = () => {
    setCurrentView('search');
  };

  const handleSearchStart = () => {
    setCurrentView('search');
  };

  const handlePlaylistPress = async (playlist: Playlist) => {
    setSelectedPlaylist(playlist);
    
    const tracks: any[] = [];
    for (const id of playlist.trackIds) {
      try {
        const res = await MusicAPI.search({ q: id, type: 'track' });
        if (res.tracks && res.tracks.length > 0) tracks.push(res.tracks[0]);
      } catch {}
    }
    setPlaylistTracks(tracks);
  };

  const handleCreatePlaylist = async () => {
    setShowCreateModal(true);
  };

  const handleCreatePlaylistSubmit = async () => {
    if (!newPlaylistName.trim()) return;
    await PlaylistStorage.addPlaylist({
      name: newPlaylistName.trim(),
      cover: '',
      trackIds: [],
    });
    setNewPlaylistName('');
    setShowCreateModal(false);
    fetchPlaylists();
  };

  const handleBackToLibrary = () => {
    setSelectedPlaylist(null);
    setShowLikedSongs(false);
    setPlaylistTracks([]);
    setCurrentView('home'); 
  };

  const handlePlaylistsUpdated = async () => {
    await fetchPlaylists();
    if (selectedPlaylist) {
      
      const updated = (await PlaylistStorage.getPlaylists()).find(pl => pl.name === selectedPlaylist.name);
      if (updated) {
        setSelectedPlaylist(updated);
        const tracks = await PlaylistStorage.getPlaylistTracks(updated);
        setPlaylistTracks(tracks);
      }
    }
  };

  const handleRemoveTrackFromPlaylist = async (trackId: string, playlistName: string) => {
    await PlaylistStorage.removeTrackFromPlaylist(trackId, playlistName);
    
    if (selectedPlaylist) {
      const updated = (await PlaylistStorage.getPlaylists()).find(pl => pl.name === playlistName);
      if (updated) {
        setSelectedPlaylist(updated);
        const tracks = await PlaylistStorage.getPlaylistTracks(updated);
        setPlaylistTracks(tracks);
      }
    }
  };

  const handlePlaylistPlay = async (playlist: Playlist, shuffle = false) => {
    const tracks = await PlaylistStorage.getPlaylistTracks(playlist);
    if (tracks.length > 0) {
      let playTracks = tracks;
      if (shuffle) {
        playTracks = [...tracks].sort(() => Math.random() - 0.5);
      }
      handleTrackSelect(playTracks[0], playTracks, 0);
    }
  };

  const handleLikedSongsPlay = (shuffle = false) => {
    let playTracks = likedTracks;
    if (shuffle) {
      playTracks = [...likedTracks].sort(() => Math.random() - 0.5);
    }
    if (playTracks.length > 0) {
      handleTrackSelect(playTracks[0], playTracks, 0);
    }
  };

  const handleDeletePlaylist = async (playlist: Playlist) => {
    Alert.alert(
      'Delete Playlist',
      `Are you sure you want to delete the playlist "${playlist.name}"? This cannot be undone.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete', style: 'destructive', onPress: async () => {
            const all = await PlaylistStorage.getPlaylists();
            const updated = all.filter(pl => pl.name !== playlist.name);
            await PlaylistStorage.savePlaylists(updated);
            fetchPlaylists();
          }
        }
      ]
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#000" translucent={false} />
      {showLikedSongs ? (
        <View style={[styles.scrollContent, { flex: 1 }]}> 
          <TouchableOpacity onPress={handleBackToLibrary} style={styles.backButton}>
            <Ionicons name="chevron-back" size={22} color="#fff" />
            <Text style={{ color: '#fff', fontSize: 16, marginLeft: 4 }}>Back to Library</Text>
          </TouchableOpacity>
          <PlaylistCard
            playlist={{
              name: 'Liked Songs',
              cover: likedTracks[0]?.images?.large || 'https://misc.scdn.co/liked-songs/liked-songs-640.png',
              trackCount: likedTracks.length,
            }}
            onPress={() => {}}
            onShuffle={() => handleLikedSongsPlay(true)}
            onPlay={() => handleLikedSongsPlay(false)}
          />
          <Text style={styles.sectionTitle}>Tracks</Text>
          <FlatList
            data={likedTracks}
            keyExtractor={item => item.id.toString()}
            renderItem={({ item, index }) => (
              <>
                <View style={styles.trackRowBox}>
                  <TouchableOpacity
                    style={[styles.trackRow, { flex: 1 }]}
                    onPress={() => handleTrackSelect(item, likedTracks, index)}
                  >
                    <Text style={styles.trackRowTitle}>{item.title}</Text>
                    <Text style={styles.trackRowArtist}>{item.artist}</Text>
                  </TouchableOpacity>
                  <View style={styles.actionRow}>
                    <TouchableOpacity
                      style={styles.iconButton}
                      onPress={() => toggleLike(item)}
                    >
                      <Ionicons
                        name={isLiked(item.id) ? 'heart' : 'heart-outline'}
                        size={20}
                        color={isLiked(item.id) ? '#1DB954' : '#fff'}
                      />
                    </TouchableOpacity>
                  </View>
                </View>
                {index < likedTracks.length - 1 && <View style={styles.trackDivider} />}
              </>
            )}
            ListEmptyComponent={<Text style={{ color: '#888', marginTop: 16 }}>No liked songs yet.</Text>}
            contentContainerStyle={{ paddingBottom: 120 }}
          />
        </View>
      ) : !selectedPlaylist ? (
        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          <Text style={styles.sectionTitle}>Your Library</Text>
          <PlaylistCard
            playlist={{
              name: 'Liked Songs',
              cover: likedTracks[0]?.images?.large || 'https://misc.scdn.co/liked-songs/liked-songs-640.png',
              trackCount: likedTracks.length,
            }}
            onPress={() => setShowLikedSongs(true)}
            onShuffle={() => handleLikedSongsPlay(true)}
            onPlay={() => handleLikedSongsPlay(false)}
          />
          <PlaylistList
            playlists={playlists.map(pl => {
              let cover = 'https://misc.scdn.co/liked-songs/liked-songs-640.png';
              if (pl.trackIds.length > 0) {
                const lastTrackId = pl.trackIds[pl.trackIds.length - 1];
                const track = [...likedTracks, ...playlistTracks].find(t => t.id.toString() === lastTrackId);
                if (track && track.images) {
                  cover = MusicAPI.getOptimalImage(track.images);
                }
              }
              return {
                ...pl,
                trackCount: pl.trackIds.length,
                cover,
              };
            })}
            onPlaylistPress={handlePlaylistPress}
            onPlaylistShuffle={pl => handlePlaylistPlay(pl, true)}
            onPlaylistPlay={pl => handlePlaylistPlay(pl, false)}
            onPlaylistLongPress={handleDeletePlaylist}
          />
          <TouchableOpacity style={styles.createButton} onPress={handleCreatePlaylist}>
            <Ionicons name="add-circle" size={24} color="#1DB954" style={{ marginRight: 8 }} />
            <Text style={styles.createButtonText}>Create Playlist</Text>
          </TouchableOpacity>
          <View style={{ height: 120 }} />
        </ScrollView>
      ) : (
        <View style={[styles.scrollContent, { flex: 1 }]}> 
          <TouchableOpacity onPress={handleBackToLibrary} style={styles.backButton}>
            <Ionicons name="chevron-back" size={22} color="#fff" />
            <Text style={{ color: '#fff', fontSize: 16, marginLeft: 4 }}>Back to Library</Text>
          </TouchableOpacity>
          <PlaylistCard
            playlist={{
              ...selectedPlaylist,
              trackCount: selectedPlaylist.trackIds.length,
              cover: (() => {
                if (selectedPlaylist.trackIds.length > 0) {
                  const lastTrackId = selectedPlaylist.trackIds[selectedPlaylist.trackIds.length - 1];
                  const track = [...likedTracks, ...playlistTracks].find(t => t.id.toString() === lastTrackId);
                  if (track && track.images) {
                    return MusicAPI.getOptimalImage(track.images);
                  }
                }
                return 'https://misc.scdn.co/liked-songs/liked-songs-640.png';
              })(),
            }}
            onPress={() => {}}
            onShuffle={() => handlePlaylistPlay(selectedPlaylist, true)}
            onPlay={() => handlePlaylistPlay(selectedPlaylist, false)}
          />
          <Text style={styles.sectionTitle}>Tracks</Text>
          <FlatList
            data={playlistTracks}
            keyExtractor={item => item.id.toString()}
            renderItem={({ item, index }) => (
              <>
                <View style={styles.trackRowBox}>
                  <TouchableOpacity
                    style={[styles.trackRow, { flex: 1 }]}
                    onPress={() => handleTrackSelect(item, playlistTracks, index)}
                  >
                    <Text style={styles.trackRowTitle}>{item.title}</Text>
                    <Text style={styles.trackRowArtist}>{item.artist}</Text>
                  </TouchableOpacity>
                  <View style={styles.actionRow}>
                    <TouchableOpacity
                      style={styles.iconButton}
                      onPress={() => toggleLike(item)}
                    >
                      <Ionicons
                        name={isLiked(item.id) ? 'heart' : 'heart-outline'}
                        size={20}
                        color={isLiked(item.id) ? '#1DB954' : '#fff'}
                      />
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={styles.iconButton}
                      onPress={() => handleRemoveTrackFromPlaylist(item.id.toString(), selectedPlaylist.name)}
                    >
                      <Ionicons name="trash" size={20} color="#ff4444" />
                    </TouchableOpacity>
                  </View>
                </View>
                {index < playlistTracks.length - 1 && <View style={styles.trackDivider} />}
              </>
            )}
            ListEmptyComponent={<Text style={{ color: '#888', marginTop: 16 }}>No tracks in this playlist.</Text>}
            contentContainerStyle={{ paddingBottom: 120 }}
            extraData={playlistTracks}
          />
      </View>
      )}
      <Modal visible={showCreateModal} transparent animationType="fade" onRequestClose={() => setShowCreateModal(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalBox}>
            <Text style={styles.modalTitle}>Create Playlist</Text>
            <TextInput
              style={styles.input}
              placeholder="Playlist Name"
              placeholderTextColor="#888"
              value={newPlaylistName}
              onChangeText={setNewPlaylistName}
            />
            <TouchableOpacity
              style={[styles.createButton, { marginTop: 18 }]}
              onPress={handleCreatePlaylistSubmit}
            >
              <Ionicons name="add-circle" size={24} color="#1DB954" style={{ marginRight: 8 }} />
              <Text style={styles.createButtonText}>Create</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.cancelButton} onPress={() => setShowCreateModal(false)}>
              <Text style={{ color: '#fff', fontSize: 15 }}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 60,
  },
  sectionTitle: {
    color: '#fff',
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 18,
    marginLeft: 2,
  },
  createButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#181818',
    borderRadius: 24,
    paddingVertical: 14,
    marginTop: 18,
    marginBottom: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.12,
    shadowRadius: 4,
    elevation: 2,
  },
  createButtonText: {
    color: '#1DB954',
    fontSize: 16,
    fontWeight: 'bold',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.7)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalBox: {
    backgroundColor: '#181818',
    borderRadius: 16,
    padding: 24,
    width: '80%',
    alignItems: 'center',
  },
  modalTitle: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 18,
  },
  input: {
    backgroundColor: '#222',
    color: '#fff',
    borderRadius: 8,
    padding: 12,
    width: '100%',
    marginBottom: 12,
    fontSize: 15,
  },
  cancelButton: {
    marginTop: 10,
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 18,
    marginLeft: 2,
  },
  trackRow: {
    backgroundColor: '#181818',
    borderRadius: 8,
    padding: 14,
    marginBottom: 10,
  },
  trackRowTitle: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 1,
  },
  trackRowArtist: {
    color: '#888',
    fontSize: 12,
  },
  trackRowBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#181818',
    borderRadius: 8,
    marginBottom: 4,
    paddingVertical: 2,
    paddingHorizontal: 6,
  },
  trackDivider: {
    height: 1,
    backgroundColor: '#222',
    marginVertical: 2,
    marginLeft: 8,
    marginRight: 8,
  },
  iconButton: {
    marginHorizontal: 2,
    padding: 8,
    borderRadius: 16,
  },
  removeButton: {
    marginLeft: 6,
  },
  actionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: 8,
  },
});
