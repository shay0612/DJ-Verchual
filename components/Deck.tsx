import React from 'react';
import { Song } from '../types';
import { LoadingIcon } from '../constants';
import Visualizer from './Visualizer';

interface DeckProps {
  song: Song;
  progress: number;
  isPlaying: boolean;
  djCommentary: string;
  transitionEffect: string;
  isLoading: boolean;
  activeSoundEffect: string | null;
  isVisualizerOn: boolean;
  onShowLyrics: () => void;
  isLoadingLyrics: boolean;
}

const Deck: React.FC<DeckProps> = ({ song, progress, isPlaying, djCommentary, transitionEffect, isLoading, activeSoundEffect, isVisualizerOn, onShowLyrics, isLoadingLyrics }) => {
  const progressPercentage = (progress / song.duration) * 100;

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  return (
    <div className="bg-gray-800 rounded-lg shadow-lg p-6 space-y-4 border border-gray-700 relative overflow-hidden">
        {isVisualizerOn && <Visualizer isPlaying={isPlaying} />}
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
                </div>
                <div className="mt-4 space-y-2">
                    <div className="w-full bg-gray-700 rounded-full h-2">
                        <div className="bg-cyan-500 h-2 rounded-full" style={{ width: `${progressPercentage}%` }}></div>
                    </div>
                    <div className="flex justify-between text-sm text-gray-400">
                        <span>{formatTime(progress)}</span>
                        <span>{formatTime(song.duration)}</span>
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