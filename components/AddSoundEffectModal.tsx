import React, { useState, useRef } from 'react';
import { LoadingIcon } from '../constants.tsx';

interface AddSoundEffectModalProps {
  onClose: () => void;
  onSave: (name: string, emoji: string, buffer: ArrayBuffer) => void;
}

const AddSoundEffectModal: React.FC<AddSoundEffectModalProps> = ({ onClose, onSave }) => {
  const [file, setFile] = useState<File | null>(null);
  const [emoji, setEmoji] = useState('🎶');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0];
    if (selectedFile) {
        if (selectedFile.size > 5 * 1024 * 1024) { // 5MB limit
            setError('File size cannot exceed 5MB.');
            setFile(null);
        } else if (!selectedFile.type.startsWith('audio/')) {
            setError('Please select a valid audio file.');
            setFile(null);
        } else {
            setFile(selectedFile);
            setError('');
        }
    }
  };

  const handleSave = () => {
    if (!file) {
      setError('Please select an audio file.');
      return;
    }
    if (!emoji.trim()) {
      setError('Please enter an emoji.');
      return;
    }
    
    setIsLoading(true);
    const reader = new FileReader();
    reader.onload = (e) => {
        const audioBuffer = e.target?.result as ArrayBuffer;
        if (audioBuffer) {
            onSave(file.name, emoji, audioBuffer);
        }
        setIsLoading(false);
    };
    reader.onerror = () => {
        setError('Failed to read the file.');
        setIsLoading(false);
    }
    reader.readAsArrayBuffer(file);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
      <div className="bg-gray-800 rounded-lg shadow-2xl max-w-md w-full border border-purple-500/50">
        <div className="p-4 border-b border-gray-700 flex justify-between items-center">
          <h2 className="text-xl font-bold text-purple-400">Add Custom Sound FX</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-white text-3xl leading-none">&times;</button>
        </div>
        <div className="p-6 space-y-4">
            <div>
                <label className="font-semibold text-gray-300 mb-2 block">1. Choose Audio File</label>
                 <button 
                    onClick={() => fileInputRef.current?.click()}
                    className="w-full text-left bg-gray-900 border border-gray-600 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-cyan-500"
                >
                    {file ? (
                        <span className="text-white truncate">{file.name}</span>
                    ) : (
                        <span className="text-gray-400">Click to select a file...</span>
                    )}
                </button>
                <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileChange}
                    accept="audio/*"
                    className="hidden"
                />
            </div>
            <div>
                <label htmlFor="emoji-input" className="font-semibold text-gray-300 mb-2 block">2. Assign an Emoji</label>
                <input
                    id="emoji-input"
                    type="text"
                    value={emoji}
                    onChange={(e) => setEmoji(e.target.value)}
                    placeholder="e.g., ✨"
                    maxLength={2}
                    className="w-full bg-gray-900 border border-gray-600 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-cyan-500 text-center text-2xl"
                />
            </div>
             {error && <p className="text-red-400 text-sm text-center">{error}</p>}
        </div>
        <div className="p-4 border-t border-gray-700 flex justify-end items-center gap-4">
          <button onClick={onClose} className="bg-gray-600 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded-md transition-colors">
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={!file || isLoading}
            className="bg-cyan-600 hover:bg-cyan-700 text-white font-bold py-2 px-4 rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            {isLoading ? <LoadingIcon /> : null}
            Save Effect
          </button>
        </div>
      </div>
    </div>
  );
};

export default AddSoundEffectModal;