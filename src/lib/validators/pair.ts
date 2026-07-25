/**
==========================================================
AURA Trade OS
Trading Pair Validator
Version : 0.0.5 Alpha
==========================================================
*/

import { AppError } from "@/lib/error/AppError";

const DEFAULT_PAIRS = [
  "btc_idr",
  "eth_idr",
  "sol_idr",
  "bnb_idr",
  "ada_idr",
  "xrp_idr",
  "doge_idr",
  "trx_idr",
  "link_idr",
  "avax_idr",
] as const;

export type SupportedPair = typeof DEFAULT_PAIRS[number];

export class PairValidator {

  /**
   * Daftar pair bawaan
   */
  static readonly supportedPairs = [...DEFAULT_PAIRS];

  /**
   * Normalisasi pair
   * Contoh:
   * BTC-IDR -> btc_idr
   * btcidr  -> btc_idr
   */
  static normalize(pair: string): string {

    if (!pair) {
      return "";
    }

    let normalized = pair
      .trim()
      .toLowerCase()
      .replace(/-/g, "_")
      .replace(/\s+/g, "");

    if (/^[a-z0-9]+idr$/i.test(normalized) && !normalized.includes("_")) {
      normalized = normalized.replace(/idr$/, "_idr");
    }

    return normalized;

  }

  /**
   * Validasi format pair
   */
  static validateFormat(pair: string): string {

    const normalized = this.normalize(pair);

    if (!normalized) {
      throw AppError.validation(
        "Trading pair is required."
      );
    }

    if (!/^[a-z0-9]+_[a-z0-9]+$/i.test(normalized)) {
      throw AppError.validation(
        `Invalid trading pair format: ${pair}`
      );
    }

    return normalized;

  }

  /**
   * Cek apakah pair didukung
   */
  static isSupported(pair: string): boolean {

    const normalized = this.normalize(pair);

    return this.supportedPairs.includes(
      normalized as SupportedPair
    );

  }

  /**
   * Validasi pair
   */
  static validate(pair: string): string {

    const normalized =
      this.validateFormat(pair);

    if (!this.isSupported(normalized)) {
      throw AppError.validation(
        `Unsupported trading pair: ${normalized}`
      );
    }

    return normalized;

  }

  /**
   * Tambahkan pair baru
   */
  static register(pair: string): void {

    const normalized =
      this.validateFormat(pair);

    if (!this.isSupported(normalized)) {
      this.supportedPairs.push(normalized);
    }

  }

  /**
   * Ambil seluruh pair
   */
  static getAll(): string[] {

    return [...this.supportedPairs];

  }

}

export default PairValidator;
