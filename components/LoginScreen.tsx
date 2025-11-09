
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
          className="bg-cyan-600 hover:bg-cyan-700 text-white font-bold py-4 px-8 rounded-full text-lg flex items-center transition-transform transform hover:scale-105"
        >
           <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2z" />
            </svg>
          Start the Party
        </button>
      </div>
    </div>
  );
};

export default LoginScreen;
