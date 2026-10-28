import React, { useState, useRef } from 'react';
import { UploadCloud, X, FileText, AlertCircle, AlertTriangle, ShieldCheck } from 'lucide-react';
import { uploadInvoiceDocument, validateFileSignature } from '../lib/api';
import { DocumentRecord } from '../types';

interface DocumentUploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  workspaceId: string;
  userId: string;
  existingFilenames?: string[];
  onUploadSuccess: (newDocument: DocumentRecord) => void;
}

export const DocumentUploadModal: React.FC<DocumentUploadModalProps> = ({
  isOpen,
  onClose,
  workspaceId,
  userId,
  existingFilenames = [],
  onUploadSuccess,
}) => {
  const [dragActive, setDragActive] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [duplicateWarning, setDuplicateWarning] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<number>(0);
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const handleFileSelection = async (file: File) => {
    setError(null);
    setDuplicateWarning(null);

    // Validate size (max 20MB)
    const MAX_SIZE = 20 * 1024 * 1024;
    if (file.size > MAX_SIZE) {
      setError(`Selected file (${(file.size / (1024 * 1024)).toFixed(1)}MB) exceeds the 20MB limit.`);
      return;
    }

    // Validate MIME extension
    const allowed = ['application/pdf', 'image/jpeg', 'image/png'];
    if (!allowed.includes(file.type)) {
      setError('Unsupported file type. Please select a PDF, JPG, or PNG invoice document.');
      return;
    }

    // Validate magic bytes in browser
    const check = await validateFileSignature(file);
    if (!check.valid) {
      setError(check.error || 'File content signature does not match a valid document structure.');
      return;
    }

    // Check duplicate filename warning (non-blocking warning)
    if (existingFilenames.some((name) => name.toLowerCase() === file.name.toLowerCase())) {
      setDuplicateWarning(
        `A document with the filename "${file.name}" already exists in this workspace. Duplicate filenames are allowed, but please confirm this is not an unintentional duplicate upload.`
      );
    }

    setSelectedFile(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileSelection(e.dataTransfer.files[0]);
    }
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleUpload = async () => {
    if (!selectedFile || isUploading) return;

    setIsUploading(true);
    setError(null);
    setUploadProgress(20);

    try {
      setUploadProgress(50);
      const newDoc = await uploadInvoiceDocument(selectedFile, workspaceId, userId);
      setUploadProgress(100);

      // Trigger success callback and close modal
      onUploadSuccess(newDoc);
      handleClose();
    } catch (err: any) {
      setError(err.message || 'Upload encountered a technical failure. Please retry.');
      setUploadProgress(0);
    } finally {
      setIsUploading(false);
    }
  };

  const handleClose = () => {
    if (isUploading) return; // Prevent closing mid-upload
    setSelectedFile(null);
    setError(null);
    setDuplicateWarning(null);
    setUploadProgress(0);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-[2px] flex items-center justify-center p-4">
      <div className="bg-[#FFFFFF] border border-[#DDD7CD] rounded-[2px] shadow-2xl max-w-lg w-full overflow-hidden">
        {/* Header */}
        <div className="px-5 py-4 border-b border-[#E2DFD7] flex items-center justify-between bg-[#FAFAF8]">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-[2px] bg-[#111318] flex items-center justify-center text-white">
              <UploadCloud className="w-3.5 h-3.5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-mono text-[9px] uppercase px-1 py-0.2 bg-[#F6F5F1] border border-[#DDD7CD] text-[#5A5852]">
                  INGESTION
                </span>
                <h3 className="text-[15px] font-bold text-[#111318] tracking-tight">
                  Upload Supplier Invoice
                </h3>
              </div>
            </div>
          </div>
          <button
            type="button"
            disabled={isUploading}
            onClick={handleClose}
            className="text-[#5A5852] hover:text-[#111318] p-1 rounded-[2px] transition-colors disabled:opacity-50"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 space-y-4">
          {error && (
            <div className="p-3 bg-[#FEF2F2] border border-[#FECACA] rounded-[2px] flex items-start gap-2 text-[12px] text-[#9B2C2C]">
              <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {duplicateWarning && (
            <div className="p-3 bg-[#FFFBEB] border border-[#FED7AA] rounded-[2px] flex items-start gap-2 text-[12px] text-[#C2410C]">
              <AlertTriangle className="w-4 h-4 flex-shrink-0 mt-0.5" />
              <span>{duplicateWarning}</span>
            </div>
          )}

          {/* Drag & Drop Upload Zone with Alignment Marks */}
          <div
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
            onClick={() => !isUploading && fileInputRef.current?.click()}
            className={`relative border border-dashed rounded-[2px] p-8 text-center cursor-pointer transition-all ${
              dragActive
                ? 'border-[#1D4ED8] bg-[#EFF6FF]'
                : 'border-[#DDD7CD] hover:border-[#111318] bg-[#F6F5F1]/60'
            }`}
          >
            {/* Registration Corner Ticks */}
            <span className="absolute top-1 left-1.5 font-mono text-[9px] text-[#DDD7CD] select-none pointer-events-none">+</span>
            <span className="absolute top-1 right-1.5 font-mono text-[9px] text-[#DDD7CD] select-none pointer-events-none">+</span>
            <span className="absolute bottom-1 left-1.5 font-mono text-[9px] text-[#DDD7CD] select-none pointer-events-none">+</span>
            <span className="absolute bottom-1 right-1.5 font-mono text-[9px] text-[#DDD7CD] select-none pointer-events-none">+</span>

            <input
              ref={fileInputRef}
              type="file"
              accept=".pdf,.jpg,.jpeg,.png,application/pdf,image/jpeg,image/png"
              onChange={(e) => {
                if (e.target.files && e.target.files[0]) {
                  handleFileSelection(e.target.files[0]);
                }
              }}
              className="hidden"
            />

            <UploadCloud className="w-7 h-7 text-[#5A5852] mx-auto mb-2" />
            <p className="text-[13px] font-semibold text-[#111318]">
              Click to select or drag and drop invoice scan
            </p>
            <p className="text-[11px] font-mono text-[#5A5852] mt-1">
              SUPPORTED: PDF, JPG, PNG • MAXIMUM LIMIT: 20MB
            </p>
          </div>

          {/* Selected File Details */}
          {selectedFile && (
            <div className="p-3 bg-[#FFFFFF] border border-[#E2DFD7] rounded-[2px] flex items-center justify-between">
              <div className="flex items-center gap-2.5 truncate pr-2">
                <FileText className="w-4 h-4 text-[#1D4ED8] flex-shrink-0" />
                <div className="truncate">
                  <p className="text-[13px] font-medium text-[#111318] truncate">{selectedFile.name}</p>
                  <p className="text-[11px] font-mono text-[#5A5852]">
                    {(selectedFile.size / 1024).toFixed(1)} KB • {selectedFile.type || 'Document'}
                  </p>
                </div>
              </div>

              {!isUploading && (
                <button
                  type="button"
                  onClick={() => setSelectedFile(null)}
                  className="text-[#5A5852] hover:text-[#9B2C2C] p-1"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
          )}

          {/* Upload Progress Bar */}
          {isUploading && (
            <div className="space-y-1.5 pt-1">
              <div className="flex justify-between text-[11px] font-mono text-[#5A5852]">
                <span>ENCRYPTING & ATTESTING TO PRIVATE VAULT...</span>
                <span>{uploadProgress}%</span>
              </div>
              <div className="w-full h-1 bg-[#E2DFD7] overflow-hidden">
                <div
                  className="h-full bg-[#111318] transition-all duration-300"
                  style={{ width: `${uploadProgress}%` }}
                />
              </div>
            </div>
          )}

          {/* Security & Verification Guarantee */}
          <div className="pt-2 border-t border-[#E2DFD7] flex items-center gap-2 text-[11px] text-[#5A5852]">
            <ShieldCheck className="w-3.5 h-3.5 text-[#1B4938] flex-shrink-0" />
            <span>Encrypted workspace isolation with row-level security. Never shared across tenants.</span>
          </div>
        </div>

        {/* Footer */}
        <div className="px-5 py-3.5 bg-[#FAFAF8] border-t border-[#E2DFD7] flex justify-end gap-2.5">
          <button
            type="button"
            disabled={isUploading}
            onClick={handleClose}
            className="px-4 py-2 text-[12px] font-medium text-[#111318] hover:bg-[#FFFFFF] border border-[#DDD7CD] rounded-[2px] transition-colors disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            type="button"
            disabled={!selectedFile || isUploading}
            onClick={handleUpload}
            className="px-4 py-2 text-[12px] font-semibold text-white bg-[#111318] hover:bg-[#1D4ED8] rounded-[2px] transition-colors focus-ring disabled:opacity-50"
          >
            {isUploading ? 'Registering...' : 'Confirm & Upload'}
          </button>
        </div>
      </div>
    </div>
  );
};
