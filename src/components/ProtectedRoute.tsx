import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { isSupabaseConfigured } from '../lib/supabase';
import { SupabaseSetupNotice } from './SupabaseSetupNotice';
import { AppShell } from './AppShell';

export const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, isLoading } = useAuth();
  const location = useLocation();

  // If Supabase backend configuration is missing, present clear setup guide
  if (!isSupabaseConfigured) {
    return (
      <div className="min-h-screen bg-[#F7F8F6] p-4 sm:p-6 flex flex-col justify-center">
        <SupabaseSetupNotice />
      </div>
    );
  }

  // Session verification loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#FFFFFF] flex items-center justify-center p-4">
        <div className="flex flex-col items-center gap-3">
          <div className="w-6 h-6 border-2 border-[#176B50] border-t-transparent rounded-full animate-spin" />
          <span className="text-[13px] text-[#626B64] font-medium">Verifying session...</span>
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
