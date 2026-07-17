import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { api } from '../services/api';
import { 
  Briefcase, 
  CheckCircle, 
  Percent,
  AlertCircle,
  Link as LinkIcon,
  Loader2
} from 'lucide-react';
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend
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
  const pipelineData = [
    { status: 'Applied', value: metrics.totalApplications },
    { status: 'Active', value: metrics.activeApplications },
    { status: 'Rejected', value: metrics.rejectedApplications },
    { status: 'Ghosted', value: metrics.ghostedApplications }
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
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* 1-2-Many Metrics Row */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-4">
        {/* Primary Metric: Active Applications */}
        <div className="p-6 rounded-md border border-l-4 border-l-primary bg-card md:col-span-2 flex flex-col justify-between shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono uppercase tracking-wider text-muted-foreground">ACTIVE PIPELINE</span>
            <CheckCircle className="h-4 w-4 text-primary shrink-0" />
          </div>
          <div className="mt-6">
            <span className="text-[56px] font-mono font-bold text-foreground leading-none">
              {metrics.activeApplications}
            </span>
            <p className="text-xs text-muted-foreground mt-2 font-sans">Applications currently in progress</p>
          </div>
        </div>

        {/* Secondary Metric: Total Applications */}
        <div className="p-6 rounded-md border border-border bg-transparent flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono uppercase tracking-wider text-muted-foreground">TOTAL SUBMITTED</span>
            <Briefcase className="h-4 w-4 text-muted-foreground/60 shrink-0" />
          </div>
          <div className="mt-6">
            <span className="text-3xl font-mono font-semibold text-foreground">
              {metrics.totalApplications}
            </span>
            <p className="text-xs text-muted-foreground mt-2 font-sans">Lifetime submissions tracker</p>
          </div>
        </div>

        {/* Secondary Metric: Response Rate */}
        <div className="p-6 rounded-md border border-border bg-transparent flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono uppercase tracking-wider text-muted-foreground">RESPONSE RATE</span>
            <Percent className="h-4 w-4 text-muted-foreground/60 shrink-0" />
          </div>
          <div className="mt-6">
            <span className="text-3xl font-mono font-semibold text-foreground">
              {Math.round(metrics.responseRate)}%
            </span>
            <div className="w-full bg-muted h-1 rounded-full overflow-hidden mt-3.5">
              <div 
                className="bg-primary h-full transition-all duration-500" 
                style={{ width: `${metrics.responseRate}%` }} 
              />
            </div>
          </div>
        </div>
      </div>

      {/* Demoted Tertiary Stat Strip */}
      <div className="flex flex-wrap gap-x-8 gap-y-2 px-6 py-4 rounded-md border border-border/60 bg-muted/10 justify-start items-center text-xs text-muted-foreground">
        <div className="flex items-center gap-2">
          <span>REJECTED</span>
          <span className="font-mono text-lg font-medium text-foreground">{metrics.rejectedApplications}</span>
        </div>
        <div className="h-4 w-[1px] bg-border hidden sm:block" />
        <div className="flex items-center gap-2">
          <span>GHOSTED</span>
          <span className="font-mono text-lg font-medium text-foreground">{metrics.ghostedApplications}</span>
        </div>
        <div className="h-4 w-[1px] bg-border hidden sm:block" />
        <div className="flex items-center gap-2">
          <span>INTERVIEW CONVERSION</span>
          <span className="font-mono text-lg font-medium text-foreground">{Math.round(metrics.interviewConversion)}%</span>
        </div>
        <div className="h-4 w-[1px] bg-border hidden sm:block" />
        <div className="flex items-center gap-2">
          <span>OFFER CONVERSION</span>
          <span className="font-mono text-lg font-medium text-foreground">{Math.round(metrics.offerConversion)}%</span>
        </div>
      </div>

      {/* Middle row: Funnel Chart & Agenda Widget */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        {/* Funnel chart (65%) */}
        <div className="col-span-12 lg:col-span-8 p-6 rounded-md border bg-card">
          <h3 className="text-xs font-mono font-semibold uppercase tracking-wider text-muted-foreground mb-6">Pipeline Funnel Distribution</h3>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={pipelineData} margin={{ top: 20, right: 10, left: -20, bottom: 5 }}>
                <defs>
                  <linearGradient id="funnelColor" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.15}/>
                    <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0.01}/>
                  </linearGradient>
                </defs>
                <XAxis dataKey="status" stroke="hsl(var(--muted-foreground))" className="font-mono text-[10px]" tickLine={false} />
                <YAxis allowDecimals={false} stroke="hsl(var(--muted-foreground))" className="font-mono text-[10px]" tickLine={false} />
                <Tooltip 
                  contentStyle={{ backgroundColor: 'hsl(var(--card))', borderColor: 'hsl(var(--border))', borderRadius: 'var(--radius-md)' }}
                  labelStyle={{ color: 'hsl(var(--foreground))', fontFamily: 'var(--font-sans)', fontWeight: 600 }}
                  itemStyle={{ fontFamily: 'var(--font-mono)', fontSize: '12px' }}
                  cursor={{ stroke: 'hsl(var(--primary)/20%)', strokeWidth: 1 }}
                />
                <Area type="monotone" dataKey="value" stroke="hsl(var(--primary))" strokeWidth={2} fillOpacity={1} fill="url(#funnelColor)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Agenda widget (35%) */}
        <div className="col-span-12 lg:col-span-4 p-6 rounded-md border bg-card flex flex-col justify-between">
          <div className="flex flex-col h-full justify-between">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xs font-mono font-semibold uppercase tracking-wider text-muted-foreground">Today's Agenda</h3>
              <span className="bg-muted text-muted-foreground border border-border rounded-md px-2 py-0.5 font-mono text-[10px]">
                {metrics.agenda.length} TASKS
              </span>
            </div>

            <div className="flex-1 overflow-y-auto max-h-[240px] space-y-3 pr-1">
              {metrics.agenda.length === 0 ? (
                <div className="text-sm text-muted-foreground py-8">
                  No upcoming interviews or follow-ups.
                </div>
              ) : (
                metrics.agenda.map((item) => (
                  <div 
                    key={item.id} 
                    className={`p-3 rounded-md border flex flex-col justify-between hover:bg-muted/30 transition-all duration-150 ${
                      item.type === 'OA' ? 'border-status-oa-border bg-status-oa-bg/15' : 
                      item.type === 'INTERVIEW' ? 'border-status-interview-border bg-status-interview-bg/15' : 
                      'border-status-applied-border bg-status-applied-bg/15'
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <span className={`inline-block px-1.5 py-0.5 rounded-[2px] text-[9px] font-mono uppercase mb-1 ${
                          item.type === 'OA' ? 'bg-status-oa-bg text-status-oa-text border border-status-oa-border' :
                          item.type === 'INTERVIEW' ? 'bg-status-interview-bg text-status-interview-text border border-status-interview-border' :
                          'bg-status-applied-bg text-status-applied-text border border-status-applied-border'
                        }`}>
                          {item.type}
                        </span>
                        <h4 className="text-xs font-semibold truncate max-w-[160px] text-foreground">{item.companyName}</h4>
                        <p className="text-[10px] text-muted-foreground truncate max-w-[160px]">{item.roleTitle}</p>
                      </div>
                      {item.link && (
                        <a 
                          href={item.link} 
                          target="_blank" 
                          rel="noreferrer"
                          className="p-1 rounded-md border border-border bg-card hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
                        >
                          <LinkIcon className="h-3 w-3" />
                        </a>
                      )}
                    </div>
                    <div className="mt-2.5 flex items-center justify-between text-[10px] text-muted-foreground pt-1.5 border-t border-border/10 font-mono">
                      <span>{item.date}</span>
                      <span>{item.time}</span>
                    </div>
                  </div>
                ))
              )}
            </div>
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
                    contentStyle={{ backgroundColor: 'hsl(var(--card))', borderColor: 'hsl(var(--border))', borderRadius: 'var(--radius-md)' }}
                    labelStyle={{ color: 'hsl(var(--foreground))' }}
                    cursor={{ fill: 'rgba(255,255,255,0.05)' }}
                    position={{ y: -40 }} 
                    offset={10}
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
