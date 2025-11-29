import React, { useState } from 'react';
import { Header } from './components/Header';
import { FifteenPuzzle } from './components/FifteenPuzzle';
import { BlockLogic } from './components/BlockLogic';
import { Modal } from './components/Modal';
import { GameMode, DAILY_15_RANKINGS } from './types';

const App: React.FC = () => {
  const [currentMode, setCurrentMode] = useState<GameMode>(GameMode.DAILY_15);
  const [showInfo, setShowInfo] = useState(false);

  return (
    <div className="min-h-screen flex flex-col items-center">
      <Header 
        currentMode={currentMode} 
        onModeChange={setCurrentMode} 
        onInfoClick={() => setShowInfo(true)}
      />
      
      <main className="w-full max-w-4xl px-4 py-8 md:py-12 flex-grow flex flex-col items-center">
        {currentMode === GameMode.DAILY_15 && <FifteenPuzzle mode="DAILY" />}
        {currentMode === GameMode.QUICK_BLITZ && <FifteenPuzzle mode="BLITZ" />}
        {currentMode === GameMode.BLOCK_LOGIC && <BlockLogic />}
      </main>

      <Modal
        isOpen={showInfo}
        onClose={() => setShowInfo(false)}
        title="How to Play"
      >
        <div className="space-y-8 font-sans text-ink">
          {/* Daily 15 Section */}
          <section>
            <h3 className="font-serif text-xl font-bold mb-2 text-accent">The Fifteen & Quick Blitz</h3>
            <p className="text-sm mb-3">
              Slide tiles into the empty space to arrange them in numerical order, from top-left to bottom-right.
            </p>
            <ul className="list-disc pl-5 text-sm space-y-1 mb-4 text-ink-light">
              <li><strong>The Fifteen:</strong> A 4x4 grid. Solvability requires foresight and efficiency.</li>
              <li><strong>Quick Blitz:</strong> A 3x3 grid designed for speed.</li>
            </ul>
            
            <div className="bg-paper p-4 rounded-sm border border-border-subtle">
              <h4 className="text-xs font-bold uppercase tracking-widest mb-3 border-b border-border-subtle pb-2">Daily 15 Rankings</h4>
              <div className="space-y-3">
                {DAILY_15_RANKINGS.map((rank) => (
                  <div key={rank.title} className="flex justify-between items-baseline text-sm">
                    <span className="font-bold text-ink">{rank.title}</span>
                    <span className="text-ink-light font-mono text-xs">≤ {rank.maxMoves} moves</span>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* Block Logic Section */}
          <section className="border-t border-border-subtle pt-6">
            <h3 className="font-serif text-xl font-bold mb-2 text-accent">Block Logic</h3>
            <p className="text-sm mb-3">
              Fit all the colored pieces into the grid without overlapping the grey blocker squares.
            </p>
            <ul className="list-disc pl-5 text-sm space-y-1 text-ink-light">
              <li>Tap a piece in the tray to select it.</li>
              <li>Tap the selected piece again (in the tray) to rotate it.</li>
              <li>Tap any valid spot on the grid to place the piece.</li>
              <li>Tap a placed piece on the grid to remove it.</li>
            </ul>
          </section>
        </div>
      </Modal>

      <footer className="w-full py-6 border-t border-border-subtle mt-auto">
        <div className="max-w-4xl mx-auto px-4 flex justify-between items-center text-xs font-sans text-ink-light">
          <div>&copy; 2025 Daily15.xyz</div>
          <div className="flex space-x-4">
            <button onClick={() => alert("Privacy Policy: We store progress locally on your device.")} className="hover:text-ink hover:underline">Privacy</button>
            <button onClick={() => alert("About: Designed to stimulate intellectual growth.")} className="hover:text-ink hover:underline">About</button>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default App;