/**
==========================================================
AURA Trade OS
App Footer (unified — App Router & Pages Router)
Version : 0.1.0
==========================================================
Sebelumnya ada 2 Footer terpisah dengan isi berbeda (nomor
versi tidak sinkron, satu pakai warna hardcoded text-slate-500
yang tidak ikut tema terang). Disatukan di sini.
==========================================================
*/

export default function AppFooter() {
  return (
    <footer className="glass-nav mt-auto border-t">
      <div className="flex flex-col items-center justify-between gap-2 px-4 py-6 text-xs text-[var(--text-muted)] md:flex-row md:px-6">
        <span>© 2026 AutoIDX — Automated Indodax Trading Engine</span>
        <span>Version 0.1.0 Alpha</span>
      </div>
    </footer>
  );
}
