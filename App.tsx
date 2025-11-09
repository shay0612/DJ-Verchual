import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Song, MixEvent, MixEventType, SoundEffect, SpotifyPlaylist } from './types';
import { SOUND_EFFECTS, MOCK_SPOTIFY_PLAYLISTS } from './constants';
import { getDjTransition, getSimilarSong, getSongFromRequest, getLyrics, generatePlaylistsFromVibe } from './services/geminiService';

import Header from './components/Header';
import Deck from './components/Deck';
import Playlist from './components/Playlist';
import Controls from './components/Controls';
import SavedMixModal from './components/SavedMixModal';
import LoginScreen from './components/LoginScreen';
import PlaylistModal from './components/PlaylistModal';
import LyricsModal from './components/LyricsModal';
import SpotifyLoginModal from './components/SpotifyLoginModal';
import VibeSelectionScreen from './components/VibeSelectionScreen';

type AppState = 'LOGIN' | 'VIBE_SELECT' | 'DJ_BOOTH';

export default function App() {
  const [appState, setAppState] = useState<AppState>('LOGIN');
  const [showSpotifyLogin, setShowSpotifyLogin] = useState(false);
  const [showPlaylistModal, setShowPlaylistModal] = useState(false);
  const [generatedPlaylists, setGeneratedPlaylists] = useState<SpotifyPlaylist[]>([]);
  const [playlist, setPlaylist] = useState<Song[]>([]);
  const [currentSongIndex, setCurrentSongIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [djCommentary, setDjCommentary] = useState("Welcome to the party! Let's get this started!");
  const [djTransitionEffect, setDjTransitionEffect] = useState('Crossfade');
  const [isAutoSuggestOn, setIsAutoSuggestOn] = useState(true);
  const [isSoundEffectsOn, setIsSoundEffectsOn] = useState(true);
  const [soundEffectVolume, setSoundEffectVolume] = useState(1);
  const [isVisualizerOn, setIsVisualizerOn] = useState(true);
  const [isRecording, setIsRecording] = useState(false);
  const [mixLog, setMixLog] = useState<MixEvent[]>([]);
  const [showMixModal, setShowMixModal] = useState(false);
  const [isLoading, setIsLoading] = useState({ commentary: false, suggestion: false, request: false, lyrics: false, playlists: false });
  const [activeSoundEffect, setActiveSoundEffect] = useState<string | null>(null);
  const [playHistory, setPlayHistory] = useState<Song[]>([]);
  const [showLyricsModal, setShowLyricsModal] = useState(false);
  const [currentLyrics, setCurrentLyrics] = useState('');
  const [lastRemovedSong, setLastRemovedSong] = useState<{ song: Song; index: number } | null>(null);
  const [uploadedMix, setUploadedMix] = useState<MixEvent[] | null>(null);


  const currentSong = playlist[currentSongIndex];
  const nextSong = playlist.length > 0 ? playlist[(currentSongIndex + 1) % playlist.length] : undefined;

  const intervalRef = useRef<number | null>(null);
  const nextSongCount = useRef(0);
  const audioContextRef = useRef<AudioContext | null>(null);
  const undoTimeoutRef = useRef<number | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const initAudioContext = () => {
        if (!audioContextRef.current) {
            audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
        }
        window.removeEventListener('click', initAudioContext);
        window.removeEventListener('keydown', initAudioContext);
    };
    window.addEventListener('click', initAudioContext);
    window.addEventListener('keydown', initAudioContext);

    return () => {
        window.removeEventListener('click', initAudioContext);
        window.removeEventListener('keydown', initAudioContext);
        audioContextRef.current?.close().catch(console.error);
        if (undoTimeoutRef.current) {
          clearTimeout(undoTimeoutRef.current);
        }
    };
  }, []);

  const clearUndoState = useCallback(() => {
    if (undoTimeoutRef.current) {
        clearTimeout(undoTimeoutRef.current);
        undoTimeoutRef.current = null;
    }
    if (lastRemovedSong) {
      setLastRemovedSong(null);
    }
  }, [lastRemovedSong]);

  const logEvent = useCallback((type: MixEventType, content: string) => {
    if (isRecording) {
      setMixLog(prevLog => [...prevLog, { type, content, timestamp: new Date() }]);
    }
  }, [isRecording]);
  
  const playSoundEffect = (effect: SoundEffect) => {
    const ctx = audioContextRef.current;
    if (!ctx) return;

    if (ctx.state === 'suspended') {
      ctx.resume();
    }

    const gainNode = ctx.createGain();
    gainNode.gain.setValueAtTime(soundEffectVolume, ctx.currentTime);
    gainNode.connect(ctx.destination);

    if (effect.id === 'se3') { // Crowd Cheer (White Noise)
        const bufferSize = ctx.sampleRate * 0.8; 
        const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
        const output = buffer.getChannelData(0);
        for (let i = 0; i < bufferSize; i++) {
            output[i] = Math.random() * 2 - 1;
        }
        const noise = ctx.createBufferSource();
        noise.buffer = buffer;
        noise.connect(gainNode);
        noise.start();
        return;
    }
    
    const oscillator = ctx.createOscillator();
    switch (effect.id) {
        case 'se1': // Air Horn
            oscillator.type = 'sawtooth';
            oscillator.frequency.setValueAtTime(350, ctx.currentTime);
            oscillator.frequency.linearRampToValueAtTime(450, ctx.currentTime + 0.3);
            break;
        case 'se2': // Record Scratch
            oscillator.type = 'sine';
            oscillator.frequency.setValueAtTime(1200, ctx.currentTime);
            oscillator.frequency.exponentialRampToValueAtTime(100, ctx.currentTime + 0.4);
            gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.4);
            break;
        case 'se4': // Laser
            oscillator.type = 'triangle';
            oscillator.frequency.setValueAtTime(800, ctx.currentTime);
            oscillator.frequency.linearRampToValueAtTime(200, ctx.currentTime + 0.2);
            break;
        default: // Generic synth pop for others
            oscillator.type = 'square';
            oscillator.frequency.setValueAtTime(600 + (parseInt(effect.id.replace('se',''), 10) * 50), ctx.currentTime);
            break;
    }
    
    oscillator.connect(gainNode);
    oscillator.start();
    oscillator.stop(ctx.currentTime + 0.4);
  };


  const handleSoundEffect = useCallback((effect: SoundEffect) => {
    if (!isSoundEffectsOn) return;
    setActiveSoundEffect(`${effect.emoji} ${effect.name}! ${effect.emoji}`);
    logEvent(MixEventType.SOUND_EFFECT, effect.name);
    playSoundEffect(effect);
    setTimeout(() => setActiveSoundEffect(null), 2000);
  }, [logEvent, isSoundEffectsOn, soundEffectVolume]);

  const advanceToNextSong = useCallback(async () => {
    if (!currentSong || !nextSong) return;

    setPlayHistory(prev => [currentSong, ...prev]);

    const newIndex = (currentSongIndex + 1) % playlist.length;
    setCurrentSongIndex(newIndex);
    setProgress(0);
    
    setIsLoading(prev => ({...prev, commentary: true }));
    const transitionData = await getDjTransition(currentSong, nextSong);
    setDjCommentary(transitionData.commentary);
    setDjTransitionEffect(transitionData.transition_effect);
    
    if (transitionData.sound_effect && isSoundEffectsOn) {
        const effectToPlay = SOUND_EFFECTS.find(se => se.name.toLowerCase() === transitionData.sound_effect?.toLowerCase());
        if (effectToPlay) {
          setTimeout(() => handleSoundEffect(effectToPlay), 500);
        }
    }

    setIsLoading(prev => ({...prev, commentary: false }));
    logEvent(MixEventType.SONG_PLAY, `${nextSong.title} - ${nextSong.artist}`);
    logEvent(MixEventType.DJ_COMMENTARY, transitionData.commentary);
  }, [currentSongIndex, playlist, currentSong, nextSong, logEvent, handleSoundEffect, isSoundEffectsOn]);


  useEffect(() => {
    if (isPlaying && currentSong) {
      if(progress === 0) { // Log song play only at the beginning
        logEvent(MixEventType.SONG_PLAY, `${currentSong.title} - ${currentSong.artist}`);
      }
      intervalRef.current = window.setInterval(() => {
        setProgress(prev => {
          const newProgress = prev + 1;
          if (newProgress >= currentSong.duration) {
            advanceToNextSong();
            return 0;
          }
          return newProgress;
        });
      }, 1000);
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    }
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isPlaying, currentSong, advanceToNextSong, logEvent, progress]);

  const handleNext = useCallback(() => {
    if (playlist.length > 1 && currentSong) {
      clearUndoState();
      advanceToNextSong();
      nextSongCount.current +=1;

      if (isAutoSuggestOn && nextSongCount.current % 2 === 0) {
        const suggestSong = async () => {
          setIsLoading(prev => ({ ...prev, suggestion: true }));
          const newSong = await getSimilarSong(currentSong, playlist);
          if (newSong) {
            const insertIndex = (currentSongIndex + 2) % (playlist.length + 1);
            setPlaylist(prev => {
                const newPlaylist = [...prev];
                newPlaylist.splice(insertIndex, 0, newSong);
                return newPlaylist;
            });
            logEvent(MixEventType.SONG_SUGGESTION, `Added similar song: ${newSong.title} by ${newSong.artist}`);
          }
          setIsLoading(prev => ({ ...prev, suggestion: false }));
        };
        suggestSong();
      }
    }
  }, [playlist, advanceToNextSong, isAutoSuggestOn, currentSong, currentSongIndex, logEvent, clearUndoState]);

  const handlePlayPause = () => {
    if (playlist.length > 0) {
      setIsPlaying(!isPlaying);
    }
  };

  const handleRequest = async (request: string) => {
    clearUndoState();
    setIsLoading(prev => ({...prev, request: true }));
    const newSong = await getSongFromRequest(request, playlist);
    if (newSong) {
      const insertIndex = currentSongIndex + 1;
      setPlaylist(prev => {
          const newPlaylist = [...prev];
          newPlaylist.splice(insertIndex, 0, newSong);
          return newPlaylist;
      });
      logEvent(MixEventType.SONG_REQUEST, `Guest requested: ${newSong.title} by ${newSong.artist}`);
    }
    setIsLoading(prev => ({...prev, request: false }));
  };

  const toggleRecording = () => {
    if (isRecording) {
      setIsRecording(false);
      setShowMixModal(true);
    } else {
      setMixLog([]);
      logEvent(MixEventType.DJ_COMMENTARY, "Recording started!");
      setIsRecording(true);
    }
  };
  
  const handleLogin = () => {
    setShowSpotifyLogin(false);
    setAppState('VIBE_SELECT');
  };
  
  const handleLogout = () => {
    // Stop any ongoing processes
    setIsPlaying(false);
    if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
    }
    if (undoTimeoutRef.current) {
        clearTimeout(undoTimeoutRef.current);
        undoTimeoutRef.current = null;
    }

    // Reset all state to initial values
    setAppState('LOGIN');
    setShowSpotifyLogin(false);
    setShowPlaylistModal(false);
    setGeneratedPlaylists([]);
    setPlaylist([]);
    setCurrentSongIndex(0);
    setProgress(0);
    setDjCommentary("Welcome to the party! Let's get this started!");
    setDjTransitionEffect('Crossfade');
    setIsAutoSuggestOn(true);
    setIsSoundEffectsOn(true);
    setSoundEffectVolume(1);
    setIsVisualizerOn(true);
    setIsRecording(false);
    setMixLog([]);
    setShowMixModal(false);
    setIsLoading({ commentary: false, suggestion: false, request: false, lyrics: false, playlists: false });
    setActiveSoundEffect(null);
    setPlayHistory([]);
    setShowLyricsModal(false);
    setCurrentLyrics('');
    setLastRemovedSong(null);
    setUploadedMix(null);
  };

  const handleGeneratePlaylists = async (vibe: string) => {
    setIsLoading(prev => ({ ...prev, playlists: true }));
    const playlists = await generatePlaylistsFromVibe(vibe);
    setGeneratedPlaylists(playlists);
    setIsLoading(prev => ({ ...prev, playlists: false }));
    setAppState('DJ_BOOTH');
    setShowPlaylistModal(true);
  };

  const handleSkipVibeSelection = () => {
    setGeneratedPlaylists(MOCK_SPOTIFY_PLAYLISTS);
    setAppState('DJ_BOOTH');
    setShowPlaylistModal(true);
  };

  const handleSelectPlaylist = (songs: Song[], playlistName: string) => {
    clearUndoState();
    setPlaylist(songs);
    setCurrentSongIndex(0);
    setProgress(0);
    setIsPlaying(false);
    setPlayHistory([]);
    setDjCommentary(`Kicking things off with a banger from the "${playlistName}" playlist!`);
    setShowPlaylistModal(false);
  };

  const handleReorderPlaylist = useCallback((reorderedSongs: Song[]) => {
      clearUndoState();
      setPlaylist(reorderedSongs);
      setCurrentSongIndex(0);
  }, [clearUndoState]);

  const handleRemoveSong = useCallback((songId: string) => {
    if (undoTimeoutRef.current) clearTimeout(undoTimeoutRef.current);

    const songIndex = playlist.findIndex(s => s.id === songId);
    
    if (songIndex > -1) {
        const removedSong = playlist[songIndex];
        
        setLastRemovedSong({ song: removedSong, index: songIndex });
        setPlaylist(prev => prev.filter(song => song.id !== songId));
        logEvent(MixEventType.SONG_REMOVED, `Removed: ${removedSong.title}`);
        
        undoTimeoutRef.current = window.setTimeout(() => {
            setLastRemovedSong(null);
        }, 5000); 
    }
  }, [playlist, logEvent]);
  
  const handleUndoRemove = useCallback(() => {
    if (!lastRemovedSong) return;

    if (undoTimeoutRef.current) {
        clearTimeout(undoTimeoutRef.current);
        undoTimeoutRef.current = null;
    }
    
    setPlaylist(prev => {
      const newPlaylist = [...prev];
      newPlaylist.splice(lastRemovedSong.index, 0, lastRemovedSong.song);
      return newPlaylist;
    });
    
    logEvent(MixEventType.DJ_COMMENTARY, `Brought back "${lastRemovedSong.song.title}" by popular demand!`);
    setLastRemovedSong(null);

  }, [lastRemovedSong, logEvent]);
  
  const handleSetSoundEffectVolume = (volume: number) => {
    setSoundEffectVolume(volume);
  };
  
  const handleShowLyrics = async () => {
      if (!currentSong) return;
      setIsLoading(prev => ({ ...prev, lyrics: true }));
      setShowLyricsModal(true);
      const lyrics = await getLyrics(currentSong);
      setCurrentLyrics(lyrics);
      setIsLoading(prev => ({ ...prev, lyrics: false }));
  };
  
  const handleCloseLyricsModal = () => {
      setShowLyricsModal(false);
      setCurrentLyrics('');
  };

  const parseMixFile = (content: string): MixEvent[] => {
    const lines = content.split('\n');
    const events: MixEvent[] = [];
    const eventTypeValues = Object.values(MixEventType) as string[];

    for (const line of lines) {
        const match = line.match(/^\[.*?\] \[(.*?)\]\s+(.*)$/);
        if (match) {
            const [, typeStr, contentStr] = match;
            if (eventTypeValues.includes(typeStr)) {
                events.push({
                    type: typeStr as MixEventType,
                    content: contentStr.trim(),
                    timestamp: new Date(),
                });
            }
        }
    }
    return events;
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
      const file = event.target.files?.[0];
      if (!file) return;

      const reader = new FileReader();
      reader.onload = (e) => {
          const text = e.target?.result as string;
          if (text) {
              const parsedLog = parseMixFile(text);
              setUploadedMix(parsedLog);
          }
      };
      reader.readAsText(file);
      event.target.value = '';
  };

  const handleUploadClick = () => {
      fileInputRef.current?.click();
  };

  if (appState === 'LOGIN') {
      return (
        <>
            <LoginScreen onLogin={() => setShowSpotifyLogin(true)} />
            {showSpotifyLogin && (
                <SpotifyLoginModal 
                    onAuthorize={handleLogin}
                    onClose={() => setShowSpotifyLogin(false)}
                />
            )}
        </>
      );
  }

  if (appState === 'VIBE_SELECT') {
    return (
        <VibeSelectionScreen 
            onGenerate={handleGeneratePlaylists}
            isLoading={isLoading.playlists}
            onSkip={handleSkipVibeSelection}
        />
    );
  }

  return (
    <div className="bg-gray-900 text-white min-h-screen font-sans">
      <Header 
        isLoggedIn={appState === 'DJ_BOOTH'}
        onChangePlaylist={() => setShowPlaylistModal(true)} 
        onUploadMix={handleUploadClick}
        onLogout={handleLogout}
      />
       <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        accept=".txt"
        className="hidden"
      />
      
      {playlist.length > 0 && currentSong ? (
        <main className="container mx-auto p-4 md:p-8">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            <div className="lg:col-span-4 xl:col-span-3">
                <Playlist 
                    songs={playlist} 
                    currentSongId={currentSong.id} 
                    onReorder={handleReorderPlaylist} 
                    onRemove={handleRemoveSong} 
                    history={playHistory} 
                    lastRemovedSong={lastRemovedSong}
                    onUndoRemove={handleUndoRemove}
                />
            </div>
            <div className="lg:col-span-8 xl:col-span-6">
                <Deck
                song={currentSong}
                progress={progress}
                isPlaying={isPlaying}
                djCommentary={djCommentary}
                transitionEffect={djTransitionEffect}
                isLoading={isLoading.commentary}
                activeSoundEffect={activeSoundEffect}
                isVisualizerOn={isVisualizerOn}
                onShowLyrics={handleShowLyrics}
                isLoadingLyrics={isLoading.lyrics}
                />
            </div>
            <div className="lg:col-span-12 xl:col-span-3">
                <Controls
                isPlaying={isPlaying}
                onPlayPause={handlePlayPause}
                onNext={handleNext}
                onSoundEffect={handleSoundEffect}
                isAutoSuggestOn={isAutoSuggestOn}
                onAutoSuggestToggle={() => setIsAutoSuggestOn(!isAutoSuggestOn)}
                isSoundEffectsOn={isSoundEffectsOn}
                onSoundEffectsToggle={() => setIsSoundEffectsOn(!isSoundEffectsOn)}
                soundEffectVolume={soundEffectVolume}
                onSoundEffectVolumeChange={handleSetSoundEffectVolume}
                isVisualizerOn={isVisualizerOn}
                onVisualizerToggle={() => setIsVisualizerOn(!isVisualizerOn)}
                isRecording={isRecording}
                onRecordToggle={toggleRecording}
                onRequestSubmit={handleRequest}
                isLoading={isLoading}
                soundEffects={SOUND_EFFECTS}
                />
            </div>
            </div>
        </main>
      ) : (
        !showPlaylistModal && (
            <main className="container mx-auto p-4 md:p-8 text-center">
                 <h2 className="text-2xl font-semibold mt-20">Please select a playlist to start the party!</h2>
                 <button onClick={() => setShowPlaylistModal(true)} className="mt-4 bg-cyan-600 hover:bg-cyan-700 text-white font-bold py-2 px-4 rounded-md">
                     Choose Playlist
                 </button>
            </main>
        )
      )}

      {showPlaylistModal && (
        <PlaylistModal 
            playlists={generatedPlaylists} 
            onSelectPlaylist={handleSelectPlaylist}
            onClose={() => {
                if(playlist.length > 0) setShowPlaylistModal(false)
            }}
        />
      )}

      {showLyricsModal && currentSong && (
        <LyricsModal
            song={currentSong}
            lyrics={currentLyrics}
            isLoading={isLoading.lyrics}
            onClose={handleCloseLyricsModal}
        />
      )}

      {showMixModal && (
        <SavedMixModal log={mixLog} onClose={() => setShowMixModal(false)} />
      )}

      {uploadedMix && (
        <SavedMixModal 
            log={uploadedMix} 
            onClose={() => setUploadedMix(null)}
            title="Uploaded Mix"
        />
      )}
    </div>
  );
}