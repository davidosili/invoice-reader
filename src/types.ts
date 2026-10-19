export interface LineItem {
  id: string;
  description: string;
  quantity: number;
  unitPrice: number;
  total: number;
  verified: boolean;
  fieldId: string;
}

export interface ExtractedField {
  id: string;
  label: string;
  extractedValue: string;
  confidence: 'high' | 'medium' | 'review';
  status: 'verified' | 'warning' | 'pending';
  ruleDetail: string;
  documentLocation: {
    x: number; // percentage
    y: number; // percentage
    width: number;
    height: number;
  };
}

export interface InvoiceMockupData {
  supplierName: string;
  supplierAddress: string;
  supplierTaxId: string;
  recipientName: string;
  recipientAddress: string;
  invoiceNumber: string;
  invoiceDate: string;
  dueDate: string;
  paymentTerms: string;
  currency: string;
  items: LineItem[];
  subtotal: number;
  taxRate: string;
  taxAmount: number;
  totalAmount: number;
  bankAccount: string;
  bankName: string;
}

export type DocumentStatus =
  | 'uploaded'
  | 'queued'
  | 'processing'
  | 'review_required'
  | 'approved'
  | 'rejected'
  | 'failed';

export interface DocumentRecord {
  id: string;
  workspace_id: string;
  uploaded_by: string;
  original_filename: string;
  storage_path: string;
  mime_type: 'application/pdf' | 'image/jpeg' | 'image/png';
  file_size_bytes: number;
  status: DocumentStatus;
  created_at: string;
  updated_at: string;
}

export interface Workspace {
  id: string;
  name: string;
  created_by: string | null;
  created_at: string;
  role?: 'owner' | 'member';
}

export interface WorkspaceMember {
  workspace_id: string;
  user_id: string;
  role: 'owner' | 'member';
  created_at: string;
}

