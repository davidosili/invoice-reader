import React, { useState } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { isSupabaseConfigured } from '../lib/supabase';
import { SupabaseSetupNotice } from '../components/SupabaseSetupNotice';
import { AlertCircle, CheckCircle2, ArrowRight } from 'lucide-react';

export const AuthPage: React.FC = () => {
  const [mode, setMode] = useState<'signin' | 'signup'>('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [workspaceName, setWorkspaceName] = useState('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [infoMessage, setInfoMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { signIn, signUp, user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // If already logged in, redirect to documents
  React.useEffect(() => {
    if (user) {
      const returnPath = (location.state as any)?.from?.pathname || '/app/documents';
      navigate(returnPath, { replace: true });
    }
  }, [user, navigate, location]);

  if (!isSupabaseConfigured) {
    return (
      <div className="min-h-screen bg-[#F7F8F6] p-4 sm:p-6 flex flex-col justify-center">
        <SupabaseSetupNotice />
      </div>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setInfoMessage(null);

    if (!email.trim() || !password) {
      setErrorMessage('Please enter both your email and password.');
      return;
    }

    if (password.length < 6) {
      setErrorMessage('Password must be at least 6 characters.');
      return;
    }

    setIsSubmitting(true);

    try {
      if (mode === 'signin') {
        await signIn(email, password);
        const returnPath = (location.state as any)?.from?.pathname || '/app/documents';
        navigate(returnPath, { replace: true });
      } else {
        const { needsConfirmation } = await signUp(email, password, workspaceName.trim() || undefined);
        if (needsConfirmation) {
          setInfoMessage('Account created. Please check your email to confirm your address before signing in.');
          setMode('signin');
        } else {
          // Direct login (when email confirmation is disabled in Supabase)
          const returnPath = (location.state as any)?.from?.pathname || '/app/documents';
          navigate(returnPath, { replace: true });
        }
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'Authentication failed. Please verify your credentials.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F7F8F6] flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        {/* Brand Header */}
        <div className="flex justify-center">
          <Link to="/" className="flex items-center gap-2 group">
            <div className="w-8 h-8 rounded-[4px] bg-[#176B50] flex items-center justify-center text-white">
              <svg
                className="w-4 h-4"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                <polyline points="14 2 14 8 20 8" />
                <path d="m9 15 2 2 4-4" />
              </svg>
            </div>
            <span className="text-[19px] font-semibold tracking-tight text-[#202722]">
              LedgerLens<span className="text-[#176B50] font-normal ml-0.5">AI</span>
            </span>
          </Link>
        </div>

        <h2 className="mt-5 text-center text-[24px] font-bold tracking-tight text-[#202722]">
          {mode === 'signin' ? 'Sign in to your workspace' : 'Create your business account'}
        </h2>
        <p className="mt-1 text-center text-[13px] text-[#626B64]">
          {mode === 'signin' ? (
            <>
              New to LedgerLens AI?{' '}
              <button
                type="button"
                onClick={() => {
                  setMode('signup');
                  setErrorMessage(null);
                  setInfoMessage(null);
                }}
                className="font-medium text-[#176B50] hover:underline"
              >
                Create a workspace
              </button>
            </>
          ) : (
            <>
              Already have an account?{' '}
              <button
                type="button"
                onClick={() => {
                  setMode('signin');
                  setErrorMessage(null);
                  setInfoMessage(null);
                }}
                className="font-medium text-[#176B50] hover:underline"
              >
                Sign in
              </button>
            </>
          )}
        </p>
      </div>

      <div className="mt-6 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-[#FFFFFF] py-7 px-5 sm:px-8 border border-[#E2E6E1] rounded-[6px] shadow-sm">
          {errorMessage && (
            <div className="mb-4 p-3 bg-[#A33A32]/10 border border-[#A33A32]/30 rounded-[4px] flex items-start gap-2 text-[13px] text-[#A33A32]">
              <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
              <span>{errorMessage}</span>
            </div>
          )}

          {infoMessage && (
            <div className="mb-4 p-3 bg-[#EDF4EF] border border-[#176B50]/30 rounded-[4px] flex items-start gap-2 text-[13px] text-[#176B50]">
              <CheckCircle2 className="w-4 h-4 flex-shrink-0 mt-0.5" />
              <span>{infoMessage}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {mode === 'signup' && (
              <div>
                <label htmlFor="workspaceName" className="block text-[13px] font-medium text-[#202722] mb-1">
                  Company / Workspace Name
                </label>
                <input
                  id="workspaceName"
                  type="text"
                  value={workspaceName}
                  onChange={(e) => setWorkspaceName(e.target.value)}
                  placeholder="e.g. Acme Wholesale Ltd."
                  className="w-full px-3 py-2 text-[14px] text-[#202722] bg-[#FFFFFF] border border-[#E2E6E1] rounded-[4px] focus-ring"
                />
              </div>
            )}

            <div>
              <label htmlFor="email" className="block text-[13px] font-medium text-[#202722] mb-1">
                Work Email Address
              </label>
              <input
                id="email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@company.com"
                className="w-full px-3 py-2 text-[14px] text-[#202722] bg-[#FFFFFF] border border-[#E2E6E1] rounded-[4px] focus-ring"
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-[13px] font-medium text-[#202722] mb-1">
                Password
              </label>
              <input
                id="password"
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full px-3 py-2 text-[14px] text-[#202722] bg-[#FFFFFF] border border-[#E2E6E1] rounded-[4px] focus-ring"
              />
            </div>

            <div className="pt-2">
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full inline-flex items-center justify-center py-2.5 px-4 text-[14px] font-medium text-white bg-[#176B50] hover:bg-[#12563F] rounded-[4px] transition-colors focus-ring disabled:opacity-60"
              >
                {isSubmitting ? (
                  <span>Processing...</span>
                ) : (
                  <>
                    <span>{mode === 'signin' ? 'Sign In' : 'Create Workspace Account'}</span>
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </>
                )}
              </button>
            </div>
          </form>

          <div className="mt-6 pt-4 border-t border-[#E2E6E1] text-center">
            <Link to="/" className="text-[13px] text-[#626B64] hover:text-[#202722] hover:underline">
              ← Return to public website
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};
