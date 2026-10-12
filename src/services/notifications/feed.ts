/**
==========================================================
AURA Trade OS
Notification feed (MURNI, tanpa I/O)
==========================================================
Menyusun notifikasi dalam portal (pengganti Telegram) dari data
yang sudah ada: transaksi, audit_logs, log darurat, usulan agen.
Laba SELL dihitung PERKIRAAN dari BUY sebelumnya untuk pair+mode
yang sama (tanpa fee), karena trade SELL tidak menyimpan laba.
==========================================================
*/

export type NotifLevel = "success" | "info" | "warning" | "danger";

export interface Notif {
  id: string;
  ts: number;
  level: NotifLevel;
  title: string;
  detail: string;
}

export interface FeedInput {
  trades: { id: string; pair: string; type: string; mode: string; price: number; totalIdr: number; ts: number }[];
  audits: {
    id: string;
    action: string;
    actor: string;
    at: number;
    changes: { field: string; before: unknown; after: unknown }[];
    meta?: Record<string, unknown>;
  }[];
  emergencyLogs: { id: string; message: string; ts: number }[];
  pendingRecs: { id: string; title: string; role: string; createdAtMs: number }[];
}

const upper = (p: string) => p.replace("_", "/").toUpperCase();
const idr = (n: number) => `Rp${Math.round(n).toLocaleString("id-ID")}`;
const val = (v: unknown) => (v === null || v === undefined ? "-" : typeof v === "object" ? JSON.stringify(v) : String(v));

/** Penyebab emergency stop otomatis (diagnosis/alasan dari audit meta), dipotong agar ringkas. */
function causeText(meta?: Record<string, unknown>): string {
  if (!meta) return "";
  const pick = (k: string) =>
    Array.isArray(meta[k]) ? (meta[k] as unknown[]).map(String).filter(Boolean) : [];
  const parts = [...pick("diagnosis"), ...pick("reasons")];
  if (parts.length === 0) return "";
  return ` Penyebab: ${parts.join(" ").slice(0, 400)}`;
}

export function buildNotifications(input: FeedInput, limit = 40): Notif[] {
  const out: Notif[] = [];

  // Trades: urut lama -> baru untuk mencari BUY pendamping
  const asc = [...input.trades].sort((a, b) => a.ts - b.ts);
  const lastBuy = new Map<string, number>();
  for (const t of asc) {
    const key = `${t.pair}|${t.mode}`;
    if (t.type === "BUY") {
      lastBuy.set(key, t.price);
      out.push({
        id: `t_${t.id}`,
        ts: t.ts,
        level: "info",
        title: `BUY ${upper(t.pair)} (${t.mode})`,
        detail: `Harga ${idr(t.price)}, nilai ${idr(t.totalIdr)}.`,
      });
    } else if (t.type === "SELL") {
      const buy = lastBuy.get(key);
      if (buy && buy > 0) {
        const pct = (t.price / buy - 1) * 100;
        out.push({
          id: `t_${t.id}`,
          ts: t.ts,
          level: pct >= 0 ? "success" : "warning",
          title: `${pct >= 0 ? "Profit" : "Rugi"} ${pct >= 0 ? "+" : ""}${pct.toFixed(2)}% ${upper(t.pair)} (${t.mode})`,
          detail: `SELL ${idr(t.price)} vs BUY ${idr(buy)} (perkiraan, belum termasuk fee).`,
        });
      } else {
        out.push({
          id: `t_${t.id}`,
          ts: t.ts,
          level: "info",
          title: `SELL ${upper(t.pair)} (${t.mode})`,
          detail: `Harga ${idr(t.price)}, nilai ${idr(t.totalIdr)}.`,
        });
      }
    }
  }

  for (const a of input.audits) {
    const isEmergency = a.changes.some((c) => c.field === "emergencyStop" && c.after === true);
    const isFlag = a.changes.some((c) => c.field.startsWith("flag:"));
    const body = a.changes.length
      ? a.changes.map((c) => `${c.field.replace("flag:", "")}: ${val(c.before)} -> ${val(c.after)}`).join("; ")
      : String(a.action);
    const via = a.meta && typeof a.meta.via === "string" ? ` via ${a.meta.via === "ops_agent" ? "agen" : a.meta.via}` : "";
    out.push({
      id: `a_${a.id}`,
      ts: a.at,
      level: isEmergency ? "danger" : "info",
      title: isEmergency
        ? "Emergency stop DIAKTIFKAN"
        : isFlag
          ? "Flag fitur diubah"
          : a.action === "settings.update"
            ? "Setting diubah"
            : a.action === "bot_control.update"
              ? "Kontrol bot diubah"
              : "Akun Indodax diubah",
      detail: `${body}. Oleh ${a.actor}${via}.${causeText(a.meta)}`,
    });
  }

  for (const l of input.emergencyLogs) {
    out.push({ id: `l_${l.id}`, ts: l.ts, level: "danger", title: "Peringatan darurat", detail: l.message.slice(0, 220) });
  }

  for (const r of input.pendingRecs) {
    out.push({
      id: `r_${r.id}`,
      ts: r.createdAtMs,
      level: "warning",
      title: "Usulan agen menunggu keputusan",
      detail: `${r.role}: ${r.title}`,
    });
  }

  return out.sort((a, b) => b.ts - a.ts).slice(0, limit);
}
