import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Scale, ArrowLeft, BookOpen, AlertTriangle, Copyright } from 'lucide-react';

export const TermsPage: React.FC = () => {
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
          <Scale className="h-8 w-8 text-primary" />
          Terms of Service
        </h1>
        <p className="text-sm text-muted-foreground mt-2 font-sans">
          Last updated: July 2026. Standard usage agreements for the Trajectory career environment.
        </p>
      </div>

      {/* Grid of Sections */}
      <div className="space-y-8 border-t border-border/30 pt-8 font-sans">
        
        {/* Acceptable Use */}
        <div className="space-y-3">
          <h3 className="text-sm font-mono font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
            <BookOpen className="h-4 w-4 text-primary" />
            1. Scope of Use & Placement Prep
          </h3>
          <p className="text-sm text-foreground/80 leading-relaxed">
            Trajectory is designed for student placement preparation, individual job seekers, and recruiters coordinating hiring processes. Any automated scrapers, denial-of-service attempts, or heavy bot traffic that degrades workspace connectivity is strictly prohibited.
          </p>
        </div>

        {/* Ownership */}
        <div className="space-y-3">
          <h3 className="text-sm font-mono font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
            <Copyright className="h-4 w-4 text-primary" />
            2. Ownership & Open Source Licensing
          </h3>
          <p className="text-sm text-foreground/80 leading-relaxed">
            The software design, UI components, and API routing schemas are published under open-source licenses as documented in the public GitHub repository. User data uploaded (resumes, application metrics) remain the exclusive property of the individual user.
          </p>
        </div>

        {/* Limitation of Liability */}
        <div className="space-y-3">
          <h3 className="text-sm font-mono font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
            <AlertTriangle className="h-4 w-4 text-primary" />
            3. Disclaimer & Limitation of Liability
          </h3>
          <p className="text-sm text-foreground/80 leading-relaxed">
            Trajectory is provided "as is" without warranty of any kind. We do not guarantee interview callback ratios, job offer conversions, or zero-latency storage backends. We are not liable for accidental data loss arising from local storage clearing, local server compilation errors, or misconfigured MinIO credentials.
          </p>
        </div>

      </div>
    </div>
  );
};
