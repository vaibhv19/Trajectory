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
            className="flex items-center justify-center gap-2 px-4 py-2 border border-primary/30 rounded-xl bg-primary/10 hover:bg-primary/20 text-primary text-sm font-semibold transition-all duration-200"
          >
            <Sparkles className="h-4 w-4" />
            AI Parse Invite
          </button>
          <button
            onClick={handleEditClick}
            className="flex items-center justify-center gap-2 px-4 py-2 border rounded-xl bg-card hover:bg-muted text-foreground text-sm font-semibold transition-all duration-200"
          >
            <Edit3 className="h-4 w-4" />
            Edit
          </button>
          <button
            onClick={handleDelete}
            disabled={deleteMutation.isPending}
            className="flex items-center justify-center gap-2 px-4 py-2 border border-rose-500/20 rounded-xl bg-rose-500/5 hover:bg-rose-500/10 text-rose-500 text-sm font-semibold transition-all duration-200"
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
          <div className="p-6 rounded-2xl border bg-card glass-card relative overflow-hidden">
            <div 
              className="absolute top-0 left-0 w-full h-1" 
              style={{ backgroundColor: app.profile.colorCode }} 
            />

            <div className="flex items-start justify-between">
              <div>
                <span className="text-xs font-semibold px-2 py-0.5 rounded" style={{ backgroundColor: `${app.profile.colorCode}20`, color: app.profile.colorCode }}>
                  {app.profile.title}
                </span>
                <h2 className="text-2xl font-display font-extrabold mt-2">{app.companyName}</h2>
                <p className="text-lg text-muted-foreground">{app.roleTitle}</p>
              </div>
              <span className={`px-3 py-1 rounded-full text-xs font-bold border ${
                app.status === 'APPLIED' ? 'bg-blue-500/10 text-blue-500 border-blue-500/20' :
                app.status === 'OA' ? 'bg-amber-500/10 text-amber-500 border-amber-500/20' :
                app.status === 'INTERVIEW' ? 'bg-purple-500/10 text-purple-500 border-purple-500/20' :
                app.status === 'OFFER' ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' :
                'bg-rose-500/10 text-rose-500 border-rose-500/20'
              }`}>
                {app.status}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-6 mt-8 pt-6 border-t border-border/40">
              <div className="flex items-center gap-3 text-sm">
                <MapPin className="h-5 w-5 text-muted-foreground" />
                <div>
                  <p className="text-xs text-muted-foreground font-medium">Location</p>
                  <p className="font-semibold">{app.location || 'Remote / Unspecified'}</p>
                </div>
              </div>

              <div className="flex items-center gap-3 text-sm">
                <DollarSign className="h-5 w-5 text-muted-foreground" />
                <div>
                  <p className="text-xs text-muted-foreground font-medium">Salary Range</p>
                  <p className="font-semibold">{app.salaryRange || 'Unspecified'}</p>
                </div>
              </div>

              <div className="flex items-center gap-3 text-sm">
                <Clock className="h-5 w-5 text-muted-foreground" />
                <div>
                  <p className="text-xs text-muted-foreground font-medium">Applied Date</p>
                  <p className="font-semibold">{app.dateApplied}</p>
                </div>
              </div>

              <div className="flex items-center gap-3 text-sm">
                <Calendar className="h-5 w-5 text-muted-foreground" />
                <div>
                  <p className="text-xs text-muted-foreground font-medium">Next Action Date</p>
                  <p className="font-semibold">{app.followUpDate || 'None'}</p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-6 pt-6 border-t border-border/40">
              {app.resumeFileName && (
                <div className="p-3 rounded-xl border bg-muted/30 flex items-center justify-between">
                  <div className="flex items-center gap-2 truncate max-w-[200px]">
                    <FileText className="h-4 w-4 text-primary" />
                    <span className="text-xs font-semibold truncate">{app.resumeFileName} (v{app.resumeVersion})</span>
                  </div>
                  <button
                    onClick={() => handleDownloadResume(app.resumeId!)}
                    className="p-1 px-2 border rounded-lg bg-card hover:bg-muted text-[10px] font-semibold transition-colors"
                  >
                    Download
                  </button>
                </div>
              )}

              {app.jobDescriptionUrl && (
                <div className="p-3 rounded-xl border bg-muted/30 flex items-center justify-between">
                  <div className="flex items-center gap-2 truncate max-w-[200px]">
                    <LinkIcon className="h-4 w-4 text-primary" />
                    <span className="text-xs font-semibold truncate">Meeting/Listing Link</span>
                  </div>
                  <a
                    href={app.jobDescriptionUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="p-1 px-2.5 border rounded-lg bg-primary text-primary-foreground hover:bg-primary/95 text-[10px] font-semibold transition-colors flex items-center gap-1"
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
            <div className="p-6 rounded-2xl border bg-card glass-card space-y-3">
              <h3 className="text-base font-display font-bold">Preserved Job Specification</h3>
              <div className="p-4 rounded-xl bg-slate-950/60 text-xs font-mono text-slate-300 max-h-60 overflow-y-auto whitespace-pre-wrap leading-relaxed border border-slate-800">
                {app.jobDescriptionRaw}
              </div>
            </div>
          )}
        </div>

        {/* Right pane: Chronological status transition timeline */}
        <div className="col-span-12 lg:col-span-4 space-y-6">
          <div className="p-6 rounded-2xl border bg-card glass-card">
            <h3 className="text-lg font-display font-bold mb-6">Status Progression</h3>

            {/* Visual steps mapping */}
            <div className="relative pl-6 space-y-6">
              {/* Vertical line connector */}
              <div className="absolute left-[7px] top-1 bottom-1 w-[2px] bg-muted" />

              {history.map((hist, index) => {
                return (
                  <div key={hist.id} className="relative flex gap-4 items-start">
                    {/* Pulsing indicator for active/latest node */}
                    <span className={`absolute left-[-23px] rounded-full z-10 ${
                      index === history.length - 1 
                        ? 'h-3.5 w-3.5 border-2 border-background ring-4 ring-indigo-500/30 bg-primary'
                        : 'h-3.5 w-3.5 bg-primary border-2 border-background'
                    }`} />

                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-bold text-foreground">
                          {hist.status}
                        </span>
                        <span className="text-[10px] text-muted-foreground">
                          {new Date(hist.changedAt).toLocaleDateString()}
                        </span>
                      </div>
                      {hist.notes && (
                        <p className="text-xs text-muted-foreground leading-relaxed">
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
          <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl w-full max-w-lg space-y-4 animate-in zoom-in-95 duration-200">
            <div>
              <h3 className="text-lg font-display font-extrabold text-white flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-primary" />
                AI Schedule Assistant
              </h3>
              <p className="text-xs text-slate-400 mt-1">Paste your recruiter invitation or confirmation email text. We will automatically extract dates, times, meeting links, and update your status to OA or Interviewing.</p>
            </div>
            <textarea
              placeholder="Paste scheduling email text here..."
              value={eventEmailText}
              onChange={(e) => setEventEmailText(e.target.value)}
              rows={8}
              className="w-full p-3 bg-slate-950 border border-slate-800 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
            />
            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                onClick={() => setIsEventParserOpen(false)}
                className="px-4 py-2 border border-slate-800 hover:bg-slate-800 text-sm font-medium text-slate-300 rounded-xl transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleParseEvent}
                disabled={parsingEvent || !eventEmailText.trim()}
                className="flex items-center justify-center gap-2 px-4 py-2 rounded-xl bg-primary hover:bg-primary/95 text-white text-sm font-semibold transition-all duration-200"
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
            className="bg-slate-900 border border-slate-800 p-6 rounded-2xl w-full max-w-xl max-h-[85vh] overflow-y-auto space-y-4 animate-in zoom-in-95 duration-200"
          >
            <div className="flex items-center justify-between pb-2 border-b border-slate-800">
              <h3 className="text-lg font-display font-extrabold text-white">Modify Application</h3>
              <button type="button" onClick={() => setIsEditOpen(false)} className="text-slate-400 hover:text-white">
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

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-300">Resume Link</label>
                <select
                  value={resumeId}
                  onChange={(e) => setResumeId(e.target.value)}
                  className="w-full px-3 py-2.5 bg-slate-950 border border-slate-800 rounded-lg text-sm text-white focus:outline-none focus:ring-2 focus:ring-primary"
                >
                  <option value="">No Resume Linked</option>
                  {resumes.map(r => (
                    <option key={r.id} value={r.id}>Version {r.versionNumber} ({r.fileName})</option>
                  ))}
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-300">Source</label>
                <input
                  type="text"
                  value={source}
                  onChange={(e) => setSource(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-sm text-white focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-300">Location</label>
                <input
                  type="text"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-sm text-white focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-300">Salary Range</label>
                <input
                  type="text"
                  value={salaryRange}
                  onChange={(e) => setSalaryRange(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-sm text-white focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-300">Date Applied</label>
                <input
                  type="date"
                  value={dateApplied}
                  onChange={(e) => setDateApplied(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-xs text-white focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-300">Next Action Date</label>
                <input
                  type="date"
                  value={followUpDate}
                  onChange={(e) => setFollowUpDate(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-xs text-white focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-300">Response Date</label>
                <input
                  type="date"
                  value={responseDate}
                  onChange={(e) => setResponseDate(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-xs text-white focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-300">Meeting Link / URL</label>
              <input
                type="text"
                value={jobDescriptionUrl}
                onChange={(e) => setJobDescriptionUrl(e.target.value)}
                placeholder="Zoom, Google Meet or JD Link..."
                className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-sm text-white focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-300">Preserved Description</label>
              <textarea
                value={jobDescriptionRaw}
                onChange={(e) => setJobDescriptionRaw(e.target.value)}
                rows={4}
                className="w-full p-2 bg-slate-950 border border-slate-800 rounded-lg text-xs text-white focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-4 border-t border-slate-800 mt-6">
              <button
                type="button"
                onClick={() => setIsEditOpen(false)}
                className="px-4 py-2 border border-slate-800 hover:bg-slate-800 text-sm font-medium text-slate-300 rounded-xl transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={updateMutation.isPending}
                className="flex items-center justify-center gap-2 px-4 py-2 rounded-xl bg-primary hover:bg-primary/95 text-white text-sm font-semibold transition-all duration-200"
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
