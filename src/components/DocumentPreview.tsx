import React, { useState } from 'react';
import { AlertTriangle, CheckCircle2, ShieldCheck, ArrowRight } from 'lucide-react';
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
    id: "field-total",
    label: "Final Payable Total",
    extractedValue: "₦198,875.00",
    confidence: "high",
    status: "verified",
    ruleDetail: "Deterministic arithmetic reconciled: Subtotal (₦185,000) + Tax (₦13,875) = ₦198,875.00 within 0.00 currency variance tolerance.",
    documentLocation: { x: 55, y: 77, width: 40, height: 7 }
  },
  {
    id: "field-terms",
    label: "Payment Terms Variance",
    extractedValue: "Net 14 (Due: 26 Oct 2026)",
    confidence: "review",
    status: "warning",
    ruleDetail: "Contractual anomaly flagged: Purchase Order PO-892 stipulates Net 30. Invoice demands Net 14. Requires accounts payable review before release.",
    documentLocation: { x: 58, y: 22, width: 38, height: 7 }
  },
  {
    id: "field-vat",
    label: "Statutory Tax Rate (7.5%)",
    extractedValue: "₦13,875.00",
    confidence: "high",
    status: "verified",
    ruleDetail: "Statutory VAT rate calculation confirmed: 7.5% of verified subtotal ₦185,000 matches stated line amount of ₦13,875.00 exactly.",
    documentLocation: { x: 55, y: 70, width: 40, height: 6 }
  },
  {
    id: "field-inv-no",
    label: "Invoice Identifier",
    extractedValue: "INV-2048",
    confidence: "high",
    status: "verified",
    ruleDetail: "Sequential identifier verified against historical supplier workspace records. No duplicate invoice detected in active 12-month registry.",
    documentLocation: { x: 58, y: 14, width: 38, height: 7 }
  }
];

export const DocumentPreview: React.FC = () => {
  const [activeFieldId, setActiveFieldId] = useState<string>("field-total");
  const [activeTab, setActiveTab] = useState<'split' | 'fields' | 'document'>('split');

  const activeField = extractedFields.find(f => f.id === activeFieldId) || extractedFields[0];

  return (
    <div className="w-full bg-[#FFFFFF] border border-[#E2DFD7] rounded-[4px] shadow-datum overflow-hidden">
      {/* Bench Header Bar */}
      <div className="bg-[#F6F5F1] px-4 py-2.5 border-b border-[#E2DFD7] flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2.5">
          <span className="font-mono text-[11px] font-semibold tracking-wider uppercase text-[#111318]">
            [RECONCILIATION BENCH]
          </span>
          <span className="text-[#E2DFD7]">/</span>
          <span className="font-mono text-[11px] text-[#525866]">
            SYNTHETIC BENCHMARK FIXTURE
          </span>
        </div>

        <div className="flex items-center gap-3">
          <div className="hidden sm:flex items-center gap-2 font-mono text-[11px] text-[#525866]">
            <span>LOC: [X:{activeField.documentLocation.x}%, Y:{activeField.documentLocation.y}%]</span>
            <span className="text-[#E2DFD7]">|</span>
            <span className={activeField.status === 'warning' ? 'text-[#C2410C] font-semibold' : 'text-[#15803D] font-semibold'}>
              {activeField.status === 'warning' ? 'DISCREPANCY_FLAGGED' : 'ARITHMETIC_MATCH'}
            </span>
          </div>

          {/* View toggle for small screens */}
          <div className="flex lg:hidden bg-[#FFFFFF] border border-[#E2DFD7] rounded-[3px] p-0.5">
            <button
              type="button"
              onClick={() => setActiveTab('split')}
              className={`px-2 py-0.5 text-[11px] font-medium rounded-[2px] ${
                activeTab === 'split' ? 'bg-[#111318] text-white' : 'text-[#525866]'
              }`}
            >
              Split
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('document')}
              className={`px-2 py-0.5 text-[11px] font-medium rounded-[2px] ${
                activeTab === 'document' ? 'bg-[#111318] text-white' : 'text-[#525866]'
              }`}
            >
              Source
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('fields')}
              className={`px-2 py-0.5 text-[11px] font-medium rounded-[2px] ${
                activeTab === 'fields' ? 'bg-[#111318] text-white' : 'text-[#525866]'
              }`}
            >
              Ledger
            </button>
          </div>
        </div>
      </div>

      {/* Main Alignment Surface */}
      <div className="grid grid-cols-1 lg:grid-cols-12 divide-y lg:divide-y-0 lg:divide-x divide-[#E2DFD7]">
        {/* Left: Source Document Artifact */}
        <div className={`p-4 sm:p-5 lg:col-span-6 bg-[#FFFFFF] relative ${activeTab === 'fields' ? 'hidden lg:block' : 'block'}`}>
          <div className="flex items-center justify-between pb-3 mb-3 border-b border-[#E2DFD7] text-[11px] font-mono text-[#525866]">
            <span className="uppercase tracking-wider">Source Document (Scan)</span>
            <span className="text-[#1D4ED8]">Interactive Reticle</span>
          </div>

          {/* Document Sheet Container */}
          <div className="relative bg-[#FAFAF8] border border-[#E2DFD7] rounded-[3px] p-4 text-[11px] font-mono shadow-inner select-none overflow-hidden">
            {/* Corner Alignment Ticks */}
            <span className="absolute top-1 left-1 text-[#C5C1B6] text-[10px] leading-none select-none font-mono">+</span>
            <span className="absolute top-1 right-1 text-[#C5C1B6] text-[10px] leading-none select-none font-mono">+</span>
            <span className="absolute bottom-1 left-1 text-[#C5C1B6] text-[10px] leading-none select-none font-mono">+</span>
            <span className="absolute bottom-1 right-1 text-[#C5C1B6] text-[10px] leading-none select-none font-mono">+</span>

            {/* Simulated Document Header */}
            <div className="flex justify-between items-start pb-3 border-b border-[#E2DFD7]">
              <div>
                <p className="font-bold text-[12px] text-[#111318]">{sampleInvoice.supplierName}</p>
                <p className="text-[10px] text-[#525866]">{sampleInvoice.supplierAddress}</p>
                <p className="text-[10px] text-[#525866]">TAX ID: {sampleInvoice.supplierTaxId}</p>
              </div>
              <div className="text-right">
                <p className="font-bold text-[13px] text-[#111318]">INVOICE</p>
                <p className="text-[10px] font-semibold text-[#111318]">{sampleInvoice.invoiceNumber}</p>
                <p className="text-[10px] text-[#525866]">Date: {sampleInvoice.invoiceDate}</p>
                <p className="text-[10px] text-[#C2410C] font-semibold">Terms: Net 14</p>
              </div>
            </div>

            {/* Bill To */}
            <div className="py-2.5 border-b border-[#E2DFD7] text-[10px]">
              <span className="text-[#525866] block">BILLED TO:</span>
              <p className="font-semibold text-[#111318]">{sampleInvoice.recipientName}</p>
              <p className="text-[#525866]">{sampleInvoice.recipientAddress}</p>
            </div>

            {/* Line Items Table */}
            <div className="py-2.5">
              <table className="w-full text-[10px]">
                <thead>
                  <tr className="text-[#525866] border-b border-[#E2DFD7] text-left">
                    <th className="py-1">Description</th>
                    <th className="py-1 text-right">Qty</th>
                    <th className="py-1 text-right">Unit (₦)</th>
                    <th className="py-1 text-right">Total (₦)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E2DFD7]/60">
                  {sampleInvoice.items.map((item) => (
                    <tr key={item.id} className="text-[#111318]">
                      <td className="py-1 truncate max-w-[130px]">{item.description}</td>
                      <td className="py-1 text-right">{item.quantity}</td>
                      <td className="py-1 text-right">{item.unitPrice.toLocaleString()}</td>
                      <td className="py-1 text-right font-medium">{item.total.toLocaleString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Totals */}
            <div className="pt-2 border-t border-[#E2DFD7] space-y-1 text-right text-[10px]">
              <p className="text-[#525866]">
                Subtotal: <span className="font-semibold text-[#111318]">₦{sampleInvoice.subtotal.toLocaleString()}.00</span>
              </p>
              <p className="text-[#525866]">
                VAT ({sampleInvoice.taxRate}): <span className="font-semibold text-[#111318]">₦{sampleInvoice.taxAmount.toLocaleString()}.00</span>
              </p>
              <p className="text-[12px] font-bold text-[#111318] pt-1 border-t border-[#E2DFD7]">
                Grand Total: <span className="text-[#111318]">₦{sampleInvoice.totalAmount.toLocaleString()}.00</span>
              </p>
            </div>

            {/* Dynamic Alignment Reticle Overlay on Source Document */}
            {activeField && (
              <div
                className={`absolute pointer-events-none transition-all duration-300 z-20 ${
                  activeField.status === 'warning'
                    ? 'border border-[#C2410C] bg-[#C2410C]/10'
                    : 'border border-[#1D4ED8] bg-[#1D4ED8]/10'
                }`}
                style={{
                  left: `${activeField.documentLocation.x}%`,
                  top: `${activeField.documentLocation.y}%`,
                  width: `${activeField.documentLocation.width}%`,
                  height: `${activeField.documentLocation.height}%`,
                }}
              >
                <span
                  className={`absolute -top-3 left-0 font-mono text-[8px] font-bold px-1 py-0.2 uppercase rounded-[1px] leading-tight text-white ${
                    activeField.status === 'warning' ? 'bg-[#C2410C]' : 'bg-[#1D4ED8]'
                  }`}
                >
                  {activeField.label}
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Right: Reconciled Structured Ledger */}
        <div className={`p-4 sm:p-5 lg:col-span-6 bg-[#FFFFFF] flex flex-col justify-between ${activeTab === 'document' ? 'hidden lg:flex' : 'flex'}`}>
          <div>
            <div className="flex items-center justify-between pb-3 mb-3 border-b border-[#E2DFD7] text-[11px] font-mono text-[#525866]">
              <span className="uppercase tracking-wider">Reconciled Ledger Register</span>
              <span>Select to inspect proof</span>
            </div>

            {/* Interactive Field Selection Rows */}
            <div className="space-y-2 mb-4">
              {extractedFields.map((field) => {
                const isSelected = field.id === activeFieldId;
                const isWarning = field.status === 'warning';

                return (
                  <button
                    key={field.id}
                    type="button"
                    onClick={() => setActiveFieldId(field.id)}
                    className={`w-full p-2.5 rounded-[3px] border text-left transition-all flex items-center justify-between gap-3 text-xs ${
                      isSelected
                        ? isWarning
                          ? 'border-[#C2410C] bg-[#FEF2F2] shadow-sm'
                          : 'border-[#1D4ED8] bg-[#F6F5F1] shadow-sm'
                        : 'border-[#E2DFD7] hover:border-[#C5C1B6] bg-[#FFFFFF]'
                    }`}
                  >
                    <div className="min-w-0">
                      <p className="font-mono text-[10px] text-[#525866] uppercase tracking-wider truncate">
                        {field.label}
                      </p>
                      <p className="font-mono font-semibold text-[13px] text-[#111318] truncate mt-0.5">
                        {field.extractedValue}
                      </p>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <span
                        className={`font-mono text-[10px] uppercase font-semibold px-1.5 py-0.5 rounded-[2px] ${
                          isWarning
                            ? 'bg-[#FEF2F2] text-[#C2410C] border border-[#C2410C]/30'
                            : 'bg-[#EDF7EE] text-[#15803D] border border-[#15803D]/30'
                        }`}
                      >
                        {isWarning ? 'Review' : 'Verified'}
                      </span>
                      <ArrowRight className={`w-3.5 h-3.5 transition-transform ${isSelected ? 'translate-x-0.5 text-[#111318]' : 'text-[#C5C1B6]'}`} />
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Active Proof Panel */}
            <div className="p-3.5 bg-[#F6F5F1] border border-[#E2DFD7] rounded-[3px]">
              <div className="flex items-center gap-2 mb-1.5">
                {activeField.status === 'warning' ? (
                  <AlertTriangle className="w-4 h-4 text-[#C2410C] shrink-0" />
                ) : (
                  <CheckCircle2 className="w-4 h-4 text-[#15803D] shrink-0" />
                )}
                <span className="font-mono text-[11px] font-bold text-[#111318] uppercase tracking-wider">
                  Verification Proof Rule
                </span>
              </div>
              <p className="text-[12px] text-[#525866] leading-relaxed">
                {activeField.ruleDetail}
              </p>
            </div>
          </div>

          {/* Footer Ledger Guarantee */}
          <div className="pt-4 mt-4 border-t border-[#E2DFD7] flex items-center justify-between text-[11px] font-mono text-[#525866]">
            <span className="flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-[#15803D]" />
              Deterministic 2-Cent Math Tolerance Checked
            </span>
            <span>RLS ISOLATED</span>
          </div>
        </div>
      </div>
    </div>
  );
};
