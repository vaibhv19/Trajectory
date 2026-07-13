import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../services/api';
import { useAuthStore } from '../store/authStore';
import type { User } from '../types';
import { 
  User as UserIcon,
  Lock,
  Settings,
  Database,
  Unlink,
  Download,
  Upload,
  Trash2,
  Loader2,
  CheckCircle,
  AlertTriangle
} from 'lucide-react';

export const SettingsPage: React.FC = () => {
  const queryClient = useQueryClient();
  const logout = useAuthStore((state) => state.logout);
  const token = useAuthStore((state) => state.token);

  // States
  const [activeTab, setActiveTab] = useState<'profile' | 'security' | 'toggles' | 'data'>('profile');
  const [fullName, setFullName] = useState('');
  const [avatarUrl, setAvatarUrl] = useState('');
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  // Toggles
  const [ghostThreshold, setGhostThreshold] = useState(30);
  const [autoArchive, setAutoArchive] = useState(false);
  const [browserAlerts, setBrowserAlerts] = useState(true);
  const [emailAlerts, setEmailAlerts] = useState(true);

  // Form Notifications
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [importing, setImporting] = useState(false);

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
      showSuccess('Profile updated successfully.');
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

  const unlinkMutation = useMutation({
    mutationFn: (provider: string) => api.users.unlinkProvider(provider),
    onSuccess: (updated) => {
      queryClient.setQueryData(['user-settings-profile'], updated);
      showSuccess(`Successfully unlinked social provider connection.`);
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

  // Export Logic
  const handleExport = async () => {
    try {
      const data = await api.users.exportData();
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `trajectory_workspace_backup_${new Date().toISOString().slice(0,10)}.json`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      showSuccess('Workspace backup JSON exported successfully.');
    } catch (err: any) {
      showTransientError('Failed to export data: ' + err.message);
    }
  };

  // Import Logic
  const handleImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    const file = e.target.files[0];
    const reader = new FileReader();
    reader.onload = async (evt) => {
      if (!evt.target || typeof evt.target.result !== 'string') return;
      try {
        setImporting(true);
        const importPayload = JSON.parse(evt.target.result);
        await api.users.importData(importPayload);
        // Invalidate all query caches
        queryClient.invalidateQueries();
        refetch();
        showSuccess('Workspace restored successfully from backup.');
      } catch (err: any) {
        showTransientError('Failed to restore backup: ' + err.message);
      } finally {
        setImporting(false);
      }
    };
    reader.readAsText(file);
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
      <div className="py-20 flex flex-col items-center justify-center text-graphite-500">
        <Loader2 className="w-8 h-8 animate-spin text-teal-600 mb-2" />
        <span className="text-sm font-sans">Loading configurations manager...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Title */}
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-graphite-900 dark:text-paper-50 font-display">
          Account Settings
        </h1>
        <p className="text-sm text-graphite-500 dark:text-graphite-400 font-sans mt-1">
          Manage your personal details, automation thresholds, backup exports, and social credentials.
        </p>
      </div>

      {/* Toast Alert */}
      {successMessage && (
        <div className="bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-100 dark:border-emerald-900/50 p-4 text-emerald-700 dark:text-emerald-400 text-sm font-sans rounded-md flex items-center gap-2">
          <CheckCircle className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
          <span>{successMessage}</span>
        </div>
      )}
      {errorMessage && (
        <div className="bg-red-50 dark:bg-red-950/20 border border-red-100 dark:border-red-900/50 p-4 text-red-700 dark:text-red-400 text-sm font-sans rounded-md flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 text-red-600 dark:text-red-400 shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* Tabs Layout */}
      <div className="flex flex-col md:flex-row gap-6">
        {/* Navigation Sidebar */}
        <div className="w-full md:w-64 space-y-1">
          <button
            onClick={() => setActiveTab('profile')}
            className={`w-full flex items-center gap-3 px-4 py-2.5 text-sm font-medium transition-colors font-sans rounded-md text-left ${activeTab === 'profile' ? 'bg-teal-700 text-white' : 'hover:bg-graphite-100 dark:hover:bg-graphite-800 text-graphite-700 dark:text-graphite-300'}`}
          >
            <UserIcon className="w-4 h-4" />
            Profile Details
          </button>
          <button
            onClick={() => setActiveTab('security')}
            className={`w-full flex items-center gap-3 px-4 py-2.5 text-sm font-medium transition-colors font-sans rounded-md text-left ${activeTab === 'security' ? 'bg-teal-700 text-white' : 'hover:bg-graphite-100 dark:hover:bg-graphite-800 text-graphite-700 dark:text-graphite-300'}`}
          >
            <Lock className="w-4 h-4" />
            Security & Login
          </button>
          <button
            onClick={() => setActiveTab('toggles')}
            className={`w-full flex items-center gap-3 px-4 py-2.5 text-sm font-medium transition-colors font-sans rounded-md text-left ${activeTab === 'toggles' ? 'bg-teal-700 text-white' : 'hover:bg-graphite-100 dark:hover:bg-graphite-800 text-graphite-700 dark:text-graphite-300'}`}
          >
            <Settings className="w-4 h-4" />
            Automation & Alerts
          </button>
          <button
            onClick={() => setActiveTab('data')}
            className={`w-full flex items-center gap-3 px-4 py-2.5 text-sm font-medium transition-colors font-sans rounded-md text-left ${activeTab === 'data' ? 'bg-teal-700 text-white' : 'hover:bg-graphite-100 dark:hover:bg-graphite-800 text-graphite-700 dark:text-graphite-300'}`}
          >
            <Database className="w-4 h-4" />
            Data Control
          </button>
        </div>

        {/* Tab Content Panel */}
        <div className="flex-1 bg-white dark:bg-graphite-900 border border-graphite-200 dark:border-graphite-800 p-6 rounded-md shadow-sm">
          
          {/* Profile details */}
          {activeTab === 'profile' && (
            <form onSubmit={handleProfileSubmit} className="space-y-4">
              <h3 className="text-lg font-semibold text-graphite-900 dark:text-paper-100 font-display border-b border-graphite-100 dark:border-graphite-800 pb-2">
                Identity Profile
              </h3>
              
              <div>
                <label className="block text-xs font-mono uppercase tracking-wider text-graphite-500 mb-1">
                  Email Address
                </label>
                <input
                  type="email"
                  disabled
                  value={userProfile?.email}
                  className="w-full bg-graphite-100 dark:bg-graphite-950 border border-graphite-200 dark:border-graphite-800 text-graphite-500 dark:text-graphite-400 px-3 py-2 text-sm font-mono focus:outline-none rounded-md cursor-not-allowed"
                />
              </div>

              <div>
                <label className="block text-xs font-mono uppercase tracking-wider text-graphite-500 mb-1">
                  Full Display Name
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Jane Doe"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full bg-white dark:bg-graphite-950 border border-graphite-200 dark:border-graphite-800 text-graphite-900 dark:text-paper-100 px-3 py-2 text-sm font-sans focus:outline-none focus:ring-1 focus:ring-teal-500 focus:border-teal-500 rounded-md"
                />
              </div>

              <div>
                <label className="block text-xs font-mono uppercase tracking-wider text-graphite-500 mb-1">
                  Avatar / Profile Pic URL
                </label>
                <input
                  type="text"
                  placeholder="https://example.com/avatar.png"
                  value={avatarUrl}
                  onChange={(e) => setAvatarUrl(e.target.value)}
                  className="w-full bg-white dark:bg-graphite-950 border border-graphite-200 dark:border-graphite-800 text-graphite-900 dark:text-paper-100 px-3 py-2 text-sm font-sans focus:outline-none focus:ring-1 focus:ring-teal-500 focus:border-teal-500 rounded-md"
                />
              </div>

              <div className="pt-2 border-t border-graphite-100 dark:border-graphite-800 flex justify-end">
                <button
                  type="submit"
                  disabled={updateProfileMutation.isPending}
                  className="flex items-center gap-1.5 bg-teal-700 hover:bg-teal-800 text-white px-4 py-2 text-sm font-medium transition-colors border border-teal-800 rounded-md font-sans"
                >
                  {updateProfileMutation.isPending ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    'Save Profile'
                  )}
                </button>
              </div>
            </form>
          )}

          {/* Security & OAuth */}
          {activeTab === 'security' && (
            <div className="space-y-6">
              {/* Local Password Form */}
              <form onSubmit={handlePasswordSubmit} className="space-y-4">
                <h3 className="text-lg font-semibold text-graphite-900 dark:text-paper-100 font-display border-b border-graphite-100 dark:border-graphite-800 pb-2">
                  Change Password
                </h3>
                
                <div>
                  <label className="block text-xs font-mono uppercase tracking-wider text-graphite-500 mb-1">
                    Current Password
                  </label>
                  <input
                    type="password"
                    required
                    placeholder="Enter current password"
                    value={oldPassword}
                    onChange={(e) => setOldPassword(e.target.value)}
                    className="w-full bg-white dark:bg-graphite-950 border border-graphite-200 dark:border-graphite-800 text-graphite-900 dark:text-paper-100 px-3 py-2 text-sm font-sans focus:outline-none focus:ring-1 focus:ring-teal-500 focus:border-teal-500 rounded-md"
                  />
                </div>

                <div>
                  <label className="block text-xs font-mono uppercase tracking-wider text-graphite-500 mb-1">
                    New Password
                  </label>
                  <input
                    type="password"
                    required
                    placeholder="Enter new password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="w-full bg-white dark:bg-graphite-950 border border-graphite-200 dark:border-graphite-800 text-graphite-900 dark:text-paper-100 px-3 py-2 text-sm font-sans focus:outline-none focus:ring-1 focus:ring-teal-500 focus:border-teal-500 rounded-md"
                  />
                </div>

                <div>
                  <label className="block text-xs font-mono uppercase tracking-wider text-graphite-500 mb-1">
                    Confirm New Password
                  </label>
                  <input
                    type="password"
                    required
                    placeholder="Re-enter new password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full bg-white dark:bg-graphite-950 border border-graphite-200 dark:border-graphite-800 text-graphite-900 dark:text-paper-100 px-3 py-2 text-sm font-sans focus:outline-none focus:ring-1 focus:ring-teal-500 focus:border-teal-500 rounded-md"
                  />
                </div>

                <div className="pt-2 border-t border-graphite-100 dark:border-graphite-800 flex justify-end">
                  <button
                    type="submit"
                    disabled={changePasswordMutation.isPending}
                    className="flex items-center gap-1.5 bg-teal-700 hover:bg-teal-800 text-white px-4 py-2 text-sm font-medium transition-colors border border-teal-800 rounded-md font-sans"
                  >
                    {changePasswordMutation.isPending ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Updating...
                      </>
                    ) : (
                      'Update Password'
                    )}
                  </button>
                </div>
              </form>

              {/* Linked Accounts */}
              <div className="space-y-4 pt-4 border-t border-graphite-100 dark:border-graphite-800">
                <h3 className="text-base font-semibold text-graphite-800 dark:text-paper-100 font-display">
                  Linked Identity Providers
                </h3>
                <p className="text-xs text-graphite-500 dark:text-graphite-400 font-sans">
                  Current authentication system link: <strong className="font-mono text-teal-700 dark:text-teal-400">{userProfile?.authProvider}</strong>
                </p>

                <div className="flex gap-4">
                  {userProfile?.authProvider !== 'LOCAL' ? (
                    <button
                      onClick={() => unlinkMutation.mutate(userProfile?.authProvider.toLowerCase() || '')}
                      disabled={unlinkMutation.isPending}
                      className="flex items-center gap-2 border border-red-200 hover:border-red-300 dark:border-red-900 bg-red-50/50 dark:bg-red-950/20 text-red-700 dark:text-red-400 px-4 py-2 text-xs font-semibold rounded-md transition-colors"
                    >
                      <Unlink className="w-4 h-4" />
                      Unlink {userProfile?.authProvider} Connection
                    </button>
                  ) : (
                    <span className="text-xs text-graphite-400 font-sans italic">
                      No external OAuth social profiles currently linked to this email user.
                    </span>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Automation & Alerts */}
          {activeTab === 'toggles' && (
            <form onSubmit={handleSettingsSubmit} className="space-y-6">
              <h3 className="text-lg font-semibold text-graphite-900 dark:text-paper-100 font-display border-b border-graphite-100 dark:border-graphite-800 pb-2">
                Inactivity & Alerts Parameters
              </h3>

              {/* Slider for Ghost threshold */}
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <label className="text-xs font-mono uppercase tracking-wider text-graphite-500">
                    Ghost Detection Threshold
                  </label>
                  <span className="text-xs font-mono font-semibold bg-graphite-100 dark:bg-graphite-800 text-teal-700 dark:text-teal-400 px-2 py-0.5 rounded-md">
                    {ghostThreshold} Days
                  </span>
                </div>
                <input
                  type="range"
                  min="7"
                  max="90"
                  value={ghostThreshold}
                  onChange={(e) => setGhostThreshold(Number(e.target.value))}
                  className="w-full accent-teal-700 h-1.5 bg-graphite-200 dark:bg-graphite-800 rounded-lg appearance-none cursor-pointer"
                />
                <p className="text-[10px] text-graphite-400 font-sans">
                  Applications will automatically transition to "GHOSTED" if they are in Applied/OA/Interview state with no updates for this number of days.
                </p>
              </div>

              {/* Toggle for Auto-Archive */}
              <div className="flex items-start justify-between border-t border-graphite-100 dark:border-graphite-800 pt-4">
                <div className="space-y-0.5 pr-4">
                  <label className="text-sm font-semibold text-graphite-800 dark:text-paper-100 font-sans block">
                    Auto-Archive Rejections & Ghosts
                  </label>
                  <span className="text-xs text-graphite-400 font-sans block">
                    When enabled, transitioning any application status to Rejected or Ghosted automatically marks it archived.
                  </span>
                </div>
                <input
                  type="checkbox"
                  checked={autoArchive}
                  onChange={(e) => setAutoArchive(e.target.checked)}
                  className="w-4 h-4 accent-teal-700 cursor-pointer border border-graphite-300 dark:border-graphite-700 rounded focus:ring-0"
                />
              </div>

              {/* Toggle for Browser Push Alerts */}
              <div className="flex items-start justify-between border-t border-graphite-100 dark:border-graphite-800 pt-4">
                <div className="space-y-0.5 pr-4">
                  <label className="text-sm font-semibold text-graphite-800 dark:text-paper-100 font-sans block">
                    Enable Internal & Browser Notifications
                  </label>
                  <span className="text-xs text-graphite-400 font-sans block">
                    Receive morning alerts and follow-up nudge reminders inside the dashboard header bell.
                  </span>
                </div>
                <input
                  type="checkbox"
                  checked={browserAlerts}
                  onChange={(e) => setBrowserAlerts(e.target.checked)}
                  className="w-4 h-4 accent-teal-700 cursor-pointer border border-graphite-300 dark:border-graphite-700 rounded focus:ring-0"
                />
              </div>

              {/* Toggle for Email Alerts */}
              <div className="flex items-start justify-between border-t border-graphite-100 dark:border-graphite-800 pt-4">
                <div className="space-y-0.5 pr-4">
                  <label className="text-sm font-semibold text-graphite-800 dark:text-paper-100 font-sans block">
                    Enable Email Reminders
                  </label>
                  <span className="text-xs text-graphite-400 font-sans block">
                    Send critical daily digest notifications to your registered email address.
                  </span>
                </div>
                <input
                  type="checkbox"
                  checked={emailAlerts}
                  onChange={(e) => setEmailAlerts(e.target.checked)}
                  className="w-4 h-4 accent-teal-700 cursor-pointer border border-graphite-300 dark:border-graphite-700 rounded focus:ring-0"
                />
              </div>

              <div className="pt-2 border-t border-graphite-100 dark:border-graphite-800 flex justify-end">
                <button
                  type="submit"
                  disabled={updateSettingsMutation.isPending}
                  className="flex items-center gap-1.5 bg-teal-700 hover:bg-teal-800 text-white px-4 py-2 text-sm font-medium transition-colors border border-teal-800 rounded-md font-sans"
                >
                  {updateSettingsMutation.isPending ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    'Save Settings'
                  )}
                </button>
              </div>
            </form>
          )}

          {/* Data Portability */}
          {activeTab === 'data' && (
            <div className="space-y-6">
              <h3 className="text-lg font-semibold text-graphite-900 dark:text-paper-100 font-display border-b border-graphite-100 dark:border-graphite-800 pb-2">
                Workspace Backups & Portability
              </h3>

              {/* Import/Export buttons */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="border border-graphite-250 dark:border-graphite-800 p-4 rounded-md flex flex-col justify-between">
                  <div>
                    <h4 className="font-semibold text-sm text-graphite-900 dark:text-paper-100 font-sans flex items-center gap-2">
                      <Download className="w-4 h-4 text-teal-600" />
                      Export Career Workspace
                    </h4>
                    <p className="text-xs text-graphite-400 font-sans mt-1">
                      Download all of your career profiles, applications, outreach conversations, resume histories, and uploaded PDF guides in a single JSON backup.
                    </p>
                  </div>
                  <button
                    onClick={handleExport}
                    className="w-full mt-4 bg-teal-700 hover:bg-teal-800 text-white text-xs font-semibold py-2 px-3 border border-teal-800 rounded-md transition-colors"
                  >
                    Export JSON Workspace
                  </button>
                </div>

                <div className="border border-graphite-250 dark:border-graphite-800 p-4 rounded-md flex flex-col justify-between">
                  <div>
                    <h4 className="font-semibold text-sm text-graphite-900 dark:text-paper-100 font-sans flex items-center gap-2">
                      <Upload className="w-4 h-4 text-teal-600" />
                      Import Workspace Backup
                    </h4>
                    <p className="text-xs text-graphite-400 font-sans mt-1">
                      Upload a previously exported Trajectory JSON file to restore your entire database. <span className="font-semibold text-red-500">Warning: this will overwrite your current active records!</span>
                    </p>
                  </div>
                  <div className="mt-4 relative">
                    <input
                      type="file"
                      accept=".json"
                      onChange={handleImport}
                      disabled={importing}
                      className="absolute inset-0 opacity-0 cursor-pointer"
                    />
                    <button
                      type="button"
                      disabled={importing}
                      className="w-full bg-graphite-100 dark:bg-graphite-800 hover:bg-graphite-200 dark:hover:bg-graphite-700 text-graphite-800 dark:text-graphite-200 text-xs font-semibold py-2 px-3 border border-graphite-300 dark:border-graphite-700 rounded-md transition-colors flex items-center justify-center gap-1.5"
                    >
                      {importing ? (
                        <>
                          <Loader2 className="w-3.5 h-3.5 animate-spin" />
                          Restoring...
                        </>
                      ) : (
                        'Upload JSON Backup'
                      )}
                    </button>
                  </div>
                </div>
              </div>

              {/* Danger Zone */}
              <div className="border border-red-200 dark:border-red-900/50 bg-red-50/20 dark:bg-red-950/10 p-5 rounded-md space-y-3">
                <h4 className="font-semibold text-sm text-red-700 dark:text-red-400 font-display flex items-center gap-2">
                  <Trash2 className="w-4.5 h-4.5" />
                  Danger Zone
                </h4>
                <p className="text-xs text-graphite-600 dark:text-graphite-400 font-sans">
                  Deleting your account permanently erases your identity, settings, applications matrix, CRM outreaches, resume files, and attachments from the system. This action cannot be undone.
                </p>
                <div className="pt-2">
                  <button
                    onClick={handleDeleteAccount}
                    disabled={deleteAccountMutation.isPending}
                    className="bg-red-650 hover:bg-red-700 text-white text-xs font-semibold py-2.5 px-4 rounded-md transition-colors shadow-sm"
                  >
                    Delete Account and Purge Workspace
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
