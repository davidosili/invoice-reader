import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { FileText, Settings, LogOut, ChevronDown, Check, Building2, User } from 'lucide-react';
import { BrandLogo } from './BrandLogo';

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
    <div className="min-h-screen bg-[#F6F5F1] flex flex-col text-[#111318]">
      {/* Top Application Bar */}
      <header className="sticky top-0 z-40 bg-[#FFFFFF] border-b border-[#E2DFD7]">
        <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 h-15 flex items-center justify-between">
          <div className="flex items-center gap-6">
            {/* Brand Logo with Workspace Subtitle */}
            <BrandLogo to="/app/documents" size="sm" subtitle="CONSOLE" />

            {/* Workspace Selector Dropdown */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setWorkspaceMenuOpen(!workspaceMenuOpen)}
                className="flex items-center gap-2 px-2.5 py-1.5 text-[12px] font-mono text-[#111318] bg-[#F6F5F1] hover:bg-[#E2DFD7]/60 border border-[#E2DFD7] rounded-[3px] transition-colors focus-ring"
              >
                <Building2 className="w-3.5 h-3.5 text-[#1D4ED8]" />
                <span className="max-w-[140px] sm:max-w-[180px] truncate font-medium">
                  {currentWorkspace?.name || 'Loading Workspace...'}
                </span>
                <ChevronDown className="w-3 h-3 text-[#525866]" />
              </button>

              {workspaceMenuOpen && (
                <div
                  className="absolute left-0 mt-1 w-64 bg-[#FFFFFF] border border-[#E2DFD7] rounded-[3px] shadow-datum py-1 z-50 text-xs"
                  onMouseLeave={() => setWorkspaceMenuOpen(false)}
                >
                  <div className="px-3 py-1.5 font-mono text-[10px] font-bold uppercase tracking-wider text-[#525866] border-b border-[#E2DFD7]">
                    Workspaces
                  </div>
                  {workspaces.map((ws) => (
                    <button
                      key={ws.id}
                      type="button"
                      onClick={() => {
                        setCurrentWorkspace(ws);
                        setWorkspaceMenuOpen(false);
                      }}
                      className="w-full px-3 py-2 text-left flex items-center justify-between hover:bg-[#F6F5F1] text-[#111318] transition-colors"
                    >
                      <div className="truncate pr-2">
                        <div className="font-medium truncate text-[13px]">{ws.name}</div>
                        <div className="font-mono text-[10px] text-[#525866] capitalize">{ws.role || 'member'}</div>
                      </div>
                      {currentWorkspace?.id === ws.id && (
                        <Check className="w-3.5 h-3.5 text-[#1D4ED8] flex-shrink-0" />
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
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-[3px] font-medium transition-colors ${
                  isDocumentsActive
                    ? 'bg-[#111318] text-white shadow-datum'
                    : 'text-[#525866] hover:text-[#111318] hover:bg-[#F6F5F1]'
                }`}
              >
                <FileText className="w-3.5 h-3.5" />
                <span>Documents</span>
              </Link>

              <Link
                to="/app/settings"
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-[3px] font-medium transition-colors ${
                  isSettingsActive
                    ? 'bg-[#111318] text-white shadow-datum'
                    : 'text-[#525866] hover:text-[#111318] hover:bg-[#F6F5F1]'
                }`}
              >
                <Settings className="w-3.5 h-3.5" />
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
                className="flex items-center gap-2 p-1 text-[13px] text-[#111318] hover:bg-[#F6F5F1] rounded-[3px] border border-transparent hover:border-[#E2DFD7] focus-ring"
              >
                <div className="w-7 h-7 rounded-[3px] bg-[#F6F5F1] flex items-center justify-center text-[#111318] font-semibold text-xs border border-[#E2DFD7]">
                  <User className="w-3.5 h-3.5" />
                </div>
                <span className="hidden sm:inline-block max-w-[150px] truncate text-[12px] font-mono text-[#525866]">
                  {user?.email}
                </span>
                <ChevronDown className="w-3 h-3 text-[#525866]" />
              </button>

              {userMenuOpen && (
                <div
                  className="absolute right-0 mt-1 w-52 bg-[#FFFFFF] border border-[#E2DFD7] rounded-[3px] shadow-datum py-1 z-50 text-xs"
                  onMouseLeave={() => setUserMenuOpen(false)}
                >
                  <div className="px-3 py-2 border-b border-[#E2DFD7]">
                    <p className="font-semibold text-[#111318] truncate">{user?.email}</p>
                    <p className="font-mono text-[10px] text-[#525866] mt-0.5">Role: {currentWorkspace?.role || 'member'}</p>
                  </div>
                  <Link
                    to="/app/settings"
                    onClick={() => setUserMenuOpen(false)}
                    className="flex items-center gap-2 px-3 py-2 text-[#111318] hover:bg-[#F6F5F1]"
                  >
                    <Settings className="w-3.5 h-3.5 text-[#525866]" />
                    <span>Workspace Settings</span>
                  </Link>
                  <button
                    type="button"
                    onClick={handleSignOut}
                    className="w-full flex items-center gap-2 px-3 py-2 text-[#C2410C] hover:bg-[#FEF2F2] border-t border-[#E2DFD7]"
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
      <main className="flex-1 max-w-[1400px] w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {children}
      </main>
    </div>
  );
};
