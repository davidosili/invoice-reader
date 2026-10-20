import React, { useState } from 'react';
import { Key, Check, Copy, ShieldAlert } from 'lucide-react';
import { getSupabaseConfigStatus } from '../lib/supabase';

export const OperatorDiagnostics: React.FC = () => {
  const [copied, setCopied] = useState(false);
  const status = getSupabaseConfigStatus();

  const envSnippet = `VITE_SUPABASE_URL=https://your-project-id.supabase.co\nVITE_SUPABASE_ANON_KEY=your-actual-anon-key`;

  const copySnippet = () => {
    navigator.clipboard.writeText(envSnippet);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <div className="mt-8 pt-6 border-t border-[#E2E6E1] text-left">
      <div className="flex items-center gap-2 mb-3">
        <ShieldAlert className="w-4 h-4 text-[#176B50]" />
        <h3 className="text-[13px] font-bold text-[#202722] uppercase tracking-wider">
          Internal Operator Diagnostics (Owner / Developer View)
        </h3>
      </div>

      <p className="text-[12px] text-[#626B64] mb-4 leading-relaxed">
        This panel is available in development mode (<code className="font-mono text-[#202722]">import.meta.env.DEV</code>)
        or via <code className="font-mono text-[#202722]">?diagnostics=1</code>. Ordinary customers only see the neutral service notice above.
      </p>

      {/* Configuration Status */}
      <div className="p-3.5 bg-[#F7F8F6] border border-[#E2E6E1] rounded-[4px] text-xs font-mono space-y-2 mb-4">
        <div className="flex items-center justify-between">
          <span className="text-[#626B64]">VITE_SUPABASE_URL:</span>
          <span className={status.hasUrl ? 'text-[#176B50] font-semibold' : 'text-[#A33A32] font-semibold'}>
            {status.hasUrl ? status.urlValue : 'Not configured'}
          </span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-[#626B64]">VITE_SUPABASE_ANON_KEY:</span>
          <span className={status.hasAnonKey ? 'text-[#176B50] font-semibold' : 'text-[#A33A32] font-semibold'}>
            {status.hasAnonKey ? 'Present (Public Anon Key)' : 'Not configured'}
          </span>
        </div>
      </div>

      <h4 className="text-[12px] font-bold text-[#202722] uppercase tracking-wider mb-2">
        One-Time Production SaaS Setup Checklist:
      </h4>

      <ol className="space-y-2 text-[12px] text-[#626B64] list-decimal list-inside pl-1">
        <li>
          The product owner configures <strong>one central Supabase project</strong> for the LedgerLens SaaS.
        </li>
        <li>
          Deploy environment variables <code className="text-[#202722] font-mono">VITE_SUPABASE_URL</code> and{' '}
          <code className="text-[#202722] font-mono">VITE_SUPABASE_ANON_KEY</code> to the hosting platform.
        </li>
        <li>
          Apply database migrations in the Supabase SQL Editor:
          <ul className="list-disc list-inside ml-4 mt-1 space-y-0.5 text-[11px]">
            <li><code className="text-[#202722]">supabase/migrations/20261019000001_initial_schema.sql</code> (Workspaces, Members, Documents, RLS)</li>
            <li><code className="text-[#202722]">supabase/migrations/20261019000002_storage_setup.sql</code> (Private invoices bucket & Storage RLS)</li>
          </ul>
        </li>
        <li>
          Configure Auth Redirect URLs in Supabase Dashboard (e.g. <code className="text-[#202722] font-mono">https://app.ledgerlens.ai/**</code>).
        </li>
      </ol>

      {/* Snippet box */}
      <div className="relative mt-3">
        <pre className="p-3 pr-16 bg-[#202722] text-[#F7F8F6] rounded-[4px] font-mono text-[11px] overflow-x-auto whitespace-pre-wrap break-all sm:break-normal">
          {envSnippet}
        </pre>
        <button
          type="button"
          onClick={copySnippet}
          className="absolute top-2 right-2 px-2 py-1 text-[11px] font-medium bg-[#FFFFFF] text-[#202722] rounded-[3px] border border-[#E2E6E1] hover:bg-[#F7F8F6] flex items-center gap-1 transition-colors"
        >
          {copied ? <Check className="w-3 h-3 text-[#176B50]" /> : <Copy className="w-3 h-3 text-[#626B64]" />}
          {copied ? 'Copied' : 'Copy'}
        </button>
      </div>

      <div className="mt-3 text-[11px] text-[#626B64] flex items-center gap-1.5">
        <Key className="w-3.5 h-3.5 text-[#176B50]" />
        <span>Client Anon Key only. Service-role keys and AI provider secrets are never stored in client code.</span>
      </div>
    </div>
  );
};
