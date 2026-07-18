import React, { useEffect, useRef } from 'react';
import { X, AlertTriangle } from 'lucide-react';

interface ConfirmModalProps {
  isOpen: boolean;
  title: string;
  description: string;
  confirmText: string;
  cancelText?: string;
  onConfirm: () => void | Promise<void>;
  onClose: () => void;
  isDestructive?: boolean;
}

export const ConfirmModal: React.FC<ConfirmModalProps> = ({
  isOpen,
  title,
  description,
  confirmText,
  cancelText = "Cancel",
  onConfirm,
  onClose,
  isDestructive = true
}) => {
  const cancelBtnRef = useRef<HTMLButtonElement>(null);

  // Close modal on Escape key press
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    // Autofocus the cancel button by default for safety
    setTimeout(() => cancelBtnRef.current?.focus(), 50);

    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity duration-200 animate-in fade-in" 
        onClick={onClose}
      />

      {/* Modal Container */}
      <div className="relative w-full max-w-md bg-card border border-border/80 rounded-[4px] shadow-lg p-6 z-10 animate-modal-in font-sans">
        {/* Close Button */}
        <button 
          onClick={onClose} 
          className="absolute right-4 top-4 text-muted-foreground hover:text-foreground p-1 hover:bg-muted rounded-[4px] transition-colors"
          type="button"
        >
          <X className="h-4 w-4" />
        </button>

        {/* Content */}
        <div className="flex gap-4">
          <div className="p-2 bg-red-500/10 rounded-full h-fit text-red-500">
            <AlertTriangle className="h-5 w-5" />
          </div>
          <div className="space-y-2 flex-1">
            <h3 className="text-sm font-semibold text-foreground leading-none">
              {title}
            </h3>
            <p className="text-xs text-muted-foreground leading-relaxed">
              {description}
            </p>
          </div>
        </div>

        {/* Actions */}
        <div className="flex justify-end gap-3 mt-6 border-t border-border/20 pt-4">
          <button
            ref={cancelBtnRef}
            onClick={onClose}
            type="button"
            className="px-3.5 py-1.5 border border-border hover:bg-muted text-xs font-semibold rounded-[4px] text-foreground transition-colors"
          >
            {cancelText}
          </button>
          <button
            onClick={async () => {
              await onConfirm();
              onClose();
            }}
            type="button"
            className={`px-3.5 py-1.5 text-xs font-semibold rounded-[4px] text-white transition-colors ${
              isDestructive 
                ? 'bg-red-600 hover:bg-red-700' 
                : 'bg-primary hover:bg-primary/95'
            }`}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
};
