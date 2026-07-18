import React from 'react';

interface SkeletonProps {
  className?: string;
}

export const Skeleton: React.FC<SkeletonProps> = ({ className = '' }) => {
  return (
    <div 
      className={`relative overflow-hidden bg-muted/70 rounded-[4px] before:absolute before:inset-0 before:-translate-x-full before:animate-[shimmer_1.5s_infinite] before:bg-gradient-to-r before:from-transparent before:via-foreground/5 before:to-transparent ${className}`} 
    />
  );
};

export const SkeletonText: React.FC<{ lines?: number; className?: string }> = ({ lines = 3, className = '' }) => {
  return (
    <div className={`space-y-2.5 ${className}`}>
      {Array.from({ length: lines }).map((_, i) => (
        <Skeleton 
          key={i} 
          className={`h-3.5 ${
            i === lines - 1 && lines > 1 ? 'w-2/3' : 'w-full'
          }`} 
        />
      ))}
    </div>
  );
};

export const SkeletonTable: React.FC<{ rows?: number; cols?: number }> = ({ rows = 5, cols = 4 }) => {
  return (
    <div className="space-y-4">
      {/* Header Skeleton row */}
      <div className="flex gap-4 pb-3 border-b border-border/30">
        {Array.from({ length: cols }).map((_, c) => (
          <Skeleton key={c} className="h-4 flex-1 bg-muted" />
        ))}
      </div>
      {/* Table Data rows */}
      {Array.from({ length: rows }).map((_, r) => (
        <div key={r} className="flex gap-4 py-2 border-b border-border/10 last:border-0">
          {Array.from({ length: cols }).map((_, c) => (
            <Skeleton key={c} className="h-3 flex-1" />
          ))}
        </div>
      ))}
    </div>
  );
};

export const SkeletonCard: React.FC<{ count?: number; className?: string }> = ({ count = 3, className = '' }) => {
  return (
    <div className={`grid grid-cols-1 md:grid-cols-3 gap-6 ${className}`}>
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="p-5 border border-border/30 space-y-3 rounded-[4px] bg-card">
          <Skeleton className="h-3.5 w-1/3" />
          <Skeleton className="h-7 w-2/3" />
        </div>
      ))}
    </div>
  );
};
