
import React from 'react';

interface LoginScreenProps {
  onLogin: () => void;
}

const LoginScreen: React.FC<LoginScreenProps> = ({ onLogin }) => {
  return (
    <div className="bg-gray-900 text-white min-h-screen font-sans flex flex-col items-center justify-center">
      <div className="text-center">
        <div className="flex items-center justify-center mb-4">
            <span className="text-6xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-500 to-purple-500">
            DJ Verchual
            </span>
            <span className="text-6xl ml-4" role="img" aria-label="headphones">🎧</span>
        </div>
        <p className="text-xl text-gray-400 mb-8">Your personal AI-powered party DJ.</p>
        <button
          onClick={onLogin}
          className="bg-[#1DB954] hover:bg-[#1ED760] text-white font-bold py-4 px-8 rounded-full text-lg flex items-center transition-transform transform hover:scale-105"
        >
          <svg className="w-6 h-6 mr-3" fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm4.64 14.88c-.24.36-.68.48-1.04.24-2.88-1.76-6.48-2.16-10.6-1.16-.4.08-.8-.16-.88-.56-.08-.4.16-.8.56-.88 4.48-1.04 8.44-.6 11.64 1.28.36.24.48.68.24 1.08zm-1.2-3.12c-.28.44-.84.6-1.28.32-2.48-1.52-5.68-1.92-9.48-1.04-.48.12-.96-.16-1.08-.64-.12-.48.16-.96.64-1.08 4.16-.96 7.72-.52 10.56 1.2.44.28.6.84.32 1.28zm.04-3.32c-3-1.84-7.96-2.04-11.08-.96-.56.2-.84-.28-.64-.84.2-.56.84-.84 1.4-.64 3.48-1.2 8.84-.96 12.24 1.08.52.28.72.92.44 1.44-.28.52-.92.72-1.44.44z" />
          </svg>
          Login with Spotify
        </button>
      </div>
    </div>
  );
};

export default LoginScreen;
