import { Song, SoundEffect, SpotifyPlaylist } from './types.ts';

// Royalty-free music from Pixabay
const MOCK_SONGS_A: Song[] = [
  { id: 'spotify:1', title: 'Blinding Lights', artist: 'The Weeknd', albumArt: 'https://picsum.photos/seed/music1/300', duration: 200, audioUrl: 'https://cdn.pixabay.com/download/audio/2023/05/18/audio_b88b773643.mp3' },
  { id: 'spotify:2', title: 'Levitating', artist: 'Dua Lipa', albumArt: 'https://picsum.photos/seed/music2/300', duration: 210, audioUrl: 'https://cdn.pixabay.com/download/audio/2024/02/09/audio_3d195226c2.mp3' },
  { id: 'spotify:3', title: 'As It Was', artist: 'Harry Styles', albumArt: 'https://picsum.photos/seed/music3/300', duration: 167, audioUrl: 'https://cdn.pixabay.com/download/audio/2023/04/18/audio_73b9e3a09c.mp3' },
  { id: 'spotify:4', title: 'Good 4 U', artist: 'Olivia Rodrigo', albumArt: 'https://picsum.photos/seed/music4/300', duration: 178, audioUrl: 'https://cdn.pixabay.com/download/audio/2023/03/23/audio_092925b6a7.mp3' },
  { id: 'spotify:5', title: 'Uptown Funk', artist: 'Mark Ronson ft. Bruno Mars', albumArt: 'https://picsum.photos/seed/music5/300', duration: 270, audioUrl: 'https://cdn.pixabay.com/download/audio/2023/03/01/audio_1385459343.mp3' },
];

const MOCK_SONGS_B: Song[] = [
    { id: 'spotify:6', title: "Don't Start Now", artist: 'Dua Lipa', albumArt: 'https://picsum.photos/seed/music6/300', duration: 183, audioUrl: 'https://cdn.pixabay.com/download/audio/2022/10/19/audio_7273c52e93.mp3' },
    { id: 'spotify:7', title: 'Crazy Little Thing Called Love', artist: 'Queen', albumArt: 'https://picsum.photos/seed/music7/300', duration: 174, audioUrl: 'https://cdn.pixabay.com/download/audio/2022/05/16/audio_a08b3c829e.mp3' },
    { id: 'spotify:8', title: 'Juice', artist: 'Lizzo', albumArt: 'https://picsum.photos/seed/music8/300', duration: 195, audioUrl: 'https://cdn.pixabay.com/download/audio/2022/11/21/audio_a12a524279.mp3' },
    { id: 'spotify:9', title: 'Bad Guy', artist: 'Billie Eilish', albumArt: 'https://picsum.photos/seed/music9/300', duration: 194, audioUrl: 'https://cdn.pixabay.com/download/audio/2023/01/01/audio_81682880c8.mp3' },
    { id: 'spotify:10', title: 'Get Lucky', artist: 'Daft Punk ft. Pharrell Williams', albumArt: 'https://picsum.photos/seed/music10/300', duration: 248, audioUrl: 'https://cdn.pixabay.com/download/audio/2022/08/04/audio_34b087a32d.mp3' },
];

const MOCK_SONGS_C: Song[] = [
    { id: 'spotify:11', title: 'Shape of You', artist: 'Ed Sheeran', albumArt: 'https://picsum.photos/seed/music11/300', duration: 233, audioUrl: 'https://cdn.pixabay.com/download/audio/2022/08/25/audio_4449765b21.mp3' },
    { id: 'spotify:12', title: 'Watermelon Sugar', artist: 'Harry Styles', albumArt: 'https://picsum.photos/seed/music12/300', duration: 174, audioUrl: 'https://cdn.pixabay.com/download/audio/2022/08/03/audio_eb3f434a40.mp3' },
    { id: 'spotify:13', title: 'Havana', artist: 'Camila Cabello ft. Young Thug', albumArt: 'https://picsum.photos/seed/music13/300', duration: 217, audioUrl: 'https://cdn.pixabay.com/download/audio/2022/01/21/audio_c3a0335759.mp3' },
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