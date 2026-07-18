import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { api } from '../services/api';
import { useThemeStore } from '../store/themeStore';
import { 
  Clock, 
  CheckSquare, 
  Square, 
  Plus, 
  ArrowRight,
  FileText,
  Users,
  Compass,
  Link as LinkIcon,
  Loader2,
  Moon,
  Sun
} from 'lucide-react';

interface ChecklistItem {
  id: string;
  text: string;
  completed: boolean;
}

export const HomePage: React.FC = () => {
  const navigate = useNavigate();
  const { theme, toggleTheme } = useThemeStore();

  // Queries
  const { data: userProfile } = useQuery({
    queryKey: ['user-settings-profile'],
    queryFn: api.users.getProfile,
  });

  const { data: metrics, isLoading: metricsLoading } = useQuery({
    queryKey: ['dashboard-metrics'],
    queryFn: api.dashboard.getMetrics,
  });

  const { data: recentApps, isLoading: appsLoading } = useQuery({
    queryKey: ['recent-applications'],
    queryFn: () => api.applications.list({ page: 0, size: 3, sort: 'dateApplied,desc' }),
  });

  // Local Storage States
  const [weeklyGoal, setWeeklyGoal] = useState(() => {
    return localStorage.getItem('trajectory_weekly_goal') || 'Submit 3 tailored applications & network with 2 recruiters';
  });
  const [dailyFocus, setDailyFocus] = useState(() => {
    return localStorage.getItem('trajectory_daily_focus') || 'Prepare for upcoming coding rounds and optimize profile tags';
  });
  const [checklist, setChecklist] = useState<ChecklistItem[]>(() => {
    const saved = localStorage.getItem('trajectory_daily_checklist');
    if (saved) return JSON.parse(saved);
    return [
      { id: '1', text: 'Tailor resume for pending Frontend Engineer application', completed: false },
      { id: '2', text: 'Follow up with recruiter regarding OA link', completed: false },
      { id: '3', text: 'Review Spring Boot REST API architectures', completed: true },
    ];
  });

  useEffect(() => {
    localStorage.setItem('trajectory_weekly_goal', weeklyGoal);
  }, [weeklyGoal]);

  useEffect(() => {
    localStorage.setItem('trajectory_daily_focus', dailyFocus);
  }, [dailyFocus]);

  useEffect(() => {
    localStorage.setItem('trajectory_daily_checklist', JSON.stringify(checklist));
  }, [checklist]);

  // Greeting helper
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 17) return 'Good afternoon';
    return 'Good evening';
  };

  const handleToggleChecklist = (id: string) => {
    setChecklist(prev => prev.map(item => 
      item.id === id ? { ...item, completed: !item.completed } : item
    ));
  };

  const handleAddChecklistItem = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && e.currentTarget.value.trim()) {
      const text = e.currentTarget.value.trim();
      setChecklist(prev => [
        ...prev,
        { id: Date.now().toString(), text, completed: false }
      ]);
      e.currentTarget.value = '';
    }
  };

  const handleRemoveChecklistItem = (id: string) => {
    setChecklist(prev => prev.filter(item => item.id !== id));
  };

  const isLoading = metricsLoading || appsLoading;

  if (isLoading) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  const initials = userProfile?.fullName
    ? userProfile.fullName.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
    : 'U';

  const agendaTasks = metrics?.agenda || [];

  return (
    <div className="space-y-12 animate-in fade-in duration-300">
      {/* 1. Welcoming & User Context */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 border-b border-border/30 pb-8">
        <div className="flex items-center gap-4">
          {userProfile?.avatarUrl ? (
            <img
              src={userProfile.avatarUrl}
              alt="Profile"
              className="w-16 h-16 rounded-full object-cover border border-border"
              onError={(e) => {
                (e.target as HTMLImageElement).src = `https://api.dicebear.com/7.x/initials/svg?seed=${userProfile?.fullName || 'U'}`;
              }}
            />
          ) : (
            <div className="w-16 h-16 rounded-full bg-primary/10 text-primary flex items-center justify-center font-mono font-bold text-xl border border-primary/20">
              {initials}
            </div>
          )}
          <div>
            <h2 className="text-2xl font-display font-bold tracking-tight text-foreground">
              {getGreeting()}, {userProfile?.fullName ? userProfile.fullName.split(' ')[0] : 'User'}.
            </h2>
            <p className="text-xs font-mono text-muted-foreground uppercase tracking-wider mt-1 flex items-center gap-1.5">
              <Compass className="h-3.5 w-3.5 text-primary" />
              Active Persona: {metrics?.activeApplications ?? 0} roles in funnel
            </p>
          </div>
        </div>

        {/* Quick focus input blocks */}
        <div className="flex-1 max-w-md space-y-2.5 font-sans">
          <div className="flex flex-col gap-1 text-xs">
            <span className="font-mono text-[9px] font-bold text-muted-foreground uppercase tracking-wider">Weekly Target</span>
            <input
              type="text"
              value={weeklyGoal}
              onChange={(e) => setWeeklyGoal(e.target.value)}
              className="w-full bg-transparent border-b border-border/40 pb-1 text-foreground placeholder-muted-foreground focus:outline-none focus:border-primary text-xs"
            />
          </div>
          <div className="flex flex-col gap-1 text-xs">
            <span className="font-mono text-[9px] font-bold text-muted-foreground uppercase tracking-wider">Daily Workspace Focus</span>
            <input
              type="text"
              value={dailyFocus}
              onChange={(e) => setDailyFocus(e.target.value)}
              className="w-full bg-transparent border-b border-border/40 pb-1 text-foreground placeholder-muted-foreground focus:outline-none focus:border-primary text-xs font-medium"
            />
          </div>
        </div>
      </div>

      {/* 2. Three Column Core Layout */}
      <div className="grid grid-cols-1 gap-12 lg:grid-cols-12">
        {/* Left 8 columns: Workflow work blocks */}
        <div className="lg:col-span-8 space-y-12">
          
          {/* Section: Continue where you left off */}
          <div className="space-y-4">
            <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-muted-foreground">Continue Where You Left Off</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {recentApps?.content.slice(0, 3).map((app) => (
                <div 
                  key={app.id}
                  onClick={() => navigate(`/applications/${app.id}`)}
                  className="p-4 rounded-[4px] border border-border/30 hover:border-primary/40 cursor-pointer hover:bg-muted/15 transition-all duration-150 flex flex-col justify-between h-[110px]"
                >
                  <div>
                    <h4 className="text-sm font-semibold truncate text-foreground">{app.companyName}</h4>
                    <p className="text-xs text-muted-foreground mt-0.5 truncate">{app.roleTitle}</p>
                  </div>
                  <div className="flex items-center justify-between mt-2.5 pt-2 border-t border-border/10 font-mono text-[10px] text-muted-foreground">
                    <span className="uppercase">{app.status}</span>
                    <span>{new Date(app.dateApplied).toLocaleDateString()}</span>
                  </div>
                </div>
              ))}
              {(!recentApps || recentApps.content.length === 0) && (
                <div className="col-span-3 text-xs text-muted-foreground py-6 font-sans">
                  No active job applications found. Create one from the actions block or navbar.
                </div>
              )}
            </div>
          </div>

          {/* Section: Focus agenda (interviews & followups) */}
          <div className="space-y-4 pt-4 border-t border-border/30">
            <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-muted-foreground">Agenda & Deadlines</h3>
            {agendaTasks.length === 0 ? (
              <p className="text-xs text-muted-foreground py-2">You have no interviews or follow-ups scheduled for today. You are all caught up!</p>
            ) : (
              <div className="space-y-3">
                {agendaTasks.map((item) => (
                  <div 
                    key={item.id}
                    className={`p-3.5 rounded-[4px] border flex items-center justify-between hover:bg-muted/20 transition-all ${
                      item.type === 'OA' ? 'border-status-oa-border/50 bg-status-oa-bg/5' : 
                      item.type === 'INTERVIEW' ? 'border-status-interview-border/50 bg-status-interview-bg/5' : 
                      'border-status-applied-border/50 bg-status-applied-bg/5'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <Clock className={`h-4 w-4 shrink-0 ${
                        item.type === 'OA' ? 'text-status-oa-text' : 
                        item.type === 'INTERVIEW' ? 'text-status-interview-text' : 
                        'text-status-applied-text'
                      }`} />
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold text-foreground">{item.companyName}</span>
                          <span className="text-[9px] font-mono font-bold uppercase px-1.5 py-0.5 rounded-[2px] border border-border/60 bg-muted/60">
                            {item.type}
                          </span>
                        </div>
                        <p className="text-[11px] text-muted-foreground font-sans mt-0.5">{item.roleTitle} — {item.time} ({item.date})</p>
                      </div>
                    </div>
                    {item.link && (
                      <a 
                        href={item.link} 
                        target="_blank" 
                        rel="noreferrer"
                        className="flex items-center gap-1.5 px-2.5 py-1 text-[10px] font-mono border border-border bg-card hover:bg-muted text-muted-foreground hover:text-foreground rounded-[4px] transition-colors"
                      >
                        <LinkIcon className="h-3 w-3" />
                        Meeting
                      </a>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right 4 columns: Personal daily Checklist & Shortcuts */}
        <div className="lg:col-span-4 space-y-10 lg:pl-8 border-t lg:border-t-0 lg:border-l border-border/30 pt-10 lg:pt-0">
          
          {/* Daily manual checklist */}
          <div className="space-y-4">
            <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-muted-foreground">Workspace Task List</h3>
            
            <div className="space-y-2">
              {checklist.map(item => (
                <div key={item.id} className="flex items-start justify-between gap-2 text-xs group">
                  <button 
                    onClick={() => handleToggleChecklist(item.id)}
                    className="flex items-start gap-2.5 text-left text-foreground hover:text-primary transition-colors py-0.5"
                  >
                    {item.completed ? (
                      <CheckSquare className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                    ) : (
                      <Square className="h-4 w-4 text-muted-foreground shrink-0 mt-0.5" />
                    )}
                    <span className={`leading-relaxed ${item.completed ? 'line-through text-muted-foreground/60' : 'text-foreground/90'}`}>
                      {item.text}
                    </span>
                  </button>
                  <button
                    onClick={() => handleRemoveChecklistItem(item.id)}
                    className="text-muted-foreground/40 hover:text-destructive opacity-0 group-hover:opacity-100 transition-opacity text-[10px] font-mono py-0.5 font-bold"
                  >
                    ✕
                  </button>
                </div>
              ))}
              
              <div className="pt-2">
                <input
                  type="text"
                  placeholder="+ Add new daily task (Press Enter)"
                  onKeyDown={handleAddChecklistItem}
                  className="w-full px-2.5 py-1.5 bg-muted/30 border border-border/60 rounded-[4px] text-xs text-foreground placeholder-muted-foreground focus:outline-none focus:border-primary transition-colors font-sans"
                />
              </div>
            </div>
          </div>

          {/* Quick Actions Shortcuts */}
          <div className="space-y-4 pt-6 border-t border-border/30">
            <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-muted-foreground">Quick Shortcuts</h3>
            <div className="flex flex-col gap-2 font-mono text-[11px] text-muted-foreground">
              <button 
                onClick={() => navigate('/applications?add=true')}
                className="flex items-center justify-between p-2 rounded-[4px] border border-border/40 hover:border-primary/30 hover:bg-muted/15 transition-all text-left group"
              >
                <span className="flex items-center gap-2 group-hover:text-foreground">
                  <Plus className="h-3.5 w-3.5 text-primary" />
                  LOG APPLICATION
                </span>
                <ArrowRight className="h-3 w-3 opacity-0 group-hover:opacity-100 transition-opacity" />
              </button>
              
              <button 
                onClick={() => navigate('/outreach?add=true')}
                className="flex items-center justify-between p-2 rounded-[4px] border border-border/40 hover:border-primary/30 hover:bg-muted/15 transition-all text-left group"
              >
                <span className="flex items-center gap-2 group-hover:text-foreground">
                  <Users className="h-3.5 w-3.5 text-primary" />
                  CONTACT RECRUITER
                </span>
                <ArrowRight className="h-3 w-3 opacity-0 group-hover:opacity-100 transition-opacity" />
              </button>

              <button 
                onClick={() => navigate('/resumes?add=true')}
                className="flex items-center justify-between p-2 rounded-[4px] border border-border/40 hover:border-primary/30 hover:bg-muted/15 transition-all text-left group"
              >
                <span className="flex items-center gap-2 group-hover:text-foreground">
                  <FileText className="h-3.5 w-3.5 text-primary" />
                  UPLOAD NEW RESUME
                </span>
                <ArrowRight className="h-3 w-3 opacity-0 group-hover:opacity-100 transition-opacity" />
              </button>

              <button 
                onClick={toggleTheme}
                className="flex items-center justify-between p-2 rounded-[4px] border border-border/40 hover:border-primary/30 hover:bg-muted/15 transition-all text-left group"
              >
                <span className="flex items-center gap-2 group-hover:text-foreground">
                  {theme === 'dark' ? <Sun className="h-3.5 w-3.5 text-primary" /> : <Moon className="h-3.5 w-3.5 text-primary" />}
                  TOGGLE THEME MODE
                </span>
                <ArrowRight className="h-3 w-3 opacity-0 group-hover:opacity-100 transition-opacity" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
