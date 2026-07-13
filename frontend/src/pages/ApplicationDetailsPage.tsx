import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../services/api';
import type { Resume } from '../types';
import { 
  ArrowLeft, 
  Trash2, 
  Edit3, 
  Calendar, 
  FileText, 
  Link as LinkIcon, 
  DollarSign, 
  MapPin, 
  Clock,
  Sparkles,
  Loader2,
  AlertCircle,
  Video
} from 'lucide-react';

export const ApplicationDetailsPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isEventParserOpen, setIsEventParserOpen] = useState(false);

  // Form states for updates
  const [companyName, setCompanyName] = useState('');
  const [roleTitle, setRoleTitle] = useState('');
  const [profileId, setProfileId] = useState('');
  const [resumeId, setResumeId] = useState('');
  const [location, setLocation] = useState('');
  const [salaryRange, setSalaryRange] = useState('');
  const [source, setSource] = useState('');
  const [jobDescriptionUrl, setJobDescriptionUrl] = useState('');
  const [jobDescriptionRaw, setJobDescriptionRaw] = useState('');
  const [status, setStatus] = useState('');
  const [dateApplied, setDateApplied] = useState('');
  const [followUpDate, setFollowUpDate] = useState('');
  const [responseDate, setResponseDate] = useState('');

  // Scheduling Parsing State
  const [eventEmailText, setEventEmailText] = useState('');
  const [parsingEvent, setParsingEvent] = useState(false);

  // Queries
  const { data: app, isLoading, error } = useQuery({
    queryKey: ['application', id],
    queryFn: () => api.applications.get(id!),
    enabled: !!id,
  });

  const { data: history = [] } = useQuery({
    queryKey: ['application-history', id],
    queryFn: () => api.applications.getHistory(id!),
    enabled: !!id,
  });

  const { data: profiles = [] } = useQuery({
    queryKey: ['profiles'],
    queryFn: api.profiles.list,
  });

  // Fetch resumes for selected profile
  const selectedProfileId = profileId || app?.profile.id;
  const { data: resumes = [] } = useQuery<Resume[]>({
    queryKey: ['resumes', selectedProfileId],
    queryFn: () => api.resumes.listForProfile(selectedProfileId!),
    enabled: !!selectedProfileId,
  });

  // Mutators
  const updateMutation = useMutation({
    mutationFn: (data: any) => api.applications.update(id!, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['application', id] });
      queryClient.invalidateQueries({ queryKey: ['application-history', id] });
      queryClient.invalidateQueries({ queryKey: ['dashboard-metrics'] });
      setIsEditOpen(false);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: () => api.applications.delete(id!),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['applications'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard-metrics'] });
      navigate('/applications');
    },
  });

  const handleEditClick = () => {
    if (!app) return;
    setCompanyName(app.companyName);
    setRoleTitle(app.roleTitle);
    setProfileId(app.profile.id);
    setResumeId(app.resumeId || '');
    setLocation(app.location || '');
    setSalaryRange(app.salaryRange || '');
    setSource(app.source || '');
    setJobDescriptionUrl(app.jobDescriptionUrl || '');
    setJobDescriptionRaw(app.jobDescriptionRaw || '');
    setStatus(app.status);
    setDateApplied(app.dateApplied);
    setFollowUpDate(app.followUpDate || '');
    setResponseDate(app.responseDate || '');
    setIsEditOpen(true);
  };

  const handleUpdate = (e: React.FormEvent) => {
    e.preventDefault();
    updateMutation.mutate({
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
      responseDate: responseDate || null
    });
  };

  const handleParseEvent = async () => {
    if (!eventEmailText.trim()) return;
    setParsingEvent(true);
    try {
      const data = await api.ai.parseSchedule(eventEmailText);
      
      // Auto transition to parsed event status (OA or INTERVIEW)
      const nextStatus = data.event_type.toUpperCase().includes('OA') ? 'OA' : 'INTERVIEW';
      setStatus(nextStatus);
      setFollowUpDate(data.event_date);
      setJobDescriptionUrl(data.meeting_link || '');
      
      setIsEventParserOpen(false);
      setIsEditOpen(true);
    } catch (err) {
      alert('Failed to parse event details from text');
    } finally {
      setParsingEvent(false);
    }
  };

  const handleDelete = () => {
    if (window.confirm('Are you sure you want to delete this application?')) {
      deleteMutation.mutate();
    }
  };

  const handleDownloadResume = async (resId: string) => {
    try {
      const blob = await api.resumes.download(resId);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'resume.pdf';
      a.click();
    } catch (err) {
      alert('Could not download resume.');
    }
  };

  if (isLoading) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error || !app) {
    return (
      <div className="flex h-[60vh] flex-col items-center justify-center text-center">
        <AlertCircle className="h-12 w-12 text-rose-500 mb-4" />
        <h3 className="text-lg font-semibold">Application not found</h3>
        <p className="text-sm text-muted-foreground mt-1">Please verify the application URL.</p>
        <button onClick={() => navigate('/applications')} className="mt-4 px-4 py-2 border rounded-xl hover:bg-muted text-sm font-semibold">
          Back to list
        </button>
      </div>
    );
  }



  return (
    <div className="space-y-8">
      {/* Top action header */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => navigate('/applications')}
          className="flex items-center gap-2 text-sm font-semibold text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Matrix
        </button>
        <div className="flex items-center gap-2">
          <button
            onClick={() => { setEventEmailText(''); setIsEventParserOpen(true); }}
            className="flex items-center justify-center gap-2 px-4 py-2 border border-primary/30 rounded-md bg-primary/10 hover:bg-primary/20 text-primary text-sm font-semibold transition-all duration-200"
          >
            <Sparkles className="h-4 w-4" />
            AI Parse Invite
          </button>
          <button
            onClick={handleEditClick}
            className="flex items-center justify-center gap-2 px-4 py-2 border rounded-md bg-card hover:bg-muted text-foreground text-sm font-semibold transition-all duration-200"
          >
            <Edit3 className="h-4 w-4" />
            Edit
          </button>
          <button
            onClick={handleDelete}
            disabled={deleteMutation.isPending}
            className="flex items-center justify-center gap-2 px-4 py-2 border border-destructive/20 rounded-md bg-destructive/5 hover:bg-destructive/10 text-destructive text-sm font-semibold transition-all duration-200"
          >
            <Trash2 className="h-4 w-4" />
            Delete
          </button>
        </div>
      </div>

      {/* Main card info & timeline */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        {/* Left pane: Details Card */}
        <div className="col-span-12 lg:col-span-8 space-y-6">
          <div className="p-6 rounded-lg border bg-card relative overflow-hidden">
            <div 
              className="absolute top-0 left-0 w-full h-1" 
              style={{ backgroundColor: app.profile.colorCode }} 
            />

            <div className="flex items-start justify-between">
              <div>
                <span className="text-xs font-mono font-semibold px-2 py-0.5 rounded-md" style={{ backgroundColor: `${app.profile.colorCode}20`, color: app.profile.colorCode }}>
                  {app.profile.title.toUpperCase()}
                </span>
                <h2 className="text-2xl font-display font-extrabold mt-2 tracking-tight uppercase text-foreground">{app.companyName}</h2>
                <p className="text-lg text-muted-foreground">{app.roleTitle}</p>
              </div>
              <span className={`px-2 py-0.5 rounded-md text-xs font-mono uppercase tracking-wide border ${
                app.status === 'APPLIED' ? 'bg-status-applied-bg text-status-applied-text border-status-applied-border' :
                app.status === 'OA' ? 'bg-status-oa-bg text-status-oa-text border-status-oa-border' :
                app.status === 'INTERVIEW' ? 'bg-status-interview-bg text-status-interview-text border-status-interview-border' :
                app.status === 'OFFER' ? 'bg-status-offer-bg text-status-offer-text border-status-offer-border' :
                app.status === 'REJECTED' ? 'bg-status-rejected-bg text-status-rejected-text border-status-rejected-border' :
                app.status === 'GHOSTED' ? 'bg-status-ghosted-bg text-status-ghosted-text border-status-ghosted-border' :
                'bg-status-withdrawn-bg text-status-withdrawn-text border-status-withdrawn-border'
              }`}>
                {app.status}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-6 mt-8 pt-6 border-t border-border/40">
              <div className="space-y-1">
                <span className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground">Location</span>
                <p className="text-sm font-medium">{app.location || 'Remote / Unspecified'}</p>
              </div>
              <div className="space-y-1">
                <span className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground">Salary Target</span>
                <p className="text-sm font-mono">{app.salaryRange || 'Not disclosed'}</p>
              </div>
              <div className="space-y-1">
                <span className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground">Date Logged</span>
                <p className="text-sm font-mono">{new Date(app.dateApplied).toLocaleDateString()}</p>
              </div>
              <div className="space-y-1">
                <span className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground">Next Follow-Up</span>
                <p className="text-sm font-mono text-primary font-semibold">{app.followUpDate ? new Date(app.followUpDate).toLocaleDateString() : 'None scheduled'}</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6 pt-6 border-t border-border/40">
              {app.resumeFileName && (
                <div className="p-3 rounded-md border bg-muted/20 flex items-center justify-between">
                  <div className="flex items-center gap-2 truncate max-w-[200px]">
                    <FileText className="h-4 w-4 text-primary" />
                    <div className="truncate">
                      <p className="text-xs font-semibold truncate">{app.resumeFileName}</p>
                      <p className="text-[10px] text-muted-foreground font-mono">VERSION {app.resumeVersion}</p>
                    </div>
                  </div>
                  <button
                    onClick={() => handleDownloadResume(app.resumeId!)}
                    className="p-1 px-2 border rounded-md bg-card hover:bg-muted text-[10px] font-semibold transition-colors"
                  >
                    Download
                  </button>
                </div>
              )}

              {app.jobDescriptionUrl && (
                <div className="p-3 rounded-md border bg-muted/20 flex items-center justify-between">
                  <div className="flex items-center gap-2 truncate max-w-[200px]">
                    <LinkIcon className="h-4 w-4 text-primary" />
                    <span className="text-xs font-semibold truncate">Meeting/Listing Link</span>
                  </div>
                  <a
                    href={app.jobDescriptionUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="p-1 px-2.5 border rounded-md bg-primary text-primary-foreground hover:bg-[#0C5A62] dark:hover:bg-[#4CB0BA] text-[10px] font-semibold transition-colors flex items-center gap-1"
                  >
                    <Video className="h-3 w-3" />
                    Launch
                  </a>
                </div>
              )}
            </div>
          </div>

          {/* Job Description raw details preservation */}
          {app.jobDescriptionRaw && (
            <div className="p-6 rounded-lg border bg-card space-y-3">
              <h3 className="text-base font-display font-bold uppercase tracking-tight text-muted-foreground">Preserved Job Specification</h3>
              <div className="p-4 rounded-md bg-muted/30 text-xs font-mono text-foreground max-h-60 overflow-y-auto whitespace-pre-wrap leading-relaxed border border-border">
                {app.jobDescriptionRaw}
              </div>
            </div>
          )}
        </div>

        {/* Right pane: Chronological status transition timeline */}
        <div className="col-span-12 lg:col-span-4 space-y-6">
          <div className="p-6 rounded-lg border bg-card">
            <h3 className="text-lg font-display font-bold mb-6 uppercase tracking-tight text-muted-foreground">Status Progression</h3>

            {/* Visual steps mapping */}
            <div className="relative pl-6 space-y-6">
              {/* Vertical line connector (The Trajectory Line) */}
              <div className="absolute left-[5px] top-1 bottom-1 w-0 border-l-2 border-dashed border-primary/55" />

              {history.map((hist, index) => {
                const isActive = index === history.length - 1;
                return (
                  <div key={hist.id} className="relative flex gap-4 items-start">
                    {/* Diamond tick timeline node */}
                    <span className={`absolute left-[-25px] top-[5px] h-2.5 w-2.5 rotate-45 border border-background z-10 ${
                      isActive 
                        ? 'bg-primary ring-2 ring-primary/30 animate-pulse-slow' 
                        : 'bg-background border-2 border-primary'
                    }`} />

                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-mono font-bold uppercase tracking-wide text-foreground">
                          {hist.status}
                        </span>
                        <span className="text-[10px] font-mono text-muted-foreground bg-muted px-1.5 py-0.5 rounded-sm">
                          {new Date(hist.changedAt).toLocaleDateString()}
                        </span>
                      </div>
                      {hist.notes && (
                        <p className="text-xs text-muted-foreground leading-relaxed font-sans">
                          {hist.notes}
                        </p>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* AI Schedule Invite Parser Modal */}
      {isEventParserOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <div className="bg-card border border-border p-6 rounded-lg w-full max-w-lg space-y-4 animate-in zoom-in-95 duration-200 shadow-2xl">
            <div>
              <h3 className="text-lg font-display font-extrabold text-foreground flex items-center gap-2 uppercase tracking-tight">
                <Sparkles className="h-5 w-5 text-primary" />
                AI Schedule Assistant
              </h3>
              <p className="text-xs text-muted-foreground mt-1">Paste your recruiter invitation or confirmation email text. We will automatically extract dates, times, meeting links, and update your status to OA or Interviewing.</p>
            </div>
            <textarea
              placeholder="Paste scheduling email text here..."
              value={eventEmailText}
              onChange={(e) => setEventEmailText(e.target.value)}
              rows={8}
              className="w-full p-3 bg-background border border-border rounded-md text-sm text-foreground placeholder-muted-foreground/60 focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent transition-all"
            />
            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setIsEventParserOpen(false)}
                className="px-4 py-2 border border-border hover:bg-muted text-sm font-medium text-muted-foreground rounded-md transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleParseEvent}
                disabled={parsingEvent}
                className="flex items-center justify-center gap-2 px-4 py-2 rounded-md bg-primary text-primary-foreground hover:bg-[#0C5A62] dark:hover:bg-[#4CB0BA] text-sm font-semibold transition-all duration-200"
              >
                {parsingEvent ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <>
                    <Sparkles className="h-4 w-4" />
                    Extract Schedule
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Application Modal */}
      {isEditOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <form 
            onSubmit={handleUpdate}
            className="bg-card border border-border p-6 rounded-lg w-full max-w-xl max-h-[85vh] overflow-y-auto space-y-4 animate-in zoom-in-95 duration-200 shadow-2xl"
          >
            <div className="flex items-center justify-between pb-2 border-b border-border">
              <h3 className="text-lg font-display font-extrabold text-foreground uppercase tracking-tight">Modify Application</h3>
              <button type="button" onClick={() => setIsEditOpen(false)} className="text-muted-foreground hover:text-foreground">
                ✕
              </button>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-foreground">Company Name *</label>
                <input
                  type="text"
                  required
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
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

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-foreground">Resume Link</label>
                <select
                  value={resumeId}
                  onChange={(e) => setResumeId(e.target.value)}
                  className="w-full px-3 py-2.5 bg-background border border-border rounded-md text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                >
                  <option value="">No Resume Linked</option>
                  {resumes.map(r => (
                    <option key={r.id} value={r.id}>Version {r.versionNumber} ({r.fileName})</option>
                  ))}
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-foreground">Source</label>
                <input
                  type="text"
                  value={source}
                  onChange={(e) => setSource(e.target.value)}
                  className="w-full px-3 py-2 bg-background border border-border rounded-md text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent transition-all"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-foreground">Location</label>
                <input
                  type="text"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  className="w-full px-3 py-2 bg-background border border-border rounded-md text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent transition-all"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-foreground">Salary Range</label>
                <input
                  type="text"
                  value={salaryRange}
                  onChange={(e) => setSalaryRange(e.target.value)}
                  className="w-full px-3 py-2 bg-background border border-border rounded-md text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent transition-all"
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
                  className="w-full px-3 py-2 bg-background border border-border rounded-md text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-foreground">Next Action Date</label>
                <input
                  type="date"
                  value={followUpDate}
                  onChange={(e) => setFollowUpDate(e.target.value)}
                  className="w-full px-3 py-2 bg-background border border-border rounded-md text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-foreground">Response Date</label>
                <input
                  type="date"
                  value={responseDate}
                  onChange={(e) => setResponseDate(e.target.value)}
                  className="w-full px-3 py-2 bg-background border border-border rounded-md text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-foreground">Meeting Link / URL</label>
              <input
                type="text"
                value={jobDescriptionUrl}
                onChange={(e) => setJobDescriptionUrl(e.target.value)}
                placeholder="Zoom, Google Meet or JD Link..."
                className="w-full px-3 py-2 bg-background border border-border rounded-md text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent transition-all"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-foreground">Preserved Description</label>
              <textarea
                value={jobDescriptionRaw}
                onChange={(e) => setJobDescriptionRaw(e.target.value)}
                rows={4}
                className="w-full p-2 bg-background border border-border rounded-md text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent transition-all"
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-4 border-t border-border mt-6">
              <button
                type="button"
                onClick={() => setIsEditOpen(false)}
                className="px-4 py-2 border border-border hover:bg-muted text-sm font-medium text-muted-foreground rounded-md transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={updateMutation.isPending}
                className="flex items-center justify-center gap-2 px-4 py-2 rounded-md bg-primary text-primary-foreground hover:bg-[#0C5A62] dark:hover:bg-[#4CB0BA] text-sm font-semibold transition-all duration-200"
              >
                {updateMutation.isPending && <Loader2 className="h-4 w-4 animate-spin" />}
                Save Changes
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
