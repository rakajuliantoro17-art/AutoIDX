/**
==========================================================
AURA Trade OS
Login Page
Version : 0.0.2 Alpha
==========================================================
*/

"use client";

import { useState, FormEvent } from "react";
import { useAuth } from "@/services/auth/AuthContext";

function friendlyAuthError(code: string): string {
  switch (code) {
    case "auth/invalid-email":
      return "Format email tidak valid.";
    case "auth/user-not-found":
    case "auth/wrong-password":
    case "auth/invalid-credential":
      return "Email atau password salah.";
    case "auth/email-already-in-use":
      return "Email ini sudah terdaftar. Coba login.";
    case "auth/weak-password":
      return "Password minimal 6 karakter.";
    case "auth/popup-closed-by-user":
      return "Login Google dibatalkan.";
    default:
      return "Terjadi kesalahan. Coba lagi.";
  }
}

export default function LoginPage() {
  const { signInEmail, signUpEmail, signInGoogle } = useAuth();

  const [mode, setMode] = useState<"login" | "register">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);

    try {
      if (mode === "login") {
        await signInEmail(email, password);
      } else {
        await signUpEmail(email, password);
      }
    } catch (err: unknown) {
      const code = (err as { code?: string })?.code ?? "";
      setError(friendlyAuthError(code));
    } finally {
      setSubmitting(false);
    }
  }

  async function handleGoogle() {
    setError(null);
    setSubmitting(true);

    try {
      await signInGoogle();
    } catch (err: unknown) {
      const code = (err as { code?: string })?.code ?? "";
      setError(friendlyAuthError(code));
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="min-h-[70vh] flex items-center justify-center">
      <div className="card w-full max-w-sm p-8">
        <h1 className="text-2xl font-bold text-center">
          {mode === "login" ? "Masuk ke AURA Trade OS" : "Buat Akun Baru"}
        </h1>

        <p className="text-slate-400 text-sm text-center mt-2 mb-8">
          {mode === "login"
            ? "Kelola bot trading dan akun Indodax kamu"
            : "Daftar untuk mulai mengelola akun Indodax kamu"}
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-sm text-slate-400 block mb-1">Email</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded-lg bg-white/5 border border-white/10 px-4 py-2 outline-none focus:border-sky-500"
              placeholder="nama@email.com"
            />
          </div>

          <div>
            <label className="text-sm text-slate-400 block mb-1">Password</label>
            <input
              type="password"
              required
              minLength={6}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full rounded-lg bg-white/5 border border-white/10 px-4 py-2 outline-none focus:border-sky-500"
              placeholder="••••••••"
            />
          </div>

          {error && <p className="text-red-400 text-sm">{error}</p>}

          <button
            type="submit"
            disabled={submitting}
            className="w-full rounded-lg bg-sky-500 hover:bg-sky-400 disabled:opacity-50 text-white font-semibold py-2.5 transition"
          >
            {submitting
              ? "Memproses..."
              : mode === "login"
              ? "Masuk"
              : "Daftar"}
          </button>
        </form>

        <div className="flex items-center gap-3 my-6">
          <div className="h-px bg-white/10 flex-1" />
          <span className="text-xs text-slate-500">atau</span>
          <div className="h-px bg-white/10 flex-1" />
        </div>

        <button
          onClick={handleGoogle}
          disabled={submitting}
          className="w-full rounded-lg border border-white/10 hover:bg-white/5 disabled:opacity-50 text-white font-medium py-2.5 transition"
        >
          Lanjutkan dengan Google
        </button>

        <p className="text-center text-sm text-slate-400 mt-6">
          {mode === "login" ? "Belum punya akun?" : "Sudah punya akun?"}{" "}
          <button
            onClick={() => {
              setError(null);
              setMode(mode === "login" ? "register" : "login");
            }}
            className="text-sky-400 hover:underline"
          >
            {mode === "login" ? "Daftar di sini" : "Masuk di sini"}
          </button>
        </p>
      </div>
    </div>
  );
}
