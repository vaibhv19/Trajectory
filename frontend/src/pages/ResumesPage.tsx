import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
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
  Layers
} from 'lucide-react';

export const ResumesPage: React.FC = () => {
  const queryClient = useQueryClient();
  const [selectedProfileId, setSelectedProfileId] = useState<string | null>(null);
  
  // Profile Form State
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [profileTitle, setProfileTitle] = useState('');
  const [profileColor, setProfileColor] = useState('#3b82f6');
  const [profileIcon, setProfileIcon] = useState('Briefcase');
  const [profileIsDefault, setProfileIsDefault] = useState(false);

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
    createProfileMutation.mutate({
      title: profileTitle,
      colorCode: profileColor,
      iconIdentifier: profileIcon,
      isDefault: profileIsDefault
    });
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
    if (window.confirm('Are you sure you want to delete this career profile and all associated resumes?')) {
      deleteProfileMutation.mutate(id);
    }
  };

  const handleDeleteResume = (id: string) => {
    if (window.confirm('Delete this resume version?')) {
      deleteResumeMutation.mutate(id);
    }
  };

  const resetProfileForm = () => {
    setProfileTitle('');
    setProfileColor('#3b82f6');
    setProfileIcon('Briefcase');
    setProfileIsDefault(false);
  };

  const activeProfile = profiles.find(p => p.id === selectedProfileId);

  return (
    <div className="space-y-6">
      {/* Header and top commands */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-2xl font-display font-extrabold">Resumes & Profiles</h2>
          <p className="text-sm text-muted-foreground">Manage your targeted career personas and upload versioned resume PDFs.</p>
        </div>
        <button
          onClick={() => { resetProfileForm(); setIsProfileModalOpen(true); }}
          className="flex items-center justify-center gap-2 px-4 py-2 rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground text-sm font-semibold transition-all duration-200 shadow-md shadow-primary/10 self-start sm:self-center"
        >
          <Plus className="h-4 w-4" />
          Create Career Persona
        </button>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        {/* Left column: Profiles List */}
        <div className="col-span-12 lg:col-span-4 space-y-4">
          <div className="p-5 rounded-2xl border bg-card glass-card">
            <h3 className="text-base font-display font-bold mb-4 flex items-center gap-2">
              <Layers className="h-4.5 w-4.5 text-primary" />
              Targeted Personas
            </h3>
            
            {profilesLoading ? (
              <div className="flex justify-center py-6">
                <Loader2 className="h-5 w-5 animate-spin text-primary" />
              </div>
            ) : profiles.length === 0 ? (
              <p className="text-xs text-muted-foreground text-center py-4">No personas created.</p>
            ) : (
              <div className="space-y-2">
                {profiles.map((profile) => (
                  <div 
                    key={profile.id}
                    onClick={() => setSelectedProfileId(profile.id)}
                    className={`p-3.5 rounded-xl border flex items-center justify-between cursor-pointer transition-all duration-200 relative overflow-hidden group ${
                      selectedProfileId === profile.id 
                        ? 'border-primary bg-primary/5 shadow-sm' 
                        : 'hover:bg-muted/50 border-border'
                    }`}
                  >
                    <div 
                      className="absolute left-0 top-0 bottom-0 w-[4px]" 
                      style={{ backgroundColor: profile.colorCode }} 
                    />

                    <div className="flex items-center gap-3 pl-2">
                      <div className="h-8 w-8 rounded-lg flex items-center justify-center bg-muted/80 text-foreground">
                        <Briefcase className="h-4 w-4" />
                      </div>
                      <div>
                        <h4 className="text-sm font-semibold flex items-center gap-1.5">
                          {profile.title}
                          {profile.isDefault && (
                            <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-primary/10 text-primary">
                              Default
                            </span>
                          )}
                        </h4>
                      </div>
                    </div>

                    {!profile.isDefault && (
                      <button
                        onClick={(e) => { e.stopPropagation(); handleDeleteProfile(profile.id); }}
                        className="opacity-0 group-hover:opacity-100 p-1.5 border border-rose-500/20 bg-rose-500/5 hover:bg-rose-500/10 text-rose-500 rounded-lg transition-all"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right column: Resumes upload & history list */}
        <div className="col-span-12 lg:col-span-8 space-y-6">
          {selectedProfileId && activeProfile ? (
            <>
              {/* Resume Version Uploader */}
              <div className="p-6 rounded-2xl border bg-card glass-card space-y-4">
                <h3 className="text-base font-display font-bold flex items-center gap-2">
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
                      className="flex items-center gap-2 px-4 py-2.5 border border-dashed rounded-xl text-xs font-semibold hover:bg-muted cursor-pointer transition-colors"
                    >
                      <FileText className="h-4 w-4 text-primary" />
                      {resumeFile ? resumeFile.name : 'Select Resume PDF File'}
                    </label>
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-semibold">Changelog Comments</label>
                    <textarea
                      placeholder="e.g. Added Java 21 projects and updated summary keywords..."
                      value={resumeChangelog}
                      onChange={(e) => setResumeChangelog(e.target.value)}
                      rows={3}
                      className="w-full p-2.5 bg-background border rounded-lg text-xs placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={uploadingResume || !resumeFile}
                    className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-primary text-primary-foreground hover:bg-primary/95 text-xs font-semibold transition-all disabled:opacity-50"
                  >
                    {uploadingResume && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
                    Submit Resume Version
                  </button>
                </form>
              </div>

              {/* Resumes Versions Table */}
              <div className="p-6 rounded-2xl border bg-card glass-card">
                <h3 className="text-base font-display font-bold mb-4">Resume Version Matrix</h3>

                {resumesLoading ? (
                  <div className="flex justify-center py-10">
                    <Loader2 className="h-6 w-6 animate-spin text-primary" />
                  </div>
                ) : resumes.length === 0 ? (
                  <div className="flex flex-col items-center justify-center text-center py-12 border border-dashed rounded-xl">
                    <FileText className="h-8 w-8 text-muted-foreground/30 mb-2" />
                    <p className="text-xs font-semibold text-muted-foreground">No resumes uploaded yet</p>
                    <p className="text-[10px] text-muted-foreground mt-0.5">Attach your first resume version above.</p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs border-collapse">
                      <thead>
                        <tr className="border-b border-border/60 text-muted-foreground">
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
                              <span className="p-1 px-2 rounded bg-primary/10 text-primary text-[10px] font-bold uppercase">
                                v{resume.versionNumber}
                              </span>
                            </td>
                            <td className="py-4 font-semibold max-w-[150px] truncate">{resume.fileName}</td>
                            <td className="py-4 text-muted-foreground max-w-[200px] truncate">
                              {resume.changelog || 'No notes.'}
                            </td>
                            <td className="py-4 text-muted-foreground">
                              {new Date(resume.createdAt).toLocaleDateString()}
                            </td>
                            <td className="py-4 text-right">
                              <div className="flex items-center justify-end gap-1.5">
                                <button
                                  onClick={() => handleDownload(resume.id, resume.fileName)}
                                  className="p-1.5 border rounded-lg bg-card hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
                                >
                                  <Download className="h-3.5 w-3.5" />
                                </button>
                                <button
                                  onClick={() => handleDeleteResume(resume.id)}
                                  className="p-1.5 border border-rose-500/20 bg-rose-500/5 hover:bg-rose-500/10 text-rose-500 rounded-lg transition-colors"
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
            <div className="flex h-[50vh] flex-col items-center justify-center text-center border border-dashed rounded-2xl p-12 bg-card glass-card">
              <Briefcase className="h-8 w-8 text-muted-foreground/30 mb-2" />
              <h4 className="text-sm font-semibold">No career profile selected</h4>
              <p className="text-xs text-muted-foreground mt-0.5">Please create or select a career persona on the left side to display resumes.</p>
            </div>
          )}
        </div>
      </div>

      {/* Create Profile Modal */}
      {isProfileModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <form 
            onSubmit={handleProfileSubmit}
            className="bg-slate-900 border border-slate-800 p-6 rounded-2xl w-full max-w-md space-y-4 animate-in zoom-in-95 duration-200"
          >
            <div className="flex items-center justify-between pb-2 border-b border-slate-800">
              <h3 className="text-lg font-display font-extrabold text-white">Create Career Persona</h3>
              <button type="button" onClick={() => setIsProfileModalOpen(false)} className="text-slate-400 hover:text-white">
                ✕
              </button>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-300">Persona Title *</label>
              <input
                type="text"
                required
                value={profileTitle}
                onChange={(e) => setProfileTitle(e.target.value)}
                placeholder="e.g. Frontend Engineer"
                className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-300">Theme Hex Color *</label>
                <div className="flex gap-2 items-center">
                  <input
                    type="color"
                    value={profileColor}
                    onChange={(e) => setProfileColor(e.target.value)}
                    className="w-8 h-8 rounded border bg-transparent cursor-pointer"
                  />
                  <input
                    type="text"
                    required
                    value={profileColor}
                    onChange={(e) => setProfileColor(e.target.value)}
                    className="w-full px-2 py-1.5 bg-slate-950 border border-slate-800 rounded-lg text-xs text-white"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-300">Default Profile</label>
                <div className="flex items-center h-8">
                  <input
                    type="checkbox"
                    id="profile-default-checkbox"
                    checked={profileIsDefault}
                    onChange={(e) => setProfileIsDefault(e.target.checked)}
                    className="h-4.5 w-4.5 text-primary border-slate-800 rounded focus:ring-primary"
                  />
                  <label htmlFor="profile-default-checkbox" className="text-xs text-slate-300 ml-2 font-medium">Set as Default</label>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-4 border-t border-slate-800 mt-6">
              <button
                type="button"
                onClick={() => setIsProfileModalOpen(false)}
                className="px-4 py-2 border border-slate-800 hover:bg-slate-800 text-sm font-medium text-slate-300 rounded-xl transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={createProfileMutation.isPending}
                className="flex items-center justify-center gap-2 px-4 py-2 rounded-xl bg-primary hover:bg-primary/95 text-white text-sm font-semibold transition-all duration-200"
              >
                {createProfileMutation.isPending && <Loader2 className="h-4 w-4 animate-spin" />}
                Create Persona
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
