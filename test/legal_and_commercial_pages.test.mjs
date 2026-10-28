import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';

const ROOT_DIR = process.cwd();

test('Legal & Commercial Pages - Route definitions in App.tsx', () => {
  const appFile = fs.readFileSync(path.join(ROOT_DIR, 'src', 'App.tsx'), 'utf-8');
  assert.ok(appFile.includes('path="/privacy"'), 'App.tsx must define /privacy route');
  assert.ok(appFile.includes('path="/terms"'), 'App.tsx must define /terms route');
  assert.ok(appFile.includes('path="/pricing"'), 'App.tsx must define /pricing route');
  assert.ok(appFile.includes('<PrivacyPage />'), 'App.tsx must render PrivacyPage');
  assert.ok(appFile.includes('<TermsPage />'), 'App.tsx must render TermsPage');
  assert.ok(appFile.includes('<PricingPage />'), 'App.tsx must render PricingPage');
});

test('Legal & Commercial Pages - Navigation bar links', () => {
  const navbarFile = fs.readFileSync(path.join(ROOT_DIR, 'src', 'components', 'Navbar.tsx'), 'utf-8');
  assert.ok(navbarFile.includes('to="/pricing"'), 'Navbar must link to /pricing');
  assert.ok(navbarFile.includes('to="/about"'), 'Navbar must link to /about');
  assert.ok(navbarFile.includes('to="/app/auth"'), 'Navbar must link to /app/auth');
});

test('Legal & Commercial Pages - Footer links and verified contact', () => {
  const footerFile = fs.readFileSync(path.join(ROOT_DIR, 'src', 'components', 'Footer.tsx'), 'utf-8');
  assert.ok(footerFile.includes('to="/privacy"'), 'Footer must link to /privacy');
  assert.ok(footerFile.includes('to="/terms"'), 'Footer must link to /terms');
  assert.ok(footerFile.includes('to="/pricing"'), 'Footer must link to /pricing');
  assert.ok(footerFile.includes('support@myledgerlens.com'), 'Footer must reference verified support email');
  assert.ok(footerFile.includes('David Osili'), 'Footer must credit founder David Osili');
});

test('Privacy Policy - Disclosures and truthful architecture claims', () => {
  const privacyFile = fs.readFileSync(path.join(ROOT_DIR, 'src', 'pages', 'PrivacyPage.tsx'), 'utf-8');
  assert.ok(privacyFile.includes('October 23, 2026'), 'Privacy policy must cite actual publication date');
  assert.ok(privacyFile.includes('gemini-2.5-flash'), 'Privacy policy must disclose Google Gemini 2.5 Flash');
  assert.ok(privacyFile.includes('Supabase'), 'Privacy policy must disclose Supabase');
  assert.ok(privacyFile.includes('Vercel'), 'Privacy policy must disclose Vercel');
  assert.ok(privacyFile.includes('server_heuristic_v1'), 'Privacy policy must disclose heuristic fallback extractor');
  assert.ok(privacyFile.includes('Row Level Security') || privacyFile.includes('RLS'), 'Privacy policy must disclose RLS');
  assert.ok(privacyFile.includes('invoice_audit_events'), 'Privacy policy must disclose immutable audit trail');
  assert.ok(privacyFile.includes('sell, rent, or trade'), 'Privacy policy must state no sale of data');
  assert.ok(privacyFile.includes('train public foundation models'), 'Privacy policy must explicitly state no training on customer documents');
  assert.ok(privacyFile.includes('[LEGAL_ENTITY_NAME'), 'Privacy policy must use explicit pre-launch placeholder for entity');
  assert.ok(privacyFile.includes('[LEGAL_BUSINESS_ADDRESS'), 'Privacy policy must use explicit pre-launch placeholder for address');
});

test('Terms of Service - Disclaimers and operational truth', () => {
  const termsFile = fs.readFileSync(path.join(ROOT_DIR, 'src', 'pages', 'TermsPage.tsx'), 'utf-8');
  assert.ok(termsFile.includes('October 23, 2026'), 'Terms must cite actual publication date');
  assert.ok(termsFile.includes('certified public accountant') || termsFile.includes('certified accounting'), 'Terms must explicitly state platform is not a CPA/fiduciary');
  assert.ok(termsFile.includes('Mandatory Human Verification') || termsFile.includes('human verification'), 'Terms must require human review before business reliance');
  assert.ok(termsFile.includes('Deterministic Calculations') && termsFile.includes('Probabilistic AI Extraction'), 'Terms must distinguish deterministic math from probabilistic AI');
  assert.ok(termsFile.includes('AS-IS') && termsFile.includes('AS-AVAILABLE'), 'Terms must include AS-IS disclaimer');
  assert.ok(termsFile.includes('proposed commercial model'), 'Terms must state that paid tiers are proposed');
  assert.ok(termsFile.includes('support@myledgerlens.com'), 'Terms must provide working contact email');
});

test('Pricing Page - Honest commercial positioning without false billing claims', () => {
  const pricingFile = fs.readFileSync(path.join(ROOT_DIR, 'src', 'pages', 'PricingPage.tsx'), 'utf-8');
  assert.ok(pricingFile.includes('proposed commercial model'), 'Pricing page must declare proposed commercial model');
  assert.ok(pricingFile.includes('Starter'), 'Pricing page must include Starter tier');
  assert.ok(pricingFile.includes('Business'), 'Pricing page must include Business tier');
  assert.ok(pricingFile.includes('Professional'), 'Pricing page must include Professional tier');
  assert.ok(pricingFile.includes('USD'), 'Pricing page must explicitly label currency as USD');
  assert.ok(pricingFile.includes('Nigerian Naira') || pricingFile.includes('NGN'), 'Pricing page must address local regional currency');
  assert.ok(pricingFile.includes('/app/auth'), 'Pricing page CTA must direct to functional auth route');
  assert.ok(pricingFile.includes('mailto:support@myledgerlens.com'), 'Pricing page CTA must provide working pilot email link');
  assert.ok(!pricingFile.includes('checkout.stripe.com'), 'Pricing page must not link to fake checkout URLs');
  assert.ok(!pricingFile.includes('credit card required'), 'Pricing page must not falsely claim credit card requirement');
});
