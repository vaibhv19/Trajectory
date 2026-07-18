import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useThemeStore } from '../store/themeStore';
import { 
  Search, 
  Home, 
  Briefcase, 
  Users, 
  FileText, 
  Folder, 
  Settings, 
  Plus, 
  Moon, 
  Sun,
  TrendingUp
} from 'lucide-react';

interface CommandItem {
  id: string;
  category: string;
  name: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  action: () => void;
}

interface CommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
}

export const CommandPalette: React.FC<CommandPaletteProps> = ({ isOpen, onClose }) => {
  const navigate = useNavigate();
  const { theme, toggleTheme } = useThemeStore();
  const [search, setSearch] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      setSearch('');
      setSelectedIndex(0);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [isOpen]);

  const items: CommandItem[] = [
    // Navigation
    {
      id: 'nav-home',
      category: 'Navigation',
      name: 'Go to Home Workspace',
      description: 'View your daily focus, checklist, and agenda',
      icon: Home,
      action: () => { navigate('/dashboard'); onClose(); }
    },
    {
      id: 'nav-analytics',
      category: 'Navigation',
      name: 'Go to Analytics',
      description: 'View charts, metrics distributions, and conversion trends',
      icon: TrendingUp,
      action: () => { navigate('/analytics'); onClose(); }
    },
    {
      id: 'nav-apps',
      category: 'Navigation',
      name: 'Go to Applications',
      description: 'Manage and track your active job application funnel',
      icon: Briefcase,
      action: () => { navigate('/applications'); onClose(); }
    },
    {
      id: 'nav-outreach',
      category: 'Navigation',
      name: 'Go to Outreach CRM',
      description: 'Track recruiter contact histories and sent messages',
      icon: Users,
      action: () => { navigate('/outreach'); onClose(); }
    },
    {
      id: 'nav-resumes',
      category: 'Navigation',
      name: 'Go to Resumes & Profiles',
      description: 'Manage targeted career profiles and resumes',
      icon: FileText,
      action: () => { navigate('/resumes'); onClose(); }
    },
    {
      id: 'nav-resources',
      category: 'Navigation',
      name: 'Go to Company Resources',
      description: 'View helpful links and document attachments',
      icon: Folder,
      action: () => { navigate('/resources'); onClose(); }
    },
    {
      id: 'nav-settings',
      category: 'Navigation',
      name: 'Go to Settings',
      description: 'Configure your profile preferences and browser notification alerts',
      icon: Settings,
      action: () => { navigate('/settings'); onClose(); }
    },
    // Quick Actions
    {
      id: 'action-new-app',
      category: 'Actions',
      name: 'Create New Application',
      description: 'Add a new job application to your pipeline tracker',
      icon: Plus,
      action: () => { navigate('/applications?add=true'); onClose(); }
    },
    {
      id: 'action-new-outreach',
      category: 'Actions',
      name: 'Create New Outreach Contact',
      description: 'Log a new recruiter or manager outreach contact',
      icon: Plus,
      action: () => { navigate('/outreach?add=true'); onClose(); }
    },
    {
      id: 'action-new-resume',
      category: 'Actions',
      name: 'Upload Resume Version',
      description: 'Attach a new versioned resume PDF to your profile',
      icon: FileText,
      action: () => { navigate('/resumes?add=true'); onClose(); }
    },
    // Preferences
    {
      id: 'pref-theme',
      category: 'Preferences',
      name: `Switch to ${theme === 'dark' ? 'Light' : 'Dark'} Mode`,
      description: 'Change the application color scheme theme',
      icon: theme === 'dark' ? Sun : Moon,
      action: () => { toggleTheme(); onClose(); }
    }
  ];

  const filtered = items.filter(item => 
    item.name.toLowerCase().includes(search.toLowerCase()) ||
    item.category.toLowerCase().includes(search.toLowerCase()) ||
    item.description.toLowerCase().includes(search.toLowerCase())
  );

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen) return;

      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setSelectedIndex(prev => (prev + 1) % (filtered.length || 1));
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSelectedIndex(prev => (prev - 1 + filtered.length) % (filtered.length || 1));
      } else if (e.key === 'Enter') {
        e.preventDefault();
        if (filtered[selectedIndex]) {
          filtered[selectedIndex].action();
        }
      } else if (e.key === 'Escape') {
        e.preventDefault();
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, filtered, selectedIndex, onClose]);

  if (!isOpen) return null;

  // Group by category
  const categories = Array.from(new Set(filtered.map(item => item.category)));

  // Calculate absolute index mapping for rendering flat selections
  let itemCounter = 0;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-24 bg-background/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div 
        className="fixed inset-0 -z-10" 
        onClick={onClose} 
      />
      
      <div className="w-full max-w-lg bg-card border border-border shadow-2xl rounded-md overflow-hidden animate-in zoom-in-95 duration-200">
        <div className="flex items-center px-4 py-3 border-b border-border bg-muted/20">
          <Search className="h-4 w-4 text-muted-foreground shrink-0 mr-3" />
          <input
            ref={inputRef}
            type="text"
            placeholder="Type a command or search..."
            value={search}
            onChange={(e) => { setSearch(e.target.value); setSelectedIndex(0); }}
            className="w-full bg-transparent text-foreground placeholder-muted-foreground/60 text-xs focus:outline-none"
          />
          <span className="text-[10px] font-mono font-bold text-muted-foreground border border-border/80 rounded bg-muted/65 px-1.5 py-0.5">
            ESC
          </span>
        </div>

        <div className="max-h-[360px] overflow-y-auto py-2">
          {filtered.length === 0 ? (
            <div className="px-4 py-8 text-center text-xs text-muted-foreground font-sans">
              No commands or actions match your query.
            </div>
          ) : (
            categories.map(category => {
              const catItems = filtered.filter(item => item.category === category);
              return (
                <div key={category}>
                  <div className="px-4 py-1.5 text-[9px] font-mono font-bold uppercase tracking-wider text-muted-foreground bg-muted/10">
                    {category}
                  </div>
                  <div className="divide-y divide-border/10">
                    {catItems.map(item => {
                      const currentIndex = itemCounter++;
                      const isSelected = currentIndex === selectedIndex;
                      const Icon = item.icon;
                      
                      return (
                        <div
                          key={item.id}
                          onClick={item.action}
                          onMouseEnter={() => setSelectedIndex(currentIndex)}
                          className={`px-4 py-3 cursor-pointer flex items-center justify-between transition-colors ${
                            isSelected ? 'bg-primary/10 text-foreground' : 'text-muted-foreground'
                          }`}
                        >
                          <div className="flex items-center gap-3 min-w-0">
                            <div className={`p-1.5 rounded-md border shrink-0 ${
                              isSelected ? 'border-primary/20 bg-primary/5 text-primary' : 'border-border/60 bg-muted/25 text-muted-foreground'
                            }`}>
                              <Icon className="h-4 w-4" />
                            </div>
                            <div className="min-w-0">
                              <p className={`text-xs font-semibold truncate ${isSelected ? 'text-foreground' : 'text-foreground/90'}`}>
                                {item.name}
                              </p>
                              <p className="text-[10px] text-muted-foreground/80 truncate mt-0.5 font-sans">
                                {item.description}
                              </p>
                            </div>
                          </div>
                          {isSelected && (
                            <span className="text-[9px] font-mono font-semibold px-1.5 py-0.5 rounded border border-primary/20 bg-primary/5 text-primary">
                              ENTER
                            </span>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};
