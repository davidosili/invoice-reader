import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { FileText, Settings, LogOut, ChevronDown, Check, Building2, User } from 'lucide-react';

export const AppShell: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, workspaces, currentWorkspace, setCurrentWorkspace, signOut } = useAuth();
  const [workspaceMenuOpen, setWorkspaceMenuOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  const isDocumentsActive = location.pathname.startsWith('/app/documents') || location.pathname === '/app';
  const isSettingsActive = location.pathname.startsWith('/app/settings');

  return (
    <div className="min-h-screen bg-[#F7F8F6] flex flex-col text-[#202722]">
      {/* Top Application Bar */}
      <header className="sticky top-0 z-40 bg-[#FFFFFF] border-b border-[#E2E6E1]">
        <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8 h-15 flex items-center justify-between">
          <div className="flex items-center gap-6">
            {/* Brand Logo */}
            <Link to="/" className="flex items-center gap-2 group">
              <div className="w-7 h-7 rounded-[4px] bg-[#176B50] flex items-center justify-center text-white">
                <svg
                  className="w-3.5 h-3.5"
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
              <span className="text-[16px] font-semibold tracking-tight text-[#202722]">
                LedgerLens<span className="text-[#176B50] font-normal ml-0.5">AI</span>
              </span>
              <span className="hidden sm:inline-block text-[11px] font-mono uppercase bg-[#EDF4EF] text-[#176B50] px-1.5 py-0.5 rounded-[3px] border border-[#176B50]/20 ml-1">
                Workspace Console
              </span>
            </Link>

            {/* Workspace Selector Dropdown */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setWorkspaceMenuOpen(!workspaceMenuOpen)}
                className="flex items-center gap-2 px-2.5 py-1.5 text-[13px] font-medium text-[#202722] bg-[#F7F8F6] hover:bg-[#E2E6E1]/50 border border-[#E2E6E1] rounded-[4px] transition-colors focus-ring"
              >
                <Building2 className="w-3.5 h-3.5 text-[#176B50]" />
                <span className="max-w-[140px] sm:max-w-[180px] truncate">
                  {currentWorkspace?.name || 'Loading Workspace...'}
                </span>
                <ChevronDown className="w-3.5 h-3.5 text-[#626B64]" />
              </button>

              {workspaceMenuOpen && (
                <div
                  className="absolute left-0 mt-1 w-64 bg-[#FFFFFF] border border-[#E2E6E1] rounded-[4px] shadow-sm py-1 z-50 text-xs"
                  onMouseLeave={() => setWorkspaceMenuOpen(false)}
                >
                  <div className="px-3 py-1.5 text-[11px] font-semibold uppercase text-[#626B64] border-b border-[#E2E6E1]">
                    Your Workspaces
                  </div>
                  {workspaces.map((ws) => (
                    <button
                      key={ws.id}
                      type="button"
                      onClick={() => {
                        setCurrentWorkspace(ws);
                        setWorkspaceMenuOpen(false);
                      }}
                      className="w-full px-3 py-2 text-left flex items-center justify-between hover:bg-[#F7F8F6] text-[#202722] transition-colors"
                    >
                      <div className="truncate pr-2">
                        <div className="font-medium truncate">{ws.name}</div>
                        <div className="text-[10px] text-[#626B64] capitalize">{ws.role || 'member'}</div>
                      </div>
                      {currentWorkspace?.id === ws.id && (
                        <Check className="w-3.5 h-3.5 text-[#176B50] flex-shrink-0" />
                      )}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Navigation links */}
            <nav className="hidden md:flex items-center gap-1 text-[13px] ml-2">
              <Link
                to="/app/documents"
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-[4px] font-medium transition-colors ${
                  isDocumentsActive
                    ? 'bg-[#EDF4EF] text-[#176B50]'
                    : 'text-[#626B64] hover:text-[#202722] hover:bg-[#F7F8F6]'
                }`}
              >
                <FileText className="w-4 h-4" />
                <span>Documents</span>
              </Link>

              <Link
                to="/app/settings"
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-[4px] font-medium transition-colors ${
                  isSettingsActive
                    ? 'bg-[#EDF4EF] text-[#176B50]'
                    : 'text-[#626B64] hover:text-[#202722] hover:bg-[#F7F8F6]'
                }`}
              >
                <Settings className="w-4 h-4" />
                <span>Settings</span>
              </Link>
            </nav>
          </div>

          {/* User Profile & Sign Out */}
          <div className="flex items-center gap-3">
            <div className="relative">
              <button
                type="button"
                onClick={() => setUserMenuOpen(!userMenuOpen)}
                className="flex items-center gap-2 p-1 text-[13px] text-[#202722] hover:bg-[#F7F8F6] rounded-[4px] border border-transparent hover:border-[#E2E6E1] focus-ring"
              >
                <div className="w-7 h-7 rounded-[4px] bg-[#EDF4EF] flex items-center justify-center text-[#176B50] font-semibold text-xs border border-[#176B50]/20">
                  <User className="w-3.5 h-3.5" />
                </div>
                <span className="hidden sm:inline-block max-w-[150px] truncate text-[13px] font-medium">
                  {user?.email}
                </span>
                <ChevronDown className="w-3 h-3 text-[#626B64]" />
              </button>

              {userMenuOpen && (
                <div
                  className="absolute right-0 mt-1 w-52 bg-[#FFFFFF] border border-[#E2E6E1] rounded-[4px] shadow-sm py-1 z-50 text-xs"
                  onMouseLeave={() => setUserMenuOpen(false)}
                >
                  <div className="px-3 py-2 border-b border-[#E2E6E1]">
                    <p className="font-semibold text-[#202722] truncate">{user?.email}</p>
                    <p className="text-[10px] text-[#626B64] mt-0.5">Role: {currentWorkspace?.role || 'member'}</p>
                  </div>
                  <Link
                    to="/app/settings"
                    onClick={() => setUserMenuOpen(false)}
                    className="flex items-center gap-2 px-3 py-2 text-[#202722] hover:bg-[#F7F8F6]"
                  >
                    <Settings className="w-3.5 h-3.5 text-[#626B64]" />
                    <span>Workspace Settings</span>
                  </Link>
                  <button
                    type="button"
                    onClick={handleSignOut}
                    className="w-full flex items-center gap-2 px-3 py-2 text-[#A33A32] hover:bg-[#A33A32]/10 border-t border-[#E2E6E1]"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                    <span>Sign Out</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Main App Content Viewport */}
      <main className="flex-1 max-w-[1280px] w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {children}
      </main>
    </div>
  );
};
