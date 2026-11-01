import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { useAuth } from "../context/AuthContext";
import { usePageTitle } from "../hooks/usePageTitle";
import AuthLayout from "../components/Auth/AuthLayout";
import NewPasswordForm from "../components/Auth/NewPasswordForm";

// Where the "reset your password" email link lands
const ResetPasswordPage = () => {
  const { user, profile, loading, updatePassword } = useAuth();
  const navigate = useNavigate();
  usePageTitle("Choose a new password", { noindex: true });

  const handleSave = async (password) => {
    const result = await updatePassword(password);
    if (!result.error) {
      toast.success("Password updated — you're signed in");
      navigate(profile ? `/u/${profile.username}` : "/", { replace: true });
    }
    return result;
  };

  return (
    <AuthLayout>
      {loading ? (
        <p className="text-center text-ink/60">Checking your link…</p>
      ) : user ? (
        <div className="motion-safe:animate-fade-in">
          <h1 className="font-serif text-3xl font-bold sm:text-4xl">Choose a new password</h1>
          <p className="mb-8 mt-3 text-sm text-ink/70">
            For <span className="font-medium text-ink">{user.email}</span>. You'll stay signed in on this device.
          </p>
          <NewPasswordForm onSubmit={handleSave} />
        </div>
      ) : (
        <div className="text-center motion-safe:animate-fade-in">
          <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-red-500/10 text-red-600 dark:text-red-400">
            <i className="bx bx-link-alt text-4xl"></i>
          </div>
          <h1 className="font-serif text-3xl font-bold">This link has expired</h1>
          <p className="mt-3 text-ink/70">Reset links work once and only for an hour. Ask for a fresh one.</p>
          <Link
            to="/login?mode=forgot"
            className="mt-8 inline-flex h-12 items-center justify-center rounded-xl bg-terra px-6 font-medium text-cream hover:bg-terra-dark"
          >
            Send a new link
          </Link>
        </div>
      )}
    </AuthLayout>
  );
};

export default ResetPasswordPage;
