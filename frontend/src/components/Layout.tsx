import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../services/api';
import { useAuthStore } from '../store/authStore';
import { useThemeStore } from '../store/themeStore';
import { 
  LayoutDashboard, 
  Briefcase, 
  Users, 
  FileText, 
  LogOut, 
  Sun, 
  Moon,
  Menu,
  X,
  Folder,
  Settings,
  Bell,
  Check,
  CheckCheck
} from 'lucide-react';

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
  const queryClient = useQueryClient();

  const navigation = [
    { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
    { name: 'Applications', href: '/applications', icon: Briefcase },
    { name: 'Outreach CRM', href: '/outreach', icon: Users },
    { name: 'Resumes & Profiles', href: '/resumes', icon: FileText },
    { name: 'Company Resources', href: '/resources', icon: Folder },
    { name: 'Settings', href: '/settings', icon: Settings },
  ];

  // Fetch user profile settings
  const { data: userProfile } = useQuery({
    queryKey: ['user-settings-profile'],
    queryFn: api.users.getProfile,
  });

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
    <div className="flex h-screen overflow-hidden bg-background text-foreground transition-colors duration-200">
      {/* Desktop Sidebar */}
      <aside className="hidden md:flex md:w-64 md:flex-col bg-card border-r border-border">
        <div className="flex h-16 items-center px-6 border-b border-border">
          <Link to="/dashboard" className="flex items-center gap-2">
            <span className="text-2xl font-display font-extrabold text-primary tracking-tight uppercase">Trajectory</span>
          </Link>
        </div>

        <nav className="flex-1 space-y-1 px-4 py-6 overflow-y-auto">
          {navigation.map((item) => {
            const isActive = location.pathname.startsWith(item.href);
            const Icon = item.icon;
            return (
              <Link
                key={item.name}
                to={item.href}
                className={`group flex items-center px-4 py-3 text-sm font-medium rounded-md transition-all duration-200 ${
                  isActive
                    ? 'bg-primary text-primary-foreground'
                    : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                }`}
              >
                <Icon className="mr-3 h-5 w-5 flex-shrink-0" />
                {item.name}
              </Link>
            );
          })}
        </nav>

        {/* User Info & Footer */}
        <div className="p-4 border-t border-border">
          <div className="flex items-center gap-3 px-2 py-2 mb-2">
            <div className="h-9 w-9 rounded-md bg-primary/20 text-primary flex items-center justify-center font-display font-semibold uppercase">
              {fullName?.substring(0, 2) || 'US'}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">{fullName}</p>
              <p className="text-xs text-muted-foreground truncate">{email}</p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="w-full flex items-center px-4 py-2 text-sm font-medium text-rose-500 rounded-md hover:bg-rose-500/10 transition-colors"
          >
            <LogOut className="mr-3 h-5 w-5 flex-shrink-0" />
            Logout
          </button>
        </div>
      </aside>

      {/* Mobile Sidebar Overlay */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-40 flex md:hidden">
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setMobileMenuOpen(false)} />
          
          <aside className="relative flex w-64 max-w-xs flex-col bg-background border-r border-border p-5 animate-in slide-in-from-left duration-200">
            <div className="flex items-center justify-between pb-6 border-b border-border">
              <span className="text-xl font-display font-extrabold text-primary tracking-tight uppercase">Trajectory</span>
              <button onClick={() => setMobileMenuOpen(false)} className="text-muted-foreground hover:text-foreground">
                <X className="h-6 w-6" />
              </button>
            </div>

            <nav className="flex-1 space-y-1 py-6 overflow-y-auto">
              {navigation.map((item) => {
                const isActive = location.pathname.startsWith(item.href);
                const Icon = item.icon;
                return (
                  <Link
                    key={item.name}
                    to={item.href}
                    onClick={() => setMobileMenuOpen(false)}
                    className={`group flex items-center px-4 py-3 text-sm font-medium rounded-md transition-all duration-200 ${
                      isActive
                        ? 'bg-primary text-primary-foreground'
                        : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                    }`}
                  >
                    <Icon className="mr-3 h-5 w-5 flex-shrink-0" />
                    {item.name}
                  </Link>
                );
              })}
            </nav>

            <div className="border-t border-border pt-4">
              <div className="flex items-center gap-3 px-2 py-2 mb-4">
                <div className="h-9 w-9 rounded-md bg-primary/20 text-primary flex items-center justify-center font-display font-semibold uppercase">
                  {fullName?.substring(0, 2) || 'US'}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{fullName}</p>
                  <p className="text-xs text-muted-foreground truncate">{email}</p>
                </div>
              </div>
              <button
                onClick={handleLogout}
                className="w-full flex items-center px-4 py-2 text-sm font-medium text-rose-500 rounded-md hover:bg-rose-500/10 transition-colors"
              >
                <LogOut className="mr-3 h-5 w-5 flex-shrink-0" />
                Logout
              </button>
            </div>
          </aside>
        </div>
      )}

      {/* Main Workspace View */}
      <div className="flex flex-1 flex-col overflow-hidden">
        {/* Top Header */}
        <header className="flex h-16 items-center justify-between px-6 border-b border-border bg-card z-10">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setMobileMenuOpen(true)}
              className="md:hidden text-muted-foreground hover:text-foreground"
            >
              <Menu className="h-6 w-6" />
            </button>
            <h1 className="text-xl font-display font-semibold tracking-tight uppercase text-muted-foreground">
              {navigation.find(nav => location.pathname.startsWith(nav.href))?.name || 'Trajectory'}
            </h1>
          </div>

          <div className="flex items-center gap-4">
            {/* Notifications Dropdown */}
            <div className="relative">
              <button
                onClick={() => setNotificationsOpen(!notificationsOpen)}
                className="p-2 rounded-md border border-border bg-card hover:bg-muted text-muted-foreground hover:text-foreground transition-colors relative"
                aria-label="Toggle notifications"
              >
                <Bell className="h-5 w-5" />
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
              {theme === 'dark' ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
            </button>
          </div>
        </header>

        {/* Content Pane */}
        <main className="flex-1 overflow-y-auto px-6 py-8 md:px-8 bg-background relative">
          <div className="max-w-7xl mx-auto space-y-8 animate-in fade-in duration-300">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
};
