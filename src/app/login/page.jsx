"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import dynamic from "next/dynamic";

const Loader = dynamic(() => import("@/components/Loader"), { ssr: false });

export default function LoginPage() {
  const router = useRouter();
  const { login, isAuthenticated, loading } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [focused, setFocused] = useState(null);

  useEffect(() => {
    if (isAuthenticated) router.push("/user");
  }, [isAuthenticated, router]);

  const handleEmailChange = useCallback((e) => setEmail(e.target.value), []);
  const handlePasswordChange = useCallback((e) => setPassword(e.target.value), []);
  const togglePassword = useCallback(() => setShowPassword((p) => !p), []);

  const handleSubmit = useCallback(
    async (e) => {
      e.preventDefault();
      setError("");
      setIsSaving(true);
      try {
        await login({ email, password });
        router.push("/user");
      } catch (err) {
        setError(err.message || "Invalid credentials. Please try again.");
      } finally {
        setIsSaving(false);
      }
    },
    [email, password, login, router]
  );

  const handleRegister = useCallback(() => router.push("/register"), [router]);

  if (loading) {
    return (
      <div style={styles.loadingScreen}>
        <div style={styles.loadingDot} />
      </div>
    );
  }

  return (
    <div style={styles.root}>
      {/* Ambient background */}
      <div style={styles.ambientOrb1} aria-hidden="true" />
      <div style={styles.ambientOrb2} aria-hidden="true" />

      <main style={styles.main}>
        {/* Brand mark */}
        {/* <div style={styles.brandMark}>
          <div style={styles.brandIcon}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <path d="M5 3l14 9-14 9V3z" fill="#f59e0b" />
            </svg>
          </div>
          <span style={styles.brandName}>EliasDex</span>
        </div> */}

        {/* Card */}
        <div style={styles.card}>
          <header style={styles.cardHeader}>
            <h1 style={styles.heading}>Welcome back</h1>
            <p style={styles.subheading}>Sign in to sync your watch history and continue where you left off.</p>
          </header>

          <form onSubmit={handleSubmit} style={styles.form} noValidate>
            {/* Email */}
            <div style={styles.fieldGroup}>
              <label style={styles.label} htmlFor="email">
                Email address
              </label>
              <div style={{ ...styles.inputWrap, ...(focused === "email" ? styles.inputWrapFocused : {}) }}>
                <svg style={styles.inputIcon} width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                  <path d="M4 4h16a2 2 0 012 2v12a2 2 0 01-2 2H4a2 2 0 01-2-2V6a2 2 0 012-2z" stroke="currentColor" strokeWidth="1.5" />
                  <path d="M22 6l-10 7L2 6" stroke="currentColor" strokeWidth="1.5" />
                </svg>
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={handleEmailChange}
                  onFocus={() => setFocused("email")}
                  onBlur={() => setFocused(null)}
                  required
                  autoComplete="email"
                  placeholder="you@example.com"
                  style={styles.input}
                />
              </div>
            </div>

            {/* Password */}
            <div style={styles.fieldGroup}>
              <label style={styles.label} htmlFor="password">
                Password
              </label>
              <div style={{ ...styles.inputWrap, ...(focused === "password" ? styles.inputWrapFocused : {}) }}>
                <svg style={styles.inputIcon} width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                  <rect x="3" y="11" width="18" height="11" rx="2" stroke="currentColor" strokeWidth="1.5" />
                  <path d="M7 11V7a5 5 0 0110 0v4" stroke="currentColor" strokeWidth="1.5" />
                </svg>
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={handlePasswordChange}
                  onFocus={() => setFocused("password")}
                  onBlur={() => setFocused(null)}
                  required
                  autoComplete="current-password"
                  placeholder="••••••••"
                  style={styles.input}
                />
                <button
                  type="button"
                  onClick={togglePassword}
                  style={styles.eyeBtn}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? (
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                      <path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19m-6.72-1.07a3 3 0 11-4.24-4.24" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                      <line x1="1" y1="1" x2="23" y2="23" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                    </svg>
                  ) : (
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" stroke="currentColor" strokeWidth="1.5" />
                      <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="1.5" />
                    </svg>
                  )}
                </button>
              </div>
            </div>

            {/* Error */}
            {error && (
              <div style={styles.errorBox} role="alert">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden="true" style={{ flexShrink: 0 }}>
                  <circle cx="12" cy="12" r="10" stroke="#f87171" strokeWidth="1.5" />
                  <line x1="12" y1="8" x2="12" y2="12" stroke="#f87171" strokeWidth="1.5" strokeLinecap="round" />
                  <line x1="12" y1="16" x2="12.01" y2="16" stroke="#f87171" strokeWidth="2" strokeLinecap="round" />
                </svg>
                <span>{error}</span>
              </div>
            )}

            {/* Submit */}
            <button
              type="submit"
              disabled={isSaving}
              style={{ ...styles.submitBtn, ...(isSaving ? styles.submitBtnDisabled : {}) }}
            >
              {isSaving ? <Loader className="mx-auto h-4 w-4" /> : "Sign in"}
            </button>
          </form>

          <footer style={styles.cardFooter}>
            <span style={styles.footerText}>Don&apos;t have an account?</span>
            <button type="button" onClick={handleRegister} style={styles.linkBtn}>
              Create one
            </button>
          </footer>
        </div>
      </main>

      <style>{cssAnimations}</style>
    </div>
  );
}

// ─── Inline style objects (avoids Tailwind purge issues & works on low-end) ───

const styles = {
  root: {
    minHeight: "93vh",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#080b10",
    padding: "1rem",
    position: "relative",
    overflow: "hidden",
    fontFamily: "'DM Sans', 'Segoe UI', system-ui, sans-serif",
  },
  ambientOrb1: {
    position: "absolute",
    top: "-20%",
    right: "-10%",
    width: "clamp(240px, 50vw, 480px)",
    height: "clamp(240px, 50vw, 480px)",
    borderRadius: "50%",
    background: "radial-gradient(circle, rgba(245,158,11,0.07) 0%, transparent 70%)",
    pointerEvents: "none",
    willChange: "transform",
  },
  ambientOrb2: {
    position: "absolute",
    bottom: "-15%",
    left: "-8%",
    width: "clamp(180px, 40vw, 360px)",
    height: "clamp(180px, 40vw, 360px)",
    borderRadius: "50%",
    background: "radial-gradient(circle, rgba(99,102,241,0.05) 0%, transparent 70%)",
    pointerEvents: "none",
  },
  loadingScreen: {
    minHeight: "100svh",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#080b10",
  },
  loadingDot: {
    width: "8px",
    height: "8px",
    borderRadius: "50%",
    backgroundColor: "#f59e0b",
    animation: "pulse 1.2s ease-in-out infinite",
  },
  main: {
    width: "100%",
    maxWidth: "400px",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: "2rem",
    zIndex: 1,
  },
  brandMark: {
    display: "flex",
    alignItems: "center",
    gap: "0.5rem",
  },
  brandIcon: {
    width: "32px",
    height: "32px",
    borderRadius: "8px",
    background: "rgba(245,158,11,0.12)",
    border: "1px solid rgba(245,158,11,0.2)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  brandName: {
    fontSize: "1rem",
    fontWeight: "600",
    color: "#e2e8f0",
    letterSpacing: "-0.01em",
  },
  card: {
    width: "100%",
    borderRadius: "20px",
    border: "1px solid rgba(255,255,255,0.06)",
    background: "rgba(15,20,30,0.85)",
    backdropFilter: "blur(12px)",
    WebkitBackdropFilter: "blur(12px)",
    padding: "clamp(1.5rem, 5vw, 2.25rem)",
    boxShadow: "0 24px 64px rgba(0,0,0,0.5), 0 1px 0 rgba(255,255,255,0.04) inset",
    animation: "fadeUp 0.4s ease both",
  },
  cardHeader: {
    marginBottom: "1.75rem",
  },
  heading: {
    fontSize: "clamp(1.4rem, 4vw, 1.75rem)",
    fontWeight: "700",
    color: "#f1f5f9",
    margin: "0 0 0.4rem",
    letterSpacing: "-0.03em",
    lineHeight: 1.2,
  },
  subheading: {
    fontSize: "0.8rem",
    color: "#64748b",
    margin: 0,
    lineHeight: 1.5,
  },
  form: {
    display: "flex",
    flexDirection: "column",
    gap: "1.1rem",
  },
  fieldGroup: {
    display: "flex",
    flexDirection: "column",
    gap: "0.4rem",
  },
  label: {
    fontSize: "0.75rem",
    fontWeight: "500",
    color: "#94a3b8",
    letterSpacing: "0.02em",
  },
  inputWrap: {
    position: "relative",
    display: "flex",
    alignItems: "center",
    borderRadius: "12px",
    borderWidth: "1px",
    borderStyle: "solid",
    borderColor: "rgba(255,255,255,0.07)",
    background: "rgba(8,11,16,0.7)",
    transition: "border-color 0.15s ease, box-shadow 0.15s ease",
  },
  inputWrapFocused: {
    borderWidth: "1px",
    borderStyle: "solid",
    borderColor: "rgba(245,158,11,0.4)",
    boxShadow: "0 0 0 3px rgba(245,158,11,0.06)",
  },
  inputIcon: {
    position: "absolute",
    left: "14px",
    color: "#475569",
    pointerEvents: "none",
    flexShrink: 0,
  },
  input: {
    width: "100%",
    background: "transparent",
    border: "none",
    outline: "none",
    padding: "0.75rem 2.75rem 0.75rem 2.75rem",
    fontSize: "0.875rem",
    color: "#e2e8f0",
    caretColor: "#f59e0b",
  },
  eyeBtn: {
    position: "absolute",
    right: "12px",
    background: "none",
    border: "none",
    cursor: "pointer",
    color: "#475569",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: "4px",
    borderRadius: "6px",
    transition: "color 0.15s ease",
  },
  errorBox: {
    display: "flex",
    alignItems: "flex-start",
    gap: "0.5rem",
    padding: "0.65rem 0.85rem",
    borderRadius: "10px",
    background: "rgba(248,113,113,0.07)",
    border: "1px solid rgba(248,113,113,0.15)",
    fontSize: "0.78rem",
    color: "#f87171",
    lineHeight: 1.4,
  },
  submitBtn: {
    marginTop: "0.25rem",
    width: "100%",
    padding: "0.8rem",
    borderRadius: "12px",
    border: "none",
    background: "#f59e0b",
    color: "#0a0a0a",
    fontSize: "0.875rem",
    fontWeight: "600",
    cursor: "pointer",
    letterSpacing: "-0.01em",
    transition: "background 0.15s ease, transform 0.1s ease, box-shadow 0.15s ease",
    boxShadow: "0 4px 16px rgba(245,158,11,0.25)",
  },
  submitBtnDisabled: {
    opacity: 0.55,
    cursor: "not-allowed",
    transform: "none",
  },
  cardFooter: {
    marginTop: "1.5rem",
    paddingTop: "1.25rem",
    borderTop: "1px solid rgba(255,255,255,0.05)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "0.4rem",
    fontSize: "0.8rem",
  },
  footerText: {
    color: "#475569",
  },
  linkBtn: {
    background: "none",
    border: "none",
    cursor: "pointer",
    color: "#f59e0b",
    fontWeight: "600",
    fontSize: "0.8rem",
    padding: 0,
    transition: "color 0.15s ease",
  },
};

const cssAnimations = `
  @keyframes fadeUp {
    from { opacity: 0; transform: translateY(12px); }
    to   { opacity: 1; transform: translateY(0); }
  }
  @keyframes pulse {
    0%, 100% { opacity: 1; transform: scale(1); }
    50%       { opacity: 0.4; transform: scale(0.85); }
  }
  input::placeholder { color: #334155; }
  input:-webkit-autofill,
  input:-webkit-autofill:focus {
    -webkit-box-shadow: 0 0 0 1000px #0c111a inset !important;
    -webkit-text-fill-color: #e2e8f0 !important;
    caret-color: #f59e0b;
  }
  button[type="submit"]:not(:disabled):hover {
    background: #fbbf24 !important;
    box-shadow: 0 6px 20px rgba(245,158,11,0.35) !important;
  }
  button[type="submit"]:not(:disabled):active {
    transform: scale(0.985);
  }
`;