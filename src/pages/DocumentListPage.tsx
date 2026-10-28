import React, { useEffect, useState, useTransition } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { fetchWorkspaceDocuments, fetchApprovedInvoicesForExport } from '../lib/api';
import { DocumentRecord } from '../types';
import { DocumentUploadModal } from '../components/DocumentUploadModal';
import { generateApprovedInvoicesCsv, downloadCsvFile } from '../lib/exportCsv';
import {
  UploadCloud,
  Search,
  RefreshCw,
  FileText,
  AlertCircle,
  Eye,
  Filter,
  Download,
  CheckCircle2,
} from 'lucide-react';

export const DocumentListPage: React.FC = () => {
  const { currentWorkspace, user } = useAuth();
  const [documents, setDocuments] = useState<DocumentRecord[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isExporting, setIsExporting] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [exportNotice, setExportNotice] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [isUploadModalOpen, setIsUploadModalOpen] = useState<boolean>(false);
  const [, startTransition] = useTransition();

  const handleExportCsv = async () => {
    if (!currentWorkspace) return;
    setIsExporting(true);
    setExportNotice(null);

    try {
      const exportRows = await fetchApprovedInvoicesForExport(currentWorkspace.id);
      if (exportRows.length === 0) {
        setExportNotice('No approved invoices found in this workspace to export. Only certified/approved invoices are exported.');
        setTimeout(() => setExportNotice(null), 5000);
        return;
      }

      const csvString = generateApprovedInvoicesCsv(exportRows);
      const safeFilename = `ledgerlens_approved_invoices_${currentWorkspace.name.toLowerCase().replace(/[^a-z0-9]/g, '_')}_${new Date().toISOString().split('T')[0]}.csv`;
      downloadCsvFile(csvString, safeFilename);
    } catch (err: any) {
      setError(err.message || 'Failed to export invoices to CSV.');
    } finally {
      setIsExporting(false);
    }
  };

  const loadDocuments = async () => {
    if (!currentWorkspace) return;
    setIsLoading(true);
    setError(null);

    try {
      const records = await fetchWorkspaceDocuments(
        currentWorkspace.id,
        searchQuery,
        statusFilter
      );
      startTransition(() => {
        setDocuments(records);
      });
    } catch (err: any) {
      setError(err.message || 'Failed to retrieve workspace documents.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadDocuments();
  }, [currentWorkspace?.id, statusFilter]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    loadDocuments();
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const formatDate = (dateString: string): string => {
    try {
      const d = new Date(dateString);
      return d.toLocaleDateString('en-GB', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch {
      return dateString;
    }
  };

  const renderStatusBadge = (status: DocumentRecord['status']) => {
    switch (status) {
      case 'uploaded':
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded-[2px] text-[11px] font-mono font-medium bg-[#FAFAF8] text-[#5A5852] border border-[#DDD7CD]">
            [UPLOADED]
          </span>
        );
      case 'review_required':
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded-[2px] text-[11px] font-mono font-medium bg-[#FFFBEB] text-[#C2410C] border border-[#FED7AA]">
            [REVIEW REQUIRED]
          </span>
        );
      case 'approved':
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded-[2px] text-[11px] font-mono font-medium bg-[#EBF3EE] text-[#1B4938] border border-[#1B4938]/30 font-semibold">
            [CERTIFIED]
          </span>
        );
      case 'rejected':
      case 'failed':
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded-[2px] text-[11px] font-mono font-medium bg-[#FEF2F2] text-[#9B2C2C] border border-[#FECACA]">
            [{status === 'failed' ? 'FAILED' : 'REJECTED'}]
          </span>
        );
      case 'processing':
      case 'queued':
      default:
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded-[2px] text-[11px] font-mono font-medium bg-[#F6F5F1] text-[#5A5852] border border-[#E2DFD7]">
            [{status.toUpperCase()}]
          </span>
        );
    }
  };

  return (
    <div className="space-y-6">
      {/* Workspace Header & Action Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#E2DFD7]">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="font-mono text-[10px] tracking-wider uppercase px-1.5 py-0.5 bg-[#FFFFFF] border border-[#DDD7CD] text-[#5A5852]">
              REGISTER // 01
            </span>
            <span className="text-[11px] font-mono text-[#5A5852]">
              ACTIVE REPOSITORY
            </span>
          </div>
          <h1 className="text-[22px] font-bold text-[#111318] tracking-tight">
            Workspace Invoices
          </h1>
          <p className="text-[13px] text-[#5A5852] mt-0.5">
            Active Workspace: <span className="font-semibold text-[#111318]">{currentWorkspace?.name}</span> •{' '}
            Role: <span className="font-mono text-[#1D4ED8] uppercase text-[12px]">{currentWorkspace?.role || 'member'}</span>
          </p>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap">
          <button
            type="button"
            onClick={loadDocuments}
            disabled={isLoading}
            className="p-2 text-[#5A5852] hover:text-[#111318] bg-[#FFFFFF] border border-[#DDD7CD] rounded-[2px] hover:bg-[#F6F5F1] transition-colors disabled:opacity-50"
            title="Refresh documents list"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
          </button>

          <button
            type="button"
            onClick={handleExportCsv}
            disabled={isExporting}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 text-[13px] font-medium text-[#111318] bg-[#FFFFFF] hover:bg-[#F6F5F1] border border-[#DDD7CD] rounded-[2px] transition-colors focus-ring disabled:opacity-50"
            title="Export certified approved invoices to CSV"
          >
            <Download className="w-4 h-4 text-[#5A5852]" />
            <span>{isExporting ? 'Generating CSV...' : 'Export Certified (CSV)'}</span>
          </button>

          <button
            type="button"
            onClick={() => setIsUploadModalOpen(true)}
            className="inline-flex items-center gap-1.5 px-4 py-2 text-[13px] font-medium text-white bg-[#111318] hover:bg-[#1D4ED8] rounded-[2px] transition-colors focus-ring shadow-sm"
          >
            <UploadCloud className="w-4 h-4" />
            <span>Upload Invoice</span>
          </button>
        </div>
      </div>

      {/* Export Alert Notice */}
      {exportNotice && (
        <div className="p-3 bg-[#EBF3EE] border border-[#1B4938]/30 rounded-[2px] text-[13px] text-[#1B4938] flex items-center justify-between">
          <span>{exportNotice}</span>
          <button type="button" onClick={() => setExportNotice(null)} className="text-xs font-bold opacity-70 hover:opacity-100">
            Dismiss
          </button>
        </div>
      )}

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-[#FFFFFF] p-3 border border-[#E2DFD7] rounded-[2px]">
        {/* Search */}
        <form onSubmit={handleSearchSubmit} className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-[#5A5852] absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Search by filename..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 text-[13px] text-[#111318] bg-[#FFFFFF] border border-[#DDD7CD] rounded-[2px] focus-ring"
          />
        </form>

        {/* Status filter */}
        <div className="flex items-center gap-2">
          <Filter className="w-3.5 h-3.5 text-[#5A5852]" />
          <span className="text-[12px] font-mono text-[#5A5852] uppercase">Status:</span>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-2.5 py-1.5 text-[13px] text-[#111318] bg-[#FFFFFF] border border-[#DDD7CD] rounded-[2px] focus-ring"
          >
            <option value="all">All Documents</option>
            <option value="uploaded">Uploaded</option>
            <option value="queued">Queued</option>
            <option value="processing">Processing</option>
            <option value="review_required">Review Required</option>
            <option value="approved">Approved</option>
            <option value="rejected">Rejected</option>
            <option value="failed">Failed</option>
          </select>
        </div>
      </div>

      {/* Error Notice */}
      {error && (
        <div className="p-4 bg-[#FEF2F2] border border-[#FECACA] rounded-[2px] flex items-start justify-between gap-3 text-[13px] text-[#9B2C2C]">
          <div className="flex items-start gap-2">
            <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
          <button
            type="button"
            onClick={loadDocuments}
            className="text-[12px] font-semibold underline hover:text-[#111318]"
          >
            Retry
          </button>
        </div>
      )}

      {/* Document List Table */}
      <div className="bg-[#FFFFFF] border border-[#E2DFD7] rounded-[2px] shadow-sm overflow-hidden">
        {isLoading && documents.length === 0 ? (
          <div className="p-12 text-center space-y-3">
            <div className="w-6 h-6 border-2 border-[#111318] border-t-transparent rounded-full animate-spin mx-auto" />
            <p className="text-[13px] text-[#5A5852] font-mono">Loading register records...</p>
          </div>
        ) : documents.length === 0 ? (
          /* Empty State */
          <div className="p-12 text-center max-w-md mx-auto">
            <div className="w-10 h-10 rounded-[2px] bg-[#F6F5F1] border border-[#DDD7CD] flex items-center justify-center text-[#111318] mx-auto mb-3">
              <FileText className="w-5 h-5" />
            </div>
            <h3 className="text-[16px] font-bold text-[#111318]">No documents found</h3>
            <p className="text-[13px] text-[#5A5852] mt-1 mb-5">
              {searchQuery || statusFilter !== 'all'
                ? 'No documents matched your search filter criteria. Try resetting your search.'
                : 'This workspace has no invoices uploaded yet. Upload a supplier invoice to begin structured extraction.'}
            </p>
            <button
              type="button"
              onClick={() => setIsUploadModalOpen(true)}
              className="inline-flex items-center gap-1.5 px-4 py-2 text-[13px] font-medium text-white bg-[#111318] hover:bg-[#1D4ED8] rounded-[2px] transition-colors focus-ring"
            >
              <UploadCloud className="w-4 h-4" />
              <span>Upload First Document</span>
            </button>
          </div>
        ) : (
          /* Table */
          <div className="overflow-x-auto">
            <table className="w-full text-left text-[13px] border-collapse">
              <thead>
                <tr className="bg-[#FAFAF8] border-b border-[#E2DFD7] text-[#5A5852] font-mono text-[11px] uppercase tracking-wider">
                  <th className="py-2.5 px-4">Document / Filename</th>
                  <th className="py-2.5 px-4">Uploaded</th>
                  <th className="py-2.5 px-4">Format</th>
                  <th className="py-2.5 px-4">File Size</th>
                  <th className="py-2.5 px-4">Processing Status</th>
                  <th className="py-2.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E2DFD7]">
                {documents.map((doc) => (
                  <tr key={doc.id} className="hover:bg-[#F6F5F1]/80 transition-colors">
                    <td className="py-3 px-4 font-medium text-[#111318]">
                      <div className="flex items-center gap-2">
                        <FileText className="w-4 h-4 text-[#5A5852] flex-shrink-0" />
                        <span className="truncate max-w-[240px] sm:max-w-xs font-sans" title={doc.original_filename}>
                          {doc.original_filename}
                        </span>
                      </div>
                    </td>
                    <td className="py-3 px-4 text-[#5A5852] text-[12px] font-mono">
                      {formatDate(doc.created_at)}
                    </td>
                    <td className="py-3 px-4 font-mono text-[11px] text-[#5A5852] uppercase">
                      {doc.mime_type === 'application/pdf' ? 'PDF' : doc.mime_type.split('/')[1] || 'DOC'}
                    </td>
                    <td className="py-3 px-4 font-mono text-[12px] text-[#5A5852]">
                      {formatFileSize(doc.file_size_bytes)}
                    </td>
                    <td className="py-3 px-4">
                      {renderStatusBadge(doc.status)}
                    </td>
                    <td className="py-3 px-4 text-right">
                      <Link
                        to={`/app/documents/${doc.id}`}
                        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-[2px] text-[12px] font-medium transition-colors ${
                          doc.status === 'review_required'
                            ? 'bg-[#FFFBEB] text-[#C2410C] border border-[#FED7AA] hover:bg-[#FED7AA]/30'
                            : doc.status === 'approved'
                            ? 'bg-[#EBF3EE] text-[#1B4938] border border-[#1B4938]/30 hover:bg-[#EBF3EE]/80'
                            : 'text-[#1D4ED8] hover:text-[#111318] hover:underline'
                        }`}
                      >
                        {doc.status === 'approved' ? (
                          <CheckCircle2 className="w-3.5 h-3.5 text-[#1B4938]" />
                        ) : (
                          <Eye className="w-3.5 h-3.5" />
                        )}
                        <span>{doc.status === 'review_required' ? 'Review & Verify' : doc.status === 'approved' ? 'Certified' : 'Inspect'}</span>
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Table Footer Summary */}
        <div className="px-4 py-2.5 bg-[#FAFAF8] border-t border-[#E2DFD7] text-[12px] text-[#5A5852] flex items-center justify-between">
          <span className="font-mono text-[11px]">TOTAL RECORDS: <strong className="text-[#111318] font-mono">{documents.length}</strong></span>
          <span className="font-mono text-[11px] text-[#1D4ED8]">THE ALIGNMENT REGISTER // VERIFICATION ACTIVE</span>
        </div>
      </div>

      {/* Upload Modal */}
      {currentWorkspace && user && (
        <DocumentUploadModal
          isOpen={isUploadModalOpen}
          onClose={() => setIsUploadModalOpen(false)}
          workspaceId={currentWorkspace.id}
          userId={user.id}
          existingFilenames={documents.map((d) => d.original_filename)}
          onUploadSuccess={(newDoc) => {
            setDocuments((prev) => [newDoc, ...prev]);
          }}
        />
      )}
    </div>
  );
};
