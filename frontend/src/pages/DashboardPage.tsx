import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { api } from '../services/api';
import { 
  Briefcase, 
  CheckCircle, 
  XCircle, 
  Ghost,
  Percent,
  Calendar,
  AlertCircle,
  Link as LinkIcon,
  Loader2
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
  AreaChart,
  Area
} from 'recharts';

export const DashboardPage: React.FC = () => {
  const { data: metrics, isLoading, error } = useQuery({
    queryKey: ['dashboard-metrics'],
    queryFn: api.dashboard.getMetrics,
    refetchInterval: 15000, // Auto-refresh metrics every 15s
  });

  if (isLoading) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error || !metrics) {
    return (
      <div className="flex h-[60vh] flex-col items-center justify-center text-center">
        <AlertCircle className="h-12 w-12 text-rose-500 mb-4" />
        <h3 className="text-lg font-semibold">Failed to load dashboard metrics</h3>
        <p className="text-sm text-muted-foreground mt-1">Please check your backend connection.</p>
      </div>
    );
  }

  // Formatting chart data
  const funnelData = [
    { name: 'Applied', value: metrics.totalApplications },
    { name: 'Active', value: metrics.activeApplications },
    { name: 'Rejected', value: metrics.rejectedApplications },
    { name: 'Ghosted', value: metrics.ghostedApplications }
  ];

  const COLORS = ['hsl(var(--primary))', '#3F587A', '#8A5E14', '#6B4079', '#2F6E45', '#8C3A34', '#5C5850'];

  const sourceData = metrics.sourceDistribution.map((item, index) => ({
    name: item.source || 'Other',
    value: item.count,
    color: COLORS[index % COLORS.length]
  }));

  const resumeData = metrics.resumePerformance.map(item => ({
    name: item.label,
    'Response Rate (%)': Math.round(item.responseRate),
    Applications: item.count
  }));

  return (
    <div className="space-y-8">
      {/* High-level counters */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[
          { title: 'TOTAL', value: metrics.totalApplications, icon: Briefcase, color: 'text-primary bg-primary/10' },
          { title: 'ACTIVE', value: metrics.activeApplications, icon: CheckCircle, color: 'text-primary bg-primary/10' },
          { title: 'REJECTED', value: metrics.rejectedApplications, icon: XCircle, color: 'text-destructive bg-destructive/10' },
          { title: 'GHOSTED', value: metrics.ghostedApplications, icon: Ghost, color: 'text-muted-foreground bg-muted' },
        ].map((card, i) => {
          const Icon = card.icon;
          return (
            <div key={i} className="p-6 rounded-lg border bg-card">
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono uppercase tracking-wider text-muted-foreground">{card.title}</span>
                <span className={`p-1.5 rounded-md ${card.color}`}>
                  <Icon className="h-4 w-4" />
                </span>
              </div>
              <div className="mt-4">
                <span className="text-3xl font-mono font-bold text-foreground">{card.value}</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Ratios row */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        {[
          { title: 'RESPONSE RATE', value: metrics.responseRate, desc: 'Ratios of positive updates' },
          { title: 'INTERVIEW CONVERSION', value: metrics.interviewConversion, desc: 'Ratio of interview steps secured' },
          { title: 'OFFER CONVERSION', value: metrics.offerConversion, desc: 'Ratio of offers obtained' },
        ].map((ratio, i) => (
          <div key={i} className="p-6 rounded-lg border bg-card">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-mono uppercase tracking-wider text-muted-foreground">{ratio.title}</p>
                <p className="text-xs text-muted-foreground mt-0.5">{ratio.desc}</p>
              </div>
              <Percent className="h-5 w-5 text-primary" />
            </div>
            <div className="mt-4 flex items-baseline gap-2">
              <span className="text-3xl font-mono font-bold text-primary mr-2">
                {Math.round(ratio.value)}%
              </span>
              <div className="w-full bg-muted h-1.5 rounded-sm overflow-hidden">
                <div 
                  className="bg-primary h-full rounded-sm transition-all duration-500" 
                  style={{ width: `${ratio.value}%` }} 
                />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Middle row: Funnel Chart & Agenda Widget */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        {/* Funnel chart */}
        <div className="col-span-12 lg:col-span-8 p-6 rounded-lg border bg-card">
          <h3 className="text-lg font-display font-bold mb-6 uppercase tracking-tight text-muted-foreground">Pipeline Funnel Distribution</h3>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={funnelData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.2}/>
                    <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <XAxis dataKey="name" stroke="currentColor" className="text-muted-foreground font-mono" fontSize={11} tickLine={false} />
                <YAxis stroke="currentColor" className="text-muted-foreground font-mono" fontSize={11} tickLine={false} />
                <Tooltip 
                  contentStyle={{ 
                    background: 'hsl(var(--card))', 
                    border: '1px solid hsl(var(--border))', 
                    borderRadius: '4px',
                    color: 'hsl(var(--foreground))'
                  }} 
                />
                <Area type="monotone" dataKey="value" stroke="hsl(var(--primary))" strokeWidth={2} fillOpacity={1} fill="url(#colorValue)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Agenda widget */}
        <div className="col-span-12 lg:col-span-4 p-6 rounded-lg border bg-card flex flex-col">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-display font-bold uppercase tracking-tight text-muted-foreground">Today's Agenda</h3>
            <span className="p-1 px-2.5 rounded-md bg-primary/10 text-primary text-xs font-mono">
              {metrics.agenda.length} TASKS
            </span>
          </div>

          <div className="flex-1 overflow-y-auto max-h-[280px] space-y-3 pr-1">
            {metrics.agenda.length === 0 ? (
              <div className="flex h-full flex-col items-center justify-center text-center py-12">
                <Calendar className="h-8 w-8 text-muted-foreground/40 mb-2" />
                <p className="text-sm font-medium text-muted-foreground">All caught up!</p>
                <p className="text-xs text-muted-foreground mt-0.5">No upcoming interviews or follow-ups.</p>
              </div>
            ) : (
              metrics.agenda.map((item) => (
                <div 
                  key={item.id} 
                  className={`p-4 rounded-md border flex flex-col justify-between hover:bg-muted/50 transition-colors ${
                    item.type === 'OA' ? 'border-status-oa-border bg-status-oa-bg/30' : 
                    item.type === 'INTERVIEW' ? 'border-status-interview-border bg-status-interview-bg/30' : 
                    'border-status-applied-border bg-status-applied-bg/30'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <span className={`inline-block px-2 py-0.5 rounded-md text-[10px] font-mono uppercase mb-1.5 ${
                        item.type === 'OA' ? 'bg-status-oa-bg text-status-oa-text border border-status-oa-border' :
                        item.type === 'INTERVIEW' ? 'bg-status-interview-bg text-status-interview-text border border-status-interview-border' :
                        'bg-status-applied-bg text-status-applied-text border border-status-applied-border'
                      }`}>
                        {item.type}
                      </span>
                      <h4 className="text-sm font-semibold truncate max-w-[180px] text-foreground">{item.companyName}</h4>
                      <p className="text-xs text-muted-foreground truncate max-w-[180px]">{item.roleTitle}</p>
                    </div>
                    {item.link && (
                      <a 
                        href={item.link} 
                        target="_blank" 
                        rel="noreferrer"
                        className="p-1.5 rounded-md border border-border bg-card hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
                      >
                        <LinkIcon className="h-4 w-4" />
                      </a>
                    )}
                  </div>
                  <div className="mt-3 flex items-center justify-between text-xs text-muted-foreground pt-2 border-t border-border/20 font-mono">
                    <span>{item.date}</span>
                    <span>{item.time}</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Bottom row: Resume Hits & Source Allocations */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        {/* Resume hits comparator */}
        <div className="p-6 rounded-lg border bg-card">
          <h3 className="text-lg font-display font-bold mb-6 uppercase tracking-tight text-muted-foreground">Resume Response Comparator</h3>
          <div className="h-72">
            {resumeData.length === 0 ? (
              <div className="flex h-full items-center justify-center text-muted-foreground text-sm">
                No resume statistics available yet.
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={resumeData}>
                  <XAxis dataKey="name" stroke="currentColor" className="text-muted-foreground font-mono" fontSize={11} tickLine={false} />
                  <YAxis stroke="currentColor" className="text-muted-foreground font-mono" fontSize={11} tickLine={false} />
                  <Tooltip 
                    contentStyle={{ 
                      background: 'hsl(var(--card))', 
                      border: '1px solid hsl(var(--border))', 
                      borderRadius: '4px',
                      color: 'hsl(var(--foreground))'
                    }} 
                  />
                  <Legend />
                  <Bar dataKey="Response Rate (%)" fill="hsl(var(--primary))" radius={[2, 2, 0, 0]} />
                  <Bar dataKey="Applications" fill="hsl(var(--muted-foreground)/60%)" radius={[2, 2, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* Source Allocation */}
        <div className="p-6 rounded-lg border bg-card">
          <h3 className="text-lg font-display font-bold mb-6 uppercase tracking-tight text-muted-foreground">Application Source Channels</h3>
          <div className="h-72 flex flex-col md:flex-row items-center justify-around">
            {sourceData.length === 0 ? (
              <div className="flex h-full items-center justify-center text-muted-foreground text-sm">
                No source metrics available yet.
              </div>
            ) : (
              <>
                <div className="h-56 w-56">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={sourceData}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={80}
                        paddingAngle={5}
                        dataKey="value"
                      >
                        {sourceData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip 
                        contentStyle={{ 
                          background: 'hsl(var(--card))', 
                          border: '1px solid hsl(var(--border))', 
                          borderRadius: '4px',
                          color: 'hsl(var(--foreground))'
                        }} 
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <div className="space-y-2 mt-4 md:mt-0 font-mono">
                  {sourceData.map((item, index) => (
                    <div key={index} className="flex items-center gap-2 text-sm">
                      <span className="w-3 h-3 rounded-sm inline-block" style={{ backgroundColor: item.color }} />
                      <span className="font-medium text-foreground">{item.name}</span>
                      <span className="text-muted-foreground">({item.value})</span>
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
