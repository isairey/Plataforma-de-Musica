import AsyncStorage from '@react-native-async-storage/async-storage';
import { Track } from '@/types/music';
import { MusicAPI } from '@/lib/music-api';

export interface Playlist {
  name: string;
  cover: string;
  trackIds: string[];
}

const PLAYLISTS_KEY = 'user_playlists';

export const PlaylistStorage = {
  async getPlaylists(): Promise<Playlist[]> {
    const data = await AsyncStorage.getItem(PLAYLISTS_KEY);
    return data ? JSON.parse(data) : [];
  },
  async savePlaylists(playlists: Playlist[]) {
    await AsyncStorage.setItem(PLAYLISTS_KEY, JSON.stringify(playlists));
  },
  async addPlaylist(playlist: Playlist) {
    const playlists = await this.getPlaylists();
    playlists.push(playlist);
    await this.savePlaylists(playlists);
  },
  async addTrackToPlaylists(track: Track, playlistNames: string[]) {
    const playlists = await this.getPlaylists();
    for (const pl of playlists) {
      if (playlistNames.includes(pl.name)) {
        const trackId = track.id.toString();
        if (!pl.trackIds.includes(trackId)) {
          pl.trackIds.push(trackId);
        }
      }
    }
    await this.savePlaylists(playlists);
  },
  async removeTrackFromPlaylist(trackId: string, playlistName: string) {
    const playlists = await this.getPlaylists();
    for (const pl of playlists) {
      if (pl.name === playlistName) {
        pl.trackIds = pl.trackIds.filter(id => id !== trackId);
      }
    }
    await this.savePlaylists(playlists);
  },
  async getPlaylistTracks(playlist: Playlist) {
    const tracks: Track[] = [];
    for (const id of playlist.trackIds) {
      try {
        const res = await MusicAPI.search({ q: id, type: 'track' });
        if (res.tracks && res.tracks.length > 0) tracks.push(res.tracks[0]);
      } catch {}
    }
    return tracks;
  },
};
