import React, { createContext, useContext, useEffect, useState, useTransition } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { fetchUserWorkspaces, createWorkspace } from '../lib/api';
import { Workspace } from '../types';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  isLoading: boolean;
  workspaces: Workspace[];
  currentWorkspace: Workspace | null;
  setCurrentWorkspace: (ws: Workspace) => void;
  refreshWorkspaces: () => Promise<void>;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, workspaceName?: string) => Promise<{ needsConfirmation: boolean }>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [workspaces, setWorkspaces] = useState<Workspace[]>([]);
  const [currentWorkspace, setCurrentWorkspace] = useState<Workspace | null>(null);
  const [, startTransition] = useTransition();

  const loadWorkspacesForUser = async (targetUser: User, preferredWorkspaceId?: string) => {
    try {
      const userWorkspaces = await fetchUserWorkspaces();

      if (userWorkspaces.length > 0) {
        startTransition(() => {
          setWorkspaces(userWorkspaces);
          const found = preferredWorkspaceId
            ? userWorkspaces.find((w) => w.id === preferredWorkspaceId)
            : null;
          setCurrentWorkspace(found || userWorkspaces[0]);
        });
      } else {
        // User has no workspace yet; provision initial workspace atomically
        const defaultName = `${targetUser.email?.split('@')[0] || 'My'} Operations`;
        try {
          const newId = await createWorkspace(defaultName);
          const reloaded = await fetchUserWorkspaces();
          startTransition(() => {
            setWorkspaces(reloaded);
            const active = reloaded.find((w) => w.id === newId) || reloaded[0] || null;
            setCurrentWorkspace(active);
          });
        } catch (provisionErr) {
          console.warn('Initial workspace provisioning note:', provisionErr);
        }
      }
    } catch (err) {
      console.error('Error loading user workspaces:', err);
    }
  };

  useEffect(() => {
    if (!isSupabaseConfigured) {
      setIsLoading(false);
      return;
    }

    let isMounted = true;

    // Get initial session
    supabase.auth.getSession().then(({ data: { session: initialSession }, error }) => {
      if (!isMounted) return;
      if (error) {
        console.warn('Error reading initial session:', error);
      }
      setSession(initialSession);
      setUser(initialSession?.user ?? null);

      if (initialSession?.user) {
        loadWorkspacesForUser(initialSession.user).finally(() => {
          if (isMounted) setIsLoading(false);
        });
      } else {
        setIsLoading(false);
      }
    });

    // Listen to ongoing auth state transitions
    const { data: authListener } = supabase.auth.onAuthStateChange(
      async (event, newSession) => {
        if (!isMounted) return;
        setSession(newSession);
        setUser(newSession?.user ?? null);

        if (event === 'SIGNED_IN' && newSession?.user) {
          setIsLoading(true);
          await loadWorkspacesForUser(newSession.user);
          if (isMounted) setIsLoading(false);
        } else if (event === 'SIGNED_OUT') {
          setWorkspaces([]);
          setCurrentWorkspace(null);
          setIsLoading(false);
        }
      }
    );

    return () => {
      isMounted = false;
      authListener.subscription.unsubscribe();
    };
  }, []);

  const refreshWorkspaces = async () => {
    if (!user) return;
    await loadWorkspacesForUser(user, currentWorkspace?.id);
  };

  const signIn = async (email: string, password: string) => {
    if (!isSupabaseConfigured) {
      throw new Error('Supabase is not configured. Please supply VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY.');
    }

    const { error } = await supabase.auth.signInWithPassword({
      email: email.trim(),
      password,
    });

    if (error) {
      throw new Error(error.message);
    }
  };

  const signUp = async (email: string, password: string, workspaceName?: string) => {
    if (!isSupabaseConfigured) {
      throw new Error('Supabase is not configured.');
    }

    const { data, error } = await supabase.auth.signUp({
      email: email.trim(),
      password,
      options: {
        data: {
          requested_workspace_name: workspaceName || 'Primary Workspace',
        },
      },
    });

    if (error) {
      throw new Error(error.message);
    }

    const needsConfirmation = !data.session && Boolean(data.user);
    return { needsConfirmation };
  };

  const signOut = async () => {
    if (!isSupabaseConfigured) return;
    const { error } = await supabase.auth.signOut();
    if (error) {
      console.error('Sign out error:', error);
    }
    setSession(null);
    setUser(null);
    setWorkspaces([]);
    setCurrentWorkspace(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        session,
        isLoading,
        workspaces,
        currentWorkspace,
        setCurrentWorkspace,
        refreshWorkspaces,
        signIn,
        signUp,
        signOut,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
