import React, { useContext } from 'react';
import { View, StyleSheet, StatusBar, Dimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from 'expo-router';
import { useSearch } from '@/hooks/useSearch';
import { TopBar } from '@/components/TopBar';
import { SearchResults } from '@/components/SearchResults';
import { MusicPlayerContext } from './_layout';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

export default function SearchScreen() {
  const searchState = useSearch();
  const { handleTrackSelect, isPlaying, currentTrack } = useContext(MusicPlayerContext);

  useFocusEffect(
    React.useCallback(() => {
      searchState.clearResults();
    }, [])
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#000" translucent={false} />
      <TopBar
        currentView="search"
        onViewChange={() => {}}
        onSearchClick={() => {}}
        onSearchStart={() => {}}
        searchState={searchState}
        placeholderFontSize={SCREEN_WIDTH > 400 ? 18 : 15}
      />
      <View style={styles.mainContent}>
        <SearchResults
          searchState={searchState}
          onTrackSelect={handleTrackSelect}
          isPlaying={isPlaying}
          currentTrack={currentTrack}
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  mainContent: {
    paddingTop: 16,
    flex: 1,
    paddingHorizontal: 2,
  },
});
