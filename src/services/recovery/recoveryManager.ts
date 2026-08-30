/**
==========================================================
AURA Trade OS
Recovery Manager (STUB)
Version : 0.0.1 Alpha
==========================================================
BUG FIX (build-blocking): file asli recoveryManager.ts di
folder ini SUDAH TERHAPUS di suatu commit sebelumnya, tapi
services/runtime/bootstrap.ts dan services/runtime/runtime.ts
masih meng-import-nya -- bikin `next build` gagal total
("Cannot find module").

PENTING -- INI STUB, BUKAN IMPLEMENTASI RECOVERY SUNGGUHAN:
- runtime/bootstrap.ts (createRuntime()) dan runtime/runtime.ts
  (class Runtime) SENDIRI tidak dipanggil dari kode manapun yang
  aktif (cuma di-export lewat services/index.ts, yang juga nol
  pemakaian di seluruh codebase -- lihat audit sesi ini).
- File ini HANYA memenuhi kontrak tipe (canTrade/halt/snapshot)
  supaya bootstrap.ts/runtime.ts bisa dikompilasi, TIDAK berisi
  logika recovery nyata apa pun.
- JANGAN pakai class ini untuk keputusan trading sungguhan.
  Kalau nanti runtime/bootstrap.ts mau benar-benar dipakai,
  ganti dulu isi file ini dengan implementasi recovery yang
  genuinely menjaga state (persisten, bukan in-memory) --
  konsultasikan pola yang sama seperti services/liveTrading/
  gate/* (idempotency, kill switch) yang sudah diaudit sesi ini
  soal keterbatasan in-memory state di Vercel serverless.
==========================================================
*/

export interface RecoverySnapshot {
  readonly halted: boolean;
  readonly reason: string | null;
  readonly haltedAt: number | null;
}

export class RecoveryManager {

  private halted = false;

  private reason: string | null = null;

  private haltedAt: number | null = null;

  /**
   * Fail-closed by design (return false kalau sedang halted) --
   * TAPI karena class ini tidak pernah benar-benar dipanggil di
   * jalur aktif manapun, nilai ini murni untuk konsistensi
   * niat/intent, bukan proteksi yang benar-benar berjalan.
   */
  canTrade(): boolean {
    return !this.halted;
  }

  halt(reason: string): void {
    this.halted = true;
    this.reason = reason;
    this.haltedAt = Date.now();
  }

  snapshot(): RecoverySnapshot {
    return Object.freeze({
      halted: this.halted,
      reason: this.reason,
      haltedAt: this.haltedAt,
    });
  }

}
