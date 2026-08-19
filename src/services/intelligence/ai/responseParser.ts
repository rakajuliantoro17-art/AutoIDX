/**
==========================================================
AURA Trade OS
AI Response Parser
Version : 0.1.0 Alpha
==========================================================
Bagian yang hilang antara ai/providers/*.ts (panggilan API
LLM sungguhan, hasilnya teks mentah di `response.content`)
dan AIAnalysis terstruktur. ai/orchestrator.ts SEBELUMNYA
membuang response.content dan hardcode signal:"HOLD" -- lihat
komentar "Phase 6 -- sementara HOLD" di file itu. Modul ini
TIDAK mengubah orchestrator.ts (supaya tidak menyentuh kode
lama yang mungkin dipakai/diuji terpisah), melainkan jadi
jalur baru yang dipakai khusus oleh Gerbang 4 di
src/services/trading/engine.ts.

CATATAN PENTING: ini BUKAN pengganti ai/analyzer.ts.
analyzer.ts adalah scorer manual berbasis indikator (tanpa
LLM sama sekali) -- fungsinya beda dan tetap independen.
==========================================================
*/

import type { AIAnalysis, TradingSignal } from "../types";

const VALID_SIGNALS: TradingSignal[] = [
  "STRONG_BUY",
  "BUY",
  "HOLD",
  "SELL",
  "STRONG_SELL",
];

/**
 * Parse balasan mentah LLM (yang diminta prompt.ts untuk
 * berformat JSON) jadi AIAnalysis terstruktur. LLM kadang
 * membungkus JSON dengan ```json ... ``` walau sudah diminta
 * "Return ONLY valid JSON" -- fallback strip fence disediakan.
 *
 * Return null kalau parsing gagal / bentuk tidak valid --
 * pemanggil WAJIB memperlakukan null sebagai "tidak
 * terkonfirmasi" (fail-safe), bukan lolos begitu saja.
 */
export function parseAIResponse(
  rawContent: string | null
): AIAnalysis | null {

  if (!rawContent || rawContent.trim().length === 0) {
    return null;
  }

  const stripped = rawContent
    .trim()
    .replace(/^```json\s*/i, "")
    .replace(/^```\s*/i, "")
    .replace(/```\s*$/i, "")
    .trim();

  let parsed: any;

  try {
    parsed = JSON.parse(stripped);
  } catch {

    // Fallback terakhir: ambil substring dari { pertama sampai
    // } terakhir, kalau-kalau ada teks pembuka/penutup di luar
    // JSON walau sudah diminta "ONLY valid JSON".
    const start = stripped.indexOf("{");
    const end = stripped.lastIndexOf("}");

    if (start === -1 || end === -1 || end <= start) {
      return null;
    }

    try {
      parsed = JSON.parse(stripped.slice(start, end + 1));
    } catch {
      return null;
    }

  }

  if (
    !parsed ||
    typeof parsed !== "object" ||
    typeof parsed.signal !== "string" ||
    !VALID_SIGNALS.includes(parsed.signal as TradingSignal) ||
    typeof parsed.confidence !== "number" ||
    Number.isNaN(parsed.confidence)
  ) {
    return null;
  }

  const confidence = Math.max(
    0,
    Math.min(100, parsed.confidence)
  );

  return {
    signal: parsed.signal as TradingSignal,
    confidence,
    summary:
      typeof parsed.summary === "string" ? parsed.summary : "",
    reasoning:
      Array.isArray(parsed.reasoning)
        ? parsed.reasoning.filter((r: unknown) => typeof r === "string")
        : [],
    risks:
      Array.isArray(parsed.risks)
        ? parsed.risks.filter((r: unknown) => typeof r === "string")
        : [],
    recommendation:
      typeof parsed.recommendation === "string"
        ? parsed.recommendation
        : "",
    timestamp: new Date().toISOString(),
  };

}
