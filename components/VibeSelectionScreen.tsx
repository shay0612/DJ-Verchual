import React, { useState } from 'react';
import { LoadingIcon } from '../constants';

interface VibeSelectionScreenProps {
  onGenerate: (vibe: string) => void;
  isLoading: boolean;
  onSkip: () => void;
}

const VibeSelectionScreen: React.FC<VibeSelectionScreenProps> = ({ onGenerate, isLoading, onSkip }) => {
  const [vibe, setVibe] = useState('');
  const vibeSuggestions = [
    '90s hip-hop house party',
    'Chill indie coffee shop',
    'High-energy EDM festival',
    '80s rock anthems',
    'Modern pop singalongs',
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (vibe.trim()) {
      onGenerate(vibe);
    }
  };
  
  const handleSuggestionClick = (suggestion: string) => {
    setVibe(suggestion);
    onGenerate(suggestion);
  };

  return (
    <div className="bg-gray-900 text-white min-h-screen font-sans flex flex-col items-center justify-center p-4">
      <div className="text-center max-w-2xl w-full">
        <h1 className="text-4xl md:text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-500 to-purple-500 mb-4">
          What's the Vibe?
        </h1>
        <p className="text-lg text-gray-400 mb-8">
          Describe the kind of party you're throwing, and DJ Verchual will curate the perfect playlists for you.
        </p>

        {isLoading ? (
          <div className="flex flex-col items-center justify-center h-40">
            <LoadingIcon />
            <p className="mt-4 text-purple-300">Curating your playlists...</p>
          </div>
        ) : (
          <>
            <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-2 mb-6">
              <input
                type="text"
                value={vibe}
                onChange={(e) => setVibe(e.target.value)}
                placeholder="e.g., 'A summer beach party with funky grooves'"
                className="flex-grow bg-gray-800 border border-gray-600 rounded-md px-4 py-3 focus:outline-none focus:ring-2 focus:ring-cyan-500 text-lg"
                required
              />
              <button type="submit" className="bg-cyan-600 hover:bg-cyan-700 text-white font-bold py-3 px-6 rounded-md text-lg transition-transform transform hover:scale-105">
                Generate
              </button>
            </form>
            <div>
              <p className="text-gray-500 mb-3">Or try one of these:</p>
              <div className="flex flex-wrap items-center justify-center gap-2">
                {vibeSuggestions.map(suggestion => (
                  <button
                    key={suggestion}
                    onClick={() => handleSuggestionClick(suggestion)}
                    className="bg-gray-700/50 hover:bg-gray-700 text-purple-300 font-semibold py-2 px-4 rounded-full border border-purple-500/30 transition-colors"
                  >
                    {suggestion}
                  </button>
                ))}
              </div>
            </div>
            <div className="mt-12">
                <button
                    onClick={onSkip}
                    className="text-gray-500 hover:text-cyan-400 font-semibold transition-colors group"
                >
                    Skip and use my Spotify playlists <span className="inline-block transition-transform group-hover:translate-x-1">&rarr;</span>
                </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default VibeSelectionScreen;