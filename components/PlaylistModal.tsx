
import React from 'react';
import { SpotifyPlaylist, Song } from '../types.ts';

interface PlaylistModalProps {
  playlists: SpotifyPlaylist[];
  onSelectPlaylist: (songs: Song[], name: string) => void;
  onClose: () => void;
  onShowImport: () => void;
}

const PlaylistModal: React.FC<PlaylistModalProps> = ({ playlists, onSelectPlaylist, onClose, onShowImport }) => {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
      <div className="bg-gray-800 rounded-lg shadow-2xl max-w-2xl w-full max-h-[80vh] flex flex-col border border-purple-500/50">
        <div className="p-4 border-b border-gray-700 flex justify-between items-center">
          <h2 className="text-2xl font-bold text-purple-400">Choose Your Playlist</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-white text-3xl leading-none">&times;</button>
        </div>
        <div className="p-6 overflow-y-auto">
          <ul className="space-y-3">
            {playlists.map((playlist) => (
              <li
                key={playlist.id}
                onClick={() => onSelectPlaylist(playlist.songs, playlist.name)}
                className="flex items-center gap-4 p-3 rounded-md transition-all duration-300 bg-gray-700/50 hover:bg-purple-500/20 cursor-pointer"
              >
                <div className="w-12 h-12 bg-gray-600 rounded-md flex items-center justify-center">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2z" />
                    </svg>
                </div>
                <div className="flex-1 overflow-hidden">
                  <p className="font-semibold truncate text-white">{playlist.name}</p>
                  <p className="text-sm text-gray-400 truncate">{playlist.songs.length} songs</p>
                </div>
              </li>
            ))}
          </ul>
           {playlists.length === 0 && (
                <p className="text-center text-gray-500 py-8">No playlists generated yet. Try describing a vibe!</p>
            )}
        </div>
        <div className="p-4 border-t border-gray-700 flex justify-end items-center">
            <button
                onClick={onShowImport}
                className="bg-cyan-600 hover:bg-cyan-700 text-white font-bold py-2 px-4 rounded-md transition-colors flex items-center gap-2"
            >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              Import from Text
            </button>
        </div>
      </div>
    </div>
  );
};

export default PlaylistModal;