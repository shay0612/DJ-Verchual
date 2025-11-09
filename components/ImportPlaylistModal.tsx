import React, { useState } from 'react';
import { LoadingIcon } from '../constants.tsx';

interface ImportPlaylistModalProps {
  onClose: () => void;
  onGenerate: (text: string) => void;
  isLoading: boolean;
}

const ImportPlaylistModal: React.FC<ImportPlaylistModalProps> = ({ onClose, onGenerate, isLoading }) => {
    const [text, setText] = useState('');

    const handleSubmit = () => {
        if(text.trim() && !isLoading) {
            onGenerate(text);
        }
    };

    const exampleText = `My Awesome Mix\n1. Blinding Lights - The Weeknd\n\nOR a link like:\n\nhttps://open.spotify.com/playlist/37i9dQZF1DXcBWIGoYBM5M`;

    return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
      <div className="bg-gray-800 rounded-lg shadow-2xl max-w-2xl w-full max-h-[80vh] flex flex-col border border-cyan-500/50">
        <div className="p-4 border-b border-gray-700 flex justify-between items-center">
          <h2 className="text-2xl font-bold text-cyan-400">Import Playlist</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-white text-3xl leading-none">&times;</button>
        </div>
        <div className="p-6 overflow-y-auto space-y-4">
            <p className="text-gray-400">
                Paste your playlist text or a Spotify URL below. The AI will figure it out!
            </p>
            <textarea
                value={text}
                onChange={(e) => setText(e.target.value)}
                placeholder={`For example:\n\n${exampleText}`}
                className="w-full h-48 bg-gray-900 border border-gray-600 rounded-md p-3 focus:outline-none focus:ring-2 focus:ring-cyan-500 resize-y"
                disabled={isLoading}
            />
        </div>
        <div className="p-4 border-t border-gray-700 flex justify-end items-center gap-4">
           <button onClick={onClose} className="bg-gray-600 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded-md transition-colors">
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={!text.trim() || isLoading}
            className="bg-cyan-600 hover:bg-cyan-700 text-white font-bold py-2 px-4 rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            {isLoading ? <LoadingIcon /> : null}
            Generate Playlist
          </button>
        </div>
      </div>
    </div>
    );
};

export default ImportPlaylistModal;