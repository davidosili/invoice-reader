import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { createWorkspace } from '../lib/api';
import { Building2, User, Plus, Check, AlertCircle } from 'lucide-react';

export const SettingsPage: React.FC = () => {
  const { currentWorkspace, user, refreshWorkspaces } = useAuth();
  const [newWsName, setNewWsName] = useState('');
  const [isCreating, setIsCreating] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleCreateWorkspace = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newWsName.trim()) return;

    setIsCreating(true);
    setSuccessMessage(null);
    setErrorMessage(null);

    try {
      await createWorkspace(newWsName.trim());
      await refreshWorkspaces();
      setSuccessMessage(`Workspace "${newWsName.trim()}" created successfully.`);
      setNewWsName('');
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to create workspace.');
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl">
      <div className="pb-4 border-b border-[#E2E6E1]">
        <h1 className="text-[22px] font-bold text-[#202722] tracking-tight">
          Workspace Settings
        </h1>
        <p className="text-[13px] text-[#626B64] mt-0.5">
          Manage your organizational workspace and access preferences.
        </p>
      </div>

      {successMessage && (
        <div className="p-3 bg-[#EDF4EF] border border-[#176B50]/30 rounded-[4px] flex items-center gap-2 text-[13px] text-[#176B50]">
          <Check className="w-4 h-4" />
          <span>{successMessage}</span>
        </div>
      )}

      {errorMessage && (
        <div className="p-3 bg-[#A33A32]/10 border border-[#A33A32]/30 rounded-[4px] flex items-center gap-2 text-[13px] text-[#A33A32]">
          <AlertCircle className="w-4 h-4" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* Active Workspace Info */}
      <div className="bg-[#FFFFFF] border border-[#E2E6E1] rounded-[6px] p-6 shadow-sm space-y-4">
        <div className="flex items-center gap-2 pb-3 border-b border-[#E2E6E1]">
          <Building2 className="w-4 h-4 text-[#176B50]" />
          <h2 className="text-[16px] font-bold text-[#202722]">
            Current Workspace Details
          </h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-[13px]">
          <div>
            <span className="text-[#626B64] block">Workspace Name:</span>
            <span className="font-semibold text-[#202722]">{currentWorkspace?.name}</span>
          </div>

          <div>
            <span className="text-[#626B64] block">Your Role:</span>
            <span className="capitalize font-mono text-[#176B50] font-medium">
              {currentWorkspace?.role || 'member'}
            </span>
          </div>

          <div>
            <span className="text-[#626B64] block">Workspace ID:</span>
            <span className="font-mono text-xs text-[#626B64]">{currentWorkspace?.id}</span>
          </div>

          <div>
            <span className="text-[#626B64] block">Created At:</span>
            <span className="font-mono text-xs text-[#626B64]">
              {currentWorkspace?.created_at ? new Date(currentWorkspace.created_at).toLocaleDateString() : 'N/A'}
            </span>
          </div>
        </div>
      </div>

      {/* Create New Workspace */}
      <div className="bg-[#FFFFFF] border border-[#E2E6E1] rounded-[6px] p-6 shadow-sm space-y-4">
        <div className="flex items-center gap-2 pb-3 border-b border-[#E2E6E1]">
          <Plus className="w-4 h-4 text-[#176B50]" />
          <h2 className="text-[16px] font-bold text-[#202722]">
            Create Additional Workspace
          </h2>
        </div>

        <p className="text-[13px] text-[#626B64]">
          Workspaces isolate document archives, invoice metadata, and access permissions.
        </p>

        <form onSubmit={handleCreateWorkspace} className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-end">
          <div className="flex-1">
            <label htmlFor="wsName" className="block text-[12px] font-medium text-[#202722] mb-1">
              New Workspace Name
            </label>
            <input
              id="wsName"
              type="text"
              value={newWsName}
              onChange={(e) => setNewWsName(e.target.value)}
              placeholder="e.g. North Region Procurement"
              className="w-full px-3 py-2 text-[13px] text-[#202722] bg-[#FFFFFF] border border-[#E2E6E1] rounded-[4px] focus-ring"
            />
          </div>

          <button
            type="submit"
            disabled={isCreating || !newWsName.trim()}
            className="px-4 py-2 text-[13px] font-medium text-white bg-[#176B50] hover:bg-[#12563F] rounded-[4px] transition-colors focus-ring disabled:opacity-50"
          >
            {isCreating ? 'Creating...' : 'Create Workspace'}
          </button>
        </form>
      </div>

      {/* User Session Profile */}
      <div className="bg-[#FFFFFF] border border-[#E2E6E1] rounded-[6px] p-6 shadow-sm space-y-3">
        <div className="flex items-center gap-2 pb-3 border-b border-[#E2E6E1]">
          <User className="w-4 h-4 text-[#176B50]" />
          <h2 className="text-[16px] font-bold text-[#202722]">
            User Account
          </h2>
        </div>

        <div className="text-[13px] space-y-1">
          <div><span className="text-[#626B64]">Authenticated Email:</span> <strong className="text-[#202722]">{user?.email}</strong></div>
          <div><span className="text-[#626B64]">User ID:</span> <span className="font-mono text-xs text-[#626B64]">{user?.id}</span></div>
          <div><span className="text-[#626B64]">Last Sign In:</span> <span className="font-mono text-xs text-[#626B64]">{user?.last_sign_in_at ? new Date(user.last_sign_in_at).toLocaleString() : 'Active Session'}</span></div>
        </div>
      </div>
    </div>
  );
};
