/**
==========================================================
AURA Trade OS
Ops Agent -- tipe
==========================================================
Agen operasional hanya MENGAMATI dan MENGUSULKAN. Tidak pernah
mengubah setting, mode, atau order sendiri; semua usulan berstatus
"pending" sampai pemilik (BOT_OWNER_UID) menyetujui.
==========================================================
*/

export type AgentRole = "HRD" | "MANAJER" | "TRADER" | "PAIR";

export type RecommendationKind = "setting" | "priority_pairs" | "note";

export type RecommendationStatus = "pending" | "approved" | "rejected";

/** Setting yang boleh diusulkan agen (whitelist). */
export const AGENT_SETTABLE_KEYS = [
  "maxOpenPositions",
  "stopLossPercent",
  "targetProfitPercent",
] as const;
export type AgentSettableKey = (typeof AGENT_SETTABLE_KEYS)[number];

export interface RecommendationDraft {
  role: AgentRole;
  /** Kunci unik per aturan (untuk id deterministik per hari). */
  key: string;
  kind: RecommendationKind;
  title: string;
  detail: string;
  patch?: Partial<Record<AgentSettableKey, number>> & { priorityPairs?: string[] };
}

export interface Recommendation extends RecommendationDraft {
  id: string;
  status: RecommendationStatus;
  createdAtMs: number;
  decidedBy?: string;
  decidedAtMs?: number;
}

export interface SectionReport {
  role: AgentRole;
  title: string;
  lines: string[];
}

export interface OpsInput {
  nowMs: number;
  logs: { type: string; message: string; ts: number }[];
  trades: { pair: string; type: string; mode: string; totalIdr: number; ts: number }[];
  positions: {
    pair: string;
    profitPercent: number;
    entryPrice: number;
    currentPrice: number;
    positionValue: number;
  }[];
  settings: {
    maxOpenPositions: number;
    stopLossPercent: number;
    targetProfitPercent: number;
  };
  scanner: {
    qualifiedPairs: string[];
    top: {
      pair: string;
      opportunityScore: number;
      rsi14: number;
      trend: string;
      volIdr: number;
      signalRecommendation: string;
    }[];
  };
  priorityPairs: string[];
  aiScores: Record<
    string,
    { scored: number; accuracy: number; majorityBaselineAccuracy: number; verdict: string }
  >;
}

export interface OpsAnalysis {
  sections: SectionReport[];
  recommendations: RecommendationDraft[];
  stats: {
    errors24h: number;
    warnings24h: number;
    trades24h: number;
    blockedByPositionLimit24h: number;
    lastLogAgeMinutes: number | null;
    openPositions: number;
  };
}
