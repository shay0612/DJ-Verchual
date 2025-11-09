import React, { useState } from 'react';
import { LoadingIcon } from '../constants.tsx';

interface SpotifyLoginModalProps {
  onAuthorize: () => void;
  onClose: () => void;
}

const SpotifyLoginModal: React.FC<SpotifyLoginModalProps> = ({ onAuthorize, onClose }) => {
  const [email, setEmail] = useState('dj.verchual@example.com');
  const [password, setPassword] = useState('••••••••••••');
  const [isAuthorizing, setIsAuthorizing] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // In a real app, you'd verify credentials here.
    // For this simulation, we'll just proceed.
    setIsAuthorizing(true);
    setTimeout(() => {
        onAuthorize();
    }, 1500);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
      <div className="bg-[#191414] text-white rounded-lg shadow-2xl max-w-md w-full border border-gray-700">
        <div className="p-8 text-center">
          <svg className="w-16 h-16 mx-auto mb-4" fill="#1DB954" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm4.64 14.88c-.24.36-.68.48-1.04.24-2.88-1.76-6.48-2.16-10.6-1.16-.4.08-.8-.16-.88-.56-.08-.4.16-.8.56-.88 4.48-1.04 8.44-.6 11.64 1.28.36.24.48.68.24 1.08zm-1.2-3.12c-.28.44-.84.6-1.28.32-2.48-1.52-5.68-1.92-9.48-1.04-.48.12-.96-.16-1.08-.64-.12-.48.16-.96.64-1.08 4.16-.96 7.72-.52 10.56 1.2.44.28.6.84.32 1.28zm.04-3.32c-3-1.84-7.96-2.04-11.08-.96-.56.2-.84-.28-.64-.84.2-.56.84-.84 1.4-.64 3.48-1.2 8.84-.96 12.24 1.08.52.28.72.92.44 1.44-.28.52-.92.72-1.44.44z" />
          </svg>
          <h2 className="text-2xl font-bold mb-2">Connect to Spotify</h2>
          <p className="text-gray-400 mb-6">Log in to allow <span className="font-bold text-white">DJ Verchual</span> to access your playlists.</p>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <input 
                type="text"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Email or username"
                className="w-full bg-gray-800 border border-gray-600 rounded-md px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#1DB954] disabled:opacity-50"
                required
                aria-label="Email or username"
                disabled={isAuthorizing}
              />
            </div>
            <div>
              <input 
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Password"
                className="w-full bg-gray-800 border border-gray-600 rounded-md px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#1DB954] disabled:opacity-50"
                required
                aria-label="Password"
                disabled={isAuthorizing}
              />
            </div>
            <button 
              type="submit" 
              className="w-full bg-[#1DB954] hover:bg-[#1ED760] text-white font-bold py-3 px-4 rounded-full text-lg transition-transform transform hover:scale-105 flex items-center justify-center disabled:opacity-75 disabled:cursor-not-allowed"
              disabled={isAuthorizing}
            >
              {isAuthorizing ? (
                <>
                  <LoadingIcon />
                  <span className="ml-2">Connecting...</span>
                </>
              ) : (
                'Log In & Authorize'
              )}
            </button>
          </form>
          
          <button onClick={onClose} className="mt-4 text-gray-400 hover:text-white font-semibold disabled:opacity-50" disabled={isAuthorizing}>
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};

export default SpotifyLoginModal;