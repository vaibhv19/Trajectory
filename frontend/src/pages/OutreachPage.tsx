import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { api } from '../services/api';
import type { Outreach, CareerProfile } from '../types';
import { 
  Plus, 
  Search, 
  Sparkles, 
  Mail, 
  Clock, 
  Trash2, 
  Edit3, 
  Briefcase,
  Loader2,
  Users
} from 'lucide-react';

export const OutreachPage: React.FC = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isConvertOpen, setIsConvertOpen] = useState(false);
  const [isAiOpen, setIsAiOpen] = useState(false);
  
  // Selected outreach contact details
  const [selectedId, setSelectedId] = useState<string | null>(null);

  // Form state
  const [contactName, setContactName] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [positionDiscussed, setPositionDiscussed] = useState('');
  const [email, setEmail] = useState('');
  const [linkedinUrl, setLinkedinUrl] = useState('');
  const [status, setStatus] = useState('PENDING');
  const [dateSent, setDateSent] = useState(new Date().toISOString().split('T')[0]);
  const [followUpDate, setFollowUpDate] = useState('');
  const [notes, setNotes] = useState('');

  // Conversion state
  const [profileId, setProfileId] = useState('');

  // AI Sentiment analysis state
  const [recruiterMsg, setRecruiterMsg] = useState('');
  const [analyzingMsg, setAnalyzingMsg] = useState(false);

  // Fetch Outreach Contacts
  const { data: contacts = [], isLoading } = useQuery<Outreach[]>({
    queryKey: ['outreach', search, statusFilter],
    queryFn: () => api.outreach.list(search, statusFilter || undefined),
  });

  // Fetch Career Profiles
  const { data: profiles = [] } = useQuery<CareerProfile[]>({
    queryKey: ['profiles'],
    queryFn: api.profiles.list,
  });

  // Mutations
  const createMutation = useMutation({
    mutationFn: api.outreach.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['outreach'] });
      setIsModalOpen(false);
      resetForm();
    },
  });

  const updateMutation = useMutation({
    mutationFn: (data: any) => api.outreach.update(selectedId!, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['outreach'] });
      setIsModalOpen(false);
      resetForm();
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => api.outreach.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['outreach'] });
    },
  });

  const convertMutation = useMutation({
    mutationFn: ({ id, profileId }: { id: string; profileId: string }) => 
      api.outreach.convert(id, profileId),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['outreach'] });
      queryClient.invalidateQueries({ queryKey: ['applications'] });
      setIsConvertOpen(false);
      navigate(`/applications/${data.id}`);
    },
  });

  const handleEditClick = (item: Outreach) => {
    setSelectedId(item.id);
    setContactName(item.contactName);
    setCompanyName(item.companyName);
    setPositionDiscussed(item.positionDiscussed);
    setEmail(item.email || '');
    setLinkedinUrl(item.linkedinUrl || '');
    setStatus(item.status);
    setDateSent(item.dateSent);
    setFollowUpDate(item.followUpDate || '');
    setNotes(item.notes || '');
    setIsModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const payload = {
      contactName,
      companyName,
      positionDiscussed,
      email: email || null,
      linkedinUrl: linkedinUrl || null,
      status,
      dateSent,
      followUpDate: followUpDate || null,
      notes: notes || null
    };

    if (selectedId) {
      updateMutation.mutate(payload);
    } else {
      createMutation.mutate(payload);
    }
  };

  const handleConvertSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedId || !profileId) return;
    convertMutation.mutate({ id: selectedId, profileId });
  };

  const handleAiAnalysis = async () => {
    if (!recruiterMsg.trim()) return;
    setAnalyzingMsg(true);
    try {
      const result = await api.ai.analyzeOutreach(recruiterMsg);
      setStatus(result.suggested_status);
      setNotes(prev => 
        (prev ? prev + '\n\n' : '') + 
        `[AI Sentiment Analysis - Recruiter Response]:\n` + 
        `- Suggested Action: ${result.suggested_action}\n` +
        `- Key Points:\n${result.key_points.map((kp: string) => `  * ${kp}`).join('\n')}`
      );
      setIsAiOpen(false);
    } catch (err) {
      alert('AI analysis failed. Please update status manually.');
    } finally {
      setAnalyzingMsg(false);
    }
  };

  const handleDelete = (id: string) => {
    if (window.confirm('Delete this outreach contact?')) {
      deleteMutation.mutate(id);
    }
  };

  const resetForm = () => {
    setSelectedId(null);
    setContactName('');
    setCompanyName('');
    setPositionDiscussed('');
    setEmail('');
    setLinkedinUrl('');
    setStatus('PENDING');
    setDateSent(new Date().toISOString().split('T')[0]);
    setFollowUpDate('');
    setNotes('');
  };

  const statusColors: Record<string, string> = {
    PENDING: 'bg-blue-500/10 text-blue-500 border-blue-500/20',
    CONTACTED: 'bg-amber-500/10 text-amber-500 border-amber-500/20',
    REPLIED: 'bg-indigo-500/10 text-indigo-500 border-indigo-500/20',
    INTERVIEW_SECURED: 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20',
    NO_RESPONSE: 'bg-slate-500/10 text-slate-500 border-slate-500/20',
  };

  const isOverdue = (dateStr: string | null) => {
    if (!dateStr) return false;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return new Date(dateStr) <= today;
  };

  return (
    <div className="space-y-6">
      {/* Header and top commands */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-2xl font-display font-extrabold">Networking CRM</h2>
          <p className="text-sm text-muted-foreground">Track recruiter contact histories, sent messages, and upcoming follow-ups.</p>
        </div>
        <button
          onClick={() => { resetForm(); setIsModalOpen(true); }}
          className="flex items-center justify-center gap-2 px-4 py-2 rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground text-sm font-semibold transition-all duration-200 shadow-md shadow-primary/10 self-start sm:self-center"
        >
          <Plus className="h-4 w-4" />
          Log Outreach Contact
        </button>
      </div>

      {/* Filter Section */}
      <div className="p-4 rounded-xl border bg-card glass-card flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute inset-y-0 left-0 pl-3 h-full w-4 text-muted-foreground flex items-center" />
          <input
            type="text"
            placeholder="Search contact, company name or position discussed..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-2 bg-background border rounded-lg text-sm placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
          />
        </div>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-3 py-2 bg-background border rounded-lg text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
        >
          <option value="">All Statuses</option>
          <option value="PENDING">Pending</option>
          <option value="CONTACTED">Contacted</option>
          <option value="REPLIED">Replied</option>
          <option value="INTERVIEW_SECURED">Interview Secured</option>
          <option value="NO_RESPONSE">No Response</option>
        </select>
      </div>

      {/* Grid of contacts */}
      {isLoading ? (
        <div className="flex h-[40vh] items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : contacts.length === 0 ? (
        <div className="flex h-[40vh] flex-col items-center justify-center text-center border border-dashed rounded-2xl p-12">
          <Users className="h-10 w-10 text-muted-foreground/30 mb-2" />
          <h4 className="text-sm font-semibold">No outreach logs found</h4>
          <p className="text-xs text-muted-foreground mt-0.5">Start networking with recruiter outreach contacts today.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {contacts.map((contact) => (
            <div 
              key={contact.id}
              className="p-6 rounded-xl border bg-card glass-card hover:shadow-md transition-all duration-200 flex flex-col justify-between h-[230px]"
            >
              <div className="space-y-2">
                <div className="flex items-start justify-between">
                  <div>
                    <h4 className="text-base font-semibold truncate max-w-[170px]">{contact.contactName}</h4>
                    <p className="text-xs text-muted-foreground truncate max-w-[170px]">{contact.positionDiscussed}</p>
                  </div>
                  <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${statusColors[contact.status]}`}>
                    {contact.status.replace('_', ' ')}
                  </span>
                </div>

                <div className="flex flex-col gap-1.5 pt-2">
                  <p className="text-xs font-semibold text-foreground truncate">{contact.companyName}</p>
                  
                  {/* Action alert banner for overdue follow-up */}
                  {contact.followUpDate && (
                    <div className={`flex items-center gap-1 text-[11px] font-medium ${
                      isOverdue(contact.followUpDate) && contact.status !== 'INTERVIEW_SECURED' && contact.status !== 'NO_RESPONSE'
                        ? 'text-rose-500 animate-pulse' 
                        : 'text-slate-500'
                    }`}>
                      <Clock className="h-3.5 w-3.5" />
                      Follow-up: {contact.followUpDate} 
                      {isOverdue(contact.followUpDate) && contact.status !== 'INTERVIEW_SECURED' && contact.status !== 'NO_RESPONSE' && ' (Overdue)'}
                    </div>
                  )}
                </div>
              </div>

              {/* CRM footer actions */}
              <div className="border-t border-border/40 pt-4 flex items-center justify-between mt-4">
                <div className="flex items-center gap-2">
                  {contact.linkedinUrl && (
                    <a 
                      href={contact.linkedinUrl} 
                      target="_blank" 
                      rel="noreferrer"
                      className="p-1.5 rounded-lg border bg-card hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
                    >
                      <svg className="h-4 w-4 text-[#0077b5] fill-current" viewBox="0 0 24 24">
                        <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" />
                      </svg>
                    </a>
                  )}
                  {contact.email && (
                    <a 
                      href={`mailto:${contact.email}`} 
                      className="p-1.5 rounded-lg border bg-card hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
                    >
                      <Mail className="h-4 w-4" />
                    </a>
                  )}
                </div>

                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => handleEditClick(contact)}
                    className="p-1.5 border rounded-lg hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
                  >
                    <Edit3 className="h-3.5 w-3.5" />
                  </button>
                  <button
                    onClick={() => handleDelete(contact.id)}
                    className="p-1.5 border border-rose-500/20 bg-rose-500/5 hover:bg-rose-500/10 text-rose-500 rounded-lg transition-colors"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                  {contact.status !== 'INTERVIEW_SECURED' && (
                    <button
                      onClick={() => { setSelectedId(contact.id); setProfileId(profiles[0]?.id || ''); setIsConvertOpen(true); }}
                      className="flex items-center gap-1 py-1.5 px-3 rounded-lg bg-primary hover:bg-primary/95 text-white text-[10px] font-bold transition-colors"
                    >
                      <Briefcase className="h-3 w-3" />
                      Convert
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Outreach Creation / Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <form 
            onSubmit={handleSubmit}
            className="bg-slate-900 border border-slate-800 p-6 rounded-2xl w-full max-w-lg max-h-[85vh] overflow-y-auto space-y-4 animate-in zoom-in-95 duration-200"
          >
            <div className="flex items-center justify-between pb-2 border-b border-slate-800">
              <h3 className="text-lg font-display font-extrabold text-white">
                {selectedId ? 'Modify Outreach Log' : 'Create Outreach Log'}
              </h3>
              <button type="button" onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-white">
                ✕
              </button>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-300">Contact/Recruiter Name *</label>
                <input
                  type="text"
                  required
                  value={contactName}
                  onChange={(e) => setContactName(e.target.value)}
                  placeholder="e.g. Sarah Jenkins"
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                />
              </div>

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
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-300">Position Discussed *</label>
                <input
                  type="text"
                  required
                  value={positionDiscussed}
                  onChange={(e) => setPositionDiscussed(e.target.value)}
                  placeholder="e.g. Senior Java Dev"
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-300">Status *</label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                  className="w-full px-3 py-2.5 bg-slate-950 border border-slate-800 rounded-lg text-sm text-white focus:outline-none focus:ring-2 focus:ring-primary"
                >
                  <option value="PENDING">Pending</option>
                  <option value="CONTACTED">Contacted</option>
                  <option value="REPLIED">Replied</option>
                  <option value="INTERVIEW_SECURED">Interview Secured</option>
                  <option value="NO_RESPONSE">No Response</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-300">Email Address</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="recruiter@company.com"
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-300">LinkedIn URL</label>
                <input
                  type="text"
                  value={linkedinUrl}
                  onChange={(e) => setLinkedinUrl(e.target.value)}
                  placeholder="https://linkedin.com/in/..."
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-300">Date Sent</label>
                <input
                  type="date"
                  value={dateSent}
                  onChange={(e) => setDateSent(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-sm text-white focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-300">Follow-up Reminder Date</label>
                <input
                  type="date"
                  value={followUpDate}
                  onChange={(e) => setFollowUpDate(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-sm text-white focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
            </div>

            {/* AI Sentiment Analysis trigger */}
            <div className="p-3 bg-slate-950/40 border border-slate-800 rounded-xl flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-300 flex items-center gap-1">
                <Sparkles className="h-4 w-4 text-primary" />
                Analyze Recruiter Sentiment
              </span>
              <button
                type="button"
                onClick={() => { setRecruiterMsg(''); setIsAiOpen(true); }}
                className="p-1 px-3 border border-primary/20 bg-primary/10 hover:bg-primary/20 text-primary text-[10px] font-bold rounded-lg transition-colors"
              >
                Analyze Reply
              </button>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-300">Outreach Discussion Notes</label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Details of discussion or message content..."
                rows={4}
                className="w-full p-2.5 bg-slate-950 border border-slate-800 rounded-lg text-xs text-white focus:outline-none focus:ring-2 focus:ring-primary"
              />
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
                className="flex items-center justify-center gap-2 px-4 py-2 rounded-xl bg-primary hover:bg-primary/95 text-white text-sm font-semibold transition-all duration-200"
              >
                Save Log
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Convert to Application Modal */}
      {isConvertOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <form 
            onSubmit={handleConvertSubmit}
            className="bg-slate-900 border border-slate-800 p-6 rounded-2xl w-full max-w-md space-y-4 animate-in zoom-in-95 duration-200"
          >
            <div>
              <h3 className="text-lg font-display font-extrabold text-white flex items-center gap-2">
                <Briefcase className="h-5 w-5 text-primary" />
                Convert to Job Application
              </h3>
              <p className="text-xs text-slate-400 mt-1">Convert this successfully secured outreach conversation into a tracked job application. Company and contact notes will migrate automatically.</p>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-300">Select Career Profile Alignment *</label>
              <select
                required
                value={profileId}
                onChange={(e) => setProfileId(e.target.value)}
                className="w-full px-3 py-2.5 bg-slate-950 border border-slate-800 rounded-lg text-sm text-white focus:outline-none focus:ring-2 focus:ring-primary"
              >
                <option value="">Select Profile</option>
                {profiles.map(p => (
                  <option key={p.id} value={p.id}>{p.title}</option>
                ))}
              </select>
            </div>

            <div className="flex items-center justify-end gap-2 pt-4">
              <button
                type="button"
                onClick={() => setIsConvertOpen(false)}
                className="px-4 py-2 border border-slate-800 hover:bg-slate-800 text-sm font-medium text-slate-300 rounded-xl transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={convertMutation.isPending}
                className="flex items-center justify-center gap-2 px-4 py-2 rounded-xl bg-primary hover:bg-primary/95 text-white text-sm font-semibold transition-all duration-200"
              >
                {convertMutation.isPending && <Loader2 className="h-4 w-4 animate-spin" />}
                Convert Thread
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Recruiter Reply Analysis Modal */}
      {isAiOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl w-full max-w-lg space-y-4 animate-in zoom-in-95 duration-200">
            <div>
              <h3 className="text-lg font-display font-extrabold text-white flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-primary" />
                AI Recruiter Response Analyst
              </h3>
              <p className="text-xs text-slate-400 mt-1">Paste the exact response message from the recruiter. The AI will detect positive or negative sentiment, recommend next steps, and suggest status updates.</p>
            </div>
            <textarea
              placeholder="Paste recruiter's reply text here..."
              value={recruiterMsg}
              onChange={(e) => setRecruiterMsg(e.target.value)}
              rows={8}
              className="w-full p-3 bg-slate-950 border border-slate-800 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
            />
            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                onClick={() => setIsAiOpen(false)}
                className="px-4 py-2 border border-slate-800 hover:bg-slate-800 text-sm font-medium text-slate-300 rounded-xl transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleAiAnalysis}
                disabled={analyzingMsg || !recruiterMsg.trim()}
                className="flex items-center justify-center gap-2 px-4 py-2 rounded-xl bg-primary hover:bg-primary/95 text-white text-sm font-semibold transition-all duration-200"
              >
                {analyzingMsg ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <>
                    <Sparkles className="h-4 w-4" />
                    Analyze Reply
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
