/**
 * AURA Trade OS -- Phase Timer
 *
 * Pengukur durasi per tahap untuk satu siklus (mis. scan market,
 * tulis Firestore, kalibrasi AI, trading). Dibangun di atas
 * Profiler (services/observability/profiler.ts).
 *
 * Sengaja sederhana: state hidup di dalam satu instance PhaseTimer
 * (dibuat per siklus), TIDAK ada singleton / state global, jadi aman
 * di serverless dan tidak menumpuk di memori antar request.
 *
 * Tujuan utama: melihat tahap mana yang paling lama/berat tiap
 * siklus scan, untuk mengukur dan menekan Fluid Active CPU Vercel.
 */

import { profiler } from "./profiler";

export type PhaseDurationsMs = Record<string, number>;

export class PhaseTimer {
  private readonly phases: PhaseDurationsMs = {};

  /**
   * Jalankan callback, catat durasinya (ms, dibulatkan) di bawah
   * nama fase. Hasil/exception callback diteruskan apa adanya;
   * durasi fase yang melempar error tetap dicatat.
   */
  async run<T>(phase: string, callback: () => Promise<T>): Promise<T> {
    const start = performance.now();
    try {
      const { result } = await profiler.profile(phase, callback);
      return result;
    } finally {
      this.phases[phase] = Math.round(performance.now() - start);
    }
  }

  /** Salinan durasi per fase (ms). */
  snapshot(): PhaseDurationsMs {
    return { ...this.phases };
  }
}
