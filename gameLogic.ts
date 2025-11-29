import { DAILY_15_RANKINGS } from '../types';

// Seeded Random Number Generator for Daily Puzzles
export class SeededRandom {
  private seed: number;

  constructor(seed: number) {
    this.seed = seed % 2147483647;
    if (this.seed <= 0) this.seed += 2147483646;
  }

  next(): number {
    this.seed = (this.seed * 16807) % 2147483647;
    return (this.seed - 1) / 2147483646;
  }
}

// Generate a seed based on date (YYYYMMDD)
export const getDailySeed = (): number => {
  const today = new Date();
  return today.getFullYear() * 10000 + (today.getMonth() + 1) * 100 + today.getDate();
};

export const getPuzzleNumber = (): number => {
  const start = new Date('2025-09-19T00:00:00'); // Start date
  const now = new Date();
  const diffTime = Math.abs(now.getTime() - start.getTime());
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)); 
  return diffDays;
};

export const getBlockPuzzleNumber = (): number => {
  const start = new Date('2025-11-28T00:00:00'); // Start date for Block Logic
  const now = new Date();
  const diffTime = Math.abs(now.getTime() - start.getTime());
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)); 
  return diffDays;
};

export const getRanking = (moves: number) => {
  return DAILY_15_RANKINGS.find(r => moves <= r.maxMoves) || DAILY_15_RANKINGS[DAILY_15_RANKINGS.length - 1];
};

export const formatTime = (ms: number): string => {
  const totalSeconds = Math.floor(ms / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes}:${seconds.toString().padStart(2, '0')}`;
};