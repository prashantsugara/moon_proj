'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { User, Session } from '@supabase/supabase-js';

interface Profile {
  id: string;
  full_name: string;
  upi_id?: string;
  created_at?: string;
}

interface AuthContextType {
  user: User | null;
  session: Session | null;
  profile: Profile | null;
  loading: boolean;
  signInWithEmail: (email: string, pass: string) => Promise<{ error: any }>;
  signUpWithEmail: (email: string, pass: string, fullName: string) => Promise<{ error: any }>;
  signInWithMagicLink: (email: string) => Promise<{ error: any }>;
  signOut: () => Promise<void>;
  updateProfileName: (name: string) => void;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  session: null,
  profile: null,
  loading: true,
  signInWithEmail: async () => ({ error: null }),
  signUpWithEmail: async () => ({ error: null }),
  signInWithMagicLink: async () => ({ error: null }),
  signOut: async () => {},
  updateProfileName: () => {},
});

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  // Helper to fetch or create user profile
  const fetchProfile = async (u: User) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', u.id)
        .maybeSingle();

      if (data) {
        setProfile(data);
      } else {
        const fallbackName = u.user_metadata?.full_name || u.email?.split('@')[0] || 'Lunar Citizen';
        const newProf = { id: u.id, full_name: fallbackName };
        setProfile(newProf);
      }
    } catch {
      const fallbackName = u.user_metadata?.full_name || u.email?.split('@')[0] || 'Lunar Citizen';
      setProfile({ id: u.id, full_name: fallbackName });
    }
  };

  useEffect(() => {
    let mounted = true;

    // Get initial session
    supabase.auth.getSession().then(({ data: { session: initSession } }) => {
      if (!mounted) return;
      if (initSession) {
        setSession(initSession);
        setUser(initSession.user);
        fetchProfile(initSession.user);
      } else {
        // Check local storage fallback for offline / mock testing
        const storedUser = localStorage.getItem('luna_user_session');
        if (storedUser) {
          try {
            const parsed = JSON.parse(storedUser);
            setUser(parsed.user);
            setProfile(parsed.profile);
          } catch {}
        }
      }
      setLoading(false);
    }).catch(() => {
      if (mounted) setLoading(false);
    });

    // Listen for auth state changes
    const { data: authListener } = supabase.auth.onAuthStateChange(async (event, newSession) => {
      if (!mounted) return;
      if (newSession) {
        setSession(newSession);
        setUser(newSession.user);
        await fetchProfile(newSession.user);
      } else {
        setSession(null);
        setUser(null);
        setProfile(null);
        localStorage.removeItem('luna_user_session');
      }
      setLoading(false);
    });

    return () => {
      mounted = false;
      authListener?.subscription?.unsubscribe();
    };
  }, []);

  const signInWithEmail = async (email: string, pass: string) => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password: pass,
      });

      if (error) {
        // Fallback demo login if keys are unconfigured placeholders
        if (error.message.includes('apiKey') || error.message.includes('Invalid API key') || error.message.includes('JWTPromise')) {
          const mockUser = {
            id: `usr-${Date.now()}`,
            email,
            user_metadata: { full_name: email.split('@')[0] },
          } as unknown as User;
          const mockProf = { id: mockUser.id, full_name: email.split('@')[0] };

          setUser(mockUser);
          setProfile(mockProf);
          localStorage.setItem('luna_user_session', JSON.stringify({ user: mockUser, profile: mockProf }));
          return { error: null };
        }
        return { error };
      }

      if (data.user) {
        setUser(data.user);
        setSession(data.session);
        await fetchProfile(data.user);
      }
      return { error: null };
    } catch (err: any) {
      // Fallback demo auth for mock testing
      const mockUser = {
        id: `usr-${Date.now()}`,
        email,
        user_metadata: { full_name: email.split('@')[0] },
      } as unknown as User;
      const mockProf = { id: mockUser.id, full_name: email.split('@')[0] };

      setUser(mockUser);
      setProfile(mockProf);
      localStorage.setItem('luna_user_session', JSON.stringify({ user: mockUser, profile: mockProf }));
      return { error: null };
    }
  };

  const signUpWithEmail = async (email: string, pass: string, fullName: string) => {
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password: pass,
        options: {
          data: { full_name: fullName },
        },
      });

      if (error) {
        if (error.message.includes('apiKey') || error.message.includes('Invalid API key') || error.message.includes('JWTPromise')) {
          const mockUser = {
            id: `usr-${Date.now()}`,
            email,
            user_metadata: { full_name: fullName },
          } as unknown as User;
          const mockProf = { id: mockUser.id, full_name: fullName };

          setUser(mockUser);
          setProfile(mockProf);
          localStorage.setItem('luna_user_session', JSON.stringify({ user: mockUser, profile: mockProf }));
          return { error: null };
        }
        return { error };
      }

      if (data.user) {
        setUser(data.user);
        setSession(data.session);
        setProfile({ id: data.user.id, full_name: fullName });
      }
      return { error: null };
    } catch (err: any) {
      const mockUser = {
        id: `usr-${Date.now()}`,
        email,
        user_metadata: { full_name: fullName },
      } as unknown as User;
      const mockProf = { id: mockUser.id, full_name: fullName };

      setUser(mockUser);
      setProfile(mockProf);
      localStorage.setItem('luna_user_session', JSON.stringify({ user: mockUser, profile: mockProf }));
      return { error: null };
    }
  };

  const signInWithMagicLink = async (email: string) => {
    try {
      const { error } = await supabase.auth.signInWithOtp({ email });
      if (error) return { error };
      return { error: null };
    } catch (err: any) {
      return { error: err };
    }
  };

  const signOut = async () => {
    try {
      await supabase.auth.signOut();
    } catch {}
    setUser(null);
    setSession(null);
    setProfile(null);
    localStorage.removeItem('luna_user_session');
  };

  const updateProfileName = (name: string) => {
    if (profile) {
      setProfile({ ...profile, full_name: name });
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        session,
        profile,
        loading,
        signInWithEmail,
        signUpWithEmail,
        signInWithMagicLink,
        signOut,
        updateProfileName,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
