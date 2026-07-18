import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../services/api';
import { useAuthStore } from '../store/authStore';
import { useThemeStore } from '../store/themeStore';
import { CommandPalette } from './CommandPalette';
import { useSidebarStore } from '../store/sidebarStore';
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
  Laptop
} from 'lucide-react';
import { Footer } from './Footer';

interface LayoutProps {
  children: React.ReactNode;
}

export const Layout: React.FC<LayoutProps> = ({ children }) => {
  const { fullName, email, logout } = useAuthStore();
  const { themeMode, setThemeMode, toggleTheme } = useThemeStore();
  const location = useLocation();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);
  const [notificationsOpen, setNotificationsOpen] = React.useState(false);
  const [quickAddOpen, setQuickAddOpen] = React.useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = React.useState(false);
  const [commandPaletteOpen, setCommandPaletteOpen] = React.useState(false);
  const { content: sidebarContent, isOpen: sidebarOpen, setIsOpen: setSidebarOpen } = useSidebarStore();

  const handleToggleMenu = () => {
    if (window.innerWidth < 768) {
      setMobileMenuOpen(prev => !prev);
    } else {
      setSidebarOpen(!sidebarOpen);
    }
  };

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

  // Lock background scroll when mobile drawer is open to prevent page scrolling behind drawer overlays
  React.useEffect(() => {
    if (mobileMenuOpen) {
      document.body.classList.add('overflow-hidden');
    } else {
      document.body.classList.remove('overflow-hidden');
    }
    return () => {
      document.body.classList.remove('overflow-hidden');
    };
  }, [mobileMenuOpen]);

  // Fetch user profile settings
  const { data: userProfile } = useQuery({
    queryKey: ['user-settings-profile'],
    queryFn: api.users.getProfile,
  });

  const displayName = userProfile?.fullName || fullName;
  const displayEmail = userProfile?.email || email;
  const initials = userProfile?.fullName
    ? userProfile.fullName.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
    : 'US';

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
      <header className="flex h-14 items-center justify-between px-6 border-b border-border bg-card z-10 shrink-0">
        <div className="flex items-center gap-6">
          <button
            onClick={handleToggleMenu}
            className="text-muted-foreground hover:text-foreground p-1 hover:bg-muted rounded-[4px] transition-colors flex items-center justify-center"
            aria-label="Toggle navigation"
            aria-expanded={sidebarOpen}
            aria-controls="desktop-sidebar"
          >
            <Menu className="h-5 w-5" />
          </button>
          
          <Link to="/dashboard" className="flex items-center gap-2">
            <span className="text-lg font-display font-extrabold text-primary tracking-tight uppercase">Trajectory</span>
          </Link>

          {/* Primary Top Navigation Row */}
          <nav className="hidden md:flex items-stretch h-14 gap-1 font-sans ml-4">
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
            className="p-2 rounded-md border border-border bg-card hover:bg-muted text-muted-foreground hover:text-foreground transition-colors flex items-center justify-center"
            title={`Theme Mode: ${themeMode === 'light' ? 'Light' : themeMode === 'dark' ? 'Dark' : 'System'}`}
            aria-label="Toggle theme"
          >
            {themeMode === 'light' && <Sun className="h-4 w-4" />}
            {themeMode === 'dark' && <Moon className="h-4 w-4" />}
            {themeMode === 'system' && <Laptop className="h-4.5 w-4.5" />}
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

      {/* Mobile Drawer Menu (Mobile Navigation Panel) */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-40 flex" role="dialog" aria-modal="true" aria-label="Mobile Navigation">
          {/* Backdrop Overlay */}
          <div 
            className="fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity duration-300 animate-in fade-in" 
            onClick={() => setMobileMenuOpen(false)} 
          />
          
          <aside 
            id="mobile-nav-drawer"
            className="relative flex w-80 max-w-xs flex-col bg-background border-r border-border p-5 animate-in slide-in-from-left duration-200 z-50"
          >
            {/* Header branding */}
            <div className="flex items-center justify-between pb-4 border-b border-border">
              <Link to="/dashboard" onClick={() => setMobileMenuOpen(false)} className="flex items-center gap-2">
                <span className="text-sm font-display font-extrabold text-primary tracking-tight uppercase">Trajectory</span>
              </Link>
              <button 
                onClick={() => setMobileMenuOpen(false)} 
                className="text-muted-foreground hover:text-foreground p-1 hover:bg-muted rounded-[4px] transition-colors"
                aria-label="Close mobile menu"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Same navigation items as desktop */}
            <nav className="flex-1 py-4 space-y-1 font-sans overflow-y-auto">
              <h4 className="text-[9px] font-mono font-bold tracking-wider text-muted-foreground uppercase px-3.5 mb-2">Navigation</h4>
              {navigation.map((item) => {
                const isActive = location.pathname.startsWith(item.href);
                return (
                  <Link
                    key={item.name}
                    to={item.href}
                    onClick={() => setMobileMenuOpen(false)}
                    className={`flex items-center gap-2.5 px-3.5 py-2 rounded-[4px] text-xs font-semibold uppercase font-mono tracking-wider transition-colors ${
                      isActive
                        ? 'bg-primary/10 text-primary'
                        : 'text-muted-foreground hover:text-foreground hover:bg-muted/40'
                    }`}
                  >
                    <item.icon className="h-4 w-4 shrink-0 opacity-70" />
                    <span>{item.name}</span>
                  </Link>
                );
              })}
            </nav>

            {/* Footer with theme toggle, user profile settings, and logout */}
            <div className="border-t border-border pt-4 space-y-4 font-sans mt-auto">
              {/* User details */}
              <div className="flex items-center gap-3 px-1">
                {userProfile?.avatarUrl ? (
                  <img 
                    src={userProfile.avatarUrl} 
                    alt="Avatar" 
                    className="h-8 w-8 rounded-full object-cover border border-border"
                  />
                ) : (
                  <div className="h-8 w-8 rounded-full bg-primary/10 text-primary flex items-center justify-center font-mono font-bold text-[10px] uppercase border border-border">
                    {initials}
                  </div>
                )}
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-semibold text-foreground truncate">{displayName}</p>
                  <p className="text-[10px] text-muted-foreground truncate font-mono">{displayEmail}</p>
                </div>
              </div>

              {/* Theme Toggle selector inline */}
              <div className="space-y-1.5">
                <span className="text-[9px] font-mono font-bold tracking-wider text-muted-foreground uppercase px-1">Theme preference</span>
                <div className="grid grid-cols-3 gap-1 p-1 bg-muted rounded-[4px]">
                  <button
                    onClick={() => setThemeMode('light')}
                    className={`py-1 text-[10px] font-semibold rounded-[2px] transition-colors ${
                      themeMode === 'light' ? 'bg-card text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'
                    }`}
                  >
                    Light
                  </button>
                  <button
                    onClick={() => setThemeMode('dark')}
                    className={`py-1 text-[10px] font-semibold rounded-[2px] transition-colors ${
                      themeMode === 'dark' ? 'bg-card text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'
                    }`}
                  >
                    Dark
                  </button>
                  <button
                    onClick={() => setThemeMode('system')}
                    className={`py-1 text-[10px] font-semibold rounded-[2px] transition-colors ${
                      themeMode === 'system' ? 'bg-card text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'
                    }`}
                  >
                    System
                  </button>
                </div>
              </div>

              {/* Settings & Logout */}
              <div className="space-y-1">
                <Link
                  to="/settings"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center gap-2 px-3 py-2 text-xs rounded-[4px] text-muted-foreground hover:text-foreground hover:bg-muted transition-colors font-semibold"
                >
                  <Settings className="h-3.5 w-3.5" />
                  Settings
                </Link>
                <button
                  onClick={() => { setMobileMenuOpen(false); handleLogout(); }}
                  className="w-full flex items-center gap-2 px-3 py-2 text-xs rounded-[4px] text-rose-500 hover:bg-rose-500/10 transition-colors font-semibold text-left"
                >
                  <LogOut className="h-3.5 w-3.5" />
                  Logout
                </button>
              </div>
            </div>
          </aside>
        </div>
      )}

      {/* Mobile Drawer Menu (Mobile Navigation Panel) */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-40 flex" role="dialog" aria-modal="true" aria-label="Mobile Navigation">
          {/* Backdrop Overlay */}
          <div 
            className="fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity duration-300 animate-in fade-in" 
            onClick={() => setMobileMenuOpen(false)} 
          />
          
          <aside className="relative flex w-80 max-w-xs flex-col bg-background border-r border-border p-5 animate-in slide-in-from-left duration-200 z-50">
            {/* Header branding */}
            <div className="flex items-center justify-between pb-4 border-b border-border">
              <Link to="/dashboard" onClick={() => setMobileMenuOpen(false)} className="flex items-center gap-2">
                <span className="text-sm font-display font-extrabold text-primary tracking-tight uppercase">Trajectory</span>
              </Link>
              <button 
                onClick={() => setMobileMenuOpen(false)} 
                className="text-muted-foreground hover:text-foreground p-1 hover:bg-muted rounded-[4px] transition-colors"
                aria-label="Close mobile menu"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Same navigation items as desktop (for mobile navigation drawer) */}
            <nav className="py-4 space-y-1 font-sans border-b border-border/30">
              <h4 className="text-[9px] font-mono font-bold tracking-wider text-muted-foreground uppercase px-3.5 mb-2">Navigation</h4>
              {navigation.map((item) => {
                const isActive = location.pathname.startsWith(item.href);
                return (
                  <Link
                    key={item.name}
                    to={item.href}
                    onClick={() => setMobileMenuOpen(false)}
                    className={`flex items-center gap-2.5 px-3.5 py-2 rounded-[4px] text-xs font-semibold uppercase font-mono tracking-wider transition-colors ${
                      isActive
                        ? 'bg-primary/10 text-primary'
                        : 'text-muted-foreground hover:text-foreground hover:bg-muted/40'
                    }`}
                  >
                    <item.icon className="h-4 w-4 shrink-0 opacity-70" />
                    <span>{item.name}</span>
                  </Link>
                );
              })}
            </nav>

            {/* Contextual productivity panel on mobile */}
            <div className="flex-1 py-4 overflow-y-auto font-sans">
              {sidebarContent ? sidebarContent : (
                <div className="space-y-4">
                  <h4 className="text-[9px] font-mono font-bold tracking-wider text-muted-foreground uppercase px-1">Global Actions</h4>
                  <div className="space-y-2">
                    <button
                      onClick={() => { setMobileMenuOpen(false); navigate('/applications?add=true'); }}
                      className="w-full flex items-center gap-2.5 px-3 py-2 text-xs rounded-[4px] bg-primary/10 hover:bg-primary/20 text-primary font-semibold text-left transition-colors"
                    >
                      <Plus className="h-4 w-4" />
                      Add Application
                    </button>
                    <button
                      onClick={() => { setMobileMenuOpen(false); navigate('/resumes?add=true'); }}
                      className="w-full flex items-center gap-2.5 px-3 py-2 text-xs rounded-[4px] bg-primary/10 hover:bg-primary/20 text-primary font-semibold text-left transition-colors"
                    >
                      <Plus className="h-4 w-4" />
                      Upload Resume
                    </button>
                    <button
                      onClick={() => { setMobileMenuOpen(false); navigate('/companies?add=true'); }}
                      className="w-full flex items-center gap-2.5 px-3 py-2 text-xs rounded-[4px] bg-primary/10 hover:bg-primary/20 text-primary font-semibold text-left transition-colors"
                    >
                      <Plus className="h-4 w-4" />
                      Add Company
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Footer with theme toggle, user profile settings, and logout */}
            <div className="border-t border-border pt-4 space-y-4 font-sans mt-auto">
              {/* User details */}
              <div className="flex items-center gap-3 px-1">
                {userProfile?.avatarUrl ? (
                  <img 
                    src={userProfile.avatarUrl} 
                    alt="Avatar" 
                    className="h-8 w-8 rounded-full object-cover border border-border"
                  />
                ) : (
                  <div className="h-8 w-8 rounded-full bg-primary/10 text-primary flex items-center justify-center font-mono font-bold text-[10px] uppercase border border-border">
                    {initials}
                  </div>
                )}
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-semibold text-foreground truncate">{displayName}</p>
                  <p className="text-[10px] text-muted-foreground truncate font-mono">{displayEmail}</p>
                </div>
              </div>

              {/* Theme Toggle selector inline */}
              <div className="space-y-1.5">
                <span className="text-[9px] font-mono font-bold tracking-wider text-muted-foreground uppercase px-1">Theme preference</span>
                <div className="grid grid-cols-3 gap-1 p-1 bg-muted rounded-[4px]">
                  <button
                    onClick={() => setThemeMode('light')}
                    className={`py-1 text-[10px] font-semibold rounded-[2px] transition-colors ${
                      themeMode === 'light' ? 'bg-card text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'
                    }`}
                  >
                    Light
                  </button>
                  <button
                    onClick={() => setThemeMode('dark')}
                    className={`py-1 text-[10px] font-semibold rounded-[2px] transition-colors ${
                      themeMode === 'dark' ? 'bg-card text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'
                    }`}
                  >
                    Dark
                  </button>
                  <button
                    onClick={() => setThemeMode('system')}
                    className={`py-1 text-[10px] font-semibold rounded-[2px] transition-colors ${
                      themeMode === 'system' ? 'bg-card text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'
                    }`}
                  >
                    System
                  </button>
                </div>
              </div>

              {/* Settings & Logout */}
              <div className="space-y-1">
                <Link
                  to="/settings"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center gap-2 px-3 py-2 text-xs rounded-[4px] text-muted-foreground hover:text-foreground hover:bg-muted transition-colors font-semibold"
                >
                  <Settings className="h-3.5 w-3.5" />
                  Settings
                </Link>
                <button
                  onClick={() => { setMobileMenuOpen(false); handleLogout(); }}
                  className="w-full flex items-center gap-2 px-3 py-2 text-xs rounded-[4px] text-rose-500 hover:bg-rose-500/10 transition-colors font-semibold text-left"
                >
                  <LogOut className="h-3.5 w-3.5" />
                  Logout
                </button>
              </div>
            </div>
          </aside>
        </div>
      )}

      {/* Main Container below Header */}
      <div className="flex flex-1 overflow-hidden">
        {/* Desktop Collapsible Sidebar */}
        <aside 
          id="desktop-sidebar"
          className={`hidden md:flex flex-col bg-card border-r border-border p-5 transition-all duration-300 ease-in-out shrink-0 h-full ${
            sidebarOpen ? 'w-64 opacity-100' : 'w-0 p-0 border-r-0 opacity-0 overflow-hidden'
          }`}
        >
          {sidebarContent ? sidebarContent : (
            <div className="space-y-4">
              <h3 className="text-xs font-mono font-bold tracking-wider text-muted-foreground uppercase px-1">Global Actions</h3>
              <div className="space-y-2">
                <button
                  onClick={() => navigate('/applications?add=true')}
                  className="w-full flex items-center gap-2.5 px-3 py-2 text-xs rounded-[4px] bg-primary/10 hover:bg-primary/20 text-primary font-semibold text-left transition-colors"
                >
                  <Plus className="h-4 w-4" />
                  Add Application
                </button>
                <button
                  onClick={() => navigate('/resumes?add=true')}
                  className="w-full flex items-center gap-2.5 px-3 py-2 text-xs rounded-[4px] bg-primary/10 hover:bg-primary/20 text-primary font-semibold text-left transition-colors"
                >
                  <Plus className="h-4 w-4" />
                  Upload Resume
                </button>
                <button
                  onClick={() => navigate('/companies?add=true')}
                  className="w-full flex items-center gap-2.5 px-3 py-2 text-xs rounded-[4px] bg-primary/10 hover:bg-primary/20 text-primary font-semibold text-left transition-colors"
                >
                  <Plus className="h-4 w-4" />
                  Add Company
                </button>
              </div>
            </div>
          )}
        </aside>

        {/* Content Pane */}
        <main className="flex-1 overflow-y-auto px-6 py-8 md:px-8 bg-background relative">
          <div className="max-w-7xl mx-auto min-h-[calc(100vh-80px)] flex flex-col justify-between space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-200">
            <div className="flex-1">
              {children}
            </div>
            <Footer />
          </div>
        </main>
      </div>

      <CommandPalette isOpen={commandPaletteOpen} onClose={() => setCommandPaletteOpen(false)} />
    </div>
  );
};
