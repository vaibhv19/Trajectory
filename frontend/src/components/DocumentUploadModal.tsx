import React, { useState, useRef, useEffect } from 'react';
import { UploadCloud, X, Loader2, FileCheck } from 'lucide-react';

export interface DocumentUploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  subtitle?: string;
  acceptedFileTypes?: string; // e.g. ".pdf" or ".pdf,.docx"
  maxSizeMB?: number; // default: 10
  showNotesField?: boolean;
  notesLabel?: string;
  notesPlaceholder?: string;
  uploadButtonText?: string;
  isUploading?: boolean;
  onUpload: (file: File, notes: string) => Promise<void> | void;
}

export const DocumentUploadModal: React.FC<DocumentUploadModalProps> = ({
  isOpen,
  onClose,
  title = 'Upload Document',
  subtitle,
  acceptedFileTypes = '.pdf',
  maxSizeMB = 10,
  showNotesField = true,
  notesLabel = 'Changelog / Version Notes',
  notesPlaceholder = 'e.g. Updated experience, added new projects...',
  uploadButtonText = 'Upload',
  isUploading = false,
  onUpload,
}) => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [notes, setNotes] = useState('');
  const [isDragOver, setIsDragOver] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Reset state when modal opens/closes & add Escape key listener
  useEffect(() => {
    if (isOpen) {
      setSelectedFile(null);
      setNotes('');
      setErrorMsg(null);
      setIsDragOver(false);

      const handleKeyDown = (e: KeyboardEvent) => {
        if (e.key === 'Escape' && !isUploading) {
          onClose();
        }
      };

      window.addEventListener('keydown', handleKeyDown);
      return () => window.removeEventListener('keydown', handleKeyDown);
    }
  }, [isOpen, isUploading, onClose]);

  if (!isOpen) return null;

  const validateFile = (file: File): boolean => {
    setErrorMsg(null);
    
    // Size check
    if (file.size > maxSizeMB * 1024 * 1024) {
      setErrorMsg(`File size exceeds maximum limit of ${maxSizeMB}MB.`);
      return false;
    }

    // File type extension check if acceptedFileTypes provided
    if (acceptedFileTypes) {
      const allowedExts = acceptedFileTypes.split(',').map((ext) => ext.trim().toLowerCase());
      const fileNameLower = file.name.toLowerCase();
      const hasValidExt = allowedExts.some((ext) => fileNameLower.endsWith(ext));
      
      if (!hasValidExt) {
        setErrorMsg(`Invalid file type. Please upload a file matching ${acceptedFileTypes}`);
        return false;
      }
    }

    return true;
  };

  const handleFileSelect = (file: File | null) => {
    if (!file) return;
    if (validateFile(file)) {
      setSelectedFile(file);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFileSelect(e.dataTransfer.files[0]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFile || isUploading) return;
    await onUpload(selectedFile, notes);
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div 
        className="bg-card border border-border p-6 rounded-lg w-full max-w-lg space-y-5 shadow-2xl animate-in zoom-in-95 duration-200 text-foreground"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between pb-3 border-b border-border">
          <div>
            <h3 className="text-lg font-display font-bold uppercase tracking-tight text-foreground">
              {title}
            </h3>
            {subtitle && (
              <p className="text-xs text-muted-foreground mt-0.5">{subtitle}</p>
            )}
          </div>
          <button 
            type="button" 
            onClick={onClose} 
            disabled={isUploading}
            className="p-1 text-muted-foreground hover:text-foreground rounded-md transition-colors disabled:opacity-50"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Hidden native input */}
        <input 
          ref={fileInputRef}
          type="file"
          accept={acceptedFileTypes}
          onChange={(e) => handleFileSelect(e.target.files?.[0] || null)}
          className="hidden"
        />

        {/* Upload Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Drag & Drop Area / Selected File Preview */}
          {!selectedFile ? (
            <div
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className={`flex flex-col items-center justify-center p-8 border-2 border-dashed rounded-lg cursor-pointer transition-all duration-200 ${
                isDragOver 
                  ? 'border-primary bg-primary/10 scale-[0.99]' 
                  : 'border-border hover:border-primary/50 hover:bg-muted/30 bg-muted/10'
              }`}
            >
              <div className="p-3 bg-primary/10 text-primary rounded-full mb-3">
                <UploadCloud className="w-7 h-7" />
              </div>
              <p className="text-sm font-semibold text-foreground text-center">
                Drag & drop your file here, or{' '}
                <span className="text-primary hover:underline">browse</span>
              </p>
              <p className="text-xs text-muted-foreground mt-1 font-mono">
                Supported formats: {acceptedFileTypes.toUpperCase()} (Max {maxSizeMB}MB)
              </p>
            </div>
          ) : (
            <div className="p-4 bg-muted/20 border border-primary/30 rounded-lg space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="p-2.5 bg-primary/10 text-primary rounded-md shrink-0">
                    <FileCheck className="w-5 h-5" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-foreground truncate font-mono">
                      {selectedFile.name}
                    </p>
                    <p className="text-xs text-muted-foreground font-mono">
                      {formatFileSize(selectedFile.size)}
                    </p>
                  </div>
                </div>
                
                <button
                  type="button"
                  onClick={() => setSelectedFile(null)}
                  disabled={isUploading}
                  className="p-1.5 border border-border hover:bg-muted text-muted-foreground hover:text-destructive rounded-md transition-colors disabled:opacity-50"
                  title="Remove file"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* Error Message Alert */}
          {errorMsg && (
            <p className="text-xs text-destructive bg-destructive/10 border border-destructive/20 p-2.5 rounded-md">
              {errorMsg}
            </p>
          )}

          {/* Notes Field (Optional) */}
          {showNotesField && (
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-foreground block">
                {notesLabel}
              </label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder={notesPlaceholder}
                disabled={isUploading}
                rows={3}
                className="w-full p-2.5 bg-background border border-border rounded-md text-xs placeholder-muted-foreground/60 focus:outline-none focus:ring-1 focus:ring-primary focus:border-transparent transition-all disabled:opacity-50"
              />
            </div>
          )}

          {/* Action Footer Buttons */}
          <div className="flex items-center justify-end gap-3 pt-3 border-t border-border">
            <button
              type="button"
              onClick={onClose}
              disabled={isUploading}
              className="px-4 py-2 border border-border hover:bg-muted text-xs font-semibold text-muted-foreground rounded-md transition-colors disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!selectedFile || isUploading}
              className="flex items-center justify-center gap-2 px-4 py-2 bg-primary hover:bg-primary/95 text-primary-foreground text-xs font-semibold rounded-md transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
            >
              {isUploading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Uploading...
                </>
              ) : (
                uploadButtonText
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
