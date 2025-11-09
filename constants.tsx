import { Song, SoundEffect, SpotifyPlaylist } from './types.ts';

// Royalty-free music from Pixabay
export const ROYALTY_FREE_AUDIO_URLS = [
    'https://cdn.pixabay.com/download/audio/2023/05/18/audio_b88b773643.mp3', // Electronic
    'https://cdn.pixabay.com/download/audio/2024/02/09/audio_3d195226c2.mp3', // Upbeat Pop
    'https://cdn.pixabay.com/download/audio/2023/04/18/audio_73b9e3a09c.mp3', // Chill Lofi
    'https://cdn.pixabay.com/download/audio/2023/03/23/audio_092925b6a7.mp3', // Ambient
    'https://cdn.pixabay.com/download/audio/2023/03/01/audio_1385459343.mp3',// Funk Groove
    'https://cdn.pixabay.com/download/audio/2022/10/19/audio_7273c52e93.mp3', // Disco
    'https://cdn.pixabay.com/download/audio/2022/05/16/audio_a08b3c829e.mp3', // Rock
    'https://cdn.pixabay.com/download/audio/2022/11/21/audio_a12a524279.mp3', // Funky
];

const MOCK_SONGS_A: Song[] = [
  { id: 'spotify:1', title: 'Blinding Lights', artist: 'The Weeknd', albumArt: 'https://source.unsplash.com/300x300/?blinding,lights', duration: 200, audioUrl: ROYALTY_FREE_AUDIO_URLS[0], spotifyUrl: 'https://open.spotify.com/search/Blinding%20Lights%20The%20Weeknd' },
  { id: 'spotify:2', title: 'Levitating', artist: 'Dua Lipa', albumArt: 'https://source.unsplash.com/300x300/?levitating,space', duration: 210, audioUrl: ROYALTY_FREE_AUDIO_URLS[1], spotifyUrl: 'https://open.spotify.com/search/Levitating%20Dua%20Lipa' },
  { id: 'spotify:3', title: 'As It Was', artist: 'Harry Styles', albumArt: 'https://source.unsplash.com/300x300/?as,it,was', duration: 167, audioUrl: ROYALTY_FREE_AUDIO_URLS[2], spotifyUrl: 'https://open.spotify.com/search/As%20It%20Was%20Harry%20Styles' },
  { id: 'spotify:4', title: 'Good 4 U', artist: 'Olivia Rodrigo', albumArt: 'https://source.unsplash.com/300x300/?good,4,u', duration: 178, audioUrl: ROYALTY_FREE_AUDIO_URLS[3], spotifyUrl: 'https://open.spotify.com/search/Good%204%20U%20Olivia%20Rodrigo' },
  { id: 'spotify:5', title: 'Uptown Funk', artist: 'Mark Ronson ft. Bruno Mars', albumArt: 'https://source.unsplash.com/300x300/?uptown,funk', duration: 270, audioUrl: ROYALTY_FREE_AUDIO_URLS[4], spotifyUrl: 'https://open.spotify.com/search/Uptown%20Funk%20Mark%20Ronson' },
];

const MOCK_SONGS_B: Song[] = [
    { id: 'spotify:6', title: "Don't Start Now", artist: 'Dua Lipa', albumArt: 'https://source.unsplash.com/300x300/?dont,start,now', duration: 183, audioUrl: ROYALTY_FREE_AUDIO_URLS[5], spotifyUrl: 'https://open.spotify.com/search/Don\'t%20Start%20Now%20Dua%20Lipa' },
    { id: 'spotify:7', title: 'Crazy Little Thing Called Love', artist: 'Queen', albumArt: 'https://source.unsplash.com/300x300/?crazy,love', duration: 174, audioUrl: ROYALTY_FREE_AUDIO_URLS[6], spotifyUrl: 'https://open.spotify.com/search/Crazy%20Little%20Thing%20Called%20Love%20Queen' },
    { id: 'spotify:8', title: 'Juice', artist: 'Lizzo', albumArt: 'https://source.unsplash.com/300x300/?juice', duration: 195, audioUrl: ROYALTY_FREE_AUDIO_URLS[7], spotifyUrl: 'https://open.spotify.com/search/Juice%20Lizzo' },
    { id: 'spotify:9', title: 'Bad Guy', artist: 'Billie Eilish', albumArt: 'https://source.unsplash.com/300x300/?bad,guy', duration: 194, audioUrl: ROYALTY_FREE_AUDIO_URLS[0], spotifyUrl: 'https://open.spotify.com/search/Bad%20Guy%20Billie%20Eilish' },
    { id: 'spotify:10', title: 'Get Lucky', artist: 'Daft Punk ft. Pharrell Williams', albumArt: 'https://source.unsplash.com/300x300/?get,lucky', duration: 248, audioUrl: ROYALTY_FREE_AUDIO_URLS[1], spotifyUrl: 'https://open.spotify.com/search/Get%20Lucky%20Daft%20Punk' },
];

const MOCK_SONGS_C: Song[] = [
    { id: 'spotify:11', title: 'Shape of You', artist: 'Ed Sheeran', albumArt: 'https://source.unsplash.com/300x300/?shape,of,you', duration: 233, audioUrl: ROYALTY_FREE_AUDIO_URLS[2], spotifyUrl: 'https://open.spotify.com/search/Shape%20of%20You%20Ed%20Sheeran' },
    { id: 'spotify:12', title: 'Watermelon Sugar', artist: 'Harry Styles', albumArt: 'https://source.unsplash.com/300x300/?watermelon,sugar', duration: 174, audioUrl: ROYALTY_FREE_AUDIO_URLS[3], spotifyUrl: 'https://open.spotify.com/search/Watermelon%20Sugar%20Harry%20Styles' },
    { id: 'spotify:13', title: 'Havana', artist: 'Camila Cabello ft. Young Thug', albumArt: 'https://source.unsplash.com/300x300/?havana', duration: 217, audioUrl: ROYALTY_FREE_AUDIO_URLS[4], spotifyUrl: 'https://open.spotify.com/search/Havana%20Camila%20Cabello' },
];

export const MOCK_SPOTIFY_PLAYLISTS: SpotifyPlaylist[] = [
    { id: 'pl1', name: 'Weekend Party Starters', songs: MOCK_SONGS_A },
    { id: 'pl2', name: 'Funky Grooves', songs: MOCK_SONGS_B },
    { id: 'pl3', name: 'Summer Vibes', songs: MOCK_SONGS_C },
];

export const SOUND_EFFECTS: SoundEffect[] = [
  { id: 'se1', name: 'Air Horn', emoji: '📢' },
  { id: 'se2', name: 'Record Scratch', emoji: '⏪' },
  { id: 'se3', name: 'Crowd Cheer', emoji: '🎉' },
  { id: 'se4', name: 'Laser', emoji: '⚡' },
  { id: 'se5', name: 'Drop', emoji: '🔥' },
  { id: 'se6', name: 'Hand Clap', emoji: '👏' },
  { id: 'se7', name: 'Siren', emoji: '🚨' },
  { id: 'se8', name: 'Record Rewind', emoji: '🔄' },
  { id: 'se9', name: 'Bell', emoji: '🔔' },
];

export const LoadingIcon = () => (
    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
    </svg>
);