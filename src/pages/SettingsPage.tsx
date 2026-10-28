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
      <div className="pb-4 border-b border-[#E2DFD7]">
        <div className="font-mono text-[11px] uppercase tracking-wider text-[#1D4ED8] mb-1">
          REGISTER // CONFIG // WORKSPACE
        </div>
        <h1 className="text-[24px] font-bold text-[#111318] tracking-tight">
          Workspace Settings
        </h1>
        <p className="text-[14px] text-[#5A5852] mt-0.5">
          Manage your organizational workspace, isolation boundaries, and session credentials.
        </p>
      </div>

      {successMessage && (
        <div className="p-3.5 bg-[#EBF3EE] border border-[#1B4938]/30 rounded-[4px] flex items-center gap-2.5 text-[13px] text-[#1B4938] font-mono">
          <Check className="w-4 h-4 flex-shrink-0" />
          <span>{successMessage}</span>
        </div>
      )}

      {errorMessage && (
        <div className="p-3.5 bg-[#FEF2F2] border border-[#C2410C]/30 rounded-[4px] flex items-center gap-2.5 text-[13px] text-[#C2410C] font-mono">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* Active Workspace Info */}
      <div className="relative bg-[#FFFFFF] border border-[#E2DFD7] rounded-[4px] p-6 shadow-sm space-y-4">
        <span className="absolute top-1.5 left-2 font-mono text-[10px] text-[#A8A49C] pointer-events-none select-none">+</span>
        <span className="absolute top-1.5 right-2 font-mono text-[10px] text-[#A8A49C] pointer-events-none select-none">+</span>

        <div className="flex items-center gap-2 pb-3 border-b border-[#E2DFD7]">
          <Building2 className="w-4 h-4 text-[#1D4ED8]" />
          <h2 className="text-[15px] font-bold text-[#111318] tracking-tight">
            Current Workspace Details
          </h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-[13px]">
          <div>
            <span className="text-[#5A5852] block text-[12px] uppercase font-mono">Workspace Name</span>
            <span className="font-semibold text-[#111318] text-[14px]">{currentWorkspace?.name}</span>
          </div>

          <div>
            <span className="text-[#5A5852] block text-[12px] uppercase font-mono">Your Role</span>
            <span className="inline-block mt-0.5 font-mono text-xs px-2 py-0.5 bg-[#EBF3EE] text-[#1B4938] border border-[#1B4938]/30 font-medium">
              [{currentWorkspace?.role ? currentWorkspace.role.toUpperCase() : 'MEMBER'}]
            </span>
          </div>

          <div>
            <span className="text-[#5A5852] block text-[12px] uppercase font-mono">Workspace ID</span>
            <span className="font-mono text-xs text-[#5A5852] select-all">{currentWorkspace?.id}</span>
          </div>

          <div>
            <span className="text-[#5A5852] block text-[12px] uppercase font-mono">Created At</span>
            <span className="font-mono text-xs text-[#5A5852]">
              {currentWorkspace?.created_at ? new Date(currentWorkspace.created_at).toLocaleDateString() : 'N/A'}
            </span>
          </div>
        </div>
      </div>

      {/* Create New Workspace */}
      <div className="relative bg-[#FFFFFF] border border-[#E2DFD7] rounded-[4px] p-6 shadow-sm space-y-4">
        <span className="absolute top-1.5 left-2 font-mono text-[10px] text-[#A8A49C] pointer-events-none select-none">+</span>
        <span className="absolute top-1.5 right-2 font-mono text-[10px] text-[#A8A49C] pointer-events-none select-none">+</span>

        <div className="flex items-center gap-2 pb-3 border-b border-[#E2DFD7]">
          <Plus className="w-4 h-4 text-[#1D4ED8]" />
          <h2 className="text-[15px] font-bold text-[#111318] tracking-tight">
            Create Additional Workspace
          </h2>
        </div>

        <p className="text-[13px] text-[#5A5852]">
          Workspaces isolate document archives, invoice metadata, audit logs, and access permissions.
        </p>

        <form onSubmit={handleCreateWorkspace} className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-end">
          <div className="flex-1">
            <label htmlFor="wsName" className="block text-[11px] font-mono uppercase tracking-wider text-[#111318] mb-1.5">
              New Workspace Name
            </label>
            <input
              id="wsName"
              type="text"
              value={newWsName}
              onChange={(e) => setNewWsName(e.target.value)}
              placeholder="e.g. North Region Procurement"
              className="w-full px-3 py-2 text-[13px] text-[#111318] bg-[#FAFAF8] border border-[#E2DFD7] rounded-[4px] focus-ring"
            />
          </div>

          <button
            type="submit"
            disabled={isCreating || !newWsName.trim()}
            className="px-4 py-2 text-[13px] font-medium text-white bg-[#111318] hover:bg-[#2A2E39] border border-[#111318] rounded-[4px] transition-colors focus-ring disabled:opacity-50"
          >
            {isCreating ? 'Creating...' : 'Create Workspace'}
          </button>
        </form>
      </div>

      {/* User Session Profile */}
      <div className="relative bg-[#FFFFFF] border border-[#E2DFD7] rounded-[4px] p-6 shadow-sm space-y-3">
        <span className="absolute top-1.5 left-2 font-mono text-[10px] text-[#A8A49C] pointer-events-none select-none">+</span>
        <span className="absolute top-1.5 right-2 font-mono text-[10px] text-[#A8A49C] pointer-events-none select-none">+</span>

        <div className="flex items-center gap-2 pb-3 border-b border-[#E2DFD7]">
          <User className="w-4 h-4 text-[#1D4ED8]" />
          <h2 className="text-[15px] font-bold text-[#111318] tracking-tight">
            User Account & Session
          </h2>
        </div>

        <div className="text-[13px] space-y-2 pt-1">
          <div className="flex items-center justify-between border-b border-[#E2DFD7]/60 pb-1.5">
            <span className="text-[#5A5852] font-mono text-[12px]">AUTHENTICATED EMAIL:</span>
            <strong className="text-[#111318] font-mono text-[13px]">{user?.email}</strong>
          </div>
          <div className="flex items-center justify-between border-b border-[#E2DFD7]/60 pb-1.5">
            <span className="text-[#5A5852] font-mono text-[12px]">USER ID:</span>
            <span className="font-mono text-xs text-[#5A5852] select-all">{user?.id}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-[#5A5852] font-mono text-[12px]">LAST SIGN IN:</span>
            <span className="font-mono text-xs text-[#5A5852]">{user?.last_sign_in_at ? new Date(user.last_sign_in_at).toLocaleString() : 'Active Session'}</span>
          </div>
        </div>
      </div>
    </div>
  );
};
