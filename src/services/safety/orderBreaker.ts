/**
 * Pemutus (circuit breaker) pengiriman order BUY -- keputusan murni, mudah diuji.
 *
 * Kegagalan beruntun saat mengirim order (error jaringan, API menolak, status
 * tidak pasti) berarti pertukaran/koneksi tidak sehat: BUY baru dihentikan
 * sementara. SELL TIDAK PERNAH diblokir di sini -- posisi harus selalu bisa
 * ditutup. Setelah cooldown, satu percobaan ("half-open") diizinkan; sukses
 * menutup pemutus, gagal membuka lagi.
 */
export interface OrderBreakerState {
  consecutiveFailures: number;
  lastFailureAtMs: number;
}

export interface OrderBreakerConfig {
  failureThreshold: number;
  cooldownMs: number;
}

export const DEFAULT_ORDER_BREAKER: OrderBreakerConfig = {
  failureThreshold: 3,
  cooldownMs: 10 * 60 * 1000,
};

export type OrderBreakerDecision =
  | { allow: true; mode: "CLOSED" | "HALF_OPEN" }
  | { allow: false; mode: "OPEN"; retryInMs: number };

export function evaluateOrderBreaker(
  state: OrderBreakerState,
  nowMs: number,
  cfg: OrderBreakerConfig = DEFAULT_ORDER_BREAKER
): OrderBreakerDecision {
  if (state.consecutiveFailures < cfg.failureThreshold) {
    return { allow: true, mode: "CLOSED" };
  }
  const elapsed = nowMs - state.lastFailureAtMs;
  if (elapsed >= cfg.cooldownMs) return { allow: true, mode: "HALF_OPEN" };
  return { allow: false, mode: "OPEN", retryInMs: cfg.cooldownMs - elapsed };
}

export function afterOrderFailure(state: OrderBreakerState, nowMs: number): OrderBreakerState {
  return { consecutiveFailures: state.consecutiveFailures + 1, lastFailureAtMs: nowMs };
}

export function afterOrderSuccess(): OrderBreakerState {
  return { consecutiveFailures: 0, lastFailureAtMs: 0 };
}
