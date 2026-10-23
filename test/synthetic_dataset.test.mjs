import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';

const FIXTURES_DIR = path.resolve('demo-assets/synthetic-invoices');

test('Synthetic Benchmark Dataset - Manifest integrity and scenario coverage', () => {
  const manifestPath = path.join(FIXTURES_DIR, 'manifest.json');
  assert.ok(fs.existsSync(manifestPath), 'manifest.json must exist in demo-assets/synthetic-invoices');

  const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf-8'));
  assert.equal(manifest.scenarios.length, 8, 'Manifest must contain 8 test scenarios (A through H)');

  const scenarioIds = manifest.scenarios.map(s => s.scenario_id);
  assert.deepEqual(scenarioIds, [
    'SCENARIO-A',
    'SCENARIO-B',
    'SCENARIO-C',
    'SCENARIO-D',
    'SCENARIO-E',
    'SCENARIO-F',
    'SCENARIO-G',
    'SCENARIO-H',
  ]);
});

test('Synthetic Benchmark Dataset - Genuine PDF binary fixtures exist and pass magic-byte validation', () => {
  const manifestPath = path.join(FIXTURES_DIR, 'manifest.json');
  const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf-8'));

  for (const s of manifest.scenarios) {
    const pdfPath = path.join(FIXTURES_DIR, s.filename);
    assert.ok(fs.existsSync(pdfPath), `Fixture file must exist: ${s.filename}`);

    const buffer = fs.readFileSync(pdfPath);
    assert.ok(buffer.length > 5000, `PDF ${s.filename} must be non-empty realistic size (>5KB)`);

    // Verify PDF header %PDF
    const header = buffer.slice(0, 4).toString();
    assert.equal(header, '%PDF', `Fixture ${s.filename} must have valid %PDF magic bytes`);
  }
});

test('Synthetic Benchmark Dataset - Arithmetic discrepancy scenario independently verified', () => {
  const manifestPath = path.join(FIXTURES_DIR, 'manifest.json');
  const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf-8'));

  const scC = manifest.scenarios.find(s => s.scenario_id === 'SCENARIO-C');
  assert.ok(scC, 'Scenario C must be present');

  // Stated grand total on invoice is 2450.00, but 1800 + 180 = 1980.00
  const expectedMathSum = scC.expected_subtotal + scC.expected_tax_amount;
  assert.equal(expectedMathSum, 1980.00);
  assert.notEqual(scC.expected_grand_total, expectedMathSum, 'Printed grand total must intentionally diverge to test validator');
  assert.equal(scC.expected_grand_total - expectedMathSum, 470.00, 'Arithmetic variance must be exactly 470.00');
});

test('Synthetic Benchmark Dataset - Date inconsistency scenario independently verified', () => {
  const manifestPath = path.join(FIXTURES_DIR, 'manifest.json');
  const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf-8'));

  const scE = manifest.scenarios.find(s => s.scenario_id === 'SCENARIO-E');
  assert.ok(scE, 'Scenario E must be present');

  const issueDate = new Date(scE.expected_invoice_date);
  const dueDate = new Date(scE.expected_due_date);
  assert.ok(dueDate < issueDate, 'Due date must strictly precede invoice issue date in Scenario E');
});

test('Synthetic Benchmark Dataset - Duplicate scenario shares identifier with Scenario A', () => {
  const manifestPath = path.join(FIXTURES_DIR, 'manifest.json');
  const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf-8'));

  const scA = manifest.scenarios.find(s => s.scenario_id === 'SCENARIO-A');
  const scF = manifest.scenarios.find(s => s.scenario_id === 'SCENARIO-F');

  assert.equal(scA.expected_supplier, scF.expected_supplier, 'Supplier must match Scenario A');
  assert.equal(scA.expected_invoice_number, scF.expected_invoice_number, 'Invoice number must match Scenario A');
});
