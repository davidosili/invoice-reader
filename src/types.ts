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
