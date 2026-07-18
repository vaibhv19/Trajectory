import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../services/api';
import { useAuthStore } from '../store/authStore';
import { useThemeStore } from '../store/themeStore';
import { CommandPalette } from './CommandPalette';
import { 
  Briefcase, 
  Users, 
  FileText, 
  LogOut, 
  Sun, 
  Moon,
  Menu,
  X,
  Settings,
  Bell,
  Check,
  CheckCheck,
  Plus,
  Search,
  Shield,
  Scale,
  Home,
  TrendingUp,
  Building2,
  HelpCircle,
  Keyboard,
  Database,
  Compass
} from 'lucide-react';
import { Footer } from './Footer';

interface LayoutProps {
  children: React.ReactNode;
}

export const Layout: React.FC<LayoutProps> = ({ children }) => {
  const { fullName, email, logout } = useAuthStore();
  const { theme, toggleTheme } = useThemeStore();
  const location = useLocation();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);
  const [notificationsOpen, setNotificationsOpen] = React.useState(false);
  const [quickAddOpen, setQuickAddOpen] = React.useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = React.useState(false);
  const [commandPaletteOpen, setCommandPaletteOpen] = React.useState(false);
  const queryClient = useQueryClient();

  const navigation = [
    { name: 'Home', href: '/dashboard', icon: Home },
    { name: 'Applications', href: '/applications', icon: Briefcase },
    { name: 'Outreach', href: '/outreach', icon: Users },
    { name: 'Resumes', href: '/resumes', icon: FileText },
    { name: 'Analytics', href: '/analytics', icon: TrendingUp },
    { name: 'Companies', href: '/companies', icon: Building2 },
  ];

  // Listen for Ctrl+K and Escape keyboard shortcuts
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setCommandPaletteOpen(prev => !prev);
      }
      if (e.key === 'Escape') {
        setMobileMenuOpen(false);
        setNotificationsOpen(false);
        setQuickAddOpen(false);
        setUserDropdownOpen(false);
        setCommandPaletteOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Fetch user profile settings
  const { data: userProfile } = useQuery({
    queryKey: ['user-settings-profile'],
    queryFn: api.users.getProfile,
  });

  const displayName = userProfile?.fullName || fullName;
  const displayEmail = userProfile?.email || email;

  // Fetch notifications
  const { data: unreadCount = 0 } = useQuery<number>({
    queryKey: ['notifications-unread-count'],
    queryFn: api.notifications.unreadCount,
    refetchInterval: 15000,
  });

  const { data: notifications = [] } = useQuery<any[]>({
    queryKey: ['notifications'],
    queryFn: api.notifications.list,
    refetchInterval: 15000,
  });

  const alertedIdsRef = React.useRef<Set<string>>(new Set());
  const isInitialLoadRef = React.useRef(true);

  React.useEffect(() => {
    if (!notifications || notifications.length === 0) return;

    if (isInitialLoadRef.current) {
      notifications.forEach(n => alertedIdsRef.current.add(n.id));
      isInitialLoadRef.current = false;
      return;
    }

    if (userProfile?.browserNotificationsEnabled && 'Notification' in window && Notification.permission === 'granted') {
      const newUnreads = notifications.filter(n => !n.isRead && !alertedIdsRef.current.has(n.id));
      newUnreads.forEach(n => {
        alertedIdsRef.current.add(n.id);
        new Notification("Trajectory Alert", {
          body: n.message,
          icon: '/favicon.ico'
        });
      });
    }
  }, [notifications, userProfile?.browserNotificationsEnabled]);

  const readMutation = useMutation({
    mutationFn: (id: string) => api.notifications.read(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications-unread-count'] });
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
    }
  });

  const readAllMutation = useMutation({
    mutationFn: api.notifications.readAll,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications-unread-count'] });
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
    }
  });

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="flex h-screen flex-col overflow-hidden bg-background text-foreground transition-colors duration-200">
      {/* Top Navbar */}
      <header className="flex h-14 items-center justify-between px-6 border-b border-border bg-card z-10">
        <div className="flex items-center gap-6">
          <button
            onClick={() => setMobileMenuOpen(true)}
            className="md:hidden text-muted-foreground hover:text-foreground"
            aria-label="Open mobile menu"
          >
            <Menu className="h-5 w-5" />
          </button>
          
          <Link to="/dashboard" className="flex items-center gap-2">
            <span className="text-lg font-display font-extrabold text-primary tracking-tight uppercase">Trajectory</span>
          </Link>

          <nav className="hidden md:flex items-stretch h-14 gap-1 font-sans">
            {navigation.map((item) => {
              const isActive = location.pathname.startsWith(item.href);
              return (
                <Link
                  key={item.name}
                  to={item.href}
                  className={`flex items-center gap-1.5 px-3 border-b-2 text-xs transition-colors ${
                    isActive
                      ? 'border-primary text-foreground font-semibold bg-primary/[2%]'
                      : 'border-transparent text-muted-foreground hover:text-foreground hover:bg-muted/30'
                  }`}
                >
                  <item.icon className="h-3.5 w-3.5 shrink-0 opacity-70" />
                  <span>{item.name}</span>
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Global Search and Quick Actions */}
        <div className="flex items-center gap-4">
          {/* Global Search Bar Button */}
          <div className="relative hidden sm:block w-64">
            <button 
              onClick={() => {
                // Trigger Command Palette via Ctrl+K keyboard event dispatch
                const event = new KeyboardEvent('keydown', { key: 'k', ctrlKey: true });
                document.dispatchEvent(event);
              }}
              className="w-full flex items-center justify-between px-3 py-1.5 border border-border bg-background/50 hover:bg-muted text-muted-foreground text-xs rounded-md transition-colors"
            >
              <span className="flex items-center gap-2">
                <Search className="h-3.5 w-3.5" />
                Search...
              </span>
              <kbd className="pointer-events-none inline-flex h-4.5 select-none items-center gap-0.5 rounded border border-border bg-muted px-1.5 font-mono text-[9px] font-medium text-muted-foreground opacity-100">
                <span>Ctrl</span>K
              </kbd>
            </button>
          </div>

          {/* Quick Add Dropdown */}
          <div className="relative">
            <button 
              onClick={() => setQuickAddOpen(!quickAddOpen)}
              className="flex items-center justify-center gap-1 h-8 px-3 rounded-[4px] bg-primary hover:bg-[#0C5A62] dark:hover:bg-[#4CB0BA] text-primary-foreground text-xs font-semibold transition-all duration-200"
            >
              <Plus className="h-3.5 w-3.5" />
              Add
            </button>
            {quickAddOpen && (
              <>
                <div className="fixed inset-0 z-30" onClick={() => setQuickAddOpen(false)} />
                <div className="absolute right-0 mt-2 w-48 bg-card border border-border shadow-lg rounded-[4px] overflow-hidden z-40 animate-in fade-in slide-in-from-top-2 duration-150 py-1">
                  <button 
                    onClick={() => { setQuickAddOpen(false); navigate('/applications?add=true'); }}
                    className="w-full text-left px-3 py-2 text-xs hover:bg-muted transition-colors flex items-center gap-2"
                  >
                    <Briefcase className="h-3.5 w-3.5 text-muted-foreground" />
                    New Application
                  </button>
                  <button 
                    onClick={() => { setQuickAddOpen(false); navigate('/outreach?add=true'); }}
                    className="w-full text-left px-3 py-2 text-xs hover:bg-muted transition-colors flex items-center gap-2"
                  >
                    <Users className="h-3.5 w-3.5 text-muted-foreground" />
                    New Outreach Contact
                  </button>
                  <button 
                    onClick={() => { setQuickAddOpen(false); navigate('/resumes?add=true'); }}
                    className="w-full text-left px-3 py-2 text-xs hover:bg-muted transition-colors flex items-center gap-2"
                  >
                    <FileText className="h-3.5 w-3.5 text-muted-foreground" />
                    Upload Resume Version
                  </button>
                </div>
              </>
            )}
          </div>

          {/* Notifications Dropdown */}
          <div className="relative">
            <button
              onClick={() => setNotificationsOpen(!notificationsOpen)}
              className="p-2 rounded-md border border-border bg-card hover:bg-muted text-muted-foreground hover:text-foreground transition-colors relative"
              aria-label="Toggle notifications"
            >
              <Bell className="h-4 w-4" />
              {unreadCount > 0 && (
                <span className="absolute -top-1.5 -right-1.5 h-5 w-5 rounded-md bg-teal-600 border border-card text-[10px] font-mono font-bold text-white flex items-center justify-center">
                  {unreadCount}
                </span>
              )}
            </button>

            {notificationsOpen && (
              <>
                <div 
                  className="fixed inset-0 z-30" 
                  onClick={() => setNotificationsOpen(false)} 
                />
                <div className="absolute right-0 mt-2 w-80 bg-card border border-border shadow-lg rounded-md overflow-hidden z-40 animate-in fade-in slide-in-from-top-2 duration-150">
                  <div className="flex items-center justify-between px-4 py-2.5 border-b border-border bg-muted/30">
                    <span className="text-xs font-mono font-bold uppercase tracking-wider text-muted-foreground">
                      Notifications ({unreadCount})
                    </span>
                    {unreadCount > 0 && (
                      <button
                        onClick={() => readAllMutation.mutate()}
                        className="text-[10px] font-semibold text-teal-600 dark:text-teal-400 hover:underline flex items-center gap-1 font-sans"
                      >
                        <CheckCheck className="w-3.5 h-3.5" />
                        Mark all read
                      </button>
                    )}
                  </div>
                  <div className="divide-y divide-border max-h-72 overflow-y-auto">
                    {notifications.length === 0 ? (
                      <div className="p-8 text-center text-xs text-muted-foreground font-sans">
                        No notifications found.
                      </div>
                    ) : (
                      notifications.map((n) => (
                        <div 
                          key={n.id} 
                          className={`p-3 text-left transition-colors flex gap-2 items-start ${n.isRead ? 'opacity-60' : 'bg-muted/10'}`}
                        >
                          <div className="flex-1 min-w-0">
                            <h4 className="text-xs font-semibold text-foreground font-sans">{n.title}</h4>
                            <p className="text-[11px] text-muted-foreground font-sans mt-0.5 leading-relaxed">{n.message}</p>
                            <span className="text-[9px] text-muted-foreground/60 font-sans block mt-1">
                              {new Date(n.createdAt).toLocaleTimeString()}
                            </span>
                          </div>
                          {!n.isRead && (
                            <button
                              onClick={() => readMutation.mutate(n.id)}
                              className="p-1 hover:bg-muted text-teal-600 rounded-md transition-colors"
                              title="Mark read"
                            >
                              <Check className="w-3 h-3" />
                            </button>
                          )}
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </>
            )}
          </div>

          {/* Theme Toggle Button */}
          <button
            onClick={toggleTheme}
            className="p-2 rounded-md border border-border bg-card hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
            aria-label="Toggle theme"
          >
            {theme === 'dark' ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
          </button>

          {/* User Settings Dropdown */}
          <div className="relative">
            <button 
              onClick={() => setUserDropdownOpen(!userDropdownOpen)}
              className="h-8 w-8 rounded-full overflow-hidden border border-border flex items-center justify-center transition-colors shrink-0"
            >
              {userProfile?.avatarUrl ? (
                <img 
                  src={userProfile.avatarUrl} 
                  alt="Avatar" 
                  className="h-full w-full object-cover"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = `https://api.dicebear.com/7.x/initials/svg?seed=${userProfile?.fullName || 'U'}`;
                  }}
                />
              ) : (
                <div className="h-full w-full bg-primary/10 text-primary flex items-center justify-center font-mono font-bold text-[10px] uppercase">
                  {userProfile?.fullName 
                    ? userProfile.fullName.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
                    : 'US'}
                </div>
              )}
            </button>
            {userDropdownOpen && (
              <>
                <div className="fixed inset-0 z-30" onClick={() => setUserDropdownOpen(false)} />
                <div className="absolute right-0 mt-2 w-56 bg-card border border-border shadow-lg rounded-[4px] overflow-hidden z-40 animate-in fade-in slide-in-from-top-2 duration-150 py-1">
                  <div className="px-3 py-2 border-b border-border/60">
                    <p className="text-xs font-semibold truncate text-foreground">{displayName}</p>
                    <p className="text-[10px] text-muted-foreground truncate font-mono">{displayEmail}</p>
                  </div>
                  <button 
                    onClick={() => { setUserDropdownOpen(false); navigate('/settings'); }}
                    className="w-full text-left px-3 py-2 text-xs hover:bg-muted transition-colors flex items-center gap-2 text-foreground"
                  >
                    <Settings className="h-3.5 w-3.5 text-muted-foreground" />
                    Settings
                  </button>
                  <button 
                    onClick={() => { setUserDropdownOpen(false); navigate('/privacy'); }}
                    className="w-full text-left px-3 py-2 text-xs hover:bg-muted transition-colors flex items-center gap-2 text-foreground"
                  >
                    <Shield className="h-3.5 w-3.5 text-muted-foreground" />
                    Privacy Policy
                  </button>
                  <button 
                    onClick={() => { setUserDropdownOpen(false); navigate('/terms'); }}
                    className="w-full text-left px-3 py-2 text-xs hover:bg-muted transition-colors flex items-center gap-2 text-foreground"
                  >
                    <Scale className="h-3.5 w-3.5 text-muted-foreground" />
                    Terms of Service
                  </button>
                  <button 
                    onClick={() => { setUserDropdownOpen(false); handleLogout(); }}
                    className="w-full text-left px-3 py-2 text-xs hover:bg-rose-500/10 text-rose-500 transition-colors flex items-center gap-2"
                  >
                    <LogOut className="h-3.5 w-3.5" />
                    Logout
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </header>

      {/* Mobile Drawer Menu (Productivity Utility Drawer) */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-40 flex">
          <div 
            className="fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity duration-300" 
            onClick={() => setMobileMenuOpen(false)} 
          />
          
          <aside className="relative flex w-80 max-w-xs flex-col bg-background border-r border-border p-5 animate-in slide-in-from-left duration-200 z-50">
            <div className="flex items-center justify-between pb-4 border-b border-border">
              <div className="flex items-center gap-2">
                <Compass className="h-4 w-4 text-primary" />
                <span className="text-sm font-display font-extrabold text-foreground uppercase tracking-tight">Workspace Drawer</span>
              </div>
              <button onClick={() => setMobileMenuOpen(false)} className="text-muted-foreground hover:text-foreground p-1 hover:bg-muted rounded-[4px] transition-colors">
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="flex-1 py-4 overflow-y-auto space-y-6 font-sans">
              {/* Pinned shortcuts */}
              <div className="space-y-2">
                <h4 className="text-[10px] font-mono font-bold tracking-wider text-muted-foreground uppercase">Pinned Items</h4>
                <div className="space-y-1.5">
                  <button 
                    onClick={() => { setMobileMenuOpen(false); navigate('/dashboard'); }}
                    className="w-full flex items-center gap-2.5 px-3 py-2 text-xs rounded-[4px] hover:bg-muted text-foreground/80 hover:text-foreground text-left transition-colors"
                  >
                    <Home className="h-3.5 w-3.5 text-primary" />
                    Home Workspace
                  </button>
                  <button 
                    onClick={() => { setMobileMenuOpen(false); navigate('/applications?add=true'); }}
                    className="w-full flex items-center gap-2.5 px-3 py-2 text-xs rounded-[4px] hover:bg-muted text-foreground/80 hover:text-foreground text-left transition-colors"
                  >
                    <Plus className="h-3.5 w-3.5 text-primary" />
                    Log Application
                  </button>
                  <button 
                    onClick={() => { setMobileMenuOpen(false); navigate('/outreach?add=true'); }}
                    className="w-full flex items-center gap-2.5 px-3 py-2 text-xs rounded-[4px] hover:bg-muted text-foreground/80 hover:text-foreground text-left transition-colors"
                  >
                    <Users className="h-3.5 w-3.5 text-primary" />
                    Log Recruiter contact
                  </button>
                </div>
              </div>

              {/* Activity / Info summary */}
              <div className="space-y-2 pt-2 border-t border-border/30">
                <h4 className="text-[10px] font-mono font-bold tracking-wider text-muted-foreground uppercase">Recent Activity</h4>
                <div className="px-3 py-2 bg-muted/20 border border-border/40 rounded-[4px] text-[11px] text-muted-foreground space-y-1 font-sans leading-relaxed">
                  <p>Database synchronization connected.</p>
                  <p>Active profile avatar upload enabled.</p>
                </div>
              </div>

              {/* Workspace Utilities */}
              <div className="space-y-2 pt-2 border-t border-border/30">
                <h4 className="text-[10px] font-mono font-bold tracking-wider text-muted-foreground uppercase">Workspace Utilities</h4>
                <div className="space-y-1.5">
                  <button 
                    onClick={() => { 
                      setMobileMenuOpen(false); 
                      const event = new KeyboardEvent('keydown', { key: 'k', ctrlKey: true });
                      document.dispatchEvent(event);
                    }}
                    className="w-full flex items-center gap-2.5 px-3 py-2 text-xs rounded-[4px] hover:bg-muted text-foreground/80 hover:text-foreground text-left transition-colors"
                  >
                    <Keyboard className="h-3.5 w-3.5 text-muted-foreground" />
                    Keyboard Shortcuts
                  </button>
                  <button 
                    onClick={() => { setMobileMenuOpen(false); navigate('/settings'); }}
                    className="w-full flex items-center gap-2.5 px-3 py-2 text-xs rounded-[4px] hover:bg-muted text-foreground/80 hover:text-foreground text-left transition-colors"
                  >
                    <Settings className="h-3.5 w-3.5 text-muted-foreground" />
                    Workspace Settings
                  </button>
                  <button 
                    onClick={() => { setMobileMenuOpen(false); navigate('/changelog'); }}
                    className="w-full flex items-center gap-2.5 px-3 py-2 text-xs rounded-[4px] hover:bg-muted text-foreground/80 hover:text-foreground text-left transition-colors"
                  >
                    <Database className="h-3.5 w-3.5 text-muted-foreground" />
                    Changelog History
                  </button>
                  <a 
                    href="https://github.com/vaibhv19/Trajectory/issues"
                    target="_blank"
                    rel="noreferrer"
                    className="w-full flex items-center gap-2.5 px-3 py-2 text-xs rounded-[4px] hover:bg-muted text-foreground/80 hover:text-foreground text-left transition-colors block"
                  >
                    <HelpCircle className="h-3.5 w-3.5 text-muted-foreground" />
                    Submit Feedback
                  </a>
                </div>
              </div>
            </div>
          </aside>
        </div>
      )}

      {/* Content Pane */}
      <main className="flex-1 overflow-y-auto px-6 py-8 md:px-8 bg-background relative">
        <div className="max-w-7xl mx-auto min-h-[calc(100vh-80px)] flex flex-col justify-between space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-200">
          <div className="flex-1">
            {children}
          </div>
          <Footer />
        </div>
      </main>

      <CommandPalette isOpen={commandPaletteOpen} onClose={() => setCommandPaletteOpen(false)} />
    </div>
  );
};
