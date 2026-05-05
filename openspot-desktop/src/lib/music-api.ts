import axios, { AxiosResponse } from 'axios';

export interface Track {
  id: string;
  title: string;
  artist: string;
  album: string;
  duration: number;
  coverUrl: string;
  audioUrl: string;
  liked: boolean; // Make this required instead of optional
  // Add any other fields as needed
}

// API response types that match the actual search API
export interface APITrack {
  id: number;
  title: string;
  artist: string;
  artistId: number;
  albumTitle: string;
  albumCover: string;
  albumId: string;
  releaseDate: string;
  genre: string;
  duration: number;
  audioQuality: {
    maximumBitDepth: number;
    maximumSamplingRate: number;
    isHiRes: boolean;
  };
  version: string | null;
  label: string;
  labelId: number;
  upc: string;
  mediaCount: number;
  parental_warning: boolean;
  streamable: boolean;
  purchasable: boolean;
  previewable: boolean;
  genreId: number;
  genreSlug: string;
  genreColor: string;
  releaseDateStream: string;
  releaseDateDownload: string;
  maximumChannelCount: number;
  images: {
    small: string;
    thumbnail: string;
    large: string;
    back: string | null;
  };
  isrc: string;
}

export interface SearchResponse {
  tracks: APITrack[];
  total: number;
}

const API_BASE_URL = process.env.ELECTRON_APP_API_BASE_URL;

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
    'Connection': 'close', // Force connection close after each request
  },
});

// Add aggressive connection cleanup interceptors
apiClient.interceptors.request.use(
  config => {
    // Force new connection for each request
    if (config.headers) {
      config.headers['Cache-Control'] = 'no-cache, no-store, must-revalidate';
      config.headers['Pragma'] = 'no-cache';
      config.headers['Expires'] = '0';
      config.headers['Connection'] = 'close';
    }
    return config;
  },
  error => Promise.reject(error)
);

apiClient.interceptors.response.use(
  response => {
    // Force connection cleanup after response
    return response;
  },
  error => {
    // Force connection cleanup on error
    return Promise.reject(error);
  }
);

export async function searchTracks(query: string, offset = 0, limit = 20): Promise<SearchResponse> {
  const params = new URLSearchParams({
    q: query,
    offset: offset.toString(),
    type: 'track',
  });
  const response: AxiosResponse<SearchResponse> = await apiClient.get(`/search?${params}`);
  return response.data;
}

export async function getStreamUrl(trackId: string): Promise<string> {
  const response: AxiosResponse<{ url: string }> = await apiClient.get(`/stream?trackId=${trackId}`);
  if (!response.data.url) throw new Error('No stream URL received');
  return response.data.url;
}

// Helper function to convert API track to context Track
export function convertAPITrackToTrack(apiTrack: APITrack): Track {
  // Extract image URL from the images object
  let coverUrl = '';
  if (apiTrack.images) {
    // Use large image if available, fallback to small, then thumbnail
    coverUrl = apiTrack.images.large || apiTrack.images.small || apiTrack.images.thumbnail || '';
  } else if (apiTrack.albumCover) {
    // Fallback to albumCover if images object is not available
    coverUrl = apiTrack.albumCover;
  }
  
  return {
    id: apiTrack.id.toString(), // Convert number to string
    title: apiTrack.title,
    artist: apiTrack.artist,
    album: apiTrack.albumTitle || 'Unknown Album',
    duration: apiTrack.duration,
    coverUrl: coverUrl,
    audioUrl: '', // We'll get this from getStreamUrl when needed
    liked: false // Default to false, will be updated by context
  };
} 