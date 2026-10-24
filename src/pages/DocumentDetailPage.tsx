import React, { useEffect, useState, useTransition } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  fetchDocumentById,
  createDocumentSignedUrl,
  fetchInvoiceExtraction,
  fetchInvoiceValidationIssues,
  fetchInvoiceAuditEvents,
  queueAndProcessInvoice,
  saveInvoiceCorrections,
  approveInvoiceDocument,
  rejectInvoiceDocument,
} from '../lib/api';
import {
  DocumentRecord,
  InvoiceExtractionRecord,
  InvoiceValidationIssue,
  InvoiceAuditEvent,
  ExtractionLineItem,
} from '../types';
import {
  getExtractionState,
  filterCustomerIssues,
  formatAuditEvent,
} from '../lib/extractionUi';
import {
  FileText,
  ArrowLeft,
  Download,
  AlertCircle,
  CheckCircle2,
  XCircle,
  RotateCw,
  Save,
  Plus,
  Trash2,
  AlertTriangle,
  History,
  Eye,
  Building,
  Calendar,
  Hash,
  Tag,
  UploadCloud,
  ShieldCheck,
  FileSpreadsheet,
  Edit3,
} from 'lucide-react';

export const DocumentDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { currentWorkspace } = useAuth();
  const navigate = useNavigate();

  const [document, setDocument] = useState<DocumentRecord | null>(null);
  const [extraction, setExtraction] = useState<InvoiceExtractionRecord | null>(null);
  const [issues, setIssues] = useState<InvoiceValidationIssue[]>([]);
  const [auditEvents, setAuditEvents] = useState<InvoiceAuditEvent[]>([]);
  const [previewSignedUrl, setPreviewSignedUrl] = useState<string | null>(null);
  const [showTechnicalAudit, setShowTechnicalAudit] = useState<boolean>(false);

  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [actionNotice, setActionNotice] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [activeHighlightKey, setActiveHighlightKey] = useState<string | null>(null);

  // Editable form fields
  const [formData, setFormData] = useState<Partial<InvoiceExtractionRecord>>({});
  const [, startTransition] = useTransition();

  const customerIssues = React.useMemo(() => filterCustomerIssues(issues), [issues]);
  const extractionState = React.useMemo(
    () => getExtractionState({ documentStatus: document?.status, extraction, issues }),
    [document?.status, extraction, issues]
  );

  const loadAllDocumentData = async () => {
    if (!id || !currentWorkspace) return;
    setIsLoading(true);
    setError(null);

    try {
      const doc = await fetchDocumentById(id, currentWorkspace.id);
      if (!doc) {
        setError('Document not found or you do not have permission to view this workspace file.');
        setIsLoading(false);
        return;
      }
      setDocument(doc);

      // Load signed URL for document viewer
      try {
        const url = await createDocumentSignedUrl(doc.storage_path, currentWorkspace.id, 3600);
        setPreviewSignedUrl(url);
      } catch (urlErr) {
        console.warn('Could not load preview signed URL:', urlErr);
      }

      // Load extraction, validation issues, and audit events in parallel
      const [extData, issuesData, auditData] = await Promise.all([
        fetchInvoiceExtraction(id, currentWorkspace.id),
        fetchInvoiceValidationIssues(id, currentWorkspace.id),
        fetchInvoiceAuditEvents(id, currentWorkspace.id),
      ]);

      startTransition(() => {
        setExtraction(extData);
        setIssues(issuesData);
        setAuditEvents(auditData);
        if (extData) {
          setFormData({
            supplier_name: extData.supplier_name,
            supplier_tax_id: extData.supplier_tax_id,
            supplier_address: extData.supplier_address,
            invoice_number: extData.invoice_number,
            invoice_date: extData.invoice_date,
            due_date: extData.due_date,
            currency: extData.currency,
            purchase_order_number: extData.purchase_order_number,
            subtotal: extData.subtotal,
            tax_rate: extData.tax_rate,
            tax_amount: extData.tax_amount,
            discount_amount: extData.discount_amount,
            shipping_amount: extData.shipping_amount,
            grand_total: extData.grand_total,
            payment_terms: extData.payment_terms,
            line_items: extData.line_items || [],
          });
        }
      });
    } catch (err: any) {
      setError(err.message || 'Failed to retrieve invoice document.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadAllDocumentData();
  }, [id, currentWorkspace?.id]);

  // Handler: Start intelligence processing
  const handleRunProcessing = async () => {
    if (!document || !currentWorkspace) return;
    setIsProcessing(true);
    setActionNotice(null);

    try {
      const res = await queueAndProcessInvoice(document.id, currentWorkspace.id);
      if (res.success) {
        setActionNotice({
          type: 'success',
          text: 'Document extraction and financial consistency checks completed successfully.',
        });
        await loadAllDocumentData();
      } else {
        setActionNotice({
          type: 'error',
          text: res.error || 'Invoice extraction encountered an error.',
        });
      }
    } catch (err: any) {
      setActionNotice({
        type: 'error',
        text: err.message || 'Failed to execute processing pipeline.',
      });
    } finally {
      setIsProcessing(false);
    }
  };

  // Handler: Save corrections
  const handleSaveCorrections = async () => {
    if (!document || !currentWorkspace || !extraction) return;
    setIsSaving(true);
    setActionNotice(null);

    try {
      await saveInvoiceCorrections(document.id, currentWorkspace.id, formData);
      setActionNotice({ type: 'success', text: 'Invoice corrections saved successfully.' });
      await loadAllDocumentData();
    } catch (err: any) {
      setActionNotice({ type: 'error', text: err.message || 'Failed to save corrections.' });
    } finally {
      setIsSaving(false);
    }
  };

  // Handler: Approve Invoice
  const handleApprove = async () => {
    if (!document || !currentWorkspace) return;
    if (!window.confirm('Confirm invoice approval? Approved invoices are certified and marked ready for accounting export.')) {
      return;
    }

    try {
      await approveInvoiceDocument(document.id, currentWorkspace.id);
      setActionNotice({ type: 'success', text: 'Invoice successfully approved and added to certified export queue.' });
      await loadAllDocumentData();
    } catch (err: any) {
      setActionNotice({ type: 'error', text: err.message || 'Failed to approve invoice.' });
    }
  };

  // Handler: Reject Invoice
  const handleReject = async () => {
    if (!document || !currentWorkspace) return;
    const reason = window.prompt('Provide a reason for rejecting this document (optional):', 'Unreconciled invoice discrepancies');
    if (reason === null) return; // User cancelled

    try {
      await rejectInvoiceDocument(document.id, currentWorkspace.id, reason);
      setActionNotice({ type: 'success', text: 'Invoice record rejected.' });
      await loadAllDocumentData();
    } catch (err: any) {
      setActionNotice({ type: 'error', text: err.message || 'Failed to reject invoice.' });
    }
  };

  // Line item helpers
  const handleLineItemChange = (index: number, field: keyof ExtractionLineItem, value: any) => {
    const updated = [...(formData.line_items || [])];
    const item = { ...updated[index], [field]: value };
    if (field === 'quantity' || field === 'unit_price') {
      const q = parseFloat(item.quantity as any) || 0;
      const p = parseFloat(item.unit_price as any) || 0;
      item.total = Math.round(q * p * 100) / 100;
    }
    updated[index] = item;

    // Recalculate subtotal
    const newSubtotal = updated.reduce((sum, it) => sum + (Number(it.total) || 0), 0);
    const tax = Number(formData.tax_amount) || 0;
    const shipping = Number(formData.shipping_amount) || 0;
    const discount = Number(formData.discount_amount) || 0;
    const newGrandTotal = Math.round((newSubtotal + tax + shipping - discount) * 100) / 100;

    setFormData({
      ...formData,
      line_items: updated,
      subtotal: Math.round(newSubtotal * 100) / 100,
      grand_total: newGrandTotal,
    });
  };

  const handleAddLineItem = () => {
    const newLine: ExtractionLineItem = {
      id: `item-${Date.now()}`,
      description: 'New invoice line item',
      quantity: 1,
      unit_price: 0,
      total: 0,
      verified: false,
    };
    setFormData({
      ...formData,
      line_items: [...(formData.line_items || []), newLine],
    });
  };

  const handleRemoveLineItem = (index: number) => {
    const updated = (formData.line_items || []).filter((_, idx) => idx !== index);
    const newSubtotal = updated.reduce((sum, it) => sum + (Number(it.total) || 0), 0);
    setFormData({
      ...formData,
      line_items: updated,
      subtotal: Math.round(newSubtotal * 100) / 100,
    });
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  if (isLoading) {
    return (
      <div className="p-16 text-center space-y-3">
        <div className="w-6 h-6 border-2 border-[#176B50] border-t-transparent rounded-full animate-spin mx-auto" />
        <p className="text-[13px] text-[#626B64]">Loading invoice data & validation history...</p>
      </div>
    );
  }

  if (error || !document) {
    return (
      <div className="max-w-2xl mx-auto my-12 p-6 bg-[#FFFFFF] border border-[#E2E6E1] rounded-[6px]">
        <div className="flex items-start gap-3 text-[#A33A32]">
          <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
          <div>
            <h2 className="text-[16px] font-bold">Document Unavailable</h2>
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

  const renderAuditIcon = (iconType: string) => {
    switch (iconType) {
      case 'upload':
        return <UploadCloud className="w-3.5 h-3.5 text-[#176B50]" />;
      case 'start':
        return <RotateCw className="w-3.5 h-3.5 text-[#176B50]" />;
      case 'check':
        return <CheckCircle2 className="w-3.5 h-3.5 text-[#176B50]" />;
      case 'review':
      case 'warning':
        return <AlertTriangle className="w-3.5 h-3.5 text-[#B45309]" />;
      case 'edit':
        return <Edit3 className="w-3.5 h-3.5 text-[#176B50]" />;
      case 'approved':
        return <ShieldCheck className="w-3.5 h-3.5 text-[#176B50]" />;
      case 'rejected':
        return <XCircle className="w-3.5 h-3.5 text-[#A33A32]" />;
      case 'export':
        return <FileSpreadsheet className="w-3.5 h-3.5 text-[#176B50]" />;
      case 'error':
      case 'failed':
        return <AlertCircle className="w-3.5 h-3.5 text-[#A33A32]" />;
      default:
        return <FileText className="w-3.5 h-3.5 text-[#626B64]" />;
    }
  };

  const activeBox = activeHighlightKey && extraction?.field_metadata?.[activeHighlightKey]?.boundingBox;

  return (
    <div className="space-y-6 max-w-[1400px] mx-auto pb-12">
      {/* Top Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#E2E6E1]">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => navigate('/app/documents')}
            className="p-1.5 text-[#626B64] hover:text-[#202722] hover:bg-[#F7F8F6] rounded-[4px] transition-colors"
            title="Return to Documents"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-[18px] font-bold text-[#202722] tracking-tight">
                {document.original_filename}
              </h1>
              <span
                className={`inline-flex items-center px-2 py-0.5 rounded-[3px] text-[11px] font-mono font-medium ${
                  document.status === 'approved'
                    ? 'bg-[#EDF4EF] text-[#176B50] border border-[#176B50]/30 font-semibold'
                    : document.status === 'review_required'
                    ? 'bg-[#FFFBEB] text-[#B45309] border border-[#FDE68A]'
                    : document.status === 'rejected' || document.status === 'failed'
                    ? 'bg-[#FEF2F2] text-[#A33A32] border border-[#FECACA]'
                    : 'bg-[#F7F8F6] text-[#626B64] border border-[#E2E6E1]'
                }`}
              >
                Status: {document.status.replace('_', ' ')}
              </span>
            </div>
            <p className="text-[11px] font-mono text-[#626B64] mt-0.5">
              ID: {document.id} • {formatFileSize(document.file_size_bytes)} • Uploaded {new Date(document.created_at).toLocaleString('en-GB')}
            </p>
          </div>
        </div>

        {/* Global Controls */}
        <div className="flex items-center gap-2 flex-wrap">
          {previewSignedUrl && (
            <a
              href={previewSignedUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-[12px] font-medium text-[#202722] bg-[#FFFFFF] hover:bg-[#F7F8F6] border border-[#E2E6E1] rounded-[4px] transition-colors"
            >
              <Download className="w-3.5 h-3.5 text-[#626B64]" />
              <span>Download Original</span>
            </a>
          )}

          {(document.status === 'uploaded' || document.status === 'failed' || document.status === 'review_required') && (
            <button
              type="button"
              disabled={isProcessing}
              onClick={handleRunProcessing}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-[12px] font-medium text-white bg-[#176B50] hover:bg-[#12563F] rounded-[4px] transition-colors focus-ring disabled:opacity-50"
            >
              <RotateCw className={`w-3.5 h-3.5 ${isProcessing ? 'animate-spin' : ''}`} />
              <span>{isProcessing ? 'Processing Pipeline...' : extraction ? 'Re-run Extraction' : 'Extract & Validate'}</span>
            </button>
          )}

          {document.status === 'review_required' && (
            <>
              <button
                type="button"
                onClick={handleReject}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-[12px] font-medium text-[#A33A32] bg-[#FFFFFF] hover:bg-[#FEF2F2] border border-[#A33A32]/30 rounded-[4px] transition-colors"
              >
                <XCircle className="w-3.5 h-3.5" />
                <span>Reject</span>
              </button>

              <button
                type="button"
                onClick={handleApprove}
                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-[12px] font-medium text-white bg-[#176B50] hover:bg-[#12563F] rounded-[4px] transition-colors shadow-sm"
              >
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Approve Invoice</span>
              </button>
            </>
          )}
        </div>
      </div>

      {/* Action Notification Banner */}
      {actionNotice && (
        <div
          className={`p-3 rounded-[4px] text-[13px] border flex items-center justify-between ${
            actionNotice.type === 'success'
              ? 'bg-[#EDF4EF] border-[#176B50]/30 text-[#176B50]'
              : 'bg-[#FEF2F2] border-[#A33A32]/30 text-[#A33A32]'
          }`}
        >
          <span>{actionNotice.text}</span>
          <button
            type="button"
            onClick={() => setActionNotice(null)}
            className="text-xs opacity-70 hover:opacity-100 font-bold ml-4"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Validation Discrepancies Alert */}
      {customerIssues.length > 0 && (
        <div className="bg-[#FFFFFF] border border-[#E2E6E1] rounded-[6px] p-4 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-[#B45309]" />
              <h2 className="text-[13px] font-bold text-[#202722] uppercase tracking-wider">
                Audit Validation Discrepancies ({customerIssues.length})
              </h2>
            </div>
            <span className="text-[11px] font-mono text-[#626B64]">
              Human review required before certification
            </span>
          </div>

          <div className="space-y-2 mt-3">
            {customerIssues.map((issue) => (
              <div
                key={issue.id}
                className={`p-2.5 rounded-[4px] text-[12px] border flex items-start gap-2.5 ${
                  issue.severity === 'error'
                    ? 'bg-[#FEF2F2]/60 border-[#A33A32]/30 text-[#202722]'
                    : issue.severity === 'warning'
                    ? 'bg-[#FFFBEB]/60 border-[#FDE68A] text-[#202722]'
                    : 'bg-[#F7F8F6] border-[#E2E6E1] text-[#202722]'
                }`}
              >
                <span
                  className={`px-1.5 py-0.5 rounded-[2px] font-mono uppercase text-[9px] font-bold mt-0.5 flex-shrink-0 ${
                    issue.severity === 'error'
                      ? 'bg-[#A33A32] text-white'
                      : issue.severity === 'warning'
                      ? 'bg-[#B45309] text-white'
                      : 'bg-[#626B64] text-white'
                  }`}
                >
                  {issue.issue_type.replace('_', ' ')}
                </span>
                <p className="leading-relaxed flex-grow text-[#202722]">{issue.message}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Main Two-Panel Interface */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Panel: Original Document Viewer */}
        <div className="lg:col-span-5 bg-[#FFFFFF] border border-[#E2E6E1] rounded-[6px] shadow-sm flex flex-col overflow-hidden">
          <div className="p-3 bg-[#F7F8F6] border-b border-[#E2E6E1] flex items-center justify-between text-xs">
            <div className="flex items-center gap-1.5 text-[#202722] font-semibold">
              <Eye className="w-3.5 h-3.5 text-[#176B50]" />
              <span>Document Scan Source</span>
            </div>
            {activeHighlightKey && (
              <span className="text-[11px] font-mono text-[#176B50] bg-[#EDF4EF] px-1.5 py-0.5 rounded-[2px]">
                Tracing: {activeHighlightKey}
              </span>
            )}
          </div>

          <div className="relative bg-[#202722]/5 min-h-[500px] flex items-center justify-center p-2 overflow-auto">
            {previewSignedUrl ? (
              document.mime_type === 'application/pdf' ? (
                <div className="relative w-full h-[650px]">
                  <iframe
                    src={`${previewSignedUrl}#toolbar=0`}
                    title="Invoice PDF Viewer"
                    className="w-full h-full rounded-[4px] border border-[#E2E6E1]"
                  />
                  {/* Bounding box visual overlay */}
                  {activeBox && (
                    <div
                      className="absolute border-2 border-[#176B50] bg-[#176B50]/15 pointer-events-none transition-all duration-200 z-10"
                      style={{
                        left: `${activeBox.x}%`,
                        top: `${activeBox.y}%`,
                        width: `${activeBox.width}%`,
                        height: `${activeBox.height}%`,
                      }}
                    >
                      <span className="absolute -top-5 left-0 text-[10px] bg-[#176B50] text-white px-1 py-0.2 rounded font-mono">
                        {activeHighlightKey}
                      </span>
                    </div>
                  )}
                </div>
              ) : (
                <div className="relative max-w-full">
                  <img
                    src={previewSignedUrl}
                    alt="Invoice scan preview"
                    className="max-h-[650px] object-contain rounded-[4px] border border-[#E2E6E1]"
                  />
                  {activeBox && (
                    <div
                      className="absolute border-2 border-[#176B50] bg-[#176B50]/15 pointer-events-none transition-all duration-200"
                      style={{
                        left: `${activeBox.x}%`,
                        top: `${activeBox.y}%`,
                        width: `${activeBox.width}%`,
                        height: `${activeBox.height}%`,
                      }}
                    />
                  )}
                </div>
              )
            ) : (
              <div className="p-8 text-center text-[12px] text-[#626B64]">
                <FileText className="w-8 h-8 text-[#626B64] mx-auto mb-2 opacity-50" />
                <p>Preview loading...</p>
              </div>
            )}
          </div>
        </div>

        {/* Right Panel: Extracted Fields Review & Correction Console */}
        <div className="lg:col-span-7 space-y-4">
          {!extraction ? (
            document.status === 'failed' ? (
              <div className="p-8 bg-[#FFFFFF] border border-[#FECACA] rounded-[6px] text-center space-y-3">
                <AlertCircle className="w-8 h-8 text-[#A33A32] mx-auto opacity-90" />
                <div>
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-[3px] text-[11px] font-medium bg-[#FEF2F2] text-[#991B1B] border border-[#FCA5A5] font-semibold">
                    Extraction failed — try again.
                  </span>
                </div>
                <h3 className="text-[15px] font-bold text-[#202722]">Extraction Failed</h3>
                <p className="text-[13px] text-[#626B64] max-w-md mx-auto">
                  The automated extraction pipeline could not process this document. You can retry the extraction or inspect the scan manually.
                </p>
                <button
                  type="button"
                  disabled={isProcessing}
                  onClick={handleRunProcessing}
                  className="inline-flex items-center gap-1.5 px-4 py-2 text-[13px] font-medium text-white bg-[#176B50] hover:bg-[#12563F] rounded-[4px] transition-colors focus-ring"
                >
                  <RotateCw className={`w-4 h-4 ${isProcessing ? 'animate-spin' : ''}`} />
                  <span>{isProcessing ? 'Processing Pipeline...' : 'Retry Extraction'}</span>
                </button>
              </div>
            ) : (
              <div className="p-8 bg-[#FFFFFF] border border-[#E2E6E1] rounded-[6px] text-center space-y-3">
                <FileText className="w-8 h-8 text-[#176B50] mx-auto opacity-70" />
                <h3 className="text-[15px] font-bold text-[#202722]">Invoice Metadata Registered</h3>
                <p className="text-[13px] text-[#626B64] max-w-md mx-auto">
                  This document is ready for extraction. Click <strong>Extract & Validate</strong> to queue automated field
                  extraction, arithmetic cross-sum validation, and duplicate detection.
                </p>
                <button
                  type="button"
                  disabled={isProcessing}
                  onClick={handleRunProcessing}
                  className="inline-flex items-center gap-1.5 px-4 py-2 text-[13px] font-medium text-white bg-[#176B50] hover:bg-[#12563F] rounded-[4px] transition-colors focus-ring"
                >
                  <RotateCw className={`w-4 h-4 ${isProcessing ? 'animate-spin' : ''}`} />
                  <span>{isProcessing ? 'Processing Pipeline...' : 'Run Extraction & Validation'}</span>
                </button>
              </div>
            )
          ) : (
            <div className="bg-[#FFFFFF] border border-[#E2E6E1] rounded-[6px] p-5 shadow-sm space-y-5">
              <div className="flex items-center justify-between pb-3 border-b border-[#E2E6E1]">
                <div>
                  <h2 className="text-[14px] font-bold text-[#202722] uppercase tracking-wider">
                    Extracted Intelligence & Review Console
                  </h2>
                  {extractionState && (
                    <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-[3px] text-[11px] font-medium border font-semibold ${extractionState.badgeClass}`}
                      >
                        {extractionState.label}
                      </span>
                    </div>
                  )}
                </div>

                <button
                  type="button"
                  disabled={isSaving}
                  onClick={handleSaveCorrections}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 text-[12px] font-medium text-[#202722] bg-[#F7F8F6] hover:bg-[#EDF4EF] border border-[#E2E6E1] rounded-[4px] transition-colors"
                >
                  <Save className="w-3.5 h-3.5 text-[#176B50]" />
                  <span>{isSaving ? 'Saving...' : 'Save Corrections'}</span>
                </button>
              </div>

              {/* Partial Extraction Warning Banner */}
              {extractionState?.status === 'partial' && (
                <div className="p-3 bg-[#FFFBEB] border border-[#FDE68A] rounded-[4px] text-[12px] text-[#92400E] flex items-start gap-2.5">
                  <AlertTriangle className="w-4 h-4 text-[#B45309] flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="font-bold">Partial Extraction Notice</p>
                    <p className="mt-0.5 text-[11px] text-[#B45309] leading-relaxed">
                      Automated visual extraction was partially complete. Please inspect and verify all fields against the source scan before certifying or approving.
                    </p>
                  </div>
                </div>
              )}

              {/* General Metadata Fields */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-left">
                {/* Supplier Name */}
                <div
                  onMouseEnter={() => setActiveHighlightKey('supplier_name')}
                  onMouseLeave={() => setActiveHighlightKey(null)}
                  className="p-3 bg-[#F7F8F6] rounded-[4px] border border-[#E2E6E1] transition-colors focus-within:border-[#176B50]"
                >
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-[11px] font-bold uppercase tracking-wider text-[#626B64] flex items-center gap-1">
                      <Building className="w-3 h-3 text-[#176B50]" />
                      Supplier Name
                    </label>
                    <span className="text-[10px] font-mono text-[#176B50] bg-[#EDF4EF] px-1 rounded">
                      {extraction.field_metadata?.supplier_name?.confidence || 'high'}
                    </span>
                  </div>
                  <input
                    type="text"
                    value={formData.supplier_name || ''}
                    onChange={(e) => setFormData({ ...formData, supplier_name: e.target.value })}
                    className="w-full text-[13px] font-medium bg-[#FFFFFF] border border-[#E2E6E1] rounded-[3px] px-2.5 py-1 text-[#202722] focus:border-[#176B50] outline-none"
                  />
                </div>

                {/* Invoice Number */}
                <div
                  onMouseEnter={() => setActiveHighlightKey('invoice_number')}
                  onMouseLeave={() => setActiveHighlightKey(null)}
                  className="p-3 bg-[#F7F8F6] rounded-[4px] border border-[#E2E6E1] transition-colors focus-within:border-[#176B50]"
                >
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-[11px] font-bold uppercase tracking-wider text-[#626B64] flex items-center gap-1">
                      <Hash className="w-3 h-3 text-[#176B50]" />
                      Invoice Number
                    </label>
                    <span className="text-[10px] font-mono text-[#176B50] bg-[#EDF4EF] px-1 rounded">
                      {extraction.field_metadata?.invoice_number?.confidence || 'high'}
                    </span>
                  </div>
                  <input
                    type="text"
                    value={formData.invoice_number || ''}
                    onChange={(e) => setFormData({ ...formData, invoice_number: e.target.value })}
                    className="w-full text-[13px] font-mono font-medium bg-[#FFFFFF] border border-[#E2E6E1] rounded-[3px] px-2.5 py-1 text-[#202722] focus:border-[#176B50] outline-none"
                  />
                </div>

                {/* Invoice Date */}
                <div
                  onMouseEnter={() => setActiveHighlightKey('invoice_date')}
                  onMouseLeave={() => setActiveHighlightKey(null)}
                  className="p-3 bg-[#F7F8F6] rounded-[4px] border border-[#E2E6E1] transition-colors focus-within:border-[#176B50]"
                >
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-[11px] font-bold uppercase tracking-wider text-[#626B64] flex items-center gap-1">
                      <Calendar className="w-3 h-3 text-[#176B50]" />
                      Invoice Date
                    </label>
                    <span className="text-[10px] font-mono text-[#176B50] bg-[#EDF4EF] px-1 rounded">
                      {extraction.field_metadata?.invoice_date?.confidence || 'high'}
                    </span>
                  </div>
                  <input
                    type="date"
                    value={formData.invoice_date || ''}
                    onChange={(e) => setFormData({ ...formData, invoice_date: e.target.value })}
                    className="w-full text-[13px] font-mono bg-[#FFFFFF] border border-[#E2E6E1] rounded-[3px] px-2.5 py-1 text-[#202722] focus:border-[#176B50] outline-none"
                  />
                </div>

                {/* Due Date */}
                <div
                  onMouseEnter={() => setActiveHighlightKey('due_date')}
                  onMouseLeave={() => setActiveHighlightKey(null)}
                  className="p-3 bg-[#F7F8F6] rounded-[4px] border border-[#E2E6E1] transition-colors focus-within:border-[#176B50]"
                >
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-[11px] font-bold uppercase tracking-wider text-[#626B64] flex items-center gap-1">
                      <Calendar className="w-3 h-3 text-[#176B50]" />
                      Payment Due Date
                    </label>
                    <span className="text-[10px] font-mono text-[#B45309] bg-[#FFFBEB] px-1 rounded">
                      {extraction.field_metadata?.due_date?.confidence || 'medium'}
                    </span>
                  </div>
                  <input
                    type="date"
                    value={formData.due_date || ''}
                    onChange={(e) => setFormData({ ...formData, due_date: e.target.value })}
                    className="w-full text-[13px] font-mono bg-[#FFFFFF] border border-[#E2E6E1] rounded-[3px] px-2.5 py-1 text-[#202722] focus:border-[#176B50] outline-none"
                  />
                </div>

                {/* Currency */}
                <div className="p-3 bg-[#F7F8F6] rounded-[4px] border border-[#E2E6E1]">
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-[#626B64] mb-1">
                    Currency Code
                  </label>
                  <input
                    type="text"
                    value={formData.currency || 'USD'}
                    onChange={(e) => setFormData({ ...formData, currency: e.target.value.toUpperCase() })}
                    className="w-full text-[13px] font-mono uppercase bg-[#FFFFFF] border border-[#E2E6E1] rounded-[3px] px-2.5 py-1 text-[#202722] outline-none"
                  />
                </div>

                {/* Tax ID */}
                <div className="p-3 bg-[#F7F8F6] rounded-[4px] border border-[#E2E6E1]">
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-[#626B64] mb-1">
                    Supplier Tax ID / TIN
                  </label>
                  <input
                    type="text"
                    value={formData.supplier_tax_id || ''}
                    onChange={(e) => setFormData({ ...formData, supplier_tax_id: e.target.value })}
                    className="w-full text-[13px] font-mono bg-[#FFFFFF] border border-[#E2E6E1] rounded-[3px] px-2.5 py-1 text-[#202722] outline-none"
                  />
                </div>
              </div>

              {/* Line Items Table */}
              <div className="pt-2">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-[12px] font-bold uppercase tracking-wider text-[#202722] flex items-center gap-1.5">
                    <Tag className="w-3.5 h-3.5 text-[#176B50]" />
                    Extracted Line Items ({(formData.line_items || []).length})
                  </h3>
                  <button
                    type="button"
                    onClick={handleAddLineItem}
                    className="inline-flex items-center gap-1 text-[11px] font-medium text-[#176B50] hover:underline"
                  >
                    <Plus className="w-3 h-3" />
                    <span>Add Item</span>
                  </button>
                </div>

                <div className="border border-[#E2E6E1] rounded-[4px] overflow-x-auto">
                  <table className="w-full text-left text-[12px]">
                    <thead className="bg-[#F7F8F6] text-[#626B64] font-semibold border-b border-[#E2E6E1]">
                      <tr>
                        <th className="py-2 px-3">Description</th>
                        <th className="py-2 px-3 w-16 text-right">Qty</th>
                        <th className="py-2 px-3 w-28 text-right">Unit Price</th>
                        <th className="py-2 px-3 w-28 text-right">Total</th>
                        <th className="py-2 px-2 w-10 text-center"></th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#E2E6E1]">
                      {(formData.line_items || []).map((item, idx) => (
                        <tr key={item.id || idx} className="hover:bg-[#F7F8F6]/50">
                          <td className="py-1.5 px-3">
                            <input
                              type="text"
                              value={item.description}
                              onChange={(e) => handleLineItemChange(idx, 'description', e.target.value)}
                              className="w-full bg-transparent border-none text-[#202722] text-[12px] outline-none focus:bg-[#FFFFFF] focus:ring-1 focus:ring-[#176B50] rounded px-1"
                            />
                          </td>
                          <td className="py-1.5 px-3 text-right">
                            <input
                              type="number"
                              step="any"
                              value={item.quantity}
                              onChange={(e) => handleLineItemChange(idx, 'quantity', parseFloat(e.target.value) || 0)}
                              className="w-14 text-right font-mono bg-transparent border-none text-[#202722] text-[12px] outline-none focus:bg-[#FFFFFF] focus:ring-1 focus:ring-[#176B50] rounded px-1"
                            />
                          </td>
                          <td className="py-1.5 px-3 text-right">
                            <input
                              type="number"
                              step="any"
                              value={item.unit_price}
                              onChange={(e) => handleLineItemChange(idx, 'unit_price', parseFloat(e.target.value) || 0)}
                              className="w-24 text-right font-mono bg-transparent border-none text-[#202722] text-[12px] outline-none focus:bg-[#FFFFFF] focus:ring-1 focus:ring-[#176B50] rounded px-1"
                            />
                          </td>
                          <td className="py-1.5 px-3 text-right font-mono font-medium text-[#202722]">
                            {item.total.toFixed(2)}
                          </td>
                          <td className="py-1.5 px-2 text-center">
                            <button
                              type="button"
                              onClick={() => handleRemoveLineItem(idx)}
                              className="text-[#626B64] hover:text-[#A33A32] p-1"
                              title="Delete Item"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Financial Cross-Sums & Totals */}
              <div className="pt-2 border-t border-[#E2E6E1]">
                <div className="flex flex-col items-end space-y-2 text-[13px]">
                  <div className="flex items-center gap-4 w-full sm:w-72 justify-between">
                    <span className="text-[#626B64]">Subtotal:</span>
                    <input
                      type="number"
                      step="any"
                      value={formData.subtotal ?? ''}
                      onChange={(e) => setFormData({ ...formData, subtotal: parseFloat(e.target.value) || 0 })}
                      className="w-32 text-right font-mono font-medium bg-[#F7F8F6] border border-[#E2E6E1] rounded px-2 py-0.5 outline-none"
                    />
                  </div>

                  <div className="flex items-center gap-4 w-full sm:w-72 justify-between">
                    <span className="text-[#626B64]">Tax Amount:</span>
                    <input
                      type="number"
                      step="any"
                      value={formData.tax_amount ?? ''}
                      onChange={(e) => setFormData({ ...formData, tax_amount: parseFloat(e.target.value) || 0 })}
                      className="w-32 text-right font-mono font-medium bg-[#F7F8F6] border border-[#E2E6E1] rounded px-2 py-0.5 outline-none"
                    />
                  </div>

                  <div className="flex items-center gap-4 w-full sm:w-72 justify-between pt-2 border-t border-[#E2E6E1]">
                    <span className="font-bold text-[#202722]">Grand Total ({formData.currency}):</span>
                    <input
                      type="number"
                      step="any"
                      value={formData.grand_total ?? ''}
                      onChange={(e) => setFormData({ ...formData, grand_total: parseFloat(e.target.value) || 0 })}
                      className="w-32 text-right font-mono font-bold text-[#176B50] bg-[#EDF4EF] border border-[#176B50]/30 rounded px-2 py-1 outline-none text-[14px]"
                    />
                  </div>
                </div>
              </div>

              {/* Save Changes Prompt */}
              <div className="pt-3 border-t border-[#E2E6E1] flex items-center justify-between">
                <span className="text-[12px] text-[#626B64]">
                  Reviewer edits are logged to the immutable workspace audit trail.
                </span>
                <button
                  type="button"
                  disabled={isSaving}
                  onClick={handleSaveCorrections}
                  className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-[12px] font-medium text-white bg-[#176B50] hover:bg-[#12563F] rounded-[4px] transition-colors"
                >
                  <Save className="w-3.5 h-3.5" />
                  <span>{isSaving ? 'Saving...' : 'Save Corrections'}</span>
                </button>
              </div>
            </div>
          )}

          {/* Audit Event History */}
          {auditEvents.length > 0 && (
            <div className="bg-[#FFFFFF] border border-[#E2E6E1] rounded-[6px] p-4 shadow-sm space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-[12px] font-bold text-[#202722] uppercase tracking-wider flex items-center gap-1.5">
                  <History className="w-3.5 h-3.5 text-[#176B50]" />
                  Document Lifecycle & Audit Trail ({auditEvents.length})
                </h3>
                <button
                  type="button"
                  onClick={() => setShowTechnicalAudit(!showTechnicalAudit)}
                  className="text-[11px] font-mono text-[#176B50] hover:underline"
                >
                  {showTechnicalAudit ? 'Hide Technical Diagnostics' : 'View Technical Diagnostics'}
                </button>
              </div>

              {/* Customer-Facing Clean Timeline */}
              <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
                {auditEvents.map((evt) => {
                  const formatted = formatAuditEvent(evt);
                  return (
                    <div
                      key={evt.id}
                      className="p-2.5 bg-[#F7F8F6] rounded-[4px] border border-[#E2E6E1] flex items-start justify-between gap-3 text-[12px]"
                    >
                      <div className="flex items-start gap-2.5">
                        <div className="mt-0.5 flex-shrink-0">
                          {renderAuditIcon(formatted.iconType)}
                        </div>
                        <div>
                          <p className="font-semibold text-[#202722]">{formatted.title}</p>
                          <p className="text-[11px] text-[#626B64] mt-0.5 leading-relaxed">
                            {formatted.description}
                          </p>
                        </div>
                      </div>
                      <span className="text-[#626B64] text-[10px] font-mono whitespace-nowrap flex-shrink-0">
                        {new Date(evt.created_at).toLocaleString('en-GB')}
                      </span>
                    </div>
                  );
                })}
              </div>

              {/* Collapsible Technical Diagnostics (for debugging & engineering accountability) */}
              {showTechnicalAudit && (
                <div className="mt-3 pt-3 border-t border-[#E2E6E1] space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-mono font-bold text-[#626B64] uppercase">
                      Technical Diagnostics & Raw Event Stream
                    </span>
                    <span className="text-[10px] font-mono text-[#626B64]">
                      Internal system logs & provider attributions
                    </span>
                  </div>
                  <div className="space-y-1.5 max-h-48 overflow-y-auto bg-[#202722] text-[#E2E6E1] p-2.5 rounded-[4px] font-mono text-[10px]">
                    {auditEvents.map((evt) => (
                      <div key={`tech-${evt.id}`} className="py-1 border-b border-[#333E35] last:border-0">
                        <div className="flex items-center justify-between text-[#8E9B90]">
                          <span className="text-[#4ADE80] font-semibold">{evt.event_type}</span>
                          <span>{new Date(evt.created_at).toISOString()}</span>
                        </div>
                        {evt.actor_id && (
                          <div className="text-[#A5B4A8]">Actor ID: {evt.actor_id}</div>
                        )}
                        {evt.details && (
                          <pre className="text-[#D1D5DB] whitespace-pre-wrap break-all mt-0.5">
                            {JSON.stringify(evt.details, null, 2)}
                          </pre>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
