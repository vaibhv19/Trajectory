import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../services/api';
import type { CompanyDocument } from '../types';
import { 
  FolderPlus, 
  Trash2, 
  FileText, 
  Download, 
  Loader2,
  FolderOpen,
  Search,
  Upload
} from 'lucide-react';

export const ResourcesPage: React.FC = () => {
  const queryClient = useQueryClient();
  const [searchQuery, setSearchQuery] = useState('');
  
  // Upload Form State
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [companyName, setCompanyName] = useState('');
  const [documentName, setDocumentName] = useState('');
  const [documentType, setDocumentType] = useState('Process PDF');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  // Fetch Documents
  const { data: documentsData, isLoading } = useQuery<CompanyDocument[]>({
    queryKey: ['documents'],
    queryFn: api.documents.list,
  });
  const documents = documentsData || [];

  // Delete Mutation
  const deleteMutation = useMutation({
    mutationFn: (id: string) => api.documents.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['documents'] });
    },
  });

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setSelectedFile(file);
      if (!documentName) {
        // Pre-fill document name with file name without extension
        const baseName = file.name.substring(0, file.name.lastIndexOf('.')) || file.name;
        setDocumentName(baseName);
      }
    }
  };

  const handleUploadSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFile || !companyName.trim() || !documentName.trim()) {
      setErrorMsg('All fields are required.');
      return;
    }

    setUploading(true);
    setErrorMsg('');
    try {
      await api.documents.upload(selectedFile, companyName.trim(), documentName.trim(), documentType);
      queryClient.invalidateQueries({ queryKey: ['documents'] });
      setIsUploadOpen(false);
      resetForm();
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to upload document.');
    } finally {
      setUploading(false);
    }
  };

  const handleDownload = async (id: string, name: string) => {
    try {
      const blob = await api.documents.download(id);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = name.toLowerCase().endsWith('.pdf') ? name : `${name}.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (err) {
      console.error('Failed to download document:', err);
    }
  };

  const resetForm = () => {
    setCompanyName('');
    setDocumentName('');
    setDocumentType('Process PDF');
    setSelectedFile(null);
    setErrorMsg('');
  };

  const filteredDocuments = documents.filter(doc => 
    doc.companyName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    doc.documentName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (doc.documentType && doc.documentType.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-graphite-900 dark:text-paper-50 font-display">
            Company Resources
          </h1>
          <p className="text-sm text-graphite-500 dark:text-graphite-400 font-sans mt-1">
            Store benefits guides, placement PPTs, and hiring files privately in your secure career locker.
          </p>
        </div>
        <button
          onClick={() => {
            resetForm();
            setIsUploadOpen(true);
          }}
          className="flex items-center gap-2 bg-teal-700 hover:bg-teal-800 text-white px-4 py-2 text-sm font-medium transition-colors border border-teal-800 font-sans rounded-md shadow-sm"
        >
          <FolderPlus className="w-4 h-4" />
          Add Resource
        </button>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 gap-6">
        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-graphite-400" />
          <input
            type="text"
            placeholder="Search resources by company, name, or document type..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-white dark:bg-graphite-900 border border-graphite-200 dark:border-graphite-800 text-graphite-900 dark:text-paper-50 pl-10 pr-4 py-2.5 text-sm font-sans focus:outline-none focus:ring-1 focus:ring-teal-500 focus:border-teal-500 rounded-md"
          />
        </div>

        {/* Resources Table */}
        <div className="bg-white dark:bg-graphite-900 border border-graphite-200 dark:border-graphite-800 rounded-md overflow-hidden">
          {isLoading ? (
            <div className="py-20 flex flex-col items-center justify-center text-graphite-500">
              <Loader2 className="w-8 h-8 animate-spin text-teal-600 mb-2" />
              <span className="text-sm font-sans">Retrieving secure documents locker...</span>
            </div>
          ) : filteredDocuments.length === 0 ? (
            <div className="py-20 flex flex-col items-center justify-center text-graphite-500">
              <FolderOpen className="w-12 h-12 text-graphite-300 dark:text-graphite-700 mb-3" />
              <h3 className="text-base font-semibold text-graphite-700 dark:text-graphite-300 font-sans">
                Locker is Empty
              </h3>
              <p className="text-xs text-graphite-400 font-sans mt-1 max-w-sm text-center">
                {searchQuery ? 'No documents match your search criteria.' : 'Upload eligibility papers, benefits files, or hiring guidelines to get started.'}
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-graphite-200 dark:border-graphite-800 bg-graphite-50 dark:bg-graphite-900/50">
                    <th className="px-6 py-3.5 text-xs font-semibold text-graphite-500 uppercase tracking-wider font-mono">
                      Resource Name
                    </th>
                    <th className="px-6 py-3.5 text-xs font-semibold text-graphite-500 uppercase tracking-wider font-mono">
                      Company
                    </th>
                    <th className="px-6 py-3.5 text-xs font-semibold text-graphite-500 uppercase tracking-wider font-mono">
                      Type
                    </th>
                    <th className="px-6 py-3.5 text-xs font-semibold text-graphite-500 uppercase tracking-wider font-mono">
                      Attached File
                    </th>
                    <th className="px-6 py-3.5 text-xs font-semibold text-graphite-500 uppercase tracking-wider font-mono">
                      Added Date
                    </th>
                    <th className="px-6 py-3.5 text-right text-xs font-semibold text-graphite-500 uppercase tracking-wider font-mono">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-graphite-200 dark:divide-graphite-800">
                  {filteredDocuments.map((doc) => (
                    <tr 
                      key={doc.id}
                      className="hover:bg-graphite-50/50 dark:hover:bg-graphite-800/30 transition-colors"
                    >
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="p-2 bg-teal-50 dark:bg-teal-950/30 border border-teal-100 dark:border-teal-900 text-teal-700 dark:text-teal-400 rounded-md">
                            <FileText className="w-4 h-4" />
                          </div>
                          <div>
                            <span className="font-semibold text-sm text-graphite-900 dark:text-paper-100 font-sans block">
                              {doc.documentName}
                            </span>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-xs font-mono bg-graphite-100 dark:bg-graphite-800 text-graphite-700 dark:text-graphite-300 px-2 py-1 rounded-md">
                          {doc.companyName.toUpperCase()}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-xs font-sans text-graphite-600 dark:text-graphite-400">
                          {doc.documentType || 'Other'}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-xs font-mono text-graphite-400 dark:text-graphite-500 block max-w-xs truncate">
                          {doc.fileName}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-xs text-graphite-500 dark:text-graphite-400 font-sans">
                          {new Date(doc.createdAt).toLocaleDateString()}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => handleDownload(doc.id, doc.fileName)}
                            className="p-1.5 hover:bg-graphite-100 dark:hover:bg-graphite-800 border border-transparent hover:border-graphite-200 dark:hover:border-graphite-700 text-graphite-500 dark:text-graphite-400 rounded-md transition-colors"
                            title="Download document"
                          >
                            <Download className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => {
                              if (confirm('Are you sure you want to delete this resource?')) {
                                deleteMutation.mutate(doc.id);
                              }
                            }}
                            className="p-1.5 hover:bg-red-50 dark:hover:bg-red-950/20 border border-transparent hover:border-red-100 dark:hover:border-red-900 text-graphite-400 hover:text-red-600 dark:hover:text-red-400 rounded-md transition-colors"
                            title="Delete resource"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Upload Modal */}
      {isUploadOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="w-full max-w-md bg-white dark:bg-graphite-900 border border-graphite-200 dark:border-graphite-800 p-6 rounded-lg shadow-xl animate-in fade-in zoom-in-95 duration-150">
            <h3 className="text-lg font-semibold text-graphite-950 dark:text-paper-50 font-display">
              Add New Resource File
            </h3>
            
            <form onSubmit={handleUploadSubmit} className="mt-4 space-y-4">
              <div>
                <label className="block text-xs font-mono uppercase tracking-wider text-graphite-500 mb-1">
                  Company Name
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Google, Stripe"
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                  className="w-full bg-white dark:bg-graphite-950 border border-graphite-200 dark:border-graphite-800 text-graphite-900 dark:text-paper-100 px-3 py-2 text-sm font-sans focus:outline-none focus:ring-1 focus:ring-teal-500 focus:border-teal-500 rounded-md"
                />
              </div>

              <div>
                <label className="block text-xs font-mono uppercase tracking-wider text-graphite-500 mb-1">
                  Document Name
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Eligibility Criteria, Benefits Guide"
                  value={documentName}
                  onChange={(e) => setDocumentName(e.target.value)}
                  className="w-full bg-white dark:bg-graphite-950 border border-graphite-200 dark:border-graphite-800 text-graphite-900 dark:text-paper-100 px-3 py-2 text-sm font-sans focus:outline-none focus:ring-1 focus:ring-teal-500 focus:border-teal-500 rounded-md"
                />
              </div>

              <div>
                <label className="block text-xs font-mono uppercase tracking-wider text-graphite-500 mb-1">
                  Document Type
                </label>
                <select
                  value={documentType}
                  onChange={(e) => setDocumentType(e.target.value)}
                  className="w-full bg-white dark:bg-graphite-950 border border-graphite-200 dark:border-graphite-800 text-graphite-900 dark:text-paper-100 px-3 py-2 text-sm font-sans focus:outline-none focus:ring-1 focus:ring-teal-500 focus:border-teal-500 rounded-md"
                >
                  <option value="Placement PPT">Placement PPT</option>
                  <option value="Process PDF">Process PDF</option>
                  <option value="Benefit Guide">Benefit Guide</option>
                  <option value="Eligibility Criteria">Eligibility Criteria</option>
                  <option value="Eligibility Guide">Eligibility Guide</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-mono uppercase tracking-wider text-graphite-500 mb-1">
                  File Attachment (PDF)
                </label>
                <div className="mt-1 border border-dashed border-graphite-200 dark:border-graphite-800 p-4 text-center rounded-md bg-graphite-50/50 dark:bg-graphite-950/20 hover:bg-graphite-50 dark:hover:bg-graphite-950/30 transition-colors relative cursor-pointer">
                  <input
                    type="file"
                    required
                    accept=".pdf,.doc,.docx"
                    onChange={handleFileChange}
                    className="absolute inset-0 opacity-0 cursor-pointer"
                  />
                  <Upload className="w-8 h-8 text-graphite-400 mx-auto mb-2" />
                  {selectedFile ? (
                    <span className="text-xs font-mono text-teal-600 dark:text-teal-400 block font-semibold truncate">
                      {selectedFile.name}
                    </span>
                  ) : (
                    <>
                      <span className="text-xs text-graphite-600 dark:text-graphite-400 block font-sans">
                        Click to upload file
                      </span>
                      <span className="text-[10px] text-graphite-400 font-sans block mt-1">
                        Accepts PDF up to 10MB
                      </span>
                    </>
                  )}
                </div>
              </div>

              {errorMsg && (
                <div className="bg-red-50 dark:bg-red-950/20 border border-red-100 dark:border-red-900/50 p-3 text-red-600 dark:text-red-400 text-xs font-sans rounded-md">
                  {errorMsg}
                </div>
              )}

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsUploadOpen(false)}
                  className="px-4 py-2 border border-graphite-200 dark:border-graphite-800 text-graphite-700 dark:text-graphite-300 text-sm font-medium hover:bg-graphite-50 dark:hover:bg-graphite-800 transition-colors rounded-md font-sans"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={uploading}
                  className="flex items-center gap-1.5 bg-teal-700 hover:bg-teal-800 disabled:bg-teal-850 text-white px-4 py-2 text-sm font-medium transition-colors border border-teal-800 rounded-md font-sans"
                >
                  {uploading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Uploading...
                    </>
                  ) : (
                    'Upload File'
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
