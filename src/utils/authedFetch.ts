/**
 * fetch dengan header Authorization: Bearer <Firebase ID token>.
 * Dipakai halaman yang memanggil endpoint terlindungi (settings, paper
 * trading, backtest). Token dipaksa segar oleh Firebase SDK bila perlu.
 */
import type { User } from "firebase/auth";

export async function authedFetch(
  user: User | null,
  input: RequestInfo | URL,
  init: RequestInit = {}
): Promise<Response> {
  if (!user) {
    throw new Error("Belum login.");
  }

  const token = await user.getIdToken();
  const headers = new Headers(init.headers);
  headers.set("Authorization", `Bearer ${token}`);

  return fetch(input, { ...init, headers });
}
