import React, { useContext, useEffect, useState } from 'react';
import { View, StyleSheet, StatusBar, Text, FlatList, TouchableOpacity, Dimensions, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useSearch } from '@/hooks/useSearch';
import { TopBar } from '@/components/TopBar';
import { MusicPlayerContext } from './_layout';
import { MusicAPI } from '@/lib/music-api';
import { Track } from '@/types/music';
import { Image } from 'expo-image';
import { Ionicons } from '@expo/vector-icons';
import { useLikedSongs } from '@/hooks/useLikedSongs';
import { HorizontalTrackList } from '@/components/HorizontalTrackList';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

const COUNTRY_NAMES: Record<string, string> = {
  AF: 'Afghanistan', AL: 'Albania', DZ: 'Algeria', AS: 'American Samoa', AD: 'Andorra', AO: 'Angola', AI: 'Anguilla', AQ: 'Antarctica', AG: 'Antigua and Barbuda', AR: 'Argentina', AM: 'Armenia', AW: 'Aruba', AU: 'Australia', AT: 'Austria', AZ: 'Azerbaijan', BS: 'Bahamas', BH: 'Bahrain', BD: 'Bangladesh', BB: 'Barbados', BY: 'Belarus', BE: 'Belgium', BZ: 'Belize', BJ: 'Benin', BM: 'Bermuda', BT: 'Bhutan', BO: 'Bolivia', BQ: 'Bonaire, Sint Eustatius and Saba', BA: 'Bosnia and Herzegovina', BW: 'Botswana', BV: 'Bouvet Island', BR: 'Brazil', IO: 'British Indian Ocean Territory', BN: 'Brunei Darussalam', BG: 'Bulgaria', BF: 'Burkina Faso', BI: 'Burundi', KH: 'Cambodia', CM: 'Cameroon', CA: 'Canada', CV: 'Cape Verde', KY: 'Cayman Islands', CF: 'Central African Republic', TD: 'Chad', CL: 'Chile', CN: 'China', CX: 'Christmas Island', CC: 'Cocos (Keeling) Islands', CO: 'Colombia', KM: 'Comoros', CG: 'Congo', CD: 'Congo, Democratic Republic of the', CK: 'Cook Islands', CR: 'Costa Rica', CI: 'Côte d’Ivoire', HR: 'Croatia', CU: 'Cuba', CW: 'Curaçao', CY: 'Cyprus', CZ: 'Czechia', DK: 'Denmark', DJ: 'Djibouti', DM: 'Dominica', DO: 'Dominican Republic', EC: 'Ecuador', EG: 'Egypt', SV: 'El Salvador', GQ: 'Equatorial Guinea', ER: 'Eritrea', EE: 'Estonia', SZ: 'Eswatini', ET: 'Ethiopia', FK: 'Falkland Islands (Malvinas)', FO: 'Faroe Islands', FJ: 'Fiji', FI: 'Finland', FR: 'France', GF: 'French Guiana', PF: 'French Polynesia', TF: 'French Southern Territories', GA: 'Gabon', GM: 'Gambia', GE: 'Georgia', DE: 'Germany', GH: 'Ghana', GI: 'Gibraltar', GR: 'Greece', GL: 'Greenland', GD: 'Grenada', GP: 'Guadeloupe', GU: 'Guam', GT: 'Guatemala', GG: 'Guernsey', GN: 'Guinea', GW: 'Guinea-Bissau', GY: 'Guyana', HT: 'Haiti', HM: 'Heard Island and McDonald Islands', VA: 'Holy See', HN: 'Honduras', HK: 'Hong Kong', HU: 'Hungary', IS: 'Iceland', IN: 'India', ID: 'Indonesia', IR: 'Iran', IQ: 'Iraq', IE: 'Ireland', IM: 'Isle of Man', IL: 'Israel', IT: 'Italy', JM: 'Jamaica', JP: 'Japan', JE: 'Jersey', JO: 'Jordan', KZ: 'Kazakhstan', KE: 'Kenya', KI: 'Kiribati', KP: 'Korea (Democratic People’s Republic of)', KR: 'Korea (Republic of)', KW: 'Kuwait', KG: 'Kyrgyzstan', LA: 'Lao People’s Democratic Republic', LV: 'Latvia', LB: 'Lebanon', LS: 'Lesotho', LR: 'Liberia', LY: 'Libya', LI: 'Liechtenstein', LT: 'Lithuania', LU: 'Luxembourg', MO: 'Macao', MG: 'Madagascar', MW: 'Malawi', MY: 'Malaysia', MV: 'Maldives', ML: 'Mali', MT: 'Malta', MH: 'Marshall Islands', MQ: 'Martinique', MR: 'Mauritania', MU: 'Mauritius', YT: 'Mayotte', MX: 'Mexico', FM: 'Micronesia', MD: 'Moldova', MC: 'Monaco', MN: 'Mongolia', ME: 'Montenegro', MS: 'Montserrat', MA: 'Morocco', MZ: 'Mozambique', MM: 'Myanmar', NA: 'Namibia', NR: 'Nauru', NP: 'Nepal', NL: 'Netherlands', NC: 'New Caledonia', NZ: 'New Zealand', NI: 'Nicaragua', NE: 'Niger', NG: 'Nigeria', NU: 'Niue', NF: 'Norfolk Island', MK: 'North Macedonia', MP: 'Northern Mariana Islands', NO: 'Norway', OM: 'Oman', PK: 'Pakistan', PW: 'Palau', PS: 'Palestine', PA: 'Panama', PG: 'Papua New Guinea', PY: 'Paraguay', PE: 'Peru', PH: 'Philippines', PN: 'Pitcairn', PL: 'Poland', PT: 'Portugal', PR: 'Puerto Rico', QA: 'Qatar', RE: 'Réunion', RO: 'Romania', RU: 'Russia', RW: 'Rwanda', BL: 'Saint Barthélemy', SH: 'Saint Helena, Ascension and Tristan da Cunha', KN: 'Saint Kitts and Nevis', LC: 'Saint Lucia', MF: 'Saint Martin (French part)', PM: 'Saint Pierre and Miquelon', VC: 'Saint Vincent and the Grenadines', WS: 'Samoa', SM: 'San Marino', ST: 'Sao Tome and Principe', SA: 'Saudi Arabia', SN: 'Senegal', RS: 'Serbia', SC: 'Seychelles', SL: 'Sierra Leone', SG: 'Singapore', SX: 'Sint Maarten (Dutch part)', SK: 'Slovakia', SI: 'Slovenia', SB: 'Solomon Islands', SO: 'Somalia', ZA: 'South Africa', GS: 'South Georgia and the South Sandwich Islands', SS: 'South Sudan', ES: 'Spain', LK: 'Sri Lanka', SD: 'Sudan', SR: 'Suriname', SJ: 'Svalbard and Jan Mayen', SE: 'Sweden', CH: 'Switzerland', SY: 'Syrian Arab Republic', TW: 'Taiwan', TJ: 'Tajikistan', TZ: 'Tanzania', TH: 'Thailand', TL: 'Timor-Leste', TG: 'Togo', TK: 'Tokelau', TO: 'Tonga', TT: 'Trinidad and Tobago', TN: 'Tunisia', TR: 'Turkey', TM: 'Turkmenistan', TC: 'Turks and Caicos Islands', TV: 'Tuvalu', UG: 'Uganda', UA: 'Ukraine', AE: 'United Arab Emirates', GB: 'United Kingdom', US: 'United States', UM: 'United States Minor Outlying Islands', UY: 'Uruguay', UZ: 'Uzbekistan', VU: 'Vanuatu', VE: 'Venezuela', VN: 'Vietnam', VG: 'Virgin Islands (British)', VI: 'Virgin Islands (U.S.)', WF: 'Wallis and Futuna', EH: 'Western Sahara', YE: 'Yemen', ZM: 'Zambia', ZW: 'Zimbabwe'
};

const TRENDING_URL = 'https://raw.githubusercontent.com/BlackHatDevX/trending-music-os/refs/heads/main/trending.json';
const TRENDING_TRACKS_CACHE_KEY = 'TRENDING_TRACKS_CACHE_V1';

type TrendingDataType = Record<string, string[]>;

export default function HomeScreen() {
  const [currentView, setCurrentView] = React.useState<'home' | 'search'>('home');
  const searchState = useSearch();
  const { query, clearResults } = searchState;
  const { handleTrackSelect, isPlaying, currentTrack } = useContext(MusicPlayerContext);
  const [trendingTracks, setTrendingTracks] = useState<Track[]>([]);
  const { getLikedSongsAsTrack } = useLikedSongs();
  const likedTracks = getLikedSongsAsTrack();
  const [country, setCountry] = useState('your country');
  const [countryLoading, setCountryLoading] = useState(true);
  const [trendingData, setTrendingData] = useState<TrendingDataType | null>(null);
  const [trendingDataLoading, setTrendingDataLoading] = useState(true);
  const [trendingCache, setTrendingCache] = useState<Record<string, Track>>({});

  
  useEffect(() => {
    (async () => {
      try {
        const cacheStr = await AsyncStorage.getItem(TRENDING_TRACKS_CACHE_KEY);
        if (cacheStr) {
          setTrendingCache(JSON.parse(cacheStr));
        }
      } catch (e) {
        console.error('Failed to load trending tracks cache:', e);
      }
    })();
  }, []);

  useEffect(() => {
    (async () => {
      try {
        setTrendingDataLoading(true);
        const res = await fetch(TRENDING_URL);
        const data = await res.json();
        setTrendingData(data);
      } catch (e) {
        console.error('Trending data fetch error:', e);
        setTrendingData(null);
      } finally {
        setTrendingDataLoading(false);
      }
    })();
  }, []);

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch('https://ipinfo.io/json');
        const data = await res.json();
        if (data && data.country && COUNTRY_NAMES[data.country]) {
          setCountry(COUNTRY_NAMES[data.country]);
        } else {
          setCountry('your country');
        }
      } catch (e) {
        console.error('Country fetch error:', e);
        setCountry('your country');
      } finally {
        setCountryLoading(false);
      }
    })();
  }, []);

  useEffect(() => {
    let isMounted = true;
    const fetchTrendingTracks = async (list: string[]) => {
      
      let cache = { ...trendingCache };
      const tracks: Track[] = [];
      let cacheChanged = false;
      
      
      for (const entry of list) {
        if (cache[entry]) {
          tracks.push(cache[entry]);
        }
      }
      
      
      if (isMounted) {
        setTrendingTracks([...tracks]);
      }
      
      
      for (const entry of list) {
        if (!cache[entry]) {
          try {
            const res = await MusicAPI.searchTracks(entry);
            if (res.tracks && res.tracks.length > 0) {
              cache[entry] = res.tracks[0];
              tracks.push(res.tracks[0]);
              cacheChanged = true;
              
              
              if (isMounted) {
                setTrendingTracks([...tracks]);
              }
            } else {
              console.warn(`[Trending] No results for: ${entry}`);
            }
          } catch (e) {
            console.error(`[Trending] Error fetching "${entry}":`, e);
          }
        }
      }
      
      if (cacheChanged) {
        setTrendingCache(cache);
        try {
          await AsyncStorage.setItem(TRENDING_TRACKS_CACHE_KEY, JSON.stringify(cache));
        } catch (e) {
          console.error('Failed to save trending tracks cache:', e);
        }
      }
    };
    if (!countryLoading && !trendingDataLoading && trendingData && country && country !== 'your country') {
      
      const countryKey = country.toLowerCase();
      const trendingKey = Object.keys(trendingData).find(
        k => k.toLowerCase() === countryKey
      );
      if (trendingKey && trendingData[trendingKey]) {
        fetchTrendingTracks(trendingData[trendingKey]);
      } else if (trendingData.global) {
        fetchTrendingTracks(trendingData.global);
      } else {
        setTrendingTracks([]);
      }
    } else {
      setTrendingTracks([]);
    }
    return () => { isMounted = false; };
  }, [country, countryLoading, trendingData, trendingDataLoading, trendingCache]);

  const handleViewChange = (view: 'home' | 'search') => {
    setCurrentView(view);
    if (view === 'home') {
      clearResults();
    }
  };

  const handleSearchClick = () => {
    
    const router = useRouter();
    router.push('/search');
  };

  const handleSearchStart = () => {
    setCurrentView('search');
  };

  const renderTrackItem = (tracks: Track[]) => ({ item, index }: { item: Track; index: number }) => {
    const isCurrentTrack = currentTrack?.id === item.id;
    return (
      <TouchableOpacity
        style={[styles.trackItem, isCurrentTrack && styles.currentTrackItem]}
        onPress={() => handleTrackSelect(item, tracks, index)}
      >
        <Image
          source={{ uri: MusicAPI.getOptimalImage(item.images) }}
          style={styles.albumCover}
          contentFit="cover"
        />
        <View style={styles.trackInfo}>
          <Text style={[styles.trackTitle, isCurrentTrack && styles.currentTrackText]} numberOfLines={1}>{item.title}</Text>
          <Text style={[styles.trackArtist, isCurrentTrack && styles.currentTrackText]} numberOfLines={1}>{item.artist}</Text>
        </View>
        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => handleTrackSelect(item, tracks, index)}
        >
          <Ionicons
            name={isCurrentTrack && isPlaying ? 'pause' : 'play'}
            size={20}
            color={isCurrentTrack ? '#1DB954' : '#888'}
          />
        </TouchableOpacity>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#000" translucent={false} />
      <TopBar
        currentView={currentView}
        onViewChange={handleViewChange}
        onSearchClick={handleSearchClick}
        onSearchStart={handleSearchStart}
        searchState={searchState}
      />
      <View style={styles.mainContent}>
        {currentView === 'home' ? (
          <ScrollView>
            <HorizontalTrackList
              title={`Trending in ${countryLoading ? '...' : (country || 'your country')}`}
              tracks={trendingTracks}
              onTrackSelect={handleTrackSelect}
              isPlaying={isPlaying}
              currentTrack={currentTrack}
            />
            {trendingTracks.length === 0 && !trendingDataLoading && (
              <Text style={{ color: '#888', textAlign: 'center', marginTop: 24 }}>
                Spinning up your hometown hits... 
              </Text>
            )}
            <HorizontalTrackList
              title="Liked Songs"
              tracks={likedTracks}
              onTrackSelect={handleTrackSelect}
              isPlaying={isPlaying}
              currentTrack={currentTrack}
            />
            <View style={{ height: 170 * 2 + 24 }} />
          </ScrollView>
        ) : (
          <></>
        )}
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
  sectionTitle: {
    color: '#fff',
    fontSize: 20,
    fontWeight: 'bold',
    marginLeft: 16,
    marginTop: 16,
    marginBottom: 8,
  },
  horizontalList: {
    paddingLeft: 8,
    paddingBottom: 8,
  },
  trackItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#181818',
    borderRadius: 8,
    marginRight: 12,
    padding: 8,
    width: SCREEN_WIDTH * 0.7,
    maxWidth: 320,
  },
  currentTrackItem: {
    backgroundColor: '#1a1a1a',
  },
  albumCover: {
    width: 50,
    height: 50,
    borderRadius: 4,
    marginRight: 12,
  },
  trackInfo: {
    flex: 1,
    justifyContent: 'center',
  },
  trackTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
    marginBottom: 2,
  },
  trackArtist: {
    fontSize: 14,
    color: '#888',
    marginBottom: 2,
  },
  actionButton: {
    padding: 8,
    marginLeft: 4,
  },
  currentTrackText: {
    color: '#1DB954',
  },
});
