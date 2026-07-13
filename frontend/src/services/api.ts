import { useAuthStore } from '../store/authStore';
import type { 
  AuthResponse, LoginRequest, RegisterRequest, User,
  CareerProfile, Application, ApplicationStatusHistory,
  Outreach, CompanyDocument, DashboardMetrics, JobExtraction,
  OutreachAnalysis, EventExtraction, Resume, AppNotification
} from '../types';

const BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api';

async function apiCall(endpoint: string, options: RequestInit = {}) {
  const token = useAuthStore.getState().token;
  const headers = new Headers(options.headers || {});

  if (token) {
    headers.set('Authorization', `Bearer ${token}`);
  }

  if (options.body && !(options.body instanceof FormData) && !headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json');
  }

  const response = await fetch(`${BASE_URL}${endpoint}`, {
    ...options,
    headers,
  });

  if (response.status === 401) {
    useAuthStore.getState().logout();
    throw new Error('Unauthorized');
  }

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || 'API request failed');
  }

  if (endpoint.endsWith('/download')) {
    return response.blob();
  }

  if (response.status === 204) {
    return null;
  }

  return response.json();
}

export const api = {
  // Auth API
  auth: {
    login: (data: LoginRequest): Promise<AuthResponse> => 
      apiCall('/auth/login', { method: 'POST', body: JSON.stringify(data) }),
    
    register: (data: RegisterRequest): Promise<AuthResponse> => 
      apiCall('/auth/register', { method: 'POST', body: JSON.stringify(data) }),
    
    getProfile: (): Promise<User> => 
      apiCall('/auth/profile'),
    
    updateProfile: (fullName: string, avatarUrl?: string): Promise<User> => 
      apiCall('/auth/profile', { method: 'PUT', body: JSON.stringify({ fullName, avatarUrl }) }),
    
    updateSettings: (ghostThresholdDays: number, autoArchiveEnabled: boolean): Promise<User> => 
      apiCall('/auth/settings', { method: 'PUT', body: JSON.stringify({ ghostThresholdDays, autoArchiveEnabled }) }),
    
    changePassword: (oldPassword: string, newPassword: string): Promise<{ message: string }> => 
      apiCall('/auth/change-password', { method: 'PUT', body: JSON.stringify({ oldPassword, newPassword }) }),
  },

  // Dashboard API
  dashboard: {
    getMetrics: (): Promise<DashboardMetrics> => 
      apiCall('/dashboard/metrics'),
  },

  // Career Profiles API
  profiles: {
    list: (): Promise<CareerProfile[]> => 
      apiCall('/profiles'),
    
    create: (data: Omit<CareerProfile, 'id'>): Promise<CareerProfile> => 
      apiCall('/profiles', { method: 'POST', body: JSON.stringify(data) }),
    
    update: (id: string, data: Omit<CareerProfile, 'id'>): Promise<CareerProfile> => 
      apiCall(`/profiles/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
    
    delete: (id: string): Promise<void> => 
      apiCall(`/profiles/${id}`, { method: 'DELETE' }),
  },

  // Resumes API
  resumes: {
    listForProfile: (profileId: string): Promise<Resume[]> => 
      apiCall(`/resumes/profile/${profileId}`),
    
    upload: (profileId: string, file: File, changelog?: string): Promise<Resume> => {
      const formData = new FormData();
      formData.append('file', file);
      if (changelog) formData.append('changelog', changelog);
      return apiCall(`/resumes/profile/${profileId}`, { method: 'POST', body: formData });
    },
    
    download: (id: string): Promise<Blob> => 
      apiCall(`/resumes/${id}/download`),
    
    delete: (id: string): Promise<void> => 
      apiCall(`/resumes/${id}`, { method: 'DELETE' }),
  },

  // Applications API
  applications: {
    list: (params: { 
      search?: string; 
      status?: string[]; 
      profileId?: string; 
      isArchived?: boolean;
      page?: number; 
      size?: number; 
      sort?: string; 
    }): Promise<{ content: Application[]; totalPages: number; totalElements: number }> => {
      const query = new URLSearchParams();
      if (params.search) query.append('search', params.search);
      if (params.status) params.status.forEach(s => query.append('status', s));
      if (params.profileId) query.append('profileId', params.profileId);
      if (params.isArchived !== undefined) query.append('isArchived', String(params.isArchived));
      if (params.page !== undefined) query.append('page', String(params.page));
      if (params.size !== undefined) query.append('size', String(params.size));
      if (params.sort) query.append('sort', params.sort);

      return apiCall(`/applications?${query.toString()}`);
    },

    get: (id: string): Promise<Application> => 
      apiCall(`/applications/${id}`),
    
    create: (data: any): Promise<Application> => 
      apiCall('/applications', { method: 'POST', body: JSON.stringify(data) }),
    
    update: (id: string, data: any): Promise<Application> => 
      apiCall(`/applications/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
    
    delete: (id: string): Promise<void> => 
      apiCall(`/applications/${id}`, { method: 'DELETE' }),
    
    getHistory: (id: string): Promise<ApplicationStatusHistory[]> => 
      apiCall(`/applications/${id}/history`),
  },

  // Outreach API
  outreach: {
    list: (search?: string, status?: string): Promise<Outreach[]> => {
      const query = new URLSearchParams();
      if (search) query.append('search', search);
      if (status) query.append('status', status);
      return apiCall(`/outreach?${query.toString()}`);
    },
    
    get: (id: string): Promise<Outreach> => 
      apiCall(`/outreach/${id}`),
    
    create: (data: any): Promise<Outreach> => 
      apiCall('/outreach', { method: 'POST', body: JSON.stringify(data) }),
    
    update: (id: string, data: any): Promise<Outreach> => 
      apiCall(`/outreach/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
    
    delete: (id: string): Promise<void> => 
      apiCall(`/outreach/${id}`, { method: 'DELETE' }),
    
    convert: (id: string, profileId: string): Promise<Application> => 
      apiCall(`/outreach/${id}/convert`, { method: 'POST', body: JSON.stringify({ profileId }) }),
  },

  // Documents API
  documents: {
    list: (): Promise<CompanyDocument[]> => 
      apiCall('/documents'),
    
    upload: (file: File, companyName: string, documentName: string, documentType?: string): Promise<CompanyDocument> => {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('companyName', companyName);
      formData.append('documentName', documentName);
      if (documentType) formData.append('documentType', documentType);
      return apiCall('/documents', { method: 'POST', body: formData });
    },
    
    download: (id: string): Promise<Blob> => 
      apiCall(`/documents/${id}/download`),
    
    delete: (id: string): Promise<void> => 
      apiCall(`/documents/${id}`, { method: 'DELETE' }),
  },

  // Users API
  users: {
    getProfile: (): Promise<User> => 
      apiCall('/users/profile'),
    
    updateProfile: (fullName: string, avatarUrl?: string): Promise<User> => 
      apiCall('/users/profile', { method: 'PUT', body: JSON.stringify({ fullName, avatarUrl }) }),
    
    updateSettings: (data: { ghostThresholdDays: number; autoArchiveEnabled: boolean; browserNotificationsEnabled: boolean; emailNotificationsEnabled: boolean }): Promise<User> => 
      apiCall('/users/settings', { method: 'PUT', body: JSON.stringify(data) }),
    
    changePassword: (oldPassword: string, newPassword: string): Promise<void> => 
      apiCall('/users/password', { method: 'PUT', body: JSON.stringify({ oldPassword, newPassword }) }),

    unlinkProvider: (provider: string): Promise<User> =>
      apiCall(`/users/unlink/${provider}`, { method: 'POST' }),

    exportData: (): Promise<any> =>
      apiCall('/users/export'),

    importData: (importPayload: any): Promise<void> =>
      apiCall('/users/import', { method: 'POST', body: JSON.stringify(importPayload) }),

    deleteAccount: (): Promise<void> =>
      apiCall('/users', { method: 'DELETE' }),
  },

  // Notifications API
  notifications: {
    list: (): Promise<AppNotification[]> => 
      apiCall('/notifications'),
    
    unreadCount: (): Promise<number> => 
      apiCall('/notifications/unread-count'),
    
    read: (id: string): Promise<void> => 
      apiCall(`/notifications/${id}/read`, { method: 'PUT' }),
    
    readAll: (): Promise<void> => 
      apiCall('/notifications/read-all', { method: 'PUT' }),

    triggerDaily: (): Promise<void> => 
      apiCall('/notifications/trigger-daily', { method: 'POST' }),
  },

  // AI API
  ai: {
    parseJd: (text: string): Promise<JobExtraction> => 
      apiCall('/ai/parse-jd', { method: 'POST', body: JSON.stringify({ text }) }),
    
    analyzeOutreach: (text: string): Promise<OutreachAnalysis> => 
      apiCall('/ai/analyze-outreach', { method: 'POST', body: JSON.stringify({ text }) }),
    
    parseSchedule: (text: string): Promise<EventExtraction> => 
      apiCall('/ai/parse-schedule', { method: 'POST', body: JSON.stringify({ text }) }),
  }
};
