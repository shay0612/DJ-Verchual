export interface Song {
  id: string;
  title: string;
  artist: string;
  albumArt: string;
  duration: number; // in seconds
  audioUrl: string;
}

export interface SoundEffect {
  id: string;
  name: string;
  emoji: string;
  audioBuffer?: ArrayBuffer;
}

export enum MixEventType {
  SONG_PLAY = 'SONG_PLAY',
  DJ_COMMENTARY = 'DJ_COMMENTARY',
  SOUND_EFFECT = 'SOUND_EFFECT',
  SONG_REQUEST = 'SONG_REQUEST',
  SONG_SUGGESTION = 'SONG_SUGGESTION',
  SONG_REMOVED = 'SONG_REMOVED',
}

export interface MixEvent {
  type: MixEventType;
  timestamp: Date;
  content: string;
}

export interface DjTransitionResponse {
  commentary: string;
  transition_effect: string;
  sound_effect: string | null;
}

export interface SpotifyPlaylist {
    id: string;
    name: string;
    songs: Song[];
}