import React from 'react';
import { GameMode } from '../types';

interface HeaderProps {
  currentMode: GameMode;
  onModeChange: (mode: GameMode) => void;
  onInfoClick: () => void;
}

export const Header: React.FC<HeaderProps> = ({ currentMode, onModeChange, onInfoClick }) => {
  const dateStr = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric'
  });

  return (
    <header className="w-full flex flex-col items-center pt-8 pb-6 px-4 border-b border-border-subtle bg-paper relative">
      <div className="absolute right-4 top-8 md:right-8">
        <button 
          onClick={onInfoClick}
          className="w-8 h-8 flex items-center justify-center rounded-full border border-ink-light/30 text-ink hover:bg-ink hover:text-white transition-colors"
          aria-label="How to play"
        >
          <span className="font-serif italic font-bold text-sm">i</span>
        </button>
      </div>

      <div className="mb-2 font-sans text-xs font-bold tracking-widest uppercase text-ink-light">
        {dateStr}
      </div>
      <h1 className="font-serif text-4xl md:text-5xl font-bold text-ink mb-8 tracking-tight">
        Daily15.xyz
      </h1>
      
      <nav className="flex space-x-8 md:space-x-12">
        {[
          { id: GameMode.DAILY_15, label: 'The Fifteen' },
          { id: GameMode.QUICK_BLITZ, label: 'Quick Blitz' },
          { id: GameMode.BLOCK_LOGIC, label: 'Block Logic' }
        ].map((item) => (
          <button
            key={item.id}
            onClick={() => onModeChange(item.id)}
            className={`
              pb-2 text-sm md:text-base font-sans font-semibold tracking-wide uppercase transition-all duration-300
              ${currentMode === item.id 
                ? 'text-ink border-b-2 border-ink' 
                : 'text-ink-light border-b-2 border-transparent hover:text-accent hover:border-accent/30'}
            `}
          >
            {item.label}
          </button>
        ))}
      </nav>
    </header>
  );
};