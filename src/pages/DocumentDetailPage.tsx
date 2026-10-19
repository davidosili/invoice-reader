import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { fetchDocumentById, createDocumentSignedUrl } from '../lib/api';
import { DocumentRecord } from '../types';
import {
  FileText,
  ArrowLeft,
  Download,
  AlertCircle,
  Clock,
  HardDrive,
  ShieldCheck,
  Cpu,
} from 'lucide-react';

export const DocumentDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [document, setDocument] = useState<DocumentRecord | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [isGeneratingUrl, setIsGeneratingUrl] = useState<boolean>(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (!id) return;

    setIsLoading(true);
    setError(null);

    fetchDocumentById(id)
      .then((doc) => {
        if (!doc) {
          setError('Document not found or you do not have permission to view this workspace file.');
        } else {
          setDocument(doc);
        }
      })
      .catch((err: any) => {
        setError(err.message || 'Failed to fetch document record.');
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, [id]);

  const handleDownloadOriginal = async () => {
    if (!document) return;
    setIsGeneratingUrl(true);
    try {
      const signedUrl = await createDocumentSignedUrl(document.storage_path, 3600);
      window.open(signedUrl, '_blank', 'noopener,noreferrer');
    } catch (err: any) {
      alert(`Could not generate secure download link: ${err.message}`);
    } finally {
      setIsGeneratingUrl(false);
    }
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  if (isLoading) {
    return (
      <div className="p-12 text-center space-y-3">
        <div className="w-6 h-6 border-2 border-[#176B50] border-t-transparent rounded-full animate-spin mx-auto" />
        <p className="text-[13px] text-[#626B64]">Loading document metadata...</p>
      </div>
    );
  }

  if (error || !document) {
    return (
      <div className="max-w-2xl mx-auto my-12 p-6 bg-[#FFFFFF] border border-[#E2E6E1] rounded-[6px]">
        <div className="flex items-start gap-3 text-[#A33A32]">
          <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
          <div>
            <h2 className="text-[16px] font-bold">Access Denied or Document Unavailable</h2>
            <p className="text-[13px] text-[#626B64] mt-1">{error}</p>
          </div>
        </div>
        <div className="mt-5 pt-4 border-t border-[#E2E6E1]">
          <Link
            to="/app/documents"
            className="inline-flex items-center gap-1.5 text-[13px] font-medium text-[#176B50] hover:underline"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Return to document list</span>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Back button & top bar */}
      <div className="flex items-center justify-between pb-4 border-b border-[#E2E6E1]">
        <button
          type="button"
          onClick={() => navigate('/app/documents')}
          className="inline-flex items-center gap-1.5 text-[13px] font-medium text-[#626B64] hover:text-[#202722] transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to documents</span>
        </button>

        <button
          type="button"
          disabled={isGeneratingUrl}
          onClick={handleDownloadOriginal}
          className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-[13px] font-medium text-white bg-[#176B50] hover:bg-[#12563F] rounded-[4px] transition-colors focus-ring disabled:opacity-50"
        >
          <Download className="w-4 h-4" />
          <span>{isGeneratingUrl ? 'Generating link...' : 'Download Original'}</span>
        </button>
      </div>

      {/* Main Document Overview Panel */}
      <div className="bg-[#FFFFFF] border border-[#E2E6E1] rounded-[6px] shadow-sm p-6 space-y-6">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-[4px] bg-[#EDF4EF] flex items-center justify-center text-[#176B50] flex-shrink-0 mt-1">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-[20px] font-bold text-[#202722] tracking-tight">
                {document.original_filename}
              </h1>
              <p className="text-[12px] font-mono text-[#626B64] mt-0.5">
                Record ID: {document.id}
              </p>
            </div>
          </div>

          <div>
            <span className="inline-flex items-center px-2.5 py-1 rounded-[3px] text-[12px] font-mono font-medium bg-[#EDF4EF] text-[#176B50] border border-[#176B50]/20">
              Status: {document.status}
            </span>
          </div>
        </div>

        {/* Metadata Breakdown */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4 border-t border-[#E2E6E1]">
          <div className="p-3 bg-[#F7F8F6] rounded-[4px] border border-[#E2E6E1]">
            <div className="flex items-center gap-1.5 text-[11px] font-semibold text-[#626B64] uppercase tracking-wider mb-1">
              <Clock className="w-3.5 h-3.5 text-[#176B50]" />
              Uploaded Timestamp
            </div>
            <p className="text-[13px] font-mono font-medium text-[#202722]">
              {new Date(document.created_at).toLocaleString('en-GB')}
            </p>
          </div>

          <div className="p-3 bg-[#F7F8F6] rounded-[4px] border border-[#E2E6E1]">
            <div className="flex items-center gap-1.5 text-[11px] font-semibold text-[#626B64] uppercase tracking-wider mb-1">
              <HardDrive className="w-3.5 h-3.5 text-[#176B50]" />
              File Size & MIME
            </div>
            <p className="text-[13px] font-mono font-medium text-[#202722]">
              {formatFileSize(document.file_size_bytes)} • {document.mime_type}
            </p>
          </div>

          <div className="p-3 bg-[#F7F8F6] rounded-[4px] border border-[#E2E6E1]">
            <div className="flex items-center gap-1.5 text-[11px] font-semibold text-[#626B64] uppercase tracking-wider mb-1">
              <ShieldCheck className="w-3.5 h-3.5 text-[#176B50]" />
              Storage Path
            </div>
            <p className="text-[12px] font-mono font-medium text-[#202722] truncate" title={document.storage_path}>
              {document.storage_path}
            </p>
          </div>
        </div>

        {/* Phase 2 Pipeline Staging Notice */}
        <div className="p-4 bg-[#EDF4EF]/50 border border-[#176B50]/20 rounded-[4px] flex items-start gap-3">
          <Cpu className="w-5 h-5 text-[#176B50] flex-shrink-0 mt-0.5" />
          <div className="text-[13px]">
            <p className="font-semibold text-[#202722]">
              Phase 1 Storage & Metadata Active
            </p>
            <p className="text-[#626B64] mt-1 leading-relaxed">
              This invoice has been securely stored in your private workspace storage bucket. Server-side AI document
              extraction, arithmetic cross-sum validation, and field-level confidence indicators will be linked to this
              record in <strong>Phase 2</strong>.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
