import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { api } from '../services/api';
import { useSidebarStore } from '../store/sidebarStore';
import { 
  AlertCircle,
  Loader2
} from 'lucide-react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from 'recharts';

export const AnalyticsPage: React.FC = () => {
  const [timeRange, setTimeRange] = React.useState('all-time');
  const setSidebarContent = useSidebarStore(state => state.setContent);

  const { data: metrics, isLoading, error } = useQuery({
    queryKey: ['dashboard-metrics'],
    queryFn: api.dashboard.getMetrics,
    refetchInterval: 15000,
  });

  const handleExportCSV = async () => {
    try {
      const response = await api.applications.list({ page: 0, size: 1000 });
      const apps = response.content;
      let csvContent = "Company,Title,Status,Salary,DateApplied,Location,Link\n";
      apps.forEach(app => {
        const cleanCompany = (app.companyName || '').replace(/"/g, '""');
        const cleanTitle = (app.roleTitle || '').replace(/"/g, '""');
        const cleanLocation = (app.location || '').replace(/"/g, '""');
        csvContent += `"${cleanCompany}","${cleanTitle}","${app.status}","${app.salaryRange || ''}","${app.dateApplied || ''}","${cleanLocation}","${app.jobDescriptionUrl || ''}"\n`;
      });
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `trajectory-applications-analytics-${new Date().toISOString().split('T')[0]}.csv`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    } catch {
      alert("Failed to export CSV");
    }
  };

  React.useEffect(() => {
    if (!metrics) return;
    setSidebarContent(
      <div className="space-y-6 animate-in fade-in duration-200">
        <div>
          <h3 className="text-xs font-mono font-bold tracking-wider text-muted-foreground uppercase mb-2">Time Range</h3>
          <select
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value)}
            className="w-full px-2 py-1.5 bg-background border border-border rounded-[4px] text-xs focus:outline-none focus:ring-2 focus:ring-primary/40 text-foreground"
          >
            <option value="all-time">All Time</option>
            <option value="30-days">Last 30 Days</option>
            <option value="90-days">Last 90 Days</option>
            <option value="180-days">Last 6 Months</option>
          </select>
        </div>

        <div>
          <h3 className="text-xs font-mono font-bold tracking-wider text-muted-foreground uppercase mb-2">Metrics Summary</h3>
          <div className="space-y-2 font-sans text-xs text-muted-foreground">
            <div className="flex justify-between border-b border-border/30 pb-1">
              <span>Total Logged</span>
              <span className="font-semibold text-foreground font-mono">{metrics.totalApplications}</span>
            </div>
            <div className="flex justify-between border-b border-border/30 pb-1">
              <span>Active Pipeline</span>
              <span className="font-semibold text-foreground font-mono">{metrics.activeApplications}</span>
            </div>
            <div className="flex justify-between border-b border-border/30 pb-1">
              <span>Response Rate</span>
              <span className="font-semibold text-foreground font-mono">
                {metrics.totalApplications > 0 
                  ? ((metrics.activeApplications / metrics.totalApplications) * 100).toFixed(1) + '%' 
                  : '0%'}
              </span>
            </div>
          </div>
        </div>

        <div className="pt-4 border-t border-border/30 space-y-2">
          <h3 className="text-xs font-mono font-bold tracking-wider text-muted-foreground uppercase mb-2">Options</h3>
          <button
            onClick={handleExportCSV}
            className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-md bg-primary hover:bg-primary/95 text-primary-foreground text-xs font-semibold transition-all duration-200"
          >
            Export CSV Spreadsheet
          </button>
        </div>
      </div>
    );
    return () => setSidebarContent(null);
  }, [metrics, timeRange, setSidebarContent]);

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
        <h3 className="text-lg font-semibold">Failed to load analytics metrics</h3>
        <p className="text-sm text-muted-foreground mt-1">Please check your backend connection.</p>
      </div>
    );
  }

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
    <div className="space-y-12 animate-in fade-in duration-300">
      {/* Page Header */}
      <div>
        <h2 className="text-2xl font-display font-extrabold tracking-tight uppercase text-foreground">Pipeline Analytics</h2>
        <p className="text-sm text-muted-foreground">Comprehensive overview of funnel statistics, channels, and conversion rates.</p>
      </div>

      {/* 1-2-Many Metrics Row */}
      <div className="grid grid-cols-1 gap-8 md:grid-cols-4 py-2 border-b border-border/30 pb-6">
        {/* Primary Metric: Active Applications */}
        <div className="md:col-span-2 flex flex-col justify-between py-2 pr-6 border-b md:border-b-0 md:border-r border-border/30">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono font-bold uppercase tracking-wider text-muted-foreground">Active Pipeline</span>
          </div>
          <div className="flex items-baseline gap-2 mt-4">
            <span className="text-[56px] font-mono font-extrabold tracking-tight text-foreground">{metrics.activeApplications}</span>
            <span className="text-xs text-muted-foreground font-mono">active roles</span>
          </div>
        </div>

        {/* Secondary Metric 1: Total Submitted */}
        <div className="flex flex-col justify-between py-2 px-0 md:px-6 border-b md:border-b-0 md:border-r border-border/30">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono font-bold uppercase tracking-wider text-muted-foreground">Total Logged</span>
          </div>
          <div className="mt-4">
            <span className="text-3xl font-mono font-bold text-foreground">{metrics.totalApplications}</span>
            <span className="text-xs text-muted-foreground font-mono block mt-1">all-time logged</span>
          </div>
        </div>

        {/* Secondary Metric 2: Response Rate */}
        <div className="flex flex-col justify-between py-2 pl-0 md:pl-6">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono font-bold uppercase tracking-wider text-muted-foreground">Response Rate</span>
          </div>
          <div className="mt-4">
            <span className="text-3xl font-mono font-bold text-foreground">{Math.round(metrics.responseRate)}%</span>
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
      <div className="flex flex-wrap items-center gap-x-12 gap-y-4 py-2.5 text-xs text-muted-foreground border-b border-border/30 pb-6">
        <div className="flex items-center gap-2">
          <span className="font-mono font-bold">REJECTED</span>
          <span className="font-mono text-lg font-medium text-foreground">{metrics.rejectedApplications}</span>
        </div>
        <div className="h-4 w-[1px] bg-border/40 hidden sm:block" />
        <div className="flex items-center gap-2">
          <span className="font-mono font-bold">GHOSTED</span>
          <span className="font-mono text-lg font-medium text-foreground">{metrics.ghostedApplications}</span>
        </div>
        <div className="h-4 w-[1px] bg-border/40 hidden sm:block" />
        <div className="flex items-center gap-2">
          <span className="font-mono font-bold">INTERVIEW CONVERSION</span>
          <span className="font-mono text-lg font-medium text-foreground">{Math.round(metrics.interviewConversion)}%</span>
        </div>
        <div className="h-4 w-[1px] bg-border/40 hidden sm:block" />
        <div className="flex items-center gap-2">
          <span className="font-mono font-bold">OFFER CONVERSION</span>
          <span className="font-mono text-lg font-medium text-foreground">{Math.round(metrics.offerConversion)}%</span>
        </div>
      </div>

      {/* Full-width Funnel Chart */}
      <div className="py-2 border-b border-border/30 pb-6">
        <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-muted-foreground mb-6">Pipeline Funnel Distribution</h3>
        <div className="h-72">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={pipelineData} margin={{ top: 20, right: 10, left: -20, bottom: 5 }}>
              <defs>
                <linearGradient id="funnelColor" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="white" stopOpacity={0.10}/>
                  <stop offset="95%" stopColor="white" stopOpacity={0.00}/>
                </linearGradient>
              </defs>
              <XAxis dataKey="status" stroke="hsl(var(--muted-foreground))" className="font-mono text-[10px]" tickLine={false} />
              <YAxis allowDecimals={false} stroke="hsl(var(--muted-foreground))" className="font-mono text-[10px]" tickLine={false} />
              <Tooltip 
                contentStyle={{ backgroundColor: 'hsl(var(--card))', borderColor: 'hsl(var(--border))', borderRadius: '4px' }}
                labelStyle={{ color: 'hsl(var(--foreground))', fontFamily: 'var(--font-sans)', fontWeight: 600 }}
                itemStyle={{ fontFamily: 'var(--font-mono)', fontSize: '12px' }}
                cursor={{ stroke: 'hsl(var(--primary)/20%)', strokeWidth: 1 }}
              />
              <Area type="monotone" dataKey="value" stroke="hsl(var(--primary))" strokeWidth={2} fillOpacity={1} fill="url(#funnelColor)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Bottom row: Resume Hits & Source Allocations */}
      <div className="grid grid-cols-1 gap-8 md:grid-cols-2 pt-2">
        {/* Resume hits comparator */}
        <div className="py-2">
          <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-muted-foreground mb-6">Resume Response Comparator</h3>
          <div className="h-72">
            {resumeData.length === 0 ? (
              <div className="flex h-full items-center justify-center text-muted-foreground text-sm">
                No resume statistics available yet.
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={resumeData} margin={{ top: 20, right: 10, left: -20, bottom: 5 }}>
                  <XAxis dataKey="name" stroke="hsl(var(--muted-foreground))" className="font-mono text-[10px]" tickLine={false} />
                  <YAxis unit="%" stroke="hsl(var(--muted-foreground))" className="font-mono text-[10px]" tickLine={false} />
                  <Tooltip 
                    contentStyle={{ 
                      background: 'hsl(var(--card))', 
                      border: '1px solid hsl(var(--border))', 
                      borderRadius: '4px',
                      color: 'hsl(var(--foreground))'
                    }} 
                  />
                  <Area type="monotone" dataKey="Response Rate (%)" stroke="hsl(var(--primary))" fill="transparent" strokeWidth={2} />
                </AreaChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* Source Allocation */}
        <div className="py-2 pl-0 md:pl-8 border-t md:border-t-0 md:border-l border-border/30">
          <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-muted-foreground mb-6">Application Source Channels</h3>
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
                    <div key={index} className="flex items-center gap-2 text-xs">
                      <span className="w-2.5 h-2.5 rounded-sm inline-block" style={{ backgroundColor: item.color }} />
                      <span className="font-semibold text-foreground">{item.name}</span>
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
