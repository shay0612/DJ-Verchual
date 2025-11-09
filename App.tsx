import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Song, MixEvent, MixEventType, SoundEffect, SpotifyPlaylist } from './types.ts';
import { SOUND_EFFECTS, MOCK_SPOTIFY_PLAYLISTS } from './constants.tsx';
import { getDjTransition, getSimilarSong, getSongFromRequest, getLyrics, generatePlaylistsFromVibe } from './services/geminiService.ts';

import Header from './components/Header.tsx';
import Deck from './components/Deck.tsx';
import Playlist from './components/Playlist.tsx';
import Controls from './components/Controls.tsx';
import SavedMixModal from './components/SavedMixModal.tsx';
import LoginScreen from './components/LoginScreen.tsx';
import PlaylistModal from './components/PlaylistModal.tsx';
import LyricsModal from './components/LyricsModal.tsx';
import SpotifyLoginModal from './components/SpotifyLoginModal.tsx';
import VibeSelectionScreen from './components/VibeSelectionScreen.tsx';
import AddSoundEffectModal from './components/AddSoundEffectModal.tsx';

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
  const [duration, setDuration] = useState(0);
  const [djCommentary, setDjCommentary] = useState("Welcome to the party! Let's get this started!");
  const [djTransitionEffect, setDjTransitionEffect] = useState('Crossfade');
  const [isAutoSuggestOn, setIsAutoSuggestOn] = useState(true);
  const [isSoundEffectsOn, setIsSoundEffectsOn] = useState(true);
  const [soundEffectVolume, setSoundEffectVolume] = useState(1);
  const [soundEffects, setSoundEffects] = useState<SoundEffect[]>(SOUND_EFFECTS);
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
  const [showAddFxModal, setShowAddFxModal] = useState(false);


  const currentSong = playlist[currentSongIndex];
  const nextSong = playlist.length > 0 ? playlist[(currentSongIndex + 1) % playlist.length] : undefined;
  
  const audioRef = useRef<HTMLAudioElement>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const sourceNodeRef = useRef<MediaElementAudioSourceNode | null>(null);
  const nextSongCount = useRef(0);
  const undoTimeoutRef = useRef<number | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const initAudio = () => {
        if (!audioContextRef.current && audioRef.current) {
            const context = new (window.AudioContext || (window as any).webkitAudioContext)();
            audioContextRef.current = context;
            sourceNodeRef.current = context.createMediaElementSource(audioRef.current);
            sourceNodeRef.current.connect(context.destination);
        }
        window.removeEventListener('click', initAudio);
        window.removeEventListener('keydown', initAudio);
    };
    window.addEventListener('click', initAudio);
    window.addEventListener('keydown', initAudio);

    return () => {
        window.removeEventListener('click', initAudio);
        window.removeEventListener('keydown', initAudio);
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

    if (effect.audioBuffer) {
        ctx.decodeAudioData(effect.audioBuffer.slice(0))
            .then(decodedBuffer => {
                const source = ctx.createBufferSource();
                source.buffer = decodedBuffer;
                source.connect(gainNode);
                source.start(0);
            })
            .catch(err => {
                console.error(`Error decoding audio data for ${effect.name}:`, err);
            });
        return;
    }

    // Fallback to synthesized sounds
    const now = ctx.currentTime;
    switch (effect.id) {
        case 'se1': { // Air Horn
            ['sawtooth', 'square'].forEach((type, i) => {
                const osc = ctx.createOscillator();
                osc.type = type as OscillatorType;
                const freq = 300 + i * 15; // Dissonant frequencies
                osc.frequency.setValueAtTime(freq, now);
                osc.frequency.linearRampToValueAtTime(freq * 1.2, now + 0.1);
                gainNode.gain.setValueAtTime(soundEffectVolume, now);
                gainNode.gain.exponentialRampToValueAtTime(0.01, now + 0.8);
                osc.connect(gainNode);
                osc.start(now);
                osc.stop(now + 0.8);
            });
            break;
        }
        case 'se2': { // Record Scratch
            const bufferSize = ctx.sampleRate * 0.5;
            const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
            const output = buffer.getChannelData(0);
            for (let i = 0; i < bufferSize; i++) {
                output[i] = (Math.random() * 2 - 1) * (1 - i / bufferSize);
            }
            const noise = ctx.createBufferSource();
            noise.buffer = buffer;

            const filter = ctx.createBiquadFilter();
            filter.type = 'lowpass';
            filter.frequency.setValueAtTime(2000, now);
            filter.frequency.exponentialRampToValueAtTime(200, now + 0.5);

            noise.connect(filter);
            filter.connect(gainNode);
            noise.start(now);
            noise.stop(now + 0.5);
            break;
        }
        case 'se3': { // Crowd Cheer
            const bufferSize = ctx.sampleRate * 1.5; // Longer cheer
            const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
            const output = buffer.getChannelData(0);
            for (let i = 0; i < bufferSize; i++) {
                output[i] = Math.random() * 2 - 1;
            }
            const noise = ctx.createBufferSource();
            noise.buffer = buffer;
            
            const filter = ctx.createBiquadFilter();
            filter.type = "bandpass";
            filter.frequency.value = 1000;
            filter.Q.value = 0.5;

            noise.connect(filter);
            filter.connect(gainNode);

            gainNode.gain.setValueAtTime(0, now);
            gainNode.gain.linearRampToValueAtTime(soundEffectVolume, now + 0.2); // Fade in
            gainNode.gain.linearRampToValueAtTime(0, now + 1.5); // Fade out

            noise.start(now);
            noise.stop(now + 1.5);
            break;
        }
        case 'se4': { // Laser
            const osc = ctx.createOscillator();
            osc.type = 'sawtooth';
            osc.frequency.setValueAtTime(1200, now);
            osc.frequency.exponentialRampToValueAtTime(200, now + 0.3);
            
            gainNode.gain.setValueAtTime(soundEffectVolume, now);
            gainNode.gain.exponentialRampToValueAtTime(0.01, now + 0.3);

            osc.connect(gainNode);
            osc.start(now);
            osc.stop(now + 0.3);
            break;
        }
        case 'se5': { // Drop
            const osc = ctx.createOscillator();
            osc.type = 'sine';
            osc.frequency.setValueAtTime(150, now);
            osc.frequency.exponentialRampToValueAtTime(30, now + 0.5);

            gainNode.gain.setValueAtTime(soundEffectVolume * 1.2, now);
            gainNode.gain.exponentialRampToValueAtTime(0.01, now + 0.5);
            
            osc.connect(gainNode);
            osc.start(now);
            osc.stop(now + 0.5);
            break;
        }
        case 'se6': { // Hand Clap
            const bufferSize = ctx.sampleRate * 0.2;
            const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
            const output = buffer.getChannelData(0);
            for (let i = 0; i < bufferSize; i++) {
                output[i] = Math.random() * 2 - 1;
            }
            const noise = ctx.createBufferSource();
            noise.buffer = buffer;
            
            const filter = ctx.createBiquadFilter();
            filter.type = "bandpass";
            filter.frequency.value = 1500;
            filter.Q.value = 1;

            noise.connect(filter);
            filter.connect(gainNode);
            
            gainNode.gain.setValueAtTime(soundEffectVolume, now);
            gainNode.gain.exponentialRampToValueAtTime(0.01, now + 0.15);

            noise.start(now);
            noise.stop(now + 0.15);
            break;
        }
        case 'se7': { // Siren
            const osc = ctx.createOscillator();
            osc.type = 'sawtooth';
            
            const lfo = ctx.createOscillator();
            lfo.type = 'sine';
            lfo.frequency.setValueAtTime(2.5, now); // Controls speed of siren
            
            const lfoGain = ctx.createGain();
            lfoGain.gain.setValueAtTime(300, now); // Controls pitch range
            
            lfo.connect(lfoGain);
            lfoGain.connect(osc.frequency);
            osc.frequency.setValueAtTime(800, now); // Base frequency
            
            gainNode.gain.setValueAtTime(soundEffectVolume, now);
            gainNode.gain.exponentialRampToValueAtTime(0.01, now + 1.5);

            osc.connect(gainNode);
            osc.start(now);
            osc.stop(now + 1.5);
            lfo.start(now);
            lfo.stop(now + 1.5);
            break;
        }
        case 'se8': { // Record Rewind
            const bufferSize = ctx.sampleRate * 1;
            const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
            const output = buffer.getChannelData(0);
            for (let i = 0; i < bufferSize; i++) {
                output[i] = Math.random() * 2 - 1;
            }
            const noise = ctx.createBufferSource();
            noise.buffer = buffer;
            noise.playbackRate.setValueAtTime(1.0, now);
            noise.playbackRate.exponentialRampToValueAtTime(8.0, now + 1);

            gainNode.gain.setValueAtTime(soundEffectVolume, now);
            gainNode.gain.exponentialRampToValueAtTime(0.01, now + 1);
            
            noise.connect(gainNode);
            noise.start(now);
            noise.stop(now + 1);
            break;
        }
        case 'se9': { // Bell
            const fundamental = 523.25; // C5
            [1, 2.0, 3.0, 4.2, 5.4, 6.8].forEach(ratio => { // Non-harmonic ratios for bell sound
                const osc = ctx.createOscillator();
                osc.type = 'sine';
                osc.frequency.setValueAtTime(fundamental * ratio, now);
                
                const decayGain = ctx.createGain();
                decayGain.gain.setValueAtTime(soundEffectVolume * 0.5, now);
                decayGain.gain.exponentialRampToValueAtTime(0.001, now + 1.5);

                osc.connect(decayGain);
                decayGain.connect(gainNode);
                osc.start(now);
                osc.stop(now + 1.5);
            });
            break;
        }
        default: {
            // Fallback for any unhandled effects, including customs without buffers for some reason
            const osc = ctx.createOscillator();
            osc.type = 'square';
            osc.frequency.setValueAtTime(440, now);
            osc.connect(gainNode);
            osc.start(now);
            osc.stop(now + 0.4);
            break;
        }
    }
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
    
    setIsLoading(prev => ({...prev, commentary: true }));
    const transitionData = await getDjTransition(currentSong, nextSong);
    setDjCommentary(transitionData.commentary);
    setDjTransitionEffect(transitionData.transition_effect);
    
    // Set the new song index, which will trigger the useEffect to play it
    setCurrentSongIndex(newIndex);
    setProgress(0);

    if (transitionData.sound_effect && isSoundEffectsOn) {
        const effectToPlay = soundEffects.find(se => se.name.toLowerCase() === transitionData.sound_effect?.toLowerCase());
        if (effectToPlay) {
          setTimeout(() => handleSoundEffect(effectToPlay), 500);
        }
    }

    setIsLoading(prev => ({...prev, commentary: false }));
    logEvent(MixEventType.SONG_PLAY, `${nextSong.title} - ${nextSong.artist}`);
    logEvent(MixEventType.DJ_COMMENTARY, transitionData.commentary);
  }, [currentSongIndex, playlist, currentSong, nextSong, logEvent, handleSoundEffect, isSoundEffectsOn, soundEffects]);


  // Audio playback effect
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    if (currentSong) {
        // Set the source if it's different.
        if (audio.src !== currentSong.audioUrl) {
           audio.src = currentSong.audioUrl;
        }
        
        // Then, based on isPlaying, play or pause.
        if (isPlaying) {
            // The play() method can be called even if the media is still loading.
            // It will start playing once it can.
            audio.play().catch(e => console.error("Error playing audio:", e));
        } else {
            audio.pause();
        }
    } else {
        // If there's no song, make sure to pause and clear the source.
        audio.pause();
        audio.src = '';
    }
  }, [currentSong, isPlaying]);

  const handleTimeUpdate = () => {
    if(audioRef.current) {
        setProgress(audioRef.current.currentTime);
    }
  };

  const handleLoadedMetadata = () => {
    if(audioRef.current) {
        setDuration(audioRef.current.duration);
    }
  };

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
      if (audioContextRef.current?.state === 'suspended') {
        audioContextRef.current.resume();
      }
      setIsPlaying(!isPlaying);
      if(!isPlaying) {
        logEvent(MixEventType.SONG_PLAY, `${currentSong.title} - ${currentSong.artist}`);
      }
    }
  };

  const handleSeek = (time: number) => {
    if (audioRef.current) {
        audioRef.current.currentTime = time;
        setProgress(time);
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
    setIsPlaying(false);
    if (audioRef.current) {
        audioRef.current.src = '';
    }
    if (undoTimeoutRef.current) {
        clearTimeout(undoTimeoutRef.current);
        undoTimeoutRef.current = null;
    }

    setAppState('LOGIN');
    setShowSpotifyLogin(false);
    setShowPlaylistModal(false);
    setGeneratedPlaylists([]);
    setPlaylist([]);
    setCurrentSongIndex(0);
    setProgress(0);
    setDuration(0);
    setDjCommentary("Welcome to the party! Let's get this started!");
    setDjTransitionEffect('Crossfade');
    setIsAutoSuggestOn(true);
    setIsSoundEffectsOn(true);
    setSoundEffectVolume(1);
    setSoundEffects(SOUND_EFFECTS);
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
    setDuration(songs[0]?.duration || 0);
    setIsPlaying(false);
    setPlayHistory([]);
    setDjCommentary(`Kicking things off with a banger from the "${playlistName}" playlist!`);
    setShowPlaylistModal(false);
  };

  const handleReorderPlaylist = useCallback((reorderedSongs: Song[]) => {
      if (!currentSong) return;
      const newCurrentIndex = reorderedSongs.findIndex(s => s.id === currentSong.id);
  
      clearUndoState();
      setPlaylist(reorderedSongs);
      
      if (newCurrentIndex !== -1) {
        setCurrentSongIndex(newCurrentIndex);
      }
    }, [clearUndoState, currentSong]);

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

  const handleUploadSoundEffect = (effectId: string, audioBuffer: ArrayBuffer) => {
    setSoundEffects(prevEffects =>
        prevEffects.map(effect =>
            effect.id === effectId ? { ...effect, audioBuffer } : effect
        )
    );
  };

  const handleAddSoundEffect = (name: string, emoji: string, buffer: ArrayBuffer) => {
    const newEffect: SoundEffect = {
        id: `custom-se-${Date.now()}`,
        name: name.replace(/\.[^/.]+$/, ""), // Remove file extension
        emoji: emoji,
        audioBuffer: buffer,
    };
    setSoundEffects(prev => [...prev, newEffect]);
    setShowAddFxModal(false);
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
      <audio 
        ref={audioRef}
        onTimeUpdate={handleTimeUpdate}
        onLoadedMetadata={handleLoadedMetadata}
        onEnded={advanceToNextSong}
        crossOrigin="anonymous"
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
                duration={duration}
                isPlaying={isPlaying}
                djCommentary={djCommentary}
                transitionEffect={djTransitionEffect}
                isLoading={isLoading.commentary}
                activeSoundEffect={activeSoundEffect}
                isVisualizerOn={isVisualizerOn}
                onShowLyrics={handleShowLyrics}
                isLoadingLyrics={isLoading.lyrics}
                onSeek={handleSeek}
                audioContext={audioContextRef.current}
                sourceNode={sourceNodeRef.current}
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
                onUploadSoundEffect={handleUploadSoundEffect}
                isVisualizerOn={isVisualizerOn}
                onVisualizerToggle={() => setIsVisualizerOn(!isVisualizerOn)}
                isRecording={isRecording}
                onRecordToggle={toggleRecording}
                onRequestSubmit={handleRequest}
                isLoading={isLoading}
                soundEffects={soundEffects}
                onAddSoundEffectClick={() => setShowAddFxModal(true)}
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

      {showAddFxModal && (
        <AddSoundEffectModal
          onClose={() => setShowAddFxModal(false)}
          onSave={handleAddSoundEffect}
        />
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