/**
==========================================================
AURA Trade OS
Indodax Account Manager
Version : 0.0.2 Alpha
==========================================================
*/
"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/services/auth/AuthContext";
import {
  listIndodaxAccounts,
  addIndodaxAccount,
  deleteIndodaxAccount,
  toggleIndodaxAccountActive,
} from "@/services/firebase/indodaxAccounts";
import { IndodaxAccount } from "@/services/indodax/accountTypes";

export default function IndodaxAccountManager() {
  const { user } = useAuth();
  const [accounts, setAccounts] = useState<IndodaxAccount[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [label, setLabel] = useState("");
  const [apiKey, setApiKey] = useState("");
  const [secretKey, setSecretKey] = useState("");

  async function loadAccounts() {
    if (!user) return;
    setLoading(true);
    const data = await listIndodaxAccounts(user.uid);
    setAccounts(data);
    setLoading(false);
  }

  useEffect(() => {
    loadAccounts();
  }, [user]);

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    if (!user || !label || !apiKey || !secretKey) return;

    setSaving(true);
    try {
      await addIndodaxAccount(user.uid, {
        label,
        apiKey,
        secretKey,
        isActive: true,
      });
      setLabel("");
      setApiKey("");
      setSecretKey("");
      await loadAccounts();
    } catch (error) {
      console.error("[IndodaxAccountManager] Failed to add account:", error);
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(accountId: string) {
    if (!user) return;
    if (!confirm("Hapus akun Indodax ini?")) return;
    await deleteIndodaxAccount(user.uid, accountId);
    await loadAccounts();
  }

  async function handleToggle(accountId: string, current: boolean) {
    if (!user) return;
    await toggleIndodaxAccountActive(user.uid, accountId, !current);
    await loadAccounts();
  }

  function maskKey(key: string) {
    if (key.length <= 8) return "••••••••";
    return `${key.slice(0, 4)}••••••••${key.slice(-4)}`;
  }

  return (
    <div className="card">
      <h2 className="text-xl font-semibold mb-5">Akun Trade API Indodax</h2>
      <p className="text-slate-400 text-sm mb-6">
        Kelola API Key & Secret dari akun Indodax kamu. Bisa lebih dari satu akun.
      </p>

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
                <p className="text-slate-500 text-xs mt-1">{maskKey(acc.apiKey)}</p>
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
