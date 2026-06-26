"use client";

import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { User, AuthError } from "@supabase/supabase-js";
import { supabase } from "@/lib/supabase";

interface AuthContextType {
  user: User | null;
  loading: boolean;
  error: string | null;
  signUp: (
    email: string,
    password: string
  ) => Promise<{ error: AuthError | null }>;
  signIn: (
    email: string,
    password: string,
    rememberMe?: boolean
  ) => Promise<{ error: AuthError | null }>;
  signOut: () => Promise<{ error: AuthError | null }>;
  resetPassword: (email: string) => Promise<{ error: AuthError | null }>;
  updatePassword: (newPassword: string) => Promise<{ error: AuthError | null }>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const restoreSession = async () => {
      try {
        const rememberMe = localStorage.getItem("shadowvest_remember_me") === "true";
        const {
          data: { session },
        } = await supabase.auth.getSession();
        setUser(session?.user ?? null);

        if (!rememberMe) {
          localStorage.removeItem("shadowvest_email");
        }
      } catch (err) {
        console.error("Session restore failed:", err);
      } finally {
        setLoading(false);
      }
    };

    restoreSession();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      setError(null);
    });

    return () => {
      subscription?.unsubscribe();
    };
  }, []);

  const signUp = async (email: string, password: string) => {
    setError(null);
    try {
      const { error } = await supabase.auth.signUp({
        email,
        password,
      });
      if (error) {
        setError(error.message);
        return { error };
      }
      return { error: null };
    } catch (err) {
      const message = err instanceof Error ? err.message : "Sign up failed";
      setError(message);
      return { error: { message } as AuthError };
    }
  };

  const signIn = async (
    email: string,
    password: string,
    rememberMe = false
  ) => {
    setError(null);
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      if (error) {
        setError(error.message);
        return { error };
      }

      if (rememberMe) {
        localStorage.setItem("shadowvest_remember_me", "true");
        localStorage.setItem("shadowvest_email", email);
      } else {
        localStorage.removeItem("shadowvest_remember_me");
        localStorage.removeItem("shadowvest_email");
      }

      return { error: null };
    } catch (err) {
      const message = err instanceof Error ? err.message : "Sign in failed";
      setError(message);
      return { error: { message } as AuthError };
    }
  };

  const signOut = async () => {
    setError(null);
    try {
      localStorage.removeItem("shadowvest_remember_me");
      localStorage.removeItem("shadowvest_email");
      const { error } = await supabase.auth.signOut();
      if (error) {
        setError(error.message);
        return { error };
      }
      return { error: null };
    } catch (err) {
      const message = err instanceof Error ? err.message : "Sign out failed";
      setError(message);
      return { error: { message } as AuthError };
    }
  };

  const resetPassword = async (email: string) => {
    setError(null);
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${process.env.NEXT_PUBLIC_APP_URL}/auth/reset-confirm`,
      });
      if (error) {
        setError(error.message);
        return { error };
      }
      return { error: null };
    } catch (err) {
      const message = err instanceof Error ? err.message : "Password reset failed";
      setError(message);
      return { error: { message } as AuthError };
    }
  };

  const updatePassword = async (newPassword: string) => {
    setError(null);
    try {
      const { error } = await supabase.auth.updateUser({
        password: newPassword,
      });
      if (error) {
        setError(error.message);
        return { error };
      }
      return { error: null };
    } catch (err) {
      const message = err instanceof Error ? err.message : "Password update failed";
      setError(message);
      return { error: { message } as AuthError };
    }
  };

  const value: AuthContextType = {
    user,
    loading,
    error,
    signUp,
    signIn,
    signOut,
    resetPassword,
    updatePassword,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
