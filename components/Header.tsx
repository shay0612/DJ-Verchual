import React from 'react';

interface HeaderProps {
    isLoggedIn: boolean;
    onChangePlaylist: () => void;
    onUploadMix: () => void;
    onLogout: () => void;
}

const Header: React.FC<HeaderProps> = ({ isLoggedIn, onChangePlaylist, onUploadMix, onLogout }) => {
  return (
    <header className="bg-gray-900/50 backdrop-blur-sm border-b border-purple-500/20 sticky top-0 z-10">
      <div className="container mx-auto px-4 py-4 flex items-center justify-between">
        <div className="flex items-center">
            <span className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-500 to-purple-500">
            DJ Verchual
            </span>
            <span className="text-3xl ml-2" role="img" aria-label="headphones">🎧</span>
        </div>
        {isLoggedIn && (
            <div className="flex items-center gap-4">
                <button
                    onClick={onUploadMix}
                    className="bg-gray-700 hover:bg-gray-600 text-white font-semibold py-2 px-4 rounded-md transition-colors text-sm flex items-center gap-2"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                    </svg>
                    Upload Mix
                </button>
                <button
                    onClick={onChangePlaylist}
                    className="bg-purple-600 hover:bg-purple-700 text-white font-semibold py-2 px-4 rounded-md transition-colors text-sm flex items-center gap-2"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                    </svg>
                    Change Playlist
                </button>
                 <button
                    onClick={onLogout}
                    className="bg-gray-600 hover:bg-red-600 text-white font-semibold py-2 px-4 rounded-md transition-colors text-sm flex items-center gap-2"
                    aria-label="Logout"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                    </svg>
                    Logout
                </button>
            </div>
        )}
      </div>
    </header>
  );
};

export default Header;