import React, { createContext, useContext, useEffect, useState } from 'react';
import {
  GoogleAuthProvider,
  User,
  getRedirectResult,
  onAuthStateChanged,
  signInWithPopup,
  signInWithRedirect,
  signOut as firebaseSignOut,
} from 'firebase/auth';
import { auth, isFirebaseConfigured } from '../firebaseClient';

export interface AuthUser {
  id: string;
  email: string | null;
  user_metadata: {
    avatar_url: string | null;
    full_name: string | null;
  };
}

interface AuthContextType {
  user: AuthUser | null;
  loading: boolean;
  signInWithGoogle: () => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);
const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({ prompt: 'select_account' });

function toAuthUser(user: User | null): AuthUser | null {
  if (!user) return null;
  return {
    id: user.uid,
    email: user.email,
    user_metadata: {
      avatar_url: user.photoURL,
      full_name: user.displayName,
    },
  };
}

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isFirebaseConfigured) {
      setLoading(false);
      return;
    }

    let active = true;
    const stopLoadingTimer = window.setTimeout(() => {
      if (active) setLoading(false);
    }, 8000);

    getRedirectResult(auth).catch(error => {
      console.error('Firebase redirect sign-in failed:', error);
    });

    const unsubscribe = onAuthStateChanged(
      auth,
      currentUser => {
        if (!active) return;
        window.clearTimeout(stopLoadingTimer);
        setUser(toAuthUser(currentUser));
        setLoading(false);
      },
      error => {
        console.error('Firebase auth initialization failed:', error);
        if (!active) return;
        window.clearTimeout(stopLoadingTimer);
        setLoading(false);
      },
    );

    return () => {
      active = false;
      window.clearTimeout(stopLoadingTimer);
      unsubscribe();
    };
  }, []);

  const signInWithGoogle = async () => {
    if (!isFirebaseConfigured) {
      throw new Error('Firebase is not configured. Add the VITE_FIREBASE_* variables.');
    }

    try {
      await signInWithPopup(auth, googleProvider);
    } catch (error: unknown) {
      const errorCode = error && typeof error === 'object' && 'code' in error
        ? String(error.code)
        : '';
      if (
        errorCode === 'auth/popup-blocked' ||
        errorCode === 'auth/cancelled-popup-request' ||
        errorCode === 'auth/operation-not-supported-in-this-environment'
      ) {
        await signInWithRedirect(auth, googleProvider);
        return;
      }
      throw error;
    }
  };

  const signOut = async () => {
    await firebaseSignOut(auth);
  };

  return (
    <AuthContext.Provider value={{ user, loading, signInWithGoogle, signOut }}>
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
