/**
 * LedgerLens AI — Synthetic Invoice Generator
 * Generates 8 realistic synthetic invoice PDF documents for Scenarios A through H.
 * Uses headless Google Chrome to render clean, professional B2B invoices.
 */

import fs from 'node:fs';
import path from 'node:path';
import { execSync } from 'node:child_process';

const TARGET_DIR = path.resolve('demo-assets/synthetic-invoices');
fs.mkdirSync(TARGET_DIR, { recursive: true });

const scenarios = [
  {
    id: 'SCENARIO-A',
    filename: 'fixture_a_normal_clean.pdf',
    title: 'Standard Clean B2B Invoice',
    supplier: 'Meridian Global Logistics Ltd',
    supplierAddress: '14 Maritime Way, Docklands, London, E14 2AQ',
    taxId: 'VAT-GB7729104',
    customer: 'Apex Distribution Hub',
    customerAddress: '42 Marina Boulevard, Lagos Island, Nigeria',
    invoiceNumber: 'INV-2026-A101',
    invoiceDate: '2026-10-15',
    dueDate: '2026-10-29',
    currency: 'USD',
    poNumber: 'PO-MGL-9941',
    paymentTerms: 'Net 14 Days',
    items: [
      { desc: 'Freight Pallet Transport (Regional)', qty: 10, unit: 45.00, total: 450.00 },
      { desc: 'Cold Storage Handling & Quarantine Service', qty: 4, unit: 125.00, total: 500.00 },
    ],
    subtotal: 950.00,
    taxRate: 0.10,
    taxAmount: 95.00,
    discountAmount: 0,
    shippingAmount: 0,
    grandTotal: 1045.00,
    notes: 'Standard payment via wire transfer. Thank you for your business.',
  },
  {
    id: 'SCENARIO-B',
    filename: 'fixture_b_multi_item.pdf',
    title: 'Multi-Line Item Component Order',
    supplier: 'Cascade Industrial Components Ltd',
    supplierAddress: 'Unit 8, Silicon Business Park, Manchester, M17 1PT',
    taxId: 'TIN-8839102-004',
    customer: 'Apex Distribution Hub',
    customerAddress: '42 Marina Boulevard, Lagos Island, Nigeria',
    invoiceNumber: 'INV-2026-B202',
    invoiceDate: '2026-10-18',
    dueDate: '2026-11-01',
    currency: 'USD',
    poNumber: 'PO-CIC-4410',
    paymentTerms: 'Net 14 Days',
    items: [
      { desc: 'Hydraulic Pressure Seals (High Temp)', qty: 5, unit: 75.00, total: 375.00 },
      { desc: 'Heavy Duty Deep Groove Ball Bearings', qty: 12, unit: 28.50, total: 342.00 },
      { desc: 'Reinforced Flange Gaskets 4-inch', qty: 20, unit: 14.25, total: 285.00 },
      { desc: 'Industrial Lithium Grease Cartridges (Box of 10)', qty: 2, unit: 110.00, total: 220.00 },
    ],
    subtotal: 1222.00,
    taxRate: 0.075,
    taxAmount: 91.65,
    discountAmount: 0,
    shippingAmount: 0,
    grandTotal: 1313.65,
    notes: 'Parts inspected according to ISO-9001 quality specifications.',
  },
  {
    id: 'SCENARIO-C',
    filename: 'fixture_c_arithmetic_discrepancy.pdf',
    title: 'Invoice with Deliberate Arithmetic Discrepancy',
    supplier: 'Solari Electrical Systems Inc',
    supplierAddress: '450 Industrial Parkway, Austin, TX 78701',
    taxId: 'EIN-44-9812401',
    customer: 'Apex Distribution Hub',
    customerAddress: '42 Marina Boulevard, Lagos Island, Nigeria',
    invoiceNumber: 'INV-2026-C303',
    invoiceDate: '2026-10-20',
    dueDate: '2026-11-05',
    currency: 'USD',
    poNumber: 'PO-SES-8812',
    paymentTerms: 'Net 16 Days',
    items: [
      { desc: 'Commercial Circuit Breaker Panel 200A', qty: 8, unit: 150.00, total: 1200.00 },
      { desc: 'Three-Phase Surge Suppressor Modules', qty: 15, unit: 40.00, total: 600.00 },
    ],
    subtotal: 1800.00,
    taxRate: 0.10,
    taxAmount: 180.00,
    discountAmount: 0,
    shippingAmount: 0,
    // Discrepancy: Mathematical sum is 1800 + 180 = 1980. Printed grand total is 2450.00 (+$470 error)
    grandTotal: 2450.00,
    notes: 'Note: Discrepant total printed intentionally for verification testing.',
  },
  {
    id: 'SCENARIO-D',
    filename: 'fixture_d_missing_fields.pdf',
    title: 'Invoice with Missing Supplier Name and Date',
    supplier: '', // Missing
    supplierAddress: 'Warehouse Dock #4, Industrial Zone',
    taxId: '',
    customer: 'Apex Distribution Hub',
    customerAddress: '42 Marina Boulevard, Lagos Island, Nigeria',
    invoiceNumber: 'INV-2026-D404',
    invoiceDate: '', // Missing
    dueDate: '2026-11-10',
    currency: 'USD',
    poNumber: '',
    paymentTerms: 'Due upon receipt',
    items: [
      { desc: 'Commercial HVAC Air Filters (MERV 13)', qty: 2, unit: 85.00, total: 170.00 },
    ],
    subtotal: 170.00,
    taxRate: 0,
    taxAmount: 0,
    discountAmount: 0,
    shippingAmount: 0,
    grandTotal: 170.00,
    notes: 'Header fields intentionally omitted to test missing field validation detection.',
  },
  {
    id: 'SCENARIO-E',
    filename: 'fixture_e_date_inconsistency.pdf',
    title: 'Invoice with Inverted Payment Due Date',
    supplier: 'Zenith Chemical Reagents Ltd',
    supplierAddress: 'Plot 19, Trans-Amadi Industrial Layout, Port Harcourt',
    taxId: 'VAT-NG4091823',
    customer: 'Apex Distribution Hub',
    customerAddress: '42 Marina Boulevard, Lagos Island, Nigeria',
    invoiceNumber: 'INV-2026-E505',
    invoiceDate: '2026-10-22',
    // Inconsistent: Due date is prior to invoice date!
    dueDate: '2026-10-05',
    currency: 'USD',
    poNumber: 'PO-ZCR-1092',
    paymentTerms: 'Net 30 Days (Contradictory)',
    items: [
      { desc: 'Laboratory Grade Ethanol 99.8% (25L Drum)', qty: 4, unit: 120.00, total: 480.00 },
    ],
    subtotal: 480.00,
    taxRate: 0.05,
    taxAmount: 24.00,
    discountAmount: 0,
    shippingAmount: 0,
    grandTotal: 504.00,
    notes: 'Contains date conflict: due date precedes invoice issue date.',
  },
  {
    id: 'SCENARIO-F',
    filename: 'fixture_f_duplicate_copy.pdf',
    title: 'Duplicate Invoice Copy of Scenario A',
    // Identical supplier and invoice number to Scenario A to trigger workspace duplicate warning
    supplier: 'Meridian Global Logistics Ltd',
    supplierAddress: '14 Maritime Way, Docklands, London, E14 2AQ',
    taxId: 'VAT-GB7729104',
    customer: 'Apex Distribution Hub',
    customerAddress: '42 Marina Boulevard, Lagos Island, Nigeria',
    invoiceNumber: 'INV-2026-A101', // Exact duplicate of Scenario A
    invoiceDate: '2026-10-15',
    dueDate: '2026-10-29',
    currency: 'USD',
    poNumber: 'PO-MGL-9941',
    paymentTerms: 'Net 14 Days',
    items: [
      { desc: 'Freight Pallet Transport (Regional)', qty: 10, unit: 45.00, total: 450.00 },
      { desc: 'Cold Storage Handling & Quarantine Service', qty: 4, unit: 125.00, total: 500.00 },
    ],
    subtotal: 950.00,
    taxRate: 0.10,
    taxAmount: 95.00,
    discountAmount: 0,
    shippingAmount: 0,
    grandTotal: 1045.00,
    notes: 'Duplicate transmission test fixture. Identical supplier and invoice identifier.',
  },
  {
    id: 'SCENARIO-G',
    filename: 'fixture_g_ambiguous_field.pdf',
    title: 'Invoice with Obscured / Ambiguous Reference Number',
    supplier: 'Oakhaven Specialty Metals',
    supplierAddress: '72 Forge Road, Sheffield, S1 4BW',
    taxId: 'VAT-GB5520194',
    customer: 'Apex Distribution Hub',
    customerAddress: '42 Marina Boulevard, Lagos Island, Nigeria',
    invoiceNumber: 'INV-2026-G###07', // Obscured with stamp overlay
    invoiceDate: '2026-10-21',
    dueDate: '2026-11-04',
    currency: 'USD',
    poNumber: 'PO-OSM-2041',
    paymentTerms: 'Net 14 Days',
    items: [
      { desc: 'Custom CNC Precision Machined Aluminum Brackets', qty: 1, unit: 340.00, total: 340.00 },
    ],
    subtotal: 340.00,
    taxRate: 0,
    taxAmount: 0,
    discountAmount: 0,
    shippingAmount: 0,
    grandTotal: 340.00,
    notes: 'Reference identifier partially stamped over in scan.',
  },
  {
    id: 'SCENARIO-H',
    filename: 'fixture_h_discount_shipping.pdf',
    title: 'Invoice with Promotional Discount and Freight Shipping',
    supplier: 'Vanguard Packaging Systems Ltd',
    supplierAddress: 'Plot 3, Logistics Free Zone, Lekki, Lagos',
    taxId: 'VAT-NG9918231',
    customer: 'Apex Distribution Hub',
    customerAddress: '42 Marina Boulevard, Lagos Island, Nigeria',
    invoiceNumber: 'INV-2026-H808',
    invoiceDate: '2026-10-23',
    dueDate: '2026-11-06',
    currency: 'USD',
    poNumber: 'PO-VPS-7721',
    paymentTerms: 'Net 14 Days',
    items: [
      { desc: 'Heavy Duty Corrugated Shipping Boxes (Bundle of 25)', qty: 50, unit: 22.00, total: 1100.00 },
    ],
    subtotal: 1100.00,
    discountAmount: 100.00,
    shippingAmount: 50.00,
    taxRate: 0.075,
    taxAmount: 75.00,
    // Math: 1100 - 100 + 50 + 75 = 1125.00
    grandTotal: 1125.00,
    notes: 'Special contracted volume discount applied. Freight dispatched via ground logistics.',
  },
];

function generateHtml(s) {
  const isAmbiguous = s.id === 'SCENARIO-G';
  const invNumberDisplay = isAmbiguous
    ? `<span style="position:relative;display:inline-block;background:#eee;padding:2px 8px;border:1px dashed #999;">
         <span style="opacity:0.3;text-decoration:line-through;">INV-2026-G8807</span>
         <span style="position:absolute;top:-4px;left:4px;color:#c00;font-weight:bold;transform:rotate(-8deg);font-size:11px;border:1px solid #c00;padding:1px 4px;background:rgba(255,230,230,0.9);">CONFIDENTIAL STAMP</span>
       </span>`
    : `<strong>${s.invoiceNumber || '<span style="color:#c00;font-style:italic;">[MISSING FROM SOURCE]</span>'}</strong>`;

  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>${s.title}</title>
  <style>
    @page { size: A4; margin: 15mm; }
    body { font-family: 'Helvetica Neue', Arial, sans-serif; color: #202722; margin: 0; padding: 24px; font-size: 13px; line-height: 1.4; }
    .header { display: flex; justify-content: space-between; border-bottom: 2px solid #176B50; padding-bottom: 16px; margin-bottom: 24px; }
    .brand { font-size: 20px; font-weight: bold; color: #176B50; }
    .badge { display: inline-block; font-size: 10px; font-family: monospace; background: #EDF4EF; color: #176B50; padding: 2px 6px; border-radius: 3px; font-weight: bold; text-transform: uppercase; margin-top: 4px; }
    .meta-box { text-align: right; }
    .inv-title { font-size: 24px; font-weight: bold; color: #202722; margin: 0 0 6px 0; }
    .grid { display: flex; justify-content: space-between; margin-bottom: 24px; }
    .col { width: 48%; }
    .col h4 { font-size: 11px; text-transform: uppercase; color: #626B64; margin: 0 0 6px 0; border-bottom: 1px solid #E2E6E1; padding-bottom: 4px; }
    table { width: 100%; border-collapse: collapse; margin-bottom: 20px; }
    th { background: #F7F8F6; text-align: left; padding: 8px 10px; font-size: 11px; text-transform: uppercase; color: #626B64; border-bottom: 1px solid #E2E6E1; }
    td { padding: 9px 10px; border-bottom: 1px solid #E2E6E1; }
    .num { text-align: right; font-variant-numeric: tabular-nums; }
    .totals { width: 45%; margin-left: auto; margin-bottom: 24px; }
    .totals-row { display: flex; justify-content: space-between; padding: 4px 0; font-size: 13px; }
    .totals-row.grand { border-top: 2px solid #202722; border-bottom: 2px solid #202722; font-weight: bold; font-size: 15px; padding: 8px 0; margin-top: 6px; color: #176B50; }
    .notes { background: #F7F8F6; padding: 12px; border-left: 3px solid #176B50; font-size: 12px; color: #626B64; }
    .watermark { position: fixed; bottom: 8px; right: 12px; font-size: 10px; color: #999; font-family: monospace; }
  </style>
</head>
<body>
  <div class="header">
    <div>
      <div class="brand">${s.supplier || '<span style="color:#c00;">[SUPPLIER NAME MISSING]</span>'}</div>
      <div style="color: #626B64; font-size: 12px; margin-top: 4px;">${s.supplierAddress}</div>
      ${s.taxId ? `<div style="font-family: monospace; font-size: 11px; margin-top: 3px;">Tax/VAT ID: ${s.taxId}</div>` : ''}
      <div class="badge">Synthetic Test Material · ${s.id}</div>
    </div>
    <div class="meta-box">
      <h1 class="inv-title">COMMERCIAL INVOICE</h1>
      <div style="font-size: 13px; margin-bottom: 3px;">Invoice Ref: ${invNumberDisplay}</div>
      <div style="font-size: 12px; color: #626B64;">Issue Date: <strong>${s.invoiceDate || '<span style="color:#c00;">[DATE MISSING]</span>'}</strong></div>
      <div style="font-size: 12px; color: #626B64;">Payment Due: <strong>${s.dueDate || 'N/A'}</strong></div>
      ${s.poNumber ? `<div style="font-size: 11px; font-family: monospace; margin-top: 3px;">P.O. Ref: ${s.poNumber}</div>` : ''}
    </div>
  </div>

  <div class="grid">
    <div class="col">
      <h4>Billed To (Customer):</h4>
      <div style="font-weight: bold;">${s.customer}</div>
      <div style="color: #626B64; font-size: 12px; margin-top: 2px;">${s.customerAddress}</div>
    </div>
    <div class="col">
      <h4>Payment Terms &amp; Settlement:</h4>
      <div>Terms: <strong>${s.paymentTerms}</strong></div>
      <div>Settlement Currency: <strong>${s.currency}</strong></div>
    </div>
  </div>

  <table>
    <thead>
      <tr>
        <th style="width: 55%;">Item &amp; Description</th>
        <th class="num" style="width: 15%;">Quantity</th>
        <th class="num" style="width: 15%;">Unit Price</th>
        <th class="num" style="width: 15%;">Amount (${s.currency})</th>
      </tr>
    </thead>
    <tbody>
      ${s.items.map(it => `
        <tr>
          <td><strong>${it.desc}</strong></td>
          <td class="num">${it.qty}</td>
          <td class="num">${it.unit.toFixed(2)}</td>
          <td class="num">${it.total.toFixed(2)}</td>
        </tr>
      `).join('')}
    </tbody>
  </table>

  <div class="totals">
    <div class="totals-row">
      <span>Subtotal:</span>
      <span class="num">${s.currency} ${s.subtotal.toFixed(2)}</span>
    </div>
    ${s.discountAmount > 0 ? `
      <div class="totals-row" style="color:#176B50;">
        <span>Volume Discount:</span>
        <span class="num">-${s.currency} ${s.discountAmount.toFixed(2)}</span>
      </div>
    ` : ''}
    ${s.shippingAmount > 0 ? `
      <div class="totals-row">
        <span>Freight &amp; Handling:</span>
        <span class="num">+${s.currency} ${s.shippingAmount.toFixed(2)}</span>
      </div>
    ` : ''}
    <div class="totals-row">
      <span>Tax / VAT (${(s.taxRate * 100).toFixed(1)}%):</span>
      <span class="num">+${s.currency} ${s.taxAmount.toFixed(2)}</span>
    </div>
    <div class="totals-row grand">
      <span>Grand Total Due:</span>
      <span class="num">${s.currency} ${s.grandTotal.toFixed(2)}</span>
    </div>
  </div>

  <div class="notes">
    <strong>Document Notes &amp; Verification Notice:</strong><br>
    ${s.notes}
  </div>

  <div class="watermark">
    LEDGERLENS AI SYNTHETIC BENCHMARK FIXTURE · ${s.id} · NOT A REAL INVOICE
  </div>
</body>
</html>`;
}

// Generate HTML and convert each to PDF using headless Chrome
for (const scenario of scenarios) {
  const htmlPath = path.join(TARGET_DIR, scenario.filename.replace('.pdf', '.html'));
  const pdfPath = path.join(TARGET_DIR, scenario.filename);

  const htmlContent = generateHtml(scenario);
  fs.writeFileSync(htmlPath, htmlContent, 'utf-8');

  console.log(`Generating PDF for ${scenario.id}: ${scenario.filename}...`);
  const chromeCmd = `google-chrome --headless=new --disable-gpu --no-pdf-header-footer --print-to-pdf="${pdfPath}" "${htmlPath}"`;
  execSync(chromeCmd, { stdio: 'pipe' });

  // Verify magic bytes
  const buffer = fs.readFileSync(pdfPath);
  const isPdf = buffer.slice(0, 4).toString() === '%PDF';
  if (!isPdf) {
    throw new Error(`Generated file ${scenario.filename} failed PDF magic byte check!`);
  }

  // Remove temporary HTML file to keep directory clean
  fs.unlinkSync(htmlPath);
  console.log(`✅ Success: ${scenario.filename} (${buffer.length} bytes, verified %PDF)`);
}

// Write the comprehensive test manifest
const manifest = {
  title: 'LedgerLens AI — Synthetic Invoice Benchmark Dataset',
  version: '1.0.0',
  generated_at: '2026-10-23T15:35:00Z',
  disclaimer: 'All companies, names, tax numbers, and invoice identifiers are fictional fixtures created for automated evaluation.',
  scenarios: scenarios.map(s => ({
    scenario_id: s.id,
    filename: s.filename,
    title: s.title,
    expected_supplier: s.supplier || null,
    expected_tax_id: s.taxId || null,
    expected_customer: s.customer,
    expected_invoice_number: s.invoiceNumber || null,
    expected_invoice_date: s.invoiceDate || null,
    expected_due_date: s.dueDate || null,
    expected_currency: s.currency,
    expected_subtotal: s.subtotal,
    expected_tax_amount: s.taxAmount,
    expected_discount_amount: s.discountAmount || 0,
    expected_shipping_amount: s.shippingAmount || 0,
    expected_grand_total: s.grandTotal,
    expected_line_items_count: s.items.length,
    expected_validation_issues: (function() {
      const issues = [];
      if (s.id === 'SCENARIO-C') {
        issues.push({
          issue_type: 'arithmetic_discrepancy',
          severity: 'error',
          expected_flag: 'Grand total calculation discrepancy',
        });
      }
      if (s.id === 'SCENARIO-D') {
        issues.push({
          issue_type: 'missing_field',
          field_key: 'supplier_name',
          severity: 'error',
        });
        issues.push({
          issue_type: 'missing_field',
          field_key: 'invoice_date',
          severity: 'error',
        });
      }
      if (s.id === 'SCENARIO-E') {
        issues.push({
          issue_type: 'date_inconsistency',
          severity: 'warning',
          expected_flag: 'Payment due date precedes billing date',
        });
      }
      if (s.id === 'SCENARIO-F') {
        issues.push({
          issue_type: 'duplicate_warning',
          severity: 'warning',
          expected_flag: 'Duplicate invoice detected with identical supplier and number',
        });
      }
      if (s.id === 'SCENARIO-G') {
        issues.push({
          issue_type: 'review_required',
          severity: 'warning',
          expected_flag: 'Ambiguous or partially obscured invoice identifier',
        });
      }
      return issues;
    })(),
    expected_duplicate_behavior: s.id === 'SCENARIO-F' ? 'Identified as duplicate of SCENARIO-A' : 'Unique within workspace',
    intentionally_missing_or_ambiguous: (function() {
      if (s.id === 'SCENARIO-D') return ['supplier_name', 'invoice_date'];
      if (s.id === 'SCENARIO-G') return ['invoice_number'];
      return [];
    })(),
  })),
};

const manifestPath = path.join(TARGET_DIR, 'manifest.json');
fs.writeFileSync(manifestPath, JSON.stringify(manifest, null, 2), 'utf-8');
console.log(`\n🎉 Synthetic dataset and manifest generated in: ${TARGET_DIR}`);
