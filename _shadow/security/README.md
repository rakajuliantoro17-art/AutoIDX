# Shadow: security (guard in-memory & duplikat)

Dipindah dari `src/services/security/` pada 2026-10-10 (nol importer aktif). Aktif: `encryption.ts` (AES-256-GCM, dipakai penyimpanan kunci Indodax), `rateLimitStore.ts` (rate limit Firestore atomik lintas invocation, dipakai 9 endpoint).

Tinjauan jalur aktif 2026-10-10: enkripsi benar (IV acak 12 byte, auth tag diverifikasi); `cronAuth` dan verifikasi webhook memakai perbandingan waktu-konstan; rate limit fail-open sengaja (lapis tambahan, bukan kontrol utama).

| File | Alasan |
|---|---|
| `rateLimiter.ts` | in-memory; tak berguna di serverless (digantikan `rateLimitStore`) |
| `authGuard`, `tokenManager`, `permission`, `apiGuard` | sistem token/peran sendiri; auth nyata = Firebase ID token (`verifyApiAuth`/`verifyBearerToken`) + `CRON_SECRET`. Dua sistem auth = celah tak terduga |
| `csrfGuard` | API memakai header Authorization (bukan cookie), CSRF tidak relevan |
| `ipGuard` | in-memory; IP di Vercel/proxy perlu penanganan header khusus |
| `signature` | webhook sudah punya `api/webhook/signature.ts` |
| `secretManager` | rahasia dibaca dari env Vercel; tak ada vault |
| `auditLogger` | in-memory; kebutuhan nyata (jejak audit perubahan setelan) lebih tepat Firestore `audit_logs` |

## Syarat aktif kembali
Gap nyata muncul (mis. jejak audit perubahan setelan/mode bot). Bangun versi Firestore kecil dan satu jalur; jangan menghidupkan guard in-memory ini.
