/**
==========================================================
AURA Trade OS
API / Account Settings
Version : 0.1.0 Alpha

SEBELUMNYA stub kosong. Sekarang embed IndodaxAccountManager
(komponen yang SUDAH live -- kelola API key/secret Indodax
terenkripsi lewat /api/settings/indodax-accounts), tidak
dibuat ulang supaya tidak ada dua form kredensial berbeda.
==========================================================
*/

import DashboardLayout from "@/layouts/DashboardLayout";
import IndodaxAccountManager from "@/components/IndodaxAccountManager";

export default function ApiSettings() {
  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-xl font-bold">API &amp; Account</h1>
          <p className="text-xs text-slate-500 mt-1">
            Kelola akun Indodax yang dipakai untuk live trading. Kredensial
            dienkripsi (AES-256-GCM) sebelum disimpan.
          </p>
        </div>

        <IndodaxAccountManager />
      </div>
    </DashboardLayout>
  );
}
