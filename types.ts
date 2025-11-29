export enum GameMode {
  DAILY_15 = 'DAILY_15',
  QUICK_BLITZ = 'QUICK_BLITZ',
  BLOCK_LOGIC = 'BLOCK_LOGIC'
}

export interface PuzzleState {
  grid: (number | null)[];
  emptyIndex: number;
  moves: number;
  isComplete: boolean;
  startTime: number | null;
  endTime: number | null;
}

export type GridCell = {
  value: string | null; // null = empty, 'blocker' = obstacle, 'pX' = piece X
  isBlocker: boolean;
};

export type Coordinate = { row: number; col: number };

export interface Piece {
  id: string;
  shape: number[][]; // 0 or 1
  color: string;
  rotation: number; // 0, 1, 2, 3
  placed: boolean;
}

export type BlockLogicState = {
  grid: GridCell[][];
  pieces: Piece[];
  selectedPieceId: string | null;
  isComplete: boolean;
  moves: number; // Track moves (placements/removals) for stats
  startTime: number | null;
  endTime: number | null;
};

export interface Ranking {
  title: string;
  maxMoves: number;
  description: string;
}

export const DAILY_15_RANKINGS: Ranking[] = [
  { title: "Grandmaster", maxMoves: 60, description: "A flawless display of logic." },
  { title: "Strategist", maxMoves: 90, description: "Highly efficient problem solving." },
  { title: "Tactician", maxMoves: 130, description: "A strong, calculated approach." },
  { title: "Apprentice", maxMoves: 180, description: "A solid effort with room to optimize." },
  { title: "Novice", maxMoves: Infinity, description: "Persistence is the path to mastery." },
];
