import React from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, Dimensions } from 'react-native';
import { Image } from 'expo-image';
import { Ionicons } from '@expo/vector-icons';
import { Track } from '@/types/music';
import { MusicAPI } from '@/lib/music-api';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

interface HorizontalTrackListProps {
  title: string;
  tracks: Track[];
  onTrackSelect: (track: Track, trackList?: Track[], startIndex?: number) => void;
  isPlaying: boolean;
  currentTrack: Track | null;
}

export function HorizontalTrackList({ title, tracks, onTrackSelect, isPlaying, currentTrack }: HorizontalTrackListProps) {
  const renderTrackItem = ({ item, index }: { item: Track; index: number }) => {
    const isCurrentTrack = currentTrack?.id === item.id;
    return (
      <View style={styles.cardWrapper}>
        <TouchableOpacity
          style={[styles.card, isCurrentTrack && styles.currentTrackCard]}
          onPress={() => onTrackSelect(item, tracks, index)}
          activeOpacity={0.85}
        >
          <View style={styles.albumArtWrapper}>
            <Image
              source={{ uri: MusicAPI.getOptimalImage(item.images) }}
              style={styles.albumArt}
              contentFit="cover"
            />
            <TouchableOpacity
              style={styles.playButton}
              onPress={() => onTrackSelect(item, tracks, index)}
              activeOpacity={0.7}
            >
              <Ionicons
                name={isCurrentTrack && isPlaying ? 'pause' : 'play'}
                size={28}
                color="#fff"
              />
            </TouchableOpacity>
          </View>
          <View style={styles.cardTextContainer}>
            <Text style={[styles.trackTitle, isCurrentTrack && styles.currentTrackText]} numberOfLines={1}>{item.title}</Text>
            {!isCurrentTrack && (
              <Text style={[styles.trackArtist, isCurrentTrack && styles.currentTrackText]} numberOfLines={1}>{item.artist}</Text>
            )}
          </View>
        </TouchableOpacity>
      </View>
    );
  };

  return (
    <View style={styles.sectionContainer}>
      <Text style={styles.sectionTitle}>{title}</Text>
      <FlatList
        data={tracks}
        renderItem={renderTrackItem}
        keyExtractor={item => item.id.toString()}
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.horizontalList}
      />
    </View>
  );
}

const CARD_WIDTH = 120;
const CARD_HEIGHT = 170;
const ALBUM_SIZE = 110;

const styles = StyleSheet.create({
  sectionContainer: {
    marginBottom: 8,
  },
  sectionTitle: {
    color: '#fff',
    fontSize: 20,
    fontWeight: 'bold',
    marginLeft: 16,
    marginTop: 16,
    marginBottom: 8,
  },
  horizontalList: {
    paddingLeft: 12,
    paddingBottom: 8,
  },
  cardWrapper: {
    marginRight: 16,
  },
  card: {
    width: CARD_WIDTH,
    height: CARD_HEIGHT,
    backgroundColor: '#181818',
    borderRadius: 18,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.18,
    shadowRadius: 8,
    elevation: 6,
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'flex-start',
  },
  currentTrackCard: {
    borderColor: '#1DB954',
    borderWidth: 2,
  },
  albumArtWrapper: {
    width: ALBUM_SIZE,
    height: ALBUM_SIZE,
    borderRadius: 16,
    overflow: 'hidden',
    marginTop: 8,
    marginBottom: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  albumArt: {
    width: ALBUM_SIZE,
    height: ALBUM_SIZE,
    borderRadius: 16,
  },
  playButton: {
    position: 'absolute',
    bottom: 8,
    right: 8,
    backgroundColor: '#1DB954',
    borderRadius: 20,
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  cardTextContainer: {
    alignItems: 'flex-start',
    width: '100%',
    paddingHorizontal: 10,
    marginTop: 4,
    paddingBottom: 12, 
  },
  trackTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#fff',
    marginBottom: 2,
  },
  trackArtist: {
    fontSize: 13,
    color: '#888',
    marginBottom: 2,
  },
  currentTrackText: {
    color: '#1DB954',
  },
}); 