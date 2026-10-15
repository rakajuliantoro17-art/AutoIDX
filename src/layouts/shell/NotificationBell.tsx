"use client";

/**
 * Lonceng notifikasi di header (pengganti Telegram): profit/rugi trade,
 * perubahan setting/flag, emergency stop, usulan agen. Penanda "sudah
 * dibaca" disimpan di browser (per perangkat) -- hanya kenyamanan.
 */
import { useCallback, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { IconBell } from "@/components/icons";
import { useAuth } from "@/services/auth/AuthContext";

interface Item {
  id: string;
  ts: number;
  level: "success" | "info" | "warning" | "danger";
  title: string;
  detail: string;
}

const SEEN_KEY = "aura_notif_last_seen";
const DOT: Record<Item["level"], string> = {
  success: "bg-emerald-400",
  info: "bg-sky-400",
  warning: "bg-amber-400",
  danger: "bg-rose-500",
};

function readSeen(): number {
  try {
    return Number(window.localStorage.getItem(SEEN_KEY)) || 0;
  } catch {
    return 0;
  }
}

function ago(ms: number): string {
  const m = Math.max(0, Math.round((Date.now() - ms) / 60000));
  if (m < 1) return "baru saja";
  if (m < 60) return `${m} mnt lalu`;
  const h = Math.round(m / 60);
  return h < 48 ? `${h} jam lalu` : `${Math.round(h / 24)} hari lalu`;
}

export default function NotificationBell({ onUnread }: { onUnread?: (n: number) => void } = {}) {
  const { user } = useAuth();
  const [items, setItems] = useState<Item[]>([]);
  const [open, setOpen] = useState(false);
  const [seen, setSeen] = useState(0);
  const [mounted, setMounted] = useState(false);
  const btnRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setMounted(true);
    setSeen(readSeen());
  }, []);

  const load = useCallback(async () => {
    if (!user) return;
    try {
      const token = await user.getIdToken();
      const r = await fetch("/api/notifications", { headers: { Authorization: `Bearer ${token}` } });
      if (!r.ok) return;
      const j = await r.json();
      setItems(Array.isArray(j.items) ? j.items : []);
    } catch {
      /* pelengkap; diam bila gagal */
    }
  }, [user]);

  useEffect(() => {
    if (!user) {
      setItems([]);
      return;
    }
    load();
    // Hemat kuota Firestore: sekali per 10 menit, hanya saat tab terlihat.
    const t = setInterval(() => {
      if (document.visibilityState === "visible") load();
    }, 600_000);
    return () => clearInterval(t);
  }, [user, load]);

  useEffect(() => {
    if (!open) return;
    function onDown(e: MouseEvent) {
      const t = e.target as Node;
      if (panelRef.current?.contains(t) || btnRef.current?.contains(t)) return;
      setOpen(false);
    }
    document.addEventListener("mousedown", onDown);
    return () => document.removeEventListener("mousedown", onDown);
  }, [open]);

  const unread = items.filter((i) => i.ts > seen).length;

  useEffect(() => {
    onUnread?.(user ? unread : 0);
  }, [unread, user, onUnread]);

  if (!user) return null;

  function toggle() {
    const next = !open;
    setOpen(next);
    if (next) {
      load();
      const newest = items.reduce((m, i) => Math.max(m, i.ts), 0);
      const mark = Math.max(newest, Date.now());
      try {
        window.localStorage.setItem(SEEN_KEY, String(mark));
      } catch {
        /* abaikan */
      }
      // Tetap tampilkan penanda "baru" selama panel terbuka.
    }
  }

  return (
    <>
      <button
        ref={btnRef}
        type="button"
        onClick={toggle}
        aria-label={`Notifikasi${unread ? `, ${unread} baru` : ""}`}
        aria-expanded={open}
        className="glass relative flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-[var(--text-secondary)] transition hover:text-[var(--text)]"
      >
        <IconBell className="h-5 w-5" />
        {unread > 0 && (
          <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-rose-500 px-1 text-[10px] font-bold text-white">
            {unread > 9 ? "9+" : unread}
          </span>
        )}
      </button>

      {mounted &&
        open &&
        createPortal(
          <div
            ref={panelRef}
            data-keep-open="true"
            className="glass-nav fixed right-2 top-[68px] z-[80] w-[min(94vw,24rem)] max-h-[70vh] overflow-y-auto rounded-2xl border p-3 shadow-xl"
          >
            <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-[var(--text-muted)]">Notifikasi</p>
            {items.length === 0 && <p className="text-sm text-[var(--text-muted)]">Belum ada notifikasi.</p>}
            <ul className="space-y-2">
              {items.map((i) => (
                <li key={i.id} className="flex gap-2 border-t border-white/10 pt-2 first:border-t-0 first:pt-0">
                  <span className={`mt-1.5 h-2 w-2 shrink-0 rounded-full ${DOT[i.level]}`} />
                  <div className="min-w-0">
                    <p className="text-sm font-semibold break-words">
                      {i.title}
                      {i.ts > seen && <span className="ml-1 text-[10px] text-rose-400">baru</span>}
                    </p>
                    <p className="text-xs text-[var(--text-secondary)] break-words">{i.detail}</p>
                    <p className="text-[10px] text-[var(--text-muted)]">{ago(i.ts)}</p>
                  </div>
                </li>
              ))}
            </ul>
          </div>,
          document.body
        )}
    </>
  );
}
