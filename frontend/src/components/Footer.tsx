import React from 'react';
import { Link } from 'react-router-dom';

export const Footer: React.FC = () => {
  const handleShortcutsClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    // Dispatch a Ctrl+K keydown event globally to trigger the Command Palette
    const event = new KeyboardEvent('keydown', { key: 'k', ctrlKey: true });
    document.dispatchEvent(event);
  };

  return (
    <footer className="mt-16 py-8 border-t border-border/20 text-muted-foreground text-xs font-sans">
      <div className="flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <span className="font-mono font-semibold text-[10px] tracking-wider text-primary">TRAJECTORY</span>
          <span className="text-muted-foreground/60">© 2026 Workspace System</span>
        </div>
        
        <div className="flex flex-wrap items-center justify-center md:justify-end gap-x-6 gap-y-2">
          <Link to="/privacy" className="hover:text-foreground transition-colors">
            Privacy
          </Link>
          <Link to="/terms" className="hover:text-foreground transition-colors">
            Terms
          </Link>
          <a 
            href="https://github.com/vaibhv19/Trajectory#readme" 
            target="_blank" 
            rel="noreferrer" 
            className="hover:text-foreground transition-colors"
          >
            Documentation
          </a>
          <button 
            type="button"
            onClick={handleShortcutsClick} 
            className="hover:text-foreground transition-colors bg-transparent border-none p-0 cursor-pointer text-xs font-sans"
          >
            Keyboard Shortcuts
          </button>
          <Link to="/changelog" className="hover:text-foreground transition-colors">
            Changelog
          </Link>
          <a 
            href="https://github.com/vaibhv19/Trajectory/issues" 
            target="_blank" 
            rel="noreferrer" 
            className="hover:text-foreground transition-colors"
          >
            Feedback
          </a>
          <a 
            href="https://github.com/vaibhv19/Trajectory" 
            target="_blank" 
            rel="noreferrer" 
            className="hover:text-foreground transition-colors"
          >
            GitHub Repository
          </a>
          <span className="text-muted-foreground/40 font-mono text-[10px]">
            v1.0.0
          </span>
        </div>
      </div>
    </footer>
  );
};
