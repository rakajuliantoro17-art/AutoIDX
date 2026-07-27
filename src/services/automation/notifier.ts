/**
==========================================================
AURA Trade OS
Automation Notification Service
Version : 0.0.8 Alpha
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

export class AutomationNotifier {

  /**
   * Mengirim notifikasi
   */
  async notify(
    payload: NotificationMessage
  ): Promise<NotificationResult> {

    const channel =
      payload.channel ?? "CONSOLE";

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
   * Telegram
   * Placeholder
   */
  private async telegram(
    payload: NotificationMessage
  ) {

    console.log(
      "[Telegram]",
      payload.title
    );

    /**
     * Future:
     * Telegram Bot API
     */

  }

  /**
   * Discord
   * Placeholder
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

const automationNotifier =
  new AutomationNotifier();

export default automationNotifier;

