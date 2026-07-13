export interface User {
  id: string;
  email: string;
  fullName: string;
  avatarUrl: string | null;
  authProvider: 'LOCAL' | 'GOOGLE' | 'GITHUB';
  ghostThresholdDays: number;
  autoArchiveEnabled: boolean;
  browserNotificationsEnabled?: boolean;
  emailNotificationsEnabled?: boolean;
  createdAt: string;
  updatedAt: string;
}

export type ApplicationStatus = 'APPLIED' | 'OA' | 'INTERVIEW' | 'OFFER' | 'REJECTED' | 'GHOSTED' | 'WITHDRAWN';

export type OutreachStatus = 'PENDING' | 'CONTACTED' | 'REPLIED' | 'INTERVIEW_SECURED' | 'NO_RESPONSE';

export interface CareerProfile {
  id: string;
  title: string;
  colorCode: string;
  iconIdentifier: string;
  isDefault: boolean;
}

export interface Resume {
  id: string;
  profileId: string;
  versionNumber: number;
  fileName: string;
  changelog: string | null;
  createdAt: string;
}

export interface Application {
  id: string;
  companyName: string;
  roleTitle: string;
  profile: CareerProfile;
  resumeId: string | null;
  resumeVersion: number | null;
  resumeFileName: string | null;
  location: string | null;
  jobDescriptionUrl: string | null;
  jobDescriptionRaw: string | null;
  status: ApplicationStatus;
  source: string | null;
  salaryRange: string | null;
  dateApplied: string;
  followUpDate: string | null;
  responseDate: string | null;
  lastActivityAt: string;
  isArchived: boolean;
}

export interface ApplicationStatusHistory {
  id: string;
  applicationId: string;
  status: ApplicationStatus;
  notes: string | null;
  changedAt: string;
}

export interface Outreach {
  id: string;
  contactName: string;
  companyName: string;
  positionDiscussed: string;
  email: string | null;
  linkedinUrl: string | null;
  status: OutreachStatus;
  dateSent: string;
  followUpDate: string | null;
  notes: string | null;
}

export interface CompanyDocument {
  id: string;
  companyName: string;
  documentName: string;
  documentType: string | null;
  fileName: string;
  createdAt: string;
}

export interface ResumePerfMetric {
  label: string;
  responseRate: number;
  count: number;
}

export interface ProfileMetric {
  title: string;
  colorCode: string;
  count: number;
}

export interface SourceMetric {
  source: string;
  count: number;
}

export interface AgendaItem {
  id: string;
  type: 'OA' | 'INTERVIEW' | 'FOLLOW_UP';
  companyName: string;
  roleTitle: string;
  date: string;
  time: string;
  link: string | null;
}

export interface DashboardMetrics {
  totalApplications: number;
  activeApplications: number;
  rejectedApplications: number;
  ghostedApplications: number;
  responseRate: number;
  interviewConversion: number;
  offerConversion: number;
  applicationsThisWeek: number;
  applicationsThisMonth: number;
  resumePerformance: ResumePerfMetric[];
  profileDistribution: ProfileMetric[];
  sourceDistribution: SourceMetric[];
  agenda: AgendaItem[];
}

export interface AuthResponse {
  token: string;
  email: string;
  fullName: string;
  userId: string;
}

export interface LoginRequest {
  email: string;
  password?: string;
}

export interface RegisterRequest {
  email: string;
  password?: string;
  fullName: string;
}

export interface JobExtraction {
  company_name: string;
  role_title: string;
  location: string;
  skills: string[];
  salary_range: string;
  suggested_profile_title: string;
}

export interface OutreachAnalysis {
  suggested_status: OutreachStatus;
  suggested_action: string;
  key_points: string[];
}

export interface EventExtraction {
  event_type: string;
  event_date: string;
  event_time: string;
  meeting_link: string | null;
  interviewer_names: string[];
  duration_minutes: number;
}

export interface AppNotification {
  id: string;
  title: string;
  message: string;
  type: 'INFO' | 'AGENDA' | 'REMINDER';
  isRead: boolean;
  createdAt: string;
}
