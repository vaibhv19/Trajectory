import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Terminal, ArrowLeft, CheckCircle2 } from 'lucide-react';

export const ChangelogPage: React.FC = () => {
  const navigate = useNavigate();

  const logs = [
    {
      version: 'v1.0.0',
      date: 'July 18, 2026',
      title: 'Phase 2.1 — Product Completion & Refined Architecture',
      description: 'Establishes full application layout, document routing, and local workspace safety fallbacks.',
      changes: [
        'Added global minimalist footer with complete Privacy, Terms, and GitHub mappings.',
        'Implemented public avatar profile pictures and Spring Boot controller fallbacks.',
        'Separated dashboard analytics charts from Today’s Agenda focus views into HomePage and AnalyticsPage.',
        'Refactored login screens and details panels to flat borderless layout interfaces.',
        'Standardized button and input corner radii to exactly 4px for premium design aesthetics.',
      ]
    },
    {
      version: 'v0.9.0',
      date: 'July 17, 2026',
      title: 'Phase 1.0 — Keyboard Command Navigation & Sub-Tabs Redesign',
      description: 'Enhanced command structures, removed vertical admin sidebars, and consolidated resumes.',
      changes: [
        'Introduced global Command Palette navigation triggered via Ctrl + K with keyboard selectors.',
        'Replaced left sidebar navigation with a responsive top header menu.',
        'Created inline horizontal sub-tabs for tracking job application stages.',
        'Reorganized Career Personas and Resume versions into a unified full-width page.',
      ]
    }
  ];

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
          <Terminal className="h-8 w-8 text-primary" />
          Changelog & Releases
        </h1>
        <p className="text-sm text-muted-foreground mt-2 font-sans">
          Track updates, feature deployments, and architectural iterations in Trajectory.
        </p>
      </div>

      {/* Changelog Feed */}
      <div className="space-y-12 border-t border-border/30 pt-8">
        {logs.map((log, index) => (
          <div key={log.version} className="relative pl-8 border-l border-border/30">
            {/* Visual marker */}
            <span className={`absolute left-[-5.5px] top-1.5 h-2.5 w-2.5 rounded-full border border-background ${
              index === 0 ? 'bg-primary ring-4 ring-primary/10' : 'bg-muted-foreground/30'
            }`} />

            <div className="space-y-4">
              <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
                <span className="text-lg font-mono font-bold text-foreground">{log.version}</span>
                <span className="text-xs text-muted-foreground">{log.date}</span>
                <span className="text-xs font-mono font-semibold px-2 py-0.5 rounded-[4px] border border-primary/20 bg-primary/5 text-primary">
                  {index === 0 ? 'CURRENT RELEASE' : 'PREVIOUS'}
                </span>
              </div>

              <div>
                <h3 className="text-sm font-bold text-foreground font-display">{log.title}</h3>
                <p className="text-xs text-muted-foreground font-sans mt-0.5">{log.description}</p>
              </div>

              <ul className="space-y-2 font-sans text-xs text-foreground/80">
                {log.changes.map((change, cIdx) => (
                  <li key={cIdx} className="flex items-start gap-2.5 leading-relaxed">
                    <CheckCircle2 className="h-3.5 w-3.5 text-primary shrink-0 mt-0.5" />
                    <span>{change}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
