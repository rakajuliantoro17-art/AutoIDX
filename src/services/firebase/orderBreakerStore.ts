/**
 * Penyimpanan status pemutus order (Admin SDK, server-only), dokumen tunggal
 * `risk_state/order_breaker`. Hemat tulis: sukses hanya menulis bila hitungan
 * kegagalan sedang > 0. Gagal baca -> `readFailed` (pemanggil memblokir BUY).
 */
import { adminDb } from "@/services/firebase/admin";
import {
  afterOrderFailure,
  afterOrderSuccess,
  type OrderBreakerState,
} from "@/services/safety/orderBreaker";

const REF = () => adminDb.collection("risk_state").doc("order_breaker");

export async function readOrderBreaker(): Promise<{ state: OrderBreakerState; readFailed: boolean }> {
  try {
    const snap = await REF().get();
    const d = snap.exists ? snap.data() ?? {} : {};
    return {
      state: {
        consecutiveFailures: Number(d.consecutiveFailures ?? 0),
        lastFailureAtMs: Number(d.lastFailureAtMs ?? 0),
      },
      readFailed: false,
    };
  } catch (error) {
    console.error("[ORDER BREAKER READ ERROR]", error);
    return { state: { consecutiveFailures: 0, lastFailureAtMs: 0 }, readFailed: true };
  }
}

export async function recordOrderFailure(): Promise<void> {
  try {
    const { state, readFailed } = await readOrderBreaker();
    if (readFailed) return;
    await REF().set({ ...afterOrderFailure(state, Date.now()), updatedAt: Date.now() });
  } catch (error) {
    console.error("[ORDER BREAKER WRITE ERROR]", error);
  }
}

export async function recordOrderSuccess(): Promise<void> {
  try {
    const { state, readFailed } = await readOrderBreaker();
    if (readFailed || state.consecutiveFailures === 0) return;
    await REF().set({ ...afterOrderSuccess(), updatedAt: Date.now() });
  } catch (error) {
    console.error("[ORDER BREAKER WRITE ERROR]", error);
  }
}
