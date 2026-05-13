"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import dynamic from "next/dynamic";

const Loader = dynamic(() => import("@/components/Loader"), { ssr: false });

export default function RegisterPage() {
  const router = useRouter();
  const { register, isAuthenticated } = useAuth();

  const [form, setForm] = useState({ name: "", username: "", email: "", password: "" });
  const [error, setError] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (isAuthenticated) router.push("/user");
  }, [isAuthenticated, router]);

  const handleChange = useCallback((e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  }, []);

  const handleSubmit = useCallback(
    async (e) => {
      e.preventDefault();
      setError("");
      setIsSaving(true);
      try {
        await register(form);
        router.push("/user");
      } catch (err) {
        setError(err.message || "Unable to register");
      } finally {
        setIsSaving(false);
      }
    },
    [form, register, router]
  );

  const goLogin = useCallback(() => router.push("/login"), [router]);

  return (
    <div className="relative min-h-screen flex items-center justify-center bg-[#0a0a0a] overflow-hidden px-4">
      {/* Cinematic background glow */}
      <div aria-hidden className="pointer-events-none fixed inset-0" style={{ zIndex: 0 }}>
        <div style={{
          position: "absolute",
          top: 0, left: 0, right: 0,
          height: "50%",
          background: "radial-gradient(ellipse 80% 60% at 50% -10%, rgba(220, 156, 38, 0.13) 0%, transparent 70%)",
        }} />
        <div style={{
          position: "absolute",
          bottom: 0, left: 0, right: 0,
          height: "40%",
          background: "radial-gradient(ellipse 60% 50% at 50% 110%, rgba(120, 69, 10, 0.1) 0%, transparent 70%)",
        }} />
      </div>

      {/* Card */}
      <main
        className="relative w-full"
        style={{ maxWidth: 420, zIndex: 1 }}
      >
        {/* Logo / Brand */}
        <div className="mb-10 text-center">
          <h1 style={{
            fontFamily: "Georgia, 'Times New Roman', serif",
            fontSize: 28,
            fontWeight: 700,
            color: "#fff",
            lineHeight: 1.2,
            marginBottom: 8,
          }}>
            Create your account
          </h1>
          <p style={{ fontSize: 14, color: "rgba(255,255,255,0.4)", lineHeight: 1.6 }}>
            Save your progress and watch history across all devices.
          </p>
        </div>

        {/* Form card */}
        <div style={{
          background: "rgba(255,255,255,0.03)",
          border: "1px solid rgba(255,255,255,0.07)",
          borderRadius: 16,
          padding: "36px 32px",
        }}>
          <form onSubmit={handleSubmit} noValidate>
            <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
              <Field label="Full Name" name="name" value={form.name} onChange={handleChange} autoComplete="name" />
              <Field label="Username" name="username" value={form.username} onChange={handleChange} autoComplete="username" />
              <Field label="Email address" name="email" type="email" value={form.email} onChange={handleChange} autoComplete="email" />
              <Field label="Password" name="password" type="password" value={form.password} onChange={handleChange} autoComplete="new-password" />
            </div>

            {error && (
              <div style={{
                marginTop: 20,
                padding: "10px 14px",
                borderRadius: 8,
                background: "rgba(239, 151, 68, 0.08)",
                border: "1px solid rgba(239, 145, 68, 0.2)",
                fontSize: 13,
                color: "#f87171ff",
              }}>
                {error}
              </div>
            )}

            {/* CTA Button — Netflix-style bold red */}
            <button
              type="submit"
              disabled={isSaving}
              style={{
                marginTop: 28,
                width: "100%",
                padding: "15px 24px",
                borderRadius: 8,
                background: isSaving ? "#f59e0b" : "rgba(126, 60, 16, 0.8)",
                border: "none",
                color: "#fff",
                fontSize: 15,
                fontWeight: 700,
                letterSpacing: "0.04em",
                textTransform: "uppercase",
                cursor: isSaving ? "not-allowed" : "pointer",
                transition: "background 0.15s, transform 0.1s",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 8,
              }}
              onMouseEnter={e => { if (!isSaving) e.currentTarget.style.background = "rgba(126, 60, 16, 0.8)"; }}
              onMouseLeave={e => { if (!isSaving) e.currentTarget.style.background = "#f59e0b"; }}
              onMouseDown={e => { if (!isSaving) e.currentTarget.style.transform = "scale(0.985)"; }}
              onMouseUp={e => { e.currentTarget.style.transform = "scale(1)"; }}
            >
              {isSaving ? (
                <>
                  <Loader className="h-4 w-4" />
                  <span>Creating account…</span>
                </>
              ) : (
                "Get Started"
              )}
            </button>
          </form>
        </div>

        {/* Footer link */}
        <p style={{
          marginTop: 24,
          textAlign: "center",
          fontSize: 13,
          color: "rgba(255,255,255,0.3)",
        }}>
          Already have an account?{" "}
          <button
            type="button"
            onClick={goLogin}
            style={{
              background: "none",
              border: "none",
              color: "rgba(255,255,255,0.75)",
              fontWeight: 600,
              fontSize: 13,
              cursor: "pointer",
              padding: 0,
              textDecoration: "underline",
              textDecorationColor: "rgba(255,255,255,0.25)",
              transition: "color 0.15s",
            }}
            onMouseEnter={e => { e.currentTarget.style.color = "#fff"; }}
            onMouseLeave={e => { e.currentTarget.style.color = "rgba(255,255,255,0.75)"; }}
          >
            Sign in
          </button>
        </p>
      </main>
    </div>
  );
}

function Field({ label, name, type = "text", value, onChange, autoComplete }) {
  return (
    <label style={{ display: "block" }}>
      <span style={{
        display: "block",
        fontSize: 11,
        fontWeight: 600,
        letterSpacing: "0.1em",
        textTransform: "uppercase",
        color: "rgba(255,255,255,0.35)",
        marginBottom: 8,
      }}>
        {label}
      </span>
      <input
        name={name}
        type={type}
        value={value}
        onChange={onChange}
        required
        autoComplete={autoComplete}
        style={{
          width: "100%",
          padding: "13px 16px",
          borderRadius: 8,
          background: "rgba(255,255,255,0.05)",
          border: "1px solid rgba(255,255,255,0.08)",
          color: "#fff",
          fontSize: 14,
          outline: "none",
          transition: "border-color 0.15s, background 0.15s",
          boxSizing: "border-box",
        }}
        onFocus={e => {
          e.target.style.borderColor = "rgba(229, 97, 9, 0.6)";
          e.target.style.background = "rgba(245,158,11,0.07)";
        }}
        onBlur={e => {
          e.target.style.borderColor = "rgba(245,158,11,0.07)";
          e.target.style.background = "rgba(245,158,11,0.07)";
        }}
      />
    </label>
  );
}