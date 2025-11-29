import React, { useState, useEffect, useCallback } from 'react';
import { SeededRandom, getDailySeed, getBlockPuzzleNumber } from '../utils/gameLogic';
import { BlockLogicState, GridCell, Piece } from '../types';
import { Modal } from './Modal';

// Simplified Shapes for the Block Logic Game
// 1 = part of shape
const SHAPES = {
    'I1': [[1]],
    'I2': [[1, 1]],
    'I3': [[1, 1, 1]],
    'L3': [[1, 0], [1, 1]],
    'O4': [[1, 1], [1, 1]],
    'T4': [[1, 1, 1], [0, 1, 0]],
    'Z4': [[1, 1, 0], [0, 1, 1]],
    'L4': [[1, 0, 0], [1, 1, 1]],
    'I4': [[1, 1, 1, 1]]
};

// Distinct colors but muted/sophisticated
const COLORS = [
    '#5D6D7E', '#A569BD', '#E74C3C', '#3498DB', '#1ABC9C', 
    '#F39C12', '#D35400', '#2E86C1', '#27AE60'
];

export const BlockLogic: React.FC = () => {
    const [gameState, setGameState] = useState<BlockLogicState>({
        grid: [],
        pieces: [],
        selectedPieceId: null,
        isComplete: false,
        moves: 0,
        startTime: null,
        endTime: null
    });
    const [showWinModal, setShowWinModal] = useState(false);

    const initializeGame = useCallback(() => {
        const seed = getDailySeed();
        const rng = new SeededRandom(seed);
        
        // 6x6 Grid
        const initialGrid: GridCell[][] = Array(6).fill(null).map(() => 
            Array(6).fill(null).map(() => ({ value: null, isBlocker: false }))
        );

        // Place 6 random blockers deterministically
        const blockers: string[] = [];
        while (blockers.length < 6) {
            const r = Math.floor(rng.next() * 6);
            const c = Math.floor(rng.next() * 6);
            const key = `${r},${c}`;
            if (!blockers.includes(key)) {
                blockers.push(key);
                initialGrid[r][c] = { value: 'blocker', isBlocker: true };
            }
        }

        // Initialize Pieces
        const pieces: Piece[] = Object.entries(SHAPES).map(([key, shape], idx) => ({
            id: key,
            shape: shape,
            color: COLORS[idx],
            rotation: 0,
            placed: false
        }));

        setGameState({
            grid: initialGrid,
            pieces,
            selectedPieceId: null,
            isComplete: false,
            moves: 0,
            startTime: null,
            endTime: null
        });
        setShowWinModal(false);
    }, []);

    // Initialize Daily Block Puzzle
    useEffect(() => {
        initializeGame();
    }, [initializeGame]);

    const rotateShape = (shape: number[][]): number[][] => {
        const rows = shape.length;
        const cols = shape[0].length;
        const rotated = Array(cols).fill(0).map(() => Array(rows).fill(0));
        for (let r = 0; r < rows; r++) {
            for (let c = 0; c < cols; c++) {
                rotated[c][rows - 1 - r] = shape[r][c];
            }
        }
        return rotated;
    };

    const handlePieceSelect = (id: string) => {
        if (gameState.isComplete) return;
        
        // If clicking already selected, rotate it
        if (gameState.selectedPieceId === id) {
            const newPieces = gameState.pieces.map(p => {
                if (p.id === id) {
                    return { ...p, shape: rotateShape(p.shape), rotation: (p.rotation + 1) % 4 };
                }
                return p;
            });
            setGameState(prev => ({ ...prev, pieces: newPieces }));
        } else {
            const piece = gameState.pieces.find(p => p.id === id);
            if (!piece?.placed) {
                setGameState(prev => ({ ...prev, selectedPieceId: id }));
            }
        }
    };

    const handleGridClick = (row: number, col: number) => {
        if (gameState.isComplete) return;

        const clickedCell = gameState.grid[row][col];

        // 1. Check if clicking an existing piece to remove it
        if (clickedCell.value && !clickedCell.isBlocker) {
            const pieceId = clickedCell.value;
            
            // Remove from grid
            const newGrid = gameState.grid.map(r => r.map(c => 
                c.value === pieceId ? { ...c, value: null } : c
            ));
            
            // Mark piece as not placed
            const newPieces = gameState.pieces.map(p => 
                p.id === pieceId ? { ...p, placed: false } : p
            );

            setGameState(prev => ({
                ...prev,
                grid: newGrid,
                pieces: newPieces,
                moves: prev.moves + 1,
                selectedPieceId: null 
            }));
            return;
        }

        // 2. Placing a new piece
        if (!gameState.selectedPieceId) return;

        const piece = gameState.pieces.find(p => p.id === gameState.selectedPieceId);
        if (!piece || piece.placed) return; 

        const shape = piece.shape;
        const sRows = shape.length;
        const sCols = shape[0].length;

        // Calculate Anchor: First non-empty cell in the shape
        // This ensures the piece is placed exactly where the user clicks relative to the piece's visual start
        let anchorR = 0;
        let anchorC = 0;
        let found = false;
        
        for(let r=0; r<sRows; r++) {
            for(let c=0; c<sCols; c++) {
                if (shape[r][c] === 1) {
                    anchorR = r;
                    anchorC = c;
                    found = true;
                    break;
                }
            }
            if(found) break;
        }

        // Adjust starting position so that shape[anchorR][anchorC] aligns with grid[row][col]
        const startR = row - anchorR;
        const startC = col - anchorC;
        
        let canPlace = true;
        const cellsToFill: {r: number, c: number}[] = [];

        for (let r = 0; r < sRows; r++) {
            for (let c = 0; c < sCols; c++) {
                if (shape[r][c] === 1) {
                    const gridR = startR + r;
                    const gridC = startC + c;

                    if (
                        gridR < 0 || gridR >= 6 || 
                        gridC < 0 || gridC >= 6 || 
                        gameState.grid[gridR][gridC].value !== null
                    ) {
                        canPlace = false;
                    } else {
                        cellsToFill.push({r: gridR, c: gridC});
                    }
                }
            }
        }

        if (canPlace) {
            const newGrid = gameState.grid.map(r => r.map(c => ({...c})));
            cellsToFill.forEach(({r, c}) => {
                newGrid[r][c].value = piece.id;
            });

            const newPieces = gameState.pieces.map(p => 
                p.id === piece.id ? { ...p, placed: true } : p
            );

            // Check Win
            const isFull = newGrid.every(r => r.every(c => c.value !== null));

            setGameState(prev => ({
                ...prev,
                grid: newGrid,
                pieces: newPieces,
                selectedPieceId: null,
                moves: prev.moves + 1,
                isComplete: isFull,
                startTime: prev.startTime || Date.now(),
                endTime: isFull ? Date.now() : null
            }));

            if (isFull) setShowWinModal(true);
        }
    };

    const puzzleNum = getBlockPuzzleNumber();

    return (
        <div className="flex flex-col items-center max-w-2xl mx-auto w-full">
            <div className="w-full flex justify-between items-end mb-6 border-b border-border-subtle pb-4">
                <div>
                    <h2 className="font-serif text-3xl text-ink font-bold">Block Logic</h2>
                    <p className="font-sans text-sm text-ink-light tracking-wide uppercase mt-1">
                        No. {puzzleNum}
                    </p>
                </div>
                <div className="text-right font-sans">
                     <button 
                        onClick={initializeGame}
                        className="text-sm uppercase tracking-widest text-ink-light hover:text-accent transition-colors"
                    >
                        Reset
                    </button>
                </div>
            </div>

            <div className="flex flex-col md:flex-row gap-8 w-full">
                {/* Grid */}
                <div className="flex-1 flex justify-center">
                    <div 
                        className="grid grid-cols-6 gap-1 bg-ink-light p-2 rounded-sm"
                        style={{ width: 'min(100%, 350px)', aspectRatio: '1/1' }}
                    >
                        {gameState.grid.map((row, rIdx) => (
                            row.map((cell, cIdx) => {
                                const piece = gameState.pieces.find(p => p.id === cell.value);
                                return (
                                    <div
                                        key={`${rIdx}-${cIdx}`}
                                        onClick={() => handleGridClick(rIdx, cIdx)}
                                        className={`
                                            w-full h-full rounded-[2px] transition-all duration-200
                                            ${cell.isBlocker ? 'bg-ink/80 pattern-diagonal-stripes' : ''}
                                            ${!cell.value && !cell.isBlocker ? 'bg-white hover:bg-white/90 cursor-pointer' : ''}
                                            ${cell.value && !cell.isBlocker ? 'cursor-pointer hover:brightness-110' : ''}
                                        `}
                                        style={{ 
                                            backgroundColor: piece ? piece.color : undefined,
                                            boxShadow: piece ? 'inset 0 0 0 1px rgba(0,0,0,0.1)' : 'none'
                                        }}
                                    />
                                );
                            })
                        ))}
                    </div>
                </div>

                {/* Pieces Tray */}
                <div className="flex-1">
                    <div className="grid grid-cols-3 gap-4">
                        {gameState.pieces.map((piece) => (
                            <button
                                key={piece.id}
                                onClick={() => handlePieceSelect(piece.id)}
                                disabled={piece.placed}
                                className={`
                                    p-2 rounded-sm border transition-all h-24 flex items-center justify-center
                                    ${piece.placed ? 'opacity-20 border-transparent cursor-default' : 'hover:border-accent cursor-pointer'}
                                    ${gameState.selectedPieceId === piece.id ? 'border-accent bg-accent/5 ring-1 ring-accent' : 'border-border-subtle'}
                                `}
                            >
                                <div 
                                    style={{ 
                                        display: 'grid', 
                                        gridTemplateColumns: `repeat(${piece.shape[0].length}, 10px)`, 
                                        gap: '2px' 
                                    }}
                                >
                                    {piece.shape.map((row, r) => (
                                        row.map((val, c) => (
                                            <div 
                                                key={`${r}-${c}`} 
                                                style={{ 
                                                    width: '10px', height: '10px', 
                                                    backgroundColor: val ? piece.color : 'transparent',
                                                    opacity: val ? 1 : 0
                                                }}
                                            />
                                        ))
                                    ))}
                                </div>
                            </button>
                        ))}
                    </div>
                    <p className="text-xs text-center mt-4 text-ink-light font-sans italic">
                        Tap a piece to select. Tap again to rotate.<br/>
                        Click on grid to place. Click placed piece to remove.
                    </p>
                </div>
            </div>

            <Modal 
                isOpen={showWinModal} 
                onClose={() => setShowWinModal(false)}
                title="Logic Solved"
            >
                <div className="text-center py-4">
                    <p className="font-serif text-2xl mb-4 text-ink">Excellent.</p>
                    <p className="text-ink-light mb-6">You have successfully fit all components.</p>
                    <button
                        onClick={() => setShowWinModal(false)}
                        className="bg-accent text-white px-6 py-2 rounded-sm hover:bg-accent-hover transition-colors"
                    >
                        Close
                    </button>
                </div>
            </Modal>
        </div>
    );
};
