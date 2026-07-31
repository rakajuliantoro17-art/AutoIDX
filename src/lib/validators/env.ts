/**
==========================================================
AURA Trade OS
Environment Variables Validator
Version : 0.0.5 Alpha
==========================================================
*/

import { AppError } from "@/lib/error/AppError";

export interface EnvironmentConfig {
  NODE_ENV: string;

  BOT_MODE: string;
  BOT_INTERVAL: number;
  BOT_DEFAULT_TRADE_AMOUNT: number;
  BOT_MAX_TRADE_AMOUNT: number;
  BOT_TARGET_PROFIT: number;
  BOT_STOP_LOSS: number;

  NEXT_PUBLIC_FIREBASE_API_KEY: string;
  NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN: string;
  NEXT_PUBLIC_FIREBASE_PROJECT_ID: string;
  NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET: string;
  NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID: string;
  NEXT_PUBLIC_FIREBASE_APP_ID: string;

  OPENAI_API_KEY?: string;
  GEMINI_API_KEY?: string;

  INDODAX_API_KEY?: string;
  INDODAX_SECRET_KEY?: string;
}

export class EnvValidator {

  /**
   * Validasi seluruh Environment Variables
   */
  static validate(): EnvironmentConfig {

    const env: EnvironmentConfig = {

      NODE_ENV:
        process.env.NODE_ENV ?? "development",

      BOT_MODE:
        this.require("BOT_MODE"),

      BOT_INTERVAL:
        this.requireNumber("BOT_INTERVAL"),

      BOT_DEFAULT_TRADE_AMOUNT:
        this.requireNumber("BOT_DEFAULT_TRADE_AMOUNT"),

      BOT_MAX_TRADE_AMOUNT:
        this.requireNumber("BOT_MAX_TRADE_AMOUNT"),

      BOT_TARGET_PROFIT:
        this.requireNumber("BOT_TARGET_PROFIT"),

      BOT_STOP_LOSS:
        this.requireNumber("BOT_STOP_LOSS"),

      NEXT_PUBLIC_FIREBASE_API_KEY:
        this.require("NEXT_PUBLIC_FIREBASE_API_KEY"),

      NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN:
        this.require("NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN"),

      NEXT_PUBLIC_FIREBASE_PROJECT_ID:
        this.require("NEXT_PUBLIC_FIREBASE_PROJECT_ID"),

      NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET:
        this.require("NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET"),

      NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID:
        this.require("NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID"),

      NEXT_PUBLIC_FIREBASE_APP_ID:
        this.require("NEXT_PUBLIC_FIREBASE_APP_ID"),

      OPENAI_API_KEY:
        process.env.OPENAI_API_KEY,

      GEMINI_API_KEY:
        process.env.GEMINI_API_KEY,

      INDODAX_API_KEY:
        process.env.INDODAX_API_KEY,

      INDODAX_SECRET_KEY:
        process.env.INDODAX_SECRET_KEY,

    };

    this.validateBotMode(env.BOT_MODE);

    if (
      !env.OPENAI_API_KEY &&
      !env.GEMINI_API_KEY
    ) {
      console.warn(
        "[EnvValidator] AI Provider belum dikonfigurasi."
      );
    }

    if (
      !env.INDODAX_API_KEY ||
      !env.INDODAX_SECRET_KEY
    ) {
      console.warn(
        "[EnvValidator] Indodax Private API belum dikonfigurasi."
      );
    }

    return env;

  }

  /**
   * Wajib ada
   */
  private static require(name: string): string {

    const value = process.env[name];

    if (!value || value.trim() === "") {
      throw AppError.config(
        `Missing environment variable: ${name}`
      );
    }

    return value;

  }

  /**
   * Wajib berupa angka
   */
  private static requireNumber(name: string): number {

    const value = this.require(name);

    const parsed = Number(value);

    if (!Number.isFinite(parsed)) {
      throw AppError.config(
        `${name} must be numeric.`
      );
    }

    return parsed;

  }

  /**
   * Validasi BOT_MODE
   */
  private static validateBotMode(
    mode: string
  ): void {

    const allowed = [
      "paper",
      "live",
    ];

    if (
      !allowed.includes(
        mode.toLowerCase()
      )
    ) {
      throw AppError.config(
        `BOT_MODE must be one of: ${allowed.join(", ")}`
      );
    }

  }

}

export default EnvValidator;
