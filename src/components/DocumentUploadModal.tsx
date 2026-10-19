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
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/40 flex items-center justify-center p-4">
      <div className="bg-[#FFFFFF] border border-[#E2E6E1] rounded-[6px] shadow-preview max-w-lg w-full overflow-hidden">
        {/* Header */}
        <div className="px-5 py-4 border-b border-[#E2E6E1] flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-[3px] bg-[#EDF4EF] flex items-center justify-center text-[#176B50]">
              <UploadCloud className="w-3.5 h-3.5" />
            </div>
            <h3 className="text-[16px] font-bold text-[#202722]">
              Upload Supplier Invoice
            </h3>
          </div>
          <button
            type="button"
            disabled={isUploading}
            onClick={handleClose}
            className="text-[#626B64] hover:text-[#202722] p-1 rounded-[3px] transition-colors disabled:opacity-50"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 space-y-4">
          {error && (
            <div className="p-3 bg-[#A33A32]/10 border border-[#A33A32]/30 rounded-[4px] flex items-start gap-2 text-[12px] text-[#A33A32]">
              <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {duplicateWarning && (
            <div className="p-3 bg-[#FFFBEB] border border-[#FDE68A] rounded-[4px] flex items-start gap-2 text-[12px] text-[#B45309]">
              <AlertTriangle className="w-4 h-4 flex-shrink-0 mt-0.5" />
              <span>{duplicateWarning}</span>
            </div>
          )}

          {/* Drag & Drop Upload Zone */}
          <div
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
            onClick={() => !isUploading && fileInputRef.current?.click()}
            className={`border-2 border-dashed rounded-[4px] p-6 text-center cursor-pointer transition-colors ${
              dragActive
                ? 'border-[#176B50] bg-[#EDF4EF]/40'
                : 'border-[#E2E6E1] hover:border-[#176B50]/60 bg-[#F7F8F6]'
            }`}
          >
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

            <UploadCloud className="w-8 h-8 text-[#626B64] mx-auto mb-2" />
            <p className="text-[14px] font-medium text-[#202722]">
              Click to select or drag and drop invoice
            </p>
            <p className="text-[12px] text-[#626B64] mt-1">
              Supported formats: PDF, JPG, PNG (Max 20MB)
            </p>
          </div>

          {/* Selected File Details */}
          {selectedFile && (
            <div className="p-3 bg-[#FFFFFF] border border-[#E2E6E1] rounded-[4px] flex items-center justify-between">
              <div className="flex items-center gap-2.5 truncate pr-2">
                <FileText className="w-4 h-4 text-[#176B50] flex-shrink-0" />
                <div className="truncate">
                  <p className="text-[13px] font-medium text-[#202722] truncate">{selectedFile.name}</p>
                  <p className="text-[11px] text-[#626B64]">
                    {(selectedFile.size / 1024).toFixed(1)} KB • {selectedFile.type || 'Document'}
                  </p>
                </div>
              </div>

              {!isUploading && (
                <button
                  type="button"
                  onClick={() => setSelectedFile(null)}
                  className="text-[#626B64] hover:text-[#A33A32] p-1"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
          )}

          {/* Upload Progress Bar */}
          {isUploading && (
            <div className="space-y-1.5 pt-1">
              <div className="flex justify-between text-[11px] text-[#626B64]">
                <span>Encrypting and uploading to private storage...</span>
                <span className="font-mono">{uploadProgress}%</span>
              </div>
              <div className="w-full h-1.5 bg-[#E2E6E1] rounded-full overflow-hidden">
                <div
                  className="h-full bg-[#176B50] transition-all duration-300"
                  style={{ width: `${uploadProgress}%` }}
                />
              </div>
            </div>
          )}

          {/* Security & Verification Guarantee */}
          <div className="pt-2 border-t border-[#E2E6E1] flex items-center gap-2 text-[11px] text-[#626B64]">
            <ShieldCheck className="w-3.5 h-3.5 text-[#176B50] flex-shrink-0" />
            <span>Files are stored privately in encrypted workspace storage. No public bucket access.</span>
          </div>
        </div>

        {/* Footer */}
        <div className="px-5 py-3.5 bg-[#F7F8F6] border-t border-[#E2E6E1] flex justify-end gap-2.5">
          <button
            type="button"
            disabled={isUploading}
            onClick={handleClose}
            className="px-4 py-2 text-[13px] font-medium text-[#202722] hover:bg-[#FFFFFF] border border-[#E2E6E1] rounded-[4px] transition-colors disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            type="button"
            disabled={!selectedFile || isUploading}
            onClick={handleUpload}
            className="px-4 py-2 text-[13px] font-medium text-white bg-[#176B50] hover:bg-[#12563F] rounded-[4px] transition-colors focus-ring disabled:opacity-50"
          >
            {isUploading ? 'Uploading...' : 'Confirm & Upload'}
          </button>
        </div>
      </div>
    </div>
  );
};
