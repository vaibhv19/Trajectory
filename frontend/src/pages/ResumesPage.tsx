import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { api } from '../services/api';
import type { CareerProfile, Resume } from '../types';
import { 
  Plus, 
  Upload, 
  Trash2, 
  FileText, 
  Briefcase, 
  Download, 
  Loader2,
  Layers,
  Pencil
} from 'lucide-react';
import { Skeleton, SkeletonTable } from '../components/Skeleton';
import { ConfirmModal } from '../components/ConfirmModal';

export const ResumesPage: React.FC = () => {
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const [selectedProfileId, setSelectedProfileId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'resumes' | 'personas'>('resumes');
  
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
  const { data: profilesData, isLoading: profilesLoading } = useQuery<CareerProfile[]>({
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

  const handleEditProfileClick = (profile: CareerProfile) => {
    setEditingProfileId(profile.id);
    setProfileTitle(profile.title);
    setProfileColor(profile.colorCode);
    setProfileIcon(profile.iconIdentifier);
    setProfileIsDefault(profile.isDefault);
    setIsProfileModalOpen(true);
  };

  const activeProfile = profiles.find(p => p.id === selectedProfileId);

  return (
    <div className="space-y-6">
      {/* Header and top commands */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-2xl font-display font-extrabold tracking-tight uppercase text-foreground">Resumes & Profiles</h2>
          <p className="text-sm text-muted-foreground font-sans">Manage your targeted career personas and upload versioned resume PDFs.</p>
        </div>
        <button
          onClick={() => { resetProfileForm(); setIsProfileModalOpen(true); }}
          className="flex items-center justify-center gap-2 px-4 py-2 rounded-[4px] bg-primary hover:bg-[#0C5A62] dark:hover:bg-[#4CB0BA] text-primary-foreground text-sm font-semibold transition-all duration-200 self-start sm:self-center"
        >
          <Plus className="h-4 w-4" />
          Create Career Persona
        </button>
      </div>

      {/* Contextual Secondary Navigation */}
      <div className="flex border-b border-border/30 gap-1 overflow-x-auto pb-px">
        {[
          { name: 'All Versions', active: activeTab === 'resumes', onClick: () => setActiveTab('resumes') },
          { name: 'Career Personas', active: activeTab === 'personas', onClick: () => setActiveTab('personas') }
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

      <div className="space-y-6">
        {activeTab === 'personas' ? (
          /* Left column: Profiles List */
          <div className="space-y-4">
            <div className="p-5 rounded-[4px] border border-border/40 bg-card">
              <h3 className="text-base font-display font-bold mb-4 flex items-center gap-2">
                <Layers className="h-4.5 w-4.5 text-primary" />
                Targeted Personas
              </h3>
              
              {profilesLoading ? (
                <div className="space-y-2">
                  <Skeleton className="h-10 w-full" />
                  <Skeleton className="h-10 w-full" />
                </div>
              ) : profiles.length === 0 ? (
                <p className="text-xs text-muted-foreground text-center py-4">No personas created.</p>
              ) : (
                <div className="space-y-2">
                  {profiles.map((profile) => (
                    <div 
                      key={profile.id}
                      onClick={() => { setSelectedProfileId(profile.id); setActiveTab('resumes'); }}
                      className={`p-3.5 rounded-md border flex items-center justify-between cursor-pointer transition-all duration-200 relative overflow-hidden group ${
                        selectedProfileId === profile.id 
                          ? 'border-primary bg-primary/5' 
                          : 'hover:bg-muted/55 border-border'
                      }`}
                    >
                      <div 
                        className="absolute left-0 top-0 bottom-0 w-[4px]" 
                        style={{ backgroundColor: profile.colorCode }} 
                      />

                      <div className="flex items-center gap-3 pl-2">
                        <div className="h-8 w-8 rounded-md flex items-center justify-center bg-muted/80 text-foreground">
                          <Briefcase className="h-4 w-4" />
                        </div>
                        <div>
                          <h4 className="text-sm font-semibold flex items-center gap-1.5">
                            {profile.title}
                            {profile.isDefault && (
                              <span className="text-[9px] font-mono font-bold px-1.5 py-0.5 rounded-md bg-primary/10 text-primary uppercase tracking-wide border border-primary/20">
                                Default
                              </span>
                            )}
                          </h4>
                        </div>
                      </div>

                      <div className="flex items-center gap-1.5 opacity-0 group-hover:opacity-100 transition-all shrink-0">
                        <button
                          type="button"
                          onClick={(e) => { e.stopPropagation(); handleEditProfileClick(profile); }}
                          className="p-1.5 border border-border bg-card hover:bg-muted text-muted-foreground rounded-md transition-all"
                          title="Edit profile"
                        >
                          <Pencil className="h-3.5 w-3.5" />
                        </button>
                        {!profile.isDefault && (
                          <button
                            type="button"
                            onClick={(e) => { e.stopPropagation(); handleDeleteProfile(profile.id); }}
                            className="p-1.5 border border-destructive/20 bg-destructive/5 hover:bg-destructive/10 text-destructive rounded-md transition-all"
                            title="Delete profile"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        ) : (
          /* Right column: Resumes upload & history list */
          <div className="space-y-6">
            {selectedProfileId && activeProfile ? (
              <>
                {/* Resume Version Uploader */}
                <div className="p-6 rounded-[4px] border border-border/40 bg-card space-y-4">
                  <h3 className="text-base font-display font-bold flex items-center gap-2 uppercase tracking-tight text-muted-foreground">
                    <Upload className="h-4.5 w-4.5 text-primary" />
                    Upload New Resume Version
                  </h3>
                  <p className="text-xs text-muted-foreground">The system will auto-increment the version number from v{resumes[0]?.versionNumber || 0} to v{(resumes[0]?.versionNumber || 0) + 1}.</p>

                  <form onSubmit={handleResumeUploadSubmit} className="space-y-4 pt-2">
                    <div className="flex items-center gap-4">
                      <input
                        type="file"
                        id="resume-file-input"
                        required
                        accept="application/pdf"
                        onChange={(e) => setResumeFile(e.target.files?.[0] || null)}
                        className="hidden"
                      />
                      <label
                        htmlFor="resume-file-input"
                        className="flex items-center gap-2 px-4 py-2.5 border border-dashed border-border rounded-md text-xs font-semibold hover:bg-muted cursor-pointer transition-colors"
                      >
                        <FileText className="h-4 w-4 text-primary" />
                        {resumeFile ? resumeFile.name : 'Select Resume PDF File'}
                      </label>
                    </div>

                    <div className="space-y-1">
                      <label className="text-xs font-semibold text-foreground">Changelog Comments</label>
                      <textarea
                        placeholder="e.g. Added Java 21 projects and updated summary keywords..."
                        value={resumeChangelog}
                        onChange={(e) => setResumeChangelog(e.target.value)}
                        rows={3}
                        className="w-full p-2.5 bg-background border border-border rounded-md text-xs placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent transition-all"
                      />
                    </div>

                    <button
                      type="submit"
                      disabled={uploadingResume || !resumeFile}
                      className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-md bg-primary text-primary-foreground hover:bg-[#0C5A62] dark:hover:bg-[#4CB0BA] text-xs font-semibold transition-all disabled:opacity-50"
                    >
                      {uploadingResume && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
                      Submit Resume Version
                    </button>
                  </form>
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
                      <p className="text-[10px] text-muted-foreground mt-0.5">Attach your first resume version above.</p>
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
              </>
            ) : (
              <div className="flex h-[50vh] flex-col items-center justify-center text-center border border-dashed border-border rounded-[4px] p-12 bg-card">
                <Briefcase className="h-8 w-8 text-muted-foreground/30 mb-2" />
                <h4 className="text-sm font-semibold uppercase tracking-tight text-muted-foreground">No career profile selected</h4>
                <p className="text-xs text-muted-foreground mt-0.5">Please create or select a career persona in the Career Personas tab to display resumes.</p>
              </div>
            )}
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
