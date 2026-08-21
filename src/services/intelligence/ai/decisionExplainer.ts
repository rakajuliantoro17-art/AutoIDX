/**
==========================================================
AURA Trade OS
AI Decision Explainer (Observability Only)
Version : 0.1.0 Alpha

Menggabungkan aiConfidence (breakdown skor: indikator/konteks/
AI/risiko) dan aiExplanation (ringkasan human-readable) menjadi
satu baris log siap pakai, dipanggil dari trading/engine.ts di
dalam logAIAdvisory().

PENTING -- batas tanggung jawab modul ini:
1. MURNI observability/logging. Tidak pernah dipanggil di jalur
   yang menentukan BUY/SELL/HOLD, tidak pernah dipakai sebagai
   gerbang (gate), dan tidak mengubah nilai apapun yang dipakai
   risk-gate atau eksekusi order.
2. Kalau file ini dihapus total dan seluruh pemanggilannya di
   engine.ts dibuang, TIDAK ADA perilaku trading yang berubah
   sedikit pun -- hanya log yang menghilang.
3. reasoning/risks di dalam adapter AIAnalysis sengaja dikosongkan
   karena aiConsensus.evaluate() / hasil parseAIResponse() per
   provider tidak memisahkan field itu. aiExplanation tetap
   menghasilkan strengths/weaknesses/warnings sendiri langsung
   dari features + context (indikator teknikal asli), bukan dari
   field yang dikosongkan ini.
4. Sengaja TIDAK memakai ai/analyzer.ts (AIAnalyzer) atau
   fusion/voting.ts sebagai sumber skor -- keduanya duplikat
   dari logika yang sudah aktif (Sanity Check di engine.ts dan
   aiConsensus.ts), menyambungkannya akan menciptakan sinyal
   ganda yang bisa saling kontradiksi. Lihat docs/claude.md,
   bagian "Known Duplication".
==========================================================
*/

import aiConfidence, { ConfidenceBreakdown } from "./confidence";
import aiExplanation from "./explanation";
import { AIAnalysis, FeatureVector, MarketContext } from "../types";

export interface ExplainAdapterInput {
  signal: AIAnalysis["signal"];
  confidence: number;
  summary: string;
}

/**
 * Adaptasi hasil aiConsensus.evaluate() (atau satu AIAnalysis dari
 * parseAIResponse per provider) ke bentuk AIAnalysis yang
 * dibutuhkan aiConfidence/aiExplanation.
 */
function toAIAnalysis(input: ExplainAdapterInput): AIAnalysis {
  return {
    signal: input.signal,
    confidence: input.confidence,
    summary: input.summary,
    reasoning: [],
    risks: [],
    recommendation: input.summary,
    timestamp: new Date().toISOString(),
  };
}

export interface DecisionExplainResult {
  logLine: string;
  confidenceBreakdown: ConfidenceBreakdown;
}

export function explainDecision(
  features: FeatureVector,
  context: MarketContext,
  input: ExplainAdapterInput
): DecisionExplainResult {

  const analysis = toAIAnalysis(input);

  const confidenceBreakdown = aiConfidence.calculate(
    features,
    context,
    analysis
  );

  const explanation = aiExplanation.build(features, context, analysis);

  const parts: string[] = [];

  parts.push(
    `Confidence breakdown -- indikator:${confidenceBreakdown.indicator}, ` +
    `konteks:${confidenceBreakdown.context}, AI:${confidenceBreakdown.ai}, ` +
    `risiko:${confidenceBreakdown.risk}, total:${confidenceBreakdown.total}.`
  );

  if (explanation.strengths.length > 0) {
    parts.push(`Kekuatan: ${explanation.strengths.join(" ")}`);
  }

  if (explanation.weaknesses.length > 0) {
    parts.push(`Kelemahan: ${explanation.weaknesses.join(" ")}`);
  }

  if (explanation.warnings.length > 0) {
    parts.push(`Peringatan: ${explanation.warnings.join(" ")}`);
  }

  return {
    logLine: parts.join(" "),
    confidenceBreakdown,
  };
}

export default { explainDecision };
