import React from 'react';
import { View } from 'react-native';
import { PlaylistCard } from './PlaylistCard';

interface PlaylistListProps {
  playlists: {
    name: string;
    cover: string;
    trackCount: number;
  }[];
  onPlaylistPress: (playlist: any) => void;
  onPlaylistShuffle?: (playlist: any) => void;
  onPlaylistPlay?: (playlist: any) => void;
  onPlaylistLongPress?: (playlist: any) => void;
}

export function PlaylistList({ playlists, onPlaylistPress, onPlaylistShuffle, onPlaylistPlay, onPlaylistLongPress }: PlaylistListProps) {
  return (
    <View>
      {playlists.map((playlist, idx) => (
        <PlaylistCard
          key={playlist.name + idx}
          playlist={playlist}
          onPress={() => onPlaylistPress(playlist)}
          onShuffle={onPlaylistShuffle ? () => onPlaylistShuffle(playlist) : undefined}
          onPlay={onPlaylistPlay ? () => onPlaylistPlay(playlist) : undefined}
          onLongPress={onPlaylistLongPress ? () => onPlaylistLongPress(playlist) : undefined}
        />
      ))}
    </View>
  );
}
