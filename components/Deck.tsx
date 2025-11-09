import React from 'react';
import { Song } from '../types.ts';
import { LoadingIcon } from '../constants.tsx';
import Visualizer from './Visualizer.tsx';

interface DeckProps {
  song: Song;
  progress: number;
  duration: number;
  isPlaying: boolean;
  djCommentary: string;
  transitionEffect: string;
  isLoading: boolean;
  activeSoundEffect: string | null;
  isVisualizerOn: boolean;
  onShowLyrics: () => void;
  isLoadingLyrics: boolean;
  onSeek: (time: number) => void;
  audioContext: AudioContext | null;
  sourceNode: MediaElementAudioSourceNode | null;
}

const Deck: React.FC<DeckProps> = ({ 
  song, progress, duration, isPlaying, djCommentary, transitionEffect, 
  isLoading, activeSoundEffect, isVisualizerOn, onShowLyrics, isLoadingLyrics,
  onSeek, audioContext, sourceNode 
}) => {
  const progressPercentage = duration > 0 ? (progress / duration) * 100 : 0;

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };
  
  const handleSeek = (e: React.MouseEvent<HTMLDivElement>) => {
    if (duration > 0) {
        const rect = e.currentTarget.getBoundingClientRect();
        const clickX = e.clientX - rect.left;
        const width = rect.width;
        const seekTime = (clickX / width) * duration;
        onSeek(seekTime);
    }
  };

  return (
    <div className="bg-gray-800 rounded-lg shadow-lg p-6 space-y-4 border border-gray-700 relative overflow-hidden">
        {isVisualizerOn && audioContext && sourceNode && <Visualizer isPlaying={isPlaying} audioContext={audioContext} sourceNode={sourceNode} />}
        {activeSoundEffect && (
            <div className="absolute inset-0 bg-black bg-opacity-75 flex items-center justify-center z-20">
                <p className="text-4xl font-bold animate-ping text-yellow-300">{activeSoundEffect}</p>
            </div>
        )}
        <div className="relative z-10 flex flex-col md:flex-row items-center md:items-start gap-6">
            <img 
                src={song.albumArt} 
                alt={song.title} 
                className={`w-48 h-48 md:w-56 md:h-56 rounded-md shadow-2xl object-cover ${isPlaying ? 'animate-pulse' : ''}`}
            />
            <div className="flex-1 text-center md:text-left">
                <h2 className="text-3xl md:text-4xl font-bold truncate">{song.title}</h2>
                <p className="text-xl text-gray-400">{song.artist}</p>
                <div className="flex items-center gap-4 mt-4 flex-wrap">
                  <div className="inline-flex items-center bg-gray-700/50 rounded-full px-3 py-1 text-sm font-medium text-purple-300 border border-purple-500/30">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                      <path d="M8 5a1 1 0 100 2h5.586l-1.293 1.293a1 1 0 001.414 1.414l3-3a1 1 0 000-1.414l-3-3a1 1 0 10-1.414 1.414L13.586 5H8z" />
                      <path d="M12 15a1 1 0 100-2H6.414l1.293-1.293a1 1 0 10-1.414-1.414l-3 3a1 1 0 000 1.414l3 3a1 1 0 001.414-1.414L6.414 15H12z" />
                    </svg>
                    Mix Style: {transitionEffect}
                  </div>
                   <button 
                    onClick={onShowLyrics} 
                    disabled={isLoadingLyrics}
                    className="inline-flex items-center gap-2 bg-gray-700/50 hover:bg-gray-700 rounded-full px-3 py-1 text-sm font-medium text-cyan-300 border border-cyan-500/30 disabled:opacity-50 disabled:cursor-wait"
                  >
                    {isLoadingLyrics ? (
                        <LoadingIcon />
                    ) : (
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M7 4a3 3 0 016 0v4a3 3 0 11-6 0V4zm4 10.93A7.001 7.001 0 0017 8h-1a6 6 0 11-5.445-5.91A1 1 0 0011 3H9a1 1 0 00-.555.188A6 6 0 114 8H3a7.001 7.001 0 006 6.93V17H7a1 1 0 100 2h6a1 1 0 100-2h-2v-2.07z" clipRule="evenodd" /></svg>
                    )}
                    Lyrics
                  </button>
                  <a 
                    href={song.spotifyUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 bg-green-900/50 hover:bg-green-800/80 rounded-full px-3 py-1 text-sm font-medium text-green-300 border border-green-500/30"
                  >
                     <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M12 2C6.477 2 2 6.477 2 12s4.477 10 10 10 10-4.477 10-10S17.523 2 12 2zm4.441 14.544c-.2.312-.612.413-.924.212-2.586-1.58-5.83-1.943-9.72-1.066-.375.084-.688-.163-.772-.538-.084-.375.163-.688.538-.772 4.225-.945 7.81- .538 10.662 1.23.312.2.413.612.212.924zm.843-2.836c-.25.388-.75.513-1.138.263-2.937-1.787-7.387-2.312-10.937-1.275-.45.125-.9-.163-1.025-.613s.163-.9.613-1.025c3.95-1.125 8.788-.55 12.088 1.463.387.25.512.75.262 1.137zm.1-3.237C13.2 8.35 8.363 8.163 4.95 9.213c-.513.15-.988-.187-1.138-.7s.188-.988.7-1.138c3.812-1.162 9.2-1.362 13.562 1.1.45.263.613.825.35 1.275-.262.45-.825.613-1.275.35z" />
                     </svg>
                    Find on Spotify
                  </a>
                </div>
                <div className="mt-4 space-y-2">
                    <div onClick={handleSeek} className="w-full bg-gray-700 rounded-full h-2 cursor-pointer group">
                        <div className="bg-cyan-500 h-2 rounded-full relative" style={{ width: `${progressPercentage}%` }}>
                           <div className="absolute right-0 top-1/2 -mt-1 w-4 h-4 bg-white rounded-full opacity-0 group-hover:opacity-100 transform -translate-x-1/2" />
                        </div>
                    </div>
                    <div className="flex justify-between text-sm text-gray-400">
                        <span>{formatTime(progress)}</span>
                        <span>{formatTime(duration)}</span>
                    </div>
                </div>
            </div>
        </div>
        <div className="relative z-10 mt-4 bg-gray-900/50 p-4 rounded-lg min-h-[80px] flex items-center justify-center border border-purple-500/30">
            {isLoading ? (
                <LoadingIcon/>
            ) : (
                <p className="text-center italic text-purple-300">"{djCommentary}"</p>
            )}
        </div>
    </div>
  );
};

export default Deck;