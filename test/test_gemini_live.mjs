import fs from 'node:fs';
import path from 'node:path';
import { extractWithGemini } from '../server/intelligence.mjs';

function loadEnvFile(filename) {
  const filePath = path.resolve(process.cwd(), filename);
  if (!fs.existsSync(filePath)) return {};
  const content = fs.readFileSync(filePath, 'utf-8');
  const env = {};
  for (const line of content.split('\n')) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const idx = trimmed.indexOf('=');
    if (idx !== -1) {
      env[trimmed.slice(0, idx).trim()] = trimmed.slice(idx + 1).trim();
    }
  }
  return env;
}

const env = loadEnvFile('.env.server');
const apiKey = process.env.GEMINI_API_KEY || env.GEMINI_API_KEY;

if (!apiKey) {
  console.error('❌ No GEMINI_API_KEY found in .env.server');
  process.exit(1);
}

// Generate a valid minimal single-page PDF containing realistic invoice text
const sampleInvoicePdf = `%PDF-1.4
1 0 obj
<< /Type /Catalog /Pages 2 0 R >>
endobj
2 0 obj
<< /Type /Pages /Kids [3 0 R] /Count 1 >>
endobj
3 0 obj
<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Contents 4 0 R /Resources << /Font << /F1 5 0 R >> >> >>
endobj
4 0 obj
<< /Length 280 >>
stream
BT
/F1 18 Tf
50 720 Td
(ACME INDUSTRIAL SUPPLIES LTD) Tj
/F1 12 Tf
0 -30 Td
(Invoice Number: INV-9824) Tj
0 -20 Td
(Invoice Date: 2026-10-15) Tj
0 -20 Td
(Due Date: 2026-10-29) Tj
0 -30 Td
(Item: Hydraulic Fluid 20L Drum x 2 @ 150.00 = 300.00) Tj
0 -20 Td
(Subtotal: 300.00) Tj
0 -20 Td
(Tax (10%): 30.00) Tj
0 -20 Td
(Total Amount Due: 330.00 USD) Tj
ET
endstream
endobj
5 0 obj
<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>
endobj
xref
0 6
0000000000 65535 f 
0000000009 00000 n 
0000000058 00000 n 
0000000115 00000 n 
0000000244 00000 n 
0000000574 00000 n 
trailer
<< /Size 6 /Root 1 0 R >>
startxref
643
%%EOF`;

const pdfBuffer = Buffer.from(sampleInvoicePdf, 'utf-8');

console.log('Testing live extraction with Gemini 2.5 Flash...');
try {
  const result = await extractWithGemini(pdfBuffer, 'application/pdf', 'acme_invoice_9824.pdf', apiKey);
  console.log('✅ Extraction succeeded!');
  console.log('Supplier Name:', result.supplier_name);
  console.log('Invoice Number:', result.invoice_number);
  console.log('Invoice Date:', result.invoice_date);
  console.log('Due Date:', result.due_date);
  console.log('Subtotal:', result.subtotal);
  console.log('Tax Amount:', result.tax_amount);
  console.log('Grand Total:', result.grand_total);
  console.log('Currency:', result.currency);
  console.log('Line Items count:', result.line_items.length);
  console.log('Line Items:', JSON.stringify(result.line_items, null, 2));
  console.log('Field Metadata keys:', Object.keys(result.field_metadata));
  console.log('Provider:', result.extractor_provider);
} catch (err) {
  console.error('❌ Extraction failed:', err);
  process.exit(1);
}
