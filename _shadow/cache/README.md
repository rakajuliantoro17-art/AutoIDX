# Shadow: cache (cache in-memory berlapis)

Dipindah dari `src/services/cache/` pada 2026-10-10 (12 file, nol importer aktif). Aktif: `cacheManager.ts` (hanya dibaca `health/checks/cacheHealth` untuk ukuran cache).

Semua varian (memory/market/order/strategy/persistent/distributed) memakai penyimpanan proses; di Vercel serverless tiap invocation dingin = cache kosong, jadi hit rate mendekati nol dan menambah kompleksitas tanpa manfaat. Cache yang terbukti berguna sudah ada di tempatnya: `indodax/cache.ts` (data publik), TTL 60 detik di `featureFlags` dan `ModelPredictor`.

`persistentCache`/`distributedCache`: kerangka tanpa backend nyata; bila butuh cache lintas invocation, bangun di atas Firestore dengan TTL untuk satu kasus konkret (mis. respons AI) bukan kerangka umum.

## Syarat aktif kembali
Worker berumur panjang (cache memori bermakna) atau satu kasus pemakaian terukur (hemat biaya AI / rate limit Indodax) yang membuktikan manfaatnya.
