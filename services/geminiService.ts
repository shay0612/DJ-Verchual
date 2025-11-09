import { GoogleGenAI, Type } from "@google/genai";
import { Song, DjTransitionResponse, SpotifyPlaylist } from '../types';
import { SOUND_EFFECTS, MOCK_SPOTIFY_PLAYLISTS } from '../constants';

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY as string });

interface GeneratedPlaylist {
    name: string;
    songs: { title: string, artist: string }[];
}
  
export const generatePlaylistsFromVibe = async (vibe: string): Promise<SpotifyPlaylist[]> => {
    try {
      const prompt = `You are a world-class DJ and music curator. A user wants to start a party and has described the vibe as: "${vibe}".
      
      Your task is to generate 5 diverse but fitting playlist suggestions for this party.
      For each playlist, provide a creative name and a list of 5 to 8 iconic songs (title and artist) that perfectly match the playlist's theme and the overall party vibe.
      
      Return your response as a JSON array.`;
  
      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                name: {
                  type: Type.STRING,
                  description: 'The creative name of the playlist.'
                },
                songs: {
                  type: Type.ARRAY,
                  description: 'A list of songs in the playlist.',
                  items: {
                    type: Type.OBJECT,
                    properties: {
                      title: { type: Type.STRING },
                      artist: { type: Type.STRING }
                    },
                    required: ['title', 'artist']
                  }
                }
              },
              required: ['name', 'songs']
            }
          }
        }
      });
  
      const jsonText = response.text.trim();
      const generatedData = JSON.parse(jsonText) as GeneratedPlaylist[];
  
      // Transform into SpotifyPlaylist[]
      return generatedData.map((playlist, pIndex) => ({
        id: `gemini-pl-${pIndex}-${Date.now()}`,
        name: playlist.name,
        songs: playlist.songs.map((song, sIndex) => ({
          ...song,
          id: `gemini-song-${pIndex}-${sIndex}-${Date.now()}`,
          albumArt: `https://picsum.photos/seed/${encodeURIComponent(song.title)}/300`,
          duration: Math.floor(Math.random() * (240 - 180 + 1)) + 180, // Random duration 3:00-4:00
        }))
      }));
  
    } catch (error) {
      console.error("Error generating playlists:", error);
      // Fallback to mock data on error
      return MOCK_SPOTIFY_PLAYLISTS;
    }
};

export const getDjTransition = async (currentSong: Song, nextSong: Song): Promise<DjTransitionResponse> => {
  try {
    const soundEffectNames = SOUND_EFFECTS.map(s => s.name).join(', ');
    const prompt = `You are a world-class party DJ named "DJ Verchual". You are creating a mix.
    The current song, "${currentSong.title}" by ${currentSong.artist}, is ending.
    The next song is "${nextSong.title}" by ${nextSong.artist}.

    Your tasks:
    1. Suggest a professional DJ transition technique (e.g., "Beatmatch", "Crossfade", "Echo Out & Drop", "Hard Cut").
    2. Write a short, fun, and energetic commentary (1-2 sentences) to hype up the crowd for the next song.
    3. Optionally, suggest ONE relevant sound effect to play during the transition from this list: [${soundEffectNames}]. If no sound effect is needed, return null for that field.

    Return your response as a JSON object.`;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            commentary: { 
              type: Type.STRING,
              description: "The DJ's hype commentary for the crowd."
            },
            transition_effect: { 
              type: Type.STRING,
              description: "The DJ transition technique to use."
            },
            sound_effect: {
              type: Type.STRING,
              description: `An optional sound effect from the provided list. Can be null.`
            }
          },
          required: ['commentary', 'transition_effect', 'sound_effect']
        }
      }
    });

    const jsonText = response.text.trim();
    const parsedResponse = JSON.parse(jsonText, (key, value) => {
        if (value === 'null') return null;
        return value;
    });

    return parsedResponse as DjTransitionResponse;

  } catch (error) {
    console.error("Error generating DJ transition:", error);
    return {
      commentary: "Let's keep the party going!",
      transition_effect: "Crossfade",
      sound_effect: null
    };
  }
};

export const getSimilarSong = async (lastSong: Song, playlist: Song[]): Promise<Song | null> => {
  try {
    const playlistTitles = playlist.map(s => s.title).join(', ');
    const prompt = `You are a party DJ's music suggestion assistant. The last song played was "${lastSong.title}" by ${lastSong.artist}. Suggest a similar, high-energy party song that would fit well in the mix. The current playlist already contains: ${playlistTitles}. Provide a song that is NOT on this list.`;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            title: { type: Type.STRING },
            artist: { type: Type.STRING },
          },
          required: ['title', 'artist']
        },
      }
    });

    const jsonText = response.text.trim();
    const suggestedSong = JSON.parse(jsonText) as { title: string; artist: string };
    
    return {
      ...suggestedSong,
      id: `gemini:${Date.now()}`,
      albumArt: `https://picsum.photos/seed/${encodeURIComponent(suggestedSong.title)}/300`,
      duration: 180, // default duration
    };
  } catch (error) {
    console.error("Error suggesting similar song:", error);
    return null;
  }
};


export const getSongFromRequest = async (request: string, playlist: Song[]): Promise<Song | null> => {
    try {
      const playlistTitles = playlist.map(s => s.title).join(', ');
      const prompt = `You are a party DJ's music request assistant. A guest requested: "${request}". 
      If this is a specific song and artist, return that. 
      If it's a vague request (like 'something funky' or 'a 90s hit'), pick a very popular and well-known song that fits the description. 
      The current playlist already contains these songs: ${playlistTitles}. Try not to repeat songs.`;
  
      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              title: { type: Type.STRING },
              artist: { type: Type.STRING },
            },
            required: ['title', 'artist']
          },
        }
      });
  
      const jsonText = response.text.trim();
      const requestedSong = JSON.parse(jsonText) as { title: string; artist: string };
      
      return {
        ...requestedSong,
        id: `request:${Date.now()}`,
        albumArt: `https://picsum.photos/seed/${encodeURIComponent(requestedSong.title)}/300`,
        duration: 180, // default duration
      };
    } catch (error) {
      console.error("Error handling song request:", error);
      return null;
    }
  };

export const getLyrics = async (song: Song): Promise<string> => {
    try {
        const prompt = `You are a lyric-writing assistant.
    Please generate plausible, creative, and family-friendly lyrics for the song "${song.title}" by ${song.artist}.
    The lyrics should be structured like a real song (e.g., with verses and a chorus).
    Format the output with line breaks for each line of the song. Do not include any other text like "Here are the lyrics:" or markdown formatting.`;

        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
        });

        return response.text.trim();

    } catch (error) {
        console.error("Error generating lyrics:", error);
        return "Couldn't fetch lyrics at the moment. Please try again.";
    }
};