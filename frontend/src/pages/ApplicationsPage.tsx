import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { api } from '../services/api';
import type { CareerProfile, Resume } from '../types';
import { 
  Plus, 
  Search, 
  Sparkles, 
  Upload, 
  FileText, 
  Loader2, 
  Briefcase
} from 'lucide-react';
import { SkeletonTable } from '../components/Skeleton';
import { useSidebarStore } from '../store/sidebarStore';

export const ApplicationsPage: React.FC = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const setSidebarContent = useSidebarStore(state => state.setContent);
  const [search, setSearch] = useState('');
  const [profileFilter, setProfileFilter] = useState('');
  const [statusFilters, setStatusFilters] = useState<string[]>([]);
  const [page, setPage] = useState(0);
  const [showArchived, setShowArchived] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isAiModalOpen, setIsAiModalOpen] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  // Sorting state
  const [sortField, setSortField] = useState<'companyName' | 'roleTitle' | 'status' | 'dateApplied' | 'followUpDate'>('dateApplied');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');

  const handleSort = (field: 'companyName' | 'roleTitle' | 'status' | 'dateApplied' | 'followUpDate') => {
    if (sortField === field) {
      setSortDirection(prev => prev === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const renderSortIcon = (field: 'companyName' | 'roleTitle' | 'status' | 'dateApplied' | 'followUpDate') => {
    if (sortField !== field) return null;
    return (
      <span className="ml-1 font-mono text-xs text-primary font-bold">
        {sortDirection === 'asc' ? '↑' : '↓'}
      </span>
    );
  };

  // Form State
  const [companyName, setCompanyName] = useState('');
  const [roleTitle, setRoleTitle] = useState('');
  const [profileId, setProfileId] = useState('');
  const [resumeId, setResumeId] = useState('');
  const [location, setLocation] = useState('');
  const [salaryRange, setSalaryRange] = useState('');
  const [source, setSource] = useState('');
  const [jobDescriptionUrl, setJobDescriptionUrl] = useState('');
  const [jobDescriptionRaw, setJobDescriptionRaw] = useState('');
  const [status, setStatus] = useState('APPLIED');
  const [dateApplied, setDateApplied] = useState(new Date().toISOString().split('T')[0]);
  const [followUpDate, setFollowUpDate] = useState('');
  const [responseDate, setResponseDate] = useState('');
  const [oaDateTime, setOaDateTime] = useState('');
  const [interviewDateTime, setInterviewDateTime] = useState('');
  const [meetingLink, setMeetingLink] = useState('');

  // AI Import State
  const [aiText, setAiText] = useState('');
  const [aiLoading, setAiLoading] = useState(false);

  // Resume Upload State
  const [uploadingResume, setUploadingResume] = useState(false);
  const [resumeFileName, setResumeFileName] = useState('');

  // Fetch profiles
  const { data: profiles = [] } = useQuery<CareerProfile[]>({
    queryKey: ['profiles'],
    queryFn: api.profiles.list,
  });

  // Fetch resumes for selected profile
  const { data: resumes = [] } = useQuery<Resume[]>({
    queryKey: ['resumes', profileId],
    queryFn: () => api.resumes.listForProfile(profileId),
    enabled: !!profileId,
  });

  // Auto-select latest resume when profile resumes update
  React.useEffect(() => {
    if (resumes.length > 0) {
      setResumeId(resumes[0].id);
    } else {
      setResumeId('');
    }
  }, [resumes]);

  // Listen for quick-add query parameter
  React.useEffect(() => {
    if (window.location.search.includes('add=true')) {
      setIsModalOpen(true);
      // Clean up parameter
      navigate('/applications', { replace: true });
    }
  }, [navigate]);

  // Fetch applications
  const { data, isLoading } = useQuery({
    queryKey: ['applications', search, statusFilters, profileFilter, showArchived, page, sortField, sortDirection],
    queryFn: () => api.applications.list({
      search,
      status: statusFilters.length > 0 ? statusFilters : undefined,
      profileId: profileFilter || undefined,
      isArchived: showArchived,
      page,
      size: 9,
      sort: `${sortField},${sortDirection}`
    }),
  });

  // Create Application Mutation
  const createMutation = useMutation({
    mutationFn: api.applications.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['applications'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard-metrics'] });
      resetForm();
      setIsModalOpen(false);
    },
    onError: (err: any) => {
      setErrorMsg(err.message || 'Failed to add application.');
    }
  });

  // AI parse mutation
  const handleAiParse = async () => {
    if (!aiText.trim()) return;
    setAiLoading(true);
    try {
      const data = await api.ai.parseJd(aiText);
      setCompanyName(data.company_name || '');
      setRoleTitle(data.role_title || '');
      setLocation(data.location || '');
      setSalaryRange(data.salary_range || '');
      setJobDescriptionRaw(aiText);
      
      // Auto-suggest profile if matched
      if (data.suggested_profile_title) {
        const matchedProfile = profiles.find(p => p.title.toLowerCase().includes(data.suggested_profile_title.toLowerCase()));
        if (matchedProfile) {
          setProfileId(matchedProfile.id);
        } else if (profiles.length > 0) {
          setProfileId(profiles[0].id);
        }
      }
      setIsAiModalOpen(false);
      setIsModalOpen(true);
    } catch {
      alert('AI failed to parse text. Please enter details manually.');
    } finally {
      setAiLoading(false);
    }
  };

  // Upload Resume within Modal
  const handleResumeUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !profileId) return;

    setUploadingResume(true);
    try {
      const resume = await api.resumes.upload(profileId, file, 'Uploaded via Application creation form.');
      setResumeId(resume.id);
      setResumeFileName(resume.fileName);
    } catch {
      alert('Failed to upload resume');
    } finally {
      setUploadingResume(false);
    }
  };

  const handleCreateApplication = (e: React.FormEvent) => {
    e.preventDefault();
    createMutation.mutate({
      companyName,
      roleTitle,
      profileId,
      resumeId: resumeId || null,
      location: location || null,
      salaryRange: salaryRange || null,
      source: source || null,
      jobDescriptionUrl: jobDescriptionUrl || null,
      jobDescriptionRaw: jobDescriptionRaw || null,
      status,
      dateApplied,
      followUpDate: followUpDate || null,
      responseDate: responseDate || null,
      oaDateTime: oaDateTime ? new Date(oaDateTime).toISOString() : null,
      interviewDateTime: interviewDateTime ? new Date(interviewDateTime).toISOString() : null,
      meetingLink: meetingLink || null
    });
  };

  const resetForm = React.useCallback(() => {
    setCompanyName('');
    setRoleTitle('');
    setProfileId(profiles.length > 0 ? profiles[0].id : '');
    setResumeId('');
    setResumeFileName('');
    setLocation('');
    setSalaryRange('');
    setSource('');
    setJobDescriptionUrl('');
    setJobDescriptionRaw('');
    setStatus('APPLIED');
    setDateApplied(new Date().toISOString().split('T')[0]);
    setFollowUpDate('');
    setResponseDate('');
    setAiText('');
    setErrorMsg('');
    setOaDateTime('');
    setInterviewDateTime('');
    setMeetingLink('');
  }, [profiles]);

  React.useEffect(() => {
    setSidebarContent(
      <div className="space-y-6 animate-in fade-in duration-200">
        <div>
          <h3 className="text-xs font-mono font-bold tracking-wider text-muted-foreground uppercase mb-2">Search</h3>
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search company, role..."
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(0); }}
              className="w-full pl-8 pr-3 py-1.5 bg-background border border-border rounded-[4px] text-xs focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-transparent transition-all"
            />
          </div>
        </div>

        <div>
          <h3 className="text-xs font-mono font-bold tracking-wider text-muted-foreground uppercase mb-2">Career Persona</h3>
          <select
            value={profileFilter}
            onChange={(e) => { setProfileFilter(e.target.value); setPage(0); }}
            className="w-full px-2 py-1.5 bg-background border border-border rounded-[4px] text-xs focus:outline-none focus:ring-2 focus:ring-primary/40 text-foreground"
          >
            <option value="">All Career Personas</option>
            {profiles.map(p => (
              <option key={p.id} value={p.id}>{p.title}</option>
            ))}
          </select>
        </div>

        <div>
          <h3 className="text-xs font-mono font-bold tracking-wider text-muted-foreground uppercase mb-2">Filters</h3>
          <label className="flex items-center gap-2 text-xs text-muted-foreground cursor-pointer select-none">
            <input
              type="checkbox"
              checked={showArchived}
              onChange={(e) => { setShowArchived(e.target.checked); setPage(0); }}
              className="w-4 h-4 accent-teal-700 cursor-pointer border border-border rounded-[4px]"
            />
            <span>Show Archived</span>
          </label>
        </div>

        <div>
          <h3 className="text-xs font-mono font-bold tracking-wider text-muted-foreground uppercase mb-2">Sorting</h3>
          <div className="space-y-2">
            <select
              value={sortField}
              onChange={(e) => { setSortField(e.target.value as any); setPage(0); }}
              className="w-full px-2 py-1.5 bg-background border border-border rounded-[4px] text-xs focus:outline-none focus:ring-2 focus:ring-primary/40 text-foreground"
            >
              <option value="dateApplied">Date Applied</option>
              <option value="companyName">Company Name</option>
              <option value="roleTitle">Role Title</option>
              <option value="status">Status</option>
              <option value="followUpDate">Follow Up Date</option>
            </select>
            <select
              value={sortDirection}
              onChange={(e) => { setSortDirection(e.target.value as any); setPage(0); }}
              className="w-full px-2 py-1.5 bg-background border border-border rounded-[4px] text-xs focus:outline-none focus:ring-2 focus:ring-primary/40 text-foreground"
            >
              <option value="desc">Descending</option>
              <option value="asc">Ascending</option>
            </select>
          </div>
        </div>

        <div className="pt-4 border-t border-border/30 space-y-2">
          <h3 className="text-xs font-mono font-bold tracking-wider text-muted-foreground uppercase mb-2">Quick Actions</h3>
          <button
            type="button"
            onClick={() => { resetForm(); setIsAiModalOpen(true); }}
            className="w-full flex items-center justify-center gap-2 px-3 py-2 border border-primary/30 rounded-md bg-primary/10 hover:bg-primary/20 text-primary text-xs font-semibold transition-all duration-200"
          >
            <Sparkles className="h-3.5 w-3.5" />
            AI Quick Add
          </button>
          <button
            type="button"
            onClick={() => { resetForm(); setIsModalOpen(true); }}
            className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-md bg-primary hover:bg-primary/95 text-primary-foreground text-xs font-semibold transition-all duration-200"
          >
            <Plus className="h-3.5 w-3.5" />
            Add Application
          </button>
        </div>
      </div>
    );
    return () => setSidebarContent(null);
  }, [search, profileFilter, showArchived, sortField, sortDirection, profiles, resetForm, setSidebarContent]);

  return (
    <div className="space-y-6">
      {/* Header and top commands */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-2xl font-display font-extrabold tracking-tight uppercase text-foreground">Applications</h2>
          <p className="text-sm text-muted-foreground">Manage and track your active job application funnel.</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => { resetForm(); setIsAiModalOpen(true); }}
            className="flex items-center justify-center gap-2 px-4 py-2 border border-primary/30 rounded-md bg-primary/10 hover:bg-primary/20 text-primary text-sm font-semibold transition-all duration-200"
          >
            <Sparkles className="h-4 w-4" />
            AI Quick Add
          </button>
          <button
            onClick={() => { resetForm(); setIsModalOpen(true); }}
            className="flex items-center justify-center gap-2 px-4 py-2 rounded-md bg-primary hover:bg-[#0C5A62] dark:hover:bg-[#4CB0BA] text-primary-foreground text-sm font-semibold transition-all duration-200"
          >
            <Plus className="h-4 w-4" />
            Add Application
          </button>
        </div>
      </div>

      {/* Contextual Secondary Navigation */}
      <div className="flex border-b border-border/30 gap-1 overflow-x-auto pb-px">
        {[
          { name: 'All', active: statusFilters.length === 0 && !showArchived, onClick: () => { setStatusFilters([]); setShowArchived(false); setPage(0); } },
          { name: 'Applied', active: statusFilters.length === 1 && statusFilters[0] === 'APPLIED' && !showArchived, onClick: () => { setStatusFilters(['APPLIED']); setShowArchived(false); setPage(0); } },
          { name: 'OA', active: statusFilters.length === 1 && statusFilters[0] === 'OA' && !showArchived, onClick: () => { setStatusFilters(['OA']); setShowArchived(false); setPage(0); } },
          { name: 'Interviews', active: statusFilters.length === 1 && statusFilters[0] === 'INTERVIEW' && !showArchived, onClick: () => { setStatusFilters(['INTERVIEW']); setShowArchived(false); setPage(0); } },
          { name: 'Offers', active: statusFilters.length === 1 && statusFilters[0] === 'OFFER' && !showArchived, onClick: () => { setStatusFilters(['OFFER']); setShowArchived(false); setPage(0); } },
          { name: 'Rejected', active: statusFilters.length === 1 && statusFilters[0] === 'REJECTED' && !showArchived, onClick: () => { setStatusFilters(['REJECTED']); setShowArchived(false); setPage(0); } },
          { name: 'Ghosted', active: statusFilters.length === 1 && statusFilters[0] === 'GHOSTED' && !showArchived, onClick: () => { setStatusFilters(['GHOSTED']); setShowArchived(false); setPage(0); } },
          { name: 'Archived', active: showArchived, onClick: () => { setStatusFilters([]); setShowArchived(true); setPage(0); } }
        ].map((tab) => (
          <button
            key={tab.name}
            type="button"
            onClick={tab.onClick}
            className={`px-4 py-2 text-xs font-mono uppercase tracking-wider border-b-2 -mb-px transition-colors ${
              tab.active
                ? 'border-primary text-foreground font-bold'
                : 'border-transparent text-muted-foreground hover:text-foreground'
            }`}
          >
            {tab.name}
          </button>
        ))}
      </div>



      {/* Grid List */}
      {isLoading ? (
        <SkeletonTable rows={5} cols={5} />
      ) : (
        <div className="space-y-6 animate-in fade-in duration-300">
          <div className="overflow-hidden border-t border-border/30">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-sm">
                <thead>
                  <tr className="border-b border-border/30 bg-transparent">
                    {/* Width 2px placeholder for status line in header */}
                    <th className="w-[2px] p-0" />
                    <th className="px-6 py-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider font-mono">
                      <button 
                        type="button"
                        onClick={() => handleSort('companyName')}
                        className="flex items-center hover:text-foreground focus:outline-none transition-colors"
                      >
                        Company & Role
                        {renderSortIcon('companyName')}
                      </button>
                    </th>
                    <th className="px-6 py-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider font-mono">
                      <button 
                        type="button"
                        onClick={() => handleSort('status')}
                        className="flex items-center hover:text-foreground focus:outline-none transition-colors"
                      >
                        Status
                        {renderSortIcon('status')}
                      </button>
                    </th>
                    <th className="px-6 py-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider font-mono">
                      Linked Resume
                    </th>
                    <th className="px-6 py-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider font-mono">
                      <button 
                        type="button"
                        onClick={() => handleSort('dateApplied')}
                        className="flex items-center hover:text-foreground focus:outline-none transition-colors"
                      >
                        Date Logged
                        {renderSortIcon('dateApplied')}
                      </button>
                    </th>
                    <th className="px-6 py-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider font-mono">
                      <button 
                        type="button"
                        onClick={() => handleSort('followUpDate')}
                        className="flex items-center hover:text-foreground focus:outline-none transition-colors"
                      >
                        Next Action Date
                        {renderSortIcon('followUpDate')}
                      </button>
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {!data || data.content.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="px-6 py-12 text-center text-sm text-muted-foreground font-sans">
                        <div className="flex flex-col items-center justify-center space-y-2">
                          <Briefcase className="h-8 w-8 text-muted-foreground/30 mb-1" />
                          <p className="font-semibold text-foreground">No applications found</p>
                          <p className="text-xs text-muted-foreground max-w-sm">
                            {search || profileFilter || statusFilters.length > 0
                              ? "No applications match your active search filters. Try clearing them."
                              : "Start tracking your career journey by logging your first job application."}
                          </p>
                          {(search || profileFilter || statusFilters.length > 0) ? (
                            <button 
                              type="button"
                              onClick={() => { setSearch(''); setProfileFilter(''); setStatusFilters([]); setPage(0); }}
                              className="mt-2 text-xs font-semibold bg-muted border border-border hover:bg-muted/80 text-foreground px-3 py-1.5 rounded-[4px] transition-colors"
                            >
                              Clear filters
                            </button>
                          ) : (
                            <button 
                              type="button"
                              onClick={() => { resetForm(); setIsModalOpen(true); }}
                              className="mt-2 text-xs font-semibold bg-primary hover:bg-primary/95 text-primary-foreground px-3 py-1.5 rounded-[4px] transition-all"
                            >
                              Add Application
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ) : (
                    data.content.map((app) => (
                      <tr 
                        key={app.id} 
                        onClick={() => navigate(`/applications/${app.id}`)}
                        className="cursor-pointer border-b border-border hover:bg-muted/30 transition-all duration-150 relative group"
                      >
                        {/* 2px left border strip for status */}
                        <td 
                          className="w-[2px] p-0 transition-colors"
                          style={{ backgroundColor: `var(--status-${app.status.toLowerCase()}-border)` }}
                        />
                        <td className="px-6 py-4 font-sans text-sm text-foreground">
                          <div>
                            <span className="font-semibold block text-foreground group-hover:text-primary transition-colors">{app.companyName}</span>
                            <div className="flex items-center gap-2 mt-1 text-xs text-muted-foreground font-sans">
                              <span>{app.roleTitle}</span>
                              <span>•</span>
                              <div className="flex items-center gap-1">
                                <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: app.profile.colorCode }} />
                                <span>{app.profile.title}</span>
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 font-mono text-xs uppercase text-foreground">
                          {app.status}
                        </td>
                        <td className="px-6 py-4">
                          {app.resumeFileName ? (
                            <div className="inline-flex items-center px-1.5 py-0.5 border border-border text-muted-foreground text-xs font-mono rounded-[4px] bg-transparent" title={app.resumeFileName}>
                              <span>v{app.resumeVersion}</span>
                            </div>
                          ) : (
                            <span className="text-xs text-muted-foreground font-sans">No Resume</span>
                          )}
                        </td>
                        <td className="px-6 py-4 text-xs font-mono text-muted-foreground">
                          {new Date(app.dateApplied).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4 text-xs font-mono text-primary font-semibold">
                          {app.followUpDate ? new Date(app.followUpDate).toLocaleDateString() : '-'}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Pagination */}
          {data && data.totalPages > 1 && (
            <div className="flex items-center justify-between border-t border-border/40 pt-4 font-mono">
              <span className="text-xs text-muted-foreground">
                Page {page + 1} of {data.totalPages}
              </span>
              <div className="flex gap-2">
                <button
                  disabled={page === 0}
                  onClick={() => setPage(p => p - 1)}
                  className="p-1 px-3 border border-border rounded-md hover:bg-muted text-xs disabled:opacity-40 transition-colors"
                >
                  PREV
                </button>
                <button
                  disabled={page >= data.totalPages - 1}
                  onClick={() => setPage(p => p + 1)}
                  className="p-1 px-3 border border-border rounded-md hover:bg-muted text-xs disabled:opacity-40 transition-colors"
                >
                  NEXT
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* AI Schedule Invite Parser Modal */}
      {isAiModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <div className="bg-card border border-border p-6 rounded-lg w-full max-w-lg space-y-4 animate-in zoom-in-95 duration-200 shadow-2xl">
            <div>
              <h3 className="text-lg font-display font-extrabold text-foreground flex items-center gap-2 uppercase tracking-tight">
                <Sparkles className="h-5 w-5 text-primary" />
                AI Pipeline Extractor
              </h3>
              <p className="text-xs text-muted-foreground mt-1">Paste a job description or email invitation. We will auto-extract company, role, location, and suggest career profile alignments.</p>
            </div>
            <textarea
              placeholder="Paste Job Description, Invite letter, Recruiter email here..."
              value={aiText}
              onChange={(e) => setAiText(e.target.value)}
              rows={8}
              className="w-full p-3 bg-background border border-border rounded-md text-sm text-foreground placeholder-muted-foreground/60 focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent transition-all"
            />
            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                onClick={() => setIsAiModalOpen(false)}
                className="px-4 py-2 border border-border hover:bg-muted text-sm font-medium text-muted-foreground rounded-md transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleAiParse}
                disabled={aiLoading || !aiText.trim()}
                className="flex items-center justify-center gap-2 px-4 py-2 rounded-md bg-primary text-primary-foreground hover:bg-[#0C5A62] dark:hover:bg-[#4CB0BA] text-sm font-semibold transition-all duration-200 disabled:opacity-50"
              >
                {aiLoading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <>
                    <Sparkles className="h-4 w-4" />
                    Extract Details
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add/Edit Application Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <form 
            onSubmit={handleCreateApplication}
            className="bg-card border border-border p-6 rounded-lg w-full max-w-xl max-h-[85vh] overflow-y-auto space-y-4 animate-in zoom-in-95 duration-200 shadow-2xl"
          >
            <div className="flex items-center justify-between pb-2 border-b border-border">
              <h3 className="text-lg font-display font-extrabold text-foreground uppercase tracking-tight">Add New Job Application</h3>
              <button type="button" onClick={() => setIsModalOpen(false)} className="text-muted-foreground hover:text-foreground">
                ✕
              </button>
            </div>

            {errorMsg && (
              <div className="bg-red-50 dark:bg-red-950/20 border border-red-100 dark:border-red-900/50 p-3 text-red-700 dark:text-red-400 text-xs font-sans rounded-md">
                {errorMsg}
              </div>
            )}

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-foreground">Company Name *</label>
                <input
                  type="text"
                  required
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                  placeholder="e.g. Google"
                  className="w-full px-3 py-2 bg-background border border-border rounded-md text-sm text-foreground placeholder-muted-foreground/60 focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent transition-all"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-foreground">Role Title *</label>
                <input
                  type="text"
                  required
                  value={roleTitle}
                  onChange={(e) => setRoleTitle(e.target.value)}
                  placeholder="e.g. Software Engineer"
                  className="w-full px-3 py-2 bg-background border border-border rounded-md text-sm text-foreground placeholder-muted-foreground/60 focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent transition-all"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-foreground">Career Persona *</label>
                <select
                  required
                  value={profileId}
                  onChange={(e) => setProfileId(e.target.value)}
                  className="w-full px-3 py-2.5 bg-background border border-border rounded-md text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                >
                  <option value="">Select Persona</option>
                  {profiles.map(p => (
                    <option key={p.id} value={p.id}>{p.title}</option>
                  ))}
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-foreground">Status *</label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                  className="w-full px-3 py-2.5 bg-background border border-border rounded-md text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                >
                  <option value="APPLIED">Applied</option>
                  <option value="OA">Online Assessment</option>
                  <option value="INTERVIEW">Interviewing</option>
                  <option value="OFFER">Offer Secured</option>
                  <option value="REJECTED">Rejected</option>
                  <option value="GHOSTED">Ghosted</option>
                  <option value="WITHDRAWN">Withdrawn</option>
                </select>
              </div>
            </div>

            {/* Smart Status Fields */}
            {status === 'OA' && (
              <div className="grid grid-cols-2 gap-4 p-4 rounded-md border border-border bg-muted/30">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-foreground font-display">OA Date & Time</label>
                  <input
                    type="datetime-local"
                    value={oaDateTime}
                    onChange={(e) => setOaDateTime(e.target.value)}
                    className="w-full px-3 py-2 bg-background border border-border rounded-md text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent transition-all"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-foreground font-display">Meeting / Test Link</label>
                  <input
                    type="text"
                    value={meetingLink}
                    onChange={(e) => setMeetingLink(e.target.value)}
                    placeholder="e.g. https://hackerrank.com/..."
                    className="w-full px-3 py-2 bg-background border border-border rounded-md text-sm text-foreground placeholder-muted-foreground/60 focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent transition-all"
                  />
                </div>
              </div>
            )}

            {status === 'INTERVIEW' && (
              <div className="grid grid-cols-2 gap-4 p-4 rounded-md border border-border bg-muted/30">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-foreground">Interview Date & Time</label>
                  <input
                    type="datetime-local"
                    value={interviewDateTime}
                    onChange={(e) => setInterviewDateTime(e.target.value)}
                    className="w-full px-3 py-2 bg-background border border-border rounded-md text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent transition-all"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-foreground">Meeting Link</label>
                  <input
                    type="text"
                    value={meetingLink}
                    onChange={(e) => setMeetingLink(e.target.value)}
                    placeholder="e.g. https://zoom.us/j/..."
                    className="w-full px-3 py-2 bg-background border border-border rounded-md text-sm text-foreground placeholder-muted-foreground/60 focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent transition-all"
                  />
                </div>
              </div>
            )}

            {/* Resume Selection & Upload */}
            <div className="grid grid-cols-2 gap-4 p-4 rounded-md border border-border bg-muted/20">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-foreground flex items-center gap-1">
                  <FileText className="h-3.5 w-3.5 text-primary" />
                  Linked Resume
                </label>
                <select
                  value={resumeId}
                  onChange={(e) => setResumeId(e.target.value)}
                  className="w-full px-3 py-2 bg-background border border-border rounded-md text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                >
                  <option value="">No Resume Linked</option>
                  {resumes.map(r => (
                    <option key={r.id} value={r.id}>Version {r.versionNumber} ({r.fileName})</option>
                  ))}
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-foreground flex items-center gap-1">
                  <Upload className="h-3.5 w-3.5 text-primary" />
                  Upload New Version
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="file"
                    accept="application/pdf"
                    onChange={handleResumeUpload}
                    disabled={uploadingResume || !profileId}
                    className="hidden"
                    id="modal-resume-file"
                  />
                  <label
                    htmlFor="modal-resume-file"
                    className={`w-full flex items-center justify-center gap-2 px-3 py-2 border border-border hover:bg-muted bg-card rounded-md text-xs font-semibold text-foreground cursor-pointer transition-colors ${
                      !profileId ? 'opacity-40 pointer-events-none' : ''
                    }`}
                  >
                    {uploadingResume ? (
                      <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    ) : (
                      'Choose File'
                    )}
                  </label>
                </div>
                {resumeFileName && (
                  <p className="text-[10px] text-emerald-600 dark:text-emerald-400 font-mono truncate mt-0.5">✓ {resumeFileName}</p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-foreground">Location</label>
                <input
                  type="text"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  placeholder="e.g. London, UK (Hybrid)"
                  className="w-full px-3 py-2 bg-background border border-border rounded-md text-sm text-foreground placeholder-muted-foreground/60 focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent transition-all"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-foreground">Salary Target</label>
                <input
                  type="text"
                  value={salaryRange}
                  onChange={(e) => setSalaryRange(e.target.value)}
                  placeholder="e.g. £50k - £60k"
                  className="w-full px-3 py-2 bg-background border border-border rounded-md text-sm text-foreground placeholder-muted-foreground/60 focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent transition-all"
                />
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-foreground">Date Applied</label>
                <input
                  type="date"
                  value={dateApplied}
                  onChange={(e) => setDateApplied(e.target.value)}
                  className="w-full px-3 py-2 bg-background border border-border rounded-md text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-foreground">Next Action Date</label>
                <input
                  type="date"
                  value={followUpDate}
                  onChange={(e) => setFollowUpDate(e.target.value)}
                  className="w-full px-3 py-2 bg-background border border-border rounded-md text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-foreground">Response Date</label>
                <input
                  type="date"
                  value={responseDate}
                  onChange={(e) => setResponseDate(e.target.value)}
                  className="w-full px-3 py-2 bg-background border border-border rounded-md text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-foreground">Job Description URL</label>
                <input
                  type="text"
                  value={jobDescriptionUrl}
                  onChange={(e) => setJobDescriptionUrl(e.target.value)}
                  placeholder="e.g. https://careers.google.com/..."
                  className="w-full px-3 py-2 bg-background border border-border rounded-md text-sm text-foreground placeholder-muted-foreground/60 focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent transition-all"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-foreground">Source Channel</label>
                <input
                  type="text"
                  value={source}
                  onChange={(e) => setSource(e.target.value)}
                  placeholder="e.g. LinkedIn, Referral"
                  className="w-full px-3 py-2 bg-background border border-border rounded-md text-sm text-foreground placeholder-muted-foreground/60 focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent transition-all"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-foreground">Preserved Description</label>
              <textarea
                value={jobDescriptionRaw}
                onChange={(e) => setJobDescriptionRaw(e.target.value)}
                placeholder="Paste the full job description details here..."
                rows={4}
                className="w-full p-2 bg-background border border-border rounded-md text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent transition-all"
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-4 border-t border-border mt-6">
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="px-4 py-2 border border-border hover:bg-muted text-sm font-medium text-muted-foreground rounded-md transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={createMutation.isPending}
                className="flex items-center justify-center gap-2 px-4 py-2 rounded-md bg-primary text-primary-foreground hover:bg-[#0C5A62] dark:hover:bg-[#4CB0BA] text-sm font-semibold transition-all duration-200"
              >
                {createMutation.isPending && <Loader2 className="h-4 w-4 animate-spin" />}
                Save Application
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
