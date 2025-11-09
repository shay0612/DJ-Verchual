import React, { useState, useMemo, useRef } from 'react';
import { Song } from '../types.ts';

interface PlaylistProps {
  songs: Song[];
  currentSongId: string;
  onReorder: (newOrder: Song[]) => void;
  onRemove: (songId: string) => void;
  history: Song[];
  lastRemovedSong: { song: Song; index: number } | null;
  onUndoRemove: () => void;
}

// Sub-component to highlight search term matches
const Highlight: React.FC<{ text: string; highlight: string }> = ({ text, highlight }) => {
    if (!highlight.trim()) {
        return <span>{text}</span>;
    }
    const keywords = highlight.trim().split(' ').filter(k => k).map(k => k.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&'));
    const regex = new RegExp(`(${keywords.join('|')})`, 'gi');
    const parts = text.split(regex);

    return (
        <span>
            {parts.map((part, i) =>
                regex.test(part) ? (
                    <strong key={i} className="text-cyan-400 font-bold bg-cyan-900/50 rounded-sm px-0.5">
                        {part}
                    </strong>
                ) : (
                    part
                )
            )}
        </span>
    );
};

const Playlist: React.FC<PlaylistProps> = ({ songs, currentSongId, onReorder, onRemove, history, lastRemovedSong, onUndoRemove }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [activeView, setActiveView] = useState<'queue' | 'history'>('queue');
  const dragItem = useRef<number | null>(null);
  const dragOverItem = useRef<number | null>(null);
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);

  // Swipe state
  const [swipeState, setSwipeState] = useState<{ id: string; x: number; isAnimating: boolean } | null>(null);
  const pointerStartRef = useRef<{ x: number } | null>(null);
  const SWIPE_THRESHOLD = -80;


  const displaySongs = useMemo(() => {
    const currentSongIndex = songs.findIndex(s => s.id === currentSongId);
    if (currentSongIndex === -1) return [];
    return [...songs.slice(currentSongIndex), ...songs.slice(0, currentSongIndex)];
  }, [songs, currentSongId]);

  const filteredSongs = useMemo(() => {
    const term = searchTerm.trim().toLowerCase();
    if (!term) return displaySongs;

    const keywords = term.split(' ').filter(k => k);
    
    return displaySongs.filter((song, index) => {
        if (index === 0) return true;
        const songText = `${song.title} ${song.artist}`.toLowerCase();
        return keywords.every(keyword => songText.includes(keyword));
    });
  }, [displaySongs, searchTerm]);

  const isReorderingDisabled = searchTerm.length > 0 || activeView === 'history';

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const handleDragStart = (e: React.DragEvent<HTMLDivElement>, index: number) => {
    dragItem.current = index;
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', ''); // For Firefox compatibility
  };
  
  const handleDragEnter = (e: React.DragEvent<HTMLLIElement>, index: number) => {
    e.preventDefault();
    if (dragItem.current === index || index === 0) return;
    dragOverItem.current = index;
    setDragOverIndex(index);
  };
  
  const handleDragLeave = () => {
    setDragOverIndex(null);
  };

  const handleDrop = () => {
    if (dragItem.current === null || dragOverItem.current === null) return;
    
    const newSongs = [...displaySongs];
    const draggedItemContent = newSongs.splice(dragItem.current, 1)[0];
    newSongs.splice(dragOverItem.current, 0, draggedItemContent);
    
    onReorder(newSongs);

    dragItem.current = null;
    dragOverItem.current = null;
    setDragOverIndex(null);
  };

  const handleDragEnd = () => {
    dragItem.current = null;
    dragOverItem.current = null;
    setDragOverIndex(null);
  };

  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>, songId: string) => {
    if (dragItem.current !== null) return;
    pointerStartRef.current = { x: e.clientX };
    setSwipeState({ id: songId, x: 0, isAnimating: false });
    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
      if (!pointerStartRef.current || !swipeState || dragItem.current !== null) return;
      const deltaX = e.clientX - pointerStartRef.current.x;
      const newX = Math.min(0, deltaX); // Only allow swiping left
      setSwipeState({ ...swipeState, x: newX });
  };

  const handlePointerUp = (e: React.PointerEvent<HTMLDivElement>) => {
      if (!pointerStartRef.current || !swipeState) return;
      
      if (swipeState.x < SWIPE_THRESHOLD) {
          // Animate out and remove
          setSwipeState({ ...swipeState, x: -e.currentTarget.offsetWidth, isAnimating: true });
          setTimeout(() => {
              onRemove(swipeState.id);
              setSwipeState(null);
          }, 300);
      } else {
          // Animate back to original position
          setSwipeState({ ...swipeState, x: 0, isAnimating: true });
          setTimeout(() => setSwipeState(null), 200);
      }
      
      pointerStartRef.current = null;
      (e.currentTarget as HTMLElement).releasePointerCapture(e.pointerId);
  };

  return (
    <div className="bg-gray-800 rounded-lg shadow-lg p-4 border border-gray-700 h-full max-h-[calc(100vh-200px)] flex flex-col">
      <div className="shrink-0 mb-4">
        <div className="flex border-b border-gray-700">
          <button
            onClick={() => setActiveView('queue')}
            className={`flex-1 font-bold py-2 text-center transition-colors ${activeView === 'queue' ? 'text-purple-400 border-b-2 border-purple-400' : 'text-gray-500 hover:text-gray-300'}`}
          >
            Up Next
          </button>
          <button
            onClick={() => setActiveView('history')}
            className={`flex-1 font-bold py-2 text-center transition-colors ${activeView === 'history' ? 'text-purple-400 border-b-2 border-purple-400' : 'text-gray-500 hover:text-gray-300'}`}
          >
            History ({history.length})
          </button>
        </div>
      </div>
      
      {activeView === 'queue' && (
        <div className="relative mb-4 shrink-0">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            </div>
            <input
            type="text"
            placeholder="Search playlist..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-gray-900 border border-gray-600 rounded-md pl-10 pr-10 py-2 focus:outline-none focus:ring-2 focus:ring-cyan-500"
            />
            {searchTerm && (
                <button
                    onClick={() => setSearchTerm('')}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center"
                    aria-label="Clear search"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400 hover:text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                </button>
            )}
        </div>
      )}

      {activeView === 'queue' && lastRemovedSong && (
        <div className="shrink-0 mb-4 p-2.5 bg-gray-900 rounded-md flex items-center justify-between border border-cyan-500/30">
            <p className="text-sm text-gray-300 truncate pr-2">
            Removed <span className="font-semibold text-white">{lastRemovedSong.song.title}</span>
            </p>
            <button
            onClick={onUndoRemove}
            className="font-bold text-cyan-400 hover:text-cyan-300 text-sm flex-shrink-0 uppercase tracking-wider"
            >
            Undo
            </button>
        </div>
      )}

      <div className="overflow-y-auto">
        {activeView === 'queue' ? (
            <ul 
                className="space-y-3" 
                onDragLeave={handleDragLeave} 
                onDrop={!isReorderingDisabled ? handleDrop : undefined}
                onDragOver={(e) => e.preventDefault()}
            >
                {filteredSongs.map((song) => {
                    const originalIndex = displaySongs.findIndex(s => s.id === song.id);
                    const isCurrent = originalIndex === 0;

                    const isBeingSwiped = swipeState?.id === song.id;
                    const translateX = isBeingSwiped ? swipeState.x : 0;
                    const transition = isBeingSwiped && swipeState.isAnimating ? 'transform 0.2s ease-out' : 'none';
                    const swipeProgress = isBeingSwiped ? Math.min(Math.abs(swipeState.x) / Math.abs(SWIPE_THRESHOLD), 1) : 0;

                    return (
                    <li
                        key={song.id}
                        onDragEnter={!isReorderingDisabled && !isCurrent ? (e) => handleDragEnter(e, originalIndex) : undefined}
                        onDragOver={(e) => e.preventDefault()}
                        className={`relative rounded-md overflow-hidden transition-opacity ${dragItem.current === originalIndex ? 'opacity-50' : ''}`}
                        style={{
                            backgroundColor: isBeingSwiped ? `rgba(220, 38, 38, ${swipeProgress * 0.9})` : 'transparent', // Tailwind red-600
                            transition: isBeingSwiped && swipeState.isAnimating ? 'background-color 0.2s ease-out, opacity 0.2s' : 'opacity 0.2s'
                        }}
                    >
                         <div className="absolute inset-0 flex items-center justify-end px-6 pointer-events-none">
                            <svg 
                                style={{ 
                                    opacity: swipeProgress, 
                                    transform: `scale(${swipeProgress})`,
                                    transition: isBeingSwiped && swipeState.isAnimating ? 'opacity 0.2s ease-out, transform 0.2s ease-out' : 'none'
                                }}
                                xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                        </div>
                        {dragOverIndex === originalIndex && <div className="absolute top-0 left-0 right-0 h-1 bg-cyan-400 rounded-full" />}
                        <div
                            style={{ transform: `translateX(${translateX}px)`, transition }}
                            onPointerDown={isCurrent || isReorderingDisabled ? undefined : (e) => handlePointerDown(e, song.id)}
                            onPointerMove={isCurrent || isReorderingDisabled ? undefined : handlePointerMove}
                            onPointerUp={isCurrent || isReorderingDisabled ? undefined : handlePointerUp}
                            onPointerCancel={isCurrent || isReorderingDisabled ? undefined : handlePointerUp}
                            className={`relative flex items-center gap-2 rounded-md transition-all duration-300
                            ${ isCurrent ? 'bg-purple-500/20' : 'bg-gray-700/50' }
                            `}
                        >
                            {!isCurrent && !isReorderingDisabled ? (
                                <div
                                    draggable
                                    onDragStart={(e) => { e.stopPropagation(); handleDragStart(e, originalIndex); }}
                                    onDragEnd={(e) => { e.stopPropagation(); handleDragEnd(); }}
                                    onPointerDown={(e) => e.stopPropagation()} // Prevents swipe from starting
                                    className="cursor-grab p-3 text-gray-500 hover:text-white touch-none"
                                    aria-label="Drag to reorder"
                                >
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16" />
                                    </svg>
                                </div>
                            ) : (
                                <div className="w-11 h-11 flex-shrink-0" /> // Placeholder for alignment
                            )}
                            
                            <div className={`flex-1 flex items-center gap-4 p-2 pl-0 ${isCurrent ? 'border-l-4 border-purple-500' : ''}`}>
                                <img src={song.albumArt} alt={song.title} className="w-12 h-12 rounded-md object-cover flex-shrink-0" />
                                <div className="flex-1 overflow-hidden">
                                    <p className={`font-semibold truncate ${isCurrent ? 'text-white' : 'text-gray-300'}`}>
                                        <Highlight text={song.title} highlight={searchTerm} />
                                    </p>
                                    <p className="text-sm text-gray-400 truncate">
                                        <Highlight text={song.artist} highlight={searchTerm} />
                                    </p>
                                </div>
                                <a href={song.spotifyUrl} target="_blank" rel="noopener noreferrer" title="Find on Spotify" className="text-gray-500 hover:text-green-400 transition-colors p-1">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor">
                                        <path d="M12 2C6.477 2 2 6.477 2 12s4.477 10 10 10 10-4.477 10-10S17.523 2 12 2zm4.441 14.544c-.2.312-.612.413-.924.212-2.586-1.58-5.83-1.943-9.72-1.066-.375.084-.688-.163-.772-.538-.084-.375.163-.688.538-.772 4.225-.945 7.81- .538 10.662 1.23.312.2.413.612.212.924zm.843-2.836c-.25.388-.75.513-1.138.263-2.937-1.787-7.387-2.312-10.937-1.275-.45.125-.9-.163-1.025-.613s.163-.9.613-1.025c3.95-1.125 8.788-.55 12.088 1.463.387.25.512.75.262 1.137zm.1-3.237C13.2 8.35 8.363 8.163 4.95 9.213c-.513.15-.988-.187-1.138-.7s.188-.988.7-1.138c3.812-1.162 9.2-1.362 13.562 1.1.45.263.613.825.35 1.275-.262.45-.825.613-1.275.35z" />
                                    </svg>
                                </a>
                                <span className="text-sm text-gray-400 px-2">{formatTime(song.duration)}</span>
                                {isCurrent && <span className="text-xs font-bold text-cyan-400 animate-pulse mr-2">PLAYING</span>}
                            </div>
                        </div>
                        {dragOverIndex === originalIndex && <div className="absolute bottom-0 left-0 right-0 h-1 bg-cyan-400 rounded-full" />}
                    </li>
                    )
                })}
            </ul>
        ) : (
             <ul className="space-y-3">
                {history.length > 0 ? history.map(song => (
                <li key={`${song.id}-history`} className="flex items-center gap-4 p-2 rounded-md bg-gray-700/50 opacity-80">
                    <img src={song.albumArt} alt={song.title} className="w-12 h-12 rounded-md object-cover" />
                    <div className="flex-1 overflow-hidden">
                    <p className="font-semibold truncate text-gray-400">{song.title}</p>
                    <p className="text-sm text-gray-500 truncate">{song.artist}</p>
                    </div>
                    <a href={song.spotifyUrl} target="_blank" rel="noopener noreferrer" title="Find on Spotify" className="text-gray-500 hover:text-green-400 transition-colors p-1">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M12 2C6.477 2 2 6.477 2 12s4.477 10 10 10 10-4.477 10-10S17.523 2 12 2zm4.441 14.544c-.2.312-.612.413-.924.212-2.586-1.58-5.83-1.943-9.72-1.066-.375.084-.688-.163-.772-.538-.084-.375.163-.688.538-.772 4.225-.945 7.81- .538 10.662 1.23.312.2.413.612.212.924zm.843-2.836c-.25.388-.75.513-1.138.263-2.937-1.787-7.387-2.312-10.937-1.275-.45.125-.9-.163-1.025-.613s.163-.9.613-1.025c3.95-1.125 8.788-.55 12.088 1.463.387.25.512.75.262 1.137zm.1-3.237C13.2 8.35 8.363 8.163 4.95 9.213c-.513.15-.988-.187-1.138-.7s.188-.988.7-1.138c3.812-1.162 9.2-1.362 13.562 1.1.45.263.613.825.35 1.275-.262.45-.825.613-1.275.35z" />
                        </svg>
                    </a>
                    <span className="text-sm text-gray-500">{formatTime(song.duration)}</span>
                </li>
                )) : (
                <p className="text-center text-gray-500 py-4">No songs have been played yet.</p>
                )}
            </ul>
        )}

        {isReorderingDisabled && activeView === 'queue' && filteredSongs.length > 1 && (
            <p className="text-center text-xs text-gray-500 pt-4">Clear search to reorder queue.</p>
        )}
        {activeView === 'queue' && filteredSongs.length <= 1 && searchTerm && (
          <p className="text-center text-gray-500 py-4">No other songs found.</p>
        )}
      </div>
    </div>
  );
};

export default Playlist;