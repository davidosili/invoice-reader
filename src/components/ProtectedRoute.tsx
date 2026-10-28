import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { isSupabaseConfigured } from '../lib/supabase';
import { ServiceUnavailable } from './ServiceUnavailable';
import { AppShell } from './AppShell';

export const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, isLoading } = useAuth();
  const location = useLocation();

  // If backend configuration is missing, present customer-safe service unavailable screen
  if (!isSupabaseConfigured) {
    return (
      <div className="min-h-screen bg-[#F6F5F1] p-4 sm:p-6 flex flex-col justify-center">
        <ServiceUnavailable />
      </div>
    );
  }

  // Session verification loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#F6F5F1] flex items-center justify-center p-4">
        <div className="flex flex-col items-center gap-3">
          <div className="w-5 h-5 border-2 border-[#1D4ED8] border-t-transparent rounded-full animate-spin" />
          <span className="text-[12px] font-mono text-[#525866] font-medium">Verifying workspace session...</span>
        </div>
      </div>
    );
  }

  // Not authenticated -> redirect to sign-in page with return route
  if (!user) {
    return <Navigate to="/app/auth" state={{ from: location }} replace />;
  }

  // Authenticated -> wrap with application shell
  return <AppShell>{children}</AppShell>;
};
