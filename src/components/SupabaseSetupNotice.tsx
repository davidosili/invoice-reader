import React from 'react';
import { Database, Key, Check, Copy } from 'lucide-react';
import { getSupabaseConfigStatus } from '../lib/supabase';

export const SupabaseSetupNotice: React.FC = () => {
  const [copied, setCopied] = React.useState(false);
  const status = getSupabaseConfigStatus();

  const envSnippet = `VITE_SUPABASE_URL=https://your-project-id.supabase.co\nVITE_SUPABASE_ANON_KEY=your-actual-anon-key`;

  const copySnippet = () => {
    navigator.clipboard.writeText(envSnippet);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <div className="max-w-[760px] mx-auto my-6 sm:my-12 p-4 sm:p-8 bg-[#FFFFFF] border border-[#E2E6E1] rounded-[6px] shadow-sm">
      <div className="flex items-center gap-2.5 pb-4 border-b border-[#E2E6E1]">
        <div className="w-8 h-8 rounded-[4px] bg-[#EDF4EF] flex items-center justify-center text-[#176B50]">
          <Database className="w-4 h-4" />
        </div>
        <div>
          <h2 className="text-[18px] font-bold text-[#202722]">
            Supabase Backend Configuration Required
          </h2>
          <p className="text-[13px] text-[#626B64]">
            LedgerLens AI application console requires an active Supabase project.
          </p>
        </div>
      </div>

      <div className="mt-5 space-y-4 text-[14px] text-[#202722] leading-relaxed">
        <p>
          To maintain data integrity and security, LedgerLens AI does not simulate mock authentication or store
          invoice documents in transient browser memory.
        </p>

        {/* Current status display */}
        <div className="p-4 bg-[#F7F8F6] border border-[#E2E6E1] rounded-[4px] text-xs space-y-1.5 font-mono">
          <div className="flex items-center justify-between">
            <span className="text-[#626B64]">VITE_SUPABASE_URL:</span>
            <span className={status.hasUrl ? 'text-[#176B50] font-semibold' : 'text-[#A33A32] font-semibold'}>
              {status.hasUrl ? status.urlValue : 'Not configured'}
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-[#626B64]">VITE_SUPABASE_ANON_KEY:</span>
            <span className={status.hasAnonKey ? 'text-[#176B50] font-semibold' : 'text-[#A33A32] font-semibold'}>
              {status.hasAnonKey ? 'Present (Placeholder/Incomplete)' : 'Not configured'}
            </span>
          </div>
        </div>

        <h3 className="text-[15px] font-bold text-[#202722] pt-2">
          Setup Instructions:
        </h3>

        <ol className="space-y-3 pl-1 text-[13px] text-[#626B64]">
          <li className="flex items-start gap-2">
            <span className="font-mono text-[#176B50] font-bold">1.</span>
            <span>
              Create or open a project in the{' '}
              <a
                href="https://supabase.com"
                target="_blank"
                rel="noreferrer"
                className="text-[#176B50] underline font-medium"
              >
                Supabase Dashboard
              </a>
              .
            </span>
          </li>

          <li className="flex items-start gap-2">
            <span className="font-mono text-[#176B50] font-bold">2.</span>
            <span>
              In your project root directory, create a <code className="bg-[#F7F8F6] px-1 py-0.5 rounded-[3px] border border-[#E2E6E1] text-[#202722]">.env</code> file with your client API keys:
            </span>
          </li>
        </ol>

        {/* Environment snippet */}
        <div className="relative mt-2">
          <pre className="p-3 pr-16 sm:p-3.5 bg-[#202722] text-[#F7F8F6] rounded-[4px] font-mono text-[11px] sm:text-[12px] overflow-x-auto whitespace-pre-wrap break-all sm:break-normal">
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

        <ol start={3} className="space-y-3 pl-1 text-[13px] text-[#626B64] pt-1">
          <li className="flex items-start gap-2">
            <span className="font-mono text-[#176B50] font-bold">3.</span>
            <span>
              Apply the SQL migrations located in <code className="bg-[#F7F8F6] px-1 py-0.5 rounded-[3px] border border-[#E2E6E1] text-[#202722]">supabase/migrations/</code> in your Supabase SQL Editor:
              <ul className="list-disc list-inside mt-1 space-y-0.5 text-[12px]">
                <li><code className="text-[#202722]">20261019000001_initial_schema.sql</code> (workspaces, members, documents & RLS)</li>
                <li><code className="text-[#202722]">20261019000002_storage_setup.sql</code> (private invoices storage bucket & policies)</li>
              </ul>
            </span>
          </li>

          <li className="flex items-start gap-2">
            <span className="font-mono text-[#176B50] font-bold">4.</span>
            <span>
              Restart the local development server (<code className="bg-[#F7F8F6] px-1 py-0.5 rounded-[3px] border border-[#E2E6E1] text-[#202722]">npm run dev</code>) so Vite loads the new environment variables.
            </span>
          </li>
        </ol>

        <div className="pt-4 border-t border-[#E2E6E1] flex items-center justify-between text-xs text-[#626B64]">
          <span className="flex items-center gap-1">
            <Key className="w-3.5 h-3.5 text-[#176B50]" />
            Client Anon Key only. Service role keys must never be exposed.
          </span>
          <a href="/" className="text-[#176B50] font-medium hover:underline">
            ← Return to Homepage
          </a>
        </div>
      </div>
    </div>
  );
};
