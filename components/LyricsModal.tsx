import React from 'react';
import { Song } from '../types.ts';
import { LoadingIcon } from '../constants.tsx';

interface LyricsModalProps {
  song: Song;
  lyrics: string;
  isLoading: boolean;
  onClose: () => void;
}

const LyricsModal: React.FC<LyricsModalProps> = ({ song, lyrics, isLoading, onClose }) => {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
      <div className="bg-gray-800 rounded-lg shadow-2xl max-w-2xl w-full max-h-[80vh] flex flex-col border border-cyan-500/50">
        <div className="p-4 border-b border-gray-700 flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-bold text-cyan-400">Lyrics</h2>
            <p className="text-gray-400">{song.title} - {song.artist}</p>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-white text-3xl leading-none">&times;</button>
        </div>
        <div className="p-6 overflow-y-auto">
          {isLoading ? (
            <div className="flex justify-center items-center h-48">
              <LoadingIcon />
            </div>
          ) : (
            <p className="text-gray-300 whitespace-pre-wrap leading-relaxed">{lyrics}</p>
          )}
        </div>
        <div className="p-4 border-t border-gray-700 flex justify-end">
          <button
            onClick={onClose}
            className="bg-cyan-600 hover:bg-cyan-700 text-white font-bold py-2 px-4 rounded-md transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default LyricsModal;