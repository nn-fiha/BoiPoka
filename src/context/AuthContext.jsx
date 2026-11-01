import React, { createContext, useCallback, useContext, useEffect, useState } from "react";
import { supabase } from "../lib/supabase";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [session, setSession] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  // True after opening a password-reset link, until a new password is saved
  const [recovering, setRecovering] = useState(false);

  const loadProfile = useCallback(async (user) => {
    if (!user) {
      setProfile(null);
      return;
    }
    const { data } = await supabase.from("profiles").select("*").eq("id", user.id).maybeSingle();
    setProfile(data);
  }, []);

  useEffect(() => {
    supabase.auth.getSession().then(async ({ data }) => {
      setSession(data.session);
      await loadProfile(data.session?.user);
      setLoading(false);
    });

    const { data: listener } = supabase.auth.onAuthStateChange((event, newSession) => {
      setSession(newSession);
      if (event === "PASSWORD_RECOVERY") setRecovering(true);
      // Supabase warns against awaiting other calls inside this callback
      setTimeout(() => loadProfile(newSession?.user), 0);
    });
    return () => listener.subscription.unsubscribe();
  }, [loadProfile]);

  const signUp = ({ email, password, username, displayName }) =>
    supabase.auth.signUp({
      email,
      password,
      options: {
        data: { username: username.toLowerCase(), display_name: displayName || username },
        emailRedirectTo: window.location.origin,
      },
    });

  const signIn = ({ email, password }) => supabase.auth.signInWithPassword({ email, password });

  const signOut = () => supabase.auth.signOut();

  const redirectTo = (path = "") => `${window.location.origin}${path}`;

  const sendPasswordReset = (email) =>
    supabase.auth.resetPasswordForEmail(email, { redirectTo: redirectTo("/reset-password") });

  // Passwordless sign-in for existing accounts
  const sendMagicLink = (email) =>
    supabase.auth.signInWithOtp({ email, options: { shouldCreateUser: false, emailRedirectTo: redirectTo() } });

  const resendConfirmation = (email) =>
    supabase.auth.resend({ type: "signup", email, options: { emailRedirectTo: redirectTo() } });

  const signInWithGoogle = () =>
    supabase.auth.signInWithOAuth({ provider: "google", options: { redirectTo: redirectTo() } });

  const updatePassword = async (password) => {
    const result = await supabase.auth.updateUser({ password });
    if (!result.error) setRecovering(false);
    return result;
  };

  return (
    <AuthContext.Provider
      value={{
        session,
        user: session?.user ?? null,
        profile,
        setProfile,
        loading,
        recovering,
        signUp,
        signIn,
        signOut,
        sendPasswordReset,
        sendMagicLink,
        resendConfirmation,
        signInWithGoogle,
        updatePassword,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
