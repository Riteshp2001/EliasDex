"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import Loader from "@/components/Loader";

export default function RegisterPage() {
  const router = useRouter();
  const { register, isAuthenticated } = useAuth();
  const [name, setName] = useState("");
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (isAuthenticated) {
      router.push("/user");
    }
  }, [isAuthenticated, router]);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");
    setIsSaving(true);
    try {
      await register({ email, username, name, password });
      router.push("/user");
    } catch (err) {
      setError(err.message || "Unable to register");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0b0e14] p-4">
      <div className="w-full max-w-md rounded-3xl border border-[#1e293b] bg-[#111827]/95 p-8 shadow-2xl">
        <h1 className="text-2xl font-bold text-white mb-2">Create Account</h1>
        <p className="text-sm text-[#94a3b8] mb-6">Create your account to save progress and history in your profile.</p>
        <form onSubmit={handleSubmit} className="space-y-4">
          <label className="block text-sm text-[#cbd5e1]">
            Name
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              className="mt-2 w-full rounded-2xl border border-[#334155] bg-[#0f172a] px-4 py-3 text-white outline-none focus:border-[#f59e0b]"
            />
          </label>
          <label className="block text-sm text-[#cbd5e1]">
            Username
            <input
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
              className="mt-2 w-full rounded-2xl border border-[#334155] bg-[#0f172a] px-4 py-3 text-white outline-none focus:border-[#f59e0b]"
            />
          </label>
          <label className="block text-sm text-[#cbd5e1]">
            Email
            <input
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              type="email"
              required
              className="mt-2 w-full rounded-2xl border border-[#334155] bg-[#0f172a] px-4 py-3 text-white outline-none focus:border-[#f59e0b]"
            />
          </label>
          <label className="block text-sm text-[#cbd5e1]">
            Password
            <input
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              type="password"
              required
              className="mt-2 w-full rounded-2xl border border-[#334155] bg-[#0f172a] px-4 py-3 text-white outline-none focus:border-[#f59e0b]"
            />
          </label>
          {error && <p className="text-sm text-[#f87171]">{error}</p>}
          <button
            type="submit"
            disabled={isSaving}
            className="w-full rounded-2xl bg-[#f59e0b] px-4 py-3 text-sm font-semibold text-black transition hover:bg-[#d97706] disabled:opacity-60"
          >
            {isSaving ? <Loader className="mx-auto h-5 w-5" /> : "Create account"}
          </button>
        </form>
        <div className="mt-6 text-sm text-[#94a3b8]">
          Already have an account?{" "}
          <button
            type="button"
            onClick={() => router.push("/login")}
            className="font-semibold text-[#f59e0b] hover:text-[#fbbf24]"
          >
            Sign in
          </button>
        </div>
      </div>
    </div>
  );
}
