import React, { useState, useEffect, useCallback } from 'react';
import { SeededRandom, getDailySeed, getPuzzleNumber, getRanking, formatTime } from '../utils/gameLogic';
import { PuzzleState } from '../types';
import { Modal } from './Modal';

interface FifteenPuzzleProps {
  mode: 'DAILY' | 'BLITZ';
}

export const FifteenPuzzle: React.FC<FifteenPuzzleProps> = ({ mode }) => {
  const [gameState, setGameState] = useState<PuzzleState>({
    grid: [],
    emptyIndex: 15,
    moves: 0,
    isComplete: false,
    startTime: null,
    endTime: null,
  });
  const [showWinModal, setShowWinModal] = useState(false);

  const gridSize = mode === 'DAILY' ? 4 : 3;
  const targetSize = gridSize * gridSize;

  // Initialize or Load Game
  useEffect(() => {
    const seed = mode === 'DAILY' ? getDailySeed() : Date.now();
    const storageKey = mode === 'DAILY' ? `daily15_${seed}` : null;
    
    // Try loading daily from storage
    if (storageKey) {
      const saved = localStorage.getItem(storageKey);
      if (saved) {
        setGameState(JSON.parse(saved));
        return;
      }
    }

    // Initialize new game
    const rng = new SeededRandom(seed);
    const newGrid = Array.from({ length: targetSize - 1 }, (_, i) => i + 1) as (number | null)[];
    newGrid.push(null);
    
    let currentGrid = [...newGrid];
    let emptyIdx = targetSize - 1;

    // Shuffle by simulating valid moves to ensure solvability
    // Daily needs more complexity (more shuffles)
    const shuffleMoves = mode === 'DAILY' ? 250 : 50;
    let lastMoveIndex = -1;

    for (let i = 0; i < shuffleMoves; i++) {
      const validMoves = [];
      const row = Math.floor(emptyIdx / gridSize);
      const col = emptyIdx % gridSize;

      // Check Up, Down, Left, Right
      if (row > 0) validMoves.push(emptyIdx - gridSize);
      if (row < gridSize - 1) validMoves.push(emptyIdx + gridSize);
      if (col > 0) validMoves.push(emptyIdx - 1);
      if (col < gridSize - 1) validMoves.push(emptyIdx + 1);

      // Avoid immediate undo
      const filteredMoves = validMoves.filter(m => m !== lastMoveIndex);
      const move = filteredMoves.length > 0 
        ? filteredMoves[Math.floor(rng.next() * filteredMoves.length)]
        : validMoves[0];

      currentGrid[emptyIdx] = currentGrid[move];
      currentGrid[move] = null;
      lastMoveIndex = emptyIdx;
      emptyIdx = move;
    }

    setGameState({
      grid: currentGrid,
      emptyIndex: emptyIdx,
      moves: 0,
      isComplete: false,
      startTime: null,
      endTime: null,
    });
  }, [mode, gridSize, targetSize]);

  // Save Progress
  useEffect(() => {
    if (mode === 'DAILY' && gameState.grid.length > 0) {
      const seed = getDailySeed();
      localStorage.setItem(`daily15_${seed}`, JSON.stringify(gameState));
    }
  }, [gameState, mode]);

  const handleTileClick = useCallback((index: number) => {
    if (gameState.isComplete) return;

    const { emptyIndex, grid } = gameState;
    const row = Math.floor(index / gridSize);
    const col = index % gridSize;
    const emptyRow = Math.floor(emptyIndex / gridSize);
    const emptyCol = emptyIndex % gridSize;

    const isAdjacent = Math.abs(row - emptyRow) + Math.abs(col - emptyCol) === 1;

    if (isAdjacent) {
      const newGrid = [...grid];
      newGrid[emptyIndex] = newGrid[index];
      newGrid[index] = null;

      const isSolved = newGrid.slice(0, targetSize - 1).every((val, i) => val === i + 1);
      
      const newState = {
        ...gameState,
        grid: newGrid,
        emptyIndex: index,
        moves: gameState.moves + 1,
        startTime: gameState.startTime || Date.now(),
        isComplete: isSolved,
        endTime: isSolved ? Date.now() : null,
      };

      setGameState(newState);
      if (isSolved) setShowWinModal(true);
    }
  }, [gameState, gridSize, targetSize]);

  const puzzleNum = getPuzzleNumber();
  const ranking = getRanking(gameState.moves);
  const timeElapsed = (gameState.endTime && gameState.startTime) 
    ? gameState.endTime - gameState.startTime 
    : 0;

  return (
    <div className="flex flex-col items-center max-w-xl mx-auto w-full">
      <div className="w-full flex justify-between items-end mb-6 border-b border-border-subtle pb-4">
        <div>
          <h2 className="font-serif text-3xl text-ink font-bold">
            {mode === 'DAILY' ? 'The Fifteen' : 'Quick Blitz'}
          </h2>
          {mode === 'DAILY' && (
            <p className="font-sans text-sm text-ink-light tracking-wide uppercase mt-1">
              No. {puzzleNum}
            </p>
          )}
        </div>
        <div className="text-right font-sans">
          <div className="text-sm text-ink-light uppercase tracking-wider">Moves</div>
          <div className="text-2xl font-light text-ink tabular-nums">{gameState.moves}</div>
        </div>
      </div>

      <div 
        className="grid gap-2 bg-[#EAE8E3] p-3 rounded-sm shadow-inner"
        style={{ 
          gridTemplateColumns: `repeat(${gridSize}, 1fr)`,
          width: '100%',
          aspectRatio: '1/1',
          maxWidth: '450px'
        }}
      >
        {gameState.grid.map((val, idx) => {
            const isEmpty = val === null;
            const row = Math.floor(idx / gridSize);
            const col = idx % gridSize;
            const emptyRow = Math.floor(gameState.emptyIndex / gridSize);
            const emptyCol = gameState.emptyIndex % gridSize;
            const isMoveable = !gameState.isComplete && !isEmpty && (Math.abs(row - emptyRow) + Math.abs(col - emptyCol) === 1);

            return (
              <button
                key={`${idx}-${val}`}
                onClick={() => handleTileClick(idx)}
                disabled={isEmpty || gameState.isComplete}
                className={`
                  relative flex items-center justify-center
                  text-2xl md:text-3xl font-serif font-bold transition-all duration-200
                  ${isEmpty ? 'invisible' : 'visible'}
                  ${gameState.isComplete 
                    ? 'bg-success text-white shadow-none' 
                    : 'bg-tile text-ink shadow-soft hover:shadow-md'
                  }
                  ${isMoveable && !gameState.isComplete ? 'cursor-pointer hover:-translate-y-[2px] hover:bg-white' : 'cursor-default'}
                  rounded-sm border border-black/5
                `}
                style={{ aspectRatio: '1/1' }}
              >
                {val}
              </button>
            );
        })}
      </div>
      
      {mode === 'BLITZ' && (
        <button 
            onClick={() => window.location.reload()}
            className="mt-8 text-sm font-sans font-semibold uppercase tracking-widest text-ink-light hover:text-accent transition-colors"
        >
            Reset Puzzle
        </button>
      )}

      <Modal 
        isOpen={showWinModal} 
        onClose={() => setShowWinModal(false)}
        title={mode === 'DAILY' ? "Puzzle Solved" : "Blitz Complete"}
      >
        <div className="text-center">
          <div className="mb-6">
            <p className="font-sans text-sm text-ink-light uppercase tracking-widest mb-2">Performance</p>
            <div className="font-serif text-4xl font-bold text-accent mb-1">{ranking.title}</div>
            <p className="font-sans text-ink-light italic">{ranking.description}</p>
          </div>

          <div className="grid grid-cols-2 gap-4 border-t border-b border-border-subtle py-4 mb-6">
            <div>
              <div className="text-xs uppercase text-ink-light tracking-wider">Moves</div>
              <div className="text-xl font-bold text-ink">{gameState.moves}</div>
            </div>
            <div>
              <div className="text-xs uppercase text-ink-light tracking-wider">Time</div>
              <div className="text-xl font-bold text-ink">{formatTime(timeElapsed)}</div>
            </div>
          </div>

          {mode === 'DAILY' && (
             <div className="bg-paper p-4 rounded-sm border border-border-subtle mb-4">
                <p className="text-sm font-sans text-ink-light mb-2">Next rank: <strong>{ranking.title === "Grandmaster" ? "Max Rank Achieved" :  getRanking(ranking.maxMoves - 10)?.title || "Higher Rank"}</strong></p>
                <div className="w-full bg-gray-200 h-1.5 rounded-full overflow-hidden">
                    <div className="bg-accent h-full" style={{ width: '100%' }}></div>
                </div>
             </div>
          )}

          <button
            onClick={() => setShowWinModal(false)}
            className="w-full bg-accent hover:bg-accent-hover text-white font-sans font-medium py-3 px-4 rounded-sm transition-colors"
          >
            Review Board
          </button>
        </div>
      </Modal>
    </div>
  );
};
