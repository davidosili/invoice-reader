import React, { useState } from 'react';
import { Check, AlertTriangle, FileText, ArrowRight, ShieldCheck, Search, CornerDownRight } from 'lucide-react';
import { ExtractedField, InvoiceMockupData } from '../types';

const sampleInvoice: InvoiceMockupData = {
  supplierName: "Northstar Office Supplies Ltd.",
  supplierAddress: "Plot 14, Commercial Avenue, Industrial Zone, Ikeja",
  supplierTaxId: "TIN-99482104-001",
  recipientName: "Apex Logistics & Distribution West",
  recipientAddress: "42 Marina Boulevard, Lagos Island",
  invoiceNumber: "INV-2048",
  invoiceDate: "12 October 2026",
  dueDate: "26 October 2026",
  paymentTerms: "Net 14 (Discrepancy: PO specifies Net 30)",
  currency: "₦",
  items: [
    {
      id: "item-1",
      fieldId: "field-item-1",
      description: "A4 Heavy Duty Bond Paper (Carton of 5 Reams)",
      quantity: 40,
      unitPrice: 2850,
      total: 114000,
      verified: true
    },
    {
      id: "item-2",
      fieldId: "field-item-2",
      description: "Thermal POS Receipt Rolls (50-pack)",
      quantity: 15,
      unitPrice: 3200,
      total: 48000,
      verified: true
    },
    {
      id: "item-3",
      fieldId: "field-item-3",
      description: "Industrial Permanent Markers (Box of 24)",
      quantity: 10,
      unitPrice: 2300,
      total: 23000,
      verified: true
    }
  ],
  subtotal: 185000,
  taxRate: "7.5%",
  taxAmount: 13875,
  totalAmount: 198875,
  bankAccount: "0123456789",
  bankName: "Zenith Bank Plc"
};

const extractedFields: ExtractedField[] = [
  {
    id: "field-inv-no",
    label: "Invoice Identifier",
    extractedValue: "INV-2048",
    confidence: "high",
    status: "verified",
    ruleDetail: "Unique ID verified against supplier sequence. No duplicate found in 12-month ledger.",
    documentLocation: { x: 62, y: 15, width: 32, height: 7 }
  },
  {
    id: "field-supplier",
    label: "Supplier Identity",
    extractedValue: "Northstar Office Supplies Ltd.",
    confidence: "high",
    status: "verified",
    ruleDetail: "Verified against Master Vendor Registry. TIN-99482104-001 confirmed active.",
    documentLocation: { x: 6, y: 12, width: 44, height: 10 }
  },
  {
    id: "field-subtotal",
    label: "Calculated Subtotal",
    extractedValue: "₦185,000.00",
    confidence: "high",
    status: "verified",
    ruleDetail: "Line item cross-sum (114,000 + 48,000 + 23,000) matches subtotal exactly.",
    documentLocation: { x: 58, y: 64, width: 36, height: 5 }
  },
  {
    id: "field-vat",
    label: "Tax Rate (VAT 7.5%)",
    extractedValue: "₦13,875.00",
    confidence: "high",
    status: "verified",
    ruleDetail: "Statutory VAT rate applied: 7.5% of ₦185,000 equals exactly ₦13,875.00.",
    documentLocation: { x: 58, y: 70, width: 36, height: 5 }
  },
  {
    id: "field-total",
    label: "Final Payable Amount",
    extractedValue: "₦198,875.00",
    confidence: "high",
    status: "verified",
    ruleDetail: "Arithmetic validated: Subtotal (₦185,000) + Tax (₦13,875) = ₦198,875.00.",
    documentLocation: { x: 58, y: 77, width: 36, height: 6 }
  },
  {
    id: "field-terms",
    label: "Payment Terms",
    extractedValue: "Net 14 (Due: 26 Oct 2026)",
    confidence: "review",
    status: "warning",
    ruleDetail: "Variance flagged: Purchase Order PO-892 stipulates Net 30 days. Requires AP sign-off.",
    documentLocation: { x: 62, y: 23, width: 32, height: 6 }
  },
  {
    id: "field-bank",
    label: "Remittance Account",
    extractedValue: "Zenith Bank • 0123456789",
    confidence: "high",
    status: "verified",
    ruleDetail: "Matches verified supplier disbursement account on file.",
    documentLocation: { x: 6, y: 84, width: 44, height: 8 }
  }
];

export const DocumentPreview: React.FC = () => {
  const [activeFieldId, setActiveFieldId] = useState<string>("field-terms");
  const [activeTab, setActiveTab] = useState<'split' | 'fields' | 'document'>('split');

  const activeField = extractedFields.find(f => f.id === activeFieldId) || extractedFields[0];

  return (
    <div className="w-full bg-[#FFFFFF] border border-[#E2E6E1] rounded-[8px] shadow-preview overflow-hidden">
      {/* Product preview toolbar */}
      <div className="bg-[#F7F8F6] px-4 py-2.5 border-b border-[#E2E6E1] flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-[#176B50]" />
          <span className="font-semibold text-[#202722] tracking-tight">LedgerLens Review Console</span>
          <span className="text-[#626B64] border-l border-[#E2E6E1] pl-2 hidden sm:inline">
            Batch: #2026-10-OCT • Doc 14 of 48
          </span>
        </div>

        <div className="flex items-center gap-2">
          {/* View toggle for small screens */}
          <div className="flex lg:hidden bg-[#FFFFFF] border border-[#E2E6E1] rounded-[4px] p-0.5">
            <button
              type="button"
              onClick={() => setActiveTab('split')}
              className={`px-2 py-0.5 text-[11px] font-medium rounded-[3px] ${
                activeTab === 'split' ? 'bg-[#EDF4EF] text-[#176B50]' : 'text-[#626B64]'
              }`}
            >
              Split
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('document')}
              className={`px-2 py-0.5 text-[11px] font-medium rounded-[3px] ${
                activeTab === 'document' ? 'bg-[#EDF4EF] text-[#176B50]' : 'text-[#626B64]'
              }`}
            >
              Document
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('fields')}
              className={`px-2 py-0.5 text-[11px] font-medium rounded-[3px] ${
                activeTab === 'fields' ? 'bg-[#EDF4EF] text-[#176B50]' : 'text-[#626B64]'
              }`}
            >
              Validation
            </button>
          </div>

          <span className="inline-flex items-center px-2 py-0.5 rounded-[3px] text-[11px] font-medium bg-[#EDF4EF] text-[#176B50] border border-[#176B50]/20">
            Preview Model
          </span>
        </div>
      </div>

      {/* Main interactive comparison viewport */}
      <div className="grid grid-cols-1 lg:grid-cols-12 divide-y lg:divide-y-0 lg:divide-x divide-[#E2E6E1]">
        {/* Left Column: Simulated Source Document */}
        <div
          className={`lg:col-span-6 p-4 sm:p-5 bg-[#FFFFFF] relative select-none ${
            activeTab === 'fields' ? 'hidden lg:block' : 'block'
          }`}
        >
          <div className="flex items-center justify-between mb-3 pb-2 border-b border-[#E2E6E1] text-[11px] text-[#626B64]">
            <span className="font-mono flex items-center gap-1.5 font-medium text-[#202722] text-[11px] truncate">
              <FileText className="w-3.5 h-3.5 text-[#176B50] flex-shrink-0" />
              source_invoice_scan.pdf
            </span>
            <span className="text-[10px] text-[#626B64] font-medium flex-shrink-0">Simulated Document Scan</span>
          </div>

          {/* Realistic enterprise invoice layout */}
          <div className="relative border border-[#E2E6E1] bg-[#FFFFFF] p-4 text-[11px] leading-relaxed font-sans shadow-sm">
            {/* Header / Supplier block */}
            <div className="flex justify-between items-start pb-4 border-b border-[#E2E6E1]">
              <div
                onClick={() => setActiveFieldId('field-supplier')}
                className={`cursor-pointer p-1.5 transition-colors rounded-[3px] ${
                  activeFieldId === 'field-supplier'
                    ? 'ring-1 ring-[#176B50] bg-[#EDF4EF]/50'
                    : 'hover:bg-[#F7F8F6]'
                }`}
              >
                <p className="font-bold text-[#202722] text-xs uppercase tracking-wide">
                  {sampleInvoice.supplierName}
                </p>
                <p className="text-[#626B64] text-[10px]">{sampleInvoice.supplierAddress}</p>
                <p className="text-[#626B64] text-[10px] font-mono mt-0.5">TIN: {sampleInvoice.supplierTaxId}</p>
              </div>

              <div className="text-right">
                <span className="inline-block text-[10px] uppercase font-bold tracking-widest text-[#176B50] bg-[#EDF4EF] px-1.5 py-0.5 rounded-[3px]">
                  TAX INVOICE
                </span>
                <div
                  onClick={() => setActiveFieldId('field-inv-no')}
                  className={`mt-1.5 cursor-pointer p-1 transition-colors rounded-[3px] ${
                    activeFieldId === 'field-inv-no'
                      ? 'ring-1 ring-[#176B50] bg-[#EDF4EF]/50'
                      : 'hover:bg-[#F7F8F6]'
                  }`}
                >
                  <p className="text-[10px] text-[#626B64]">Invoice No:</p>
                  <p className="font-mono font-bold text-[#202722] text-xs">{sampleInvoice.invoiceNumber}</p>
                </div>
              </div>
            </div>

            {/* Bill To & Terms meta */}
            <div className="grid grid-cols-2 gap-4 py-3 border-b border-[#E2E6E1] text-[10px]">
              <div>
                <p className="text-[#626B64] uppercase tracking-wider text-[9px] font-semibold">Billed To:</p>
                <p className="font-semibold text-[#202722]">{sampleInvoice.recipientName}</p>
                <p className="text-[#626B64]">{sampleInvoice.recipientAddress}</p>
              </div>
              <div
                onClick={() => setActiveFieldId('field-terms')}
                className={`cursor-pointer p-1.5 transition-colors rounded-[3px] ${
                  activeFieldId === 'field-terms'
                    ? 'ring-1 ring-[#A33A32] bg-[#A33A32]/5'
                    : 'hover:bg-[#F7F8F6]'
                }`}
              >
                <div className="space-y-1 text-[10px]">
                  <div className="flex items-center justify-between">
                    <span className="text-[#626B64]">Invoice Date:</span>
                    <span className="font-mono text-[#202722]">{sampleInvoice.invoiceDate}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-[#A33A32] font-semibold">Terms / Due:</span>
                    <span className="font-mono font-medium text-[#A33A32]">Net 14 (26 Oct)</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Line items table */}
            <table className="w-full text-left my-2 border-collapse text-[10px]">
              <thead>
                <tr className="border-b border-[#E2E6E1] text-[#626B64] font-medium">
                  <th className="py-1 pr-2">Description</th>
                  <th className="py-1 px-2 text-right">Qty</th>
                  <th className="py-1 px-2 text-right">Unit ({sampleInvoice.currency})</th>
                  <th className="py-1 pl-2 text-right">Total ({sampleInvoice.currency})</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E2E6E1]/60">
                {sampleInvoice.items.map((item) => (
                  <tr
                    key={item.id}
                    onClick={() => setActiveFieldId('field-subtotal')}
                    className="hover:bg-[#F7F8F6] cursor-pointer"
                  >
                    <td className="py-1.5 pr-2 text-[#202722]">{item.description}</td>
                    <td className="py-1.5 px-2 text-right font-mono text-[#626B64]">{item.quantity}</td>
                    <td className="py-1.5 px-2 text-right font-mono text-[#626B64]">
                      {item.unitPrice.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                    </td>
                    <td className="py-1.5 pl-2 text-right font-mono text-[#202722] font-medium">
                      {item.total.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {/* Financial Totals */}
            <div className="pt-2 border-t border-[#E2E6E1] space-y-1 text-[11px]">
              <div
                onClick={() => setActiveFieldId('field-subtotal')}
                className={`flex justify-between cursor-pointer px-1.5 py-0.5 rounded-[3px] ${
                  activeFieldId === 'field-subtotal' ? 'ring-1 ring-[#176B50] bg-[#EDF4EF]/50' : 'hover:bg-[#F7F8F6]'
                }`}
              >
                <span className="text-[#626B64]">Subtotal:</span>
                <span className="font-mono font-medium text-[#202722]">
                  {sampleInvoice.currency}{sampleInvoice.subtotal.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                </span>
              </div>
              <div
                onClick={() => setActiveFieldId('field-vat')}
                className={`flex justify-between cursor-pointer px-1.5 py-0.5 rounded-[3px] ${
                  activeFieldId === 'field-vat' ? 'ring-1 ring-[#176B50] bg-[#EDF4EF]/50' : 'hover:bg-[#F7F8F6]'
                }`}
              >
                <span className="text-[#626B64]">VAT ({sampleInvoice.taxRate}):</span>
                <span className="font-mono font-medium text-[#202722]">
                  {sampleInvoice.currency}{sampleInvoice.taxAmount.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                </span>
              </div>
              <div
                onClick={() => setActiveFieldId('field-total')}
                className={`flex justify-between cursor-pointer px-1.5 py-1 rounded-[3px] border-t border-[#E2E6E1] font-bold ${
                  activeFieldId === 'field-total' ? 'ring-1 ring-[#176B50] bg-[#EDF4EF]' : 'hover:bg-[#F7F8F6]'
                }`}
              >
                <span className="text-[#202722]">Total Due:</span>
                <span className="font-mono text-[#176B50] text-xs">
                  {sampleInvoice.currency}{sampleInvoice.totalAmount.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                </span>
              </div>
            </div>

            {/* Bank details footer */}
            <div
              onClick={() => setActiveFieldId('field-bank')}
              className={`mt-3 pt-2 border-t border-dashed border-[#E2E6E1] text-[9px] text-[#626B64] cursor-pointer px-1.5 py-1 rounded-[3px] ${
                activeFieldId === 'field-bank' ? 'ring-1 ring-[#176B50] bg-[#EDF4EF]/50' : 'hover:bg-[#F7F8F6]'
              }`}
            >
              <span className="font-semibold text-[#202722]">Settlement Instructions: </span>
              {sampleInvoice.bankName} • Account: <span className="font-mono font-bold">{sampleInvoice.bankAccount}</span>
            </div>
          </div>

          <div className="mt-2 text-[10px] text-[#626B64] flex items-center justify-between">
            <span className="italic">Click any document section to trace verification</span>
            <span className="text-[#626B64]/80">Fictional sample data</span>
          </div>
        </div>

        {/* Right Column: Extracted Structured Fields & Audit Intelligence */}
        <div
          className={`lg:col-span-6 p-4 sm:p-5 bg-[#F7F8F6] flex flex-col justify-between ${
            activeTab === 'document' ? 'hidden lg:flex' : 'flex'
          }`}
        >
          <div>
            <div className="flex items-center justify-between mb-3 pb-2 border-b border-[#E2E6E1] text-[11px]">
              <span className="font-medium text-[#202722] flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-[#176B50]" />
                Extracted Intelligence & Audit Rules
              </span>
              <span className="text-[10px] font-mono text-[#626B64]">7 Fields Checked</span>
            </div>

            {/* Field selector list */}
            <div className="space-y-1.5">
              {extractedFields.map((field) => {
                const isSelected = field.id === activeFieldId;
                const isWarning = field.status === 'warning';

                return (
                  <div
                    key={field.id}
                    onClick={() => setActiveFieldId(field.id)}
                    className={`cursor-pointer p-2.5 rounded-[4px] border transition-all text-xs ${
                      isSelected
                        ? isWarning
                          ? 'bg-[#FFFFFF] border-[#A33A32] shadow-sm'
                          : 'bg-[#FFFFFF] border-[#176B50] shadow-sm'
                        : 'bg-[#FFFFFF] border-[#E2E6E1] hover:border-[#626B64]/40'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-medium text-[#202722]">{field.label}</span>
                      <div className="flex items-center gap-1.5">
                        <span className="font-mono font-semibold text-[#202722]">
                          {field.extractedValue}
                        </span>
                        {isWarning ? (
                          <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-[3px] text-[10px] font-medium bg-[#A33A32]/10 text-[#A33A32]">
                            <AlertTriangle className="w-2.5 h-2.5" />
                            Review
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-[3px] text-[10px] font-medium bg-[#EDF4EF] text-[#176B50]">
                            <Check className="w-2.5 h-2.5" />
                            Verified
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Active Field Verification Detail Inspector */}
          <div className="mt-4 pt-3 border-t border-[#E2E6E1] bg-[#FFFFFF] p-3 rounded-[4px] border border-[#E2E6E1]">
            <div className="flex items-center justify-between text-[11px] mb-1.5">
              <span className="font-semibold text-[#202722] flex items-center gap-1">
                <Search className="w-3 h-3 text-[#176B50]" />
                Inspection Rule: {activeField.label}
              </span>
              <span
                className={`text-[10px] uppercase font-mono px-1.5 py-0.5 rounded-[3px] ${
                  activeField.status === 'warning'
                    ? 'bg-[#A33A32]/10 text-[#A33A32] font-semibold'
                    : 'bg-[#EDF4EF] text-[#176B50]'
                }`}
              >
                {activeField.status === 'warning' ? 'Human Sign-off Required' : 'Automated Rule Passed'}
              </span>
            </div>
            <p className="text-[12px] text-[#626B64] leading-relaxed">
              {activeField.ruleDetail}
            </p>
            <div className="mt-2 pt-2 border-t border-[#E2E6E1]/60 flex items-center justify-between text-[10px] text-[#626B64]">
              <span className="flex items-center gap-1">
                <CornerDownRight className="w-3 h-3 text-[#626B64]" />
                Location in scan: Page 1 • X: {activeField.documentLocation.x}% Y: {activeField.documentLocation.y}%
              </span>
              <span className="font-medium text-[#202722]">Audit Trail: Hash #8F29A</span>
            </div>
          </div>
        </div>
      </div>

      {/* Product preview footer disclaimer */}
      <div className="bg-[#FFFFFF] px-4 py-2 border-t border-[#E2E6E1] text-[11px] text-[#626B64] flex flex-wrap items-center justify-between gap-2">
        <span className="text-[#626B64]">
          Product Preview: Static interactive demonstration of proposed document intelligence workflow.
        </span>
        <span className="text-[#176B50] font-medium flex items-center gap-1 text-[11px]">
          Confidence score: 98.4% <ArrowRight className="w-3 h-3 inline" />
        </span>
      </div>
    </div>
  );
};
