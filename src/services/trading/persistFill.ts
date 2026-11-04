/**
 * Menyimpan state posisi setelah BUY terisi di bursa.
 *
 * updateBotState() menelan error dan mengembalikan false. Kalau hasilnya
 * diabaikan, koin sudah dibeli tapi bot tidak tahu, dan siklus berikutnya
 * membeli lagi (FARTCOIN 3 Nov: lot 19.20 tidak tercatat, lot 19.30 menimpa).
 * Helper ini mencoba ulang beberapa kali dan melaporkan hasil akhir.
 */
export interface PersistResult {
  ok: boolean;
  attempts: number;
  error?: string;
}

export async function persistWithRetry(
  write: () => Promise<boolean>,
  options: { attempts?: number; delaysMs?: number[]; sleep?: (ms: number) => Promise<void> } = {}
): Promise<PersistResult> {
  const attempts = Math.max(1, options.attempts ?? 3);
  const delays = options.delaysMs ?? [300, 900];
  const sleep = options.sleep ?? ((ms: number) => new Promise<void>((r) => setTimeout(r, ms)));
  let lastError: string | undefined;

  for (let i = 1; i <= attempts; i++) {
    try {
      if (await write()) return { ok: true, attempts: i };
      lastError = "updateBotState mengembalikan false";
    } catch (error) {
      lastError = error instanceof Error ? error.message : String(error);
    }
    if (i < attempts) await sleep(delays[Math.min(i - 1, delays.length - 1)] ?? 500);
  }

  return { ok: false, attempts, error: lastError };
}
