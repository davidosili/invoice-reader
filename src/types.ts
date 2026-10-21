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

// ----------------------------------------------------------------------------
// Phase 2: Invoice Intelligence Types
// ----------------------------------------------------------------------------

export interface BoundingBox {
  x: number; // percentage (0 - 100)
  y: number; // percentage (0 - 100)
  width: number; // percentage (0 - 100)
  height: number; // percentage (0 - 100)
}

export interface ExtractionFieldMeta {
  confidence: 'high' | 'medium' | 'review';
  rawText: string;
  boundingBox?: BoundingBox;
}

export interface ExtractionLineItem {
  id: string;
  description: string;
  quantity: number;
  unit_price: number;
  total: number;
  verified?: boolean;
  boundingBox?: BoundingBox;
}

export interface InvoiceExtractionRecord {
  id: string;
  document_id: string;
  workspace_id: string;
  version: number;
  supplier_name: string | null;
  supplier_address: string | null;
  supplier_tax_id: string | null;
  customer_name: string | null;
  customer_address: string | null;
  invoice_number: string | null;
  invoice_date: string | null;
  due_date: string | null;
  currency: string;
  purchase_order_number: string | null;
  subtotal: number | null;
  tax_rate: number | null;
  tax_amount: number | null;
  discount_amount: number;
  shipping_amount: number;
  grand_total: number | null;
  payment_terms: string | null;
  line_items: ExtractionLineItem[];
  field_metadata: Record<string, ExtractionFieldMeta>;
  raw_extraction?: any;
  extractor_provider: string;
  is_latest: boolean;
  created_at: string;
  updated_at: string;
}

export type ValidationIssueType =
  | 'arithmetic_discrepancy'
  | 'missing_field'
  | 'date_inconsistency'
  | 'duplicate_warning'
  | 'format_warning';

export type ValidationSeverity = 'error' | 'warning' | 'info';

export interface InvoiceValidationIssue {
  id: string;
  document_id: string;
  workspace_id: string;
  issue_type: ValidationIssueType;
  severity: ValidationSeverity;
  field_key: string | null;
  message: string;
  details?: Record<string, any> | null;
  resolved: boolean;
  created_at: string;
}

export type AuditEventType =
  | 'processing_queued'
  | 'processing_started'
  | 'extraction_completed'
  | 'validation_failed'
  | 'processing_failed'
  | 'field_corrected'
  | 'approved'
  | 'rejected'
  | 'exported'
  | 'reprocessed';

export interface InvoiceAuditEvent {
  id: string;
  document_id: string;
  workspace_id: string;
  actor_id: string | null;
  event_type: AuditEventType;
  details?: Record<string, any> | null;
  created_at: string;
}

export interface ProcessInvoiceResponse {
  success: boolean;
  documentId: string;
  status: DocumentStatus;
  extraction?: InvoiceExtractionRecord;
  issues?: InvoiceValidationIssue[];
  error?: string;
}


