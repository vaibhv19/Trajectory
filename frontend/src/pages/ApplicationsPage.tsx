import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { api } from '../services/api';
import type { CareerProfile } from '../types';
import { 
  Plus, 
  Search, 
  Sparkles, 
  Upload, 
  FileText, 
  Eye, 
  ChevronLeft, 
  ChevronRight, 
  Loader2, 
  Briefcase
} from 'lucide-react';

export const ApplicationsPage: React.FC = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [search, setSearch] = useState('');
  const [profileFilter, setProfileFilter] = useState('');
  const [statusFilters, setStatusFilters] = useState<string[]>([]);
  const [page, setPage] = useState(0);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isAiModalOpen, setIsAiModalOpen] = useState(false);

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

  // Fetch applications
  const { data, isLoading } = useQuery({
    queryKey: ['applications', search, statusFilters, profileFilter, page],
    queryFn: () => api.applications.list({
      search,
      status: statusFilters.length > 0 ? statusFilters : undefined,
      profileId: profileFilter || undefined,
      page,
      size: 9,
      sort: 'dateApplied,desc'
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
    } catch (error) {
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
    } catch (err) {
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
      followUpDate: followUpDate || null
    });
  };

  const resetForm = () => {
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
    setAiText('');
  };

  const toggleStatusFilter = (status: string) => {
    setStatusFilters(prev => 
      prev.includes(status) ? prev.filter(s => s !== status) : [...prev, status]
    );
    setPage(0);
  };

  const statusColors: Record<string, string> = {
    APPLIED: 'bg-blue-500/10 text-blue-500 border-blue-500/20',
    OA: 'bg-amber-500/10 text-amber-500 border-amber-500/20',
    INTERVIEW: 'bg-purple-500/10 text-purple-500 border-purple-500/20',
    OFFER: 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20',
    REJECTED: 'bg-rose-500/10 text-rose-500 border-rose-500/20',
    GHOSTED: 'bg-slate-500/10 text-slate-500 border-slate-500/20',
    WITHDRAWN: 'bg-zinc-500/10 text-zinc-500 border-zinc-500/20',
  };

  return (
    <div className="space-y-6">
      {/* Header and top commands */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-2xl font-display font-extrabold">Applications</h2>
          <p className="text-sm text-muted-foreground">Manage and track your active job application funnel.</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => { resetForm(); setIsAiModalOpen(true); }}
            className="flex items-center justify-center gap-2 px-4 py-2 border border-primary/30 rounded-xl bg-primary/10 hover:bg-primary/20 text-primary text-sm font-semibold transition-all duration-200"
          >
            <Sparkles className="h-4 w-4" />
            AI Quick Add
          </button>
          <button
            onClick={() => { resetForm(); setIsModalOpen(true); }}
            className="flex items-center justify-center gap-2 px-4 py-2 rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground text-sm font-semibold transition-all duration-200 shadow-md shadow-primary/10"
          >
            <Plus className="h-4 w-4" />
            Add Application
          </button>
        </div>
      </div>

      {/* Filters Section */}
      <div className="p-4 rounded-xl border bg-card glass-card flex flex-col gap-4">
        {/* Search & Profile select */}
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute inset-y-0 left-0 pl-3 h-full w-4 text-muted-foreground flex items-center" />
            <input
              type="text"
              placeholder="Search company, role or location..."
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(0); }}
              className="w-full pl-9 pr-3 py-2 bg-background border rounded-lg text-sm placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
            />
          </div>
          <select
            value={profileFilter}
            onChange={(e) => { setProfileFilter(e.target.value); setPage(0); }}
            className="px-3 py-2 bg-background border rounded-lg text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
          >
            <option value="">All Career Profiles</option>
            {profiles.map(p => (
              <option key={p.id} value={p.id}>{p.title}</option>
            ))}
          </select>
        </div>

        {/* Status filters */}
        <div className="flex flex-wrap gap-2">
          {['APPLIED', 'OA', 'INTERVIEW', 'OFFER', 'REJECTED', 'GHOSTED', 'WITHDRAWN'].map((stat) => {
            const isChecked = statusFilters.includes(stat);
            return (
              <button
                key={stat}
                onClick={() => toggleStatusFilter(stat)}
                className={`px-3 py-1 rounded-full text-xs font-semibold border transition-all ${
                  isChecked
                    ? 'bg-primary text-primary-foreground border-primary shadow-sm'
                    : 'bg-muted/50 border-border text-muted-foreground hover:bg-muted'
                }`}
              >
                {stat}
              </button>
            );
          })}
        </div>
      </div>

      {/* Grid List */}
      {isLoading ? (
        <div className="flex h-[40vh] items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : !data || data.content.length === 0 ? (
        <div className="flex h-[40vh] flex-col items-center justify-center text-center border border-dashed rounded-2xl p-12">
          <Briefcase className="h-10 w-10 text-muted-foreground/30 mb-2" />
          <h4 className="text-sm font-semibold">No applications found</h4>
          <p className="text-xs text-muted-foreground mt-0.5">Try adjusting your search filters or add a new application.</p>
        </div>
      ) : (
        <div className="space-y-6">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {data.content.map((app) => (
              <div 
                key={app.id} 
                onClick={() => navigate(`/applications/${app.id}`)}
                className="p-6 rounded-xl border bg-card glass-card hover:shadow-md hover:border-primary/20 transition-all duration-200 cursor-pointer flex flex-col justify-between h-48 relative overflow-hidden group"
              >
                {/* Profile tag indicator */}
                <div 
                  className="absolute top-0 left-0 w-full h-[3px]" 
                  style={{ backgroundColor: app.profile.colorCode }} 
                />

                <div className="space-y-2">
                  <div className="flex items-start justify-between">
                    <div>
                      <h4 className="text-base font-semibold truncate max-w-[170px]">{app.companyName}</h4>
                      <p className="text-sm text-muted-foreground truncate max-w-[170px]">{app.roleTitle}</p>
                    </div>
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${statusColors[app.status]}`}>
                      {app.status}
                    </span>
                  </div>

                  <div className="flex flex-col gap-1 pt-2">
                    <p className="text-xs text-muted-foreground truncate">
                      {app.location || 'Location unspecified'}
                    </p>
                    {app.resumeFileName && (
                      <div className="flex items-center gap-1 text-[11px] text-indigo-500 font-medium truncate">
                        <FileText className="h-3 w-3" />
                        {app.resumeFileName} (v{app.resumeVersion})
                      </div>
                    )}
                  </div>
                </div>

                <div className="border-t border-border/40 pt-3 flex items-center justify-between text-xs text-muted-foreground">
                  <span>Applied: {app.dateApplied}</span>
                  <span className="text-primary opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1 font-semibold">
                    Inspect <Eye className="h-3.5 w-3.5" />
                  </span>
                </div>
              </div>
            ))}
          </div>

          {/* Pagination */}
          {data.totalPages > 1 && (
            <div className="flex items-center justify-center gap-4 pt-4">
              <button
                disabled={page === 0}
                onClick={() => setPage(prev => Math.max(0, prev - 1))}
                className="p-2 border rounded-lg hover:bg-muted disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
              <span className="text-sm font-medium">
                Page {page + 1} of {data.totalPages}
              </span>
              <button
                disabled={page >= data.totalPages - 1}
                onClick={() => setPage(prev => Math.min(data.totalPages - 1, prev + 1))}
                className="p-2 border rounded-lg hover:bg-muted disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          )}
        </div>
      )}

      {/* AI Quick Add Modal */}
      {isAiModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl w-full max-w-lg space-y-4 animate-in zoom-in-95 duration-200">
            <div>
              <h3 className="text-lg font-display font-extrabold text-white flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-primary" />
                AI Pipeline Extractor
              </h3>
              <p className="text-xs text-slate-400 mt-1">Paste a job description or email invitation. We will auto-extract company, role, location, and suggest career profile alignments.</p>
            </div>
            <textarea
              placeholder="Paste Job Description, Invite letter, Recruiter email here..."
              value={aiText}
              onChange={(e) => setAiText(e.target.value)}
              rows={8}
              className="w-full p-3 bg-slate-950 border border-slate-800 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
            />
            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                onClick={() => setIsAiModalOpen(false)}
                className="px-4 py-2 border border-slate-800 hover:bg-slate-800 text-sm font-medium text-slate-300 rounded-xl transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleAiParse}
                disabled={aiLoading || !aiText.trim()}
                className="flex items-center justify-center gap-2 px-4 py-2 rounded-xl bg-primary hover:bg-primary/95 text-white text-sm font-semibold transition-all duration-200 disabled:opacity-50"
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
            className="bg-slate-900 border border-slate-800 p-6 rounded-2xl w-full max-w-xl max-h-[85vh] overflow-y-auto space-y-4 animate-in zoom-in-95 duration-200"
          >
            <div className="flex items-center justify-between pb-2 border-b border-slate-800">
              <h3 className="text-lg font-display font-extrabold text-white">Add New Job Application</h3>
              <button type="button" onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-white">
                ✕
              </button>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-300">Company Name *</label>
                <input
                  type="text"
                  required
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                  placeholder="e.g. Google"
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-300">Role Title *</label>
                <input
                  type="text"
                  required
                  value={roleTitle}
                  onChange={(e) => setRoleTitle(e.target.value)}
                  placeholder="e.g. Software Engineer"
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-300">Career Persona *</label>
                <select
                  required
                  value={profileId}
                  onChange={(e) => setProfileId(e.target.value)}
                  className="w-full px-3 py-2.5 bg-slate-950 border border-slate-800 rounded-lg text-sm text-white focus:outline-none focus:ring-2 focus:ring-primary"
                >
                  <option value="">Select Persona</option>
                  {profiles.map(p => (
                    <option key={p.id} value={p.id}>{p.title}</option>
                  ))}
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-300">Status *</label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                  className="w-full px-3 py-2.5 bg-slate-950 border border-slate-800 rounded-lg text-sm text-white focus:outline-none focus:ring-2 focus:ring-primary"
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

            {/* Quick Resume Upload within Form */}
            <div className="space-y-2 p-4 rounded-xl border border-slate-800 bg-slate-950/40">
              <div className="flex items-center justify-between">
                <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                  <FileText className="h-4 w-4 text-primary" />
                  Attach Resume Version
                </label>
                {resumeFileName && (
                  <span className="text-[11px] text-emerald-400 font-medium">✓ {resumeFileName}</span>
                )}
              </div>
              
              <div className="flex items-center gap-4">
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
                  className={`flex items-center gap-2 px-3 py-2 border border-slate-800 hover:border-slate-700 bg-slate-950 rounded-lg text-xs font-semibold text-slate-300 cursor-pointer hover:bg-slate-900 transition-colors ${
                    !profileId ? 'opacity-40 pointer-events-none' : ''
                  }`}
                >
                  {uploadingResume ? (
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  ) : (
                    <Upload className="h-3.5 w-3.5" />
                  )}
                  {resumeId ? 'Change Resume PDF' : 'Quick Upload PDF'}
                </label>
                {!profileId && (
                  <p className="text-[10px] text-slate-500">Select a career persona first to enable resume attachment.</p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-300">Location</label>
                <input
                  type="text"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  placeholder="e.g. London, UK (Hybrid)"
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-300">Salary Range</label>
                <input
                  type="text"
                  value={salaryRange}
                  onChange={(e) => setSalaryRange(e.target.value)}
                  placeholder="e.g. £50k - £60k"
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-300">Date Applied</label>
                <input
                  type="date"
                  value={dateApplied}
                  onChange={(e) => setDateApplied(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-sm text-white focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-300">Next Action Date</label>
                <input
                  type="date"
                  value={followUpDate}
                  onChange={(e) => setFollowUpDate(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-sm text-white focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-300">Job Description URL</label>
                <input
                  type="text"
                  value={jobDescriptionUrl}
                  onChange={(e) => setJobDescriptionUrl(e.target.value)}
                  placeholder="e.g. https://careers.google.com/..."
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-300">Source Channel</label>
                <input
                  type="text"
                  value={source}
                  onChange={(e) => setSource(e.target.value)}
                  placeholder="e.g. LinkedIn, Referral"
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-4 border-t border-slate-800 mt-6">
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="px-4 py-2 border border-slate-800 hover:bg-slate-800 text-sm font-medium text-slate-300 rounded-xl transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={createMutation.isPending}
                className="flex items-center justify-center gap-2 px-4 py-2 rounded-xl bg-primary hover:bg-primary/95 text-white text-sm font-semibold transition-all duration-200"
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
