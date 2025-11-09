import React, { useState, useMemo, useRef } from 'react';
import { Song } from '../types';

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
    if (swipeState) return;
    dragItem.current = index;
    e.dataTransfer.effectAllowed = 'move';
  };
  
  const handleDragEnter = (e: React.DragEvent<HTMLDivElement>, index: number) => {
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

  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>, songId: string, isCurrent: boolean) => {
    if (isCurrent || isReorderingDisabled || dragItem.current !== null) return;
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
      
      const SWIPE_THRESHOLD = -80; // px
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
            <ul className="space-y-3" onDragLeave={handleDragLeave}>
                {filteredSongs.map((song) => {
                    const originalIndex = displaySongs.findIndex(s => s.id === song.id);
                    const isCurrent = originalIndex === 0;

                    const isBeingSwiped = swipeState?.id === song.id;
                    const translateX = isBeingSwiped ? swipeState.x : 0;
                    const transition = isBeingSwiped && swipeState.isAnimating ? 'transform 0.2s ease-out' : 'none';

                    return (
                    <li
                        key={song.id}
                        className={`relative rounded-md overflow-hidden ${dragItem.current === originalIndex ? 'opacity-50' : ''}`}
                    >
                        <div className="absolute inset-0 bg-red-600 flex items-center justify-end px-6 rounded-md">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                        </div>

                        <div
                            style={{ transform: `translateX(${translateX}px)`, transition, touchAction: isReorderingDisabled || isCurrent ? 'auto' : 'pan-y' }}
                            onPointerDown={(e) => handlePointerDown(e, song.id, isCurrent)}
                            onPointerMove={handlePointerMove}
                            onPointerUp={handlePointerUp}
                            onPointerCancel={handlePointerUp}
                            draggable={!isReorderingDisabled && !isCurrent && !swipeState}
                            onDragStart={!isReorderingDisabled && !isCurrent ? (e) => handleDragStart(e, originalIndex) : undefined}
                            onDragEnter={!isReorderingDisabled && !isCurrent ? (e) => handleDragEnter(e, originalIndex) : undefined}
                            onDragOver={(e) => e.preventDefault()}
                            onDrop={!isReorderingDisabled ? handleDrop : undefined}
                            onDragEnd={!isReorderingDisabled ? handleDragEnd : undefined}
                            className={`relative flex items-center gap-4 p-2 rounded-md transition-all duration-300
                            ${ isCurrent ? 'bg-purple-500/20 border-l-4 border-purple-500' : 'bg-gray-700/50' }
                            ${ !isReorderingDisabled && !isCurrent && !swipeState ? 'cursor-grab' : '' }
                            `}
                        >
                            {dragOverIndex === originalIndex && <div className="absolute top-0 left-0 right-0 h-1 bg-cyan-400 rounded-full" />}
                            <img src={song.albumArt} alt={song.title} className="w-12 h-12 rounded-md object-cover" />
                            <div className="flex-1 overflow-hidden">
                                <p className={`font-semibold truncate ${isCurrent ? 'text-white' : 'text-gray-300'}`}>
                                    <Highlight text={song.title} highlight={searchTerm} />
                                </p>
                                <p className="text-sm text-gray-400 truncate">
                                    <Highlight text={song.artist} highlight={searchTerm} />
                                </p>
                            </div>
                            <span className="text-sm text-gray-400">{formatTime(song.duration)}</span>
                            {isCurrent && <span className="text-xs font-bold text-cyan-400 animate-pulse ml-2">PLAYING</span>}
                            {dragOverIndex === originalIndex && <div className="absolute bottom-0 left-0 right-0 h-1 bg-cyan-400 rounded-full" />}
                        </div>
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