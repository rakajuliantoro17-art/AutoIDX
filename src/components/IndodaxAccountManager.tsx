/**
==========================================================
AURA Trade OS
Indodax Account Manager
Version : 0.1.0 Alpha

Perubahan dari 0.0.2: sekarang lewat endpoint API server-side
(/api/settings/indodax-accounts) yang mengenkripsi apiKey/
secretKey sebelum simpan (AES-256-GCM), bukan lagi tulis
langsung ke Firestore dari client (plaintext). Server juga
tidak pernah mengembalikan apiKey/secretKey utuh - cuma versi
masked untuk ditampilkan.
==========================================================
*/
"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/services/auth/AuthContext";

interface IndodaxAccountMasked {
  id: string;
  label: string;
  apiKeyMasked: string;
  isActive: boolean;
  createdAt: number;
}

export default function IndodaxAccountManager() {
  const { user } = useAuth();
  const [accounts, setAccounts] = useState<IndodaxAccountMasked[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [label, setLabel] = useState("");
  const [apiKey, setApiKey] = useState("");
  const [secretKey, setSecretKey] = useState("");

  async function authedFetch(method: string, body?: unknown) {
    if (!user) throw new Error("Belum login.");

    const idToken = await user.getIdToken();

    const res = await fetch("/api/settings/indodax-accounts", {
      method,
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${idToken}`,
      },
      body: body ? JSON.stringify(body) : undefined,
    });

    const json = await res.json();

    if (!res.ok) {
      throw new Error(json.error ?? `Request gagal (${res.status})`);
    }

    return json;
  }

  async function loadAccounts() {
    if (!user) return;
    setLoading(true);
    setError(null);

    try {
      const json = await authedFetch("GET");
      setAccounts(json.accounts ?? []);
    } catch (err) {
      console.error("[IndodaxAccountManager] Failed to load:", err);
      setError(err instanceof Error ? err.message : "Gagal memuat akun.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadAccounts();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    if (!user || !label || !apiKey || !secretKey) return;

    setSaving(true);
    setError(null);

    try {
      await authedFetch("POST", { label, apiKey, secretKey });
      setLabel("");
      setApiKey("");
      setSecretKey("");
      await loadAccounts();
    } catch (err) {
      console.error("[IndodaxAccountManager] Failed to add account:", err);
      setError(err instanceof Error ? err.message : "Gagal menyimpan akun.");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(accountId: string) {
    if (!user) return;
    if (!confirm("Hapus akun Indodax ini?")) return;

    try {
      await authedFetch("DELETE", { accountId });
      await loadAccounts();
    } catch (err) {
      console.error("[IndodaxAccountManager] Failed to delete:", err);
      setError(err instanceof Error ? err.message : "Gagal menghapus akun.");
    }
  }

  async function handleToggle(accountId: string, current: boolean) {
    if (!user) return;

    try {
      await authedFetch("PATCH", { accountId, isActive: !current });
      await loadAccounts();
    } catch (err) {
      console.error("[IndodaxAccountManager] Failed to toggle:", err);
      setError(err instanceof Error ? err.message : "Gagal mengubah status akun.");
    }
  }

  return (
    <div className="card">
      <h2 className="text-xl font-semibold mb-5">Akun Trade API Indodax</h2>
      <p className="text-slate-400 text-sm mb-2">
        Kelola API Key & Secret dari akun Indodax kamu. Bisa lebih dari satu akun.
      </p>
      <p className="text-slate-500 text-xs mb-6">
        🔒 Disimpan terenkripsi (AES-256-GCM) di server. API key/secret utuh
        tidak pernah dikirim balik ke browser setelah disimpan.
      </p>

      {error && (
        <div className="text-xs text-rose-400 bg-rose-500/10 border border-rose-500/30 rounded-md px-3 py-2 mb-4">
          {error}
        </div>
      )}

      {/* Form tambah akun */}
      <form onSubmit={handleAdd} className="grid md:grid-cols-3 gap-3 mb-6">
        <input
          type="text"
          placeholder="Label (contoh: Akun Utama)"
          value={label}
          onChange={(e) => setLabel(e.target.value)}
          className="bg-white/5 border border-white/10 rounded-md px-3 py-2 text-sm focus:outline-none focus:border-sky-400"
          required
        />
        <input
          type="text"
          placeholder="API Key"
          value={apiKey}
          onChange={(e) => setApiKey(e.target.value)}
          className="bg-white/5 border border-white/10 rounded-md px-3 py-2 text-sm focus:outline-none focus:border-sky-400"
          required
        />
        <input
          type="password"
          placeholder="Secret Key"
          value={secretKey}
          onChange={(e) => setSecretKey(e.target.value)}
          className="bg-white/5 border border-white/10 rounded-md px-3 py-2 text-sm focus:outline-none focus:border-sky-400"
          required
        />
        <button
          type="submit"
          disabled={saving}
          className="md:col-span-3 bg-emerald-500 text-black font-semibold px-4 py-2 rounded-md text-sm disabled:opacity-50 w-fit"
        >
          {saving ? "Menyimpan..." : "Tambah Akun"}
        </button>
      </form>

      {/* List akun tersimpan */}
      <div className="space-y-2">
        {loading ? (
          <p className="text-slate-400 text-sm">Memuat akun...</p>
        ) : accounts.length === 0 ? (
          <p className="text-slate-500 text-sm">Belum ada akun Indodax tersimpan.</p>
        ) : (
          accounts.map((acc) => (
            <div
              key={acc.id}
              className="flex items-center justify-between bg-white/5 rounded-md px-4 py-3 text-sm"
            >
              <div>
                <p className="font-medium">{acc.label}</p>
                <p className="text-slate-500 text-xs mt-1">{acc.apiKeyMasked}</p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleToggle(acc.id, acc.isActive)}
                  className={`text-xs px-3 py-1 rounded-full ${
                    acc.isActive ? "bg-emerald-500/20 text-emerald-400" : "bg-white/10 text-slate-400"
                  }`}
                >
                  {acc.isActive ? "Aktif" : "Nonaktif"}
                </button>
                <button
                  onClick={() => handleDelete(acc.id)}
                  className="text-xs px-3 py-1 rounded-full bg-red-500/20 text-red-400"
                >
                  Hapus
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
