import React from 'react';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
}

export const Modal: React.FC<ModalProps> = ({ isOpen, onClose, title, children }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
      <div className="bg-paper w-full max-w-md rounded-sm shadow-elevated border border-border-subtle flex flex-col max-h-[90vh]">
        <div className="p-6 border-b border-border-subtle flex justify-between items-center bg-white">
          <h2 className="font-serif text-2xl font-bold text-ink">{title}</h2>
          <button 
            onClick={onClose}
            className="text-ink-light hover:text-ink transition-colors text-2xl leading-none"
            aria-label="Close"
          >
            &times;
          </button>
        </div>
        <div className="p-6 overflow-y-auto">
          {children}
        </div>
      </div>
    </div>
  );
};
