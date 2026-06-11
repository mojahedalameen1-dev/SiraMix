import React, { createContext, useContext, useEffect, useState } from 'react';
import { isSupabaseConfigured, supabase } from '../supabaseClient';
import { User, Session } from '@supabase/supabase-js';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  signInWithGoogle: () => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isSupabaseConfigured) {
      setLoading(false);
      return;
    }

    // Get initial session
    supabase.auth.getSession().then(({ data: { session: initialSession } }) => {
      setSession(initialSession);
      setUser(initialSession?.user ?? null);
      setLoading(false);
    });

    // Listen to authentication changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, currentSession) => {
      setSession(currentSession);
      setUser(currentSession?.user ?? null);
      setLoading(false);

      if (event === 'SIGNED_IN') {
        if (window.opener) {
          window.opener.postMessage({ type: 'OAUTH_AUTH_SUCCESS' }, '*');
          window.close();
        }
      }
    });

    const handleMessage = (event: MessageEvent) => {
      if (event.data?.type === 'OAUTH_AUTH_SUCCESS') {
        supabase.auth.getSession().then(({ data: { session: newSession } }) => {
          setSession(newSession);
          setUser(newSession?.user ?? null);
        });
      }
    };
    window.addEventListener('message', handleMessage);

    if (window.opener && window.location.hash.includes('access_token')) {
      setTimeout(() => {
        window.opener.postMessage({ type: 'OAUTH_AUTH_SUCCESS' }, '*');
        window.close();
      }, 1500);
    }

    return () => {
      subscription.unsubscribe();
      window.removeEventListener('message', handleMessage);
    };
  }, []);

  const signInWithGoogle = async () => {
    try {
      if (!isSupabaseConfigured) {
        throw new Error('Supabase is not configured. Add VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY to the environment.');
      }

      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: window.location.origin,
          skipBrowserRedirect: true,
        },
      });
      if (error) throw error;
      if (data?.url) {
        window.open(data.url, 'oauth_popup', 'width=600,height=700');
      }
    } catch (err: any) {
      console.error('Error signing in with Google:', err.message || err);
      throw err;
    }
  };

  const signOut = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
    } catch (err: any) {
      console.error('Error signing out:', err.message || err);
      throw err;
    }
  };

  return (
    <AuthContext.Provider value={{ user, session, loading, signInWithGoogle, signOut }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
