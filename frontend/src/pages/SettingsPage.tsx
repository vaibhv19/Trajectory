import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../services/api';
import { useAuthStore } from '../store/authStore';
import { useThemeStore } from '../store/themeStore';
import type { User } from '../types';
import { 
  User as UserIcon,
  Database,
  Download,
  Upload,
  Loader2,
  CheckCircle,
  AlertTriangle,
  Sliders,
  Bell,
  Keyboard,
  ShieldAlert,
  FileSpreadsheet
} from 'lucide-react';

export const SettingsPage: React.FC = () => {
  const queryClient = useQueryClient();
  const logout = useAuthStore((state) => state.logout);
  const token = useAuthStore((state) => state.token);
  const { 
    themeMode, 
    setThemeMode, 
    fontSize, 
    setFontSize, 
    compactMode, 
    setCompactMode 
  } = useThemeStore();

  // Active Tab
  const [activeTab, setActiveTab] = useState<'profile' | 'appearance' | 'notifications' | 'shortcuts' | 'data' | 'danger'>('profile');

  // Profile Form States
  const [fullName, setFullName] = useState('');
  const [avatarUrl, setAvatarUrl] = useState('');
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  // Toggles
  const [ghostThreshold, setGhostThreshold] = useState(30);
  const [autoArchive, setAutoArchive] = useState(false);
  const [browserAlerts, setBrowserAlerts] = useState(true);
  const [emailAlerts, setEmailAlerts] = useState(true);

  // Status messages
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [importing, setImporting] = useState(false);
  const [processingDanger, setProcessingDanger] = useState(false);

  // Fetch current user settings
  const { data: userProfile, isLoading, refetch } = useQuery<User>({
    queryKey: ['user-settings-profile'],
    queryFn: api.users.getProfile,
    enabled: !!token,
  });

  useEffect(() => {
    if (userProfile) {
      setFullName(userProfile.fullName);
      setAvatarUrl(userProfile.avatarUrl || '');
      setGhostThreshold(userProfile.ghostThresholdDays);
      setAutoArchive(userProfile.autoArchiveEnabled);
      setBrowserAlerts(userProfile.browserNotificationsEnabled ?? true);
      setEmailAlerts(userProfile.emailNotificationsEnabled ?? true);
    }
  }, [userProfile]);

  // Mutations
  const updateProfileMutation = useMutation({
    mutationFn: () => api.users.updateProfile(fullName, avatarUrl || undefined),
    onSuccess: (updated) => {
      queryClient.setQueryData(['user-settings-profile'], updated);
      showSuccess('Profile details saved successfully.');
    },
    onError: (err: any) => showTransientError(err.message),
  });

  const changePasswordMutation = useMutation({
    mutationFn: () => api.users.changePassword(oldPassword, newPassword),
    onSuccess: () => {
      setOldPassword('');
      setNewPassword('');
      setConfirmPassword('');
      showSuccess('Password updated successfully.');
    },
    onError: (err: any) => showTransientError(err.message),
  });

  const updateSettingsMutation = useMutation({
    mutationFn: () => api.users.updateSettings({
      ghostThresholdDays: ghostThreshold,
      autoArchiveEnabled: autoArchive,
      browserNotificationsEnabled: browserAlerts,
      emailNotificationsEnabled: emailAlerts
    }),
    onSuccess: (updated) => {
      queryClient.setQueryData(['user-settings-profile'], updated);
      showSuccess('Automation settings saved successfully.');
    },
    onError: (err: any) => showTransientError(err.message),
  });

  const deleteAccountMutation = useMutation({
    mutationFn: api.users.deleteAccount,
    onSuccess: () => {
      logout();
      window.location.href = '/login';
    },
    onError: (err: any) => showTransientError(err.message),
  });

  // Helpers
  const showSuccess = (msg: string) => {
    setSuccessMessage(msg);
    setErrorMessage('');
    setTimeout(() => setSuccessMessage(''), 4000);
  };

  const showTransientError = (msg: string) => {
    setErrorMessage(msg);
    setSuccessMessage('');
    setTimeout(() => setErrorMessage(''), 4000);
  };

  // Avatar Event Handlers
  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 2 * 1024 * 1024) {
      showTransientError("Profile photo must be smaller than 2MB.");
      return;
    }

    setUploadingAvatar(true);
    try {
      const updatedUser = await api.users.uploadAvatar(file);
      setAvatarUrl(updatedUser.avatarUrl || '');
      queryClient.setQueryData(['user-settings-profile'], updatedUser);
      showSuccess("Profile avatar uploaded successfully.");
    } catch (err: any) {
      showTransientError(err.message || "Failed to upload avatar.");
    } finally {
      setUploadingAvatar(false);
    }
  };

  const handleAvatarDelete = async () => {
    setUploadingAvatar(true);
    try {
      const updatedUser = await api.users.deleteAvatar();
      setAvatarUrl('');
      queryClient.setQueryData(['user-settings-profile'], updatedUser);
      showSuccess("Profile avatar removed.");
    } catch (err: any) {
      showTransientError(err.message || "Failed to delete avatar.");
    } finally {
      setUploadingAvatar(false);
    }
  };

  // Data Export / Backups
  const handleExportJSON = async () => {
    try {
      const payload = await api.users.exportData();
      const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `trajectory-backup-${new Date().toISOString().split('T')[0]}.json`;
      a.click();
      showSuccess("JSON Workspace backup downloaded.");
    } catch (err: any) {
      showTransientError("Failed to export backup: " + err.message);
    }
  };

  const handleImportJSON = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setImporting(true);
    try {
      const reader = new FileReader();
      reader.onload = async (event) => {
        try {
          const content = JSON.parse(event.target?.result as string);
          await api.users.importData(content);
          showSuccess("Workspace JSON restored successfully.");
          refetch();
        } catch (err: any) {
          showTransientError("Restoration failed: Invalid JSON layout.");
        } finally {
          setImporting(false);
        }
      };
      reader.readAsText(file);
    } catch (err: any) {
      showTransientError("Import failed: " + err.message);
      setImporting(false);
    }
  };

  // CSV Import/Export
  const handleExportCSV = async () => {
    try {
      const appsRes = await api.applications.list({ page: 0, size: 5000 });
      const apps = appsRes.content;
      
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
      a.download = `trajectory-applications-${new Date().toISOString().split('T')[0]}.csv`;
      a.click();
      showSuccess("Applications CSV downloaded successfully.");
    } catch (err: any) {
      showTransientError("Failed to export CSV: " + err.message);
    }
  };

  const handleImportCSV = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setImporting(true);
    try {
      const reader = new FileReader();
      reader.onload = async (event) => {
        const text = event.target?.result as string;
        const lines = text.split('\n').filter(l => l.trim().length > 0);
        
        // Skip header
        if (lines.length <= 1) {
          showTransientError("CSV is empty or lacks header rows.");
          setImporting(false);
          return;
        }

        let importCount = 0;
        // Parse simple CSV rows
        for (let i = 1; i < lines.length; i++) {
          const cols = lines[i].split(',').map(col => col.replace(/^"|"$/g, '').trim());
          if (cols.length >= 3) {
            const companyName = cols[0];
            const roleTitle = cols[1];
            const status = cols[2] as any;
            const salaryRange = cols[3] || null;
            const dateApplied = cols[4] || new Date().toISOString().split('T')[0];
            const location = cols[5] || null;
            const jobDescriptionUrl = cols[6] || null;

            await api.applications.create({
              companyName,
              roleTitle,
              status,
              salaryRange,
              dateApplied,
              location,
              jobDescriptionUrl
            });
            importCount++;
          }
        }
        showSuccess(`Imported ${importCount} applications from CSV.`);
        queryClient.invalidateQueries({ queryKey: ['applications'] });
        setImporting(false);
      };
      reader.readAsText(file);
    } catch (err: any) {
      showTransientError("CSV upload error: " + err.message);
      setImporting(false);
    }
  };

  // Danger Zone Handlers
  const purgeApplications = async () => {
    if (!confirm("Are you absolutely sure you want to delete ALL applications from your database? This is irreversible.")) return;
    setProcessingDanger(true);
    try {
      const res = await api.applications.list({ page: 0, size: 5000 });
      await Promise.all(res.content.map(app => api.applications.delete(app.id)));
      showSuccess("All applications successfully purged.");
      queryClient.invalidateQueries({ queryKey: ['applications'] });
    } catch (err: any) {
      showTransientError("Purge failed: " + err.message);
    } finally {
      setProcessingDanger(false);
    }
  };

  const purgeOutreach = async () => {
    if (!confirm("Are you absolutely sure you want to delete ALL outreach and recruiter logs? This is irreversible.")) return;
    setProcessingDanger(true);
    try {
      const res = await api.outreach.list();
      await Promise.all(res.map(out => api.outreach.delete(out.id)));
      showSuccess("All outreach contacts successfully purged.");
      queryClient.invalidateQueries({ queryKey: ['outreach'] });
    } catch (err: any) {
      showTransientError("Purge failed: " + err.message);
    } finally {
      setProcessingDanger(false);
    }
  };

  const resetLocalAnalytics = () => {
    if (!confirm("Reset all local targets, daily goals, and checklists to defaults?")) return;
    localStorage.removeItem('trajectory_weekly_goal');
    localStorage.removeItem('trajectory_daily_focus');
    localStorage.removeItem('trajectory_daily_checklist');
    showSuccess("Dashboard agenda workspace reset completed.");
    setTimeout(() => window.location.reload(), 1000);
  };

  const handleProfileSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName.trim()) return;
    updateProfileMutation.mutate();
  };

  const handlePasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!oldPassword || !newPassword) return;
    if (newPassword !== confirmPassword) {
      showTransientError('Passwords do not match.');
      return;
    }
    changePasswordMutation.mutate();
  };

  const handleSettingsSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateSettingsMutation.mutate();
  };

  const handleDeleteAccount = () => {
    const text = 'DELETE';
    const input = prompt(`To permanently delete your account, type "${text}" in the field below. All data will be lost forever:`);
    if (input === text) {
      deleteAccountMutation.mutate();
    } else if (input !== null) {
      alert('Confirmation word did not match. Account deletion cancelled.');
    }
  };

  if (isLoading) {
    return (
      <div className="py-20 flex flex-col items-center justify-center text-muted-foreground">
        <Loader2 className="w-8 h-8 animate-spin text-primary mb-2" />
        <span className="text-xs font-mono uppercase tracking-wider">Loading configurations...</span>
      </div>
    );
  }

  const initials = userProfile?.fullName
    ? userProfile.fullName.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
    : 'US';

  return (
    <div className="space-y-6 max-w-4xl mx-auto animate-in fade-in duration-300">
      {/* Title */}
      <div>
        <h2 className="text-2xl font-display font-bold tracking-tight text-foreground">
          Workspace settings
        </h2>
        <p className="text-sm text-muted-foreground font-sans mt-1">
          Configure your personal details, aesthetic preferences, automated triggers, data backups, and security.
        </p>
      </div>

      {/* Success/Error Toasts */}
      {successMessage && (
        <div className="bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-100 dark:border-emerald-900/50 p-4 text-emerald-700 dark:text-emerald-400 text-xs font-sans rounded-[4px] flex items-center gap-2">
          <CheckCircle className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
          <span>{successMessage}</span>
        </div>
      )}
      {errorMessage && (
        <div className="bg-red-50 dark:bg-red-950/20 border border-red-100 dark:border-red-900/50 p-4 text-red-700 dark:text-red-400 text-xs font-sans rounded-[4px] flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 text-red-600 dark:text-red-400 shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* Sidebar Tabs Grid */}
      <div className="flex flex-col md:flex-row gap-6 font-sans">
        {/* Navigation Sidebar */}
        <div className="w-full md:w-56 shrink-0 flex flex-row md:flex-col overflow-x-auto md:overflow-x-visible border-b md:border-b-0 md:border-r border-border/40 pb-2 md:pb-0 md:pr-4 gap-1">
          <button
            onClick={() => setActiveTab('profile')}
            className={`flex items-center gap-2 px-3 py-2 text-xs font-medium border-b-2 md:border-b-0 md:border-l-2 text-left transition-colors whitespace-nowrap ${activeTab === 'profile' ? 'border-primary text-foreground bg-primary/[2%] font-semibold' : 'border-transparent text-muted-foreground hover:text-foreground'}`}
          >
            <UserIcon className="w-3.5 h-3.5" />
            Profile details
          </button>
          
          <button
            onClick={() => setActiveTab('appearance')}
            className={`flex items-center gap-2 px-3 py-2 text-xs font-medium border-b-2 md:border-b-0 md:border-l-2 text-left transition-colors whitespace-nowrap ${activeTab === 'appearance' ? 'border-primary text-foreground bg-primary/[2%] font-semibold' : 'border-transparent text-muted-foreground hover:text-foreground'}`}
          >
            <Sliders className="w-3.5 h-3.5" />
            Appearance
          </button>

          <button
            onClick={() => setActiveTab('notifications')}
            className={`flex items-center gap-2 px-3 py-2 text-xs font-medium border-b-2 md:border-b-0 md:border-l-2 text-left transition-colors whitespace-nowrap ${activeTab === 'notifications' ? 'border-primary text-foreground bg-primary/[2%] font-semibold' : 'border-transparent text-muted-foreground hover:text-foreground'}`}
          >
            <Bell className="w-3.5 h-3.5" />
            Notifications
          </button>

          <button
            onClick={() => setActiveTab('shortcuts')}
            className={`flex items-center gap-2 px-3 py-2 text-xs font-medium border-b-2 md:border-b-0 md:border-l-2 text-left transition-colors whitespace-nowrap ${activeTab === 'shortcuts' ? 'border-primary text-foreground bg-primary/[2%] font-semibold' : 'border-transparent text-muted-foreground hover:text-foreground'}`}
          >
            <Keyboard className="w-3.5 h-3.5" />
            Shortcuts
          </button>

          <button
            onClick={() => setActiveTab('data')}
            className={`flex items-center gap-2 px-3 py-2 text-xs font-medium border-b-2 md:border-b-0 md:border-l-2 text-left transition-colors whitespace-nowrap ${activeTab === 'data' ? 'border-primary text-foreground bg-primary/[2%] font-semibold' : 'border-transparent text-muted-foreground hover:text-foreground'}`}
          >
            <Database className="w-3.5 h-3.5" />
            Data portability
          </button>

          <button
            onClick={() => setActiveTab('danger')}
            className={`flex items-center gap-2 px-3 py-2 text-xs font-medium border-b-2 md:border-b-0 md:border-l-2 text-left transition-colors whitespace-nowrap ${activeTab === 'danger' ? 'border-red-500 text-red-500 bg-red-500/[2%] font-semibold' : 'border-transparent text-muted-foreground hover:text-red-500'}`}
          >
            <ShieldAlert className="w-3.5 h-3.5" />
            Danger zone
          </button>
        </div>

        {/* Tab Content Display Area */}
        <div className="flex-1 min-w-0 py-1 space-y-6">
          
          {/* PROFILE SETTINGS SECTION */}
          {activeTab === 'profile' && (
            <div className="space-y-6">
              <form onSubmit={handleProfileSubmit} className="space-y-4">
                <div className="pb-3 border-b border-border/20">
                  <h3 className="text-sm font-semibold text-foreground">Identity profile</h3>
                  <p className="text-xs text-muted-foreground mt-0.5">Manage your credentials, names, and visual avatar.</p>
                </div>

                <div className="flex flex-col sm:flex-row items-start gap-4">
                  {/* Photo Section */}
                  <div className="space-y-2">
                    <label className="block text-[10px] font-mono font-bold uppercase tracking-wider text-muted-foreground">
                      Profile photo
                    </label>
                    <div className="flex items-center gap-3">
                      {avatarUrl ? (
                        <img 
                          src={avatarUrl} 
                          alt="Avatar" 
                          className="w-14 h-14 rounded-full object-cover border border-border"
                          onError={(e) => {
                            (e.target as HTMLImageElement).src = `https://api.dicebear.com/7.x/initials/svg?seed=${fullName || 'U'}`;
                          }}
                        />
                      ) : (
                        <div className="w-14 h-14 rounded-full bg-primary/10 text-primary flex items-center justify-center font-mono font-bold text-sm border border-primary/20">
                          {initials}
                        </div>
                      )}
                      <div className="space-y-1.5">
                        <div className="flex items-center gap-2">
                          <input 
                            type="file" 
                            id="avatar-upload-input" 
                            accept="image/*" 
                            onChange={handleAvatarUpload}
                            className="hidden"
                            disabled={uploadingAvatar}
                          />
                          <label 
                            htmlFor="avatar-upload-input"
                            className="px-2.5 py-1 border border-border hover:bg-muted text-xs font-semibold rounded-[4px] cursor-pointer transition-colors inline-block"
                          >
                            {uploadingAvatar ? 'Uploading...' : 'Upload photo'}
                          </label>
                          {avatarUrl && (
                            <button
                              type="button"
                              onClick={handleAvatarDelete}
                              disabled={uploadingAvatar}
                              className="px-2.5 py-1 border border-red-200/40 bg-red-500/5 hover:bg-red-500/10 text-red-500 text-xs font-semibold rounded-[4px] transition-colors"
                            >
                              Remove
                            </button>
                          )}
                        </div>
                        <span className="text-[10px] text-muted-foreground block">PNG, JPG, or GIF up to 2MB.</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] font-mono font-bold uppercase tracking-wider text-muted-foreground mb-1.5">
                      Full name
                    </label>
                    <input
                      type="text"
                      required
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      className="w-full px-3 py-2 bg-background border border-border rounded-[4px] text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-mono font-bold uppercase tracking-wider text-muted-foreground mb-1.5">
                      Email address
                    </label>
                    <input
                      type="email"
                      disabled
                      value={userProfile?.email || ''}
                      className="w-full px-3 py-2 bg-muted border border-border rounded-[4px] text-sm text-muted-foreground cursor-not-allowed"
                    />
                  </div>
                </div>

                <div className="pt-2 flex justify-end">
                  <button
                    type="submit"
                    disabled={updateProfileMutation.isPending}
                    className="flex items-center gap-1.5 bg-primary hover:bg-primary/90 text-primary-foreground px-3.5 py-1.5 text-xs font-semibold rounded-[4px] transition-colors"
                  >
                    {updateProfileMutation.isPending && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                    Save profile
                  </button>
                </div>
              </form>

              {/* Password Section */}
              <form onSubmit={handlePasswordSubmit} className="space-y-4 pt-4 border-t border-border/20">
                <div className="pb-1">
                  <h3 className="text-sm font-semibold text-foreground">Update password</h3>
                  <p className="text-xs text-muted-foreground mt-0.5">Change the local password credential linked to this email.</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-[10px] font-mono font-bold uppercase tracking-wider text-muted-foreground mb-1.5">
                      Current password
                    </label>
                    <input
                      type="password"
                      required
                      placeholder="••••••••"
                      value={oldPassword}
                      onChange={(e) => setOldPassword(e.target.value)}
                      className="w-full px-3 py-2 bg-background border border-border rounded-[4px] text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-mono font-bold uppercase tracking-wider text-muted-foreground mb-1.5">
                      New password
                    </label>
                    <input
                      type="password"
                      required
                      placeholder="••••••••"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      className="w-full px-3 py-2 bg-background border border-border rounded-[4px] text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-mono font-bold uppercase tracking-wider text-muted-foreground mb-1.5">
                      Confirm new password
                    </label>
                    <input
                      type="password"
                      required
                      placeholder="••••••••"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className="w-full px-3 py-2 bg-background border border-border rounded-[4px] text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                    />
                  </div>
                </div>

                <div className="pt-2 flex justify-end">
                  <button
                    type="submit"
                    disabled={changePasswordMutation.isPending}
                    className="flex items-center gap-1.5 bg-primary hover:bg-primary/90 text-primary-foreground px-3.5 py-1.5 text-xs font-semibold rounded-[4px] transition-colors"
                  >
                    {changePasswordMutation.isPending && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                    Update password
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* APPEARANCE SECTION */}
          {activeTab === 'appearance' && (
            <div className="space-y-6">
              <div className="pb-3 border-b border-border/20">
                <h3 className="text-sm font-semibold text-foreground">Aesthetics & theme preferences</h3>
                <p className="text-xs text-muted-foreground mt-0.5">Customize layouts, color modes, and scale sizes.</p>
              </div>

              <div className="space-y-4">
                {/* Theme mode selection */}
                <div>
                  <label className="block text-[10px] font-mono font-bold uppercase tracking-wider text-muted-foreground mb-2">
                    Interface Theme
                  </label>
                  <div className="grid grid-cols-3 gap-2.5">
                    <button
                      onClick={() => setThemeMode('light')}
                      className={`flex flex-col items-center gap-2 p-3 border rounded-[4px] text-xs font-semibold transition-all ${themeMode === 'light' ? 'border-primary bg-primary/[2%] text-foreground' : 'border-border hover:bg-muted text-muted-foreground'}`}
                    >
                      <span>☀️ Light mode</span>
                    </button>
                    <button
                      onClick={() => setThemeMode('dark')}
                      className={`flex flex-col items-center gap-2 p-3 border rounded-[4px] text-xs font-semibold transition-all ${themeMode === 'dark' ? 'border-primary bg-primary/[2%] text-foreground' : 'border-border hover:bg-muted text-muted-foreground'}`}
                    >
                      <span>🌙 Dark mode</span>
                    </button>
                    <button
                      onClick={() => setThemeMode('system')}
                      className={`flex flex-col items-center gap-2 p-3 border rounded-[4px] text-xs font-semibold transition-all ${themeMode === 'system' ? 'border-primary bg-primary/[2%] text-foreground' : 'border-border hover:bg-muted text-muted-foreground'}`}
                    >
                      <span>💻 System theme</span>
                    </button>
                  </div>
                </div>

                {/* Density Settings */}
                <div className="flex items-center justify-between border-t border-border/20 pt-4">
                  <div>
                    <label className="text-xs font-semibold text-foreground block">Compact layout density</label>
                    <span className="text-[11px] text-muted-foreground block">Compresses grid paddings and margins for dashboard pages.</span>
                  </div>
                  <input
                    type="checkbox"
                    checked={compactMode}
                    onChange={(e) => setCompactMode(e.target.checked)}
                    className="w-4 h-4 accent-primary cursor-pointer border border-border rounded-[4px]"
                  />
                </div>

                {/* Font Size Selection */}
                <div className="flex items-center justify-between border-t border-border/20 pt-4">
                  <div>
                    <label className="text-xs font-semibold text-foreground block">Workspace font scale</label>
                    <span className="text-[11px] text-muted-foreground block">Scale text sizes for ideal readability.</span>
                  </div>
                  <select
                    value={fontSize}
                    onChange={(e) => setFontSize(e.target.value as any)}
                    className="px-3 py-1.5 bg-background border border-border rounded-[4px] text-xs focus:outline-none focus:ring-2 focus:ring-ring w-32 text-foreground"
                  >
                    <option value="small">Small</option>
                    <option value="medium">Medium</option>
                    <option value="large">Large</option>
                  </select>
                </div>
              </div>
            </div>
          )}

          {/* NOTIFICATIONS SECTION */}
          {activeTab === 'notifications' && (
            <form onSubmit={handleSettingsSubmit} className="space-y-6">
              <div className="pb-3 border-b border-border/20">
                <h3 className="text-sm font-semibold text-foreground">Alerts & notification preferences</h3>
                <p className="text-xs text-muted-foreground mt-0.5">Toggle alert digests and automated state transitions.</p>
              </div>

              <div className="space-y-4">
                {/* Auto-archive */}
                <div className="flex items-start justify-between">
                  <div className="space-y-0.5 pr-4">
                    <label className="text-xs font-semibold text-foreground block">Auto-archive rejections & ghosts</label>
                    <span className="text-[11px] text-muted-foreground block">Automatically move applications to archives when marked Rejected or Ghosted.</span>
                  </div>
                  <input
                    type="checkbox"
                    checked={autoArchive}
                    onChange={(e) => setAutoArchive(e.target.checked)}
                    className="w-4 h-4 accent-primary cursor-pointer border border-border rounded-[4px]"
                  />
                </div>

                {/* Ghost threshold days */}
                <div className="space-y-1.5 border-t border-border/20 pt-4">
                  <div className="flex justify-between items-center">
                    <label className="text-xs font-semibold text-foreground">Ghost detection threshold</label>
                    <span className="text-xs font-mono font-bold bg-muted px-2 py-0.5 border border-border rounded-[4px]">
                      {ghostThreshold} Days
                    </span>
                  </div>
                  <input
                    type="range"
                    min="7"
                    max="90"
                    value={ghostThreshold}
                    onChange={(e) => setGhostThreshold(Number(e.target.value))}
                    className="w-full accent-primary h-1.5 bg-muted rounded-[4px] appearance-none cursor-pointer"
                  />
                  <span className="text-[10px] text-muted-foreground block">Days of inactivity before Applied roles auto-transition to Ghosted.</span>
                </div>

                {/* In-app push notifications */}
                <div className="flex items-start justify-between border-t border-border/20 pt-4">
                  <div className="space-y-0.5 pr-4">
                    <label className="text-xs font-semibold text-foreground block">Browser notifications</label>
                    <span className="text-[11px] text-muted-foreground block">Receive interview alerts and deadline notifications directly in-browser.</span>
                  </div>
                  <input
                    type="checkbox"
                    checked={browserAlerts}
                    onChange={(e) => setBrowserAlerts(e.target.checked)}
                    className="w-4 h-4 accent-primary cursor-pointer border border-border rounded-[4px]"
                  />
                </div>

                {/* Email digests */}
                <div className="flex items-start justify-between border-t border-border/20 pt-4">
                  <div className="space-y-0.5 pr-4">
                    <label className="text-xs font-semibold text-foreground block">Daily email reminders</label>
                    <span className="text-[11px] text-muted-foreground block">Receive daily task checklists and upcoming interview schedules in your mailbox.</span>
                  </div>
                  <input
                    type="checkbox"
                    checked={emailAlerts}
                    onChange={(e) => setEmailAlerts(e.target.checked)}
                    className="w-4 h-4 accent-primary cursor-pointer border border-border rounded-[4px]"
                  />
                </div>
              </div>

              <div className="pt-2 flex justify-end">
                <button
                  type="submit"
                  disabled={updateSettingsMutation.isPending}
                  className="flex items-center gap-1.5 bg-primary hover:bg-primary/90 text-primary-foreground px-3.5 py-1.5 text-xs font-semibold rounded-[4px] transition-colors"
                >
                  {updateSettingsMutation.isPending && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                  Save notification preferences
                </button>
              </div>
            </form>
          )}

          {/* KEYBOARD SHORTCUTS SECTION */}
          {activeTab === 'shortcuts' && (
            <div className="space-y-6">
              <div className="pb-3 border-b border-border/20">
                <h3 className="text-sm font-semibold text-foreground">Keyboard commands cheatsheet</h3>
                <p className="text-xs text-muted-foreground mt-0.5">Control the entire platform instantly using keyboard triggers.</p>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="border-b border-border bg-muted/40">
                      <th className="px-4 py-2 font-mono font-bold text-muted-foreground uppercase tracking-wider text-[9px]">Command Action</th>
                      <th className="px-4 py-2 font-mono font-bold text-muted-foreground uppercase tracking-wider text-[9px]">Shortcut Keys</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border/60">
                    <tr>
                      <td className="px-4 py-2.5 text-foreground/80 font-medium">Toggle global search & commands palette</td>
                      <td className="px-4 py-2.5"><kbd className="bg-muted px-2 py-1 border border-border rounded-[4px] font-mono text-[10px] text-foreground font-semibold shadow-sm">Ctrl + K</kbd></td>
                    </tr>
                    <tr>
                      <td className="px-4 py-2.5 text-foreground/80 font-medium">Close drawer overlays, modals, and palettes</td>
                      <td className="px-4 py-2.5"><kbd className="bg-muted px-2 py-1 border border-border rounded-[4px] font-mono text-[10px] text-foreground font-semibold shadow-sm">Esc</kbd></td>
                    </tr>
                    <tr>
                      <td className="px-4 py-2.5 text-foreground/80 font-medium">Jump to Home Agenda dashboard</td>
                      <td className="px-4 py-2.5 font-mono text-muted-foreground text-[10px]">Ctrl + K → "Home"</td>
                    </tr>
                    <tr>
                      <td className="px-4 py-2.5 text-foreground/80 font-medium">View Analytics dashboard</td>
                      <td className="px-4 py-2.5 font-mono text-muted-foreground text-[10px]">Ctrl + K → "Analytics"</td>
                    </tr>
                    <tr>
                      <td className="px-4 py-2.5 text-foreground/80 font-medium">Quick log new job application</td>
                      <td className="px-4 py-2.5 font-mono text-muted-foreground text-[10px]">Ctrl + K → "Create New Application"</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* DATA PORTABILITY SECTION */}
          {activeTab === 'data' && (
            <div className="space-y-6">
              <div className="pb-3 border-b border-border/20">
                <h3 className="text-sm font-semibold text-foreground">Workspace portability</h3>
                <p className="text-xs text-muted-foreground mt-0.5">Export records as JSON backups or spreadsheets, and import previously saved files.</p>
              </div>

              {/* JSON backups */}
              <div className="space-y-4">
                <h4 className="text-[10px] font-mono font-bold tracking-wider text-muted-foreground uppercase flex items-center gap-1.5">
                  <Database className="w-3.5 h-3.5 text-primary" />
                  JSON database backups
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="border border-border/60 p-4 rounded-[4px] flex flex-col justify-between space-y-3 bg-card">
                    <div>
                      <h5 className="font-semibold text-xs text-foreground">Download JSON backup</h5>
                      <p className="text-[11px] text-muted-foreground mt-1">Saves all active application funnels, resume references, and contact records in a single restore file.</p>
                    </div>
                    <button
                      onClick={handleExportJSON}
                      className="w-full flex items-center justify-center gap-1.5 bg-primary hover:bg-primary/90 text-primary-foreground text-xs font-semibold py-2 rounded-[4px] transition-colors"
                    >
                      <Download className="w-3.5 h-3.5" />
                      Download JSON
                    </button>
                  </div>

                  <div className="border border-border/60 p-4 rounded-[4px] flex flex-col justify-between space-y-3 bg-card">
                    <div>
                      <h5 className="font-semibold text-xs text-foreground">Restore JSON backup</h5>
                      <p className="text-[11px] text-muted-foreground mt-1">Restores your entire pipeline from a previously downloaded JSON backup. <span className="text-red-500 font-medium">Overwrites existing active data!</span></p>
                    </div>
                    <div className="relative">
                      <input
                        type="file"
                        accept=".json"
                        onChange={handleImportJSON}
                        disabled={importing}
                        className="absolute inset-0 opacity-0 cursor-pointer"
                      />
                      <button
                        type="button"
                        disabled={importing}
                        className="w-full bg-muted border border-border hover:bg-muted/80 text-foreground text-xs font-semibold py-2 rounded-[4px] transition-colors flex items-center justify-center gap-1.5"
                      >
                        {importing ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Upload className="w-3.5 h-3.5" />}
                        Restore JSON
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* CSV Spreadsheet */}
              <div className="space-y-4 pt-4 border-t border-border/20">
                <h4 className="text-[10px] font-mono font-bold tracking-wider text-muted-foreground uppercase flex items-center gap-1.5">
                  <FileSpreadsheet className="w-3.5 h-3.5 text-primary" />
                  CSV spreadsheet exports
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="border border-border/60 p-4 rounded-[4px] flex flex-col justify-between space-y-3 bg-card">
                    <div>
                      <h5 className="font-semibold text-xs text-foreground">Export applications to CSV</h5>
                      <p className="text-[11px] text-muted-foreground mt-1">Generates a standard spreadsheet showing companies, titles, dates, salary ranges, and URLs.</p>
                    </div>
                    <button
                      onClick={handleExportCSV}
                      className="w-full flex items-center justify-center gap-1.5 bg-muted border border-border hover:bg-muted/80 text-foreground text-xs font-semibold py-2 rounded-[4px] transition-colors"
                    >
                      <Download className="w-3.5 h-3.5" />
                      Export CSV spreadsheet
                    </button>
                  </div>

                  <div className="border border-border/60 p-4 rounded-[4px] flex flex-col justify-between space-y-3 bg-card">
                    <div>
                      <h5 className="font-semibold text-xs text-foreground">Import applications from CSV</h5>
                      <p className="text-[11px] text-muted-foreground mt-1">Batch import applications from a spreadsheet file. Format columns: Company, Title, Status, Salary, Date.</p>
                    </div>
                    <div className="relative">
                      <input
                        type="file"
                        accept=".csv"
                        onChange={handleImportCSV}
                        disabled={importing}
                        className="absolute inset-0 opacity-0 cursor-pointer"
                      />
                      <button
                        type="button"
                        disabled={importing}
                        className="w-full bg-muted border border-border hover:bg-muted/80 text-foreground text-xs font-semibold py-2 rounded-[4px] transition-colors flex items-center justify-center gap-1.5"
                      >
                        {importing ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Upload className="w-3.5 h-3.5" />}
                        Import CSV spreadsheet
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* DANGER ZONE SECTION */}
          {activeTab === 'danger' && (
            <div className="space-y-6">
              <div className="pb-3 border-b border-border/20">
                <h3 className="text-sm font-semibold text-red-500">Danger zone</h3>
                <p className="text-xs text-muted-foreground mt-0.5 font-sans">High-risk actions that permanently alter or clear your workspace database.</p>
              </div>

              <div className="space-y-4 font-sans text-xs">
                {/* 1. Purge Applications */}
                <div className="flex items-center justify-between p-4 border border-red-500/20 bg-red-500/[2%] rounded-[4px]">
                  <div className="space-y-0.5">
                    <h5 className="font-semibold text-red-600 dark:text-red-400">Purge job applications</h5>
                    <p className="text-[11px] text-muted-foreground">Deletes all applications in your funnel. Resume files remain untouched.</p>
                  </div>
                  <button
                    onClick={purgeApplications}
                    disabled={processingDanger}
                    className="bg-red-600 hover:bg-red-700 text-white font-semibold py-1.5 px-3 rounded-[4px] transition-colors whitespace-nowrap shrink-0"
                  >
                    Delete all applications
                  </button>
                </div>

                {/* 2. Purge Outreach */}
                <div className="flex items-center justify-between p-4 border border-red-500/20 bg-red-500/[2%] rounded-[4px]">
                  <div className="space-y-0.5">
                    <h5 className="font-semibold text-red-600 dark:text-red-400">Purge recruiter outreach logs</h5>
                    <p className="text-[11px] text-muted-foreground">Deletes all CRM outreach records and message histories permanently.</p>
                  </div>
                  <button
                    onClick={purgeOutreach}
                    disabled={processingDanger}
                    className="bg-red-600 hover:bg-red-700 text-white font-semibold py-1.5 px-3 rounded-[4px] transition-colors whitespace-nowrap shrink-0"
                  >
                    Delete outreach history
                  </button>
                </div>

                {/* 3. Reset local targets */}
                <div className="flex items-center justify-between p-4 border border-red-500/20 bg-red-500/[2%] rounded-[4px]">
                  <div className="space-y-0.5">
                    <h5 className="font-semibold text-red-600 dark:text-red-400">Reset local workspace targets</h5>
                    <p className="text-[11px] text-muted-foreground">Clears weekly target targets, focus texts, and custom daily checklist items.</p>
                  </div>
                  <button
                    onClick={resetLocalAnalytics}
                    disabled={processingDanger}
                    className="bg-red-600 hover:bg-red-700 text-white font-semibold py-1.5 px-3 rounded-[4px] transition-colors whitespace-nowrap shrink-0"
                  >
                    Reset workspace defaults
                  </button>
                </div>

                {/* 4. Delete Account */}
                <div className="flex items-center justify-between p-4 border border-red-500/20 bg-red-500/[2%] rounded-[4px]">
                  <div className="space-y-0.5">
                    <h5 className="font-semibold text-red-600 dark:text-red-400">Permanently delete account</h5>
                    <p className="text-[11px] text-muted-foreground">Purges all details, logins, files, applications, and settings completely from the server.</p>
                  </div>
                  <button
                    onClick={handleDeleteAccount}
                    disabled={deleteAccountMutation.isPending || processingDanger}
                    className="bg-red-600 hover:bg-red-700 text-white font-semibold py-1.5 px-3 rounded-[4px] transition-colors whitespace-nowrap shrink-0 animate-pulse"
                  >
                    Delete account
                  </button>
                </div>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
};
