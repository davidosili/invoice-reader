import { createClient } from '@supabase/supabase-js';
import fs from 'node:fs';
import path from 'node:path';

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

const clientEnv = loadEnvFile('.env');
const serverEnv = loadEnvFile('.env.server');

const SUPABASE_URL = process.env.VITE_SUPABASE_URL || clientEnv.VITE_SUPABASE_URL || serverEnv.SUPABASE_URL;
const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || serverEnv.SUPABASE_SERVICE_ROLE_KEY;

const client = createClient(SUPABASE_URL, SERVICE_KEY, {
  auth: { autoRefreshToken: false, persistSession: false },
});

console.log('Testing existing tables in Supabase...');
for (const table of ['workspaces', 'workspace_members', 'documents', 'invoice_extractions', 'invoice_validation_issues', 'invoice_audit_events']) {
  const { data, error } = await client.from(table).select('count').limit(0);
  if (error) {
    console.log(`❌ Table '${table}': ${error.message} (${error.code})`);
  } else {
    console.log(`✅ Table '${table}': EXISTS`);
  }
}
