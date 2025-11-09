import React, { useState } from 'react';
import { SoundEffect } from '../types';
import { LoadingIcon } from '../constants';

interface ControlsProps {
  isPlaying: boolean;
  onPlayPause: () => void;
  onNext: () => void;
  onSoundEffect: (effect: SoundEffect) => void;
  isAutoSuggestOn: boolean;
  onAutoSuggestToggle: () => void;
  isSoundEffectsOn: boolean;
  onSoundEffectsToggle: () => void;
  soundEffectVolume: number;
  onSoundEffectVolumeChange: (volume: number) => void;
  isVisualizerOn: boolean;
  onVisualizerToggle: () => void;
  isRecording: boolean;
  onRecordToggle: () => void;
  onRequestSubmit: (request: string) => void;
  isLoading: { commentary: boolean; suggestion: boolean; request: boolean; };
  soundEffects: SoundEffect[];
}

const ControlSection: React.FC<{ title: string; children: React.ReactNode }> = ({ title, children }) => (
    <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
        <h4 className="font-bold text-purple-400 mb-3">{title}</h4>
        {children}
    </div>
);


const Controls: React.FC<ControlsProps> = (props) => {
    const { 
        isPlaying, onPlayPause, onNext, onSoundEffect, 
        isAutoSuggestOn, onAutoSuggestToggle,
        isSoundEffectsOn, onSoundEffectsToggle,
        soundEffectVolume, onSoundEffectVolumeChange,
        isVisualizerOn, onVisualizerToggle,
        isRecording, onRecordToggle, 
        onRequestSubmit, isLoading, soundEffects 
    } = props;

  const [request, setRequest] = useState('');

  const handleRequestSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (request.trim()) {
      onRequestSubmit(request);
      setRequest('');
    }
  };

  return (
    <div className="space-y-4">
        {/* Playback */}
        <ControlSection title="Playback">
             <div className="flex items-center space-x-4">
                <button onClick={onPlayPause} className="bg-cyan-600 hover:bg-cyan-700 text-white font-bold p-4 rounded-full transition-transform transform hover:scale-110">
                    {isPlaying ? (
                         <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zM7 8a1 1 0 012 0v4a1 1 0 11-2 0V8zm4 0a1 1 0 012 0v4a1 1 0 11-2 0V8z" clipRule="evenodd" /></svg>
                    ) : (
                         <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" /></svg>
                    )}
                </button>
                <button onClick={onNext} className="flex-1 bg-purple-600 hover:bg-purple-700 text-white font-bold py-4 px-6 rounded-full transition-transform transform hover:scale-105 text-lg flex items-center justify-center gap-2">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" viewBox="0 0 20 20" fill="currentColor"><path d="M4.555 5.168A1 1 0 003 6v8a1 1 0 001.555.832L10 11.168V14a1 1 0 001.555.832l6-4a1 1 0 000-1.664l-6-4A1 1 0 0010 6v2.832L4.555 5.168z" /></svg>
                    Mix Next
                </button>
            </div>
        </ControlSection>

        {/* Sound Effects */}
        <ControlSection title="Sound FX">
            <div className={`grid grid-cols-3 gap-2 ${!isSoundEffectsOn ? 'opacity-50' : ''}`}>
                {soundEffects.map(effect => (
                    <button 
                        key={effect.id} 
                        onClick={() => onSoundEffect(effect)} 
                        className="bg-gray-700 hover:bg-purple-600 rounded-md p-2 text-2xl transition-colors disabled:cursor-not-allowed disabled:hover:bg-gray-700"
                        disabled={!isSoundEffectsOn}
                        aria-label={`Play ${effect.name} sound effect`}
                    >
                        {effect.emoji}
                    </button>
                ))}
            </div>
            <div className={`mt-3 flex items-center gap-2 ${!isSoundEffectsOn ? 'opacity-50' : ''}`}>
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
                </svg>
                <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.05"
                    value={soundEffectVolume}
                    onChange={(e) => onSoundEffectVolumeChange(parseFloat(e.target.value))}
                    disabled={!isSoundEffectsOn}
                    className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-cyan-500 disabled:cursor-not-allowed"
                    aria-label="Sound effect volume"
                />
            </div>
        </ControlSection>

        {/* Request Song */}
        <ControlSection title="Request a Song">
            <form onSubmit={handleRequestSubmit} className="flex gap-2">
                <input
                    type="text"
                    value={request}
                    onChange={(e) => setRequest(e.target.value)}
                    placeholder="e.g., 'Something funky'"
                    className="flex-grow bg-gray-900 border border-gray-600 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-cyan-500"
                    disabled={isLoading.request}
                />
                <button type="submit" className="bg-cyan-600 hover:bg-cyan-700 px-4 py-2 rounded-md font-semibold flex items-center justify-center" disabled={isLoading.request}>
                    {isLoading.request ? <LoadingIcon/> : 'Go'}
                </button>
            </form>
        </ControlSection>
        
        {/* Settings */}
        <ControlSection title="Settings">
            <div className="space-y-4">
                <div className="flex items-center justify-between">
                    <label htmlFor="sound-fx-toggle" className="font-semibold">
                        Sound FX
                    </label>
                    <button 
                        id="sound-fx-toggle"
                        onClick={onSoundEffectsToggle} 
                        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${isSoundEffectsOn ? 'bg-cyan-500' : 'bg-gray-600'}`}
                        aria-pressed={isSoundEffectsOn}
                    >
                        <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${isSoundEffectsOn ? 'translate-x-6' : 'translate-x-1'}`}/>
                    </button>
                </div>
                 <div className="flex items-center justify-between">
                    <label htmlFor="visualizer-toggle" className="font-semibold">
                        Visualizer
                    </label>
                    <button 
                        id="visualizer-toggle"
                        onClick={onVisualizerToggle} 
                        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${isVisualizerOn ? 'bg-cyan-500' : 'bg-gray-600'}`}
                        aria-pressed={isVisualizerOn}
                    >
                        <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${isVisualizerOn ? 'translate-x-6' : 'translate-x-1'}`}/>
                    </button>
                </div>
                <div className="flex items-center justify-between">
                    <label htmlFor="auto-suggest" className="font-semibold flex items-center">
                        Add Similar Songs
                        {isLoading.suggestion && <span className="ml-2"><LoadingIcon/></span>}
                    </label>
                    <button id="auto-suggest" onClick={onAutoSuggestToggle} className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${isAutoSuggestOn ? 'bg-cyan-500' : 'bg-gray-600'}`} aria-pressed={isAutoSuggestOn}>
                        <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${isAutoSuggestOn ? 'translate-x-6' : 'translate-x-1'}`}/>
                    </button>
                </div>
                <button onClick={onRecordToggle} className={`w-full flex items-center justify-center gap-2 font-bold py-2 px-4 rounded-md transition-colors ${isRecording ? 'bg-red-600 hover:bg-red-700' : 'bg-purple-600 hover:bg-purple-700'}`}>
                    {isRecording ? (
                        <>
                            <span className="relative flex h-3 w-3"><span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75"></span><span className="relative inline-flex rounded-full h-3 w-3 bg-white"></span></span>
                            Stop Recording
                        </>
                    ) : (
                        <>
                           <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM7 9a1 1 0 000 2h6a1 1 0 100-2H7z" clipRule="evenodd" /></svg>
                           Record Mix
                        </>
                    )}
                </button>
            </div>
        </ControlSection>
    </div>
  );
};

export default Controls;