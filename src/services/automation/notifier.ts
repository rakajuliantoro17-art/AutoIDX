/**
==========================================================
AURA Trade OS
Automation Notification Service
Version : 0.1.0 Alpha

Perubahan dari 0.0.8: method telegram() sebelumnya cuma
console.log placeholder ("Future: Telegram Bot API") -- sekarang
benar-benar mengirim pesan lewat Telegram Bot API kalau
TELEGRAM_BOT_TOKEN + TELEGRAM_CHAT_ID di-set di env var Vercel.
Kalau belum di-set, notify() diam-diam fallback ke CONSOLE saja
(tidak error, tidak memblokir trading -- notifikasi SIFATNYA
best-effort, kegagalan kirim tidak boleh pernah menggagalkan
eksekusi trade).

Cara setup Telegram:
1. Chat @BotFather di Telegram, /newbot, catat token yang
   diberikan -> jadi TELEGRAM_BOT_TOKEN.
2. Kirim pesan apa saja ke bot yang baru dibuat, lalu buka
   https://api.telegram.org/bot<TOKEN>/getUpdates di browser --
   cari "chat":{"id": ...} di hasilnya -> itu TELEGRAM_CHAT_ID.
3. Set kedua env var itu di Vercel, redeploy.
==========================================================
*/

import { recordLog } from "../firebase/logService";

export type NotificationChannel =
  | "CONSOLE"
  | "TELEGRAM"
  | "DISCORD"
  | "EMAIL"
  | "WEBHOOK";

export type NotificationLevel =
  | "INFO"
  | "SUCCESS"
  | "WARNING"
  | "ERROR";

export interface NotificationMessage {

  title: string;

  message: string;

  level?: NotificationLevel;

  channel?: NotificationChannel;

  metadata?: Record<string, unknown>;

}

export interface NotificationResult {

  success: boolean;

  channel: NotificationChannel;

  sentAt: string;

  error?: string;

}

const LEVEL_EMOJI: Record<NotificationLevel, string> = {
  INFO: "\u2139\ufe0f",
  SUCCESS: "\u2705",
  WARNING: "\u26a0\ufe0f",
  ERROR: "\ud83d\udd34",
};

export class AutomationNotifier {

  /**
   * Channel default: TELEGRAM kalau env var-nya sudah di-set,
   * kalau belum fallback ke CONSOLE -- supaya kode pemanggil
   * (mis. services/trading/engine.ts) tidak perlu tahu/pusing
   * soal channel mana yang aktif, cukup panggil .success()/
   * .warning() seperti biasa.
   */
  private defaultChannel(): NotificationChannel {

    const hasTelegramConfig =
      Boolean(process.env.TELEGRAM_BOT_TOKEN) &&
      Boolean(process.env.TELEGRAM_CHAT_ID);

    return hasTelegramConfig ? "TELEGRAM" : "CONSOLE";

  }

  /**
   * Mengirim notifikasi
   */
  async notify(
    payload: NotificationMessage
  ): Promise<NotificationResult> {

    const channel =
      payload.channel ?? this.defaultChannel();

    try {

      switch (channel) {

        case "CONSOLE":

          this.console(payload);
          break;

        case "TELEGRAM":

          await this.telegram(payload);
          break;

        case "DISCORD":

          await this.discord(payload);
          break;

        case "EMAIL":

          await this.email(payload);
          break;

        case "WEBHOOK":

          await this.webhook(payload);
          break;

      }

      await recordLog(
                "SYSTEM",
        "info",
        `[Notifier] ${channel} : ${payload.title}`
      );

      return {

        success: true,

        channel,

        sentAt:
          new Date().toISOString(),

      };

    } catch (error) {

      // PENTING: kegagalan notifikasi TIDAK PERNAH boleh
      // menggagalkan trading -- error di sini cuma di-log,
      // TIDAK di-throw ulang ke pemanggil (services/trading/
      // engine.ts memanggil ini tanpa await blocking di jalur
      // kritis, tapi tetap dijaga di sini sebagai lapis aman
      // kedua).
      console.error(
        "[Notifier]",
        error
      );

      await recordLog(
                "SYSTEM",
        "danger",
        `[Notifier] Failed (${channel})`
      );

      return {

        success: false,

        channel,

        sentAt:
          new Date().toISOString(),

        error:
          error instanceof Error
            ? error.message
            : "Unknown notification error",

      };

    }

  }

  /**
   * Console Notification
   */
  private console(
    payload: NotificationMessage
  ) {

    const prefix =
      `[${payload.level ?? "INFO"}]`;

    console.log(
      `${prefix} ${payload.title}\n${payload.message}`
    );

  }

  /**
   * Telegram Bot API -- implementasi ASLI (bukan placeholder
   * lagi). Diam-diam no-op kalau env var belum di-set, supaya
   * tidak error di lingkungan yang belum konfigurasi Telegram
   * (mis. saat development lokal).
   */
  private async telegram(
    payload: NotificationMessage
  ) {

    const token = process.env.TELEGRAM_BOT_TOKEN;
    const chatId = process.env.TELEGRAM_CHAT_ID;

    if (!token || !chatId) {

      console.log(
        "[Telegram] TELEGRAM_BOT_TOKEN/TELEGRAM_CHAT_ID belum di-set, notifikasi dilewati:",
        payload.title
      );

      return;

    }

    const emoji =
      LEVEL_EMOJI[payload.level ?? "INFO"];

    const text =
      `${emoji} <b>${escapeHtml(payload.title)}</b>\n${escapeHtml(payload.message)}`;

    const response = await fetch(
      `https://api.telegram.org/bot${token}/sendMessage`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          chat_id: chatId,
          text,
          parse_mode: "HTML",
        }),
      }
    );

    if (!response.ok) {

      const body = await response.text().catch(() => "");

      throw new Error(
        `Telegram API gagal (${response.status}): ${body}`
      );

    }

  }

  /**
   * Discord
   * Placeholder -- belum diimplementasikan (belum ada webhook
   * URL Discord yang dikonfirmasi dipakai). Struktur sudah siap,
   * tinggal isi fetch() ke DISCORD_WEBHOOK_URL kalau dibutuhkan.
   */
  private async discord(
    payload: NotificationMessage
  ) {

    console.log(
      "[Discord]",
      payload.title
    );

    /**
     * Future:
     * Discord Webhook
     */

  }

  /**
   * Email
   * Placeholder
   */
  private async email(
    payload: NotificationMessage
  ) {

    console.log(
      "[Email]",
      payload.title
    );

    /**
     * Future:
     * Nodemailer
     */

  }

  /**
   * Generic Webhook
   * Placeholder
   */
  private async webhook(
    payload: NotificationMessage
  ) {

    console.log(
      "[Webhook]",
      payload.title
    );

    /**
     * Future:
     * POST webhook endpoint
     */

  }

  /**
   * Shortcut INFO
   */
  async info(
    title: string,
    message: string
  ) {

    return this.notify({

      title,

      message,

      level: "INFO",

    });

  }

  /**
   * Shortcut SUCCESS
   */
  async success(
    title: string,
    message: string
  ) {

    return this.notify({

      title,

      message,

      level: "SUCCESS",

    });

  }

  /**
   * Shortcut WARNING
   */
  async warning(
    title: string,
    message: string
  ) {

    return this.notify({

      title,

      message,

      level: "WARNING",

    });

  }

  /**
   * Shortcut ERROR
   */
  async error(
    title: string,
    message: string
  ) {

    return this.notify({

      title,

      message,

      level: "ERROR",

    });

  }

}

function escapeHtml(value: string): string {

  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");

}

const automationNotifier =
  new AutomationNotifier();

export default automationNotifier;
