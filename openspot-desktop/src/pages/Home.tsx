import React, { useRef, useMemo, useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  CardMedia,
  IconButton,
  Button,
} from '@mui/material';
import { PlayArrow, Favorite, MoreVert, QueueMusic, Pause, FavoriteBorder, Search } from '@mui/icons-material';
import { useMusic, Track } from '../contexts/MusicContext';
import { convertAPITrackToTrack, APITrack } from '../lib/music-api';

// Constants for trending
const TRENDING_URL = 'https://raw.githubusercontent.com/BlackHatDevX/trending-music-os/refs/heads/main/trending.json';
const TRENDING_TRACKS_CACHE_KEY = 'TRENDING_TRACKS_CACHE_V1';

const COUNTRY_NAMES: Record<string, string> = {
  AF: 'Afghanistan', AL: 'Albania', DZ: 'Algeria', AS: 'American Samoa', AD: 'Andorra', AO: 'Angola', AI: 'Anguilla', AQ: 'Antarctica', AG: 'Antigua and Barbuda', AR: 'Argentina', AM: 'Armenia', AW: 'Aruba', AU: 'Australia', AT: 'Austria', AZ: 'Azerbaijan', BS: 'Bahamas', BH: 'Bahrain', BD: 'Bangladesh', BB: 'Barbados', BY: 'Belarus', BE: 'Belgium', BZ: 'Belize', BJ: 'Benin', BM: 'Bermuda', BT: 'Bhutan', BO: 'Bolivia', BQ: 'Bonaire, Sint Eustatius and Saba', BA: 'Bosnia and Herzegovina', BW: 'Botswana', BV: 'Bouvet Island', BR: 'Brazil', IO: 'British Indian Ocean Territory', BN: 'Brunei Darussalam', BG: 'Bulgaria', BF: 'Burkina Faso', BI: 'Burundi', KH: 'Cambodia', CM: 'Cameroon', CA: 'Canada', CV: 'Cape Verde', KY: 'Cayman Islands', CF: 'Central African Republic', TD: 'Chad', CL: 'Chile', CN: 'China', CX: 'Christmas Island', CC: 'Cocos (Keeling) Islands', CO: 'Colombia', KM: 'Comoros', CG: 'Congo', CD: 'Congo, Democratic Republic of the', CK: 'Cook Islands', CR: 'Costa Rica', CI: 'Côte d\'Ivoire', HR: 'Croatia', CU: 'Cuba', CW: 'Curaçao', CY: 'Cyprus', CZ: 'Czechia', DK: 'Denmark', DJ: 'Djibouti', DM: 'Dominica', DO: 'Dominican Republic', EC: 'Ecuador', EG: 'Egypt', SV: 'El Salvador', GQ: 'Equatorial Guinea', ER: 'Eritrea', EE: 'Estonia', SZ: 'Eswatini', ET: 'Ethiopia', FK: 'Falkland Islands (Malvinas)', FO: 'Faroe Islands', FJ: 'Fiji', FI: 'Finland', FR: 'France', GF: 'French Guiana', PF: 'French Polynesia', TF: 'French Southern Territories', GA: 'Gabon', GM: 'Gambia', GE: 'Georgia', DE: 'Germany', GH: 'Ghana', GI: 'Gibraltar', GR: 'Greece', GL: 'Greenland', GD: 'Grenada', GP: 'Guadeloupe', GU: 'Guam', GT: 'Guatemala', GG: 'Guernsey', GN: 'Guinea', GW: 'Guinea-Bissau', GY: 'Guyana', HT: 'Haiti', HM: 'Heard Island and McDonald Islands', VA: 'Holy See', HN: 'Honduras', HK: 'Hong Kong', HU: 'Hungary', IS: 'Iceland', IN: 'India', ID: 'Indonesia', IR: 'Iran', IQ: 'Iraq', IE: 'Ireland', IM: 'Isle of Man', IL: 'Israel', IT: 'Italy', JM: 'Jamaica', JP: 'Japan', JE: 'Jersey', JO: 'Jordan', KZ: 'Kazakhstan', KE: 'Kenya', KI: 'Kiribati', KP: 'Korea (Democratic People\'s Republic of)', KR: 'Korea (Republic of)', KW: 'Kuwait', KG: 'Kyrgyzstan', LA: 'Lao People\'s Democratic Republic', LV: 'Latvia', LB: 'Lebanon', LS: 'Lesotho', LR: 'Liberia', LY: 'Libya', LI: 'Liechtenstein', LT: 'Lithuania', LU: 'Luxembourg', MO: 'Macao', MG: 'Madagascar', MW: 'Malawi', MY: 'Malaysia', MV: 'Maldives', ML: 'Mali', MT: 'Malta', MH: 'Marshall Islands', MQ: 'Martinique', MR: 'Mauritania', MU: 'Mauritius', YT: 'Mayotte', MX: 'Mexico', FM: 'Micronesia', MD: 'Moldova', MC: 'Monaco', MN: 'Mongolia', ME: 'Montenegro', MS: 'Montserrat', MA: 'Morocco', MZ: 'Mozambique', MM: 'Myanmar', NA: 'Namibia', NR: 'Nauru', NP: 'Nepal', NL: 'Netherlands', NC: 'New Caledonia', NZ: 'New Zealand', NI: 'Nicaragua', NE: 'Niger', NG: 'Nigeria', NU: 'Niue', NF: 'Norfolk Island', MK: 'North Macedonia', MP: 'Northern Mariana Islands', NO: 'Norway', OM: 'Oman', PK: 'Pakistan', PW: 'Palau', PS: 'Palestine', PA: 'Panama', PG: 'Papua New Guinea', PY: 'Paraguay', PE: 'Peru', PH: 'Philippines', PN: 'Pitcairn', PL: 'Poland', PT: 'Portugal', PR: 'Puerto Rico', QA: 'Qatar', RE: 'Réunion', RO: 'Romania', RU: 'Russia', RW: 'Rwanda', BL: 'Saint Barthélemy', SH: 'Saint Helena, Ascension and Tristan da Cunha', KN: 'Saint Kitts and Nevis', LC: 'Saint Lucia', MF: 'Saint Martin (French part)', PM: 'Saint Pierre and Miquelon', VC: 'Saint Vincent and the Grenadines', WS: 'Samoa', SM: 'San Marino', ST: 'Sao Tome and Principe', SA: 'Saudi Arabia', SN: 'Senegal', RS: 'Serbia', SC: 'Seychelles', SL: 'Sierra Leone', SG: 'Singapore', SX: 'Sint Maarten (Dutch part)', SK: 'Slovakia', SI: 'Slovenia', SB: 'Solomon Islands', SO: 'Somalia', ZA: 'South Africa', GS: 'South Georgia and the South Sandwich Islands', SS: 'South Sudan', ES: 'Spain', LK: 'Sri Lanka', SD: 'Sudan', SR: 'Suriname', SJ: 'Svalbard and Jan Mayen', SE: 'Sweden', CH: 'Switzerland', SY: 'Syrian Arab Republic', TW: 'Taiwan', TJ: 'Tajikistan', TZ: 'Tanzania', TH: 'Thailand', TL: 'Timor-Leste', TG: 'Togo', TK: 'Tokelau', TO: 'Tonga', TT: 'Trinidad and Tobago', TN: 'Tunisia', TR: 'Turkey', TM: 'Turkmenistan', TC: 'Turks and Caicos Islands', TV: 'Tuvalu', UG: 'Uganda', UA: 'Ukraine', AE: 'United Arab Emirates', GB: 'United Kingdom', US: 'United States', UM: 'United States Minor Outlying Islands', UY: 'Uruguay', UZ: 'Uzbekistan', VU: 'Vanuatu', VE: 'Venezuela', VN: 'Vietnam', VG: 'Virgin Islands (British)', VI: 'Virgin Islands (U.S.)', WF: 'Wallis and Futuna', EH: 'Western Sahara', YE: 'Yemen', ZM: 'Zambia', ZW: 'Zimbabwe'
};

type TrendingDataType = Record<string, string[]>;

const Home: React.FC = () => {
  const { state, dispatch } = useMusic();
  const likedRef = useRef<HTMLDivElement>(null);
  const recentRef = useRef<HTMLDivElement>(null);
  const [isInitialized, setIsInitialized] = useState(false);
  const [loadingTrackId, setLoadingTrackId] = useState<string | null>(null);
  
  // Debug logging
  console.log('Home component rendered at:', new Date().toISOString());
  console.log('Home component pathname:', window.location.pathname);
  
  // Trending songs state
  const [trendingTracks, setTrendingTracks] = useState<Track[]>([]);
  const [country, setCountry] = useState('your country');
  const [countryLoading, setCountryLoading] = useState(true);
  const [trendingData, setTrendingData] = useState<TrendingDataType | null>(null);
  const [trendingDataLoading, setTrendingDataLoading] = useState(true);
  const [trendingCache, setTrendingCache] = useState<Record<string, Omit<Track, 'liked'>>>({});
  const [trendingError, setTrendingError] = useState<string | null>(null);
  const [countryError, setCountryError] = useState<string | null>(null);
  const [generalError, setGeneralError] = useState<string | null>(null);

  // Add CSS animation for loading spinner
  useEffect(() => {
    const style = document.createElement('style');
    style.textContent = `
      @keyframes spin {
        0% { transform: rotate(0deg); }
        100% { transform: rotate(360deg); }
      }
    `;
    document.head.appendChild(style);
    
    return () => {
      document.head.removeChild(style);
    };
  }, []);
  
  // Dynamic greeting based on time
const getGreeting = () => {
  const hour = new Date().getHours();
  if (hour >= 5 && hour < 12) return 'Good morning';
  if (hour >= 12 && hour < 18) return 'Good afternoon';
  if (hour >= 18 && hour < 22) return 'Good evening';
  return 'Good night';
};
var greeting = getGreeting();

  // Initialize tracks when component mounts
  useEffect(() => {
    console.log('Home component mounted');
    // Set initialized to true after component mounts
    setIsInitialized(true);
  }, []); // Empty dependency array - only run once on mount

  // Load trending track cache from localStorage on mount
  useEffect(() => {
    try {
      const cacheStr = localStorage.getItem(TRENDING_TRACKS_CACHE_KEY);
      if (cacheStr) {
        setTrendingCache(JSON.parse(cacheStr));
      }
    } catch (e) {
      console.error('Failed to load trending tracks cache:', e);
    }
  }, []);

  // Fetch trending data
  useEffect(() => {
    const fetchTrendingData = async () => {
      try {
        setTrendingDataLoading(true);
        setTrendingError(null); // Clear previous errors
        const res = await fetch(TRENDING_URL);
        if (!res.ok) {
          throw new Error(`HTTP ${res.status}: ${res.statusText}`);
        }
        const data = await res.json();
        setTrendingData(data);
      } catch (e) {
        console.error('Trending data fetch error:', e);
        setTrendingData(null);
        setTrendingError(`Failed to load trending data: ${e instanceof Error ? e.message : 'Network error'}`);
      } finally {
        setTrendingDataLoading(false);
      }
    };
    fetchTrendingData();
  }, []);

  // Fetch country information
  useEffect(() => {
    const getCountryFromSystem = () => {
      try {
        // Try multiple sources for locale information
        let countryCode = 'US'; // Default fallback
        
        // Method 1: Try to infer from timezone (most reliable for location)
        try {
          const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
          console.log('System timezone:', timezone);
          
          // Map common timezones to countries
          const timezoneToCountry: Record<string, string> = {
            'America/New_York': 'US',
            'America/Chicago': 'US',
            'America/Denver': 'US',
            'America/Los_Angeles': 'US',
            'America/Anchorage': 'US',
            'Pacific/Honolulu': 'US',
            'Europe/London': 'GB',
            'Europe/Paris': 'FR',
            'Europe/Berlin': 'DE',
            'Europe/Rome': 'IT',
            'Europe/Madrid': 'ES',
            'Europe/Amsterdam': 'NL',
            'Europe/Brussels': 'BE',
            'Europe/Vienna': 'AT',
            'Europe/Zurich': 'CH',
            'Europe/Stockholm': 'SE',
            'Europe/Oslo': 'NO',
            'Europe/Copenhagen': 'DK',
            'Europe/Helsinki': 'FI',
            'Europe/Warsaw': 'PL',
            'Europe/Prague': 'CZ',
            'Europe/Budapest': 'HU',
            'Europe/Bucharest': 'RO',
            'Europe/Sofia': 'BG',
            'Europe/Athens': 'GR',
            'Europe/Istanbul': 'TR',
            'Europe/Moscow': 'RU',
            'Asia/Tokyo': 'JP',
            'Asia/Seoul': 'KR',
            'Asia/Shanghai': 'CN',
            'Asia/Hong_Kong': 'HK',
            'Asia/Singapore': 'SG',
            'Asia/Bangkok': 'TH',
            'Asia/Jakarta': 'ID',
            'Asia/Manila': 'PH',
            'Asia/Calcutta': 'IN',
            'Asia/Dubai': 'AE',
            'Asia/Tel_Aviv': 'IL',
            'Asia/Riyadh': 'SA',
            'Asia/Qatar': 'QA',
            'Asia/Kuwait': 'KW',
            'Asia/Bahrain': 'BH',
            'Asia/Oman': 'OM',
            'Australia/Sydney': 'AU',
            'Australia/Melbourne': 'AU',
            'Australia/Perth': 'AU',
            'Australia/Adelaide': 'AU',
            'Australia/Brisbane': 'AU',
            'Pacific/Auckland': 'NZ',
            'America/Toronto': 'CA',
            'America/Vancouver': 'CA',
            'America/Montreal': 'CA',
            'America/Edmonton': 'CA',
            'America/Winnipeg': 'CA',
            'America/Halifax': 'CA',
            'America/St_Johns': 'CA',
            'America/Sao_Paulo': 'BR',
            'America/Argentina/Buenos_Aires': 'AR',
            'America/Santiago': 'CL',
            'America/Lima': 'PE',
            'America/Bogota': 'CO',
            'America/Caracas': 'VE',
            'America/Mexico_City': 'MX',
            'America/Guatemala': 'GT',
            'America/El_Salvador': 'SV',
            'America/Managua': 'NI',
            'America/Costa_Rica': 'CR',
            'America/Panama': 'PA',
            'America/Havana': 'CU',
            'America/Jamaica': 'JM',
            'America/Port-au-Prince': 'HT',
            'America/Santo_Domingo': 'DO',
            'America/Puerto_Rico': 'PR',
            'Africa/Cairo': 'EG',
            'Africa/Johannesburg': 'ZA',
            'Africa/Lagos': 'NG',
            'Africa/Nairobi': 'KE',
            'Africa/Casablanca': 'MA',
            'Africa/Algiers': 'DZ',
            'Africa/Tunis': 'TN',
            'Africa/Tripoli': 'LY',
            'Africa/Khartoum': 'SD',
            'Africa/Addis_Ababa': 'ET',
            'Africa/Dar_es_Salaam': 'TZ',
            'Africa/Kampala': 'UG',
            'Africa/Luanda': 'AO',
            'Africa/Kinshasa': 'CD',
            'Africa/Brazzaville': 'CG',
            'Africa/Libreville': 'GA',
            'Africa/Douala': 'CM',
            'Africa/Yaounde': 'CM',
            'Africa/Bangui': 'CF',
            'Africa/Ndjamena': 'TD',
            'Africa/Niamey': 'NE',
            'Africa/Ouagadougou': 'BF',
            'Africa/Bamako': 'ML',
            'Africa/Conakry': 'GN',
            'Africa/Freetown': 'SL',
            'Africa/Monrovia': 'LR',
            'Africa/Abidjan': 'CI',
            'Africa/Accra': 'GH',
            'Africa/Lome': 'TG',
            'Africa/Cotonou': 'BJ',
            'Africa/Porto-Novo': 'BJ'
          };
          
          if (timezoneToCountry[timezone]) {
            countryCode = timezoneToCountry[timezone];
            console.log('Using timezone-based detection:', timezone, '->', countryCode);
          }
        } catch (e) {
          console.log('Timezone detection failed:', e);
        }
        
        // Method 2: Try to get from system date formatting
        if (countryCode === 'US') {
          try {
            const dateFormatter = new Intl.DateTimeFormat();
            const options = dateFormatter.resolvedOptions();
            
            // Check if we can infer country from date formatting preferences
            if (options.locale && options.locale.includes('-')) {
              const localeCountry = options.locale.split('-')[1];
              if (COUNTRY_NAMES[localeCountry]) {
                countryCode = localeCountry;
                console.log('Using date formatting locale:', options.locale, '->', localeCountry);
              }
            }
          } catch (e) {
            console.log('Date formatting detection failed:', e);
          }
        }
        
        // Method 3: Try to get from system number formatting
        if (countryCode === 'US') {
          try {
            const numberFormatter = new Intl.NumberFormat();
            const options = numberFormatter.resolvedOptions();
            
            // Check if we can infer country from number formatting preferences
            if (options.locale && options.locale.includes('-')) {
              const localeCountry = options.locale.split('-')[1];
              if (COUNTRY_NAMES[localeCountry]) {
                countryCode = localeCountry;
                console.log('Using number formatting locale:', options.locale, '->', localeCountry);
              }
            }
          } catch (e) {
            console.log('Number formatting detection failed:', e);
          }
        }
        
        // Method 4: Try to get from system currency formatting
        if (countryCode === 'US') {
          try {
            const currencyFormatter = new Intl.NumberFormat(undefined, { style: 'currency', currency: 'USD' });
            const options = currencyFormatter.resolvedOptions();
            
            // Check if we can infer country from currency formatting preferences
            if (options.locale && options.locale.includes('-')) {
              const localeCountry = options.locale.split('-')[1];
              if (COUNTRY_NAMES[localeCountry]) {
                countryCode = localeCountry;
                console.log('Using currency formatting locale:', options.locale, '->', localeCountry);
              }
            }
          } catch (e) {
            console.log('Currency formatting detection failed:', e);
          }
        }
        
        // Method 5: Try to get from system collation (sorting) preferences
        if (countryCode === 'US') {
          try {
            const collator = new Intl.Collator();
            const options = collator.resolvedOptions();
            
            // Check if we can infer country from collation preferences
            if (options.locale && options.locale.includes('-')) {
              const localeCountry = options.locale.split('-')[1];
              if (COUNTRY_NAMES[localeCountry]) {
                countryCode = localeCountry;
                console.log('Using collation locale:', options.locale, '->', localeCountry);
              }
            }
          } catch (e) {
            console.log('Collation detection failed:', e);
          }
        }
        
        // Method 6: Primary language (fallback, less reliable for location)
        if (countryCode === 'US' && navigator.language) {
          const primaryLocale = navigator.language;
          const primaryCountry = primaryLocale.split('-')[1];
          if (primaryCountry && COUNTRY_NAMES[primaryCountry]) {
            countryCode = primaryCountry;
            console.log('Using primary locale (fallback):', primaryLocale, '->', primaryCountry);
          }
        }
        
        // Method 7: First available language from languages array (last resort)
        if (countryCode === 'US' && navigator.languages && navigator.languages.length > 0) {
          for (const lang of navigator.languages) {
            const langCountry = lang.split('-')[1];
            if (langCountry && COUNTRY_NAMES[langCountry]) {
              countryCode = langCountry;
              console.log('Using language from array (last resort):', lang, '->', langCountry);
              break;
            }
          }
        }
        
        // Method 8: Check if we're in Electron and try to get system locale
        if (countryCode === 'US') {
          // Simplified Electron detection - just log that we're in Electron
          try {
            if (typeof window !== 'undefined' && window.process) {
              console.log('Running in Electron environment');
            }
          } catch (e) {
            console.log('Not in Electron environment');
          }
        }
        
        console.log('Final country code:', countryCode);
        setCountry(COUNTRY_NAMES[countryCode] || 'United States');
        setCountryError(null);
      } catch (e) {
        console.error('Country detection error:', e);
        setCountry('United States');
        setCountryError(`Failed to detect location: ${e instanceof Error ? e.message : 'System error'}`);
      } finally {
        setCountryLoading(false);
      }
    };
    
    // Get country immediately without network request
    getCountryFromSystem();
  }, []);

  // Fetch trending tracks based on country
  useEffect(() => {
    let isMounted = true;
    const fetchTrendingTracks = async (list: string[]) => {
      // Load cache from state
      let cache = { ...trendingCache };
      const tracks: Track[] = [];
      let cacheChanged = false;
      
      // First, add all cached tracks immediately
      for (const entry of list) {
        if (cache[entry]) {
          const cachedTrack: Track = {
            ...cache[entry],
            liked: state.likedTracks.some(t => t.id === cache[entry].id)
          };
          tracks.push(cachedTrack);
        }
      }
      
      // Display cached tracks immediately
      if (isMounted) {
        setTrendingTracks([...tracks]);
      }
      
      // Then fetch missing tracks one by one and add them progressively
      for (const entry of list) {
        if (!cache[entry]) {
          try {
            console.log(`[Trending] Searching for: ${entry}`);
            // Import the search function dynamically to avoid circular dependencies
            const { searchTracks } = await import('../lib/music-api');
            const res = await searchTracks(entry);
            if (res.tracks && res.tracks.length > 0) {
              // Convert API track to context Track type using the helper function
              const apiTrack = res.tracks[0] as APITrack;
              const contextTrack = convertAPITrackToTrack(apiTrack);
              
              // Check if this track is already liked
              contextTrack.liked = state.likedTracks.some(t => t.id === contextTrack.id);
              
              // Create a cache version without the liked property (it's dynamic)
              const { liked, ...cacheTrack } = contextTrack;
              
              cache[entry] = cacheTrack;
              tracks.push(contextTrack);
              cacheChanged = true;
              
              // Update state immediately when a new track is found
              if (isMounted) {
                setTrendingTracks([...tracks]);
              }
            } else {
              console.warn(`[Trending] No results for: ${entry}`);
            }
          } catch (e) {
            console.error(`[Trending] Error fetching "${entry}":`, e);
            setTrendingError(`Failed to load trending tracks: ${e instanceof Error ? e.message : 'Network error'}`);
          }
        }
      }
      
      if (cacheChanged) {
        setTrendingCache(cache);
        try {
          localStorage.setItem(TRENDING_TRACKS_CACHE_KEY, JSON.stringify(cache));
        } catch (e) {
          console.error('Failed to save trending tracks cache:', e);
        }
      }
    };
    
    if (!countryLoading && !trendingDataLoading && trendingData && country && country !== 'your country') {
      // Use lowercased country key for lookup
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

  // Mix liked and recently played, remove duplicates, shuffle, pick 20
  const mixedTracks = useMemo(() => {
    const allTracks = [...state.likedTracks, ...state.recentlyPlayed];
    const uniqueTracksMap = new Map();
    allTracks.forEach(track => {
      if (!uniqueTracksMap.has(track.id)) {
        uniqueTracksMap.set(track.id, track);
      }
    });
    let mixed = Array.from(uniqueTracksMap.values());
    
    console.log('Mixed tracks calculation:', {
      totalTracks: allTracks.length,
      uniqueTracks: mixed.length,
      isInitialized,
      willShuffle: mixed.length > 0 && !isInitialized
    });
    
    // Always shuffle if we have tracks, regardless of initialization state
    if (mixed.length > 0) {
    for (let i = mixed.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [mixed[i], mixed[j]] = [mixed[j], mixed[i]];
    }
    }
    
    return mixed.slice(0, 20);
  }, [state.likedTracks.length, state.recentlyPlayed.length, isInitialized]);

  // Shuffle recently played and play
  const handlePlaySomething = async () => {
    if (mixedTracks.length > 0) {
      try {
        setGeneralError(null); // Clear previous errors
        // Set the queue first
      dispatch({ type: 'SET_QUEUE', payload: mixedTracks });
        
        // Set the first track as current
      dispatch({ type: 'SET_CURRENT_TRACK', payload: mixedTracks[0] });
        
        // Add to recently played
      dispatch({ type: 'ADD_TO_RECENTLY_PLAYED', payload: mixedTracks[0] });
        
        // Ensure playing state is set
        if (!state.isPlaying) {
          dispatch({ type: 'TOGGLE_PLAY_PAUSE' });
        }
      } catch (error) {
        console.error('Failed to start playback:', error);
        setGeneralError(`Failed to start playback: ${error instanceof Error ? error.message : 'Unknown error'}`);
      }
    }
  };

  const handlePlayPauseTrack = async (track: Track) => {
    try {
      setGeneralError(null); // Clear previous errors
      
    if (state.currentTrack?.id === track.id) {
        // Same track - just toggle play/pause
      dispatch({ type: 'TOGGLE_PLAY_PAUSE' });
    } else {
        // New track - set it as current and start playing immediately
        setLoadingTrackId(track.id);
        
        try {
          // Set the track first
      dispatch({ type: 'SET_CURRENT_TRACK', payload: track });
      dispatch({ type: 'SET_QUEUE', payload: mixedTracks });
      dispatch({ type: 'ADD_TO_RECENTLY_PLAYED', payload: track });
          
          // Ensure playing state is set to true for new tracks
          if (!state.isPlaying) {
            dispatch({ type: 'TOGGLE_PLAY_PAUSE' });
          }
        } finally {
          // Clear loading state after a short delay to allow for audio setup
          setTimeout(() => setLoadingTrackId(null), 1000);
        }
      }
    } catch (error) {
      console.error('Failed to handle track:', error);
      setGeneralError(`Failed to play track: ${error instanceof Error ? error.message : 'Unknown error'}`);
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
    <Box sx={{ padding: '24px', paddingBottom: '100px' }}>
      {/* Welcome Section */}
      <Box sx={{ marginBottom: '48px' }}>
        <Typography
          variant="h3"
          sx={{
            color: '#ffffff',
            fontWeight: 700,
            marginBottom: '16px',
            background: 'linear-gradient(135deg, #1db954 0%, #1ed760 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
          }}
        >
          {greeting}
        </Typography>
        <Typography
          variant="h6"
          sx={{
            color: '#b3b3b3',
            marginBottom: '32px',
          }}
        >
          Welcome back to OpenSpot Music
        </Typography>
        {/* Quick Actions */}
        <Box sx={{ display: 'flex', gap: '16px', marginBottom: '32px' }}>
          <Button
            variant="contained"
            startIcon={<PlayArrow />}
            disabled={mixedTracks.length === 0}
            sx={{
              backgroundColor: mixedTracks.length === 0 ? '#535353' : '#1db954',
              color: '#ffffff',
              '&:hover': { 
                backgroundColor: mixedTracks.length === 0 ? '#535353' : '#1ed760' 
              },
              '&:disabled': {
                backgroundColor: '#535353',
                color: '#b3b3b3',
                cursor: 'not-allowed'
              },
              borderRadius: '20px',
              textTransform: 'none',
              fontWeight: 500,
            }}
            onClick={handlePlaySomething}
          >
            Play Something
          </Button>
        </Box>
      </Box>
      
      {/* General Error Display */}
      {generalError && (
        <Box sx={{ marginBottom: '24px', padding: '16px', backgroundColor: 'rgba(255, 107, 107, 0.1)', borderRadius: '8px', border: '1px solid rgba(255, 107, 107, 0.3)' }}>
          <Typography variant="body1" sx={{ color: '#ff6b6b', display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
            <Box component="span" sx={{ fontSize: '18px' }}>🚨</Box>
            {generalError}
          </Typography>
          <Button
            variant="outlined"
            size="small"
            onClick={() => setGeneralError(null)}
            sx={{
              borderColor: '#ff6b6b',
              color: '#ff6b6b',
              '&:hover': { 
                borderColor: '#ff5252',
                backgroundColor: 'rgba(255, 107, 107, 0.08)'
              }
            }}
          >
            Dismiss
          </Button>
        </Box>
      )}
      
      {/* Trending Songs Section */}
      <Box sx={{ marginBottom: '48px' }}>
        <Typography
          variant="h5"
          sx={{
            color: '#ffffff',
            fontWeight: 600,
            marginBottom: '24px',
          }}
        >
          Trending in {countryLoading ? '...' : (country || 'your country')}
        </Typography>
    
        
        {countryError && (
          <Box sx={{ marginBottom: '16px', padding: '12px', backgroundColor: 'rgba(255, 107, 107, 0.1)', borderRadius: '8px', border: '1px solid rgba(255, 107, 107, 0.3)' }}>
            <Typography variant="body2" sx={{ color: '#ff6b6b', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Box component="span" sx={{ fontSize: '16px' }}>⚠️</Box>
              {countryError}
            </Typography>
          </Box>
        )}
        
        {trendingTracks.length === 0 && !trendingDataLoading && (
          <Box sx={{ textAlign: 'center', padding: '40px 20px' }}>
            {trendingError ? (
              <Box>
                <Typography variant="body1" sx={{ color: '#ff6b6b', marginBottom: '16px' }}>
                  {trendingError}
                </Typography>
                <Button
                  variant="outlined"
                  size="small"
                  onClick={() => window.location.reload()}
                  sx={{
                    borderColor: '#ff6b6b',
                    color: '#ff6b6b',
                    '&:hover': { 
                      borderColor: '#ff5252',
                      backgroundColor: 'rgba(255, 107, 107, 0.08)'
                    }
                  }}
                >
                  Try Again
                </Button>
              </Box>
            ) : (
              <Typography variant="body1" sx={{ color: '#666' }}>
                Spinning up your hometown hits...
              </Typography>
            )}
          </Box>
        )}
        
        {trendingTracks.length > 0 && (
          <Box sx={{ 
            display: 'flex', 
            overflowX: 'auto', 
            overflowY: 'hidden',
            gap: '16px', 
            paddingBottom: '16px', 
            '&::-webkit-scrollbar': { display: 'none' },
            height: 'fit-content'
          }}>
            {trendingTracks.map(track => (
              <Card
                key={track.id}
                sx={{
                  backgroundColor: '#1a1a1a',
                  display: 'flex',
                  flexDirection: 'column',
                  height: 280, // Fixed height for all cards
                  minHeight: 280, // Ensure minimum height
                  maxHeight: 280, // Ensure maximum height
                  width: 200, // Fixed width for all cards
                  flexShrink: 0, // Prevent shrinking
                  position: 'relative',
                  overflow: 'hidden' // Prevent any overflow from the card content
                }}
              >
                <Box sx={{ position: 'relative' }}>
                  <CardMedia
                    component="img"
                    sx={{ 
                      width: '100%', 
                      height: 200, 
                      objectFit: 'cover',
                      borderBottom: '1px solid rgba(255, 255, 255, 0.1)'
                    }}
                    image={track.coverUrl}
                    alt={track.title}
                  />
                  {/* Play Button Overlay */}
                  <IconButton
                    size="large"
                    onClick={() => handlePlayPauseTrack(track)}
                    disabled={loadingTrackId === track.id}
                    sx={{ 
                      position: 'absolute',
                      bottom: '12px',
                      right: '12px',
                      background: state.currentTrack?.id === track.id && state.isPlaying ? '#1db954' : 'rgba(29, 185, 84, 0.9)', 
                      color: '#fff',
                      width: 48,
                      height: 48,
                      boxShadow: '0 4px 12px rgba(0, 0, 0, 0.3)',
                      '&:hover': {
                        background: state.currentTrack?.id === track.id && state.isPlaying ? '#1ed760' : '#1db954',
                        transform: 'scale(1.05)',
                        transition: 'all 0.2s ease'
                      },
                      '&:disabled': {
                        opacity: 0.6,
                        cursor: 'not-allowed',
                        transform: 'none'
                      }
                    }}
                  >
                    {loadingTrackId === track.id ? (
                      <Box sx={{ 
                        width: 24, 
                        height: 24, 
                        border: '2px solid #fff', 
                        borderTop: '2px solid transparent', 
                        borderRadius: '50%', 
                        animation: 'spin 1s linear infinite' 
                      }} />
                    ) : state.currentTrack?.id === track.id && state.isPlaying ? (
                      <Pause sx={{ fontSize: 24 }} />
                    ) : (
                      <PlayArrow sx={{ fontSize: 24 }} />
                    )}
                  </IconButton>
                </Box>
                <CardContent sx={{ 
                  flexGrow: 1, 
                  p: 2, 
                  display: 'flex', 
                  flexDirection: 'column', 
                  justifyContent: 'space-between'
                }}>
                  <Box>
                    <Typography 
                      variant="h6" 
                      sx={{ 
                        color: '#fff', 
                        fontWeight: 500, 
                        marginBottom: '8px',
                        fontSize: '14px',
                        lineHeight: '1.2',
                        height: '34px', // Fixed height for title
                        overflow: 'hidden',
                        display: '-webkit-box',
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: 'vertical',
                        textOverflow: 'ellipsis'
                      }} 
                      noWrap
                    >
                      {track.title}
                    </Typography>
                    <Typography 
                      variant="body2" 
                      sx={{ 
                        color: '#b3b3b3', 
                        marginBottom: '16px',
                        fontSize: '12px',
                        lineHeight: '1.2',
                        height: '29px', // Fixed height for artist/album
                        overflow: 'hidden',
                        display: '-webkit-box',
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: 'vertical',
                        textOverflow: 'ellipsis'
                      }} 
                      noWrap
                    >
                      {track.artist} • {track.album}
                    </Typography>
                  </Box>
                </CardContent>
              </Card>
            ))}
          </Box>
        )}
      </Box>
      
      {/* Mixed Songs Grid */}
      <Box>
        <Grid container spacing={2}>
          {mixedTracks.length === 0 && (
            <Grid item xs={12}>
              <Box sx={{ textAlign: 'center', padding: '40px 20px' }}>
                <Typography variant="h6" sx={{ color: '#b3b3b3', marginBottom: '16px' }}>
                  Welcome to OpenSpot Music!
                </Typography>
                <Typography variant="body1" sx={{ color: '#666', marginBottom: '24px' }}>
                  Start by searching for your favorite songs to build your music library.
                </Typography>
                <Button
                  variant="outlined"
                  startIcon={<Search />}
                  onClick={() => window.location.href = '/search'}
                  sx={{
                    borderColor: '#1db954',
                    color: '#1db954',
                    '&:hover': { 
                      borderColor: '#1ed760',
                      backgroundColor: 'rgba(29, 185, 84, 0.08)'
                    },
                    borderRadius: '20px',
                    textTransform: 'none',
                    fontWeight: 500,
                  }}
                >
                  Search for Songs
                </Button>
              </Box>
            </Grid>
          )}
          {mixedTracks.map(track => (
            <Grid item xs={12} sm={6} md={6} lg={6} key={track.id}>
              <Card sx={{ backgroundColor: '#1a1a1a', display: 'flex', alignItems: 'center', p: 1, minHeight: 96, minWidth: 0, boxSizing: 'border-box' }}>
                <IconButton
                  size="small"
                  onClick={() => handleToggleLike(track)}
                  sx={{ color: state.likedTracks.some(t => t.id === track.id) ? '#1db954' : '#b3b3b3', mr: 1 }}
                >
                  {state.likedTracks.some(t => t.id === track.id) ? <Favorite /> : <FavoriteBorder />}
                </IconButton>
                <CardMedia
                  component="img"
                  sx={{ width: 64, height: 64, borderRadius: '4px', mr: 2, flexShrink: 0, objectFit: 'cover' }}
                  image={track.coverUrl}
                  alt={track.title}
                />
                <CardContent sx={{ flex: 1, p: 0 }}>
                  <Typography variant="body1" sx={{ color: '#fff', fontWeight: 500 }}>{track.title}</Typography>
                  <Typography variant="body2" sx={{ color: '#b3b3b3' }}>{track.artist} • {track.album}</Typography>
                  <Typography variant="caption" sx={{ color: '#666' }}>{formatTime(track.duration)}</Typography>
                </CardContent>
                <IconButton
                  size="medium"
                  onClick={() => handlePlayPauseTrack(track)}
                  disabled={loadingTrackId === track.id}
                  sx={{ 
                    background: state.currentTrack?.id === track.id && state.isPlaying ? '#1db954' : '#232323', 
                    color: '#fff', 
                    ml: 2,
                    '&:disabled': {
                      opacity: 0.6,
                      cursor: 'not-allowed'
                    }
                  }}
                >
                  {loadingTrackId === track.id ? (
                    <Box sx={{ 
                      width: 20, 
                      height: 20, 
                      border: '2px solid #fff', 
                      borderTop: '2px solid transparent', 
                      borderRadius: '50%', 
                      animation: 'spin 1s linear infinite' 
                    }} />
                  ) : state.currentTrack?.id === track.id && state.isPlaying ? (
                    <Pause />
                  ) : (
                    <PlayArrow />
                  )}
                </IconButton>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Box>
    </Box>
  );
};

export default Home; 