import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Shield, ArrowLeft, ArrowRight, UserCheck, HardDrive, Key } from 'lucide-react';

export const PrivacyPage: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="max-w-3xl mx-auto space-y-8 animate-in fade-in duration-300">
      {/* Back button */}
      <div>
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-sm font-semibold text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Go Back
        </button>
      </div>

      {/* Header */}
      <div>
        <h1 className="text-3xl font-display font-extrabold tracking-tight uppercase text-foreground flex items-center gap-3">
          <Shield className="h-8 w-8 text-primary" />
          Privacy Policy
        </h1>
        <p className="text-sm text-muted-foreground mt-2 font-sans">
          Last updated: July 2026. Self-serve transparency details on local data persistence and security.
        </p>
      </div>

      {/* Grid of Sections */}
      <div className="space-y-8 border-t border-border/30 pt-8 font-sans">
        
        {/* Data we collect */}
        <div className="space-y-3">
          <h3 className="text-sm font-mono font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
            <HardDrive className="h-4 w-4 text-primary" />
            1. Workspace Data & Storage
          </h3>
          <p className="text-sm text-foreground/80 leading-relaxed">
            Trajectory stores records associated with your active placement preparation and job search pipeline. This includes job application details, resume document binaries, career profile tags, and recruiter outreach communications. Resumes are stored on secure local workspace paths or MinIO buckets as configured.
          </p>
        </div>

        {/* Authentication */}
        <div className="space-y-3">
          <h3 className="text-sm font-mono font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
            <Key className="h-4 w-4 text-primary" />
            2. Authentication & Local Storage Tokens
          </h3>
          <p className="text-sm text-foreground/80 leading-relaxed">
            We use encrypted JSON Web Tokens (JWT) to authorize server transactions. These authorization tokens are cached locally in your browser's persistent memory. No tracking scripts, marketing trackers, or telemetry tools are installed on this client workspace.
          </p>
        </div>

        {/* Self-serve rights */}
        <div className="space-y-3">
          <h3 className="text-sm font-mono font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
            <UserCheck className="h-4 w-4 text-primary" />
            3. Self-Serve Control & Data Portability
          </h3>
          <p className="text-sm text-foreground/80 leading-relaxed">
            Trajectory supports full data portability. You can export your entire career profile records, timelines, and contact listings as a standard backup JSON file at any time. Permanent user account deletion can also be instantly self-triggered inside settings, which cleanses all associated records and files from the active database.
          </p>
          <div className="pt-2">
            <button
              onClick={() => navigate('/settings')}
              className="flex items-center gap-1.5 px-3 py-1.5 border border-border hover:bg-muted text-xs font-semibold rounded-[4px] transition-colors"
            >
              Access Data Control in Settings
              <ArrowRight className="h-3 w-3" />
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
