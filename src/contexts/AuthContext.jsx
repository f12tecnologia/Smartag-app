import React, { createContext, useContext, useEffect, useState, useCallback, useMemo } from 'react';
import { auth, profile as profileApi } from '@/lib/api';
import { useToast } from '@/components/ui/use-toast';

const AuthContext = createContext(undefined);

export const AuthProvider = ({ children }) => {
  const { toast } = useToast();
  const [user, setUser] = useState(null);
  const [session, setSession] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchUserProfile = useCallback(async (currentUser) => {
    if (!currentUser) {
      setProfile(null);
      return;
    }
    try {
      const data = await profileApi.get();
      setProfile(data);
    } catch (error) {
      console.error("Error fetching user profile:", error);
    }
  }, []);

  const handleSession = useCallback(async (sessionData) => {
    setSession(sessionData);
    const currentUser = sessionData?.user ?? null;
    setUser(currentUser);
    await fetchUserProfile(currentUser);
    setLoading(false);
  }, [fetchUserProfile]);

  useEffect(() => {
    const getSession = async () => {
      try {
        const { data } = await auth.getSession();
        handleSession(data.session);
      } catch (error) {
        setLoading(false);
      }
    };
    getSession();
  }, [handleSession]);

  const signUp = useCallback(async (email, password, options) => {
    try {
      const { user, error } = await auth.signUp(email, password, options);
      if (error) {
        toast({ variant: "destructive", title: "Falha no cadastro", description: error });
        return { user: null, error };
      }
      const { data } = await auth.getSession();
      handleSession(data.session);
      return { user, error: null };
    } catch (error) {
      toast({ variant: "destructive", title: "Falha no cadastro", description: error.message });
      return { user: null, error };
    }
  }, [toast, handleSession]);

  const signIn = useCallback(async (email, password) => {
    try {
      const { error } = await auth.signIn(email, password);
      if (error) {
        toast({ variant: "destructive", title: "Falha no login", description: error });
        return { error };
      }
      const { data } = await auth.getSession();
      handleSession(data.session);
      return { error: null };
    } catch (error) {
      toast({ variant: "destructive", title: "Falha no login", description: error.message });
      return { error };
    }
  }, [toast, handleSession]);

  const signOut = useCallback(async () => {
    try {
      const { error } = await auth.signOut();
      if (error) {
        toast({ variant: "destructive", title: "Falha ao sair", description: error });
        return { error };
      }
      setUser(null);
      setSession(null);
      setProfile(null);
      return { error: null };
    } catch (error) {
      toast({ variant: "destructive", title: "Falha ao sair", description: error.message });
      return { error };
    }
  }, [toast]);

  const value = useMemo(() => ({
    user,
    session,
    profile,
    loading,
    signUp,
    signIn,
    signOut,
    fetchUserProfile,
  }), [user, session, profile, loading, signUp, signIn, signOut, fetchUserProfile]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
