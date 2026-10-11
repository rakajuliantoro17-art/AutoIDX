/**
==========================================================
AURA Trade OS
Ops Agent (server-only) -- pengumpul data, laporan, usulan
==========================================================
Dijalankan terjadwal (cron harian) di balik flag `opsAgent`.
Menulis HANYA ke koleksi:
- agent_reports/{YYYY-MM-DD} dan agent_reports/latest
- agent_recommendations/{id} (status awal "pending")
TIDAK mengubah setting, mode, order, atau kode. Narasi LLM bersifat
opsional (provider pertama yang punya API key); gagal -> ringkasan
deterministik tetap tersimpan.
==========================================================
*/

import { adminDb } from "@/services/firebase/admin";
import { getBotSettings } from "@/services/firebase/settingsService";
import { getBotControl } from "@/services/firebase/botControl";
import { getBotState, getOpenPositionPairs } from "@/services/firebase/botState";
import { getShadowSummaries } from "@/services/ml/shadow/shadowStore";
import openAIProvider from "@/services/intelligence/ai/providers/openai";
import geminiProvider from "@/services/intelligence/ai/providers/gemini";
import claudeProvider from "@/services/intelligence/ai/providers/claude";
import { analyzeOps } from "./analysis";
import type { OpsAnalysis, OpsInput, Recommendation } from "./types";

export const REPORTS = "agent_reports";
export const RECOMMENDATIONS = "agent_recommendations";
const NARRATIVE_TIMEOUT_MS = 12_000;

function toMs(v: unknown): number {
  if (v && typeof v === "object" && "toMillis" in v && typeof (v as { toMillis: unknown }).toMillis === "function") {
    return (v as { toMillis: () => number }).toMillis();
  }
  return typeof v === "number" ? v : 0;
}

function dateKey(ms: number): string {
  // Tanggal WIB (UTC+7)
  return new Date(ms + 7 * 3600_000).toISOString().slice(0, 10);
}

export async function collectOpsInput(nowMs = Date.now()): Promise<OpsInput> {
  const [logSnap, tradeSnap, settings, control, openPairs, shadow, scannerSnap] = await Promise.all([
    adminDb.collection("activity_logs").orderBy("timestamp", "desc").limit(500).get(),
    adminDb.collection("trades").orderBy("timestamp", "desc").limit(200).get(),
    getBotSettings(),
    getBotControl(),
    getOpenPositionPairs(),
    getShadowSummaries().catch(() => ({ ml: null, bySource: {}, updatedAtMs: null })),
    adminDb.collection("scannerResults").doc("latest").get(),
  ]);

  const positions = [];
  for (const pair of openPairs.slice(0, 20)) {
    const s = await getBotState(pair);
    positions.push({
      pair,
      profitPercent: Number(s.profitPercent) || 0,
      entryPrice: Number(s.entryPrice) || 0,
      currentPrice: Number(s.currentPrice) || 0,
      positionValue: Number(s.positionValue) || 0,
    });
  }

  const sc = scannerSnap.exists ? scannerSnap.data() ?? {} : {};
  const aiScores = { ...shadow.bySource };
  if (shadow.ml && !aiScores.ml) aiScores.ml = shadow.ml;

  return {
    nowMs,
    logs: logSnap.docs.map((d) => {
      const x = d.data();
      return { type: String(x.type ?? ""), message: String(x.message ?? ""), ts: toMs(x.timestamp) };
    }),
    trades: tradeSnap.docs.map((d) => {
      const x = d.data();
      return {
        pair: String(x.pair ?? ""),
        type: String(x.type ?? ""),
        mode: String(x.mode ?? ""),
        totalIdr: Number(x.totalIdr) || 0,
        ts: toMs(x.timestamp),
      };
    }),
    positions,
    settings: {
      maxOpenPositions: settings.maxOpenPositions,
      stopLossPercent: settings.stopLossPercent,
      targetProfitPercent: settings.targetProfitPercent,
    },
    scanner: {
      qualifiedPairs: Array.isArray(sc.qualifiedPairs) ? sc.qualifiedPairs : [],
      top: Array.isArray(sc.topOpportunities) ? sc.topOpportunities : [],
    },
    priorityPairs: control.priorityPairs ?? [],
    aiScores,
  };
}

function digest(a: OpsAnalysis): string {
  return a.sections.map((s) => `${s.title}\n${s.lines.map((l) => `- ${l}`).join("\n")}`).join("\n\n");
}

async function narrate(a: OpsAnalysis): Promise<{ text: string; provider: string } | null> {
  const candidates: { name: string; key: string | undefined; query: (p: string) => Promise<{ success: boolean; content: string | null }> }[] = [
    { name: "claude", key: process.env.CLAUDE_API_KEY ?? process.env.ANTHROPIC_API_KEY, query: (p) => claudeProvider.query(p) },
    { name: "gemini", key: process.env.GEMINI_API_KEY, query: (p) => geminiProvider.query(p) },
    { name: "openai", key: process.env.OPENAI_API_KEY, query: (p) => openAIProvider.query(p) },
  ];
  const c = candidates.find((x) => !!x.key);
  if (!c) return null;

  const prompt =
    "Anda manajer operasional bot trading kripto (paper/live) untuk pemiliknya. Berdasarkan data berikut, tulis ringkasan " +
    "eksekutif dalam bahasa Indonesia, maksimal 6 kalimat, tanpa markdown: kondisi umum, risiko utama, dan satu hal yang " +
    "perlu diperhatikan hari ini. Jangan memerintahkan membeli/menjual dan jangan menyarankan mengubah kode. Hanya gunakan data di bawah.\n\n" +
    digest(a);

  try {
    const res = await Promise.race([
      c.query(prompt),
      new Promise<null>((r) => setTimeout(() => r(null), NARRATIVE_TIMEOUT_MS)),
    ]);
    if (res && res.success && res.content) return { text: res.content.trim().slice(0, 1500), provider: c.name };
  } catch (error) {
    console.error("[OPS AGENT narrative]", error);
  }
  return null;
}

export interface OpsRunResult {
  dateKey: string;
  newRecommendations: number;
  narrativeProvider: string | null;
  stats: OpsAnalysis["stats"];
}

export async function runOpsAgent(nowMs = Date.now()): Promise<OpsRunResult> {
  const input = await collectOpsInput(nowMs);
  const analysis = analyzeOps(input);
  const narrative = await narrate(analysis);
  const key = dateKey(nowMs);

  const report = {
    dateKey: key,
    createdAtMs: nowMs,
    sections: analysis.sections,
    stats: analysis.stats,
    narrative: narrative?.text ?? null,
    narrativeProvider: narrative?.provider ?? null,
  };
  await adminDb.collection(REPORTS).doc(key).set(report);
  await adminDb.collection(REPORTS).doc("latest").set(report);

  let created = 0;
  for (const draft of analysis.recommendations) {
    const id = `${key}_${draft.role}_${draft.key}`.replace(/[^A-Za-z0-9_-]/g, "");
    const rec: Recommendation = { ...draft, id, status: "pending", createdAtMs: nowMs };
    // Buang field undefined (Firestore menolaknya).
    const clean = JSON.parse(JSON.stringify(rec));
    try {
      await adminDb.collection(RECOMMENDATIONS).doc(id).create(clean); // gagal bila sudah ada -> status lama tetap
      created++;
    } catch {
      /* sudah ada untuk hari ini */
    }
  }

  return { dateKey: key, newRecommendations: created, narrativeProvider: narrative?.provider ?? null, stats: analysis.stats };
}

export async function getLatestAgentView(): Promise<{
  report: unknown | null;
  recommendations: Recommendation[];
}> {
  const [rep, recs] = await Promise.all([
    adminDb.collection(REPORTS).doc("latest").get(),
    adminDb.collection(RECOMMENDATIONS).orderBy("createdAtMs", "desc").limit(30).get(),
  ]);
  return {
    report: rep.exists ? rep.data() : null,
    recommendations: recs.docs.map((d) => d.data() as Recommendation),
  };
}
