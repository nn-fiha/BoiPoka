// Turns Supabase auth errors into plain, helpful sentences
export const friendlyAuthError = (error) => {
  const message = error?.message || "";
  const code = error?.code || "";

  if (code === "invalid_credentials" || /invalid login credentials/i.test(message))
    return "That email and password don't match. Check them and try again.";
  if (code === "email_not_confirmed" || /email not confirmed/i.test(message))
    return "Confirm your email first — check your inbox for the link we sent.";
  if (code === "user_already_exists" || /already registered/i.test(message))
    return "An account with this email already exists. Try signing in instead.";
  if (/database error saving new user/i.test(message)) return "That username is taken. Try another one.";
  if (code === "weak_password" || /password should be/i.test(message))
    return "Choose a stronger password: at least 8 characters, mixing letters and numbers.";
  if (code === "over_email_send_rate_limit" || /rate limit|too many/i.test(message))
    return "Too many attempts. Wait a minute and try again.";
  if (code === "otp_disabled" || /signups not allowed for otp|user not found/i.test(message))
    return "We couldn't find an account with that email.";
  if (/provider is not enabled|unsupported provider/i.test(message))
    return "Google sign-in isn't set up yet. Use your email instead.";
  if (/failed to fetch|network/i.test(message)) return "Can't reach BoiPoka right now. Check your connection.";
  return message || "Something went wrong. Please try again.";
};

// 0–4 score with a label, for the sign-up strength meter
export const passwordStrength = (password) => {
  if (!password) return { score: 0, label: "" };
  let score = 0;
  if (password.length >= 8) score++;
  if (password.length >= 12) score++;
  if (/[a-z]/.test(password) && /[A-Z]/.test(password)) score++;
  if (/\d/.test(password) && /[^A-Za-z0-9]/.test(password)) score++;
  else if (/\d|[^A-Za-z0-9]/.test(password)) score += 0.5;
  const rounded = Math.min(4, Math.floor(score));
  return { score: rounded, label: ["Too weak", "Weak", "Fair", "Good", "Strong"][rounded] };
};
