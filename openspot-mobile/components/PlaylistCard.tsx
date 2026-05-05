import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface PlaylistCardProps {
  playlist: {
    name: string;
    cover: string;
    trackCount: number;
  };
  onPress: () => void;
  onShuffle?: () => void;
  onPlay?: () => void;
  onLongPress?: () => void;
}

export function PlaylistCard({ playlist, onPress, onShuffle, onPlay, onLongPress }: PlaylistCardProps) {
  return (
    <View style={styles.card}>
      <TouchableOpacity
        style={styles.infoArea}
        onPress={onPress}
        onLongPress={onLongPress}
        delayLongPress={350}
        activeOpacity={0.85}
       >
        <Image source={{ uri: playlist.cover }} style={styles.cover} resizeMode="cover" />
        <View style={styles.info}>
          <Text style={styles.name} numberOfLines={1}>{playlist.name}</Text>
          <Text style={styles.count}>{playlist.trackCount} {playlist.trackCount === 1 ? 'song' : 'songs'}</Text>
        </View>
      </TouchableOpacity>
      <View style={styles.actionRow}>
        <TouchableOpacity style={styles.iconButton} onPress={onShuffle}>
          <Ionicons name="shuffle" size={20} color="#fff" />
        </TouchableOpacity>
        <TouchableOpacity style={styles.iconButton} onPress={onPlay}>
          <Ionicons name="play" size={20} color="#1DB954" />
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#181818',
    borderRadius: 12,
    marginBottom: 14,
    padding: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.12,
    shadowRadius: 4,
    elevation: 2,
  },
  infoArea: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  cover: {
    width: 56,
    height: 56,
    borderRadius: 8,
    marginRight: 14,
    backgroundColor: '#222',
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#222',
  },
  info: {
    flex: 1,
  },
  name: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 2,
  },
  count: {
    color: '#888',
    fontSize: 13,
  },
  actionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: 8,
  },
  iconButton: {
    marginLeft: 4,
    padding: 8,
    borderRadius: 16,
  },
}); 