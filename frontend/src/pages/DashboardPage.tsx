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

const COLORS = ['#6366f1', '#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#64748b'];

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
          { title: 'Total Applications', value: metrics.totalApplications, icon: Briefcase, color: 'text-indigo-500 bg-indigo-500/10' },
          { title: 'Active Pipeline', value: metrics.activeApplications, icon: CheckCircle, color: 'text-emerald-500 bg-emerald-500/10' },
          { title: 'Rejected Applications', value: metrics.rejectedApplications, icon: XCircle, color: 'text-rose-500 bg-rose-500/10' },
          { title: 'Ghosted/Inactive', value: metrics.ghostedApplications, icon: Ghost, color: 'text-slate-500 bg-slate-500/10' },
        ].map((card, i) => {
          const Icon = card.icon;
          return (
            <div key={i} className="p-6 rounded-2xl border bg-card glass-card hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-muted-foreground">{card.title}</span>
                <span className={`p-2 rounded-xl ${card.color}`}>
                  <Icon className="h-5 w-5" />
                </span>
              </div>
              <div className="mt-4">
                <span className="text-3xl font-display font-extrabold">{card.value}</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Ratios row */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        {[
          { title: 'Response Rate', value: metrics.responseRate, desc: 'Ratios of positive updates' },
          { title: 'Interview Conversion', value: metrics.interviewConversion, desc: 'Ratio of interview steps secured' },
          { title: 'Offer Conversion', value: metrics.offerConversion, desc: 'Ratio of offers obtained' },
        ].map((ratio, i) => (
          <div key={i} className="p-6 rounded-2xl border bg-card glass-card">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">{ratio.title}</p>
                <p className="text-xs text-muted-foreground mt-0.5">{ratio.desc}</p>
              </div>
              <Percent className="h-5 w-5 text-primary" />
            </div>
            <div className="mt-4 flex items-baseline gap-2">
              <span className="text-3xl font-display font-extrabold text-primary">
                {Math.round(ratio.value)}%
              </span>
              <div className="w-full bg-muted h-1.5 rounded-full overflow-hidden">
                <div 
                  className="bg-primary h-full rounded-full transition-all duration-500" 
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
        <div className="col-span-12 lg:col-span-8 p-6 rounded-2xl border bg-card glass-card">
          <h3 className="text-lg font-display font-bold mb-6">Pipeline Funnel Distribution</h3>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={funnelData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <XAxis dataKey="name" stroke="#94a3b8" fontSize={12} tickLine={false} />
                <YAxis stroke="#94a3b8" fontSize={12} tickLine={false} />
                <Tooltip contentStyle={{ background: '#0f172a', border: '1px solid #334155', borderRadius: '8px' }} />
                <Area type="monotone" dataKey="value" stroke="#6366f1" strokeWidth={2} fillOpacity={1} fill="url(#colorValue)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Agenda widget */}
        <div className="col-span-12 lg:col-span-4 p-6 rounded-2xl border bg-card glass-card flex flex-col">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-display font-bold">Today's Agenda</h3>
            <span className="p-1 px-2.5 rounded-full bg-primary/10 text-primary text-xs font-semibold">
              {metrics.agenda.length} Tasks
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
                  className={`p-4 rounded-xl border flex flex-col justify-between hover:bg-muted/50 transition-colors ${
                    item.type === 'OA' ? 'border-amber-500/20 bg-amber-500/5' : 
                    item.type === 'INTERVIEW' ? 'border-purple-500/20 bg-purple-500/5' : 
                    'border-blue-500/20 bg-blue-500/5'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <span className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold uppercase mb-1.5 ${
                        item.type === 'OA' ? 'bg-amber-500/10 text-amber-500' :
                        item.type === 'INTERVIEW' ? 'bg-purple-500/10 text-purple-500' :
                        'bg-blue-500/10 text-blue-500'
                      }`}>
                        {item.type}
                      </span>
                      <h4 className="text-sm font-semibold truncate max-w-[180px]">{item.companyName}</h4>
                      <p className="text-xs text-muted-foreground truncate max-w-[180px]">{item.roleTitle}</p>
                    </div>
                    {item.link && (
                      <a 
                        href={item.link} 
                        target="_blank" 
                        rel="noreferrer"
                        className="p-1.5 rounded-lg border bg-card hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
                      >
                        <LinkIcon className="h-4 w-4" />
                      </a>
                    )}
                  </div>
                  <div className="mt-3 flex items-center justify-between text-xs text-muted-foreground pt-2 border-t border-border/20">
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
        <div className="p-6 rounded-2xl border bg-card glass-card">
          <h3 className="text-lg font-display font-bold mb-6">Resume Response Comparator</h3>
          <div className="h-72">
            {resumeData.length === 0 ? (
              <div className="flex h-full items-center justify-center text-muted-foreground text-sm">
                No resume statistics available yet.
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={resumeData}>
                  <XAxis dataKey="name" stroke="#94a3b8" fontSize={11} tickLine={false} />
                  <YAxis stroke="#94a3b8" fontSize={11} tickLine={false} />
                  <Tooltip contentStyle={{ background: '#0f172a', border: '1px solid #334155', borderRadius: '8px' }} />
                  <Legend />
                  <Bar dataKey="Response Rate (%)" fill="#6366f1" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="Applications" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* Source Allocation */}
        <div className="p-6 rounded-2xl border bg-card glass-card">
          <h3 className="text-lg font-display font-bold mb-6">Application Source Channels</h3>
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
                      <Tooltip contentStyle={{ background: '#0f172a', border: '1px solid #334155', borderRadius: '8px' }} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <div className="space-y-2 mt-4 md:mt-0">
                  {sourceData.map((item, index) => (
                    <div key={index} className="flex items-center gap-2 text-sm">
                      <span className="w-3.5 h-3.5 rounded-full inline-block" style={{ backgroundColor: item.color }} />
                      <span className="font-medium">{item.name}</span>
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
