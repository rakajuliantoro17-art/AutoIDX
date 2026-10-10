# Shadow: intelligence (duplikat & kerangka)

Dipindah dari `src/services/intelligence/` pada 2026-10-10 (nol importer aktif). Jalur aktif (engine.ts): `ai/{prompt,consensus,responseParser,decisionExplainer,confidence,explanation}`, `ai/providers/{openai,gemini,claude,deepseek}`, `context/*`, `ml/mlAdvisor`, `types`, `fusion/{decision,confidence}` (hanya tipe).

| File | Alasan |
|---|---|
| `ai/{analyzer,orchestrator,router,client,sentiment,promptTemplates}` | Jalur AI paralel yang menduplikasi Sanity Check di engine + `aiConsensus`; menyambungkannya membuat sinyal ganda yang bisa saling bertentangan (dicatat di `decisionExplainer.ts`, "Known Duplication") |
| `ai/cache.ts`, `cache/intelligenceCache.ts` | cache in-memory; tidak bertahan di Vercel. Bila ingin hemat biaya AI, pakai cache Firestore dengan TTL (rancangan baru, bukan file ini) |
| `ai/providers/{local,notebooklm}` | provider tanpa kunci/infrastruktur |
| `fusion/voting.ts` | duplikat `aiConsensus` |
| `aggregators/*`, `features/*`, `filters/marketFilter`, `health/`, `manager`, `registry`, `index` | kerangka sumber data (CoinGecko/news/sosial/on-chain) yang belum ada penyedianya; `features/*` duplikat `indicators/` + `ml/dataset/collector` |

## Syarat aktif kembali
Penyedia data nyata (sentimen/berita) tersedia dan shadow ML/AI membuktikan nilai tambahnya; pasang sebagai lapisan advisory, bukan jalur kedua.
