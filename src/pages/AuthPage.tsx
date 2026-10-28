import React, { useState } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { isSupabaseConfigured } from '../lib/supabase';
import { ServiceUnavailable } from '../components/ServiceUnavailable';
import { sanitizeAuthError } from '../lib/authErrors';
import { AlertCircle, CheckCircle2, ArrowRight } from 'lucide-react';
import { BrandLogo } from '../components/BrandLogo';

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
      <div className="min-h-screen bg-[#F6F5F1] p-4 sm:p-6 flex flex-col justify-center">
        <ServiceUnavailable />
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
      setErrorMessage(sanitizeAuthError(err));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F6F5F1] flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        {/* Brand Header */}
        <div className="flex justify-center">
          <BrandLogo to="/" size="lg" />
        </div>

        <h2 className="mt-6 text-center text-[22px] font-bold tracking-tight text-[#111318]">
          {mode === 'signin' ? 'Sign in to your workspace' : 'Create your business account'}
        </h2>
        <p className="mt-1 text-center text-[13px] text-[#525866]">
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
                className="font-medium text-[#1D4ED8] hover:underline"
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
                className="font-medium text-[#1D4ED8] hover:underline"
              >
                Sign in
              </button>
            </>
          )}
        </p>
      </div>

      <div className="mt-6 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-[#FFFFFF] py-7 px-5 sm:px-8 border border-[#E2DFD7] rounded-[4px] shadow-datum">
          {errorMessage && (
            <div className="mb-4 p-3 bg-[#FEF2F2] border border-[#C2410C]/30 rounded-[3px] flex items-start gap-2 text-[12px] text-[#C2410C]">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{errorMessage}</span>
            </div>
          )}

          {infoMessage && (
            <div className="mb-4 p-3 bg-[#EDF7EE] border border-[#15803D]/30 rounded-[3px] flex items-start gap-2 text-[12px] text-[#15803D]">
              <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{infoMessage}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {mode === 'signup' && (
              <div>
                <label htmlFor="workspaceName" className="block text-[12px] font-mono font-medium text-[#111318] mb-1 uppercase tracking-wider">
                  Company / Workspace Name
                </label>
                <input
                  id="workspaceName"
                  type="text"
                  value={workspaceName}
                  onChange={(e) => setWorkspaceName(e.target.value)}
                  placeholder="e.g. Apex Distribution Ltd."
                  className="w-full px-3 py-2 text-[13px] text-[#111318] bg-[#FFFFFF] border border-[#E2DFD7] rounded-[3px] focus-ring"
                />
              </div>
            )}

            <div>
              <label htmlFor="email" className="block text-[12px] font-mono font-medium text-[#111318] mb-1 uppercase tracking-wider">
                Work Email Address
              </label>
              <input
                id="email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="finance@company.com"
                className="w-full px-3 py-2 text-[13px] text-[#111318] bg-[#FFFFFF] border border-[#E2DFD7] rounded-[3px] focus-ring font-mono"
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-[12px] font-mono font-medium text-[#111318] mb-1 uppercase tracking-wider">
                Password
              </label>
              <input
                id="password"
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full px-3 py-2 text-[13px] text-[#111318] bg-[#FFFFFF] border border-[#E2DFD7] rounded-[3px] focus-ring"
              />
            </div>

            <div className="pt-2">
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full inline-flex items-center justify-center py-2.5 px-4 text-[13px] font-medium text-white bg-[#111318] hover:bg-[#20242C] rounded-[3px] transition-colors focus-ring disabled:opacity-60 shadow-datum"
              >
                {isSubmitting ? (
                  <span>Processing...</span>
                ) : (
                  <>
                    <span>{mode === 'signin' ? 'Sign In' : 'Create Workspace Account'}</span>
                    <ArrowRight className="w-3.5 h-3.5 ml-2 text-[#C5C1B6]" />
                  </>
                )}
              </button>
            </div>
          </form>

          <div className="mt-6 pt-4 border-t border-[#E2DFD7] text-center">
            <Link to="/" className="text-[12px] text-[#525866] hover:text-[#111318] hover:underline font-mono">
              ← Return to public website
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};
