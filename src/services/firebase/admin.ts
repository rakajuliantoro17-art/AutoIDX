/**
==========================================================
AURA Trade OS
Firebase Admin (Server-side only)
Version : 0.1.0 Alpha
CATATAN: file ini HANYA boleh diimport dari server
(API routes / cron). Jangan import dari komponen client.

Perubahan dari 0.0.2: `adminDb`/`adminAuth` DULU diinisialisasi
di level modul (`const adminDb = getFirestore(getAdminApp())`),
artinya `getAdminApp()` dipanggil SAAT FILE DI-IMPORT, bukan
saat benar-benar dipakai. Kalau env var
FIREBASE_ADMIN_PROJECT_ID/FIREBASE_ADMIN_CLIENT_EMAIL/
FIREBASE_ADMIN_PRIVATE_KEY hilang atau salah format, throw-nya
terjadi SEBELUM try/catch di handler manapun sempat jalan --
serverless function di Vercel langsung crash
(FUNCTION_INVOCATION_FAILED) dan balas HTML error generik,
BUKAN JSON. Efeknya: SEMUA endpoint yang mengimpor file ini
(config.ts, indodax-accounts.ts, bot/state.ts, portfolio/summary.ts,
dst -- lihat docs/claude.md Session Log 17) gagal serentak dengan
gejala "Unexpected token '<'" di frontend, walau kredensial cuma
bermasalah untuk SATU alasan yang sama.

Sekarang: adminDb/adminAuth dibungkus Proxy yang baru benar-benar
memanggil getAdminApp() saat property PERTAMA diakses (mis. saat
`adminAuth.verifyIdToken(...)` benar-benar dipanggil) -- bukan
saat import. Error kredensial sekarang muncul DI DALAM try/catch
handler yang memanggilnya, jadi bisa dibalas sebagai JSON 401/500
yang jelas, bukan crash platform mentah. Cara pakai di 11 file
pemanggil TIDAK PERLU DIUBAH SAMA SEKALI -- bentuk `adminDb`/
`adminAuth` di luar tetap sama persis.
==========================================================
*/
import { initializeApp, getApps, cert, App } from "firebase-admin/app";
import { getFirestore, Firestore } from "firebase-admin/firestore";
import { getAuth, Auth } from "firebase-admin/auth";

function getAdminApp(): App {
  if (getApps().length) return getApps()[0];

  const privateKey = process.env.FIREBASE_ADMIN_PRIVATE_KEY?.replace(/\\n/g, "\n");

  if (!process.env.FIREBASE_ADMIN_PROJECT_ID || !process.env.FIREBASE_ADMIN_CLIENT_EMAIL || !privateKey) {
    throw new Error("Firebase Admin config missing (check env vars)");
  }

  return initializeApp({
    credential: cert({
      projectId: process.env.FIREBASE_ADMIN_PROJECT_ID,
      clientEmail: process.env.FIREBASE_ADMIN_CLIENT_EMAIL,
      privateKey,
    }),
  });
}

/**
 * Bungkus factory jadi Proxy yang lazy: instance ASLI baru dibuat
 * saat property pertamanya diakses, bukan saat modul ini di-import.
 * Error dari factory() (mis. env var hilang) jadi muncul di titik
 * PEMANGGILAN (di dalam try/catch caller), bukan di titik import.
 */
function lazy<T extends object>(factory: () => T): T {
  let instance: T | null = null;

  return new Proxy({} as T, {
    get(_target, prop, _receiver) {
      if (!instance) {
        instance = factory();

        // Firestore MENOLAK field bernilai `undefined` secara default
        // (beda dari field yang memang tidak ada) -- sudah dua kali
        // ini bikin request 500 secara diam-diam (reconcile.ts:
        // `symbol: mismatch.type !== "BALANCE" ? mismatch.key :
        // undefined`, engine.ts: `code: handled.code` yang memang
        // opsional). Daripada tambal tiap titik satu-satu (rawan
        // kelewat di tempat lain), matikan pengecekan ini secara
        // GLOBAL di sini -- field yang nilainya undefined otomatis
        // dianggap "tidak ada", bukan error. Cara pakai .set()/.add()
        // di semua 11+ pemanggil TIDAK PERLU DIUBAH.
        if (instance instanceof Firestore) {
          instance.settings({ ignoreUndefinedProperties: true });
        }

      }
      const value = (instance as any)[prop];
      return typeof value === "function" ? value.bind(instance) : value;
    },
  });
}

export const adminDb: Firestore = lazy(() => getFirestore(getAdminApp()));
export const adminAuth: Auth = lazy(() => getAuth(getAdminApp()));
