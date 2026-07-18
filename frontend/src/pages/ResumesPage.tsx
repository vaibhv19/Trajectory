import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { api } from '../services/api';
import { useSidebarStore } from '../store/sidebarStore';
import type { CareerProfile, Resume } from '../types';
import { 
  Plus, 
  Upload, 
  Trash2, 
  FileText, 
  Briefcase, 
  Download, 
  Loader2,
  Pencil
} from 'lucide-react';
import { SkeletonTable } from '../components/Skeleton';
import { ConfirmModal } from '../components/ConfirmModal';

export const ResumesPage: React.FC = () => {
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const setSidebarContent = useSidebarStore(state => state.setContent);
  const [selectedProfileId, setSelectedProfileId] = useState<string | null>(null);
  
  // Profile Form State
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [editingProfileId, setEditingProfileId] = useState<string | null>(null);
  const [profileTitle, setProfileTitle] = useState('');
  const [profileColor, setProfileColor] = useState('#3b82f6');
  const [profileIcon, setProfileIcon] = useState('Briefcase');
  const [profileIsDefault, setProfileIsDefault] = useState(false);
  const [deleteProfileTarget, setDeleteProfileTarget] = useState<string | null>(null);
  const [deleteResumeTarget, setDeleteResumeTarget] = useState<string | null>(null);

  // Resume Upload State
  const [resumeFile, setResumeFile] = useState<File | null>(null);
  const [resumeChangelog, setResumeChangelog] = useState('');
  const [uploadingResume, setUploadingResume] = useState(false);

  // Fetch Career Profiles
  const { data: profilesData } = useQuery<CareerProfile[]>({
    queryKey: ['profiles'],
    queryFn: api.profiles.list,
  });
  const profiles = profilesData || [];

  // Auto-select default profile
  React.useEffect(() => {
    if (profiles.length > 0 && !selectedProfileId) {
      const defaultProf = profiles.find((p) => p.isDefault) || profiles[0];
      setSelectedProfileId(defaultProf.id);
    }
  }, [profiles, selectedProfileId]);

  // Listen for quick-add query parameter to upload a new resume
  React.useEffect(() => {
    if (window.location.search.includes('add=true')) {
      const fileInput = document.getElementById('resume-file-input') as HTMLInputElement;
      if (fileInput) {
        fileInput.click();
      }
      // Clean up parameter
      navigate('/resumes', { replace: true });
    }
  }, [navigate]);

  // Fetch Resumes for selected profile
  const { data: resumesData, isLoading: resumesLoading } = useQuery<Resume[]>({
    queryKey: ['resumes', selectedProfileId],
    queryFn: () => api.resumes.listForProfile(selectedProfileId!),
    enabled: !!selectedProfileId,
  });
  const resumes = resumesData || [];

  // Mutations
  const createProfileMutation = useMutation({
    mutationFn: api.profiles.create,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['profiles'] });
      setIsProfileModalOpen(false);
      setSelectedProfileId(data.id);
      resetProfileForm();
    },
  });

  const updateProfileMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Omit<CareerProfile, 'id'> }) => api.profiles.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['profiles'] });
      setIsProfileModalOpen(false);
      resetProfileForm();
    },
  });

  const deleteProfileMutation = useMutation({
    mutationFn: (id: string) => api.profiles.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['profiles'] });
      setSelectedProfileId(null);
    },
  });

  const deleteResumeMutation = useMutation({
    mutationFn: (id: string) => api.resumes.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['resumes', selectedProfileId] });
      queryClient.invalidateQueries({ queryKey: ['dashboard-metrics'] });
    },
  });

  const handleProfileSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const payload = {
      title: profileTitle,
      colorCode: profileColor,
      iconIdentifier: profileIcon,
      isDefault: profileIsDefault
    };

    if (editingProfileId) {
      updateProfileMutation.mutate({ id: editingProfileId, data: payload });
    } else {
      createProfileMutation.mutate(payload);
    }
  };

  const handleResumeUploadSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!resumeFile || !selectedProfileId) return;

    setUploadingResume(true);
    try {
      await api.resumes.upload(selectedProfileId, resumeFile, resumeChangelog);
      queryClient.invalidateQueries({ queryKey: ['resumes', selectedProfileId] });
      queryClient.invalidateQueries({ queryKey: ['dashboard-metrics'] });
      setResumeFile(null);
      setResumeChangelog('');
      // Reset input element
      const fileInput = document.getElementById('resume-file-input') as HTMLInputElement;
      if (fileInput) fileInput.value = '';
    } catch (err) {
      alert('Failed to upload resume version');
    } finally {
      setUploadingResume(false);
    }
  };

  const handleDownload = async (resumeId: string, fileName: string) => {
    try {
      const blob = await api.resumes.download(resumeId);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = fileName;
      a.click();
    } catch (err) {
      alert('Could not download resume file.');
    }
  };

  const handleDeleteProfile = (id: string) => {
    const prof = profiles.find(p => p.id === id);
    if (prof?.isDefault) {
      alert('Cannot delete the default career profile.');
      return;
    }
    setDeleteProfileTarget(id);
  };

  const handleDeleteResume = (id: string) => {
    setDeleteResumeTarget(id);
  };

  const resetProfileForm = () => {
    setEditingProfileId(null);
    setProfileTitle('');
    setProfileColor('#3b82f6');
    setProfileIcon('Briefcase');
    setProfileIsDefault(false);
  };



  const activeProfile = profiles.find(p => p.id === selectedProfileId);

  React.useEffect(() => {
    setSidebarContent(
      <div className="space-y-6 animate-in fade-in duration-200">
        {/* Career Personas Selector */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-xs font-mono font-bold tracking-wider text-muted-foreground uppercase">Career Personas</h3>
            <button
              type="button"
              onClick={() => { resetProfileForm(); setIsProfileModalOpen(true); }}
              className="text-[10px] font-semibold text-primary hover:underline flex items-center gap-0.5"
            >
              <Plus className="w-3.5 h-3.5" />
              Add
            </button>
          </div>
          <div className="space-y-1 max-h-48 overflow-y-auto pr-1">
            {profiles.map((profile) => {
              const isActive = selectedProfileId === profile.id;
              return (
                <div 
                  key={profile.id}
                  onClick={() => setSelectedProfileId(profile.id)}
                  className={`flex items-center justify-between p-2 rounded-[4px] cursor-pointer text-xs transition-all ${
                    isActive 
                      ? 'bg-primary/10 text-primary border border-primary/20 font-bold' 
                      : 'hover:bg-muted/40 text-muted-foreground hover:text-foreground border border-transparent'
                  }`}
                >
                  <span className="truncate flex items-center gap-1.5">
                    <span 
                      className="w-2 h-2 rounded-full shrink-0" 
                      style={{ backgroundColor: profile.colorCode }}
                    />
                    {profile.title}
                    {profile.isDefault && <span className="text-[8px] font-mono opacity-50 px-1 border border-border rounded">D</span>}
                  </span>
                  
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setEditingProfileId(profile.id);
                      setProfileTitle(profile.title);
                      setProfileColor(profile.colorCode);
                      setProfileIcon(profile.iconIdentifier || 'Briefcase');
                      setProfileIsDefault(profile.isDefault);
                      setIsProfileModalOpen(true);
                    }}
                    className="p-1 hover:bg-muted text-muted-foreground hover:text-foreground rounded transition-colors"
                  >
                    <Pencil className="w-3 h-3" />
                  </button>
                </div>
              );
            })}
          </div>
        </div>

        {/* Upload Resume Form inline in sidebar */}
        {selectedProfileId && (
          <div className="pt-4 border-t border-border/30">
            <h3 className="text-xs font-mono font-bold tracking-wider text-muted-foreground uppercase mb-3">Upload Version</h3>
            <form onSubmit={handleResumeUploadSubmit} className="space-y-3 font-sans">
              <div>
                <label className="text-[10px] font-semibold text-muted-foreground block mb-1">Select PDF File</label>
                <input 
                  id="resume-file-input"
                  type="file"
                  required
                  accept=".pdf"
                  onChange={(e) => setResumeFile(e.target.files?.[0] || null)}
                  className="w-full text-xs text-muted-foreground file:mr-2 file:py-1 file:px-2.5 file:rounded-[4px] file:border file:border-border file:text-[10px] file:font-semibold file:bg-background file:text-foreground file:cursor-pointer cursor-pointer focus:outline-none"
                />
              </div>
              <div>
                <label className="text-[10px] font-semibold text-muted-foreground block mb-1">Changelog Notes</label>
                <textarea
                  placeholder="e.g. Added new projects..."
                  value={resumeChangelog}
                  onChange={(e) => setResumeChangelog(e.target.value)}
                  rows={2}
                  className="w-full p-2 bg-background border border-border rounded-[4px] text-xs placeholder-muted-foreground/60 focus:outline-none focus:ring-1 focus:ring-primary/40 focus:border-transparent transition-all"
                />
              </div>
              <button
                type="submit"
                disabled={uploadingResume || !resumeFile}
                className="w-full flex items-center justify-center gap-2 px-3 py-1.5 rounded-[4px] bg-primary hover:bg-primary/95 text-primary-foreground text-xs font-semibold disabled:opacity-50 transition-all duration-200"
              >
                {uploadingResume ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Upload className="h-3.5 w-3.5" />}
                Upload PDF
              </button>
            </form>
          </div>
        )}
      </div>
    );
    return () => setSidebarContent(null);
  }, [profiles, selectedProfileId, resumeFile, resumeChangelog, uploadingResume, setSidebarContent]);

  return (
    <div className="space-y-6">
      {/* Header and top commands */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-2xl font-display font-extrabold tracking-tight uppercase text-foreground">Resumes & Profiles</h2>
          <p className="text-sm text-muted-foreground font-sans">Manage your targeted career personas and upload versioned resume PDFs.</p>
        </div>
      </div>

      <div className="space-y-6">
        {selectedProfileId && activeProfile ? (
          <div className="space-y-6">
            <div className="flex items-center justify-between p-4 bg-muted/20 border border-border/30 rounded-[4px]">
              <div className="flex items-center gap-3">
                <span 
                  className="w-3 h-3 rounded-full shrink-0" 
                  style={{ backgroundColor: activeProfile.colorCode }}
                />
                <div>
                  <h3 className="text-sm font-semibold text-foreground flex items-center gap-1.5 font-sans">
                    {activeProfile.title}
                    {activeProfile.isDefault && (
                      <span className="text-[9px] font-mono font-bold bg-primary/10 text-primary border border-primary/20 px-1.5 py-0.5 rounded-[4px] uppercase">
                        Default
                      </span>
                    )}
                  </h3>
                  <p className="text-[10px] text-muted-foreground mt-0.5 uppercase tracking-wider font-mono">Selected Career Persona</p>
                </div>
              </div>

              {!activeProfile.isDefault && (
                <button
                  type="button"
                  onClick={() => handleDeleteProfile(activeProfile.id)}
                  className="px-3 py-1.5 border border-rose-500/20 bg-rose-500/5 hover:bg-rose-500/10 text-rose-500 text-xs font-semibold rounded-[4px] transition-colors"
                >
                  Delete Persona
                </button>
              )}
            </div>

            {/* Resumes Versions Table */}
            <div className="p-6 rounded-[4px] border border-border/40 bg-card">
              <h3 className="text-base font-display font-bold mb-4 uppercase tracking-tight text-muted-foreground">Resume Version Matrix</h3>

              {resumesLoading ? (
                <SkeletonTable rows={3} cols={5} />
              ) : resumes.length === 0 ? (
                <div className="flex flex-col items-center justify-center text-center py-12 border border-dashed border-border rounded-md">
                  <FileText className="h-8 w-8 text-muted-foreground/30 mb-2" />
                  <p className="text-xs font-semibold text-muted-foreground">No resumes uploaded yet</p>
                  <p className="text-[10px] text-muted-foreground mt-0.5">Attach your first resume version inside the sidebar.</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="border-b border-border/60 text-muted-foreground uppercase font-mono tracking-wider">
                        <th className="pb-3 font-semibold">Version</th>
                        <th className="pb-3 font-semibold">File Name</th>
                        <th className="pb-3 font-semibold">Changelog Notes</th>
                        <th className="pb-3 font-semibold">Uploaded</th>
                        <th className="pb-3 text-right font-semibold">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {resumes.map((resume) => (
                        <tr key={resume.id} className="border-b border-border/20 last:border-0 hover:bg-muted/10">
                          <td className="py-4">
                            <span className="p-1 px-2 rounded-md bg-primary/10 text-primary text-[10px] font-mono font-bold uppercase tracking-wide border border-primary/20">
                              v{resume.versionNumber}
                            </span>
                          </td>
                          <td className="py-4 font-mono text-xs font-semibold max-w-[150px] truncate">{resume.fileName}</td>
                          <td className="py-4 text-muted-foreground max-w-[200px] truncate">
                            {resume.changelog || 'No notes.'}
                          </td>
                          <td className="py-4 text-muted-foreground font-mono">
                            {new Date(resume.createdAt).toLocaleDateString()}
                          </td>
                          <td className="py-4 text-right">
                            <div className="flex items-center justify-end gap-1.5">
                              <button
                                type="button"
                                onClick={() => handleDownload(resume.id, resume.fileName)}
                                className="p-1.5 border border-border rounded-md bg-card hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
                              >
                                <Download className="h-3.5 w-3.5" />
                              </button>
                              <button
                                type="button"
                                onClick={() => handleDeleteResume(resume.id)}
                                className="p-1.5 border border-destructive/20 bg-destructive/5 hover:bg-destructive/10 text-destructive rounded-md transition-colors"
                              >
                                <Trash2 className="h-3.5 w-3.5" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="flex h-[50vh] flex-col items-center justify-center text-center border border-dashed border-border rounded-[4px] p-12 bg-card">
            <Briefcase className="h-8 w-8 text-muted-foreground/30 mb-2" />
            <h4 className="text-sm font-semibold uppercase tracking-tight text-muted-foreground">No career profile selected</h4>
            <p className="text-xs text-muted-foreground mt-0.5">Please create or select a career persona in the sidebar to display resumes.</p>
          </div>
        )}
      </div>

      {/* Create Profile Modal */}
      {isProfileModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <form 
            onSubmit={handleProfileSubmit}
            className="bg-card border border-border p-6 rounded-lg w-full max-w-md space-y-4 animate-in zoom-in-95 duration-200 shadow-2xl"
          >
            <div className="flex items-center justify-between pb-2 border-b border-border">
              <h3 className="text-lg font-display font-extrabold text-foreground uppercase tracking-tight">
                {editingProfileId ? 'Modify Career Persona' : 'Create Career Persona'}
              </h3>
              <button type="button" onClick={() => setIsProfileModalOpen(false)} className="text-muted-foreground hover:text-foreground">
                ✕
              </button>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-foreground">Persona Title *</label>
              <input
                type="text"
                required
                value={profileTitle}
                onChange={(e) => setProfileTitle(e.target.value)}
                placeholder="e.g. Frontend Engineer"
                className="w-full px-3 py-2 bg-background border border-border rounded-md text-sm text-foreground placeholder-muted-foreground/60 focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent transition-all"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-foreground">Theme Hex Color *</label>
                <div className="flex gap-2 items-center">
                  <input
                    type="color"
                    value={profileColor}
                    onChange={(e) => setProfileColor(e.target.value)}
                    className="w-8 h-8 rounded-sm border bg-transparent cursor-pointer"
                  />
                  <input
                    type="text"
                    required
                    value={profileColor}
                    onChange={(e) => setProfileColor(e.target.value)}
                    className="w-full px-2 py-1.5 bg-background border border-border rounded-md text-xs text-foreground font-mono"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-foreground">Default Profile</label>
                <div className="flex items-center h-8">
                  <input
                    type="checkbox"
                    id="profile-default-checkbox"
                    checked={profileIsDefault}
                    onChange={(e) => setProfileIsDefault(e.target.checked)}
                    className="h-4.5 w-4.5 text-primary border-border rounded-sm focus:ring-ring"
                  />
                  <label htmlFor="profile-default-checkbox" className="text-xs text-muted-foreground ml-2 font-medium">Set as Default</label>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-4 border-t border-border mt-6">
              <button
                type="button"
                onClick={() => setIsProfileModalOpen(false)}
                className="px-4 py-2 border border-border hover:bg-muted text-sm font-medium text-muted-foreground rounded-md transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={createProfileMutation.isPending || updateProfileMutation.isPending}
                className="flex items-center justify-center gap-2 px-4 py-2 rounded-md bg-primary hover:bg-[#0C5A62] dark:hover:bg-[#4CB0BA] text-primary-foreground text-sm font-semibold transition-all duration-200"
              >
                {(createProfileMutation.isPending || updateProfileMutation.isPending) && <Loader2 className="h-4 w-4 animate-spin" />}
                {editingProfileId ? 'Save Changes' : 'Create Persona'}
              </button>
            </div>
          </form>
        </div>
      )}
      {deleteProfileTarget && (
        <ConfirmModal
          isOpen={!!deleteProfileTarget}
          onClose={() => setDeleteProfileTarget(null)}
          onConfirm={() => {
            if (deleteProfileTarget) {
              deleteProfileMutation.mutate(deleteProfileTarget);
            }
          }}
          title="Delete Career Persona"
          description="Are you sure you want to permanently delete this career profile and all associated uploaded resume versions? This action is irreversible."
          confirmText="Delete Career Persona"
        />
      )}

      {deleteResumeTarget && (
        <ConfirmModal
          isOpen={!!deleteResumeTarget}
          onClose={() => setDeleteResumeTarget(null)}
          onConfirm={() => {
            if (deleteResumeTarget) {
              deleteResumeMutation.mutate(deleteResumeTarget);
            }
          }}
          title="Delete Resume Version"
          description="Are you sure you want to permanently delete this resume version? You will no longer be able to reference or download this file."
          confirmText="Delete Resume Version"
        />
      )}
    </div>
  );
};
